const imageUploader = require("../controllers/controller");
const database = require("../controllers/firebaseController");
const stateController = require("../controllers/stateController");
const chalk = require("chalk");
const express = require("express");
const router = express.Router();

router.post("/admin/info", (req, res) => {
    if (checkPermission(req, res)) {
        if (req.session.username == req.body.newName) {
            database.updateUser(req.session.docId, req.body.newName, req.body.newEmail, req.body.newNumber, (message) => {
                setTimeout((cb) => {
                    req.session.email = req.body.newEmail;
                    req.session.telefonnummer = req.body.newNumber;
                    res.redirect('/')
                }, 1000)
            })
        } else {
            database.checkIfUserExists(req.body.newName, (cb) => {
                if (cb) {
                    res.send("Bruger findes allerede i systemet")
                } else {
                    database.updateUser(req.session.docId, req.body.newName, req.body.newEmail, req.body.newNumber, (message) => {
                        setTimeout((cb) => {
                            req.session.username = req.body.newName;
                            req.session.email = req.body.newEmail;
                            req.session.telefonnummer = req.body.newNumber;
                            res.redirect('/')
                        }, 1000)
                    })
                }
            })
        }
    } else {
        res.end();
    }
})

router.get("/login", (req, res) => {
    if (req.session.isLoggedIn) {
        res.redirect("/");
    } else {
        res.render("login", { pageTitle: "Login" });
    }
});

router.get("/logout", (req, res) => {
    if (checkPermission(req, res)) {
        console.log(
            chalk.yellow(`${req.session.username} has just logged off the website!`)
        );
        req.session.destroy();
        res.redirect("/");
    }
    res.end();
});

router.post("/auth", (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    database.authenticateUser(username, password, (user) => {
        if (!user) {
            console.log("hej");
            res.render("login", { msg: "Username eller password er forkert - prøv igen!" });
        } else {
            req.session.isLoggedIn = true;
            req.session.username = username;
            req.session.email = user.email;
            req.session.telefonnummer = user.telefonnummer;
            req.session.docId = user.id;
            console.log(
                chalk.yellow(`${req.session.username} has just logged in!`)
            );
            res.redirect("/");
        }
        res.end();
    });
});

router.post("/billeder", (req, res) => {

    let tags
    if (Array.isArray(req.body.tags)) {
        tags = req.body.tags;
    } else {
        tags = Array.of(req.body.tags)
    }
    if (!tags[0]) {
        stateController.returnImageJSON((image) => {
            res.render("gallery", {
                pageTitle: "Gallery",
                images: image
            });
        })
    } else {
        stateController.getImagesByTags(tags, (image) => {
            res.render("gallery", {
                pageTitle: "Gallery",
                images: image,
            });
        })
    }
})

router.get("/upload", (req, res) => {
    if (checkPermission(req, res)) {
        database.getAllUsers((allUsers) => {
            setTimeout((cb) => {
                res.render("upload", {
                    users: allUsers
                });
            }, 1000)

        })
    }
});

router.post("/upload", (req, res) => {
    if (checkPermission(req, res)) {
        imageUploader.upload(req, res, (err) => {
            if (err) {
                console.log(chalk.red(err));
                res.render("upload", {
                    msg: err,
                });
            } else {
                console.log(
                    chalk.green(`File Uploaded - Filename: ${req.file.filename}`)
                );
                let tags
                if (!req.body.tags) {
                    tags = ["Diverse"]
                } else {
                    if (Array.isArray(req.body.tags)) {
                        tags = req.body.tags
                    } else {
                        tags = Array.of(req.body.tags)
                    }
                }
                database.getAllUsers((allUsers) => {
                    res.render("upload", {
                        msg: "File Uploaded!",
                        file: `../uploads/${req.file}`,
                        users: allUsers
                    });
                })
                let user
                if (!req.body.selectUser || req.body.selectUser == "Vælg bruger") {
                    user = req.session.username
                } else {
                    user = req.body.selectUser
                }
                database.uploadToDatabase(
                    `/public/uploads/${req.file.filename}`,
                    user,
                    req.body.title,
                    req.body.description,
                    tags
                );
            }


        });
    }
});

router.post('/admin/edit', (req, res) => {
    console.log(req.body)
    console.log(req.body.docId)
    database.updateImageInformation(req.body.docId, req.body.ftitle, req.body.fdescription, (text) => {
        setTimeout((cb) => {
            res.redirect('/user/admin')
        }, 1000)
    })

})

router.post('/admin/update-owner', (red, res) => {

    database.transferImageOwnership(req.body.imageDocId, req.body.newOwner, (cb) => {
        setTimeout((callback => {
            res.redirect('/user/admin')
        }), 500)
    })
})

router.get("/admin", (req, res) => {
    if (checkPermission(req, res)) {
        if (req.session.username != "admin") {
            stateController.returnUserImages(req.session.username, (image) => {
                res.render("admin", {
                    pageTitle: "Billede Administration",
                    images: image,
                });
            });
        } else {
            stateController.returnImageJSON((image) => {
                if (image) {
                    res.render("admin", {
                        pageTitle: "Billede Administration",
                        images: image,
                    });
                } else {
                    res.render("admin")
                }
            });
        }
    }
});

router.get("/accounts", (req, res) => {
    if (checkPermission(req, res)) {
        if (req.session.username != "admin") {
            res.redirect("/")
        } else {
            database.getAllUsers((allUsers) => {
                res.render("accounts", {
                    pageTitle: "Bruger Administration",
                    users: allUsers,
                });
            });
        }
    }
})

router.post("/accounts", (req, res) => {
    if (checkPermission(req, res)) {
        database.createUser(req.body.username, req.body.pwd, (db) => {
            setTimeout((call) => {
                res.redirect('/user/accounts')
            }, 1000)
        })
    } else {
        res.redirect("/")
    }
})


router.post("/accounts/delete", (req, res) => {
    if (checkPermission(req, res)) {
        database.deleteUser(req.body.deleteDocId, (db) => {
            setTimeout((call) => {
                res.redirect('/user/accounts')
            }, 1000)
        })
    } else {
        res.redirect("/")
    }
})

router.post("/admin/delete", (req, res) => {
    database.deleteImage(req.body.deleteDocId, (message) => {
        res.redirect("/user/admin")
    });

});

let checkPermission = function(req, res) {
    if (req.session.isLoggedIn) {
        return true;
    } else {
        res.redirect("/user/login");
    }
};

module.exports = router;