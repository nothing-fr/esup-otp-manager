var express = require('express');
var router = express.Router();
var request = require('request');
var properties = require(process.cwd() + '/properties/properties');
var utils = require(process.cwd() + '/services/utils');

var passport;

function requesting(req, res, opts) {
    console.log("requesting api");
    console.log(opts.method +':'+ opts.url);
    console.log(req.session.passport);
    request(opts, function(error, response, body) {
        if (!error && response.statusCode == 200) {
            res.send(body);
        } else res.send({
            "code": "Error",
            "message": error
        });
    });
}

function isAuthenticated(req, res) {
    if (req.session.passport) {
        if (req.session.passport.user) {
            return true;
        }
    }
    return false;
}

function isUser(req, res, next) {
    if (isAuthenticated(req, res)) return next();
    res.redirect('/login');
}

function isManager(req, res, next) {
    if (isAuthenticated(req, res)) {
        if (utils.is_manager(req.session.passport.user.uid) || utils.is_admin(req.session.passport.user.uid))return next();
        res.redirect('/forbidden');
    }
    res.redirect('/login');
}

function isAdmin(req, res, next) {
    if (isAuthenticated(req, res)) {
        if(utils.is_admin(req.session.passport.user.uid))return next();
        res.redirect('/forbidden');
    }
    res.redirect('/login');
}

