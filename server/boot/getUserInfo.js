var debug = require('debug')('loopback:getUserInfo');

module.exports = function ( app ) {
	app.remotes().phases
		.addBefore( 'invoke', 'options-from-request' )
		.use( function ( ctx, next ) {
			debug('Hello from getUserInfo');

			if ( ! ctx.args.options ) {
				debug('No ctx.args.options: ', ctx.args.options)
				return next();
			}
			if ( ! ctx.args.options.accessToken ) {
				debug('No Token available! ctx.args.options:', ctx.args.options)
				return next();
			}
			const User = app.models.User;
			User.findById( ctx.args.options.accessToken.userId, function ( err, user ) {
				if ( err ){
					debug(err);
					return next( err );
				} 
				debug('user found: ', user.username)
				ctx.args.options.currentUser = user;
				
				next();
			} );
		} );
};