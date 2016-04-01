var express = require('express');
var router = express.Router();
var mongoose = require(process.cwd() + '/controllers/mongoose');
var request = require('request');
var properties = require(process.cwd() + '/properties/properties');

var TwinBcrypt = require('twin-bcrypt');
var api_hash = TwinBcrypt.hashSync(properties.esup.secret_salt, TwinBcrypt.genSalt(12));
api_hash = api_hash.replace(/\//g, "%2F");

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

    router.get('/admin', function(req, res) {
        res.render('adminDashboard', { title: 'Esup Otp Manager : Admin' });
    });

    router.get('/login', function(req, res, next) {
        passport.authenticate('cas', function(err, user, info) {
            if (err) {
                console.log(err);
                return next(err);
            }

            if (!user) {
                console.log(info.message);
                return res.redirect('/');
            }

            req.logIn(user, function(err) {
                if (err) {
                    console.log(err);
                    return next(err);
                }
                req.session.messages = '';
                return res.redirect('/preferences');
            });
        })(req, res, next);
    });

    router.get('/logout', function(req, res) {
        req.logout();
        res.redirect('/');
    });

    //API
    router.get('/api/available_transports', function(req, res) {
        var user_hash;
        TwinBcrypt.hash(req.session.passport.user + properties.esup.salt, TwinBcrypt.genSalt(4), function(hash) {
            user_hash = hash.replace(/\//g, "%2F");
            request({
                'url': 'http://localhost:3000/available_transports/' + '/' + req.session.passport.user + '/' + user_hash
            }, function(error, response, body) {
                if (!error && response.statusCode == 200) {
                    res.send(body);
                } else res.send({
                    "code": "Error",
                    "message": error
                });
            });
        })
    });

    router.get('/api/activate_methods', function(req, res) {
        var user_hash;
        TwinBcrypt.hash(req.session.passport.user + properties.esup.salt, TwinBcrypt.genSalt(4), function(hash) {
            user_hash = hash.replace(/\//g, "%2F");
            request({
                'url': 'http://localhost:3000/activate_methods/' + req.session.passport.user + '/' + user_hash
            }, function(error, response, body) {
                if (!error && response.statusCode == 200) {
                    res.send(body);
                } else res.send({
                    "code": "Error",
                    "message": error
                });
            });
        })
    });

    router.get('/api/methods', function(req, res) {
        request({
            'url': 'http://localhost:3000/methods/' + api_hash
        }, function(error, response, body) {
            if (!error && response.statusCode == 200) {
                res.send(body);
            } else res.send({
                "code": "Error",
                "message": error
            });
        });
    });

    router.get('/api/generate/:method', function(req, res) {
        request({
            'url': 'http://localhost:3000/generate/' + req.params.method + '/' + req.session.passport.user + '/' + api_hash
        }, function(error, response, body) {
            if (!error && response.statusCode == 200) {
                res.send(body);
            } else res.send({
                "code": "Error",
                "message": error
            });
        });
    });

    router.get('/api/secret/:method', function(req, res) {
        request({
            'url': 'http://localhost:3000/secret/' + req.params.method + '/' + req.session.passport.user + '/' + api_hash
        }, function(error, response, body) {
            if (!error && response.statusCode == 200) {
                res.send(body);
            } else res.send({
                "code": "Error",
                "message": error
            });
        });
    });

    router.put('/api/:method/activate', function(req, res) {
        request({
            'method': 'PUT',
            'url': 'http://localhost:3000/activate/' + req.params.method + '/' + req.session.passport.user + '/' + api_hash
        }, function(error, response, body) {
            if (!error && response.statusCode == 200) {
                res.send(body);
            } else res.send({
                "code": "Error",
                "message": error
            });
        });
    });

    router.put('/api/:method/deactivate', function(req, res) {
        request({
            'method': 'PUT',
            'url': 'http://localhost:3000/deactivate/' + req.params.method + '/' + req.session.passport.user + '/' + api_hash
        }, function(error, response, body) {
            if (!error && response.statusCode == 200) {
                res.send(body);
            } else res.send({
                "code": "Error",
                "message": error
            });
        });
    });

    router.put('/api/transport/:transport/:new_transport', function(req, res) {
        request({
            'method': 'PUT',
            'url': 'http://localhost:3000/transport/' + req.params.transport + '/' + req.session.passport.user + '/' + req.params.new_transport + '/' + api_hash
        }, function(error, response, body) {
            if (!error && response.statusCode == 200) {
                res.send(body);
            } else res.send({
                "code": "Error",
                "message": error
            });
        });
    });

    router.get('/api/admin/user/:uid', function(req, res) {
        request({
            'url': 'http://localhost:3000/admin/user/' + req.params.uid + '/' + api_hash
        }, function(error, response, body) {
            if (!error && response.statusCode == 200) {
                res.send(body);
            } else res.send({
                "code": "Error",
                "message": error
            });
        });
    });

    router.put('/api/admin/:method/activate', function(req, res) {
        request({
            'method': 'PUT',
            'url': 'http://localhost:3000/admin/activate/' + req.params.method + '/' + api_hash
        }, function(error, response, body) {
            if (!error && response.statusCode == 200) {
                res.send(body);
            } else res.send({
                "code": "Error",
                "message": error
            });
        });
    });

    router.put('/api/admin/:method/deactivate', function(req, res) {
        request({
            'method': 'PUT',
            'url': 'http://localhost:3000/admin/deactivate/' + req.params.method + '/' + api_hash
        }, function(error, response, body) {
            if (!error && response.statusCode == 200) {
                res.send(body);
            } else res.send({
                "code": "Error",
                "message": error
            });
        });
    });

    router.put('/api/admin/:method/:transport/activate', function(req, res) {
        request({
            'method': 'PUT',
            'url': 'http://localhost:3000/admin/activate/' + req.params.method + '/' + req.params.transport + '/' + api_hash
        }, function(error, response, body) {
            if (!error && response.statusCode == 200) {
                res.send(body);
            } else res.send({
                "code": "Error",
                "message": error
            });
        });
    });

    router.put('/api/admin/:method/:transport/deactivate', function(req, res) {
        request({
            'method': 'PUT',
            'url': 'http://localhost:3000/admin/deactivate/' + req.params.method + '/' + req.params.transport + '/' + api_hash
        }, function(error, response, body) {
            if (!error && response.statusCode == 200) {
                res.send(body);
            } else res.send({
                "code": "Error",
                "message": error
            });
        });
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

    passport.use(new(require('passport-cas').Strategy)(properties.esup.CAS, function(login, done) {
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
