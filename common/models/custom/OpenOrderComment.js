var LoopBackContext = require( 'loopback-context' );
const debugOpenOrderComment = true;

module.exports = function ( OpenOrderComment ) {

	// Disabling all methods but create 
	/*
	OpenOrderComment.disableRemoteMethodByName( 'deleteById' );
	OpenOrderComment.disableRemoteMethodByName( 'upsert' );
	OpenOrderComment.disableRemoteMethodByName( 'updateAll' );
	OpenOrderComment.disableRemoteMethodByName( 'prototype.updateAttributes' );
	OpenOrderComment.disableRemoteMethodByName( 'find' );
	OpenOrderComment.disableRemoteMethodByName( 'findById' );
	OpenOrderComment.disableRemoteMethodByName( 'findOne' );
	OpenOrderComment.disableRemoteMethodByName( 'deleteById' );
	OpenOrderComment.disableRemoteMethodByName( 'confirm' );
	OpenOrderComment.disableRemoteMethodByName( 'count' );
	OpenOrderComment.disableRemoteMethodByName( 'exists' );
	OpenOrderComment.disableRemoteMethodByName( 'resetPassword' );
	OpenOrderComment.disableRemoteMethodByName( 'prototype.__count__accessTokens' );
	OpenOrderComment.disableRemoteMethodByName( 'prototype.__create__accessTokens' );
	OpenOrderComment.disableRemoteMethodByName( 'prototype.__delete__accessTokens' );
	OpenOrderComment.disableRemoteMethodByName( 'prototype.__destroyById__accessTokens' );
	OpenOrderComment.disableRemoteMethodByName( 'prototype.__findById__accessTokens' );
	OpenOrderComment.disableRemoteMethodByName( 'prototype.__get__accessTokens' );
	OpenOrderComment.disableRemoteMethodByName( 'prototype.__updateById__accessTokens' );

	OpenOrderComment.validatesPresenceOf( 'pddoco', 'pdlnid', 'comment' );
	OpenOrderComment.validatesNumericalityOf( 'pddoco', { allowNull: false, message: 'PDDOCO ist nicht numerisch!' } );
	OpenOrderComment.validatesNumericalityOf( 'pdlnid', { allowNull: false, message: 'PDLNID ist nicht numerisch' } );
	OpenOrderComment.validatesLengthOf( 'pddoco', { is: 8, message: { is: 'ist nicht 8 Zeichen lang!' } } );
*/

	// model operation hook

	OpenOrderComment.observe( 'before save', function ( ctx, next ) {

		var lbctx = LoopBackContext.getCurrentContext();
		var currentUser = lbctx && lbctx.get( 'currentUser' );
		console.log("Current User: %O", currentUser);
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