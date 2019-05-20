var LoopBackContext = require( 'loopback-context' );
var bootOptions = arguments.length > 1 && arguments[ 1 ] !== undefined ? arguments[ 1 ] : {};
var debug = require( 'debug' );
var _extends = Object.assign || function ( target ) { for ( var i = 1; i < arguments.length; i++ ) { var source = arguments[ i ]; for ( var key in source ) { if ( Object.prototype.hasOwnProperty.call( source, key ) ) { target[ key ] = source[ key ]; } } } return target; };

var warn = function warn( options, message ) {
	if ( !options.silenceWarnings ) {
		console.warn( message );
	}
};

module.exports = function ( Model, options ) {

	


	debug( 'UserStamp mixin for Model %s', Model.modelName );
	/*
			Model.defineProperty( 'createdBy', { type: String, default: '' } );
			Model.defineProperty( 'changedBy', { type: String, default: '' } );
	*/
	var options = _extends( {
		createdBy: 'createdby',
		changedBy: 'changedby',
		required: true,
		alidateUpsert: false, // default to turning validation off
		silenceWarnings: false
	}, bootOptions );

	debug( 'options', options );

	if ( !options.validateUpsert && Model.settings.validateUpsert ) {
		Model.settings.validateUpsert = false;
		warn( options, Model.pluralModelName + ' settings.validateUpsert was overriden to false' );
	}

	if ( Model.settings.validateUpsert && options.required ) {
		warn( options, 'Upserts for ' + Model.pluralModelName + ' will fail when\n          validation is turned on and time stamps are required' );
	}
	

	Model.observe( 'before save', function event( ctx, next ) {
	
		var lbctx = LoopBackContext.getCurrentContext();
		var currentUser = lbctx && lbctx.get( 'currentUser' ) ;

		debug( 'ctx.options', ctx.options );

		if ( ctx.options && ctx.options.skipUpdatedAt ) {
			return next();
		}

		if ( ctx.instance ) {
			ctx.instance[ options.createdBy ] = currentUser;
			console.log( 'About to create following insance:\n %O', ctx.instance );
		} else {
			ctx.data[ options.changedBy ] = currentUser;
			console.log( 'About to update following insance:\n %O', ctx.data );
		}

		console.log( '\n> before save triggered for %O: \n %O', ctx.Model.modelName, ctx.instance || ctx.data );

		return next();

	} )

};