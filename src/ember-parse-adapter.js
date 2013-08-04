(function(){

  var get = Ember.get;

  // Use objectId for primary key in all Parse models:
  // Ember.Model.reopenClass({
  //   primaryKey: 'objectId'
  // });

  /**
   * Ember Model ParseAdapter
   *
   * To use, create an adapter setting your app's values for applicationId and restAPIKey and set
   * as the `adapter` for all models in your application. All models must also have the `className`
   * class variable set that provides the Parse className
   *
   */
  Ember.ParseAdapter = Ember.RESTAdapter.extend({

    // Your app's applicaiton ID
    applicationId: null,
    
    // Your app's REST API Key
    restAPIKey: null,

    // API endpoint
    apiUrl: 'https://api.parse.com/',

    // API version
    version: 1,

    buildURL: function(klass, id) {
      var urlRoot = get(this,'apiUrl') + get(this, 'version') + '/classes/';
      var className = get(klass, 'className');
      if (!className) { throw new Error('Ember.ParseAdapter requires a `className` property to be specified'); }
      urlRoot += className;

      if (id) {
        return urlRoot + "/" + id;
      } else {
        return urlRoot;
      }
    },
    
    ajaxSettings: function(url, method) {
      return {
        url: url,
        type: method,
        dataType: "json",
        headers: {
          'X-Parse-Application-Id': get(this, 'applicationId'),
          'X-Parse-REST-API-Key': get(this, 'restAPIKey')
        }
      };
    }
  });


}());