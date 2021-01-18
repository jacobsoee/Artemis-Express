//------------------------------------DEPENDENCIES-----------------------------------------------//
const express = require('express');
const morgan = require('morgan')
const config = require('./config')
const mailserver = require('./models/mailserver')
const stateController = require("./controllers/stateController");
const database = require("./controllers/firebaseController");

//------------------------------------ INIT APP--------------------------------------------------
const app = express();

const port = process.env.PORT || 8080

// Session opsætning
session = require("express-session");
app.use(
    session({
        secret: config.sessionSecret,
    })
);

app.use(express.json());
app.use(express.urlencoded());

//brug assets mappe til static filer.
app.use(express.static("assets"));
//Opsætning af template engine
app.set("view engine", "pug");
// Public Folder
app.use(express.static("./public"));
//opsætning af morgan til logging af request.
app.use(morgan("tiny"));

//----------------------------------SERVER ROUTES---------------------------------------------------//

//Adgang til session i PUG filerne
app.use(function(req, res, next) {
    res.locals.session = req.session;
    next();
});

//Get index side
app.get("", (req, res) => {
    stateController.returnImageJSON((image) => {
        res.render("index", {
            pageTitle: "Artemis",
            images: image,
        });
    });
});

app.get("/gallery", (req, res) => {
    stateController.returnImageJSON((image) => {
        res.render("gallery", {
            pageTitle: "Artemis",
            images: image,
        });
    });
});

app.get("/slider", (req, res) => {
    stateController.returnImageJSON((image) => {
        res.render("slider", {
            pageTitle: "Artemis",
            images: image,
        });
    });
});

//User router redirect
const userRouter = require("./routes/userRoutes");
app.use("/user", userRouter);

app.get("/about", (req, res) => res.render("about", { pageTitle: "Om os" }));

//about
app.get("/about", (req, res) => res.render("about"));

//contactform
app.get("/contact", (req, res) =>
    res.render("contactform", { pageTitle: "Kontakt" })
);

app.post('/contactform', (req, res) => {
    let artistEmail
    let text = req.body.text
    if (req.body.artistEmail) {
        database.getImageByDocId(req.body.imageDocId, (image) => {
            artistEmail = req.body.artistEmail
            text = `
            <html>
            <body>
            <h2> ${image.title.toUpperCase()} </h2>
            <img src="data:image/${image.fileExtension};base64,${image.encoded}" style="width:300px;">
            <br>
            <i> ${image.description} </i>
            <br>
            <h4> ${req.body.navn}: "${req.body.text}" </h4>
            <hr> 
            <h5> Navn: ${req.body.navn} </h5
            <h5> Email: ${req.body.email} </h5>
            </body>
            </html>`
            mailserver(req.body.navn, req.body.email, req.body.topic, text, artistEmail, req.body.category)
            res.redirect("/")
        })

    } else {
        artistEmail = "artemistestermail@gmail.com"
        text = `
        <html>
        <body>
        <h3> </h3>
        <br>
        <br>
        <i> ${req.body.navn}: "${req.body.text}" </i>
        <hr> 
        <h5> Navn: ${req.body.navn} </h5
        <h5> Email: ${req.body.email} </h5>
        </body>
        </html>`
        mailserver(req.body.navn, req.body.email, req.body.topic, text, artistEmail, req.body.category)
        res.redirect("/")
    }
})

app.post("/gallery", (req, res) => {
    database.getUser(req.body.imageUser, (cb) => {
        res.render("contactform", {
            receiver: req.body.imageUser,
            email: cb.email,
            imageTitle: req.body.imageTitle,
            imageDocId: req.body.imageDocId
        })
    })

})


app.listen(port, function() {
    console.log('Listening on port %d', port);
});

//----------------------------------Test funktion---------------------------------------------------//
app.sayHello = function() {
    return "hello";
};

//----------------------------------Exports til test------------------------------------------------//
module.exports = app;