module.exports = function ( app ) {

	var router = app.loopback.Router();

	router.get( '/montageanleitungen', function ( req, res, next ) {
		res.redirect( '/#/pages/enovia/montageanleitungen' );
	} );
	

	router.get( '/wifi', function ( req, res, next ) {
		res.redirect( 'https://idc091a253:8443/sponsorportal/PortalSetup.action?portal=cde47211-7641-11e4-92f8-0050569d1229' );
	} );


	router.get( '/wlan', function ( req, res, next ) {
		res.redirect( 'https://idc091a253:8443/sponsorportal/PortalSetup.action?portal=cde47211-7641-11e4-92f8-0050569d1229' );
	} );

	router.get( '/pdf', function ( req, res, next ) {

		if ( !req.query.file ) res.status( 404 ).send( 'PDF Not found!' );
		else {
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

					stream.once( 'close', function () {
						c.end();
					} );
					res.setHeader( 'content-type', 'application/pdf' );
					res.setHeader( 'X-Frame-Options', 'allow' );
					stream.pipe( res );
				} );
			} );

			c.connect( connection );
		}
	} );

	app.use( router );
};
