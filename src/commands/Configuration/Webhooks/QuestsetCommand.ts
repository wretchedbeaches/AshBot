import { stripIndents } from 'common-tags';
import BaseWebhooksetCommand from './BaseWebhooksetCommand';

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
	}
}
