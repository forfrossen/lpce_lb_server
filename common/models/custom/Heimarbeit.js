module.exports = function ( Heimarbeit ) {

	Heimarbeit.validatesPresenceOf( 'auftrag', 'kostenstelle' );
	Heimarbeit.validatesLengthOf( 'auftrag', {is: 8, message: 'Workorder must be 8 digits!'});
	//Heimarbeit.validatesNumericalityOf( 'auftrag', { int: true } );
	//Heimarbeit.validatesNumericalityOf( 'kostenstelle', { int: true } );

	Heimarbeit.afterInitialize = function () {
		// http://docs.strongloop.com/display/public/LB/Model+hooks#Modelhooks-afterInitialize
		console.log( '\n> afterInitialize triggered' );
	};

	// Do this for every API Call that is ment to SAVE Data
	Heimarbeit.observe( 'before save', function ( ctx, next ) {
		
		console.log( '\n> before save triggered:', ctx.Model.modelName, ctx.instance || ctx.data );
		
		if ( ctx.isNewInstance ) {
			ctx.instance.datum = new Date();
		} 
		
		return next();
	} );
/*
	Heimarbeit.observe( 'after save', function ( ctx, next ) {
		console.log( '\n> after save triggered:', ctx.Model.modelName, ctx.instance );
		return next();
	} );

	// model operation hook
	Heimarbeit.observe( 'before save', function ( ctx, next ) {
		if ( ctx.instance ) {
			console.log( '\n\nAbout to save a Heimarbeit instance:', ctx.instance );
		} else {
			console.log( '\n\nAbout to update Heimarbeits that match the query %j:', ctx.where );
		}
		next();
	} );
*/
};
