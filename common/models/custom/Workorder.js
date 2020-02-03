module.exports = function ( Workorder ) {
	/*
	Workorder.disableRemoteMethodByName( 'create' );
	Workorder.disableRemoteMethodByName( 'upsert' );
	Workorder.disableRemoteMethodByName( 'updateAll' );
	Workorder.disableRemoteMethodByName( 'prototype.updateAttributes' );
	
	//Workorder.disableRemoteMethodByName('find');
	Workorder.disableRemoteMethodByName( 'findById' );
	Workorder.disableRemoteMethodByName( 'findOne' );
	
	Workorder.disableRemoteMethodByName( 'deleteById' );
	
	Workorder.disableRemoteMethodByName( 'confirm' );
	Workorder.disableRemoteMethodByName( 'count' );
	Workorder.disableRemoteMethodByName( 'exists' );
	Workorder.disableRemoteMethodByName( 'resetPassword' );
	
	Workorder.disableRemoteMethodByName( 'prototype.__count__accessTokens' );
	Workorder.disableRemoteMethodByName( 'prototype.__create__accessTokens' );
	Workorder.disableRemoteMethodByName( 'prototype.__delete__accessTokens' );
	Workorder.disableRemoteMethodByName( 'prototype.__destroyById__accessTokens' );
	Workorder.disableRemoteMethodByName( 'prototype.__findById__accessTokens' );
	Workorder.disableRemoteMethodByName( 'prototype.__get__accessTokens' );
	Workorder.disableRemoteMethodByName( 'prototype.__updateById__accessTokens' );
	Workorder.disableRemoteMethodByName( 'createChangeStream' );
	*/

	Workorder.observe('access', function(ctx, next) {
    	if(ctx.query.where && ctx.query.where.wadoco.toString().startsWith('WO')){
			console.log('Context: %O ', ctx.query.where);
    		console.log('Workorder API Triggered! Search Value from Frontend: ', ctx.query.where);
			ctx.query.where.wadoco = ctx.query.where.wadoco.replace("WO", "");
		}
    	next();
  	});
}
