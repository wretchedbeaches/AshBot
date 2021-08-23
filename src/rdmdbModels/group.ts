import Sequelize, { DataTypes, Model, Optional } from 'sequelize';
import type { discord_rule, discord_ruleId } from './discord_rule';
import type { user, userId } from './user';

export interface groupAttributes {
  name: string;
  perm_view_map: number;
  perm_view_map_raid: number;
  perm_view_map_pokemon: number;
  perm_view_stats: number;
  perm_admin: number;
  perm_view_map_gym: number;
  perm_view_map_pokestop: number;
  perm_view_map_spawnpoint: number;
  perm_view_map_quest: number;
  perm_view_map_iv: number;
  perm_view_map_cell: number;
  perm_view_map_lure: number;
  perm_view_map_invasion: number;
  perm_view_map_device: number;
  perm_view_map_weather: number;
  perm_view_map_submission_cell: number;
  perm_view_map_event_pokemon: number;
}

export type groupPk = "name";
export type groupId = group[groupPk];
export type groupCreationAttributes = Optional<groupAttributes, groupPk>;

export class group extends Model<groupAttributes, groupCreationAttributes> implements groupAttributes {
  name!: string;
  perm_view_map!: number;
  perm_view_map_raid!: number;
  perm_view_map_pokemon!: number;
  perm_view_stats!: number;
  perm_admin!: number;
  perm_view_map_gym!: number;
  perm_view_map_pokestop!: number;
  perm_view_map_spawnpoint!: number;
  perm_view_map_quest!: number;
  perm_view_map_iv!: number;
  perm_view_map_cell!: number;
  perm_view_map_lure!: number;
  perm_view_map_invasion!: number;
  perm_view_map_device!: number;
  perm_view_map_weather!: number;
  perm_view_map_submission_cell!: number;
  perm_view_map_event_pokemon!: number;

  // group hasMany discord_rule
  discord_rules!: discord_rule[];
  getdiscord_rules!: Sequelize.HasManyGetAssociationsMixin<discord_rule>;
  setdiscord_rules!: Sequelize.HasManySetAssociationsMixin<discord_rule, discord_ruleId>;
  adddiscord_rule!: Sequelize.HasManyAddAssociationMixin<discord_rule, discord_ruleId>;
  adddiscord_rules!: Sequelize.HasManyAddAssociationsMixin<discord_rule, discord_ruleId>;
  creatediscord_rule!: Sequelize.HasManyCreateAssociationMixin<discord_rule>;
  removediscord_rule!: Sequelize.HasManyRemoveAssociationMixin<discord_rule, discord_ruleId>;
  removediscord_rules!: Sequelize.HasManyRemoveAssociationsMixin<discord_rule, discord_ruleId>;
  hasdiscord_rule!: Sequelize.HasManyHasAssociationMixin<discord_rule, discord_ruleId>;
  hasdiscord_rules!: Sequelize.HasManyHasAssociationsMixin<discord_rule, discord_ruleId>;
  countdiscord_rules!: Sequelize.HasManyCountAssociationsMixin;
  // group hasMany user
  users!: user[];
  getusers!: Sequelize.HasManyGetAssociationsMixin<user>;
  setusers!: Sequelize.HasManySetAssociationsMixin<user, userId>;
  adduser!: Sequelize.HasManyAddAssociationMixin<user, userId>;
  addusers!: Sequelize.HasManyAddAssociationsMixin<user, userId>;
  createuser!: Sequelize.HasManyCreateAssociationMixin<user>;
  removeuser!: Sequelize.HasManyRemoveAssociationMixin<user, userId>;
  removeusers!: Sequelize.HasManyRemoveAssociationsMixin<user, userId>;
  hasuser!: Sequelize.HasManyHasAssociationMixin<user, userId>;
  hasusers!: Sequelize.HasManyHasAssociationsMixin<user, userId>;
  countusers!: Sequelize.HasManyCountAssociationsMixin;

  static initModel(sequelize: Sequelize.Sequelize): typeof group {
    group.init({
    name: {
      type: DataTypes.STRING(32),
      allowNull: false,
      primaryKey: true
    },
    perm_view_map: {
      type: DataTypes.TINYINT.UNSIGNED,
      allowNull: false
    },
    perm_view_map_raid: {
      type: DataTypes.TINYINT.UNSIGNED,
      allowNull: false
    },
    perm_view_map_pokemon: {
      type: DataTypes.TINYINT.UNSIGNED,
      allowNull: false
    },
    perm_view_stats: {
      type: DataTypes.TINYINT.UNSIGNED,
      allowNull: false
    },
    perm_admin: {
      type: DataTypes.TINYINT.UNSIGNED,
      allowNull: false
    },
    perm_view_map_gym: {
      type: DataTypes.TINYINT.UNSIGNED,
      allowNull: false
    },
    perm_view_map_pokestop: {
      type: DataTypes.TINYINT.UNSIGNED,
      allowNull: false
    },
    perm_view_map_spawnpoint: {
      type: DataTypes.TINYINT.UNSIGNED,
      allowNull: false
    },
    perm_view_map_quest: {
      type: DataTypes.TINYINT.UNSIGNED,
      allowNull: false
    },
    perm_view_map_iv: {
      type: DataTypes.TINYINT.UNSIGNED,
      allowNull: false
    },
    perm_view_map_cell: {
      type: DataTypes.TINYINT.UNSIGNED,
      allowNull: false
    },
    perm_view_map_lure: {
      type: DataTypes.TINYINT.UNSIGNED,
      allowNull: false
    },
    perm_view_map_invasion: {
      type: DataTypes.TINYINT.UNSIGNED,
      allowNull: false
    },
    perm_view_map_device: {
      type: DataTypes.TINYINT.UNSIGNED,
      allowNull: false
    },
    perm_view_map_weather: {
      type: DataTypes.TINYINT.UNSIGNED,
      allowNull: false
    },
    perm_view_map_submission_cell: {
      type: DataTypes.TINYINT.UNSIGNED,
      allowNull: false
    },
    perm_view_map_event_pokemon: {
      type: DataTypes.TINYINT.UNSIGNED,
      allowNull: false
    }
  }, {
    sequelize,
    tableName: 'group',
    hasTrigger: true,
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "name" },
        ]
      },
    ]
  });
  return group;
  }
}
