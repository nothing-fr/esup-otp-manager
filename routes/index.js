var express = require('express');
var router = express.Router();
var mongoose = require(process.cwd() + '/controllers/mongoose');
// var passport = require('passport');

var UserModel;

mongoose.initialize(function() {
    UserModel = mongoose.UserModel;
});

// passport.use(new(require('passport-cas').Strategy)({
//     version: 'CAS3.0',
//     ssoBaseURL: 'https://tequila:8443/cas',
//     serverBaseURL: 'https://tequila:4443/'
// }, function(login, done) {
//     UserModel.findOne({ uid: login }, function(err, user) {
//         if (err) {
//         	console.log(err);
//             return done(err);
//         }
//         if (!user) {
//         	console.log('Unknown user');
//             return done(null, false, { message: 'Unknown user' });
//         }
//         user.attributes = profile.attributes;
//         console.log(user);
//         return done(null, user);
//     });
// }));


router.get('/', function(req, res) {
    res.render('index', { title: 'Esup Otp Manager' });
});

router.get('/preferences', function(req, res) {
    res.render('dashboard', { title: 'Esup Otp Manager : Preferences' });
});

// router.get('/login', function(req, res, next) {
//     passport.authenticate('cas', function(err, user, info) {
//         if (err) {
//             console.log(err);
//             return next(err);
//         }

//         if (!user) {
//             // req.session.messages = info.message;
//             console.log(info.message);
//             return res.redirect('/');
//         }

//         req.logIn(user, function(err) {
//             if (err) {
//             	console.log(err);
//                 return next(err);
//             }
//             console.log(user);
//             req.session.messages = '';
//             return res.redirect('/preferences');
//         });
//     })(req, res, next);
// });

module.exports = router;
