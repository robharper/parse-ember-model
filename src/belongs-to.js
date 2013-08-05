/**
 * Parse Belongs to relationship handling
 *
 * Including this file will monkeypatch ember-model to support Parse-style Pointer 
 * references in belongsto relationships.  It modifies `serializeBelongsTo` to convert
 * simple id refs into Pointer hashs, and adds a deserialization step to incoming data
 * to convert Pointer hashes back to simple string ids.
 *
 */
;(function(){ 

  var get = Ember.get;
  
  Ember.Model.reopen({
    serializeBelongsTo: function(key, meta) {
      if (meta.options.embedded) {
        return this._super(key, meta);
      } else {
        // Convert to Parse Pointer hash
        var primaryKey = get(meta.getType(), 'primaryKey');
        var result = {
          '__type': 'Pointer',
          'className': get(meta.getType(), 'className')
        };
        result[primaryKey] = this.get(key + '.' + primaryKey);
        return result;
      }
    },

    deserialize: function(data) {
      var key, value, meta;
      // Convert pointer __type hashes into simple id values
      for(key in data) {
        value = data[key];
        if (value && value['__type'] === 'Pointer') {
          data[key] = value.objectId;
        }
      }
      return data;
    },

    load: function(id, hash) {
      hash = this.deserialize(hash);
      return this._super(id, hash);
    }
  });

}());