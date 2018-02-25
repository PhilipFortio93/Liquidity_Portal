// load the things we need
var mongoose = require('mongoose');

// define the schema for our user model
var etfSchema = mongoose.Schema({

    name        : {type: String, unique:true},
    issuer      : String,
    ticker      : String,
    ric         : String,
    currency    : String,
    minsize     : Number,
    provider    : String,
    creation_cost   : Number,
    creation_axe    : Number,
    redemption_cost : Number,
    redemption_axe  : Number,
    cut_off_time    : Date


},{
    toObjects: {
        virtuals: true
    },
    toJSON:{
        virtuals: true
    }
});
// methods ======================

etfSchema.virtual('cutoff').get(function(){

    var hours = this.cut_off_time.getHours();
    var minutes = this.cut_off_time.getMinutes();
    var ampm = hours >= 12 ? 'pm' : 'am';
    hours = hours % 12;
    hours = hours ? hours : 12;
    minutes = minutes < 10 ? '0' + minutes : minutes;
    var strTime = hours + ':' + minutes + ' ' + ampm;
    return strTime;
});
// create the model for etfs and expose it to our app
module.exports = mongoose.model('Etf', etfSchema);
