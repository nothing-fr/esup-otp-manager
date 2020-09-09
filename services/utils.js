var properties = require(__dirname+'/../properties/properties');
var CryptoJS = require('crypto-js');

exports.get_hash = function(uid) {
    var d = new Date();
    var present_salt = d.getUTCDate()+d.getUTCHours().toString();
    console.log("present-salt for "+uid+": "+present_salt);
    present_hash = CryptoJS.SHA256(CryptoJS.MD5(properties.esup.users_secret).toString()+uid+present_salt).toString();  
    return present_hash;
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
