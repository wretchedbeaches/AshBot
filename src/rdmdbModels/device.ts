import Sequelize, { DataTypes, Model, Optional } from 'sequelize';
import type { account, accountId } from './account';
import type { assignment, assignmentId } from './assignment';
import type { device_group, device_groupId } from './device_group';
import type { device_group_device, device_group_deviceId } from './device_group_device';
import type { instance, instanceId } from './instance';

export interface deviceAttributes {
  uuid: string;
  instance_name?: string;
  last_host?: string;
  last_seen: number;
  account_username?: string;
  last_lat?: number;
  last_lon?: number;
}

export type devicePk = "uuid";
export type deviceId = device[devicePk];
export type deviceCreationAttributes = Optional<deviceAttributes, devicePk>;

export class device extends Model<deviceAttributes, deviceCreationAttributes> implements deviceAttributes {
  uuid!: string;
  instance_name?: string;
  last_host?: string;
  last_seen!: number;
  account_username?: string;
  last_lat?: number;
  last_lon?: number;

  // device hasMany assignment
  assignments!: assignment[];
  getassignments!: Sequelize.HasManyGetAssociationsMixin<assignment>;
  setassignments!: Sequelize.HasManySetAssociationsMixin<assignment, assignmentId>;
  addassignment!: Sequelize.HasManyAddAssociationMixin<assignment, assignmentId>;
  addassignments!: Sequelize.HasManyAddAssociationsMixin<assignment, assignmentId>;
  createassignment!: Sequelize.HasManyCreateAssociationMixin<assignment>;
  removeassignment!: Sequelize.HasManyRemoveAssociationMixin<assignment, assignmentId>;
  removeassignments!: Sequelize.HasManyRemoveAssociationsMixin<assignment, assignmentId>;
  hasassignment!: Sequelize.HasManyHasAssociationMixin<assignment, assignmentId>;
  hasassignments!: Sequelize.HasManyHasAssociationsMixin<assignment, assignmentId>;
  countassignments!: Sequelize.HasManyCountAssociationsMixin;
  // device belongsTo account
  account!: account;
  getaccount!: Sequelize.BelongsToGetAssociationMixin<account>;
  setaccount!: Sequelize.BelongsToSetAssociationMixin<account, accountId>;
  createaccount!: Sequelize.BelongsToCreateAssociationMixin<account>;
  // device belongsTo instance
  instance!: instance;
  getinstance!: Sequelize.BelongsToGetAssociationMixin<instance>;
  setinstance!: Sequelize.BelongsToSetAssociationMixin<instance, instanceId>;
  createinstance!: Sequelize.BelongsToCreateAssociationMixin<instance>;
  // device hasMany device_group_device
  device_group_devices!: device_group_device[];
  getdevice_group_devices!: Sequelize.HasManyGetAssociationsMixin<device_group_device>;
  setdevice_group_devices!: Sequelize.HasManySetAssociationsMixin<device_group_device, device_group_deviceId>;
  adddevice_group_device!: Sequelize.HasManyAddAssociationMixin<device_group_device, device_group_deviceId>;
  adddevice_group_devices!: Sequelize.HasManyAddAssociationsMixin<device_group_device, device_group_deviceId>;
  createdevice_group_device!: Sequelize.HasManyCreateAssociationMixin<device_group_device>;
  removedevice_group_device!: Sequelize.HasManyRemoveAssociationMixin<device_group_device, device_group_deviceId>;
  removedevice_group_devices!: Sequelize.HasManyRemoveAssociationsMixin<device_group_device, device_group_deviceId>;
  hasdevice_group_device!: Sequelize.HasManyHasAssociationMixin<device_group_device, device_group_deviceId>;
  hasdevice_group_devices!: Sequelize.HasManyHasAssociationsMixin<device_group_device, device_group_deviceId>;
  countdevice_group_devices!: Sequelize.HasManyCountAssociationsMixin;
  // device belongsToMany device_group
  device_groups!: device_group[];
  getdevice_groups!: Sequelize.BelongsToManyGetAssociationsMixin<device_group>;
  setdevice_groups!: Sequelize.BelongsToManySetAssociationsMixin<device_group, device_groupId>;
  adddevice_group!: Sequelize.BelongsToManyAddAssociationMixin<device_group, device_groupId>;
  adddevice_groups!: Sequelize.BelongsToManyAddAssociationsMixin<device_group, device_groupId>;
  createdevice_group!: Sequelize.BelongsToManyCreateAssociationMixin<device_group>;
  removedevice_group!: Sequelize.BelongsToManyRemoveAssociationMixin<device_group, device_groupId>;
  removedevice_groups!: Sequelize.BelongsToManyRemoveAssociationsMixin<device_group, device_groupId>;
  hasdevice_group!: Sequelize.BelongsToManyHasAssociationMixin<device_group, device_groupId>;
  hasdevice_groups!: Sequelize.BelongsToManyHasAssociationsMixin<device_group, device_groupId>;
  countdevice_groups!: Sequelize.BelongsToManyCountAssociationsMixin;

  static initModel(sequelize: Sequelize.Sequelize): typeof device {
    device.init({
    uuid: {
      type: DataTypes.STRING(40),
      allowNull: false,
      primaryKey: true
    },
    instance_name: {
      type: DataTypes.STRING(30),
      allowNull: true,
      references: {
        model: 'instance',
        key: 'name'
      }
    },
    last_host: {
      type: DataTypes.STRING(30),
      allowNull: true
    },
    last_seen: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 0
    },
    account_username: {
      type: DataTypes.STRING(32),
      allowNull: true,
      references: {
        model: 'account',
        key: 'username'
      },
      unique: "fk_account_username"
    },
    last_lat: {
      type: DataTypes.DOUBLE,
      allowNull: true,
      defaultValue: 0
    },
    last_lon: {
      type: DataTypes.DOUBLE,
      allowNull: true,
      defaultValue: 0
    }
  }, {
    sequelize,
    tableName: 'device',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "uuid" },
        ]
      },
      {
        name: "uk_iaccount_username",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "account_username" },
        ]
      },
      {
        name: "fk_instance_name",
        using: "BTREE",
        fields: [
          { name: "instance_name" },
        ]
      },
    ]
  });
  return device;
  }
}
