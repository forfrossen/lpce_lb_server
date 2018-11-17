module.exports = function (options) {
	return function storeCurrentUser( req, res, next ) {
		
		if ( !req.accessToken ) {
			return next();
		}

		var app = require('../server');
		var UserIdentity = app.models.UserIdentity;
        var loopbackContext = require('loopback-context').getCurrentContext();

		UserIdentity.findOne( {
			where: {
				provider: 'ad',
				userId: req.accessToken.userId,
			}
		}, function ( err, identity ) {
			if ( err ) return next( err );
			if ( !identity ) return next( new Error( 'No user with this access token was found.' ) );
			
			loopbackContext.set( 'currentUser', identity.externalId );

			next();
		} );
	};
};