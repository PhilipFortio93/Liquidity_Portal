// load the things we need
var mongoose = require('mongoose');

// define the schema for our user model
var etfSchema = mongoose.Schema({

    ric         : {type: String, unique:true},
    name        : String,
    isin        : String,
    issuer      : String,
    ticker      : String,
    currency    : String,
    minsize     : Number,
    provider    : String,
    creation_cost   : Number,
    creation_axe    : Number,
    redemption_cost : Number,
    redemption_axe  : Number,
    borrowfee: Number,
    borrowsize: Number,
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

etfSchema.virtual('axedcreator').get(function(){
    var axed = this.creation_cost.toFixed(1) > this.creation_axe.toFixed(1) ? true : false;
    if (axed == true){
        createstring = this.creation_axe.toFixed(1).toString() + " (" + this.creation_cost.toFixed(1).toString() + ")";
    }
    else{
        createstring = this.creation_cost.toFixed(1).toString();
    }
    return createstring;
});

etfSchema.virtual('axedcheck').get(function(){
    var axed = this.creation_cost.toFixed(1) > this.creation_axe.toFixed(1) ? true : false;
    return axed;
});
// create the model for etfs and expose it to our app
module.exports = mongoose.model('Etf', etfSchema);
