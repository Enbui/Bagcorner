var Product = require('../models/product');
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/project3', {useNewUrlParser: true, useUnifiedTopology: true});

var product = [
    new Product ({
        name: 'Tui xach dinh da',
        imagePath:'./public/images/product/tuixach1.jpg',
        type: 'tuixach',
        price: 45000,
        description: 'san pham torng bo suu tap tui xach mua he 2020',
        quantity: 20
    }),
    new Product ({
        name: 'Tui xach dinh da',
        imagePath:'./public/images/product/tuixach1.jpg',
        type: 'tuixach',
        price: 45000,
        description: 'san pham torng bo suu tap tui xach mua he 2020',
        quantity: 20
    }),
    new Product ({
        name: 'Tui xach dinh da',
        imagePath:'./public/images/product/tuixach1.jpg',
        type: 'tuixach',
        price: 45000,
        description: 'san pham torng bo suu tap tui xach mua he 2020',
        quantity: 20
    }),
    new Product ({
        name: 'Tui xach dinh da',
        imagePath:'./public/images/product/tuixach1.jpg',
        type: 'tuixach',
        price: 45000,
        description: 'san pham torng bo suu tap tui xach mua he 2020',
        quantity: 20
    })
];

var done = 0;


for(var i = 0; i< product.length; i++) {
    product[i].save( function(err){
        if(err) {
        }
        else {
            done++;
        if(done===product.length) {
            exit();
        }
        
        }
    });   
}


function exit(){
    mongoose.disconnect();
}

