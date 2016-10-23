import {Base, model, endpoint} from '../base/model'
import config from '../base/config'

@model('Auth')
@endpoint('auth')
export class Auth extends Base {
  static setUser({user}) {
    config.headers['Authorization'] = `JWT ${user.token}`;
    localStorage.setItem(config.tokenName, user.token);
    return Auth.current = user;
  }

  static login(user) {
    return this.post('login', user).then(res => {
      if(res.error) throw res.error
      return this.setUser(res)
    })
  }

  static register(user) {
    return this.post('register', user).then(this.setUser)
  }

  static logout() {
    localStorage.removeItem(config.tokenName);
    Auth.current = null;
  }
}
