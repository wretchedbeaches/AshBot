import Sequelize, { DataTypes, Model, Optional } from 'sequelize';

export interface ingress_portalsAttributes {
	id: number;
	external_id?: string;
	lat?: number;
	lon?: number;
	name?: string;
	url?: string;
	updated: number;
	imported?: number;
	checked?: number;
}

export type ingress_portalsPk = 'id';
export type ingress_portalsId = ingress_portals[ingress_portalsPk];
export type ingress_portalsCreationAttributes = Optional<ingress_portalsAttributes, ingress_portalsPk>;

export class ingress_portals
	extends Model<ingress_portalsAttributes, ingress_portalsCreationAttributes>
	implements ingress_portalsAttributes
{
	public id!: number;
	public external_id?: string;
	public lat?: number;
	public lon?: number;
	public name?: string;
	public url?: string;
	public updated!: number;
	public imported?: number;
	public checked?: number;

	public static initModel(sequelize: Sequelize.Sequelize): typeof ingress_portals {
		ingress_portals.init(
			{
				id: {
					autoIncrement: true,
					type: DataTypes.INTEGER,
					allowNull: false,
					primaryKey: true,
				},
				external_id: {
					type: DataTypes.STRING(35),
					allowNull: true,
					unique: 'external_id',
				},
				lat: {
					type: DataTypes.DOUBLE(18, 14),
					allowNull: true,
				},
				lon: {
					type: DataTypes.DOUBLE(18, 14),
					allowNull: true,
				},
				name: {
					type: DataTypes.STRING(128),
					allowNull: true,
				},
				url: {
					type: DataTypes.STRING(200),
					allowNull: true,
				},
				updated: {
					type: DataTypes.BIGINT,
					allowNull: false,
				},
				imported: {
					type: DataTypes.BIGINT,
					allowNull: true,
				},
				checked: {
					type: DataTypes.TINYINT,
					allowNull: true,
				},
			},
			{
				sequelize,
				tableName: 'ingress_portals',
				timestamps: false,
				indexes: [
					{
						name: 'PRIMARY',
						unique: true,
						using: 'BTREE',
						fields: [{ name: 'id' }],
					},
					{
						name: 'external_id',
						unique: true,
						using: 'BTREE',
						fields: [{ name: 'external_id' }],
					},
					{
						name: 'coordsIndex',
						using: 'BTREE',
						fields: [{ name: 'lat' }, { name: 'lon' }],
					},
					{
						name: 'updatedIndex',
						using: 'BTREE',
						fields: [{ name: 'updated' }],
					},
				],
			},
		);
		return ingress_portals;
	}
}
