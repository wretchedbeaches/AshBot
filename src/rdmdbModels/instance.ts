import Sequelize, { DataTypes, Model, Optional } from 'sequelize';
import type { assignment, assignmentId } from './assignment';
import type { device, deviceId } from './device';

export interface instanceAttributes {
  name: string;
  type: any;
  data: string;
}

export type instancePk = 'name';
export type instanceId = instance[instancePk];
export type instanceCreationAttributes = Optional<
  instanceAttributes,
  instancePk
>;

export class instance
  extends Model<instanceAttributes, instanceCreationAttributes>
  implements instanceAttributes {
  name!: string;
  type!: any;
  data!: string;

  // instance hasMany assignment
  assignments!: assignment[];
  getassignments!: Sequelize.HasManyGetAssociationsMixin<assignment>;
  setassignments!: Sequelize.HasManySetAssociationsMixin<
    assignment,
    assignmentId
  >;
  addassignment!: Sequelize.HasManyAddAssociationMixin<
    assignment,
    assignmentId
  >;
  addassignments!: Sequelize.HasManyAddAssociationsMixin<
    assignment,
    assignmentId
  >;
  createassignment!: Sequelize.HasManyCreateAssociationMixin<assignment>;
  removeassignment!: Sequelize.HasManyRemoveAssociationMixin<
    assignment,
    assignmentId
  >;
  removeassignments!: Sequelize.HasManyRemoveAssociationsMixin<
    assignment,
    assignmentId
  >;
  hasassignment!: Sequelize.HasManyHasAssociationMixin<
    assignment,
    assignmentId
  >;
  hasassignments!: Sequelize.HasManyHasAssociationsMixin<
    assignment,
    assignmentId
  >;
  countassignments!: Sequelize.HasManyCountAssociationsMixin;
  // instance hasMany device
  devices!: device[];
  getdevices!: Sequelize.HasManyGetAssociationsMixin<device>;
  setdevices!: Sequelize.HasManySetAssociationsMixin<device, deviceId>;
  adddevice!: Sequelize.HasManyAddAssociationMixin<device, deviceId>;
  adddevices!: Sequelize.HasManyAddAssociationsMixin<device, deviceId>;
  createdevice!: Sequelize.HasManyCreateAssociationMixin<device>;
  removedevice!: Sequelize.HasManyRemoveAssociationMixin<device, deviceId>;
  removedevices!: Sequelize.HasManyRemoveAssociationsMixin<device, deviceId>;
  hasdevice!: Sequelize.HasManyHasAssociationMixin<device, deviceId>;
  hasdevices!: Sequelize.HasManyHasAssociationsMixin<device, deviceId>;
  countdevices!: Sequelize.HasManyCountAssociationsMixin;

  static initModel(sequelize: Sequelize.Sequelize): typeof instance {
    instance.init(
      {
        name: {
          type: DataTypes.STRING(30),
          allowNull: false,
          primaryKey: true,
        },
        type: {
          type:
            "ENUM('circle_pokemon','circle_raid','circle_smart_raid','auto_quest','pokemon_iv','leveling')",
          allowNull: false,
        },
        data: {
          type: DataTypes.TEXT,
          allowNull: false,
        },
      },
      {
        sequelize,
        tableName: 'instance',
        timestamps: false,
        indexes: [
          {
            name: 'PRIMARY',
            unique: true,
            using: 'BTREE',
            fields: [{ name: 'name' }],
          },
        ],
      }
    );
    return instance;
  }
}
