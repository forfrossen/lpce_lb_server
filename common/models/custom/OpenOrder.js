module.exports = function ( OpenOrder ) {

	
	// Do this for every API Call that is ment to SAVE Data
	OpenOrder.observe('loaded', (ctx, next) => {
		//console.log( 'Got data: %O', ctx.data );
		ctx.data.pddrqj = formatDate(ctx.data.pddrqj);
		ctx.data.pdtrdj = formatDate(ctx.data.pdtrdj);
		ctx.data.pdpddj = formatDate(ctx.data.pdpddj);
		ctx.data.pdaddj = formatDate(ctx.data.pdaddj);
		ctx.data.created = formatDate(ctx.data.created);
		//console.log( 'Data is now: %O', ctx.data );
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


function formatDate(date) {
	if ( !date ) return null;

	var day = date.getDate();
	var month = date.getMonth() + 1;
	var year = date.getFullYear();
  
	return ("0" + day.toString()).slice(-2) + '.' + ("0" + month.toString()).slice(-2) + '.' + year;
}