var server = require(process.cwd() + '/server/server');

process.on('SIGINT', function() {
    process.exit(0);
});