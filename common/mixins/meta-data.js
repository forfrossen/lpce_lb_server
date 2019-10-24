var LoopBackContext = require( 'loopback-context' );
var debug = require( 'debug' );
var bootOptions = arguments.length > 1 && arguments[ 1 ] !== undefined ? arguments[ 1 ] : {};
var warn = function warn( options, message ) {
	if ( !options.silenceWarnings ) {
		console.warn( message );
	}
};
var _extends = Object.assign || function ( target ) { for ( var i = 1; i < arguments.length; i++ ) { var source = arguments[ i ]; for ( var key in source ) { if ( Object.prototype.hasOwnProperty.call( source, key ) ) { target[ key ] = source[ key ]; } } } return target; };


module.exports = function ( Model, options ) {
	
	console.log( "Hello from mixin");

    var options = _extends( {
        createdAt: "created",
        updatedAt: "changed",
        createdBy: "createdby",
        changedBy: "changedby"
    }, bootOptions );
    
    Model.observe( 'before save', function event( ctx, next ) {
    //Model.beforeRemote('*.save', function event(ctx, unused, next) { 
	
		var lbctx = LoopBackContext.getCurrentContext();
		var currentUser = lbctx && lbctx.get( 'currentUser' ) ;

		if ( ctx.isNewInstance ) {
			ctx.instance[ options.createdBy ] = currentUser;
			ctx.instance[ options.createdAt ] = new Date();
			//console.log( 'About to create following %O insance:\n %O',  ctx.Model.modelName,  ctx.instance );
		} else {
			ctx.data[ options.changedBy ] = currentUser;
			ctx.data[ options.updatedAt ] = new Date();
			//console.log( 'About to update following %O insance:\n %O',  ctx.Model.modelName, ctx.data );
		}

		//console.log( '\n> before save triggered for %O: \n %O', ctx.Model.modelName, ctx.instance || ctx.data );

		return next();

    } )
    
    /*
        Model.observe( 'loaded', function event( ctx, next ) {
    //Model.afterRemote( '*', function( ctx, modelInstance, next) {
    Model.afterRemote('**', function(ctx, modelInstance, next)
    {
        var methodName = ctx.method.name;

        console.log( 'methodName: %O', methodName  );

        if (methodName === 'find') {
            for( let i in modelInstance ){
                modelInstance[i][options.createdAt] = formatDate( modelInstance[i][options.createdAt] );
                modelInstance[i][options.updatedAt] = formatDate( modelInstance[i][options.updatedAt] );
                //console.log( '%O: %O: ', [options.createdAt], modelInstance[i][options.createdAt] )
                //console.log( '%O: %O: ', [options.updatedAt], modelInstance[i][options.updatedAt] )
        
                let c = formatDate( modelInstance[i][options.createdAt] );
                let d = formatDate( modelInstance[i][options.updatedAt] );
                //console.log( '%O: %O: ', [options.createdAt], c )
                //console.log( '%O: %O: ', [options.updatedAt], d )
            }
        }

        //
       
        console.log( 'ctx.query: %O', ctx.query  );
        
        if (ctx.data[options.createdAt]){
            ctx.data[options.createdAt] = formatDate( ctx.data[options.createdAt] );
        }
        
        if (ctx.data[options.updatedAt]){
            ctx.data[options.updatedAt] = formatDate( ctx.data[options.updatedAt] );
        }
        
        
        
        
        // console.log( '\n> modelInstance: %O',  modelInstance);
        
        return next();
        
    } )
    */

/*
    Model.beforeRemote ('create', function (context, modelInstance, next) {
        var lbctx = LoopBackContext.getCurrentContext();
        var currentUser = lbctx && lbctx.get( 'currentUser' ) ;
        ctx.instance[ options.createdBy ] = currentUser;
        ctx.instance[ options.createdAt ] = new Date();
    })
*/


};

function formatDate(date) {
    if ( !date ) return null;
    
    //console.log ('Date: ', date)

	var day = date.getDate();
	var month = date.getMonth() + 1;
	var year = date.getFullYear();
	var returndate = ( "0" + day.toString() ).slice( -2 ) + '.' + ( "0" + month.toString() ).slice( -2 ) + '.' + year;

	return returndate;
}