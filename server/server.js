#!/usr/bin/env node
'use strict';
require('cls-hooked');
process.env.JWT_SECRET = 'ts/Yx!cMhrFw~QwAX3$a#Xgx$*S7jR]A';
process.env.cookieSecret = 'ts/Yx!cMhrFw~QwAX3$a#Xgx$*S7jR]A';
//process.env.DEBUG = 'loopback:user,loopback:security:*';
//process.env.DEBUG = '*';


var loopback = require( 'loopback' );
var boot = require( 'loopback-boot' );
var bodyParser = require( 'body-parser' );
var flash = require( 'express-flash' );
var errorHandler = require('strong-error-handler');
var app = module.exports = loopback();
app.set( 'trust proxy', [ 'loopback', '172.18.104.0/23' ] ); 

//var uuid = require('uuid/v4');
//var cookieParser = require( 'cookie-parser' );
//var session = require( 'express-session' );
//var FileStore = require('session-file-store')(session);
//var dataSource = app.dataSources.qcd480JDE;

/*
app.use(errorHandler({
	debug: app.get('env') === 'development',
	log: true,
  }));
*/

// Bootstrap the application, configure models, datasources and middleware.
// Sub-apps like REST API are mounted via boot scripts.
boot( app, __dirname, function ( err ) {
	if (err) throw err;


	// start the server if `$ node server.js`
	if ( require.main === module )
		app.start();
} );
/*
app.middleware( 'initial', ( req, res, User ) => {
	var reqUrl = req.url;
	if ( reqUrl.lastIndexOf( 'users/login/' ) ) {
		User. findById( req.accessToken, function ( err, user ) {
			if ( err ) return res.sendStatus( 404 );
			req.kerbUserId = user;
		} );
	}
})
*/		
/*
app.middleware('initial:before', (req, res, next) => {
	console.time( 'Call Time' );
	
	return next();
} )
*/



app.middleware( 'initial:before', loopback.token( { model: app.models.accessToken } ) );
app.middleware( 'parse', bodyParser.json() );
app.middleware( 'parse', bodyParser.urlencoded( { extended: true } ) );

//app.middleware( 'auth', loopback.token( { model: app.models.accessToken } ) );


/*
app.middleware( 'session:before', cookieParser( process.env.JWT_SECRET ) );
app.middleware( 'session', session( {
	genid: (req) => {
		return uuid(); // use UUIDs for session IDs
	},
	store: new FileStore({path: '/var/www/node/express-server/sessions/'}),
	secret: process.env.JWT_SECRET,
	maxAge: 3600,
	resave: false,
	saveUninitialized: true
} ) );
*/
/*
app.middleware('initial:after', function ( req, res, next ) {

	console.log( '\n\n\n===========================================================================' );
	//console.log( 'Session Secret: ' + process.env.JWT_SECRET );
	console.log( 'Request received: ', Date.now() );
	console.log( 'Req.User: ', req.user );
	console.log( 'Req.kerbUserId: ', req.kerbUserId );
	//console.log( 'req.headers.authorization: ', req.headers.authorization );
	//console.log( 'Req.headers: ', req.headers );
	//console.log( 'Session: %O', req.session );
	console.log( 'Token : %O', req.accessToken );
	console.log( 'Reqest Method: ' + req.method + ' - Request Url: ' + req.url );
	//console.log( 'Reqest Cookies: %O', req.cookies );
	//console.log( 'Reqest signedCookies: %O', req.signedCookies );
	//console.log( 'User from Session: ', req.session.authenticatedPrincipal );
	console.log( '===========================================================================\n\n\n' );
	return next();
} );
*/
/*
app.middleware('routes:after', function ( req, res, next ) {

	console.log( '===========================================================================' );
	console.log( 'RES to send: %O ', res );
	console.log( '===========================================================================' );
	return next();

} );
*//*
app.use ( (req, res, next ) => {

	console.log( 'Reqest Method: ' + req.method + ' - Request Url: ' + req.url );
	//console.timeEnd( 'Call Time' );
	
	return next();
} )
*/
// We need flash messages to see passport errors
app.use( flash() );

app.start = function () {
	// start the web server
	return app.listen( function () {
		app.emit( 'started' );
		var baseUrl = app.get( 'url' ).replace( /\/$/, '' );
		console.log( 'Web server listening at: %s', baseUrl );
		if ( app.get( 'loopback-component-explorer' ) ) {
			console.log( '\n\nServer running in mode: %O', process.env.NODE_ENV );
			var explorerPath = app.get( 'loopback-component-explorer' ).mountPath;
			console.log( 'Browse your REST API at %s%s\n', baseUrl, explorerPath );
			console.log( '=====================================================================');
			console.log( '\n\n\n');
		}
	} );
};
