// load the things we need
var mongoose = require('mongoose');

// define the schema for our user model
var etfSchema = mongoose.Schema({

    name        : String,
    ticker      : String,
    ric         : String,
    creation_cost   : Number,
    redemption_cost : Number,
    cut_off_time    : Date


});

// methods ======================


// create the model for etfs and expose it to our app
module.exports = mongoose.model('Etf', etfSchema);