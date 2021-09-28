import { CommandInteraction, MessageEmbed, TextChannel } from 'discord.js';
import { Embeds } from 'discord-paginationembed';
import Command from '../../../struct/commands/Command';

export default class WebhooksCommand extends Command {
	public constructor() {
		super('webhooks', {
			description: {
				content: 'Returns a list of all webhook channels.',
				usage: 'webhooks',
				examples: ['webhooks'],
			},
			category: 'Webhooks',
			ratelimit: 3,
		});

		this.data.addChannelOption((option) =>
			option.setName('channel').setDescription('Channel to get Webhook Configuration for').setRequired(false),
		);
	}

	public async execute(interaction: CommandInteraction) {
		const channelArgument = interaction.options.getChannel('channel', false);
		// TODO: Can't 100% guarantee guildId here until figuring out guild only API logic.
		// Otherwise local guild only inhibitor logic.
		const channels = this.client.settings.get(interaction.guildId!, 'channels', {});
		const embeds: MessageEmbed[] = [];
		if (channelArgument === null) {
			for (const channelId in channels) {
				if (!channels.prototype.hasOwnProperty(channelId)) continue;
				const channel = channels[channelId];
				embeds.push(
					this.client
						.embed(interaction.guildId!)
						.setTitle(
							`Webhook Configuration For Channel ${
								((await this.client.channels.fetch(channelId)) as TextChannel).name
							}`,
						)
						.addFields(
							Object.entries(channel).map((entry) => ({
								name: entry[0],
								value: JSON.stringify(entry[1]),
								inline: true,
							})),
						),
				);
			}
		} else {
			embeds.push(
				this.client
					.embed(interaction.guildId!)
					.setTitle(`Webhook Configuration For Channel ${channelArgument.name}`)
					.addFields(
						Object.entries(channels[channelArgument.id]).map((entry) => ({
							name: entry[0],
							value: JSON.stringify(entry[1]),
							inline: true,
						})),
					),
			);
		}
		// TODO: This package is out of date - pagination will need to be significantly updated.
		await new Embeds()
			.setArray(embeds.length === 0 ? [this.client.embed(interaction.guildId!).setTitle('No webhooks set')] : embeds)
			.setAuthorizedUsers([interaction.user.id])
			.setChannel(interaction.channel as TextChannel)
			.setPageIndicator(true)
			.setTimeout(300000)
			.setPageIndicator(true)
			.build();
	}
}

// export default class WebhooksCommand extends Command {
//   public constructor() {
//     super('webhooks', {
//       aliases: ['webhooks'],
//       category: 'Webhooks',
//       description: {
//         content: 'Returns a list of all webhook channels.',
//         usage: 'webhooks',
//         examples: ['webhooks'],
//       },
//       args: [
//         {
//           id: 'channel',
//           type: 'channel',
//           default: null,
//         },
//       ],
//       ratelimit: 3,
//     });
//   }

//   public async exec(message: Message, args): Promise<Message> {
//     if (!this.client.handleAdminPermissions(message)) return;
//     const channels = this.client.settings.get(message.guild.id, 'channels', {});
//     let embeds: MessageEmbed[] = [];
//     if (!args.channel) {
//       for (let channelId in channels) {
//         const channel = channels[channelId];
//         embeds.push(
//           this.client
//             .embed(message.guild.id)
//             .setTitle(
//               `Webhook Configuration For Channel ${
//                 (
//                   (this.client.channels.cache.get(channelId) as TextChannel) ||
//                   ((await this.client.channels.fetch(channelId)) as TextChannel)
//                 ).name
//               }`
//             )
//             .addFields(
//               Object.entries(channel).map((entry) => ({
//                 name: entry[0],
//                 value: JSON.stringify(entry[1]),
//                 inline: true,
//               }))
//             )
//         );
//       }
//     } else {
//       embeds.push(
//         this.client
//           .embed(message.guild.id)
//           .setTitle(
//             `Webhook Configuration For Channel ${
//               (
//                 (this.client.channels.cache.get(
//                   args.channel.id
//                 ) as TextChannel) ||
//                 ((await this.client.channels.fetch(
//                   args.channel.id
//                 )) as TextChannel)
//               ).name
//             }`
//           )
//           .addFields(
//             Object.entries(channels[args.channel.id]).map((entry) => ({
//               name: entry[0],
//               value: JSON.stringify(entry[1]),
//               inline: true,
//             }))
//           )
//       );
//     }
//     new Embeds()
//       .setArray(
//         embeds.length === 0
//           ? [this.client.embed(message.guild.id).setTitle('No webhooks set')]
//           : embeds
//       )
//       .setAuthorizedUsers([message.author.id])
//       .setChannel(message.channel as TextChannel)
//       .setPageIndicator(true)
//       .setTimeout(300000)
//       .setPageIndicator(true)
//       .build();
//   }
// }
