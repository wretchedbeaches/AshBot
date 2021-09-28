import Sequelize, { DataTypes, Model, Optional } from 'sequelize';

export interface guildAttributes {
	id: string;
	settings?: any;
}

export type guildPk = 'id';
export type guildId = guild[guildPk];
export type guildCreationAttributes = Optional<guildAttributes, guildPk>;

export class guild extends Model<guildAttributes, guildCreationAttributes> implements guildAttributes {
	public id!: string;
	public settings?: any;

	public static initModel(sequelize: Sequelize.Sequelize): typeof guild {
		guild.init(
			{
				id: {
					type: DataTypes.STRING(35),
					allowNull: false,
					primaryKey: true,
				},
				settings: {
					type: DataTypes.JSON,
					allowNull: true,
				},
			},
			{
				sequelize,
				tableName: 'guild',
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
		return guild;
	}
}
