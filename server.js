process.env.NODE_ENV = process.env.NODE_ENV || 'development';

var config = require('./config/config');
var express = require('./config/express');
var mongoose = require('./config/mongoose');
var passport = require('./config/passport');
var https = require('https');
var fs = require('fs');
var key = fs.readFileSync(config.sslKey);
var cert = fs.readFileSync(config.sslCert);
var ca = fs.readFileSync(config.sslCA);

var https_options = {
    key: key,
    cert: cert,
    ca: ca
};

var db = mongoose(),
    passport = passport(),
    app = express(),
    appPort = config.appPort;

module.exports = app;

//Start Server listening on configured app port
https.createServer(https_options, app).listen(appPort);
console.log("Sever Listening on Port: " + appPort);
