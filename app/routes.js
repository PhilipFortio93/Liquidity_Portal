var Etf            = require('../app/models/etf');
var multer = require('multer');
var upload = multer({ storage: multer.memoryStorage() });

let xlsx = require('node-xlsx')

module.exports = function(app, passport) {

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

    // process the login form
    app.post('/login', passport.authenticate('local-login', {
        successRedirect : '/profile', // redirect to the secure profile section
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
            user : req.user // get the user out of session and pass to template
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
            etf_list : etf_list
        });

    })

    app.get('/products/:id', isLoggedIn, async function(req, res){
        let etf = await Etf.findOne({'_id' : req.params.id}).exec();
        res.render('pages/etfdetail.ejs', {
            etf : etf
        });

    })

    app.post('/products/upload',upload.single('sillybilly'), async function(req, res){
        
        const workSheetsFromBuffer = xlsx.parse(req.file.buffer);
        // Assumes first row is header
        for (var i = 1; i < workSheetsFromBuffer[0].data.length ; i++) {
            datarow = workSheetsFromBuffer[0].data[i];
                                
            try{
                await new Etf({
                    name: datarow[0],
                    ric: datarow[2],
                    ticker: datarow[1],
                    creation_cost: datarow[3],
                    redemption_cost: datarow[4],
                    cut_off_time: new Date()

                    }).save();
                }
            catch(e){
                console.log(e);
                }

        };
        
        //console.log(workSheetsFromBuffer);
        let etf_list = await Etf.find().exec();
        res.render('pages/products.ejs', {
            etf_list : etf_list
        });

    })
    // =====================================
    // ORDERS SECTION =====================
    // =====================================
    // we will want this protected so you have to be logged in to visit
    // we will use route middleware to verify this (the isLoggedIn function)
    // query historical orders placed by the user
    app.get('/orders', isLoggedIn, async function(req, res){

        let etf_list = await Etf.find().exec();
        res.render('pages/products.ejs', {
            etf_list : etf_list
        });

    })
    // orders placed today
    app.get('/orderstoday', isLoggedIn, async function(req, res){

        let etf_list = await Etf.find().exec();
        res.render('pages/products.ejs', {
            etf_list : etf_list
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

