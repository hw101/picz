import pluralize from "pluralize"
import flatten from 'lodash.flatten'
import memoize from './memoize'
import config from './model-config'

function defaultHeaders() {
  return Object.assign({
    Accept: 'application/json',
    Authorization: `Bearer ${config.whiteLabel} ${config.token}`,
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest'
  }, config.headers)
}

var cache = Object.create(null)
var models = Object.create(null)
var instances = Object.create(null)

export function capitalize(name) {
  return name[0].toUpperCase() + name.slice(1)
}
export function decapitalize(name) {
  return name[0].toLowerCase() + name.slice(1)
}
export function toTableName(name) {
  return pluralize(decapitalize(name))
}
export function toClassName(name) {
  return capitalize(pluralize(name, 1))
}
export function foreignKey(className) {
  return decapitalize(className) + 'Id'
}

export function endpoint(path, opts={}) {
  function queryArg(key, value) {
    if (Array.isArray(value)) {
      return value
        .map(val => queryArg(key + '[]', val))
        .join('&')
    } else {
      return `${key}=${value}`
    }
  }
  function makeUrl(obj, action){
    var id = config.getId(obj)
    if(id < 0) id = null
    return [opts.root || config.root, path, id, action]
      .filter(p=>p).join('/')
  }
  function queryString(params={}) {
    var ret = Object.keys(params)
      .sort()
      .filter(key => key[0] != '$')
      .map(key => queryArg(key, params[key]))
      .join('&')
    return ret ? '?' + ret : ''
  }
  function ok(response) {
    return Math.floor(response.status / 100) === 2
  }
  function handleResponse(response) {
    if(ok(response)) {
      return response.json()
    } else {
      return response.json()
        .catch(err => {
          throw new Error(`${response.status} (${response.statusText})`)
        })
        .then(data=> {
          throw new Error(data.message)
        })
    }
  }
  function maybeRearg(obj, funcName, action, params) {
    if(action && typeof action === 'object'){
      return obj[funcName]('', action)
    }
  }

  return function define(Class) {
    var rearged
    Class.post = function(action, params) {
      if(typeof action === 'object') {
        params = action
        action = ''
      }
      var headers = {
        method: 'POST',
        headers: defaultHeaders(),
        body: JSON.stringify(params)
      }
      return fetch(makeUrl(this, action), headers)
        .then(handleResponse)
        .then(Class.resolve)
    }
    Class.prototype.post = Class.post
    Class.load = function load(action, params) {
      if(rearged = maybeRearg(this, 'load', action, params)) return rearged
      var headers = {headers: defaultHeaders()}
      var query = `${makeUrl(this, action)}${queryString(params)}`
      if(params && params.$reload) delete load[query]
      var promise = load[query] ||
        (load[query] = fetch(query, headers).then(handleResponse))
      return promise
        .then(Class.resolve)
        .catch(err => {
          setTimeout(()=> { delete load[query] }, 1000)
          throw err
        })
    }
    Class.prototype.load = Class.load
    Class.save = function save(action, params) {
      if(rearged = maybeRearg(this, 'save', action, params)) return rearged
      var id = config.getId(this)
      var isIdNumber = config.models.primaryKey.type === Number
      var headers = {
        headers: defaultHeaders(),
        method: 'POST',
        body: params
      }
      if(isIdNumber && id > 0 || !isIdNumber) {
        headers.method = 'PATCH'
      }
      if(params instanceof FormData) {
        delete headers.headers['Content-Type']
      } else {
        headers.body = JSON.stringify(params)
      }
      return fetch(makeUrl(this, action), headers)
        .then(handleResponse)
        .then(Class.resolve)
        .then(data => {
          var modelNames = Object.keys(data)
          for(var name of modelNames) {
            name = toClassName(name)
            var model = models[name]
            if(!model) continue
            var cache = Object.keys(model.load || {})
            for(var url of cache) {
              delete model.load[url]
            }
          }
          return data
        })
    }
    Class.prototype.save = function save(action, params) {
      if(this.$isSubmitting) return Promise.reject({message: 'Please wait.'})
      if(rearged = maybeRearg(this, 'save', action, params)) return rearged
      this.$isSubmitting = true
      // Finally doesn't exist in promise specs :[
      if(!(params instanceof FormData)) {
        params = Object.assign({[Class.className]: this}, params)
      }
      return Class.save
        .call(this, action, params)
        .then(data => {
          this.$isSubmitting = false
          return data
        })
        .catch(err => {
          this.$isSubmitting = false
          throw err
        })
    }
    Class.prototype.destroy = function destroy(action) {
      var headers = {
        headers: defaultHeaders(),
        method: 'DELETE'
      }
      return fetch(makeUrl(this, action), headers)
        .then((response)=> {
          if(ok(response)) return response.statusText
          throw new Error(response.statusText)
        })
        .then(status => {
          this.remove()
          return status
        })
    }
    Class.prototype.urlFor = function urlFor(action) {
      return makeUrl(this, action)
    }
  }
}

