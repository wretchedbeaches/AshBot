import Sequelize, { DataTypes, Model, Optional } from 'sequelize';

export interface web_sessionAttributes {
	token: string;
	userid?: string;
	created: number;
	updated: number;
	idle: number;
	data?: string;
	ipaddress?: string;
	useragent?: string;
}

export type web_sessionPk = 'token';
export type web_sessionId = web_session[web_sessionPk];
export type web_sessionCreationAttributes = Optional<web_sessionAttributes, web_sessionPk>;

export class web_session
	extends Model<web_sessionAttributes, web_sessionCreationAttributes>
	implements web_sessionAttributes
{
	public token!: string;
	public userid?: string;
	public created!: number;
	public updated!: number;
	public idle!: number;
	public data?: string;
	public ipaddress?: string;
	public useragent?: string;

	public static initModel(sequelize: Sequelize.Sequelize): typeof web_session {
		web_session.init(
			{
				token: {
					type: DataTypes.STRING(255),
					allowNull: false,
					primaryKey: true,
				},
				userid: {
					type: DataTypes.STRING(255),
					allowNull: true,
				},
				created: {
					type: DataTypes.INTEGER,
					allowNull: false,
					defaultValue: 0,
				},
				updated: {
					type: DataTypes.INTEGER,
					allowNull: false,
					defaultValue: 0,
				},
				idle: {
					type: DataTypes.INTEGER,
					allowNull: false,
					defaultValue: 0,
				},
				data: {
					type: DataTypes.TEXT,
					allowNull: true,
				},
				ipaddress: {
					type: DataTypes.STRING(255),
					allowNull: true,
				},
				useragent: {
					type: DataTypes.TEXT,
					allowNull: true,
				},
			},
			{
				sequelize,
				tableName: 'web_session',
				timestamps: false,
				indexes: [
					{
						name: 'PRIMARY',
						unique: true,
						using: 'BTREE',
						fields: [{ name: 'token' }],
					},
				],
			},
		);
		return web_session;
	}
}
