import Sequelize, { DataTypes, Model, Optional } from 'sequelize';
import type { pokestop, pokestopId } from './pokestop';
import type { s2cell, s2cellId } from './s2cell';
import type { spawnpoint, spawnpointId } from './spawnpoint';

export interface pokemonAttributes {
  id: string;
  pokestop_id?: string;
  spawn_id?: number;
  lat: number;
  lon: number;
  weight?: number;
  size?: number;
  expire_timestamp?: number;
  updated?: number;
  pokemon_id: number;
  move_1?: number;
  move_2?: number;
  gender?: number;
  cp?: number;
  atk_iv?: number;
  def_iv?: number;
  sta_iv?: number;
  form?: number;
  level?: number;
  weather?: number;
  costume?: number;
  first_seen_timestamp: number;
  // changed: number;
  iv?: number;
  cell_id?: number;
  expire_timestamp_verified: number;
  display_pokemon_id?: number;
  shiny?: number;
  username?: string;
  capture_1?: number;
  capture_2?: number;
  capture_3?: number;
  pvp_rankings_great_league?: string;
  pvp_rankings_ultra_league?: string;
  is_event: number;
}

export type pokemonPk = 'id' | 'is_event';
export type pokemonId = pokemon[pokemonPk];
export type pokemonCreationAttributes = Optional<pokemonAttributes, pokemonPk>;

