module.exports = function () {  
	return function ( req, res, next ) {
		
		const path = require( 'path' );
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
			//console.log('req.path.includes(assets): ' + req.path.includes('assets'))
			// If request is for static file from the  client directory, skip authentification
			if ( req.path.includes('assets')) {
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

					//cut phrase "Negotiate "
					var ticket = req.headers.authorization.substring( 10 );
					
					var kerberos = require( 'kerberos' );
					const service = `HTTP@qcd480w04.uk.parker.corp`;

					kerberos.initializeServer( service, ( err, server ) => {
						if ( err ) {
							console.error( 'initializeServer ERROR: %O', err );
							return next( err );
						}								
						server.step(ticket, (err, serverResponse) => {
							if ( err ) {
								console.error( 'server.step ERROR: %O', err );
								return next( err );
							}
							//console.log( 'server.step RESPONSE: %O', serverResponse );
							//console.log( 'server.username: ', server.username )
							var userid = server.username ;
							userid = userid.replace( /@UK.PARKER.CORP/gi, "" );
							userid = userid.replace( /@US.PARKER.CORP/gi, "" );
							req.kerbUserId = userid;
							return next();
						});
					});
		
				} 
			} 
		}
	}
}


