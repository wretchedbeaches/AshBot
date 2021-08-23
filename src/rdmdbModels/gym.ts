import Sequelize, { DataTypes, Model, Optional } from 'sequelize';
import type { s2cell, s2cellId } from './s2cell';

export interface gymAttributes {
  id: string;
  lat: number;
  lon: number;
  name?: string;
  url?: string;
  last_modified_timestamp?: number;
  raid_end_timestamp?: number;
  raid_spawn_timestamp?: number;
  raid_battle_timestamp?: number;
  updated: number;
  raid_pokemon_id?: number;
  guarding_pokemon_id?: number;
  availble_slots?: number;
  team_id?: number;
  raid_level?: number;
  enabled?: number;
  ex_raid_eligible?: number;
  in_battle?: number;
  raid_pokemon_move_1?: number;
  raid_pokemon_move_2?: number;
  raid_pokemon_form?: number;
  raid_pokemon_cp?: number;
  raid_is_exclusive?: number;
  cell_id?: number;
  deleted: number;
  total_cp?: number;
  first_seen_timestamp: number;
  raid_pokemon_gender?: number;
  sponsor_id?: number;
  raid_pokemon_costume?: number;
  raid_pokemon_evolution?: number;
}

export type gymPk = "id";
export type gymId = gym[gymPk];
export type gymCreationAttributes = Optional<gymAttributes, gymPk>;

export class gym extends Model<gymAttributes, gymCreationAttributes> implements gymAttributes {
  id!: string;
  lat!: number;
  lon!: number;
  name?: string;
  url?: string;
  last_modified_timestamp?: number;
  raid_end_timestamp?: number;
  raid_spawn_timestamp?: number;
  raid_battle_timestamp?: number;
  updated!: number;
  raid_pokemon_id?: number;
  guarding_pokemon_id?: number;
  availble_slots?: number;
  team_id?: number;
  raid_level?: number;
  enabled?: number;
  ex_raid_eligible?: number;
  in_battle?: number;
  raid_pokemon_move_1?: number;
  raid_pokemon_move_2?: number;
  raid_pokemon_form?: number;
  raid_pokemon_cp?: number;
  raid_is_exclusive?: number;
  cell_id?: number;
  deleted!: number;
  total_cp?: number;
  first_seen_timestamp!: number;
  raid_pokemon_gender?: number;
  sponsor_id?: number;
  raid_pokemon_costume?: number;
  raid_pokemon_evolution?: number;

  // gym belongsTo s2cell
  s2cell!: s2cell;
  gets2cell!: Sequelize.BelongsToGetAssociationMixin<s2cell>;
  sets2cell!: Sequelize.BelongsToSetAssociationMixin<s2cell, s2cellId>;
  creates2cell!: Sequelize.BelongsToCreateAssociationMixin<s2cell>;

  static initModel(sequelize: Sequelize.Sequelize): typeof gym {
    gym.init({
    id: {
      type: DataTypes.STRING(35),
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
    name: {
      type: DataTypes.STRING(128),
      allowNull: true
    },
    url: {
      type: DataTypes.STRING(200),
      allowNull: true
    },
    last_modified_timestamp: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true
    },
    raid_end_timestamp: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true
    },
    raid_spawn_timestamp: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true
    },
    raid_battle_timestamp: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true
    },
    updated: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false
    },
    raid_pokemon_id: {
      type: DataTypes.SMALLINT.UNSIGNED,
      allowNull: true
    },
    guarding_pokemon_id: {
      type: DataTypes.SMALLINT.UNSIGNED,
      allowNull: true
    },
    availble_slots: {
      type: DataTypes.SMALLINT.UNSIGNED,
      allowNull: true
    },
    team_id: {
      type: DataTypes.TINYINT.UNSIGNED,
      allowNull: true
    },
    raid_level: {
      type: DataTypes.TINYINT.UNSIGNED,
      allowNull: true
    },
    enabled: {
      type: DataTypes.TINYINT.UNSIGNED,
      allowNull: true
    },
    ex_raid_eligible: {
      type: DataTypes.TINYINT.UNSIGNED,
      allowNull: true
    },
    in_battle: {
      type: DataTypes.TINYINT.UNSIGNED,
      allowNull: true
    },
    raid_pokemon_move_1: {
      type: DataTypes.SMALLINT.UNSIGNED,
      allowNull: true
    },
    raid_pokemon_move_2: {
      type: DataTypes.SMALLINT.UNSIGNED,
      allowNull: true
    },
    raid_pokemon_form: {
      type: DataTypes.SMALLINT.UNSIGNED,
      allowNull: true
    },
    raid_pokemon_cp: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true
    },
    raid_is_exclusive: {
      type: DataTypes.TINYINT.UNSIGNED,
      allowNull: true
    },
    cell_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: true,
      references: {
        model: 's2cell',
        key: 'id'
      }
    },
    deleted: {
      type: DataTypes.TINYINT.UNSIGNED,
      allowNull: false,
      defaultValue: 0
    },
    total_cp: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    first_seen_timestamp: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false
    },
    raid_pokemon_gender: {
      type: DataTypes.TINYINT.UNSIGNED,
      allowNull: true
    },
    sponsor_id: {
      type: DataTypes.SMALLINT.UNSIGNED,
      allowNull: true
    },
    raid_pokemon_costume: {
      type: DataTypes.SMALLINT.UNSIGNED,
      allowNull: true
    },
    raid_pokemon_evolution: {
      type: DataTypes.TINYINT.UNSIGNED,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'gym',
    hasTrigger: true,
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
        name: "ix_raid_end_timestamp",
        using: "BTREE",
        fields: [
          { name: "raid_end_timestamp" },
        ]
      },
      {
        name: "ix_updated",
        using: "BTREE",
        fields: [
          { name: "updated" },
        ]
      },
      {
        name: "ix_raid_pokemon_id",
        using: "BTREE",
        fields: [
          { name: "raid_pokemon_id" },
        ]
      },
      {
        name: "fk_gym_cell_id",
        using: "BTREE",
        fields: [
          { name: "cell_id" },
        ]
      },
      {
        name: "ix_gym_deleted",
        using: "BTREE",
        fields: [
          { name: "deleted" },
        ]
      },
    ]
  });
  return gym;
  }
}
