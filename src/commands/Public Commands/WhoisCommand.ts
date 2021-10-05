import { Command } from 'discord-akairo';
import { Message, MessageEmbed, GuildMember } from 'discord.js';
import { stripIndents } from 'common-tags';
import * as moment from 'moment';
import 'moment-duration-format';

export default class WhoIsCommand extends Command {
    public constructor() {
        super('whois', {
            aliases: ['whois', 'user' , 'member', 'user-info'],
            description: {
                content: 'Gets info about a member.',
                usage: '[member]',
                examples: ['whois Meatloaf Dispenser', 'user @BEACH', 'member 463869229850951680']
            },
            category: 'Utilities',
            channel: 'guild',
            clientPermissions: ['MANAGE_MESSAGES'],
            ratelimit: 2,
            args: [
                {
                    id: 'member',
                    match: 'content',
                    type: 'member',
                    default: (message: Message): GuildMember => message.member!
                }
            ]
        });
    }

    public async exec(message: Message, { member }: { member: GuildMember }): Promise<Message | Message[]> {
        const { user } = member;
        const embed = new MessageEmbed()
            .setColor('#0000ff')
            .setDescription(`Info about **${user.tag}** (ID: ${member.id})`)
            .addField(
                '❯ Member Details',
                stripIndents`
				${member.nickname == undefined ? '• No nickname' : ` • Nickname: ${member.nickname}`}
				• Roles: ${member.roles.cache.map((roles): string => `\`${roles.name}\``).join(' ')}
				• Joined at: ${moment.utc(member.joinedAt!).format('YYYY/MM/DD hh:mm:ss')}
            `)
            .addField(
                '❯ User Details',
                stripIndents`
				• ID: ${member.id}
				• Username: ${member.user.tag}
				• Created at: ${moment.utc(user.createdAt).format('YYYY/MM/DD hh:mm:ss')}${user.bot ? '\n• Bot account' : ''}
				• Status: ${user.presence.status.toUpperCase()}
				• Activity: ${user.presence.activities[0] ? user.presence.activities[0].name : 'None'}
            `)
            .setThumbnail(user.displayAvatarURL());

        return message.util!.send(embed);
    }
}
