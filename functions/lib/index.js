"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp(functions.config().firebase);
// Start writing Firebase Functions
// https://firebase.google.com/docs/functions/typescript
exports.updateLikesCount = functions.https.onRequest((request, response) => {
    console.log(JSON.parse(request.body));
    const postId = JSON.parse(request.body).postId;
    const userId = JSON.parse(request.body).userId;
    const action = JSON.parse(request.body).action; // 'like' or 'unlike'
    admin.firestore().collection("posts").doc(postId).get().then((data) => {
        let likesCount = data.data().likesCount || 0;
        let likes = data.data().likes || [];
        let updateData = {};
        if (action == "like") {
            updateData["likesCount"] = ++likesCount;
            updateData[`likes.${userId}`] = true;
        }
        else {
            updateData["likesCount"] = --likesCount;
            updateData[`likes.${userId}`] = false;
        }
        console.log(updateData);
        admin.firestore().collection("posts").doc(postId).update(updateData).then(() => {
            console.log("Updated");
            response.status(200).send("Done");
        }).catch((err) => {
            response.status(err.code).send(err.message);
        });
    }).catch((err) => {
        response.status(err.code).send(err.message);
    });
});
//# sourceMappingURL=index.js.map