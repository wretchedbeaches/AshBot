import Sequelize, { DataTypes, Model, Optional } from 'sequelize';
import type { pokemon, pokemonId } from './pokemon';

export interface spawnpointAttributes {
  id: number;
  lat: number;
  lon: number;
  updated: number;
  despawn_sec?: number;
}

export type spawnpointPk = "id";
export type spawnpointId = spawnpoint[spawnpointPk];
export type spawnpointCreationAttributes = Optional<spawnpointAttributes, spawnpointPk>;

export class spawnpoint extends Model<spawnpointAttributes, spawnpointCreationAttributes> implements spawnpointAttributes {
  id!: number;
  lat!: number;
  lon!: number;
  updated!: number;
  despawn_sec?: number;

  // spawnpoint hasMany pokemon
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

  static initModel(sequelize: Sequelize.Sequelize): typeof spawnpoint {
    spawnpoint.init({
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      primaryKey: true
    },
    lat: {
      type: DataTypes.DOUBLE(18,14),
      allowNull: false
    },
    lon: {
      type: DataTypes.DOUBLE(18,14),
      allowNull: false
    },
    updated: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 0
    },
    despawn_sec: {
      type: DataTypes.SMALLINT.UNSIGNED,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'spawnpoint',
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
          { name: "lat" },
          { name: "lon" },
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
  return spawnpoint;
  }
}
