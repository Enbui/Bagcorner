const { Timestamp } = require('mongodb');
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/project3', {useNewUrlParser: true, useUnifiedTopology: true});

var Schema = mongoose.Schema;

var schema = new Schema({
    name: {type: String, required: true},
    imagePath: {type: String, required: true},
    type: {type: String, required: true},
    price: {type: Number, required: true},
    description: {type: String, required: true},
    quantity: {type: Number, required: true, min: [0, 'Quantity can not be less than 0.']},
    sold : {type: Number, required: true}
},
{ timestamps: true});


module.exports = mongoose.model('Product', schema);