import Sequelize, { DataTypes, Model, Optional } from 'sequelize';
import type { gym, gymId } from './gym';
import type { pokemon, pokemonId } from './pokemon';
import type { pokestop, pokestopId } from './pokestop';

export interface s2cellAttributes {
	id: number;
	level?: number;
	center_lat: number;
	center_lon: number;
	updated: number;
}

export type s2cellPk = 'id';
export type s2cellId = s2cell[s2cellPk];
export type s2cellCreationAttributes = Optional<s2cellAttributes, s2cellPk>;

export class s2cell extends Model<s2cellAttributes, s2cellCreationAttributes> implements s2cellAttributes {
	public id!: number;
	public level?: number;
	public center_lat!: number;
	public center_lon!: number;
	public updated!: number;

	// s2cell hasMany gym
	public gyms!: gym[];
	public getgyms!: Sequelize.HasManyGetAssociationsMixin<gym>;
	public setgyms!: Sequelize.HasManySetAssociationsMixin<gym, gymId>;
	public addgym!: Sequelize.HasManyAddAssociationMixin<gym, gymId>;
	public addgyms!: Sequelize.HasManyAddAssociationsMixin<gym, gymId>;
	public creategym!: Sequelize.HasManyCreateAssociationMixin<gym>;
	public removegym!: Sequelize.HasManyRemoveAssociationMixin<gym, gymId>;
	public removegyms!: Sequelize.HasManyRemoveAssociationsMixin<gym, gymId>;
	public hasgym!: Sequelize.HasManyHasAssociationMixin<gym, gymId>;
	public hasgyms!: Sequelize.HasManyHasAssociationsMixin<gym, gymId>;
	public countgyms!: Sequelize.HasManyCountAssociationsMixin;
	// s2cell hasMany pokemon
	public pokemons!: pokemon[];
	public getpokemons!: Sequelize.HasManyGetAssociationsMixin<pokemon>;
	public setpokemons!: Sequelize.HasManySetAssociationsMixin<pokemon, pokemonId>;
	public addpokemon!: Sequelize.HasManyAddAssociationMixin<pokemon, pokemonId>;
	public addpokemons!: Sequelize.HasManyAddAssociationsMixin<pokemon, pokemonId>;
	public createpokemon!: Sequelize.HasManyCreateAssociationMixin<pokemon>;
	public removepokemon!: Sequelize.HasManyRemoveAssociationMixin<pokemon, pokemonId>;
	public removepokemons!: Sequelize.HasManyRemoveAssociationsMixin<pokemon, pokemonId>;
	public haspokemon!: Sequelize.HasManyHasAssociationMixin<pokemon, pokemonId>;
	public haspokemons!: Sequelize.HasManyHasAssociationsMixin<pokemon, pokemonId>;
	public countpokemons!: Sequelize.HasManyCountAssociationsMixin;
	// s2cell hasMany pokestop
	public pokestops!: pokestop[];
	public getpokestops!: Sequelize.HasManyGetAssociationsMixin<pokestop>;
	public setpokestops!: Sequelize.HasManySetAssociationsMixin<pokestop, pokestopId>;
	public addpokestop!: Sequelize.HasManyAddAssociationMixin<pokestop, pokestopId>;
	public addpokestops!: Sequelize.HasManyAddAssociationsMixin<pokestop, pokestopId>;
	public createpokestop!: Sequelize.HasManyCreateAssociationMixin<pokestop>;
	public removepokestop!: Sequelize.HasManyRemoveAssociationMixin<pokestop, pokestopId>;
	public removepokestops!: Sequelize.HasManyRemoveAssociationsMixin<pokestop, pokestopId>;
	public haspokestop!: Sequelize.HasManyHasAssociationMixin<pokestop, pokestopId>;
	public haspokestops!: Sequelize.HasManyHasAssociationsMixin<pokestop, pokestopId>;
	public countpokestops!: Sequelize.HasManyCountAssociationsMixin;

	public static initModel(sequelize: Sequelize.Sequelize): typeof s2cell {
		s2cell.init(
			{
				id: {
					type: DataTypes.BIGINT.UNSIGNED,
					allowNull: false,
					primaryKey: true,
				},
				level: {
					type: DataTypes.TINYINT.UNSIGNED,
					allowNull: true,
				},
				center_lat: {
					type: DataTypes.DOUBLE(18, 14),
					allowNull: false,
					defaultValue: 0.0,
				},
				center_lon: {
					type: DataTypes.DOUBLE(18, 14),
					allowNull: false,
					defaultValue: 0.0,
				},
				updated: {
					type: DataTypes.INTEGER.UNSIGNED,
					allowNull: false,
				},
			},
			{
				sequelize,
				tableName: 's2cell',
				timestamps: false,
				indexes: [
					{
						name: 'PRIMARY',
						unique: true,
						using: 'BTREE',
						fields: [{ name: 'id' }],
					},
					{
						name: 'ix_coords',
						using: 'BTREE',
						fields: [{ name: 'center_lat' }, { name: 'center_lon' }],
					},
					{
						name: 'ix_updated',
						using: 'BTREE',
						fields: [{ name: 'updated' }],
					},
				],
			},
		);
		return s2cell;
	}
}
