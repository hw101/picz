export default function memoize(property, instance, version, callback) {
  instance._version || Object.defineProperty(instance, '_version', {
    value: {},
    enumerable: false
  })
  property = '_' + property
  if (instance._version[property] != version){
    instance._version[property] = version
    Object.defineProperty(instance, property, {
      value: callback.call(instance),
      enumerable: false,
      configurable: true
    })
  }
  return instance[property]
}
