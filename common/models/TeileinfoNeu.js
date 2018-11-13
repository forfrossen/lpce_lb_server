var LoopBackContext = require( 'loopback-context' );

module.exports = function ( TeileinfoNeu ) {

	TeileinfoNeu.validatesPresenceOf( 'zeichnungsnummer', 'litm', 'teileinfoAllg' );
	TeileinfoNeu.validatesDateOf( 'dateAllg', { allowNull: true, message: 'dateAllg kein DATUM!' } );
	TeileinfoNeu.validatesDateOf( 'dateSek', { allowNull: true, message: 'dateSek kein DATUM!' } );
	
	
	//TeileinfoNeu.validatesNumericalityOf('zeichnungsnummer', {int: true});


	TeileinfoNeu.observe('access', function(ctx, next) {
		const token = ctx.options && ctx.options.accessToken;
		const userId = token && token.userId;
		const user = userId ? 'user#' + userId : '<anonymous>';

		const modelName = ctx.Model.modelName;
		const scope = ctx.where ? JSON.stringify(ctx.where) : '<all records>';
		console.log( '%s: %s accessed %s: %s', new Date(), user, modelName, scope );

		
		var lbctx = LoopBackContext.getCurrentContext();
		var currentUser = lbctx && lbctx.get('currentUser');
		console.log('currentUser.username: ', currentUser.username); // voila!


		return next();
 	});
	
	TeileinfoNeu.beforeRemote( '**', function ( ctx, user, next ) {
		console.log( ctx.methodString, 'was invoked remotely '); // customers.prototype.save was invoked remotely
		return next();
	});


	TeileinfoNeu.observe( 'before save', function ( ctx, next  ) {
		var lbctx = LoopBackContext.getCurrentContext();
		var currentUser = lbctx && lbctx.get( 'currentUser' );

		// Null the fields if they are ''
		ctx.instance.dateAllg = ( ctx.instance.dateAllg === '' ) ? null : ctx.instance.dateAllg;
		ctx.instance.dateSek = ( ctx.instance.dateSek === '' ) ? null : ctx.instance.dateSek;
		ctx.instance.teileinfoAllg = ( ctx.instance.teileinfoAllg === '' ) ? null : ctx.instance.teileinfoAllg;
		ctx.instance.teileinfoSek = ( ctx.instance.teileinfoSek === '' ) ? null : ctx.instance.teileinfoSek;

		if ( ctx.isNewInstance ) {

			// Set created date an created by for new records
			ctx.instance.created = new Date();
			ctx.instance[ 'created by' ] = currentUser;
			


			// If dateAllg is empty but teileinfoAllg is not, set dateAllg to now
			if ( ctx.instance[ 'dateAllg' ] === '' || ctx.instance[ 'dateAllg' ] === null )
				ctx.instance[ 'dateAllg' ] = ( ctx.instance[ 'teileinfoAllg' ] === null ) ? null : new Date();
			
				// If dateSek is empty but teileinfoSek is not, set dateSek to now
			if ( ctx.instance[ 'dateSek' ] === '' || ctx.instance[ 'dateSek' ] === null )
				ctx.instance[ 'dateSek' ] = ( ctx.instance[ 'teileinfoSek' ] === null ) ? null : new Date();

		} else {
			ctx.instance.modified = new Date();

			// If dateAllg is empty but teileinfoAllg is not, set dateAllg to now
			if ( ctx.instance[ 'dateAllg' ] === '' || ctx.instance[ 'dateAllg' ] === null )
				ctx.instance[ 'dateAllg' ] = ( ctx.instance[ 'teileinfoAllg' ] === null ) ? null : new Date();
			
				// If dateSek is empty but teileinfoSek is not, set dateSek to now
			if ( ctx.instance[ 'dateSek' ] === '' || ctx.instance[ 'dateSek' ] === null )
				ctx.instance[ 'dateSek' ] = ( ctx.instance[ 'teileinfoSek' ] === null ) ? null : new Date();
		}

		//if ( ctx.instance.dateAllg )
			
			console.log( 'DateAllg: ' + ctx.instance.dateAllg );

		console.log( '\n> before save triggered:', ctx.Model.modelName, ctx.instance || ctx.data );
		return next();
	} );


	// model operation hook
	TeileinfoNeu.observe( 'before save', function ( ctx, next ) {
		if ( ctx.instance ) {
			console.log( '\n\nAbout to save a TeileinfoNeu instance:', ctx.instance );
		} else {
			console.log( '\n\nAbout to update TeileinfoNeu that match the query %j:', ctx.where );
		}
		return next();
	} );

	TeileinfoNeu.observe( 'after save', function ( ctx, next ) {
		console.log( '\n> after save triggered:', ctx.Model.modelName, ctx.instance );
		return next();
	} );
};
