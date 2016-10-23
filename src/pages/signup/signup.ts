import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { Auth } from '../../lib/models'
import { HomePage } from '../home/home';

@Component({
  selector: 'page-signup',
  templateUrl: 'signup.html'
})
export class SignupPage {

  user:any = {};

  constructor(public nav: NavController) {

  }

  signup() {
    Auth.register(this.user).then((user:any) => {
      console.log(user)
      if(user) {
        this.nav.push(HomePage)
      }
    })
  }
}
