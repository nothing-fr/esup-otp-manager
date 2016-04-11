var properties = require(process.cwd() + '/properties/properties');
var CryptoJS = require('crypto-js');

exports.get_hash = function(uid) {
    return CryptoJS.SHA256(CryptoJS.MD5(properties.esup.users_secret).toString()+uid).toString();
}