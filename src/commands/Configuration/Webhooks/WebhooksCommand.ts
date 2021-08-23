import { Command } from 'discord-akairo';
import { Message, TextChannel } from 'discord.js';
import { Embeds } from 'discord-paginationembed';
import { MessageEmbed } from 'discord.js';

export default class WebhooksCommand extends Command {
  public constructor() {
    super('webhooks', {
      aliases: ['webhooks'],
      category: 'Webhooks',
      description: {
        content: 'Returns a list of all webhook channels.',
        usage: 'webhooks',
        examples: ['webhooks'],
      },
      args: [
        {
          id: 'channel',
          type: 'channel',
          default: null,
        },
      ],
      ratelimit: 3,
    });
  }

  public async exec(message: Message, args): Promise<Message> {
    if (!this.client.handleAdminPermissions(message)) return;
    const channels = this.client.settings.get(message.guild.id, 'channels', {});
    let embeds: MessageEmbed[] = [];
    if (!args.channel) {
      for (let channelId in channels) {
        const channel = channels[channelId];
        embeds.push(
          this.client
            .embed(message.guild.id)
            .setTitle(
              `Webhook Configuration For Channel ${
                (
                  (this.client.channels.cache.get(channelId) as TextChannel) ||
                  ((await this.client.channels.fetch(channelId)) as TextChannel)
                ).name
              }`
            )
            .addFields(
              Object.entries(channel).map((entry) => ({
                name: entry[0],
                value: JSON.stringify(entry[1]),
                inline: true,
              }))
            )
        );
      }
    } else {
      embeds.push(
        this.client
          .embed(message.guild.id)
          .setTitle(
            `Webhook Configuration For Channel ${
              (
                (this.client.channels.cache.get(
                  args.channel.id
                ) as TextChannel) ||
                ((await this.client.channels.fetch(
                  args.channel.id
                )) as TextChannel)
              ).name
            }`
          )
          .addFields(
            Object.entries(channels[args.channel.id]).map((entry) => ({
              name: entry[0],
              value: JSON.stringify(entry[1]),
              inline: true,
            }))
          )
      );
    }
    new Embeds()
      .setArray(
        embeds.length === 0
          ? [this.client.embed(message.guild.id).setTitle('No webhooks set')]
          : embeds
      )
      .setAuthorizedUsers([message.author.id])
      .setChannel(message.channel as TextChannel)
      .setPageIndicator(true)
      .setTimeout(300000)
      .setPageIndicator(true)
      .build();
  }
}