export function model(className, tableName) {
  return function define(Class) {
    if(!className) className = Class.className || Class.name
    if(!tableName) tableName = Class.tableName || toTableName(className)
    cache[className] = []
    instances[className] = {}
    models[className] = Object.assign(Class, {
      tableName: tableName,
      version: 0,
      resolve(data) {
        Object.keys(data).forEach(key => {
          var className = toClassName(key)
          if(models[className]) {
            data[key] = models[className].create(data[key]) }
        })
        return data
      },
      instance(id, data) {
        id || (id = -1)
        var collection = cache[className]
        var model = instances[className][id]
        if(!model) {
          collection.push(model = Object.assign(new this(), data))
          config.setId(model, id)
          instances[className][id] = model
          if(model.created) model.created()
        } else if(data) {
          Object.assign(model, data)
        }
        return model
      },
      create(data) {
        if(Array.isArray(data)) {
          return data.map(this.create, this)
        }
        if('object' !== typeof data) {
          var id = data
          data = {}
          config.setId(data, id)
        }
        if (config.getId(data) == null) config.setId(data, -(this.version + 1))
        return this.instance(config.getId(data), data)
      }
    })
  }
}

export function belongsTo(property, className) {
  if(!className) className = toClassName(property)
  return function define(Class) {
    Object.defineProperty(Class.prototype, property, {
      get() {
        return instances[className][this[foreignKey(property)]]
      },
      set(model) {
        var value = models[className].create(model)
        this[foreignKey(property)] = config.getId(value)
      }
    })
  }
}

export function hasOne(property, className) {
  if(!className) className = toClassName(property)
  return function define(Class) {
    Object.defineProperty(Class.prototype, property, {
      get() {
        return memoize(property, this, models[className].version, ()=>
          cache[className].find(model =>
            model[foreignKey(Class.className)] === config.getId(this)
          )
        )
      },
      set(model) {
        model[foreignKey(Class.className)] = config.getId(this)
      }
    })
  }
}

export function hasMany(property, className) {
  if(!className) className = toClassName(property)
  return function define(Class) {
    Object.defineProperty(Class.prototype, property, {
      get() {
        return memoize(property, this, models[className].version, ()=>
          cache[className].filter(model =>
          model[foreignKey(Class.className)] === config.getId(this))
        )
      },
      set(data) {
        data
          .map(model => models[className].create(model))
          .forEach(model => model[foreignKey(Class.className)] = config.getId(this))
      }
    })
  }
}

export function through(relation, property, className) {
  var many = Array.isArray(property) && (property = property[0])
  if(!className) className = toClassName(property)
  var related = pluralize(property, 1 + many)
  return function define(Class) {
    Object.defineProperty(Class.prototype, property, {
      get() {
        return memoize(property, this, models[className].version, ()=>
          flatten((this[relation] || []).map(obj => obj[related]))
        )
      }
    })
  }
}

export function getFrom(relation, attributes) {
  return function define(Class){
    attributes.forEach(attribute => {
      Object.defineProperty(Class.prototype, attribute, {
        get(){
          return this[relation] && this[relation][attribute]
        }
      })
    })
  }
}

export function resolve(property, className) {
  if(!className) className = toClassName(property)
  return function define(Class) {
    Object.defineProperty(Class.prototype, property, {
      get() {
        return this['$'+property]
      },
      set(collection) {
        Object.defineProperty(this, '$'+property, {
          configurable: true,
          enumerable: false,
          writable: true,
          value: models[className].create(collection)
        })
      }
    })
  }
}

export class Base {
  constructor(data) {
    this.constructor.version || (this.constructor.version = 0)
    this.constructor.version++
  }
  remove() {
    this.constructor.version++
    this.constructor.all.splice(this.constructor.all.indexOf(this), 1)
  }
  toString() {
    if(config.getId(this)) return config.getId(this).toString()
  }
  static get all() {
    return cache[this.className]
  }
}
