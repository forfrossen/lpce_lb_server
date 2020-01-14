var debug = require('debug')('loopback:middleware:store-current-user');

var app 			= require('../server');
var UserIdentity 	= app.models.UserIdentity;

module.exports = function (options) {
	return function storeCurrentUser( req, res, next ) {
		var lbctx = require('loopback-context').getCurrentContext();
		debug('Hello from store-current-user');
		
		if ( ! req.accessToken ){
			debug('no access token found:', req.accessToken)
			return next();
		} 

		UserIdentity.findOne({ where: { provider: 'ldap', userId: req.accessToken.userId }}, function ( err, identity ) {

			if ( err ){
				debug( err );
				return next( err );
			} 

			if ( !identity ) {
				debug('No identity found!')
				return next( new Error( 'No user with this access token was found.' ) );
			}

			req.kerbUserId = identity.profile.id;
			
			if (lbctx) {
				lbctx.set('currentUser', identity.profile.id);
				lbctx.set('currentUserProfile', identity.profile);
			} else {
				console.log('Loopback Context not available');
			}
			
			next();

		} );
	};
};