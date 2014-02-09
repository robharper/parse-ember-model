# Parse Ember Model Adapter

An example implementation of a simple extension to the [Ember Model](https://github.com/ebryn/ember-model) [`RESTAdapter`](https://github.com/ebryn/ember-model/blob/master/packages/ember-model/lib/rest_adapter.js) to support the [Parse REST API](https://www.parse.com/docs/rest).

Supports:

 * Simple CRUD operations
 * DIY queries using the Parse REST query syntax via `Model.find(query)`
 * `belongsTo` relationships via Parse object pointers (with included patch)
 * Other relationships via stored string ids

Not yet supported:

 * Support for non-embedded `hasMany`
 * `findMany` support
 * Sideloading and embedding

Caveats:

 * The purpose of this repo is to show that integrating Ember Model and Parse is fairly easy for basic usage. **I don't maintain this project** since I've found that integration of Parse with Ember Data is doable and probably a better option.
 * Last tested and working with an *old* verison of Ember Model, things may have changed. The `belongsTo` patch monkeypatches the Ember Model source so is very fragile.

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
