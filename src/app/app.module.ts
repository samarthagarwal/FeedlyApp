import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';

import { MyApp } from './app.component';
import { LoginPage } from '../pages/login/login';
import { SignupPage } from '../pages/signup/signup';
import { FeedPage } from '../pages/feed/feed';

import firebase from 'firebase';

var config = {
  apiKey: "AIzaSyDhZKCDPs1ZDLevzdbPTPxVDHAa9vqreBs",
  authDomain: "feedlyapp-9df9a.firebaseapp.com",
  databaseURL: "https://feedlyapp-9df9a.firebaseio.com",
  projectId: "feedlyapp-9df9a",
  storageBucket: "feedlyapp-9df9a.appspot.com",
  messagingSenderId: "197049247480"
};
firebase.initializeApp(config);

@NgModule({
  declarations: [
    MyApp,
    LoginPage,
    SignupPage,
    FeedPage
  ],
  imports: [
    BrowserModule,
    IonicModule.forRoot(MyApp)
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    LoginPage,
    SignupPage,
    FeedPage
  ],
  providers: [
    StatusBar,
    SplashScreen,
    {provide: ErrorHandler, useClass: IonicErrorHandler}
  ]
})
export class AppModule {}
