
var debug = require('debug')('loopback:security:roleResolver');

module.exports = function ( app ) {

	const Role 			= app.models.Role;
	const userModel 	= app.models.user;

	Role.registerResolver( 'ITmember', async ( role, context ) => {
		return await dynamicRoleChecker( 'QCD480GGIt', context );
	});

	Role.registerResolver( 'GGUsers', async ( role, context ) => {
		return await dynamicRoleChecker( 'QCD480GGUsers', context );
	});

	Role.registerResolver( 'WebAppReader', async ( role, context ) => {	
		return await dynamicRoleChecker( 'READER', context );
	});

	Role.registerResolver( 'WebAppWriter', async ( role, context ) => {			
		return await dynamicRoleChecker( 'WRITER', context );
	});

	

	async function dynamicRoleChecker( role, context ) {
		
		try{
			
			let isMember = false;
			let WebApp = context.modelName;
			
			debug ('dynamicRoleChecker for ROLE ', role, 'and Webapp: ', WebApp);
			
			let userId = context.accessToken.userId;
			if ( ! userId ) throw new Error ('No UserID available!' );
			
			let userProfile = await userModel.findById( userId, { include: 'ADProfile' });
			if ( ! userProfile ) throw new Error( 'no profile found!' );

			let userGroups 		= userProfile.Roles;
			let groupToCheck 	= '';

			switch ( WebApp ){
				case 'OpenOrders':
					groupToCheck = 'QCD480GG_WEB_OpenOrders';
					break;
				case 'OpenOrdersComment':
					groupToCheck = 'QCD480GG_WEB_OpenOrders';
					break;
				case 'Artikelstammanlage':
					groupToCheck = 'QCD480GG_WEB_Artikelstammanlage';
					break;
				case 'ArtikelstammanlageHistorie':
					groupToCheck = 'QCD480GG_WEB_Artikelstammanlage';
					break;
				default:
					groupToCheck = 'QCD480GG_WEB_' + WebApp;
					if( role === 'READER') groupToCheck += '_READ';
					if( role === 'WRITER') groupToCheck += '_WRITE';
					break;
			}

			if ( role !== 'READER' && role !== 'WRITER' ) {
				groupToCheck = role;
			}

			
			if( userGroups.indexOf( groupToCheck ) !== -1 ) isMember = true;

			debug( '\n' );
			debug( '===========================================================' );
			debug( 'Dynamic Role Checker' );
			debug( 'WebApp:...............', 	WebApp );
			debug( 'Role:.................', 	role );
			debug( 'groupToCheck..........', 	groupToCheck );
			debug( 'User:.................', 	userProfile.username );
			//debug( 'userGroups:............',	userGroups );
			debug( 'is Member:............',	isMember );
			debug( 'indexOf:..............',	userGroups.indexOf( groupToCheck ) );
			debug( '===========================================================' );
			debug( '\n' );

			//debug( 'userProfile.Roles: ', userProfile.Roles );

			if( isMember ) return true;				
			
		} catch(e) {
			debug('\t Error: ', e.message);
		}

		return false;
	}
};