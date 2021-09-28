import Sequelize, { DataTypes, Model, Optional } from 'sequelize';
import type { device, deviceId } from './device';
import type { device_group, device_groupId } from './device_group';

export interface device_group_deviceAttributes {
	device_group_name: string;
	device_uuid: string;
}

export type device_group_devicePk = 'device_group_name' | 'device_uuid';
export type device_group_deviceId = device_group_device[device_group_devicePk];
export type device_group_deviceCreationAttributes = Optional<device_group_deviceAttributes, device_group_devicePk>;

export class device_group_device
	extends Model<device_group_deviceAttributes, device_group_deviceCreationAttributes>
	implements device_group_deviceAttributes
{
	public device_group_name!: string;
	public device_uuid!: string;

	// device_group_device belongsTo device_group
	public device_group!: device_group;
	public getdevice_group!: Sequelize.BelongsToGetAssociationMixin<device_group>;
	public setdevice_group!: Sequelize.BelongsToSetAssociationMixin<device_group, device_groupId>;
	public createdevice_group!: Sequelize.BelongsToCreateAssociationMixin<device_group>;
	// device_group_device belongsTo device
	public device!: device;
	public getdevice!: Sequelize.BelongsToGetAssociationMixin<device>;
	public setdevice!: Sequelize.BelongsToSetAssociationMixin<device, deviceId>;
	public createdevice!: Sequelize.BelongsToCreateAssociationMixin<device>;

	public static initModel(sequelize: Sequelize.Sequelize): typeof device_group_device {
		device_group_device.init(
			{
				device_group_name: {
					type: DataTypes.STRING(30),
					allowNull: false,
					primaryKey: true,
					references: {
						model: 'device_group',
						key: 'name',
					},
				},
				device_uuid: {
					type: DataTypes.STRING(40),
					allowNull: false,
					primaryKey: true,
					references: {
						model: 'device',
						key: 'uuid',
					},
				},
			},
			{
				sequelize,
				tableName: 'device_group_device',
				timestamps: false,
				indexes: [
					{
						name: 'PRIMARY',
						unique: true,
						using: 'BTREE',
						fields: [{ name: 'device_group_name' }, { name: 'device_uuid' }],
					},
					{
						name: 'device_group_device_fk_device_uuid',
						using: 'BTREE',
						fields: [{ name: 'device_uuid' }],
					},
				],
			},
		);
		return device_group_device;
	}
}
