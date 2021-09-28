import Sequelize, { DataTypes, Model, Optional } from 'sequelize';

export interface raid_statsAttributes {
	date: string;
	pokemon_id: number;
	count: number;
	level?: number;
}

export type raid_statsPk = 'date' | 'pokemon_id';
export type raid_statsId = raid_stats[raid_statsPk];
export type raid_statsCreationAttributes = Optional<raid_statsAttributes, raid_statsPk>;

export class raid_stats
	extends Model<raid_statsAttributes, raid_statsCreationAttributes>
	implements raid_statsAttributes
{
	public date!: string;
	public pokemon_id!: number;
	public count!: number;
	public level?: number;

	public static initModel(sequelize: Sequelize.Sequelize): typeof raid_stats {
		raid_stats.init(
			{
				date: {
					type: DataTypes.DATEONLY,
					allowNull: false,
					primaryKey: true,
				},
				pokemon_id: {
					type: DataTypes.SMALLINT.UNSIGNED,
					allowNull: false,
					primaryKey: true,
				},
				count: {
					type: DataTypes.INTEGER,
					allowNull: false,
				},
				level: {
					type: DataTypes.SMALLINT.UNSIGNED,
					allowNull: true,
				},
			},
			{
				sequelize,
				tableName: 'raid_stats',
				timestamps: false,
				indexes: [
					{
						name: 'PRIMARY',
						unique: true,
						using: 'BTREE',
						fields: [{ name: 'date' }, { name: 'pokemon_id' }],
					},
				],
			},
		);
		return raid_stats;
	}
}
