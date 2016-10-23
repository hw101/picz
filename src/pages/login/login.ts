import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { Auth } from '../../lib/models'
import { SignupPage } from '../signup/signup';
import { HomePage } from '../home/home';

@Component({
  selector: 'page-login',
  templateUrl: 'login.html'
})
export class LoginPage {
  user:any = {};

  constructor(public nav: NavController) {

  }

  login() {

    Auth.login(this.user).then((user:any) => {
      if(user) {
        this.nav.push(HomePage)
      }
    })
  }

  goSignup() {
    this.nav.push(SignupPage)
  }
}
