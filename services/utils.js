var properties = require(process.cwd() + '/properties/properties');
var CryptoJS = require('crypto-js');

exports.get_hash = function(uid) {
    return CryptoJS.SHA256(CryptoJS.MD5(properties.esup.users_secret).toString()+uid).toString();
}

exports.is_admin = function(uid){
	var result = false;
	for(name in properties.esup.admins){
		if(properties.esup.admins[name]==uid)result=true;
	}
	return result;
}

exports.is_manager = function(uid){
	var result = false;
	for(name in properties.esup.managers){
		if(properties.esup.managers[name]==uid)result=true;
	}
	return result;
}