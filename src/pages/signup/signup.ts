import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import firebase from 'firebase';

@Component({
  selector: 'page-signup',
  templateUrl: 'signup.html',
})
export class SignupPage {

  name: string = "";
  email: string = "";
  password: string = "";

  constructor(public navCtrl: NavController, public navParams: NavParams) {
  }

  signup(){
    firebase.auth().createUserWithEmailAndPassword(this.email, this.password)
    .then((data) => {
      
      console.log(data)

      let newUser: firebase.User = data.user;
      newUser.updateProfile({
        displayName: this.name,
        photoURL: ""
      }).then(() => {
        console.log("Profile Updated")
      }).catch((err) => {
        console.log(err)
      })

    }).catch((err) => {
      console.log(err)
    })
  }

  goBack(){
    this.navCtrl.pop();
  }

}
