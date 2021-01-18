const nodemailer = require("nodemailer")
const inlineBase64 = require('nodemailer-plugin-inline-base64');

module.exports = async function main(navn, email, topic, text, artistEmail, category) {
    let transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false,
        auth: {
            user: "Artemistestermail@gmail.com",
            pass: "Artemis123"
        },
        tls: {
            rejectUnauthorized: false
        }
    })
    transporter.use('compile', inlineBase64());

    let info = await transporter.sendMail({
        from: navn + "<" + email + ">",
        to: artistEmail,
        subject: category + ":" + topic,
        html: text
    })
}