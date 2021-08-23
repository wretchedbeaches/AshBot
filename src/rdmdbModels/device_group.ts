import Sequelize, { DataTypes, Model, Optional } from 'sequelize';
import type { assignment, assignmentId } from './assignment';
import type { device, deviceId } from './device';
import type { device_group_device, device_group_deviceId } from './device_group_device';

export interface device_groupAttributes {
  name: string;
}

export type device_groupPk = "name";
export type device_groupId = device_group[device_groupPk];
export type device_groupCreationAttributes = Optional<device_groupAttributes, device_groupPk>;

export class device_group extends Model<device_groupAttributes, device_groupCreationAttributes> implements device_groupAttributes {
  name!: string;

  // device_group hasMany assignment
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
  // device_group hasMany device_group_device
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
  // device_group belongsToMany device
  devices!: device[];
  getdevices!: Sequelize.BelongsToManyGetAssociationsMixin<device>;
  setdevices!: Sequelize.BelongsToManySetAssociationsMixin<device, deviceId>;
  adddevice!: Sequelize.BelongsToManyAddAssociationMixin<device, deviceId>;
  adddevices!: Sequelize.BelongsToManyAddAssociationsMixin<device, deviceId>;
  createdevice!: Sequelize.BelongsToManyCreateAssociationMixin<device>;
  removedevice!: Sequelize.BelongsToManyRemoveAssociationMixin<device, deviceId>;
  removedevices!: Sequelize.BelongsToManyRemoveAssociationsMixin<device, deviceId>;
  hasdevice!: Sequelize.BelongsToManyHasAssociationMixin<device, deviceId>;
  hasdevices!: Sequelize.BelongsToManyHasAssociationsMixin<device, deviceId>;
  countdevices!: Sequelize.BelongsToManyCountAssociationsMixin;

  static initModel(sequelize: Sequelize.Sequelize): typeof device_group {
    device_group.init({
    name: {
      type: DataTypes.STRING(30),
      allowNull: false,
      primaryKey: true
    }
  }, {
    sequelize,
    tableName: 'device_group',
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
      {
        name: "name",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "name" },
        ]
      },
    ]
  });
  return device_group;
  }
}
