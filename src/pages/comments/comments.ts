import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import firebase from 'firebase';

@Component({
  selector: 'page-comments',
  templateUrl: 'comments.html',
})
export class CommentsPage {

  post: any = {};
  comments : any[] = [];

  constructor(public navCtrl: NavController, public navParams: NavParams) {

    this.post = this.navParams.get("post");
    console.log(this.post)

    firebase.firestore().collection("comments").where("post", "==", this.post.id).get()
    .then((data) => {
      this.comments = data.docs;
    }).catch((err) => {
      console.log(err)
    })

  }


}
