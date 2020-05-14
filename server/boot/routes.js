var debug = require('debug')('loopback:routing');

module.exports = function ( app ) {
	
	var router = app.loopback.Router();
	//var accessToken = app.models.accessToken;
	
	/*
	//
	// REDIRECTION NOW HANDLED ABOVE VIA DATABASE for easier modification
	//
	router.get( '/montageanleitungen', function ( req, res, next ) {
		res.redirect( '/#/pages/enovia/montageanleitungen' );
	} );
	
	router.get( '/konsi_anlieferinfo', function ( req, res, next ) {
		res.redirect( 'http://qcd480w02/konsi_anlieferinfo' );
	} );

	router.get( '/wifi', function ( req, res, next ) {
		res.redirect( 'https://idc091a253:8443/sponsorportal/PortalSetup.action?portal=cde47211-7641-11e4-92f8-0050569d1229' );
	} );


	router.get( '/wlan', function ( req, res, next ) {
		res.redirect( 'https://idc091a253:8443/sponsorportal/PortalSetup.action?portal=cde47211-7641-11e4-92f8-0050569d1229' );
	} );
	*/
	
	router.get( '/pdf', function ( req, res, next ) {

		if ( !req.query.file ) res.status( 404 ).send( 'PDF Not found!' );
		else {
			try {
				var connection = {
					host: 'qcd480a01',
					port: 21,
					user: 'USPHC\\COR089FTPMatrixOne',
					password: 'N3oOr@cle',
				};

				var Client = require( 'ftp' );

				var c = new Client();
				c.on( 'ready', function () {
					c.get( 'STORE/' + req.query.file, function ( err, stream ) {
						if ( err ) throw err;

						stream.once( 'close', () => c.end() );
						res.setHeader( 'content-type', 'application/pdf' );
						res.setHeader( 'X-Frame-Options', 'allow' );
						stream.pipe( res );
					} );
				} );

				c.connect( connection );
			} catch(e) {
				next();
			}
		}
	} );

	router.get('/auth/negotiate', ( req, res, next ) => {
		
		//req.accessToken = req.query.accessToken || req.query.access_token || req.headers.authorization;
		debug('!!!!!!===============> Hello from routing /auth/negotiate <============ !!!!!!!!!!!');
		
		debug("req.accessToken", req.accessToken);
	/*
		debug("req.access_token", req.access_token);
		debug("req.signedCookies", req.signedCookies);
	*/
		debug("req.user.username", req.user.username);
		//debug("req", req);
		
		
		var response = {};
		//response.access_token = req.signedCookies.access_token;
		response.access_token = req.accessToken.id;
		response.ttl = req.accessToken.ttl;
		response.id = req.user.id;
		debug('sending: ', response);
		res.json(response);
		//next();
	});
	

	router.get('/link/account', ( req, res, next ) => {
		debug('!!!!!!===============> Hello from routing /link/account <============ !!!!!!!!!!!');
		var userCredentialModel = app.models.userCredential;
		
		userCredentialModel.findOne( {where: { userId: req.accessToken.userId, provider: 'ldap'}}, ( err, user ) => {
		
				if ( err ){
					debug(err);
					return next( err );
				} 
				
				debug('user found: ', user);

				res.json( user.profile );
				
		});
		
	});

	app.use( router );
};
