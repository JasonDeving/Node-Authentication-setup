// server.js

// set up ======================================================================
// get all the tools we need
var express  = require('express');
var app      = express();
var port     = process.env.PORT || 8080;
var mongoose = require('mongoose');
var passport = require('passport');
var flash    = require('connect-flash');
var crypto   = require('crypto');

var configDB = require('./config/database.js');

// configuration ===============================================================
mongoose.connect(configDB.url); // connect to our database

require('./config/passport')(passport); // pass passport for configuration

app.configure(function() {
	var isProduction = app.get('env') === 'production';
	var sessionSecret = process.env.SESSION_SECRET;

	if (!sessionSecret) {
		if (isProduction) {
			throw new Error('SESSION_SECRET must be set in production.');
		}
		sessionSecret = crypto.randomBytes(32).toString('hex');
		console.warn('Warning: SESSION_SECRET not set, using an ephemeral secret.');
	}

	// set up our express application
	app.use(express.logger('dev')); // log every request to the console
	app.use(express.cookieParser()); // read cookies (needed for auth)
	app.use(express.bodyParser()); // get information from html forms
	app.disable('x-powered-by');
	app.set('trust proxy', 1);

	app.use(function(req, res, next) {
		res.setHeader('X-Content-Type-Options', 'nosniff');
		res.setHeader('X-Frame-Options', 'DENY');
		res.setHeader('Referrer-Policy', 'no-referrer');
		res.setHeader('X-XSS-Protection', '0');
		next();
	});

	app.set('view engine', 'ejs'); // set up ejs for templating

	// required for passport
	app.use(express.session({
		secret: sessionSecret,
		key: 'sid',
		cookie: {
			httpOnly: true,
			secure: isProduction
		}
	})); // session secret
	app.use(passport.initialize());
	app.use(passport.session()); // persistent login sessions
	app.use(flash()); // use connect-flash for flash messages stored in session

});

// routes ======================================================================
require('./app/routes.js')(app, passport); // load our routes and pass in our app and fully configured passport

// launch ======================================================================
app.listen(port);
console.log('The magic happens on port ' + port);
