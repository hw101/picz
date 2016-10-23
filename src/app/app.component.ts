import { Component, ViewChild } from '@angular/core';
import { Platform, Nav } from 'ionic-angular';
import { StatusBar, Splashscreen } from 'ionic-native';
import { User } from '../lib/models'
import { LoginPage } from '../pages/login';
import { HomePage } from '../pages/home';

@Component({
  template: `<ion-nav [root]="rootPage"></ion-nav>`
})
export class PiczApp {
  @ViewChild(Nav) nav: Nav;
  rootPage = LoginPage;

  constructor(platform: Platform) {
    platform.ready().then(() => {
      StatusBar.styleDefault();
      Splashscreen.hide();

      User.authorized().then((user:any) => {
        if(user) this.nav.push(HomePage);
      }).catch(e => {
        console.log(e)
      })
    });
  }
}
