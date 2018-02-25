// expose this function to our app using module.exports
module.exports = function(nodemailer) {

    // =========================================================================
    // SETUP SERVICE ============================================================
    // =========================================================================
    // Set up SMTP service using my credentials

    var smtpTransport = nodemailer.createTransport({
       //service: "Mailgun",
       host: 'smtp.gmail.com',
       port: 465,
       secure: true,
       auth: {
           //type: "OAuth2",

       }
    }); 

    // smtpTransport.set('oauth2_provision_cb', (user, renew, callback)=>{
    //     let accessToken = userTokens[user];
    //     if(!accessToken){
    //         return callback(new Error('Unknown user'));
    //     }else{
    //         return callback(null, accessToken);
    //     }
    // });

    let sendEmail = function(subject, toaddress, message) {
        
        smtpTransport.sendMail({
           from: "Barclays Primary Market Mailbox <barc@gmail.com>", // sender address
           to: toaddress, // comma separated list of receivers
           subject: subject, // Subject line
           text: message// plaintext body
        }, function(error, response){
           if(error){
               console.log(error);
           }else{
               console.log("Mail sent!");
           }
        });
    }

    return {
        sendEmail: sendEmail
    }
};