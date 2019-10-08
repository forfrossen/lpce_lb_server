var server = require( './server' );
var ds = server.dataSources.LPCE480SQLPRODMISC	;
var lbTables = [ 'userIdentity' ];
ds.automigrate( lbTables, function ( err ) {
	if ( err ) onErr(er);
	console.log( 'Loopback tables [' + lbTables + '] created in ', ds.adapter.name );
	ds.disconnect();
	process.exit();
} );



function onErr(err) {
	console.log(err);
	return 1;
}