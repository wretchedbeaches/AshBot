import { CommandInteraction, MessageEmbed, Permissions } from 'discord.js';
import { stripIndents } from 'common-tags';
import moment from 'moment';
import 'moment-duration-format';
import Command from '../../struct/commands/Command';

import modulePackage from '../../../package.json';
import COMMAND_NAMES from '../../util/CommandNames';

export default class StatsCommand extends Command {
	public constructor() {
		super(COMMAND_NAMES.PUBLIC.STATS, {
			description: {
				content: 'Displays statistics about the bot.',
			},
			clientPermissions: [Permissions.FLAGS.VIEW_CHANNEL],
			rateLimit: 2,
			category: 'Utilities',
		});
	}

	public execute(interaction: CommandInteraction) {
		const memAlloc = Math.round(process.memoryUsage().heapTotal / 1024 / 1024);
		const memUsed = Math.round(process.memoryUsage().heapUsed / 1024 / 1024);
		const memPercent = ((memUsed / memAlloc) * 100).toFixed(2);
		const userCount = this.client.guilds.cache.reduce((m, g) => m + g.memberCount, 0);

		const embed: MessageEmbed = new MessageEmbed()
			.setDescription(`**${this.client.user!.username} Statistics**`)
			// @ts-ignore
			.addField('❯ Uptime', moment.duration(this.client.uptime).format('d[d ]h[h ]m[m ]s[s ]'), false)
			.addField('❯ Memory Usage', `${memUsed}MB/${memAlloc}MB (${memPercent}%)`, false)
			.addField(
				'❯ General Stats',
				stripIndents`
                • Guilds: ${this.client.guilds.cache.size}
                • Channels: ${this.client.channels.cache.size}
                • Users: ${userCount}
            `,
				true,
			)
			.addField('❯ Version', `v${modulePackage.version}`, false)
			.addField('❯ **Owner:**', ' Wretchedbeaches')
			.addField('❯ Main Discord', '[PTA Discord](https://discord.gg/29pn9RV)', true)
			.setThumbnail(this.client.user!.displayAvatarURL())
			.setFooter(`**Pokemon PTA**`);

		return interaction.editReply({ embeds: [embed] });
	}
}
