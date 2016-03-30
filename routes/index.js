var express = require('express');
var router = express.Router();
var mongoose = require(process.cwd() + '/controllers/mongoose');
var passport;

var UserModel;

mongoose.initialize(function() {
    UserModel = mongoose.UserModel;
});


function routing() {
    router.get('/', function(req, res) {
        res.render('index', { title: 'Esup Otp Manager' });
    });

    router.get('/preferences', function(req, res) {
        res.render('dashboard', { title: 'Esup Otp Manager : Preferences' });
    });

    router.get('/login', function(req, res, next) {
        passport.authenticate('cas', function(err, user, info) {
            if (err) {
                console.log(err);
                return next(err);
            }

            if (!user) {
                // req.session.messages = info.message;
                console.log(info.message);
                return res.redirect('/');
            }

            req.logIn(user, function(err) {
                if (err) {
                    console.log(err);
                    return next(err);
                }
                console.log(user);
                req.session.messages = '';
                return res.redirect('/preferences');
            });
        })(req, res, next);
    });

    router.get('/logout', function(req, res) {
        req.logout();
        res.redirect('/');
    });
}

module.exports = function(_passport) {
    passport = _passport;

    // used to serialize the user for the session
    passport.serializeUser(function(user, done) {
        done(null, user.uid);
    });

    // used to deserialize the user
    passport.deserializeUser(function(uid, done) {
        UserModel.findOne({ uid: uid }, function(err, user) {
            done(err, user);
        });
    });

    passport.use(new(require('passport-cas').Strategy)({
        version: 'CAS1.0',
        ssoBaseURL: 'https://cas-test.univ-paris1.fr/cas',
        serverBaseURL: 'http://localhost:4000/'
    }, function(login, done) {
        UserModel.findOne({ uid: login }, function(err, user) {
            if (err) {
                console.log(err);
                return done(err);
            }
            if (!user) {
                console.log('Unknown user');
                return done(null, false, { message: 'Unknown user' });
            }
            return done(null, user);
        });
    }));

    routing();

    return router
};
