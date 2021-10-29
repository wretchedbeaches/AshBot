import { ApplicationCommandOptionType } from 'discord-api-types/v9';
import { commonHookOptions } from '../../Base/CommonOptions';

export default {
	name: 'questset',
	description: 'Set or remove the quest webhook configuration for a particular channel',
	options: [
		...commonHookOptions,
		{
			type: ApplicationCommandOptionType.String,
			name: 'reward',
			description: 'Filter quest webhooks by the specified reward type.',
			required: false,
			choices: [
				{ name: 'unset', value: 'unset' },
				{ name: 'experience', value: 'experience' },
				{ name: 'item', value: 'item' },
				{ name: 'stardust', value: 'stardust' },
				{ name: 'candy', value: 'candy' },
				{ name: 'avatar clothing', value: 'avatar clothing' },
				{ name: 'quest', value: 'quest' },
				{ name: 'pokemon encounter', value: 'pokemon encounter' },
				{ name: 'pokecoin', value: 'pokecoin' },
				{ name: 'xl candy', value: 'xl candy' },
				{ name: 'level cap', value: 'level cap' },
				{ name: 'sticker', value: 'sticker' },
				{ name: 'mega resource', value: 'mega resource' },
			],
		},
	],
	default_permission: false,
} as const;
