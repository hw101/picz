import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { Auth, User } from '../../lib/models';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

  constructor(public navCtrl: NavController) {
    User.authorized().then((res:any) => {
      console.log(res)
    })
  }
}