export class pokemon
  extends Model<pokemonAttributes, pokemonCreationAttributes>
  implements pokemonAttributes {
  id!: string;
  pokestop_id?: string;
  spawn_id?: number;
  lat!: number;
  lon!: number;
  weight?: number;
  size?: number;
  expire_timestamp?: number;
  updated?: number;
  pokemon_id!: number;
  move_1?: number;
  move_2?: number;
  gender?: number;
  cp?: number;
  atk_iv?: number;
  def_iv?: number;
  sta_iv?: number;
  form?: number;
  level?: number;
  weather?: number;
  costume?: number;
  first_seen_timestamp!: number;
  // changed!: number;
  iv?: number;
  cell_id?: number;
  expire_timestamp_verified!: number;
  display_pokemon_id?: number;
  shiny?: number;
  username?: string;
  capture_1?: number;
  capture_2?: number;
  capture_3?: number;
  pvp_rankings_great_league?: string;
  pvp_rankings_ultra_league?: string;
  is_event!: number;

  // pokemon belongsTo s2cell
  s2cell!: s2cell;
  gets2cell!: Sequelize.BelongsToGetAssociationMixin<s2cell>;
  sets2cell!: Sequelize.BelongsToSetAssociationMixin<s2cell, s2cellId>;
  creates2cell!: Sequelize.BelongsToCreateAssociationMixin<s2cell>;
  // pokemon belongsTo pokestop
  pokestop!: pokestop;
  getpokestop!: Sequelize.BelongsToGetAssociationMixin<pokestop>;
  setpokestop!: Sequelize.BelongsToSetAssociationMixin<pokestop, pokestopId>;
  createpokestop!: Sequelize.BelongsToCreateAssociationMixin<pokestop>;
  // pokemon belongsTo spawnpoint
  spawnpoint!: spawnpoint;
  getspawnpoint!: Sequelize.BelongsToGetAssociationMixin<spawnpoint>;
  setspawnpoint!: Sequelize.BelongsToSetAssociationMixin<
    spawnpoint,
    spawnpointId
  >;
  createspawnpoint!: Sequelize.BelongsToCreateAssociationMixin<spawnpoint>;

  static initModel(sequelize: Sequelize.Sequelize): typeof pokemon {
    pokemon.init(
      {
        id: {
          type: DataTypes.STRING(25),
          allowNull: false,
          primaryKey: true,
        },
        pokestop_id: {
          type: DataTypes.STRING(35),
          allowNull: true,
          references: {
            model: 'pokestop',
            key: 'id',
          },
        },
        spawn_id: {
          type: DataTypes.BIGINT.UNSIGNED,
          allowNull: true,
          references: {
            model: 'spawnpoint',
            key: 'id',
          },
        },
        lat: {
          type: DataTypes.DOUBLE(18, 14),
          allowNull: false,
        },
        lon: {
          type: DataTypes.DOUBLE(18, 14),
          allowNull: false,
        },
        weight: {
          type: DataTypes.DOUBLE(18, 14),
          allowNull: true,
        },
        size: {
          type: DataTypes.DOUBLE(18, 14),
          allowNull: true,
        },
        expire_timestamp: {
          type: DataTypes.INTEGER.UNSIGNED,
          allowNull: true,
        },
        updated: {
          type: DataTypes.INTEGER.UNSIGNED,
          allowNull: true,
        },
        pokemon_id: {
          type: DataTypes.SMALLINT.UNSIGNED,
          allowNull: false,
        },
        move_1: {
          type: DataTypes.SMALLINT.UNSIGNED,
          allowNull: true,
        },
        move_2: {
          type: DataTypes.SMALLINT.UNSIGNED,
          allowNull: true,
        },
        gender: {
          type: DataTypes.TINYINT.UNSIGNED,
          allowNull: true,
        },
        cp: {
          type: DataTypes.SMALLINT.UNSIGNED,
          allowNull: true,
        },
        atk_iv: {
          type: DataTypes.TINYINT.UNSIGNED,
          allowNull: true,
        },
        def_iv: {
          type: DataTypes.TINYINT.UNSIGNED,
          allowNull: true,
        },
        sta_iv: {
          type: DataTypes.TINYINT.UNSIGNED,
          allowNull: true,
        },
        form: {
          type: DataTypes.SMALLINT.UNSIGNED,
          allowNull: true,
        },
        level: {
          type: DataTypes.TINYINT.UNSIGNED,
          allowNull: true,
        },
        weather: {
          type: DataTypes.TINYINT.UNSIGNED,
          allowNull: true,
        },
        costume: {
          type: DataTypes.TINYINT.UNSIGNED,
          allowNull: true,
        },
        first_seen_timestamp: {
          type: DataTypes.INTEGER.UNSIGNED,
          allowNull: false,
        },
        // changed: {
        //   type: DataTypes.INTEGER.UNSIGNED,
        //   allowNull: false,
        //   defaultValue: 0
        // },
        iv: {
          type: DataTypes.FLOAT(5, 2),
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
        expire_timestamp_verified: {
          type: DataTypes.TINYINT.UNSIGNED,
          allowNull: false,
        },
        display_pokemon_id: {
          type: DataTypes.SMALLINT.UNSIGNED,
          allowNull: true,
        },
        shiny: {
          type: DataTypes.TINYINT,
          allowNull: true,
          defaultValue: 0,
        },
        username: {
          type: DataTypes.STRING(32),
          allowNull: true,
        },
        capture_1: {
          type: DataTypes.DOUBLE(18, 14),
          allowNull: true,
        },
        capture_2: {
          type: DataTypes.DOUBLE(18, 14),
          allowNull: true,
        },
        capture_3: {
          type: DataTypes.DOUBLE(18, 14),
          allowNull: true,
        },
        pvp_rankings_great_league: {
          type: DataTypes.TEXT,
          allowNull: true,
        },
        pvp_rankings_ultra_league: {
          type: DataTypes.TEXT,
          allowNull: true,
        },
        is_event: {
          type: DataTypes.TINYINT.UNSIGNED,
          allowNull: false,
          defaultValue: 0,
          primaryKey: true,
        },
      },
      {
        sequelize,
        tableName: 'pokemon',
        hasTrigger: true,
        timestamps: false,
        indexes: [
          {
            name: 'PRIMARY',
            unique: true,
            using: 'BTREE',
            fields: [{ name: 'id' }, { name: 'is_event' }],
          },
          {
            name: 'ix_coords',
            using: 'BTREE',
            fields: [{ name: 'lat' }, { name: 'lon' }],
          },
          {
            name: 'ix_pokemon_id',
            using: 'BTREE',
            fields: [{ name: 'pokemon_id' }],
          },
          {
            name: 'ix_updated',
            using: 'BTREE',
            fields: [{ name: 'updated' }],
          },
          {
            name: 'fk_spawn_id',
            using: 'BTREE',
            fields: [{ name: 'spawn_id' }],
          },
          {
            name: 'fk_pokestop_id',
            using: 'BTREE',
            fields: [{ name: 'pokestop_id' }],
          },
          {
            name: 'ix_atk_iv',
            using: 'BTREE',
            fields: [{ name: 'atk_iv' }],
          },
          {
            name: 'ix_def_iv',
            using: 'BTREE',
            fields: [{ name: 'def_iv' }],
          },
          {
            name: 'ix_sta_iv',
            using: 'BTREE',
            fields: [{ name: 'sta_iv' }],
          },
          // {
          //   name: "ix_changed",
          //   using: "BTREE",
          //   fields: [
          //     { name: "changed" },
          //   ]
          // },
          {
            name: 'ix_level',
            using: 'BTREE',
            fields: [{ name: 'level' }],
          },
          {
            name: 'fk_pokemon_cell_id',
            using: 'BTREE',
            fields: [{ name: 'cell_id' }],
          },
          {
            name: 'ix_expire_timestamp',
            using: 'BTREE',
            fields: [{ name: 'expire_timestamp' }],
          },
          {
            name: 'ix_iv',
            using: 'BTREE',
            fields: [{ name: 'iv' }],
          },
        ],
      }
    );
    return pokemon;
  }
}
