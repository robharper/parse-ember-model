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