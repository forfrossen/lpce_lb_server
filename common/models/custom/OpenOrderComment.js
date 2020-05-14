var LoopBackContext = require( 'loopback-context' );
const debugOpenOrderComment = true;

module.exports = function ( OpenOrderComment ) {

	OpenOrderComment.observe( 'before save', function ( ctx, next ) {

		//var lbctx = LoopBackContext.getCurrentContext();
		var currentUser = ctx.options.currentUser.username;
		console.log("Current User: '%O'", currentUser);
		if ( debugOpenOrderComment ) console.log( 'About to save following insance:\n %O', ctx.instance );

		// Null the fields if they are ''
		ctx.instance.created = new Date();
		ctx.instance.createdby = currentUser;
		ctx.instance.version = null;

		if ( ctx.isNewInstance ) {
			ctx.instance.version = 1;
		} else {
			ctx.instance.version = 99;
		}

		if ( debugOpenOrderComment ) console.log( '\n> before save triggered for %O: \n %O', ctx.Model.modelName, ctx.instance || ctx.data );

		return next();
	} );

	OpenOrderComment.observe( 'after save', function ( ctx, next ) {
		//ctx.instance.created = formatDate(ctx.instance.created);
		if ( debugOpenOrderComment ) console.log( '\n> after save triggered for %O: \n %O', ctx.Model.modelName, ctx.instance );
		return next();
	} );
};

function formatDate(date) {
	if ( !date ) return null;

	
	
	var day = date.getDate();
	var month = date.getMonth() + 1;
	var year = date.getFullYear();
	var returndate = ( "0" + day.toString() ).slice( -2 ) + '.' + ( "0" + month.toString() ).slice( -2 ) + '.' + year;

	console.log( 'datum: ', date, 'returndate: ', returndate );

	return returndate;
}