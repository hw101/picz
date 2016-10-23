import { NgModule } from '@angular/core';
import { IonicApp, IonicModule } from 'ionic-angular';
import { HttpModule } from '@angular/http'
import { PiczApp } from './app.component';
import { HomePage } from '../pages/home/home';
import { LoginPage } from '../pages/login/login';
import { SignupPage } from '../pages/signup/signup';

@NgModule({
  declarations: [
    PiczApp,
    HomePage,
    LoginPage,
    SignupPage
  ],
  imports: [
    IonicModule.forRoot(PiczApp),
    HttpModule
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    PiczApp,
    HomePage,
    LoginPage,
    SignupPage
  ],
  providers: []
})
export class AppModule {}
