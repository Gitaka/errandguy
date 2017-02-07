process.env.NODE_ENV = process.env.NODE_ENV || 'development';

var express = require('./config/express');
var mongoose = require('./config/mongoose');

var db = mongoose();
var app = express()

var port = process.env.PORT || 1337;

app.listen(port,function(){
	console.log('Server running at:'+port+'/');
});