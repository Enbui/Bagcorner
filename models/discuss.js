var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/project3', {useNewUrlParser: true, useUnifiedTopology: true});

var Schema = mongoose.Schema;

var discussSchema = new Schema({
     name: {type: String, required: true},
     comment: {type: String ,required:true},
     like : {type: Number, required : true},
     answer : [{
          name : {type: String, required: false},
          comment : {type: String, required: false}, 
          like : {type: Number, required: false}         
     },
    {
        timestamps:true
    }]
}, {
     timestamps:true
});

//add answer to comment

module.exports = mongoose.model('Discuss', discussSchema);