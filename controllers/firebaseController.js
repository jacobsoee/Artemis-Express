//står for alt grunt work til at hente data fra firebase.
const fs = require("fs");
const multer = require("multer");
const path = require("path");
const config = require("../config");
let database = {};

//------------------------------------------INIT LOCAL STORAGE -----------------------------------
var storage = multer.diskStorage({
    destination: "/public/uploads",
    filename: function(req, file, cb) {
        cb(
            null,
            file.fieldname + "-" + Date.now() + path.extname(file.originalname)
        );
    },
});

//----------------------------------GOOGLE CLOUD OPSÆTNING----------------------------------------------------//

const admin = require("firebase-admin");
admin.initializeApp({
    credential: admin.credential.cert(config.firestoreServiceAccount),
    storageBucket: "gs://artemis-9b98e.appspot.com",
});

//db ref
const db = admin.firestore();

//------------------------------------------------DATABASE METODER------------------------------------------//

database.authenticateUser = function(username, password, callback) {
    db.collection("Users")
        .where("username", "==", username.toLowerCase())
        .where("password", "==", password)
        .get()
        .then((snapshot) => {
            if (snapshot.empty) {
                callback(false);
            } else {
                snapshot.forEach((document) => {
                    const user = document.data();
                    user.id = document.id;
                    callback(user);
                });
            }
        })
        .catch((err) => {
            return;
        });
};

database.getAllUsers = function(callback) {
    db.collection("Users")
        .get()
        .then((snapshot) => {
            if (snapshot.empty) {
                return;
            } else {
                let userArray = [];
                let i = 0;
                snapshot.forEach((document) => {
                    const user = document.data();
                    let userObj = {
                        username: user.username,
                        email: user.email,
                        phone: user.telefonnummer,
                        docId: snapshot.docs[i].id
                    };
                    if (userObj.username == "admin") {
                        i++;
                    } else {
                        userArray.push(userObj);
                        i++;
                    }
                });
                callback(userArray);
            }
        })
        .catch((err) => {
            return;
        });
}

database.checkIfUserExists = function(username, callback) {
    db.collection("Users")
        .where("username", "==", username.toLowerCase())
        .get()
        .then((snapshot) => {
            if (snapshot.empty) {
                callback(false)
            } else {
                callback(true);
            }
        })
        .catch((err) => {
            return;
        });
}

database.getImageByDocId = function(docId, callback) {
    db.collection("Images")
        .doc(docId)
        .get()
        .then((snapshot) => {
            if (snapshot.empty) {
                callback("false")
            } else {
                const image = snapshot.data();
                let imageObj = {
                    title: image.title,
                    description: image.description,
                    encoded: image.encoded,
                    fileExtension: image.extension.toLowerCase(),
                };
                callback(imageObj)
            }
        }).catch((err) => {
            return;
        })
}

database.getUser = function(username, callback) {
    db.collection("Users")
        .where("username", "==", username.toLowerCase())
        .get()
        .then((snapshot) => {
            if (snapshot.empty) {
                callback(false)
            } else {
                snapshot.forEach((document) => {
                    const user = document.data();
                    user.id = document.id;
                    callback(user);
                });
            }
        })
        .catch((err) => {
            return;
        });
}

database.updateUser = function(docId, newName, newEmail, newPhoneNumber, callback) {
    db.collection("Users").doc(docId).update({
        username: newName.toLowerCase(),
        email: newEmail,
        telefonnummer: newPhoneNumber

    });
    callback("Bruger opdateret")

}


database.createUser = function(username, password, callback) {
    callback(db.collection('Users').doc().set({
        username: username.toLowerCase(),
        password: password
    }))
}

database.deleteUser = function(docId, callback) {
    db.collection("Users").doc(docId).delete().then(function() {
        callback("User has been deleted")
    }).catch(function(error) {
        console.log(error)
    })
}

database.transferImageOwnership = function(docId, newOwner, callback) {
    db.collection("Images").doc(docId).update({
        user: newOwner
    });
    callback("Ejer opdateret")

}

database.getUserImages = function(username, callback) {
    db.collection("Images")
        .where("user", "==", username)
        .get()
        .then((snapshot) => {
            if (snapshot.empty) {
                callback("");
            } else {
                let imageArray = [];
                let i = 0;
                snapshot.forEach((document) => {
                    const image = document.data();
                    let imageObj = {
                        title: image.title,
                        description: image.description,
                        user: image.user,
                        encoded: image.encoded,
                        fileExtension: image.extension,
                        dateCreated: image.dateCreated,
                        tags: image.tags,
                        docId: snapshot.docs[i].id
                    };
                    imageArray.push(imageObj);
                    i++;
                });
                callback(imageArray);
            }
        })
        .catch((err) => {
            return;
        });
}

database.deleteImage = function(docId, callback) {
    db.collection("Images").doc(docId).delete().then(function() {
        callback("Image has been deleted")
    }).catch(function(error) {
        console.log(error)
    })
}


database.updateImageInformation = function(docId, newTitle, newDescription, callback) {
    db.collection("Images").doc(docId).update({
        title: newTitle,
        description: newDescription
    });
    callback("Image has been updated")

};

database.uploadToDatabase = function(filePath, user, title, description, tags) {
    fs.unlink(filePath, (err) => {
        if (err) {
            console.log(err);
        }
        console.log("Slettet 1 fil på: " + filePath);
    });

    let fileExtension = filePath.split(".").pop();
    let encodedImage = this.encodeImage(filePath);

    if (tags) {
        return db.collection("Images").doc().set({
            description: description,
            encoded: encodedImage,
            title: title,
            user: user,
            tags: tags,
            extension: fileExtension,
            dateCreated: Date.now()
        });
    } else {
        return db.collection("Images").doc().set({
            description: description,
            encoded: encodedImage,
            title: title,
            user: user,
            extension: fileExtension,
            dateCreated: Date.now()
        });
    }
};


database.getImagesFromDatabaseEncoded = function(callback) {

    db.collection("Images")
        .get()
        .then((snapshot) => {
            if (snapshot.empty) {
                return;
            } else {
                let imageArray = [];
                let i = 0;
                snapshot.forEach((document) => {
                    const image = document.data();
                    let imageObj = {
                        title: image.title,
                        description: image.description,
                        user: image.user,
                        encoded: image.encoded,
                        fileExtension: image.extension,
                        dateCreated: image.dateCreated,
                        tags: image.tags,
                        docId: snapshot.docs[i].id
                    };
                    imageArray.push(imageObj);
                    i++;
                });
                callback(imageArray);
            }
        })
        .catch((err) => {
            return;
        });
};

database.encodeImage = function(imageFile) {

    //GET BASE64 ENCODING FROM IMAGE
    var bitmap = fs.readFileSync(imageFile);
    //Konvertere fil til 'Base64' encoding
    var temp = Buffer.from(bitmap).toString("base64");
    return temp;
};
//-------------------------------------UTILITY METODER -------------------------------------------//

//-------------------------------------------EXPORTS-------------------------------------------------//

module.exports = database;