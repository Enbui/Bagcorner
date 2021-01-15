var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/project3', { useNewUrlParser: true, useUnifiedTopology: true });

var Schema = mongoose.Schema;

var reviewSchema = new Schema({
    productId: {type:String, required: true},
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    ratingNumber: { type: Number, required: false },
    review: { type: String, required: false },
    reply: [{
        user: { type: Schema.Types.ObjectId, ref: 'User' },
        comment: { type: String, required: false }
    }, {
        timestamps: true
    }]
}, {
    timestamps: true
});

//add answer to comment

module.exports = mongoose.model('Review', reviewSchema);