import Sequelize, { DataTypes, Model, Optional } from 'sequelize';

export interface pokemon_iv_statsAttributes {
	date: string;
	pokemon_id: number;
	count: number;
}

export type pokemon_iv_statsPk = 'date' | 'pokemon_id';
export type pokemon_iv_statsId = pokemon_iv_stats[pokemon_iv_statsPk];
export type pokemon_iv_statsCreationAttributes = Optional<pokemon_iv_statsAttributes, pokemon_iv_statsPk>;

export class pokemon_iv_stats
	extends Model<pokemon_iv_statsAttributes, pokemon_iv_statsCreationAttributes>
	implements pokemon_iv_statsAttributes
{
	public date!: string;
	public pokemon_id!: number;
	public count!: number;

	public static initModel(sequelize: Sequelize.Sequelize): typeof pokemon_iv_stats {
		pokemon_iv_stats.init(
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
				tableName: 'pokemon_iv_stats',
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
		return pokemon_iv_stats;
	}
}
