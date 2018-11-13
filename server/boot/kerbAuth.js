
module.exports = function ( app ) {
	
	const path = require( 'path' );

	app.middleware( 'auth:before', function ( req, res, next ) {
		
		var kerbAuthNeeded = true;

		if ( req.kerbUserId ) {
			kerbAuthNeeded = false;
			return next();
		} else {


			if ( req.headers.authorization ) {
				var authHeader = req.headers.authorization;

				if ( authHeader.lastIndexOf( 'Negotiate' ) >= 0 )
					kerbAuthNeeded = true;
				else
					kerbAuthNeeded = false;

			}

			// If req.isAuthenticated() is true, Kerberos Auth can be skipped, Loopback will handle req auth
			if ( req.isAuthenticated() ) {
				kerbAuthNeeded = false;
				return next();
			}

			// if there is a kerbUserId var in the request, Kerberos Auth can be skipped AD Auth will be able to do it's job
			if ( req.kerbUserId ) {
				kerbAuthNeeded = false;
				return next();
			}

			// If request is for static file from the  client directory, skip authentification
			if ( path.dirname( req.path ) === '/' ) {
				kerbAuthNeeded = false;
				return next();
			}

			if ( !kerbAuthNeeded ) {

				return next();

			} else {

				if ( !req.headers.authorization ) {
					// console.log( 'No Kerberos Ticket in header, no auth header present!');
					return res.status( 401 ).set( 'WWW-Authenticate', 'Negotiate' ).end();

				} else {

					req.authHeader = req.authHeader || {};
					req.authHeader.token = authHeader.substring( 'Negotiate '.length );

					var KerberosNative = require('kerberos').Kerberos;
					var kerberos = new KerberosNative();

					//cut phrase "Negotiate "
					var ticket = req.headers.authorization.substring( 10 );

					//init context
					kerberos.authGSSServerInit( "", function ( err, context ) {
						if ( err ) {
							console.error( 'ERROR: %O', err );
							console.log( 'context: %O', context );
							return next( err );
						}
						//check ticket
						kerberos.authGSSServerStep( context, ticket, function ( err ) {
							if ( err ) {
								console.error( 'ERROR: %O', err );
								console.log( 'ticket:  %O', ticket );
								console.log( 'context: %O', context );
								return next( err );
							}
							//in success context contains username
							var userid = context.username;
							userid = userid.replace( /@UK.PARKER.CORP/gi, "" );
							userid = userid.replace( /@US.PARKER.CORP/gi, "" );
							req.kerbUserId = userid;

							return next();
						} )
					} )
				}
			}
		}
	})
}
