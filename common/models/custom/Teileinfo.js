var LoopBackContext = require( 'loopback-context' );
var debug = require('debug')('loopback:models:Teileinfo');

module.exports = function ( Teileinfo ) {

	Teileinfo.validatesPresenceOf( 'zeichnungsnummer', 'litm', 'teileinfoAllg' );
	Teileinfo.validatesDateOf( 'dateAllg', { allowNull: true, message: 'dateAllg kein DATUM!' } );
	Teileinfo.validatesDateOf( 'dateSek', { allowNull: true, message: 'dateSek kein DATUM!' } );
	
	
	//Teileinfo.validatesNumericalityOf('zeichnungsnummer', {int: true});

/*
	Teileinfo.observe('access', function(ctx, next) {
		
		const token = ctx.options && ctx.options.accessToken;
		const userId = token && token.userId;
		const user = userId ? 'user#' + userId : '<anonymous>';

		const modelName = ctx.Model.modelName;
		const scope = ctx.where ? JSON.stringify(ctx.where) : '<all records>';
		debug( '%s: %s accessed %s: %s', new Date(), user, modelName, scope );
		


		//var lbctx = LoopBackContext.getCurrentContext();
		//var currentUser = lbctx && lbctx.get( 'currentUser' );
		
		var currentUser = ctx.options.currentUser.username;
		
		if ( currentUser ) {
			debug( 'currentUser: %O', currentUser ); // voila!
		}

		return next();
 	});
*/

	Teileinfo.beforeRemote( '**', function ( ctx, user, next ) {
		debug( ctx.methodString, 'was invoked remotely '); // customers.prototype.save was invoked remotely
		return next();
	});


	Teileinfo.observe( 'before save', function ( ctx, next  ) {

		var currentUser = ctx.options.currentUser.username;
		debug( 'About to save following insance: %O', ctx.instance );

		// Null the fields if they are ''
		ctx.instance.dateAllg = ( ctx.instance.dateAllg === '' ) ? null : ctx.instance.dateAllg;
		ctx.instance.dateSek = ( ctx.instance.dateSek === '' ) ? null : ctx.instance.dateSek;
		ctx.instance.teileinfoAllg = ( ctx.instance.teileinfoAllg === '' ) ? null : ctx.instance.teileinfoAllg;
		ctx.instance.teileinfoSek = ( ctx.instance.teileinfoSek === '' ) ? null : ctx.instance.teileinfoSek;

		if ( ctx.isNewInstance ) {

			ctx.instance.created = new Date();
			ctx.instance[ 'created by' ] = currentUser;

			if( ctx.instance[ 'teileinfoAllg' ] !== null ){
				ctx.instance[ 'dateAllg' ] = ( ctx.instance[ 'dateAllg' ] === '' || ctx.instance[ 'dateAllg' ] === null ) ? new Date() : null;
				ctx.instance[ 'userAllg' ] = currentUser;
			}
			
				// If dateSek is empty but teileinfoSek is not, set dateSek to now
			if( ctx.instance[ 'teileinfoSek' ] !== null ){
				ctx.instance[ 'dateSek' ] = ( ctx.instance[ 'teileinfoSek' ] === null ) ? null : new Date();
				ctx.instance[ 'userSek' ] = currentUser;
			}

		} else {
			ctx.instance.modified = new Date();
			ctx.instance[ 'modified by' ] = currentUser;

			// If dateAllg is empty but teileinfoAllg is not, set dateAllg to now
			if ( ctx.instance[ 'dateAllg' ] === '' || ctx.instance[ 'dateAllg' ] === null )
				ctx.instance[ 'dateAllg' ] = ( ctx.instance[ 'teileinfoAllg' ] === null ) ? null : new Date();
			
				// If dateSek is empty but teileinfoSek is not, set dateSek to now
			if ( ctx.instance[ 'dateSek' ] === '' || ctx.instance[ 'dateSek' ] === null )
				ctx.instance[ 'dateSek' ] = ( ctx.instance[ 'teileinfoSek' ] === null ) ? null : new Date();

			if ( ctx.instance.userAllg 	=== 'me' ) 	ctx.instance.userAllg = currentUser; 
			if ( ctx.instance.userSek	=== 'me' ) 	ctx.instance.userSek = currentUser; 
		}

		//if ( ctx.instance.dateAllg )
			
		debug( 'DateAllg: ' + ctx.instance.dateAllg );

		debug( '\n> before save triggered:', ctx.Model.modelName, ctx.instance || ctx.x );
		return next();
	} );


	Teileinfo.observe( 'after save', function ( ctx, next ) {
		debug( '\n> after save triggered:', ctx.Model.modelName, ctx.instance );
		return next();
	} );
};
