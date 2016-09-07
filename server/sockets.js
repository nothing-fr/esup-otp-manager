/**
 * Created by abousk01 on 07/09/2016.
 */
var io;
var sharedSession;
var sharedsession = require("express-socket.io-session");
var apiSockets = require('../client/sockets');

exports.attach = function(server){
    io = require('socket.io')({path: "/sockets"}).attach(server);
    io.use(sharedsession(sharedSession, {
        autoSave:true
    }));
    initialize();
};

exports.sharedSession = function(session){
    sharedSession = session;
};

function initialize(){
    io.on("connection", function(socket) {
        if(socket.handshake.session.passport){
            if(!socket.handshake.session.passport.user)socket.disconnect('Forbidden');
            apiSockets.userConnection(socket.handshake.session.passport.user.uid, socket.id);

            socket.on('disconnect', function () {
                apiSockets.userDisconnection(socket.id);
            })
        }
    });
}

exports.emit = function(socket, emit, data){
    io.to(socket).emit(emit, data);
};