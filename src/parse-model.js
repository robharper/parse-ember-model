;(function(ns){

  var Model = Ember.Model.extend({
    objectId: Ember.attr(),
    createdAt: Ember.attr(Date),
    updatedAt: Ember.attr(Date)
  });

  Model.reopenClass({
    primaryKey: 'objectId',
    collectionKey: 'results'
  });

  ns.Model = Model;

}(Ember.Parse = Ember.Parse || {}));
