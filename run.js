var server = require('./server/server');

process.on('SIGINT', function() {
    process.exit(0);
});