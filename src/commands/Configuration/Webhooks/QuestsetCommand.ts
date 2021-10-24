import { stripIndents } from 'common-tags';
import BaseWebhooksetCommand from './BaseWebhooksetCommand';
import { questRewardTypesData } from '../../../data/Data';

export default class QuestsetCommand extends BaseWebhooksetCommand {
	public constructor() {
		super('questset', {
			webhookType: 'quest',
			description: {
				content: 'Set or remove the quest webhook configuration for a particular channel',
				usage: stripIndents`questset
        reward \`reward type\`
        geofilter \`distance(km/m) latitude,longitude|city\``,
				examples: ['questset stardust'],
			},
		});

		const rewardTypes = Object.values(questRewardTypesData);
		const rewardTypeOptions: [string, string][] = [];
		for (const rewardType of rewardTypes) {
			rewardTypeOptions.push([rewardType!.text.toLowerCase(), rewardType!.text.toLowerCase()]);
		}
		this.data.addStringOption((rewardTypeOption) =>
			rewardTypeOption
				.setName('reward')
				.setDescription('Filter quest webhooks by the specified reward type.')
				.addChoices(rewardTypeOptions),
		);
	}
}
