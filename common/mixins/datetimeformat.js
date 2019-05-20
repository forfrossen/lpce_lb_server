var debug = require( 'debug' );
var bootOptions = arguments.length > 1 && arguments[ 1 ] !== undefined ? arguments[ 1 ] : {};
var warn = function warn( options, message ) {
	if ( !options.silenceWarnings ) {
		console.warn( message );
	}
};
var _extends = Object.assign || function ( target ) { for ( var i = 1; i < arguments.length; i++ ) { var source = arguments[ i ]; for ( var key in source ) { if ( Object.prototype.hasOwnProperty.call( source, key ) ) { target[ key ] = source[ key ]; } } } return target; };


module.exports = function ( Model, options ) {
    
    
    console.log( 'DateTimeFormat Mixin for Model %s', Model.modelName );    
    
	/*
			Model.defineProperty( 'createdBy', { type: String, default: '' } );
			Model.defineProperty( 'changedBy', { type: String, default: '' } );
    */

    var options = _extends( {
        field1: 'created',
        field2: 'changed'
    }, bootOptions );
    
    
	Model.observe( 'loaded', function event( ctx, next ) {
    
        if (ctx.data[options.field1]){
            ctx.data[options.field1] = formatDate( ctx.data[options.field1] );
        }
            
        if (ctx.data[options.field2]){
            ctx.data[options.field2] = formatDate( ctx.data[options.field2] );
        }
         

        debug( 'Field1:\n %O', ctx.data[options.field1] );
        debug( 'Field2:\n %O', ctx.data[options.field2] );
        
        
        
        return next();

	} )

};

function formatDate(date) {
    if ( !date ) return null;
    
    console.log ('Date: ', date)

	var day = date.getDate();
	var month = date.getMonth() + 1;
	var year = date.getFullYear();
	var returndate = ( "0" + day.toString() ).slice( -2 ) + '.' + ( "0" + month.toString() ).slice( -2 ) + '.' + year;

	return returndate;
}