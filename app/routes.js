var Etf            = require('../app/models/etf');
var switch_etf          = require('../app/models/switch');
var multer = require('multer');
var upload = multer({ storage: multer.memoryStorage() });
var Transaction = require('../app/models/transaction');
var User            = require('../app/models/user');

let xlsx = require('node-xlsx')

let isRole = function(role){
    return function(req,res,next) {
        if(req.user.role === role) return next()
        return next(new Error(`You are not a ${role}`))
    }
}

module.exports = function(app, passport, nodemailer) {

    let {sendEmail} = require('../config/mailer')(nodemailer)
    // =====================================
    // HOME PAGE (with login links) ========
    // =====================================
    app.get('/', function(req, res) {
        res.render('pages/index.ejs'); // load the index.ejs file
    });

    // =====================================
    // LOGIN ===============================
    // =====================================
    // show the login form
    app.get('/login', function(req, res) {

        // render the page and pass in any flash data if it exists
        res.render('pages/login.ejs', { message: req.flash('loginMessage') }); 
    });

    app.get('/updateaxe', function(req, res) {
        res.render('pages/profile.ejs', {
            user : req.user // get the user out of session and pass to template,
        });
    });
    // process the login form
    app.post('/login', passport.authenticate('local-login', {
        successRedirect : '/productlist', // redirect to the secure profile section
        failureRedirect : '/login', // redirect back to the signup page if there is an error
        failureFlash : true // allow flash messages
    }));

    // =====================================
    // SIGNUP ==============================
    // =====================================
    // show the signup form
    app.get('/signup', function(req, res) {

        // render the page and pass in any flash data if it exists
        res.render('pages/signup.ejs', { message: req.flash('signupMessage') });
    });

    // process the signup form
    app.post('/signup', passport.authenticate('local-signup', {
        successRedirect : '/profile', // redirect to the secure profile section
        failureRedirect : '/signup', // redirect back to the signup page if there is an error
        failureFlash : true // allow flash messages
    }));
    // =====================================
    // PROFILE SECTION =====================
    // =====================================
    // we will want this protected so you have to be logged in to visit
    // we will use route middleware to verify this (the isLoggedIn function)
    app.get('/profile', isLoggedIn, function(req, res) {
        res.render('pages/profile.ejs', {
            user : req.user // get the user out of session and pass to template,
        });
    });

    // =====================================
    // PRODUCT SECTION =====================
    // =====================================
    // we will want this protected so you have to be logged in to visit
    // we will use route middleware to verify this (the isLoggedIn function)
    app.get('/productlist', isLoggedIn, async function(req, res){

        let etf_list = await Etf.find().exec();

        res.render('pages/products.ejs', {
            etf_list : etf_list,
            user : req.user
        });

    })

    app.get('/products/:id', isLoggedIn, async function(req, res){
        let etf = await Etf.findOne({'_id' : req.params.id}).exec();
        console.log(typeof etf.minsize);
        res.render('pages/etfdetail.ejs', {
            etf : etf,
            user : req.user
        });

    })

    // =====================================
    // ORDERS SECTION =====================
    // =====================================
    // we will want this protected so you have to be logged in to visit
    // we will use route middleware to verify this (the isLoggedIn function)

    app.get('/orders/:id', isLoggedIn, async function(req, res){
        let etf = await Etf.findOne({'_id' : req.params.id}).exec();
        res.render('pages/orders.ejs', {
            etf : etf,
            message: req.flash('createMessage'),
            user : req.user
        });

    })

    app.post('/orders/:id', async function(req, res){

        let etf = await Etf.findOne({'_id' : req.params.id}).exec();


        let user = req.user

        console.log(req.body)
        try{
            trans = await new Transaction({
                user: user.local.email,
                ticker: etf.ticker,
                ric: etf.ric,
                quantity: req.body.quantity,
                status: 'Pending',
                create_or_redeem: req.body.CreateRedeem,
                order_date: new Date()

                }).save();

            req.flash('createMessage', 'Order Created!');

            sendEmail('Order Submitted', 'philip.fortio@gmail.com', 'Someone has submitted an order for review!');

            }
        catch(e){
            console.log(e);
            req.flash('createMessage', 'Order Failed!');
            }

        res.render('pages/ordersummary.ejs', {
            etf : etf,
            message : req.flash('createMessage'),
            user : req.user,
            trans : trans

        });

    })

    app.post('/products/upload', isLoggedIn, upload.single('axeupload'), async function(req, res){
        
        const workSheetsFromBuffer = xlsx.parse(req.file.buffer);
        var today = new Date()
        // Assumes first row is header
        for (var i = 1; i < workSheetsFromBuffer[0].data.length ; i++) {
            datarow = workSheetsFromBuffer[0].data[i];
            console.log(typeof datarow[6]);
            try{
                await Etf.findOneAndUpdate(
                    {'ric' : datarow[2]},
                    { $set: {
                            name: datarow[0],
                            ric: datarow[2],
                            ticker: datarow[1],
                            minsize: datarow[3],
                            creation_cost: datarow[4],
                            redemption_cost: datarow[5],
                            provider: datarow[8],
                            currency: data[9],
                            cut_off_time: new Date(today.getFullYear(),today.getMonth(), today.getDay(), datarow[6].toString(), datarow[7].toString())
                        }
                    },
                    { upsert: true, new:true, setDefaultsOnInsert: true }
                    );
                }
            catch(e){
                console.log(e);
                }



        };
        
        //console.log(workSheetsFromBuffer);
        let etf_list = await Etf.find().exec();
        res.render('pages/products.ejs', {
            etf_list : etf_list,
            user : req.user
        });

    })
    // =====================================
    // TRANSACTION QUERY SECTION =====================
    // =====================================
    // we will want this protected so you have to be logged in to visit
    // we will use route middleware to verify this (the isLoggedIn function)
    // query historical orders placed by the user
    app.get('/orders', isLoggedIn, async function(req, res){

        let trans_list = await Transaction.find({'user' : req.user.local.email}).sort({'created_at':-1});
        res.render('pages/listorders.ejs', {
            trans_list : trans_list,
            user : req.user
        });

    })

    app.get('/ordersdetail/:id', isLoggedIn, async function(req, res){


        let user = req.user;
        let trans = await Transaction.findOne({'_id' : req.params.id}).exec();

        let etf = await Etf.findOne({'ric' : trans.ric}).exec();
        let switch_etf = await switch_etf.find({'ric' : trans.ric}).exec();

        res.render('pages/ordersummary.ejs', {
            etf : etf,
            message: req.flash('createMessage'),
            user : req.user,
            trans : trans,
            switch_etf : switch_etf

        });

    })

    app.post('/orders/delete/:id', isLoggedIn, async function(req, res){
        
        let trans = await Transaction.findOne({'_id' : req.params.id}).exec();
        let etf = await Etf.findOne({'ric' : trans.ric}).exec();
        console.log(etf);
        await Transaction.remove({'_id' : req.params.id}).exec();

        sendEmail('Order Deleted', 'philip.fortio@gmail.com', 'Someone has deleted an order!');
        
        req.flash('createMessage', 'Order Deleted!');
        let user = req.user;
        res.render('pages/ordersummary.ejs', {
            etf : etf,
            message: req.flash('createMessage'),
            user : req.user,
            trans : trans

        });

    })

    app.post('/orders/approval/:id', isLoggedIn, async function(req, res){
        
        let trans = await Transaction.findOne({'_id' : req.params.id}).exec();
        let etf = await Etf.findOne({'ric' : trans.ric}).exec();
        console.log(etf);
        await trans.update({'status' : 'Approved'}).exec();

        sendEmail('Order Approved', 'philip.fortio@gmail.com', 'Your order has been approved!');
        
        req.flash('createMessage', 'Order Approved!');
        let user = req.user;
        res.render('pages/ordersummary.ejs', {
            etf : etf,
            message: req.flash('createMessage'),
            user : req.user,
            trans : trans

        });

    })

    // orders placed today
    app.get('/orderstoday', isLoggedIn, async function(req, res){
        var today = new Date();
        todaystart = today.setHours(0,0,0,0);
        todayend = today.setHours(23,59,59,999);

        let trans_list = await Transaction.find({'user' : req.user.local.email, 'order_date' : { $gt: todaystart, $lt: todayend }}).exec();
        

        trans_list.forEach(function(doc, index) { 
            console.log(index + " key: " + doc.order_date);
            console.log(doc.order_date);
        });

        res.render('pages/listorders.ejs', {
            trans_list : trans_list,
            user : req.user
        });

    })

    app.get('/approvals', isLoggedIn, async function(req, res){

        let trans_list = await Transaction.find({'status' : 'Pending'}).exec();
        res.render('pages/approvals.ejs', {
            trans_list : trans_list,
            user : req.user
        });

    })

    app.get('/approvals/:id', isLoggedIn, async function(req, res){

        let user = req.user;
        let trans = await Transaction.findOne({'_id' : req.params.id}).exec();

        let etf = await Etf.findOne({'ric' : trans.ric}).exec();

        res.render('pages/orderapproval.ejs', {
            etf : etf,
            message: req.flash('createMessage'),
            user : req.user,
            trans : trans

        });

    })

    // =====================================
    // LOGOUT ==============================
    // =====================================
    app.get('/logout', function(req, res) {
        req.logout();
        res.redirect('/');
    });
};

// route middleware to make sure a user is logged in
function isLoggedIn(req, res, next) {

    // if user is authenticated in the session, carry on 
    if (req.isAuthenticated())
        return next();

    // if they aren't redirect them to the home page
    res.redirect('/');
}


