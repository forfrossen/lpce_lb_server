module.exports = function ( app ) {
	app.remotes().phases
		.addBefore( 'invoke', 'options-from-request' )
		.use( function ( ctx, next ) {
			if ( ! ctx.args.options ) {
				//console.log('ctx.args.options: %O', ctx.args.options)
				return next();
			}
			if ( ! ctx.args.options.accessToken ) {
				//console.log('ctx.args.options: %O', ctx.args.options)
				return next();
			}
			const User = app.models.User;
			User.findById( ctx.args.options.accessToken.userId, function ( err, user ) {
				if ( err ) return next( err );
				ctx.args.options.currentUser = user;
				next();
			} );
		} );
};