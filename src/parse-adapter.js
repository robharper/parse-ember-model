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