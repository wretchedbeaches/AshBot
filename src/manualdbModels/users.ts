import Sequelize, { DataTypes, Model, Optional } from 'sequelize';

export interface usersAttributes {
	id: string;
	user: string;
	password?: string;
	temp_password?: string;
	expire_timestamp: number;
	session_id?: string;
	session_token?: string;
	login_system: string;
	access_level?: number;
	avatar?: string;
	discord_guilds?: string;
	linked_account?: string;
	last_loggedin?: number;
}

export type usersPk = 'id';
export type usersId = users[usersPk];
export type usersCreationAttributes = Optional<usersAttributes, usersPk>;

export class users extends Model<usersAttributes, usersCreationAttributes> implements usersAttributes {
	public id!: string;
	public user!: string;
	public password?: string;
	public temp_password?: string;
	public expire_timestamp!: number;
	public session_id?: string;
	public session_token?: string;
	public login_system!: string;
	public access_level?: number;
	public avatar?: string;
	public discord_guilds?: string;
	public linked_account?: string;
	public last_loggedin?: number;

	public static initModel(sequelize: Sequelize.Sequelize): typeof users {
		users.init(
			{
				id: {
					type: DataTypes.STRING(255),
					allowNull: false,
					primaryKey: true,
				},
				user: {
					type: DataTypes.STRING(250),
					allowNull: false,
				},
				password: {
					type: DataTypes.STRING(250),
					allowNull: true,
				},
				temp_password: {
					type: DataTypes.STRING(250),
					allowNull: true,
				},
				expire_timestamp: {
					type: DataTypes.INTEGER,
					allowNull: false,
				},
				session_id: {
					type: DataTypes.STRING(255),
					allowNull: true,
				},
				session_token: {
					type: DataTypes.STRING(255),
					allowNull: true,
				},
				login_system: {
					type: DataTypes.STRING(40),
					allowNull: false,
				},
				access_level: {
					type: DataTypes.TINYINT,
					allowNull: true,
				},
				avatar: {
					type: DataTypes.STRING(255),
					allowNull: true,
				},
				discord_guilds: {
					type: DataTypes.TEXT,
					allowNull: true,
				},
				linked_account: {
					type: DataTypes.STRING(255),
					allowNull: true,
				},
				last_loggedin: {
					type: DataTypes.INTEGER,
					allowNull: true,
				},
			},
			{
				sequelize,
				tableName: 'users',
				timestamps: false,
				indexes: [
					{
						name: 'PRIMARY',
						unique: true,
						using: 'BTREE',
						fields: [{ name: 'id' }],
					},
				],
			},
		);
		return users;
	}
}