function routing() {
    router.get('/', function(req, res) {
        res.render('index', {
            title: 'Esup Otp Manager'
        });
    });

    router.get('/forbidden', isUser, function(req, res) {
        res.render('forbidden', {
            title: 'Esup Otp Manager',
            user: req.session.passport.user
        });
    });

    router.get('/preferences', isUser, function(req, res) {
        console.log(req.session.passport.user);
        res.render('dashboard', {
            title: 'Esup Otp Manager : Preferences',
            user: req.session.passport.user
        });
    });

    router.get('/admin', isAdmin, function(req, res) {
        res.render('adminDashboard', {
            title: 'Esup Otp Manager : Admin',
            user: req.session.passport.user
        });
    });

    router.get('/manager', isManager, function(req, res) {
        res.render('managerDashboard', {
            title: 'Esup Otp Manager : Manager',
            user: req.session.passport.user
        });
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
    router.get('/api/user', isUser, function(req, res) {
        var opts = {};
        opts.url = properties.esup.api_url+'user/' + req.session.passport.user.uid + '/' + utils.get_hash(req.session.passport.user.uid);
        requesting(req, res, opts);
    });

    router.get('/api/transport/:transport/test', isUser, function(req, res) {
        var opts = {};
        opts.url = properties.esup.api_url+'protected/user/' + req.session.passport.user.uid + '/transport/'+ req.params.transport+'/test/'+ properties.esup.api_password;
        requesting(req, res, opts);
    });

    router.get('/api/methods', isUser, function(req, res) {
        var opts = {};
        opts.url = properties.esup.api_url+'protected/method/' + properties.esup.api_password
        requesting(req, res, opts);
    });

    router.get('/api/secret/:method', isUser, function(req, res) {
        var opts = {};
        opts.url = properties.esup.api_url+'protected/user/'+req.session.passport.user.uid+'/method/'+req.params.method+'/secret/'+ properties.esup.api_password;
        requesting(req, res, opts);
    });

    router.put('/api/:method/activate', isUser, function(req, res) {
        var opts = {};
        opts.method = 'PUT';
        opts.url = properties.esup.api_url+'protected/user/'+req.session.passport.user.uid+'/method/'+req.params.method+'/activate/'+ properties.esup.api_password;
        requesting(req, res, opts);
    });

    router.put('/api/:method/deactivate', isUser, function(req, res) {
        var opts = {};
        opts.method = 'PUT';
        opts.url = properties.esup.api_url+'protected/user/'+req.session.passport.user.uid+'/method/'+req.params.method+'/deactivate/'+ properties.esup.api_password;
        requesting(req, res, opts);
    });

    router.put('/api/transport/:transport/:new_transport', isUser, function(req, res) {
        var opts = {};
        opts.method = 'PUT';
        opts.url = properties.esup.api_url+'protected/user/'+req.session.passport.user.uid+'/transport/'+req.params.transport+'/'+req.params.new_transport+'/'+ properties.esup.api_password;
        requesting(req, res, opts);
    });

    router.post('/api/generate/:method', isUser, function(req, res) {
        var opts = {};
        opts.method = 'POST';
        opts.url = properties.esup.api_url+'protected/user/'+ req.session.passport.user.uid + '/method/' + req.params.method + '/secret/'  + properties.esup.api_password;
        requesting(req, res, opts);
    });

    router.get('/api/admin/user/:uid', isManager, function(req, res) {
        var opts = {};
        opts.url = properties.esup.api_url+'protected/admin/user/' + req.params.uid + '/' + properties.esup.api_password;
        requesting(req, res, opts);
    });

    router.put('/api/admin/:uid/:method/activate', isManager, function(req, res) {
        var opts = {};
        opts.method = 'PUT';
        opts.url = properties.esup.api_url+'protected/user/'+ req.params.uid + '/method/' + req.params.method + '/activate/'  + properties.esup.api_password;
        requesting(req, res, opts);
    });

    router.put('/api/admin/:uid/:method/deactivate', isManager, function(req, res) {
        var opts = {};
        opts.method = 'PUT';
        opts.url = properties.esup.api_url+'protected/user/'+ req.params.uid + '/method/' + req.params.method + '/deactivate/'  + properties.esup.api_password;
        requesting(req, res, opts);
    });

    router.put('/api/admin/:method/activate', isAdmin, function(req, res) {
        var opts = {};
        opts.method = 'PUT';
        opts.url = properties.esup.api_url+'protected/admin/method/' + req.params.method + '/activate/'  + properties.esup.api_password;
        requesting(req, res, opts);
    });

    router.put('/api/admin/:method/deactivate', isAdmin, function(req, res) {
        var opts = {};
        opts.method = 'PUT';
        opts.url = properties.esup.api_url+'protected/admin/method/' + req.params.method + '/deactivate/'  + properties.esup.api_password;
        requesting(req, res, opts);
    });

    router.put('/api/admin/:method/transport/:transport/activate', isAdmin, function(req, res) {
        var opts = {};
        opts.method = 'PUT';
        opts.url = properties.esup.api_url+'protected/admin/method/' + req.params.method + '/transport/'+req.params.transport+'/activate/'  + properties.esup.api_password;
        requesting(req, res, opts);
    });

    router.put('/api/admin/:method/transport/:transport/deactivate', isAdmin, function(req, res) {
        var opts = {};
        opts.method = 'PUT';
        opts.url = properties.esup.api_url+'protected/admin/method/' + req.params.method + '/transport/'+req.params.transport+'/deactivate/'  + properties.esup.api_password;
        requesting(req, res, opts);
    });

    router.post('/api/admin/generate/:method/:uid', isManager, function(req, res) {
        var opts = {};
        opts.method = 'POST';
        opts.url = properties.esup.api_url+'protected/user/'+ req.params.uid + '/method/' + req.params.method + '/secret/'  + properties.esup.api_password;
        requesting(req, res, opts);
    });

    router.delete('/api/admin/delete_method_secret/:method/:uid', isManager, function(req, res) {
        var opts = {};
        opts.method = 'DELETE';
        opts.url = properties.esup.api_url+'protected/admin/user/'+req.params.uid +'/method/' + req.params.method+ '/secret/' + properties.esup.api_password;
        requesting(req, res, opts);
    });
}

module.exports = function(_passport) {
    passport = _passport;

    // used to serialize the user for the session
    passport.serializeUser(function(user, done) {
        var _user = {};
        _user.uid=user.uid;
        if(utils.is_admin(user.uid))_user.role="admin";
        else if(utils.is_manager(user.uid))_user.role="manager";
        else _user.role="user";
        done(null, _user);
    });

    // used to deserialize the user
    passport.deserializeUser(function(user, done) {
            done(null, user);
    });

    passport.use(new(require('passport-cas').Strategy)(properties.esup.CAS, function(login, done) {
        return done(null, {uid:login});
    }));

    routing();

    return router
};
