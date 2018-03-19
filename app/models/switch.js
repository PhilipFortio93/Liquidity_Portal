// load the things we need
var mongoose = require('mongoose');

// define the schema for our user model
var switchSchema = mongoose.Schema({

    ric        : {type: String, unique:false},
    switch_ric      : String,
    name      : String,
    currency    : String,
    switch_currency    : String,
    cost     : Number,
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

switchSchema.virtual('cutoff').get(function(){

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
module.exports = mongoose.model('Switch', switchSchema);
