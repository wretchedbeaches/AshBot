import { MessageEmbed, Permissions, CommandInteraction } from 'discord.js';
import { stripIndents } from 'common-tags';
import * as moment from 'moment';
import 'moment-duration-format';
import Command from '../../struct/commands/Command';

export default class WhoIsCommand extends Command {
	public constructor() {
		super('whois', {
			scope: 'guild',
			description: {
				content: 'Gets info about a member.',
				usage: '[member]',
				examples: ['whois Meatloaf Dispenser', 'user @BEACH', 'member 463869229850951680'],
			},
			category: 'Utilities',
			rateLimit: 2,
			clientPermissions: [Permissions.FLAGS.MANAGE_MESSAGES],
		});
		this.data.addUserOption((userOption) =>
			userOption.setName('member').setDescription('The member to get info for.').setRequired(true),
		);
	}

	public async execute(interaction: CommandInteraction) {
		const userArgument = interaction.options.getUser('member', true);
		const member = await interaction.guild?.members.fetch(userArgument.id);
		const embed = new MessageEmbed()
			.setColor('#0000ff')
			.setDescription(`Info about **${userArgument.tag}** (ID: ${member!.id})`)
			.addField(
				'❯ Member Details',
				stripIndents`
				${member!.nickname === null ? '• No nickname' : ` • Nickname: ${member!.nickname}`}
				• Roles: ${member!.roles.cache.map((roles): string => `\`${roles.name}\``).join(' ')}
                • Status: ${member!.presence?.status.toUpperCase()}
                • Activity: ${member!.presence?.activities[0] ? member!.presence.activities[0].name : 'None'}
				• Joined at: ${moment.utc(member!.joinedAt).format('YYYY/MM/DD hh:mm:ss')}
            `,
			)
			.addField(
				'❯ User Details',
				stripIndents`
				• ID: ${userArgument.id}
				• Username: ${userArgument.tag}
				• Created at: ${moment.utc(userArgument.createdAt).format('YYYY/MM/DD hh:mm:ss')}${
					userArgument.bot ? '\n• Bot account' : ''
				}
            `,
			)
			.setThumbnail(userArgument.displayAvatarURL());
		return interaction.editReply({ embeds: [embed] });
	}
}
