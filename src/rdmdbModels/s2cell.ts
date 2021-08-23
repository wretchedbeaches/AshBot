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

export type s2cellPk = "id";
export type s2cellId = s2cell[s2cellPk];
export type s2cellCreationAttributes = Optional<s2cellAttributes, s2cellPk>;

export class s2cell extends Model<s2cellAttributes, s2cellCreationAttributes> implements s2cellAttributes {
  id!: number;
  level?: number;
  center_lat!: number;
  center_lon!: number;
  updated!: number;

  // s2cell hasMany gym
  gyms!: gym[];
  getgyms!: Sequelize.HasManyGetAssociationsMixin<gym>;
  setgyms!: Sequelize.HasManySetAssociationsMixin<gym, gymId>;
  addgym!: Sequelize.HasManyAddAssociationMixin<gym, gymId>;
  addgyms!: Sequelize.HasManyAddAssociationsMixin<gym, gymId>;
  creategym!: Sequelize.HasManyCreateAssociationMixin<gym>;
  removegym!: Sequelize.HasManyRemoveAssociationMixin<gym, gymId>;
  removegyms!: Sequelize.HasManyRemoveAssociationsMixin<gym, gymId>;
  hasgym!: Sequelize.HasManyHasAssociationMixin<gym, gymId>;
  hasgyms!: Sequelize.HasManyHasAssociationsMixin<gym, gymId>;
  countgyms!: Sequelize.HasManyCountAssociationsMixin;
  // s2cell hasMany pokemon
  pokemons!: pokemon[];
  getpokemons!: Sequelize.HasManyGetAssociationsMixin<pokemon>;
  setpokemons!: Sequelize.HasManySetAssociationsMixin<pokemon, pokemonId>;
  addpokemon!: Sequelize.HasManyAddAssociationMixin<pokemon, pokemonId>;
  addpokemons!: Sequelize.HasManyAddAssociationsMixin<pokemon, pokemonId>;
  createpokemon!: Sequelize.HasManyCreateAssociationMixin<pokemon>;
  removepokemon!: Sequelize.HasManyRemoveAssociationMixin<pokemon, pokemonId>;
  removepokemons!: Sequelize.HasManyRemoveAssociationsMixin<pokemon, pokemonId>;
  haspokemon!: Sequelize.HasManyHasAssociationMixin<pokemon, pokemonId>;
  haspokemons!: Sequelize.HasManyHasAssociationsMixin<pokemon, pokemonId>;
  countpokemons!: Sequelize.HasManyCountAssociationsMixin;
  // s2cell hasMany pokestop
  pokestops!: pokestop[];
  getpokestops!: Sequelize.HasManyGetAssociationsMixin<pokestop>;
  setpokestops!: Sequelize.HasManySetAssociationsMixin<pokestop, pokestopId>;
  addpokestop!: Sequelize.HasManyAddAssociationMixin<pokestop, pokestopId>;
  addpokestops!: Sequelize.HasManyAddAssociationsMixin<pokestop, pokestopId>;
  createpokestop!: Sequelize.HasManyCreateAssociationMixin<pokestop>;
  removepokestop!: Sequelize.HasManyRemoveAssociationMixin<pokestop, pokestopId>;
  removepokestops!: Sequelize.HasManyRemoveAssociationsMixin<pokestop, pokestopId>;
  haspokestop!: Sequelize.HasManyHasAssociationMixin<pokestop, pokestopId>;
  haspokestops!: Sequelize.HasManyHasAssociationsMixin<pokestop, pokestopId>;
  countpokestops!: Sequelize.HasManyCountAssociationsMixin;

  static initModel(sequelize: Sequelize.Sequelize): typeof s2cell {
    s2cell.init({
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      primaryKey: true
    },
    level: {
      type: DataTypes.TINYINT.UNSIGNED,
      allowNull: true
    },
    center_lat: {
      type: DataTypes.DOUBLE(18,14),
      allowNull: false,
      defaultValue: 0.00000000000000
    },
    center_lon: {
      type: DataTypes.DOUBLE(18,14),
      allowNull: false,
      defaultValue: 0.00000000000000
    },
    updated: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false
    }
  }, {
    sequelize,
    tableName: 's2cell',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "id" },
        ]
      },
      {
        name: "ix_coords",
        using: "BTREE",
        fields: [
          { name: "center_lat" },
          { name: "center_lon" },
        ]
      },
      {
        name: "ix_updated",
        using: "BTREE",
        fields: [
          { name: "updated" },
        ]
      },
    ]
  });
  return s2cell;
  }
}
