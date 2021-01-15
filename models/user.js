var mongoose = require("mongoose");
var bcryptjs = require('bcryptjs');

var Schema = mongoose.Schema;

var userSchema = new Schema({
    local: {
        email : {type: String, required:true},
        password: {type: String, required: true}
    },
    rule: {type:Number, required:true},
    information : {
        avatar : {type: String, required: false},
        name :{type: String, required: false},
        gendle : {type:String, required:false},
        birthday: {type: Date, required: false},
        address : {type: String, require: false},
        phoneNumber : {type: Number, required: false}
    },
    
},{
    timestamps:true,
});


userSchema.methods.encryptPassword = function(password) {
    return bcryptjs.hashSync(password, 10);
}

userSchema.methods.validPassword = function(password){
    return bcryptjs.compareSync(password, this.password);
}

module.exports = mongoose.model('User', userSchema);