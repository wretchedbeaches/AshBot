import Sequelize, { DataTypes, Model, Optional } from 'sequelize';
import type { group, groupId } from './group';

export interface discord_ruleAttributes {
	priority: number;
	server_id: number;
	role_id?: number;
	group_name: string;
}

export type discord_rulePk = 'priority';
export type discord_ruleId = discord_rule[discord_rulePk];
export type discord_ruleCreationAttributes = Optional<discord_ruleAttributes, discord_rulePk>;

export class discord_rule
	extends Model<discord_ruleAttributes, discord_ruleCreationAttributes>
	implements discord_ruleAttributes
{
	public priority!: number;
	public server_id!: number;
	public role_id?: number;
	public group_name!: string;

	// discord_rule belongsTo group
	public group!: group;
	public getgroup!: Sequelize.BelongsToGetAssociationMixin<group>;
	public setgroup!: Sequelize.BelongsToSetAssociationMixin<group, groupId>;
	public creategroup!: Sequelize.BelongsToCreateAssociationMixin<group>;

	public static initModel(sequelize: Sequelize.Sequelize): typeof discord_rule {
		discord_rule.init(
			{
				priority: {
					type: DataTypes.INTEGER,
					allowNull: false,
					primaryKey: true,
				},
				server_id: {
					type: DataTypes.BIGINT.UNSIGNED,
					allowNull: false,
				},
				role_id: {
					type: DataTypes.BIGINT.UNSIGNED,
					allowNull: true,
				},
				group_name: {
					type: DataTypes.STRING(32),
					allowNull: false,
					references: {
						model: 'group',
						key: 'name',
					},
				},
			},
			{
				sequelize,
				tableName: 'discord_rule',
				timestamps: false,
				indexes: [
					{
						name: 'PRIMARY',
						unique: true,
						using: 'BTREE',
						fields: [{ name: 'priority' }],
					},
					{
						name: 'group_name',
						using: 'BTREE',
						fields: [{ name: 'group_name' }],
					},
				],
			},
		);
		return discord_rule;
	}
}
