import Sequelize, { DataTypes, Model, Optional } from 'sequelize';

export interface pokemon_statsAttributes {
	date: string;
	pokemon_id: number;
	count: number;
}

export type pokemon_statsPk = 'date' | 'pokemon_id';
export type pokemon_statsId = pokemon_stats[pokemon_statsPk];
export type pokemon_statsCreationAttributes = Optional<pokemon_statsAttributes, pokemon_statsPk>;

export class pokemon_stats
	extends Model<pokemon_statsAttributes, pokemon_statsCreationAttributes>
	implements pokemon_statsAttributes
{
	public date!: string;
	public pokemon_id!: number;
	public count!: number;

	public static initModel(sequelize: Sequelize.Sequelize): typeof pokemon_stats {
		pokemon_stats.init(
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
			},
			{
				sequelize,
				tableName: 'pokemon_stats',
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
		return pokemon_stats;
	}
}
