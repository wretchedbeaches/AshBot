import Sequelize, { DataTypes, Model, Optional } from 'sequelize';

export interface metadataAttributes {
	key: string;
	value?: string;
}

export type metadataPk = 'key';
export type metadataId = metadata[metadataPk];
export type metadataCreationAttributes = Optional<metadataAttributes, metadataPk>;

export class metadata extends Model<metadataAttributes, metadataCreationAttributes> implements metadataAttributes {
	public key!: string;
	public value?: string;

	public static initModel(sequelize: Sequelize.Sequelize): typeof metadata {
		metadata.init(
			{
				key: {
					type: DataTypes.STRING(200),
					allowNull: false,
					primaryKey: true,
				},
				value: {
					type: DataTypes.TEXT,
					allowNull: true,
				},
			},
			{
				sequelize,
				tableName: 'metadata',
				timestamps: false,
				indexes: [
					{
						name: 'PRIMARY',
						unique: true,
						using: 'BTREE',
						fields: [{ name: 'key' }],
					},
				],
			},
		);
		return metadata;
	}
}
