module.exports = function(TeileinfoNeu) {
	TeileinfoNeu.validatesPresenceOf('zeichnungsnummer', 'litm', 'teileinfoAllg');
	//TeileinfoNeu.validatesNumericalityOf('zeichnungsnummer', {int: true});
	
	TeileinfoNeu.observe('before save', async function(ctx) {
		console.log('befor saving');
		return;
	});
	
	//TeileinfoNeu.create()
	
	TeileinfoNeu.observe('after save', function(ctx, next) {
		console.log('supports isNewInstance?', ctx.isNewInstance !== undefined);
		next();
	});
};
