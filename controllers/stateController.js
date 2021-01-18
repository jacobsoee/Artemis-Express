const database = require("./firebaseController");
const chalk = require("chalk");
const fs = require("fs");

let stateController = {};

stateController.returnImageJSON = function(callback) {
    getSortedArrayOfImages((images) => {
        let data = images;
        callback(data);
    });
};

stateController.returnUserImages = function(username, callback) {
    getUserSortedArrayOfImages(username, (images) => {
        let data = images;
        callback(data);
    });
}

getUserSortedArrayOfImages = async function(username, callback) {
    database.getUserImages(username, (images) => {
        //Sortere array af images fra nyeste til ældste.
        if (images) {
            callback(images.sort(compareDateCreated));
        } else {
            callback("")
        }
    });
}

stateController.getImagesByTags = function(tags, callback) {
    database.getImagesFromDatabaseEncoded((images) => {
        getImagesWithTag(tags, images, (relevantImageArray) => {
            callback(relevantImageArray.sort(compareDateCreated))
        })
    })
}

getImagesWithTag = async function(tags, images, callback) {
    let selectedImages = []
    for (let i = 0; i < images.length; i++) {
        let j = 0;
        let tagsMatching = false;
        while (!tagsMatching && j < images[i].tags.length) {
            let k = 0;
            while (k < tags.length) {
                if (images[i].tags[j] == tags[k]) {
                    selectedImages.push(images[i]);
                    tagsMatching = true;
                }
                k++;
            }
            j++;
        }
    }
    await callback(selectedImages)
}

getSortedArrayOfImages = async function(callback) {
    database.getImagesFromDatabaseEncoded((images) => {
        //Sortere array af images fra nyeste til ældste.
        callback(images.sort(compareDateCreated));
    });

}

function compareDateCreated(a, b) {
    if (a.dateCreated > b.dateCreated) return -1;
    if (b.dateCreated > a.dateCreated) return 1;
    return 0
}

module.exports = stateController;