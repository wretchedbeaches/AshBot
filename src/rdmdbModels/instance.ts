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
export type instanceCreationAttributes = Optional<instanceAttributes, instancePk>;

export class instance extends Model<instanceAttributes, instanceCreationAttributes> implements instanceAttributes {
	public name!: string;
	public type!: any;
	public data!: string;

	// instance hasMany assignment
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
	// instance hasMany device
	public devices!: device[];
	public getdevices!: Sequelize.HasManyGetAssociationsMixin<device>;
	public setdevices!: Sequelize.HasManySetAssociationsMixin<device, deviceId>;
	public adddevice!: Sequelize.HasManyAddAssociationMixin<device, deviceId>;
	public adddevices!: Sequelize.HasManyAddAssociationsMixin<device, deviceId>;
	public createdevice!: Sequelize.HasManyCreateAssociationMixin<device>;
	public removedevice!: Sequelize.HasManyRemoveAssociationMixin<device, deviceId>;
	public removedevices!: Sequelize.HasManyRemoveAssociationsMixin<device, deviceId>;
	public hasdevice!: Sequelize.HasManyHasAssociationMixin<device, deviceId>;
	public hasdevices!: Sequelize.HasManyHasAssociationsMixin<device, deviceId>;
	public countdevices!: Sequelize.HasManyCountAssociationsMixin;

	public static initModel(sequelize: Sequelize.Sequelize): typeof instance {
		instance.init(
			{
				name: {
					type: DataTypes.STRING(30),
					allowNull: false,
					primaryKey: true,
				},
				type: {
					type: "ENUM('circle_pokemon','circle_raid','circle_smart_raid','auto_quest','pokemon_iv','leveling')",
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
			},
		);
		return instance;
	}
}
