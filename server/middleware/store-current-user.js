

var app 			= require('../server');
var UserIdentity 	= app.models.UserIdentity;

module.exports = function (options) {
	return function storeCurrentUser( req, res, next ) {
		var lbctx = require('loopback-context').getCurrentContext();

		if ( ! req.accessToken ) return next();

		UserIdentity.findOne({ where: { provider: 'ad', userId: req.accessToken.userId }}, function ( err, identity ) {

			if ( err ) return next( err );

			if ( !identity ) return next( new Error( 'No user with this access token was found.' ) );

			if (lbctx) {
				lbctx.set('currentUser', identity.profile.login);
				lbctx.set('currentUserProfile', identity.profile);
			} else {
				console.log('Loopback Context not available');
			}
			
			next();

		} );
	};
};