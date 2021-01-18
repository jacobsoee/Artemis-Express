const multer = require("multer");
const path = require("path");

let imageUploader = {};

let storage = multer.diskStorage({
    destination: "/public/uploads",
    filename: function(req, file, cb) {
        cb(
            null,
            file.fieldname + "-" + Date.now() + path.extname(file.originalname)
        );
    },
});

// Check File Type
imageUploader.checkFileType = function(file, cb) {
    // Allowed ext
    const filetypes = /jpeg|jpg|png|gif/;
    // Check ext
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    // Check mime
    const mimetype = filetypes.test(file.mimetype);

    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb("Error: Images Only!");
    }
}

// Init Upload
imageUploader.upload = multer({
    storage: storage,
    limits: { fileSize: 100000000 },
    fileFilter: function(req, file, cb) {
        imageUploader.checkFileType(file, cb);
    },
}).single("myImage");

module.exports = imageUploader;