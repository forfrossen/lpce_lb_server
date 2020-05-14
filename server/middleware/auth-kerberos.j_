var debug = require('debug')('loopback:security:kerbAuth');

module.exports = function () {  
	return function ( req, res, next ) {
		var lbctx = require('loopback-context').getCurrentContext({ bind: true });
		
		debug( 'KerbAuth Called' );
		debug( 'req.kerbUserId : %O', req.kerbUserId  );
		debug( 'req.headers.authorization: %O',  req.headers.authorization);
		debug( 'req.isAuthenticated(): %O', req.isAuthenticated() );
		debug( 'req.accessToken: %O',  req.accessToken);
		debug( 'req.user: %O',  req.user);
		//return next();


		const path = require( 'path' );
		var kerbAuthNeeded = true;
		
		if ( req.accessToken ) {
			kerbAuthNeeded = false;
			return next();
		}
		//else 
		//	debug( 'No Token! Req: %O', req.headers.authorization );	

		if ( req.kerbUserId ) {
			kerbAuthNeeded = false;
			return next();
		} else {
			if ( req.headers.authorization ) {
				var authHeader = req.headers.authorization;

				if ( authHeader.lastIndexOf( 'Negotiate' ) >= 0 )
					kerbAuthNeeded = true;
				else {
					//req.accessToken = {};
					//req.accessToken.id = req.headers.authorization;
					kerbAuthNeeded = false;
					return next();
				}

			}

			// If req.isAuthenticated() is true, Kerberos Auth can be skipped, Loopback will handle req auth
			if ( req.isAuthenticated() ) {
				debug('Skipping Kerberos Auth, isAuthenticated=true!');
				//req.kerbUserId = req.user.username.replace('ad.', '');
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
			//debug('req.path.includes(assets): ' + req.path.includes('assets'))
			// If request is for static file from the  client directory, skip authentification
			if ( req.path.includes('assets')) {
				kerbAuthNeeded = false;
				return next();
			}
			
			if ( req.path.includes('explorer')) {
				kerbAuthNeeded = false;
				return next();
			}

			if ( req.path.includes('negotiate')) {
				kerbAuthNeeded = false;
				return next();
			}
			
			debug( 'XXXXXXXXXXXXXXXXXXXXXXXXXXXXX' + kerbAuthNeeded);	

			if ( !kerbAuthNeeded ) {
				debug( 'XXXXXXXXXXXXXXXXXXXXXXXXXXXXX' + kerbAuthNeeded);	
				return next();
			} else {

				if ( !req.headers.authorization ) {
					// debug( 'No Kerberos Ticket in header, no auth header present!');
					return res.status( 401 ).set( 'WWW-Authenticate', 'Negotiate' ).end();

				} else {
					debug( '=X=' );
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
							debug( 'server.step RESPONSE: %O', serverResponse );
							debug( 'server.username: ', server.username )
							var userid = server.username ;
							userid = userid.replace( /@UK.PARKER.CORP/gi, "" );
							userid = userid.replace( /@US.PARKER.CORP/gi, "" );
							req.kerbUserId = userid;
							req.headers['x-iisnode-logon_user'] = 'UKPHC\\' + userid;
							return next();
						});
					});
		
				} 
			} 
		}
	}
}


