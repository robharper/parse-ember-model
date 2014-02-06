# Parse Ember Model Adapter

A simple extension to the [Ember Model](https://github.com/ebryn/ember-model) [`RESTAdapter`](https://github.com/ebryn/ember-model/blob/master/packages/ember-model/lib/rest_adapter.js) to support the [Parse REST API](https://www.parse.com/docs/rest).

Supports:

 * Simple CRUD operations
 * DIY queries using the Parse REST query syntax via `Model.find(query)`
 * `belongsTo` relationships via Parse object pointers (with included patch)
 * Other relationships via stored string ids

To Do:

 * Support for non-embedded `hasMany`
 * `findMany` support
 * Sideloading and embedding

### Usage

```javascript
// Setup
var parseAdapter = Ember.ParseAdapter.create({
  applicationId: 'yourAppId',
  restAPIKey: 'yourAppRestAPIKey'
});

Ember.Model.reopenClass({
  // Sets the primary key to equal parse's primary key field name
  primaryKey: 'objectId',
  // Use the adapter for all model classes
  adapter: parseAdapter
});

// Define classes
App.Post = Ember.Model.extend({
  objectId: Ember.attr(),
  title: Ember.attr(),
  text: Ember.attr(),
});
App.Post.className = 'post';

App.Comment = Ember.Model.extend({
  objectId: Ember.attr(),
  text: Ember.attr(),
  post: post: Ember.belongsTo('App.Post', {key: 'post_id'})
});
App.Comment.className = 'comment';

// Use
var post = App.Post.create({title: 'Post 1', text: 'Hello world'});
post.save().then(function() {
  var comment = App.Comment.create({text: 'This is a comment for post 1', post: post})
  comment.save();        
});

```

#### Belongs To Relationships

Also include `belongs-to.js` to monkeypatch Ember.Model to support Parse Pointer hash representations of **belongs to** relationships. This will cause belongs to references to be stored as object pointers in Parse's data store. While this is not necessary and relationships can be used without this patch, it does allow Parse to understand the relationship resulting in consistency when accessing the data through other language APIs and through "cloud code".
