/**
 * Created by abousk01 on 07/09/2016.
 */
var properties = require(__dirname+'/../properties/properties');

var apiSockets = require("socket.io-client").connect(properties.esup.api_url, {reconnect: true, path: "/sockets",query: 'secret='+properties.esup.api_password+'&app=manager'});
var sockets = require('../server/sockets');
var users = {};

apiSockets.on('connect', function () {
    console.log("Api Sockets connected");
});

apiSockets.on('userUpdate', function (data) {
    if(users[data.uid])sockets.emit(users[data.uid], 'userUpdate');
});

exports.userConnection = function(uid, idSocket){
    users[uid]=idSocket;
};

exports.userDisconnection = function(idSocket){
    for(user in users){
        if(users[user]==idSocket)delete users[user];
    }
};

exports.emit = function(emit, data){
    apiSockets.emit(emit, data);
};