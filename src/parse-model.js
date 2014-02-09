;(function(ns){

  var Model = Ember.Model.extend({
    objectId: Ember.attr(),
    createdAt: Ember.attr(Date),
    updatedAt: Ember.attr(Date)
  });

  Model.reopenClass({
    // Parse uses objectId for all key refs
    primaryKey: 'objectId',
    // Collections returned as a hash with results array under key "results"
    collectionKey: 'results'
  });

  ns.Model = Model;

}(Ember.Parse = Ember.Parse || {}));
