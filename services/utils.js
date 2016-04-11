var properties = require(process.cwd() + '/properties/properties');
var speakeasy = require('speakeasy');
var CryptoJS = require("crypto-js");

exports.get_api_password = function(){
    return CryptoJS.MD5(speakeasy.totp({secret: properties.esup.api_secret.base32,encoding: 'base32'})).toString();
}
