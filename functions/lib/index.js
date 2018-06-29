"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp(functions.config().firebase);
const sendNotification = (owner_uid, type) => {
    return new Promise((resolve, reject) => {
        return admin.firestore().collection("users").doc(owner_uid).get().then((doc) => {
            if (doc.exists && doc.data().token) {
                if (type === "new_comment") {
                    admin.messaging().sendToDevice(doc.data().token, {
                        data: {
                            title: "A new comment has been made on your post.",
                            sound: "default",
                            body: "Tap to Check"
                        }
                    }).then((sent) => {
                        resolve(sent);
                    }).catch((err) => {
                        reject(err);
                    });
                }
                else if (type === "new_like") {
                    admin.messaging().sendToDevice(doc.data().token, {
                        data: {
                            title: "Someone liked your post on Feedly.",
                            sound: "default",
                            body: "Tap to Check"
                        }
                    }).then((sent) => {
                        resolve(sent);
                    }).catch((err) => {
                        reject(err);
                    });
                }
            }
        });
    });
};
exports.updateLikesCount = functions.https.onRequest((request, response) => {
    console.log(request.body);
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
        admin.firestore().collection("posts").doc(postId).update(updateData).then(() => __awaiter(this, void 0, void 0, function* () {
            if (action == "like") {
                yield sendNotification(data.data().owner, "new_like");
            }
            response.status(200).send("Done");
        })).catch((err) => {
            response.status(err.code).send(err.message);
        });
    }).catch((err) => {
        response.status(err.code).send(err.message);
    });
});
exports.updateCommentsCount = functions.firestore.document('comments/{commentId}').onCreate((event) => __awaiter(this, void 0, void 0, function* () {
    let data = event.data();
    let postId = data.post;
    let doc = yield admin.firestore().collection("posts").doc(postId).get();
    if (doc.exists) {
        let commentsCount = doc.data().commentsCount || 0;
        commentsCount++;
        yield admin.firestore().collection("posts").doc(postId).update({
            "commentsCount": commentsCount
        });
        return sendNotification(doc.data().owner, "new_comment");
        ;
    }
    else {
        return false;
    }
}));
//# sourceMappingURL=index.js.map