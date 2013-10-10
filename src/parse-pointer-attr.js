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