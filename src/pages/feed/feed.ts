import { Component } from '@angular/core';
import { NavController, NavParams, LoadingController, ToastController } from 'ionic-angular';
import firebase from 'firebase';
import moment from 'moment';
import { LoginPage } from '../login/login';
import { Camera, CameraOptions } from '@ionic-native/camera';
import { HttpClient }  from '@angular/common/http';

@Component({
  selector: 'page-feed',
  templateUrl: 'feed.html',
})
export class FeedPage {

  text: string = "";
  posts: any[] = [];
  pageSize: number = 10;
  cursor: any;
  infiniteEvent: any;
  image: string;

  constructor(public navCtrl: NavController, public navParams: NavParams, private loadingCtrl: LoadingController, private toastCtrl: ToastController, private camera: Camera, private http: HttpClient) {
    this.getPosts();
  }

  getPosts() {

    this.posts = [];

    let loading = this.loadingCtrl.create({
      content: "Loading Feed..."
    });

    loading.present();

    let query = firebase.firestore().collection("posts").orderBy("created", "desc").limit(this.pageSize);

    // query.onSnapshot((snapshot) => {
    //   let changedDocs = snapshot.docChanges();

    //   changedDocs.forEach((change) => {
    //     if(change.type == "added"){
    //       // TODO
    //     }

    //     if(change.type == "modified"){
    //       // TODO
    //       console.log("Document with id " + change.doc.id + " has been modified.");
    //     }

    //     if(change.type == "removed"){
    //       // TODO
    //     }
    //   })
    // })

    query.get()
      .then((docs) => {

        docs.forEach((doc) => {
          this.posts.push(doc);
        })

        loading.dismiss();

        this.cursor = this.posts[this.posts.length - 1];

        console.log(this.posts)

      }).catch((err) => {
        console.log(err)
      })
  }

  loadMorePosts(event) {

    firebase.firestore().collection("posts").orderBy("created", "desc").startAfter(this.cursor).limit(this.pageSize).get()
      .then((docs) => {

        docs.forEach((doc) => {
          this.posts.push(doc);
        })

        console.log(this.posts)

        if (docs.size < this.pageSize) {
          // all documents have been loaded
          event.enable(false);
          this.infiniteEvent = event;
        } else {
          event.complete();
          this.cursor = this.posts[this.posts.length - 1];
        }

      }).catch((err) => {
        console.log(err)
      })

  }

  refresh(event) {

    this.posts = [];

    this.getPosts();

    if (this.infiniteEvent) {
      this.infiniteEvent.enable(true);
    }

    event.complete();

  }

  post() {

    firebase.firestore().collection("posts").add({
      text: this.text,
      created: firebase.firestore.FieldValue.serverTimestamp(),
      owner: firebase.auth().currentUser.uid,
      owner_name: firebase.auth().currentUser.displayName
    }).then(async (doc) => {
      console.log(doc)

      if (this.image) {
        await this.upload(doc.id)
      }

      this.text = "";
      this.image = undefined;

      let toast = this.toastCtrl.create({
        message: "Your post has been created successfully.",
        duration: 3000
      }).present();

      this.getPosts();
    }).catch((err) => {
      console.log(err)
    })

  }

  ago(time) {
    let difference = moment(time).diff(moment());
    return moment.duration(difference).humanize();
  }

  logout() {

    firebase.auth().signOut().then(() => {

      let toast = this.toastCtrl.create({
        message: "You have been logged out successfully.",
        duration: 3000
      }).present();

      this.navCtrl.setRoot(LoginPage);
    });

  }

  addPhoto() {

    this.launchCamera();

  }

  launchCamera() {
    let options: CameraOptions = {
      quality: 100,
      sourceType: this.camera.PictureSourceType.CAMERA,
      destinationType: this.camera.DestinationType.DATA_URL,
      encodingType: this.camera.EncodingType.PNG,
      mediaType: this.camera.MediaType.PICTURE,
      correctOrientation: true,
      targetHeight: 512,
      targetWidth: 512,
      allowEdit: true
    }

    this.camera.getPicture(options).then((base64Image) => {
      console.log(base64Image);

      this.image = "data:image/png;base64," + base64Image;


    }).catch((err) => {
      console.log(err)
    })
  }

  upload(name: string) {

    return new Promise((resolve, reject) => {

      let loading = this.loadingCtrl.create({
        content: "Uploading Image..."
      })

      loading.present();

      let ref = firebase.storage().ref("postImages/" + name);

      let uploadTask = ref.putString(this.image.split(',')[1], "base64");

      uploadTask.on("state_changed", (taskSnapshot: any) => {
        console.log(taskSnapshot)
        let percentage = taskSnapshot.bytesTransferred / taskSnapshot.totalBytes * 100;
        loading.setContent("Uploaded " + percentage + "% ...")

      }, (error) => {
        console.log(error)
      }, () => {
        console.log("The upload is complete!");

        uploadTask.snapshot.ref.getDownloadURL().then((url) => {

          firebase.firestore().collection("posts").doc(name).update({
            image: url
          }).then(() => {
            loading.dismiss()
            resolve()
          }).catch((err) => {
            loading.dismiss()
            reject()
          })

        }).catch((err) => {
          loading.dismiss()
          reject()
        })

      })

    })

  }

  like(post){

    let body = {
      postId: post.id,
      userId: firebase.auth().currentUser.uid,
      action: post.data().likes && post.data().likes[firebase.auth().currentUser.uid] == true ? "unlike" : "like"
    }

    this.http.post("https://us-central1-feedlyapp-9df9a.cloudfunctions.net/updateLikesCount", JSON.stringify(body), {
      responseType: "text"
    }).subscribe((data) => {
      console.log(data)
    }, (error) => {
      console.log(error)
    })

  }

}
