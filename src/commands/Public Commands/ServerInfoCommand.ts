import { Command } from 'discord-akairo';
import { Message, MessageEmbed } from 'discord.js';
import { stripIndents } from 'common-tags';
import * as moment from 'moment';
import 'moment-duration-format';

interface HumanLevels {
    [key: number]: string;
}

const HUMAN_LEVELS: HumanLevels = {
    0: 'None',
    1: 'Low',
    2: 'Medium',
    3: '(╯°□°）╯︵ ┻━┻',
    4: '┻━┻ ﾐヽ(ಠ益ಠ)ノ彡┻━┻'
};

export default class ServerInfoCommand extends Command {
    public constructor() {
        super('server', {
            aliases: ['server', 'serverinfo'],
            description: {
                content: 'Gets info about a server',
            },
            category: 'info',
            channel: 'guild',
            clientPermissions: ['MANAGE_MESSAGES'],
            ratelimit: 2
        });
    }

    public async exec(message: Message): Promise<Message | Message[]> {
        const guildOwner = await message.guild!.members.fetch(message.guild!.ownerID);
        const embed = new MessageEmbed()
            .setColor('#0000ff')
            .setDescription(`Info about **${message.guild!.name}** (ID: ${message.guild!.id})`)
            .addField(
                '❯ Channels',
                stripIndents`
                • ${message.guild!.channels.cache.filter((ch): boolean => ch.type === 'text').size} Text, ${message.guild!.channels.cache.filter((ch): boolean => ch.type === 'voice').size} Voice
                • AFK: ${message.guild!.afkChannelID ? `<#${message.guild!.afkChannelID}> after ${message.guild!.afkTimeout / 60}min` : 'None'}
            `)
            .addField(
                '❯ Members',
                stripIndents`
                • ${message.guild!.memberCount} members
                • Owner: ${guildOwner.user.tag} (ID: ${guildOwner.id})
            `)
            .addField(
                '❯ Other',
                stripIndents`
                • Roles: ${message.guild!.roles.cache.size}
                • Region: ${message.guild!.region}
                • Created at: ${moment.utc(message.guild!.createdAt).format('YYYY/MM/DD hh:mm:ss')}
                • Verification Level: ${HUMAN_LEVELS[message.guild!.verificationLevel as unknown as number]}
            `)
            .setThumbnail(message.guild!.iconURL()!);

        return message.util!.send(embed);
    }
}
