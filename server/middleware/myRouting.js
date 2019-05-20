module.exports = function () {
	return function myRouting( req, res, next ) {
		var app 	= require( '../server.js' );
		var routes 	= app.models.HttpForwarding;

		console.log( 'Auferufener Link: %O', req.originalUrl );

		routes.find( { where: { link: req.originalUrl } }, function ( err, obj ) {
			if ( err ) console.log( 'err: %O', err );
			else {
				if ( obj.length ) {
					// console.log( 'obj: %O', obj );
					//res.send( 'You will be forwarded to .... ==> ' + obj[ 0 ].destination );
					res.redirect( obj[ 0 ].destination );
				} else {
					console.log( 'no forwarding destination found. Nexting....' )
					next();
				}
			}
		} );
	}
}