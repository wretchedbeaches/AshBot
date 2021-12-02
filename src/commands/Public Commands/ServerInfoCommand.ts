import { CommandInteraction, MessageEmbed, Permissions } from 'discord.js';
import { stripIndents } from 'common-tags';
import * as moment from 'moment';
import 'moment-duration-format';
import Command from '../../struct/commands/Command';
import COMMAND_NAMES from '../../util/CommandNames';

interface HumanLevels {
	[key: number]: string;
}

const HUMAN_LEVELS: HumanLevels = {
	0: 'None',
	1: 'Low',
	2: 'Medium',
	3: '(╯°□°）╯︵ ┻━┻',
	4: '┻━┻ ﾐヽ(ಠ益ಠ)ノ彡┻━┻',
};

export default class ServerInfoCommand extends Command {
	public constructor() {
		super(COMMAND_NAMES.PUBLIC.SERVER_INFO, {
			description: {
				content: 'Gets info about a server',
			},
			category: 'Utility',
			scope: 'guild',
			clientPermissions: [Permissions.FLAGS.MANAGE_MESSAGES],
			rateLimit: 2,
		});
	}

	public async execute(interaction: CommandInteraction) {
		const guild = interaction.guild!;
		const guildOwner = await guild.fetchOwner();
		const embed = new MessageEmbed()
			.setColor('#0000ff')
			.setDescription(`Info about **${guild.name}** (ID: ${guild.id})`)
			.addField(
				'❯ Channels',
				stripIndents`
                • ${guild.channels.cache.filter((ch): boolean => ch.type === 'GUILD_TEXT').size} Text, ${
					guild.channels.cache.filter((ch): boolean => ch.type === 'GUILD_VOICE').size
				} Voice
                • AFK: ${guild.afkChannelId ? `<#${guild.afkChannelId}> after ${guild.afkTimeout / 60}min` : 'None'}
            `,
			)
			.addField(
				'❯ Members',
				stripIndents`
                • ${guild.memberCount} members
                • Owner: ${guildOwner.user.tag} (ID: ${guildOwner.id})
            `,
			)
			.addField(
				'❯ Other',
				stripIndents`
                • Roles: ${guild.roles.cache.size}
                • Created at: ${moment.utc(guild.createdAt).format('YYYY/MM/DD hh:mm:ss')}
                • Verification Level: ${HUMAN_LEVELS[guild.verificationLevel as unknown as number]}
            `,
			)
			.setThumbnail(guild.iconURL()!);

		return interaction.editReply({ embeds: [embed] });
	}
}
