import Sequelize, { DataTypes, Model, Optional } from 'sequelize';
import type { assignment, assignmentId } from './assignment';
import type { device, deviceId } from './device';
import type { device_group_device, device_group_deviceId } from './device_group_device';

export interface device_groupAttributes {
	name: string;
}

export type device_groupPk = 'name';
export type device_groupId = device_group[device_groupPk];
export type device_groupCreationAttributes = Optional<device_groupAttributes, device_groupPk>;

export class device_group
	extends Model<device_groupAttributes, device_groupCreationAttributes>
	implements device_groupAttributes
{
	public name!: string;

	// device_group hasMany assignment
	public assignments!: assignment[];
	public getassignments!: Sequelize.HasManyGetAssociationsMixin<assignment>;
	public setassignments!: Sequelize.HasManySetAssociationsMixin<assignment, assignmentId>;
	public addassignment!: Sequelize.HasManyAddAssociationMixin<assignment, assignmentId>;
	public addassignments!: Sequelize.HasManyAddAssociationsMixin<assignment, assignmentId>;
	public createassignment!: Sequelize.HasManyCreateAssociationMixin<assignment>;
	public removeassignment!: Sequelize.HasManyRemoveAssociationMixin<assignment, assignmentId>;
	public removeassignments!: Sequelize.HasManyRemoveAssociationsMixin<assignment, assignmentId>;
	public hasassignment!: Sequelize.HasManyHasAssociationMixin<assignment, assignmentId>;
	public hasassignments!: Sequelize.HasManyHasAssociationsMixin<assignment, assignmentId>;
	public countassignments!: Sequelize.HasManyCountAssociationsMixin;
	// device_group hasMany device_group_device
	public device_group_devices!: device_group_device[];
	public getdevice_group_devices!: Sequelize.HasManyGetAssociationsMixin<device_group_device>;
	public setdevice_group_devices!: Sequelize.HasManySetAssociationsMixin<device_group_device, device_group_deviceId>;
	public adddevice_group_device!: Sequelize.HasManyAddAssociationMixin<device_group_device, device_group_deviceId>;
	public adddevice_group_devices!: Sequelize.HasManyAddAssociationsMixin<device_group_device, device_group_deviceId>;
	public createdevice_group_device!: Sequelize.HasManyCreateAssociationMixin<device_group_device>;
	public removedevice_group_device!: Sequelize.HasManyRemoveAssociationMixin<
		device_group_device,
		device_group_deviceId
	>;

	public removedevice_group_devices!: Sequelize.HasManyRemoveAssociationsMixin<
		device_group_device,
		device_group_deviceId
	>;

	public hasdevice_group_device!: Sequelize.HasManyHasAssociationMixin<device_group_device, device_group_deviceId>;
	public hasdevice_group_devices!: Sequelize.HasManyHasAssociationsMixin<device_group_device, device_group_deviceId>;
	public countdevice_group_devices!: Sequelize.HasManyCountAssociationsMixin;
	// device_group belongsToMany device
	public devices!: device[];
	public getdevices!: Sequelize.BelongsToManyGetAssociationsMixin<device>;
	public setdevices!: Sequelize.BelongsToManySetAssociationsMixin<device, deviceId>;
	public adddevice!: Sequelize.BelongsToManyAddAssociationMixin<device, deviceId>;
	public adddevices!: Sequelize.BelongsToManyAddAssociationsMixin<device, deviceId>;
	public createdevice!: Sequelize.BelongsToManyCreateAssociationMixin<device>;
	public removedevice!: Sequelize.BelongsToManyRemoveAssociationMixin<device, deviceId>;
	public removedevices!: Sequelize.BelongsToManyRemoveAssociationsMixin<device, deviceId>;
	public hasdevice!: Sequelize.BelongsToManyHasAssociationMixin<device, deviceId>;
	public hasdevices!: Sequelize.BelongsToManyHasAssociationsMixin<device, deviceId>;
	public countdevices!: Sequelize.BelongsToManyCountAssociationsMixin;

	public static initModel(sequelize: Sequelize.Sequelize): typeof device_group {
		device_group.init(
			{
				name: {
					type: DataTypes.STRING(30),
					allowNull: false,
					primaryKey: true,
				},
			},
			{
				sequelize,
				tableName: 'device_group',
				timestamps: false,
				indexes: [
					{
						name: 'PRIMARY',
						unique: true,
						using: 'BTREE',
						fields: [{ name: 'name' }],
					},
					{
						name: 'name',
						unique: true,
						using: 'BTREE',
						fields: [{ name: 'name' }],
					},
				],
			},
		);
		return device_group;
	}
}
