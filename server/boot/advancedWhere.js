/*
var debug = require('debug')('loopback:advancedWhere');
const set = require( 'lodash/set' );
var SqlConnector = require('loopback-connector').SqlConnector;
var ParameterizedSQL = SqlConnector.ParameterizedSQL;

module.exports = function ( app ) {
	const connector = app.dataSources.LPCE480SQLPRODJDE.connector;
	const _buildWhere = connector._buildWhere.bind(connector);

	connector._buildWhere = function ( model, where ) {

		debug('where:', where);

		for ( var key in where ) {
			if ( key.includes( '.' ) ) {
				Object.assign( where, set( {}, key, where[ key ] ) );
				delete where[ key ];
			}
		}

		let whereClause = _buildWhere( model, where );
		const relations = app.models[ model ].relations;

		for ( const key in where ) {
			if ( relations && relations[ key ] ) {
				const relation = relations[ key ];
				const inSelect = this.buildSelect( relation.modelTo.modelName, {
					fields: [ relation.keyTo ],
					where: {
						and: [
							app.models[ model ]._coerce( where[ key ], {}, app.models[ relation.modelTo.modelName ].definition )
						]
					}
				}, { parameterize: false, order: false } );
				whereClause = new ParameterizedSQL( {
					sql: whereClause.sql + ( whereClause.sql !== '' ? ' AND ' : '' ) + this.columnEscaped( relation.modelFrom.modelName, relation.keyFrom ) + ' IN (' + inSelect.sql + ')',
					params: whereClause.params.concat( inSelect.params ),
				} );
			}
		}
		debug('whereClause: %O', whereClause);
		//debug('this.columnEscaped', this.columnEscaped());
		return whereClause;
	}
}
*/