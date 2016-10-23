import { NgModule } from '@angular/core';
import { IonicApp, IonicModule } from 'ionic-angular';
import { HttpModule } from '@angular/http'
import { PiczApp } from './app.component';
import { HomePage } from '../pages/home';
import { LoginPage } from '../pages/login';
import { SignupPage } from '../pages/signup';

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
