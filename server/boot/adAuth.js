var PassportConfigurator = require( 'loopback-component-passport' ).PassportConfigurator;
module.exports = function ( app ) {
	var passportConfigurator = new PassportConfigurator( app );
	var ttl = 60 * 60;
	var config = require( '../../providers.json' )['ad'];


	config.getUserNameFromHeader = ( req ) => {
		return req.kerbUserId;
	}
	
	passportConfigurator.init();
	
	//console.log( 'Config: %O', config );
	passportConfigurator.setupModels( {
		userModel: app.models.user,
		userIdentityModel: app.models.userIdentity,
		userCredentialModel: app.models.userCredential,
	} );
	passportConfigurator.configureProvider( 'ad', config );
}