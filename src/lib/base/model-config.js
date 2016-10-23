export default {
  lang:  'en',
  models: {
    primaryKey: {
      name: 'id',
      type: Number
    }
  },
  getId(obj) {
    var key = this.models.primaryKey;
    var value = obj[key.name];
    return value == null ? null : key.type(value)
  },
  setId(obj, value) {
    var key = this.models.primaryKey;
    return obj[key.name] = key.type(value)
  },
  headers: {}
}
