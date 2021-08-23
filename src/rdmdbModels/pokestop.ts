import Sequelize, { DataTypes, Model, Optional } from 'sequelize';
import type { pokemon, pokemonId } from './pokemon';
import type { s2cell, s2cellId } from './s2cell';

export interface pokestopAttributes {
  id: string;
  lat: number;
  lon: number;
  name?: string;
  url?: string;
  lure_expire_timestamp?: number;
  last_modified_timestamp?: number;
  updated: number;
  enabled?: number;
  quest_type?: number;
  quest_timestamp?: number;
  quest_target?: number;
  quest_conditions?: string;
  quest_rewards?: string;
  quest_template?: string;
  quest_reward_type?: number;
  quest_item_id?: number;
  cell_id?: number;
  deleted: number;
  lure_id?: number;
  first_seen_timestamp: number;
  pokestop_display?: number;
  incident_expire_timestamp?: number;
  grunt_type?: number;
  sponsor_id?: number;
  quest_pokemon_id?: number;
}

export type pokestopPk = 'id';
export type pokestopId = pokestop[pokestopPk];
export type pokestopCreationAttributes = Optional<
  pokestopAttributes,
  pokestopPk
>;

export class pokestop
  extends Model<pokestopAttributes, pokestopCreationAttributes>
  implements pokestopAttributes {
  id!: string;
  lat!: number;
  lon!: number;
  name?: string;
  url?: string;
  lure_expire_timestamp?: number;
  last_modified_timestamp?: number;
  updated!: number;
  enabled?: number;
  quest_type?: number;
  quest_timestamp?: number;
  quest_target?: number;
  quest_conditions?: string;
  quest_rewards?: string;
  quest_template?: string;
  quest_reward_type?: number;
  quest_item_id?: number;
  cell_id?: number;
  deleted!: number;
  lure_id?: number;
  first_seen_timestamp!: number;
  pokestop_display?: number;
  incident_expire_timestamp?: number;
  grunt_type?: number;
  sponsor_id?: number;
  quest_pokemon_id?: number;

  // pokestop hasMany pokemon
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
  // pokestop belongsTo s2cell
  s2cell!: s2cell;
  gets2cell!: Sequelize.BelongsToGetAssociationMixin<s2cell>;
  sets2cell!: Sequelize.BelongsToSetAssociationMixin<s2cell, s2cellId>;
  creates2cell!: Sequelize.BelongsToCreateAssociationMixin<s2cell>;

  static initModel(sequelize: Sequelize.Sequelize): typeof pokestop {
    pokestop.init(
      {
        id: {
          type: DataTypes.STRING(35),
          allowNull: false,
          primaryKey: true,
        },
        lat: {
          type: DataTypes.DOUBLE(18, 14),
          allowNull: false,
        },
        lon: {
          type: DataTypes.DOUBLE(18, 14),
          allowNull: false,
        },
        name: {
          type: DataTypes.STRING(128),
          allowNull: true,
        },
        url: {
          type: DataTypes.STRING(200),
          allowNull: true,
        },
        lure_expire_timestamp: {
          type: DataTypes.INTEGER.UNSIGNED,
          allowNull: true,
        },
        last_modified_timestamp: {
          type: DataTypes.INTEGER.UNSIGNED,
          allowNull: true,
        },
        updated: {
          type: DataTypes.INTEGER.UNSIGNED,
          allowNull: false,
        },
        enabled: {
          type: DataTypes.TINYINT.UNSIGNED,
          allowNull: true,
        },
        quest_type: {
          type: DataTypes.INTEGER.UNSIGNED,
          allowNull: true,
        },
        quest_timestamp: {
          type: DataTypes.INTEGER.UNSIGNED,
          allowNull: true,
        },
        quest_target: {
          type: DataTypes.SMALLINT.UNSIGNED,
          allowNull: true,
        },
        quest_conditions: {
          type: DataTypes.TEXT,
          allowNull: true,
        },
        quest_rewards: {
          type: DataTypes.TEXT,
          allowNull: true,
        },
        quest_template: {
          type: DataTypes.STRING(100),
          allowNull: true,
        },
        quest_reward_type: {
          type: DataTypes.SMALLINT.UNSIGNED,
          allowNull: true,
        },
        quest_item_id: {
          type: DataTypes.SMALLINT.UNSIGNED,
          allowNull: true,
        },
        cell_id: {
          type: DataTypes.BIGINT.UNSIGNED,
          allowNull: true,
          references: {
            model: 's2cell',
            key: 'id',
          },
        },
        deleted: {
          type: DataTypes.TINYINT.UNSIGNED,
          allowNull: false,
          defaultValue: 0,
        },
        lure_id: {
          type: DataTypes.SMALLINT,
          allowNull: true,
          defaultValue: 0,
        },
        first_seen_timestamp: {
          type: DataTypes.INTEGER.UNSIGNED,
          allowNull: false,
        },
        pokestop_display: {
          type: DataTypes.SMALLINT,
          allowNull: true,
          defaultValue: 0,
        },
        incident_expire_timestamp: {
          type: DataTypes.INTEGER.UNSIGNED,
          allowNull: true,
        },
        grunt_type: {
          type: DataTypes.SMALLINT.UNSIGNED,
          allowNull: true,
          defaultValue: 0,
        },
        sponsor_id: {
          type: DataTypes.SMALLINT.UNSIGNED,
          allowNull: true,
        },
        quest_pokemon_id: {
          type: DataTypes.SMALLINT.UNSIGNED,
          allowNull: true,
        },
      },
      {
        sequelize,
        tableName: 'pokestop',
        hasTrigger: true,
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
            fields: [{ name: 'lat' }, { name: 'lon' }],
          },
          {
            name: 'ix_lure_expire_timestamp',
            using: 'BTREE',
            fields: [{ name: 'lure_expire_timestamp' }],
          },
          {
            name: 'ix_updated',
            using: 'BTREE',
            fields: [{ name: 'updated' }],
          },
          {
            name: 'fk_pokestop_cell_id',
            using: 'BTREE',
            fields: [{ name: 'cell_id' }],
          },
          {
            name: 'ix_pokestop_deleted',
            using: 'BTREE',
            fields: [{ name: 'deleted' }],
          },
          {
            name: 'ix_incident_expire_timestamp',
            using: 'BTREE',
            fields: [{ name: 'incident_expire_timestamp' }],
          },
          {
            name: 'ix_quest_reward_type',
            using: 'BTREE',
            fields: [{ name: 'quest_reward_type' }],
          },
          {
            name: 'ix_quest_item_id',
            using: 'BTREE',
            fields: [{ name: 'quest_item_id' }],
          },
          {
            name: 'ix_quest_pokemon_id',
            using: 'BTREE',
            fields: [{ name: 'quest_pokemon_id' }],
          },
        ],
      }
    );
    return pokestop;
  }
}
