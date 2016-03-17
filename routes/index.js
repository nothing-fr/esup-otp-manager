var express = require('express');
var router = express.Router();
var CASAuthentication = require('cas-authentication');
var mongoose = require(process.cwd() + '/controllers/mongoose');
var UserModel;

mongoose.initialize(function(){
	UserModel = mongoose.UserModel;
});

var cas = new CASAuthentication({
    cas_url     : 'https://tequila:8443/cas',
    service_url : 'https://tequila:4443'
});

/* GET home page. */
router.get('/', cas.bounce, function(req, res, next) {
    res.render('index', { title: 'Express' });
});

// Unauthenticated clients will receive a 401 Unauthorized response instead of 
// the JSON data. 
router.get( '/preferences', cas.block, function ( req, res ) {
    res.render('preferences', { title: 'Preferences' });
});
 
// An example of accessing the CAS user session variable. This could be used to 
// retrieve your own local user records based on authenticated CAS username. 
router.get( '/admin', cas.block, function ( req, res ) {
    res.render('preferences', { title: 'Administration' });
});
 
// This route will de-authenticate the client with the Express server and then 
// redirect the client to the CAS logout page. 
router.get( '/logout', cas.logout );

module.exports = router;
