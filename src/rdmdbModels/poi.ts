import Sequelize, { DataTypes, Model, Optional } from 'sequelize';

export interface poiAttributes {
	id: number;
	poi_id?: string;
	name?: string;
	description?: string;
	notes?: string;
	poiimageurl?: string;
	poiimagedeletehash?: string;
	poisurroundingurl?: string;
	poisurroundingdeletehash?: string;
	lat?: number;
	lon?: number;
	status?: number;
	updated?: number;
	submitted_by?: string;
	edited_by?: string;
}

export type poiPk = 'id';
export type poiId = poi[poiPk];
export type poiCreationAttributes = Optional<poiAttributes, poiPk>;

export class poi extends Model<poiAttributes, poiCreationAttributes> implements poiAttributes {
	public id!: number;
	public poi_id?: string;
	public name?: string;
	public description?: string;
	public notes?: string;
	public poiimageurl?: string;
	public poiimagedeletehash?: string;
	public poisurroundingurl?: string;
	public poisurroundingdeletehash?: string;
	public lat?: number;
	public lon?: number;
	public status?: number;
	public updated?: number;
	public submitted_by?: string;
	public edited_by?: string;

	public static initModel(sequelize: Sequelize.Sequelize): typeof poi {
		poi.init(
			{
				id: {
					autoIncrement: true,
					type: DataTypes.INTEGER,
					allowNull: false,
					primaryKey: true,
				},
				poi_id: {
					type: DataTypes.STRING(35),
					allowNull: true,
				},
				name: {
					type: DataTypes.STRING(64),
					allowNull: true,
				},
				description: {
					type: DataTypes.STRING(1024),
					allowNull: true,
				},
				notes: {
					type: DataTypes.STRING(1024),
					allowNull: true,
				},
				poiimageurl: {
					type: DataTypes.STRING(200),
					allowNull: true,
				},
				poiimagedeletehash: {
					type: DataTypes.STRING(200),
					allowNull: true,
				},
				poisurroundingurl: {
					type: DataTypes.STRING(200),
					allowNull: true,
				},
				poisurroundingdeletehash: {
					type: DataTypes.STRING(200),
					allowNull: true,
				},
				lat: {
					type: DataTypes.DOUBLE(18, 14),
					allowNull: true,
				},
				lon: {
					type: DataTypes.DOUBLE(18, 14),
					allowNull: true,
				},
				status: {
					type: DataTypes.TINYINT,
					allowNull: true,
				},
				updated: {
					type: DataTypes.BIGINT,
					allowNull: true,
				},
				submitted_by: {
					type: DataTypes.STRING(200),
					allowNull: true,
				},
				edited_by: {
					type: DataTypes.STRING(200),
					allowNull: true,
				},
			},
			{
				sequelize,
				tableName: 'poi',
				timestamps: false,
				indexes: [
					{
						name: 'PRIMARY',
						unique: true,
						using: 'BTREE',
						fields: [{ name: 'id' }],
					},
				],
			},
		);
		return poi;
	}
}
