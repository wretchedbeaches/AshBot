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

export type devicePk = 'uuid';
export type deviceId = device[devicePk];
export type deviceCreationAttributes = Optional<deviceAttributes, devicePk>;

export class device extends Model<deviceAttributes, deviceCreationAttributes> implements deviceAttributes {
	public uuid!: string;
	public instance_name?: string;
	public last_host?: string;
	public last_seen!: number;
	public account_username?: string;
	public last_lat?: number;
	public last_lon?: number;

	// device hasMany assignment
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
	// device belongsTo account
	public account!: account;
	public getaccount!: Sequelize.BelongsToGetAssociationMixin<account>;
	public setaccount!: Sequelize.BelongsToSetAssociationMixin<account, accountId>;
	public createaccount!: Sequelize.BelongsToCreateAssociationMixin<account>;
	// device belongsTo instance
	public instance!: instance;
	public getinstance!: Sequelize.BelongsToGetAssociationMixin<instance>;
	public setinstance!: Sequelize.BelongsToSetAssociationMixin<instance, instanceId>;
	public createinstance!: Sequelize.BelongsToCreateAssociationMixin<instance>;
	// device hasMany device_group_device
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
	// device belongsToMany device_group
	public device_groups!: device_group[];
	public getdevice_groups!: Sequelize.BelongsToManyGetAssociationsMixin<device_group>;
	public setdevice_groups!: Sequelize.BelongsToManySetAssociationsMixin<device_group, device_groupId>;
	public adddevice_group!: Sequelize.BelongsToManyAddAssociationMixin<device_group, device_groupId>;
	public adddevice_groups!: Sequelize.BelongsToManyAddAssociationsMixin<device_group, device_groupId>;
	public createdevice_group!: Sequelize.BelongsToManyCreateAssociationMixin<device_group>;
	public removedevice_group!: Sequelize.BelongsToManyRemoveAssociationMixin<device_group, device_groupId>;
	public removedevice_groups!: Sequelize.BelongsToManyRemoveAssociationsMixin<device_group, device_groupId>;
	public hasdevice_group!: Sequelize.BelongsToManyHasAssociationMixin<device_group, device_groupId>;
	public hasdevice_groups!: Sequelize.BelongsToManyHasAssociationsMixin<device_group, device_groupId>;
	public countdevice_groups!: Sequelize.BelongsToManyCountAssociationsMixin;

	public static initModel(sequelize: Sequelize.Sequelize): typeof device {
		device.init(
			{
				uuid: {
					type: DataTypes.STRING(40),
					allowNull: false,
					primaryKey: true,
				},
				instance_name: {
					type: DataTypes.STRING(30),
					allowNull: true,
					references: {
						model: 'instance',
						key: 'name',
					},
				},
				last_host: {
					type: DataTypes.STRING(30),
					allowNull: true,
				},
				last_seen: {
					type: DataTypes.INTEGER.UNSIGNED,
					allowNull: false,
					defaultValue: 0,
				},
				account_username: {
					type: DataTypes.STRING(32),
					allowNull: true,
					references: {
						model: 'account',
						key: 'username',
					},
					unique: 'fk_account_username',
				},
				last_lat: {
					type: DataTypes.DOUBLE,
					allowNull: true,
					defaultValue: 0,
				},
				last_lon: {
					type: DataTypes.DOUBLE,
					allowNull: true,
					defaultValue: 0,
				},
			},
			{
				sequelize,
				tableName: 'device',
				timestamps: false,
				indexes: [
					{
						name: 'PRIMARY',
						unique: true,
						using: 'BTREE',
						fields: [{ name: 'uuid' }],
					},
					{
						name: 'uk_iaccount_username',
						unique: true,
						using: 'BTREE',
						fields: [{ name: 'account_username' }],
					},
					{
						name: 'fk_instance_name',
						using: 'BTREE',
						fields: [{ name: 'instance_name' }],
					},
				],
			},
		);
		return device;
	}
}
