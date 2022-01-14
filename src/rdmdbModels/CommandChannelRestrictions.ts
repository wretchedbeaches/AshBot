import Sequelize, { DataTypes, Model, Optional } from 'sequelize';

export interface CommandChannelRestrictionAttributes {
	guildId: string;
	commandName: string;
	channel: string;
}

export type CommandChannelRestrictionsKey = 'guildId' | 'commandName';
export type CommandChannelRestrictionCreationAttributes = Optional<
	CommandChannelRestrictionAttributes,
	CommandChannelRestrictionsKey
>;

export class CommandChannelRestrictions
	extends Model<CommandChannelRestrictionAttributes, CommandChannelRestrictionCreationAttributes>
	implements CommandChannelRestrictions
{
	public guildId: string;
	public commandName: string;
	public channel: string;

	public static initModel(sequelize: Sequelize.Sequelize): typeof CommandChannelRestrictions {
		CommandChannelRestrictions.init(
			{
				guildId: {
					type: DataTypes.STRING(35),
					allowNull: false,
					primaryKey: true,
				},
				commandName: {
					type: DataTypes.STRING(100),
					allowNull: false,
					primaryKey: true,
				},
				channel: {
					type: DataTypes.STRING(35),
					allowNull: true,
				},
			},
			{
				sequelize,
				tableName: 'guild_command_settings',
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
		return CommandChannelRestrictions;
	}
}
