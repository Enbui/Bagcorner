var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/project3', {useNewUrlParser: true, useUnifiedTopology: true});

var Schema = mongoose.Schema;

var orderSchema = new Schema({
     user: {type: Schema.Types.ObjectId,ref:'User'},
     cart: {type:Object,required:true},
     paymentId: {type:String, required:true},
     paymentMethod : {type : String, required : true},
     paymentStatus:{type: String, required: true},
     deliveryStatus : {type : String, require},
     inforReceiver : {
          name : {type: String, required: true},
          phoneNumber : {type: String, required: false},
          address: {type: String , required: true},
          district: { type: String, required : true},
          city :{ type: String , required : true}
     }
}, {
     timestamps:true
});

module.exports = mongoose.model('Order', orderSchema);