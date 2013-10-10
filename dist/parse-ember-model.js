/**
 * Ember Model ParseAdapter
 *
 * To use, create an adapter setting your app's values for applicationId and restAPIKey and set
 * as the `adapter` for all models in your application. All models must also have the `className`
 * class variable set that provides the Parse className
 *
 */
;(function(ns){

  var get = Ember.get;

  ns.ParseAdapter = Ember.RESTAdapter.extend({

    // Your app's applicaiton ID
    applicationId: null,
    
    // Your app's REST API Key
    restAPIKey: null,

    // Current user's session token, if applicable. Only used if set
    sessionToken: null,

    // Parse master key. Only used if set
    masterKey: null,

    // API root, no version
    apiRoot: 'https://api.parse.com',

    // API version
    version: 1,

    // API endpoint url
    apiUrl: function() {
      return get(this,'apiRoot') + '/' + get(this, 'version');
    }.property('apiRoot', 'version'),

    // Overrides RESTAdapters's buildURL to form the url from the className
    // Returns a path that will be joined to the API root later
    buildURL: function(klass, id) {
      var url = get(klass, 'url');
      if (!url) {
        var className = get(klass, 'className');
        if (!className) { throw new Error('Ember.ParseAdapter requires either a `url` or a `className` property to be specified'); }
        url = '/classes/' + get(klass, 'className');
      }

      if (id) {
        return url + "/" + id;
      } else {
        return url;
      }
    },
    
    ajaxSettings: function(url, method) {
      var settings = {
        url: get(this,'apiUrl') + url,
        type: method,
        dataType: "json",
        headers: {
          'X-Parse-Application-Id': get(this, 'applicationId'),
          'X-Parse-REST-API-Key': get(this, 'restAPIKey')
        }
      };
      if (get(this, 'sessionToken')) {
        settings.headers['X-Parse-Session-Token'] = get(this, 'sessionToken');
      }
      if (get(this, 'masterKey')) {
        settings.headers['X-Parse-Master-Key'] = get(this, 'masterKey');
      }
      return settings;
    },

    didCreateRecord: function(record, data) {
      // Parse returns only objectId and createdAt, merge this over existing data since `load`
      // replaces all object contents with the data provided
      var primaryKey = get(record.constructor, 'primaryKey');
      var dataToLoad = Ember.merge(record.toJSON(), data);
      record.load(dataToLoad[primaryKey], dataToLoad);
      record.didCreateRecord();
    }
  });


}(Ember.Parse = Ember.Parse || {}));
;(function(ns){

  var Model = Ember.Model.extend({
    objectId: Ember.attr(),
    createdAt: Ember.attr(Date),
    updatedAt: Ember.attr(Date)
  });

  Model.reopenClass({
    primaryKey: 'objectId'
  });

  ns.Model = Model;

}(Ember.Parse = Ember.Parse || {}));

;(function(ns){

  var get = Ember.get;
  var set = Ember.set;


  var User = Ember.Parse.Model.extend({
    objectId: Ember.attr(),
    username: Ember.attr(),
    password: Ember.attr(),
    sessionToken: Ember.attr(),

    logout: function() {
      this.didLogout();
    },

    didLogin: function() {
      set(User, 'currentUser', this);
    },

    didLogout: function() {
      set(User, 'currentUser', null);
    },

    didCreateRecord: function() {
      this.didLogin();
      this._super();
    }
  });


  User.reopenClass({
    className: '_User',

    currentUser: null,

    // Returns a promise to a user object
    login: function(username, password) {
      var self = this;
      return this.adapter.ajax('/login', {'username': username, 'password': password}).then( function(data) {
        var record = self.create();
        var primaryKey = get(self, 'primaryKey');
        record.load(data[primaryKey], data);
        record.didLogin();
        return record;
      });
    }
  });

  ns.User = User;


  // Bind Parse adapter's session token to the current user's token
  ns.ParseAdapter.reopen({
    sessionToken: function() {
      return get(User, 'currentUser.sessionToken');
    }.property().volatile()
  });

}(Ember.Parse = Ember.Parse || {}));
/**
 * Ember.attrPointer creates a standard attribute capable of storing
 * Parse object pointers. The result is very similar to Ember.belongsTo
 * with two small differences:
 *
 *  1. The data is stored as an attribute, not as a relations
 *  2. When the attribute is accessed the object at the other end of
 *     the pointer is returned however it is not loaded by default.
 *     If you need to load the data, call `reload()`
 *
 * Notes: this alternatve to the parse-ember-model belongs-to patch
 * doesn't require monkey-patching of ember-model. Ideally this could be
 * done simply using `attr` types but at the moment Ember Model doesn't support
 * object attributes properly.
 */
;(function(ns){

  var get = Ember.get;

  function getType() {
    if (typeof this.objectType === "string") {
      this.objectType =  Ember.get(Ember.lookup, this.objectType);
    }
    return this.objectType;
  };


  ns.attrPointer = function(type, options) {
    options = options || {};

    var typeTranslation = {
      serialize: function(obj) {
        // Object --> pointer
        return {
          '__type': 'Pointer',
          'className': get(type, 'className'),
          'objectId': obj.get('objectId')
        };
      },

      deserialize: function(hash) {
        // Pointer --> object
        Ember.assert('Object type returned by Parse does not match that defined in the relation', 
          hash.className === get(type, 'className'));
        return type.cachedRecordForId( hash.objectId );
      }
    };

    var meta = { isAttribute: true, type: typeTranslation, objectType: type, getType: getType };

    return Ember.computed(function(key, value) {
      type = meta.getType();

      if (arguments.length === 2) {
        if (value) {
          Ember.assert(Ember.String.fmt('Attempted to set property of type: %@ with a value of type: %@',
                       [value.constructor, type]),
                       value instanceof type);
        }
        return value === undefined ? null : value;  
      } else {
        var ptr = get(this, '_data.' + key)
        return typeTranslation.deserialize(ptr);
      }
    }).property('_data').meta(meta);
  };

}(Ember.Parse = Ember.Parse || {}));