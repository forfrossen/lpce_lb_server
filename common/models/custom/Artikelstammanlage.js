var LoopBackContext = require( 'loopback-context' );
const debugArtikelstammanlage = true;

module.exports = function ( Artikelstammanlage ) {

    Artikelstammanlage.validatesPresenceOf( 'artikelnummer' );
	Artikelstammanlage.validatesNumericalityOf( 'etikettennummer',      { allowBlank: true, message: { number: 'is not a numer'}} );
	Artikelstammanlage.validatesNumericalityOf( 'umverpackung',         { allowBlank: true, message: { number: 'is not a numer'}} );
	Artikelstammanlage.validatesNumericalityOf( 'erstbestellungqty',    { allowBlank: true, message: { number: 'is not a numer'}} );
	Artikelstammanlage.validatesNumericalityOf( 'rfqnr',                { allowBlank: true, message: { number: 'is not a numer'}} );

	Artikelstammanlage.observe( 'before save', function ( ctx, next ) {

		var lbctx = LoopBackContext.getCurrentContext();
		var currentUser = lbctx && lbctx.get( 'currentUser' );

		if ( debugArtikelstammanlage ) console.log( 'About to save following insance:\n %O', ctx.instance );

		if ( ctx.isNewInstance ) {
			ctx.instance.startername = currentUser;
            ctx.instance.starterdatum = new Date();
		} else {
			
            if ( ctx.data.startername === 'THISWASME' ){
                ctx.data.startername = currentUser;
                ctx.data.starterdatum = new Date();
            } else if ( ctx.data.manufacturingname === 'THISWASME' ){
                ctx.data.manufacturingname = currentUser;
                ctx.data.manufacturingdatum = new Date();
            } else if ( ctx.data.konstruktionname === 'THISWASME' ){
                ctx.data.konstruktionname = currentUser;
                ctx.data.konstruktiondatum = new Date();
            } else if ( ctx.data.pricingname === 'THISWASME' ){
                ctx.data.pricingname = currentUser;
                ctx.data.pricingdatum = new Date();
            } else if ( ctx.data.serviceteamname === 'THISWASME' ){
                ctx.data.serviceteamname = currentUser;
                ctx.data.serviceteamdatum = new Date();
            }

		}

		if ( debugArtikelstammanlage ) console.log( '\n> before save triggered for %O: \n %O', ctx.Model.modelName, ctx.instance || ctx.data );

		return next();
	} );

}