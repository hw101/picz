import {Base, model, endpoint, belongsTo} from '../base/model'
import config from '../base/config'
import {Auth} from './auth'

config.models.primaryKey = {
  name: '_id',
  type: String
}

@model('User')
@endpoint('users')
export class User extends Base {

  get isGuest() {
    return this.role === 'guest'
  }

  static authorized() {
    return new Promise((resolve, reject) => {
      let token = localStorage.getItem('picz-token');
      if(!token) return reject({noToken: true});
      config.headers['Authorization'] = `JWT ${token}`;
      this.load('me').then(({user}) => {
        return resolve(Auth.setUser({user: Object.assign(user, {token})}))
      }).catch(e => {
        return reject({serverError: true});
      })
    })
  }

}
