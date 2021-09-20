import { CommandInteraction, Interaction } from "discord.js";
import Command from "../../struct/commands/Command";

const responses = [
    "It is certain",
    "It is decidedly so",
    "Without a doubt",
    "Yes, definitely",
    "You may rely on it",
    "As I see it, yes",
    "Most likely",
    "Outlook good",
    "Yes",
    "Signs point to yes",
    "Reply hazy try again",
    "Ask again later",
    "Better not tell you now",
    "Cannot predict now",
    "Concentrate and ask again",
    "Don't count on it",
    "My reply is no",
    "My sources say no",
    "Outlook not so good",
    "Very doubtful",
];

export default class EightBall extends Command {
    public constructor() {
        super('8ball', {
            helpDescription: {
                content: "Let the bot decide your future",
                usage: "Fortune-Telling Game",
                examples: ["8ball will i get a gf"],
            },
            description: 'Let the bot decide your future...',
        });
        this.data.addStringOption(option => option.setName('question').setDescription('What would you like to ask the 8ball?'));
    }

    public execute(interaction: CommandInteraction) {
        return interaction.editReply({ content: responses[Math.floor(Math.random() * responses.length - 1)] });
    }
}