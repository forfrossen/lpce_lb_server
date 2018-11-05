module.exports = function ( app ) {

	const path = require( 'path' );
	
	app.middleware( 'initial:after', function ( req, res, next ) {
		var authHeader = req.get( 'authorization' );
		
		if ( !authHeader ) return next();
		
		if ( authHeader.lastIndexOf( 'Negotiate' ) >= 0 ) return next();
				
		console.log( 'Authentication but not Negotiate - find user for access token!' );

		User = app.models.user;

		User.findById( req.accessToken.userId, function ( err, user ) {
			if ( err ) {
				console.error( 'err: %O', err )
				return next( err );
			}
			else {
				req.kerbUserId = user.username.replace( 'ad.', '' );
				req.user = user;
				console.log( 'Found user, setting KerbuserId in req. ... user: %O', req.kerbUserId )
				//req.body.username = user.username;
				return next();
			}
		} );
	
	} )
	
	app.middleware( 'auth:before', function ( req, res, next ) {
		var kerbAuthNeeded = true;


		if ( req.kerbUserId ) {
			kerbAuthNeeded = false;
			return next();
		} else {


			if ( req.headers.authorization ) {
				var authHeader = req.headers.authorization;
				
				if ( authHeader.lastIndexOf( 'Negotiate' ) >= 0)
					kerbAuthNeeded = true;
				else
					kerbAuthNeeded = false;
				
			}
			
			/*if ( path.lastIndexOf( 'auth/ad' ) >= 0 ) {
				kerbAuthNeeded = true;
			}*/

			// If req.isAuthenticated() is true, Kerberos Auth can be skipped, Loopback will handle req auth
			if ( req.isAuthenticated() )
				kerbAuthNeeded = false;
			
			// if there is a kerbUserId var in the request, Kerberos Auth can be skipped AD Auth will be able to do it's job
			if ( req.kerbUserId ) 
				kerbAuthNeeded = false;			
			
			// If request is for static file from the  client directory, skip authentification
			if ( path.dirname( req.path ) === '/' ) {
				kerbAuthNeeded = false;
				return next();
			}
			
			
			//console.log( 'path.lastIndexOf( users/login ): ' + path.lastIndexOf( 'users/login' ) );
			//console.log( '\n\n\n HEADERS: %O', req.headers );
			


			if ( ! kerbAuthNeeded ){
			/*
				console.log( 'user already authenticated' )
				console.log( 'KerbAuthNeeded: ' + kerbAuthNeeded)
				console.log( 'req.kerbUserId: ' + req.kerbUserId )
				console.log( 'req.headers.authorization: ' + req.headers.authorization )
				console.log( 'req.isAuthenticated(): ' + req.isAuthenticated() )
			*/
				return next();
			
			} else {
				/*
				//console.log( 'req.headers.authorization: \n %O', req.headers.authorization );
				console.log( 'Kerbauthing now...' );
				console.log( authHeader );
				console.log( 'No Negotiate in authHeader: ' + authHeader.lastIndexOf( 'Negotiate' ) );
				*/
				if ( !req.headers.authorization ) {
					console.log( 'No Kerberos Ticket in header, no auth header present!');
					return res.status( 401 ).set( 'WWW-Authenticate', 'Negotiate' ).end();
					//return next();
					//return next( createError( 400, `Malformed authentication token ${authHeader}` ) );
				} else {
					
					req.authHeader = req.authHeader || {};
					req.authHeader.token = authHeader.substring( 'Negotiate '.length );

					var KerberosNative = require( 'kerberos' ).Kerberos;
					var kerberos = new KerberosNative();
			
					//cut phrase "Negotiate "
					var ticket = req.headers.authorization.substring( 10 );
		
					//init context
					kerberos.authGSSServerInit( "", function ( err, context ) {
						if ( err ) {
							console.error( 'ERROR: %O', err );
							console.log( 'context: %O',  context );
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
							//console.log( 'UserID: ' + userid );
							//console.log( 'req.isAuthenticated : ' + req.isAuthenticated() );
							return next();
						} )
					} )
				}
			}
			}
		}
		)
}