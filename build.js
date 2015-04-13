#!/usr/bin/env node

var path = require('path');

var NwBuilder = require('node-webkit-builder');
var nw = new NwBuilder({
	files		: path.join( __dirname, '**' ), // use the glob format 
	platforms	: ['osx64', 'win32', 'win64'],
	macIcns		: path.join( __dirname, 'assets', 'macIcons.icns'),
//	winIco		: path.join( __dirname, 'assets', 'winIcons.ico'),
	macCredits	: path.join( __dirname, 'assets', 'credits.html')
});
 
nw.on('log',  console.log);
 
nw
	.build()
	.then(function () {
		console.log('Done!');
	})
	.catch(function (error) {
    	console.error(error);
	});