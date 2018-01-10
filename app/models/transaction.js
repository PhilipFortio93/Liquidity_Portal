var mongoose = require('mongoose');

// define the schema for our user model
var transactionSchema = mongoose.Schema({

    user        : String,
    ticker      : String,
    ric         : String,
    quantity   : Number,
    create_or_redeem : String,
    order_date    : Date


});
// methods ======================


// create the model for transactions and expose it to our app
module.exports = mongoose.model('Transaction', transactionSchema);
