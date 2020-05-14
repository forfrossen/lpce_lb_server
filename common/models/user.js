module.exports = function ( User ) {

	User.observe('loaded', async ctx => {
		let user = ctx.data;
		if ( user.ADProfile && user.ADProfile.memberOf ){
			if ( user.ADProfile.primaryGroup === '55913' ) user.ADProfile.memberOf.push( 'QCD480GGUsers');
			user.Roles = user.ADProfile.memberOf.map( group => group.split( ',' )[ 0 ].replace( 'CN=', '' ));
			user.ADProfile.memberOf = user.Roles;
		}
	});

}