// app/routes.js
module.exports = function(app, passport) {

	// =====================================
	// HOME PAGE (with login links) ========
	// =====================================
	app.get('/', function(req, res) {
		res.render('index.ejs'); // load the index.ejs file
	});

	// =====================================
	// LOGIN ===============================
	// =====================================
	// show the login form
	app.get('/login', function(req, res) {

		// render the page and pass in any flash data if it exists
		res.render('login.ejs', { message: req.flash('loginMessage') });
	});

	// process the login form
	app.post('/login', function(req, res, next) {
		passport.authenticate('local-login', function(err, user, info) {
			if (err) {
				return next(err);
			}

			if (!user) {
				req.flash('loginMessage', (info && info.message) || 'Login failed.');
				return res.redirect('/login');
			}

			var redirectToProfile = function() {
				req.logIn(user, function(loginErr) {
					if (loginErr) {
						return next(loginErr);
					}
					return res.redirect('/profile');
				});
			};

			if (req.session && typeof req.session.regenerate === 'function') {
				return req.session.regenerate(function(sessionErr) {
					if (sessionErr) {
						return next(sessionErr);
					}
					return redirectToProfile();
				});
			}

			return redirectToProfile();
		})(req, res, next);
	});

	// =====================================
	// SIGNUP ==============================
	// =====================================
	// show the signup form
	app.get('/signup', function(req, res) {

		// render the page and pass in any flash data if it exists
		res.render('signup.ejs', { message: req.flash('signupMessage') });
	});

	// process the signup form
	app.post('/signup', function(req, res, next) {
		passport.authenticate('local-signup', function(err, user, info) {
			if (err) {
				return next(err);
			}

			if (!user) {
				req.flash('signupMessage', (info && info.message) || 'Signup failed.');
				return res.redirect('/signup');
			}

			var redirectToProfile = function() {
				req.logIn(user, function(loginErr) {
					if (loginErr) {
						return next(loginErr);
					}
					return res.redirect('/profile');
				});
			};

			if (req.session && typeof req.session.regenerate === 'function') {
				return req.session.regenerate(function(sessionErr) {
					if (sessionErr) {
						return next(sessionErr);
					}
					return redirectToProfile();
				});
			}

			return redirectToProfile();
		})(req, res, next);
	});

	// =====================================
	// PROFILE SECTION =========================
	// =====================================
	// we will want this protected so you have to be logged in to visit
	// we will use route middleware to verify this (the isLoggedIn function)
	app.get('/profile', isLoggedIn, function(req, res) {
		res.render('profile.ejs', {
			user : req.user // get the user out of session and pass to template
		});
	});

	// =====================================
	// LOGOUT ==============================
	// =====================================
	app.get('/logout', function(req, res) {
		req.logout();
		if (req.session) {
			return req.session.destroy(function() {
				res.clearCookie('sid');
				res.redirect('/');
			});
		}
		res.clearCookie('sid');
		res.redirect('/');
	});
};

// route middleware to make sure
function isLoggedIn(req, res, next) {

	// if user is authenticated in the session, carry on
	if (req.isAuthenticated())
		return next();

	// if they aren't redirect them to the home page
	res.redirect('/');
}
