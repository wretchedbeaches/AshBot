import Sequelize, { DataTypes, Model, Optional } from 'sequelize';
import type { device, deviceId } from './device';
import type { device_group, device_groupId } from './device_group';
import type { instance, instanceId } from './instance';

export interface assignmentAttributes {
  device_uuid?: string;
  instance_name: string;
  time: number;
  enabled: number;
  id: number;
  device_group_name?: string;
  source_instance_name?: string;
  date?: string;
}

export type assignmentPk = 'id';
export type assignmentId = assignment[assignmentPk];
export type assignmentCreationAttributes = Optional<
  assignmentAttributes,
  assignmentPk
>;

export class assignment
  extends Model<assignmentAttributes, assignmentCreationAttributes>
  implements assignmentAttributes {
  device_uuid?: string;
  instance_name!: string;
  time!: number;
  enabled!: number;
  id!: number;
  device_group_name?: string;
  source_instance_name?: string;
  date?: string;

  // assignment belongsTo device
  device!: device;
  getdevice!: Sequelize.BelongsToGetAssociationMixin<device>;
  setdevice!: Sequelize.BelongsToSetAssociationMixin<device, deviceId>;
  createdevice!: Sequelize.BelongsToCreateAssociationMixin<device>;
  // assignment belongsTo device_group
  device_group!: device_group;
  getdevice_group!: Sequelize.BelongsToGetAssociationMixin<device_group>;
  setdevice_group!: Sequelize.BelongsToSetAssociationMixin<
    device_group,
    device_groupId
  >;
  createdevice_group!: Sequelize.BelongsToCreateAssociationMixin<device_group>;
  // assignment belongsTo instance
  instance!: instance;
  getinstance!: Sequelize.BelongsToGetAssociationMixin<instance>;
  setinstance!: Sequelize.BelongsToSetAssociationMixin<instance, instanceId>;
  createinstance!: Sequelize.BelongsToCreateAssociationMixin<instance>;

  static initModel(sequelize: Sequelize.Sequelize): typeof assignment {
    assignment.init(
      {
        device_uuid: {
          type: DataTypes.STRING(40),
          allowNull: true,
          references: {
            model: 'device',
            key: 'uuid',
          },
        },
        instance_name: {
          type: DataTypes.STRING(30),
          allowNull: false,
          references: {
            model: 'instance',
            key: 'name',
          },
        },
        time: {
          type: DataTypes.MEDIUMINT.UNSIGNED,
          allowNull: false,
        },
        enabled: {
          type: DataTypes.TINYINT.UNSIGNED,
          allowNull: false,
          defaultValue: 1,
        },
        id: {
          autoIncrement: true,
          type: DataTypes.INTEGER.UNSIGNED,
          allowNull: false,
          primaryKey: true,
        },
        device_group_name: {
          type: DataTypes.STRING(30),
          allowNull: true,
          references: {
            model: 'device_group',
            key: 'name',
          },
        },
        source_instance_name: {
          type: DataTypes.STRING(30),
          allowNull: true,
          references: {
            model: 'instance',
            key: 'name',
          },
        },
        date: {
          type: DataTypes.DATEONLY,
          allowNull: true,
        },
      },
      {
        sequelize,
        tableName: 'assignment',
        timestamps: false,
        indexes: [
          {
            name: 'PRIMARY',
            unique: true,
            using: 'BTREE',
            fields: [{ name: 'id' }],
          },
          {
            name: 'assignment_unique',
            unique: true,
            using: 'BTREE',
            fields: [
              { name: 'device_uuid' },
              { name: 'device_group_name' },
              { name: 'instance_name' },
              { name: 'time' },
              { name: 'date' },
            ],
          },
          {
            name: 'assignment_fk_instance_name',
            using: 'BTREE',
            fields: [{ name: 'instance_name' }],
          },
          {
            name: 'assignment_fk_source_device_group_name',
            using: 'BTREE',
            fields: [{ name: 'device_group_name' }],
          },
          {
            name: 'assignment_fk_source_instance_name',
            using: 'BTREE',
            fields: [{ name: 'source_instance_name' }],
          },
        ],
      }
    );
    return assignment;
  }
}
