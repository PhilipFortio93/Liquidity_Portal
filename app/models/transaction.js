var mongoose = require('mongoose');

// define the schema for our user model
var transactionSchema = mongoose.Schema({

    user        : String,
    ticker      : String,
    ric         : String,
    quantity   : Number,
    create_or_redeem : String,
    status: String,
    settlement_date: Date,
    order_date    : Date


},{
    toObjects: {
        virtuals: true
    },
    toJSON:{
        virtuals: true
    }
});
// methods ======================

transactionSchema.virtual('ordertime').get(function(){
    
    var hours = this.order_date.getHours();
    var minutes = this.order_date.getMinutes();
    var ampm = hours >= 12 ? 'pm' : 'am';
    hours = hours % 12;
    hours = hours ? hours : 12;
    minutes = minutes < 10 ? '0' + minutes : minutes;
    var strTime = hours + ':' + minutes + ' ' + ampm;
    return strTime;
});

transactionSchema.virtual('orderdate').get(function(){
    
    var day = this.order_date.getDay();
    var month = this.order_date.getMonth();
    var year = this.order_date.getFullYear();   
    var fulldate = day + '-' + month + '-' + year;
    return this.order_date.toISOString().slice(0,10);
    //return fulldate;
});
// create the model for transactions and expose it to our app
module.exports = mongoose.model('Transaction', transactionSchema);
