import { CommandInteraction, Util } from 'discord.js';
import Command from '../../struct/commands/Command';
import COMMAND_NAMES from '../../util/CommandNames';

export default class StealEmojiCommand extends Command {
	public constructor() {
		super(COMMAND_NAMES.PUBLIC.STEAL_EMOJI, {
			description: {
				content: "To steal emoji's from any server",
				usage: 'emoji < emoji >',
				examples: ['emoji < your emoji >', 'emoji < your nitro emoji >'],
			},
			category: 'Utility',
			rateLimit: 3,
		});
	}

	public async execute(interaction: CommandInteraction) {
		let emojiArgument = interaction.options.getString('emoji', true);
		if (!emojiArgument.endsWith('>')) emojiArgument += '>';
		if (!emojiArgument.startsWith('<')) emojiArgument = `<${emojiArgument}`;

		const customEmo = Util.parseEmoji(emojiArgument);
		const resolvedEmoji = this.client.emojis.resolve(customEmo?.id ?? '');

		if (resolvedEmoji === null) {
			return interaction.editReply(`Could not resolve the emoji '${emojiArgument}'`);
		}
		const resolvedEmojiName = interaction.options.getString('name', false) ?? resolvedEmoji.name;
		if (resolvedEmojiName === null) {
			return interaction.editReply(
				`Managed to resolve the emoji '${emojiArgument}' but couldn't derive a name, try providing one to the command.`,
			);
		}
		try {
			const link = `https://cdn.discordapp.com/emojis/${resolvedEmoji.id}.${resolvedEmoji.animated ? 'gif' : 'png'}`;

			const createdEmoji = await interaction.guild!.emojis.create(link, resolvedEmojiName);
			return interaction.editReply(
				`**Your emoji ${createdEmoji.toString()} \`${resolvedEmojiName}\` was successfully added to the server.**\n\n**Link:** ${link}`,
			);
		} catch (error) {
			this.client.logger.error(
				`There was an issue creating '${emojiArgument}' emoji for guild ${interaction.guildId}`,
				{ command: this.id, error, customEmo, resolvedEmoji, resolvedEmojiName },
			);
			return interaction.editReply(`There was an unknown error creating the emoji '${emojiArgument}'`);
		}
	}
}
