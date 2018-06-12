import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';

@Component({
  selector: 'page-comments',
  templateUrl: 'comments.html',
})
export class CommentsPage {

  post: any = {};

  constructor(public navCtrl: NavController, public navParams: NavParams) {

    this.post = this.navParams.get("post");
    console.log(this.post)

  }


}
