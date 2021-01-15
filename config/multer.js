var multer  = require('multer');

//multer to upload image
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, './public/images/products');
    },
    filename: function (req, file, cb) {
      cb(null, Date.now()  + "-" + file.originalname)
    }
});  

var upload = multer({ 
    storage: storage,
    limits: {
        fileSize: 1024 *1024 *12,
    } ,
    fileFilter: function (req, file, cb) {
        if(file.mimetype=="image/png" || file.mimetype=="image/jpeg" || file.mimetype=="image/jpg" || file.mimetype=="image/gif"){
            cb(null, true)
        }else{
            return cb(new Error('Only image are allowed!'))
        }
    }
}).single("productImage");

module.exports = {storage, upload};