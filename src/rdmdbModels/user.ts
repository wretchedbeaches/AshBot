import Sequelize, { DataTypes, Model, Optional } from 'sequelize';
import type { group, groupId } from './group';
import type { token, tokenId } from './token';

export interface userAttributes {
	username: string;
	email: string;
	password: string;
	discord_id?: number;
	email_verified?: number;
	group_name: string;
}

export type userPk = 'username';
export type userId = user[userPk];
export type userCreationAttributes = Optional<userAttributes, userPk>;

export class user extends Model<userAttributes, userCreationAttributes> implements userAttributes {
	public username!: string;
	public email!: string;
	public password!: string;
	public discord_id?: number;
	public email_verified?: number;
	public group_name!: string;

	// user hasMany token
	public tokens!: token[];
	public gettokens!: Sequelize.HasManyGetAssociationsMixin<token>;
	public settokens!: Sequelize.HasManySetAssociationsMixin<token, tokenId>;
	public addtoken!: Sequelize.HasManyAddAssociationMixin<token, tokenId>;
	public addtokens!: Sequelize.HasManyAddAssociationsMixin<token, tokenId>;
	public createtoken!: Sequelize.HasManyCreateAssociationMixin<token>;
	public removetoken!: Sequelize.HasManyRemoveAssociationMixin<token, tokenId>;
	public removetokens!: Sequelize.HasManyRemoveAssociationsMixin<token, tokenId>;
	public hastoken!: Sequelize.HasManyHasAssociationMixin<token, tokenId>;
	public hastokens!: Sequelize.HasManyHasAssociationsMixin<token, tokenId>;
	public counttokens!: Sequelize.HasManyCountAssociationsMixin;
	// user belongsTo group
	public group!: group;
	public getgroup!: Sequelize.BelongsToGetAssociationMixin<group>;
	public setgroup!: Sequelize.BelongsToSetAssociationMixin<group, groupId>;
	public creategroup!: Sequelize.BelongsToCreateAssociationMixin<group>;

	public static initModel(sequelize: Sequelize.Sequelize): typeof user {
		user.init(
			{
				username: {
					type: DataTypes.STRING(32),
					allowNull: false,
					primaryKey: true,
				},
				email: {
					type: DataTypes.STRING(128),
					allowNull: false,
					unique: 'email',
				},
				password: {
					type: DataTypes.STRING(72),
					allowNull: false,
				},
				discord_id: {
					type: DataTypes.BIGINT.UNSIGNED,
					allowNull: true,
				},
				email_verified: {
					type: DataTypes.TINYINT.UNSIGNED,
					allowNull: true,
					defaultValue: 0,
				},
				group_name: {
					type: DataTypes.STRING(32),
					allowNull: false,
					defaultValue: 'default',
					references: {
						model: 'group',
						key: 'name',
					},
				},
			},
			{
				sequelize,
				tableName: 'user',
				timestamps: false,
				indexes: [
					{
						name: 'PRIMARY',
						unique: true,
						using: 'BTREE',
						fields: [{ name: 'username' }],
					},
					{
						name: 'email',
						unique: true,
						using: 'BTREE',
						fields: [{ name: 'email' }],
					},
					{
						name: 'fk_group_name',
						using: 'BTREE',
						fields: [{ name: 'group_name' }],
					},
					{
						name: 'ix_user_discord_id',
						using: 'BTREE',
						fields: [{ name: 'discord_id' }],
					},
				],
			},
		);
		return user;
	}
}
