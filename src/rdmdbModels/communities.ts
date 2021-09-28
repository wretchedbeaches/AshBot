import Sequelize, { DataTypes, Model, Optional } from 'sequelize';

export interface communitiesAttributes {
	id: number;
	community_id?: string;
	title?: string;
	description?: string;
	type?: number;
	image_url?: string;
	size?: number;
	team_instinct?: number;
	team_mystic?: number;
	team_valor?: number;
	has_invite_url?: string;
	invite_url?: string;
	lat?: number;
	lon?: number;
	updated?: number;
	source?: number;
	submitted_by?: string;
}

export type communitiesPk = 'id';
export type communitiesId = communities[communitiesPk];
export type communitiesCreationAttributes = Optional<communitiesAttributes, communitiesPk>;

export class communities
	extends Model<communitiesAttributes, communitiesCreationAttributes>
	implements communitiesAttributes
{
	public id!: number;
	public community_id?: string;
	public title?: string;
	public description?: string;
	public type?: number;
	public image_url?: string;
	public size?: number;
	public team_instinct?: number;
	public team_mystic?: number;
	public team_valor?: number;
	public has_invite_url?: string;
	public invite_url?: string;
	public lat?: number;
	public lon?: number;
	public updated?: number;
	public source?: number;
	public submitted_by?: string;

	public static initModel(sequelize: Sequelize.Sequelize): typeof communities {
		communities.init(
			{
				id: {
					autoIncrement: true,
					type: DataTypes.INTEGER,
					allowNull: false,
					primaryKey: true,
				},
				community_id: {
					type: DataTypes.STRING(35),
					allowNull: true,
					unique: 'community_id',
				},
				title: {
					type: DataTypes.STRING(64),
					allowNull: true,
				},
				description: {
					type: DataTypes.STRING(256),
					allowNull: true,
				},
				type: {
					type: DataTypes.TINYINT,
					allowNull: true,
				},
				image_url: {
					type: DataTypes.STRING(200),
					allowNull: true,
				},
				size: {
					type: DataTypes.SMALLINT,
					allowNull: true,
				},
				team_instinct: {
					type: DataTypes.TINYINT,
					allowNull: true,
				},
				team_mystic: {
					type: DataTypes.TINYINT,
					allowNull: true,
				},
				team_valor: {
					type: DataTypes.TINYINT,
					allowNull: true,
				},
				has_invite_url: {
					type: DataTypes.STRING(4),
					allowNull: true,
				},
				invite_url: {
					type: DataTypes.STRING(512),
					allowNull: true,
				},
				lat: {
					type: DataTypes.DOUBLE(18, 14),
					allowNull: true,
				},
				lon: {
					type: DataTypes.DOUBLE(18, 14),
					allowNull: true,
				},
				updated: {
					type: DataTypes.BIGINT,
					allowNull: true,
				},
				source: {
					type: DataTypes.TINYINT,
					allowNull: true,
				},
				submitted_by: {
					type: DataTypes.STRING(200),
					allowNull: true,
				},
			},
			{
				sequelize,
				tableName: 'communities',
				timestamps: false,
				indexes: [
					{
						name: 'PRIMARY',
						unique: true,
						using: 'BTREE',
						fields: [{ name: 'id' }],
					},
					{
						name: 'community_id',
						unique: true,
						using: 'BTREE',
						fields: [{ name: 'community_id' }],
					},
				],
			},
		);
		return communities;
	}
}
