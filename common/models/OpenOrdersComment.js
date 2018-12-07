var LoopBackContext = require( 'loopback-context' );
const debugOpenOrdersComment = true;

module.exports = function ( OpenOrdersComment ) {

	// Disabling all methods but create 
	/*
	OpenOrdersComment.disableRemoteMethodByName( 'deleteById' );
	OpenOrdersComment.disableRemoteMethodByName( 'upsert' );
	OpenOrdersComment.disableRemoteMethodByName( 'updateAll' );
	OpenOrdersComment.disableRemoteMethodByName( 'prototype.updateAttributes' );
	OpenOrdersComment.disableRemoteMethodByName( 'find' );
	OpenOrdersComment.disableRemoteMethodByName( 'findById' );
	OpenOrdersComment.disableRemoteMethodByName( 'findOne' );
	OpenOrdersComment.disableRemoteMethodByName( 'deleteById' );
	OpenOrdersComment.disableRemoteMethodByName( 'confirm' );
	OpenOrdersComment.disableRemoteMethodByName( 'count' );
	OpenOrdersComment.disableRemoteMethodByName( 'exists' );
	OpenOrdersComment.disableRemoteMethodByName( 'resetPassword' );
	OpenOrdersComment.disableRemoteMethodByName( 'prototype.__count__accessTokens' );
	OpenOrdersComment.disableRemoteMethodByName( 'prototype.__create__accessTokens' );
	OpenOrdersComment.disableRemoteMethodByName( 'prototype.__delete__accessTokens' );
	OpenOrdersComment.disableRemoteMethodByName( 'prototype.__destroyById__accessTokens' );
	OpenOrdersComment.disableRemoteMethodByName( 'prototype.__findById__accessTokens' );
	OpenOrdersComment.disableRemoteMethodByName( 'prototype.__get__accessTokens' );
	OpenOrdersComment.disableRemoteMethodByName( 'prototype.__updateById__accessTokens' );

	OpenOrdersComment.validatesPresenceOf( 'pddoco', 'pdlnid', 'comment' );
	OpenOrdersComment.validatesNumericalityOf( 'pddoco', { allowNull: false, message: 'PDDOCO ist nicht numerisch!' } );
	OpenOrdersComment.validatesNumericalityOf( 'pdlnid', { allowNull: false, message: 'PDLNID ist nicht numerisch' } );
	OpenOrdersComment.validatesLengthOf( 'pddoco', { is: 8, message: { is: 'ist nicht 8 Zeichen lang!' } } );
*/

	// model operation hook

	OpenOrdersComment.observe( 'before save', function ( ctx, next ) {

		var lbctx = LoopBackContext.getCurrentContext();
		var currentUser = lbctx && lbctx.get( 'currentUser' );

		if ( debugOpenOrdersComment ) console.log( 'About to save following insance:\n %O', ctx.instance );

		// Null the fields if they are ''
		ctx.instance.created = new Date();
		ctx.instance.createdby = currentUser;
		ctx.instance.version = null;

		if ( ctx.isNewInstance ) {
			ctx.instance.version = 1;
		} else {
			ctx.instance.version = 99;
		}

		if ( debugOpenOrdersComment ) console.log( '\n> before save triggered for %O: \n %O', ctx.Model.modelName, ctx.instance || ctx.data );

		return next();
	} );

	OpenOrdersComment.observe( 'after save', function ( ctx, next ) {
		//ctx.instance.created = formatDate(ctx.instance.created);
		if ( debugOpenOrdersComment ) console.log( '\n> after save triggered for %O: \n %O', ctx.Model.modelName, ctx.instance );
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