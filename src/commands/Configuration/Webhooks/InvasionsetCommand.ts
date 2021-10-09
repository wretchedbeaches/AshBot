import { stripIndents } from 'common-tags';
import { addTrainFilterOption } from '../../../util/WebhookFilterOptions';
import BaseWebhooksetCommand from './BaseWebhooksetCommand';

export default class InvasionSetCommand extends BaseWebhooksetCommand {
	public constructor() {
		super('invasionset', {
			webhookType: 'invasions',
			description: {
				content: 'Set or remove the invasion webhook configuration for a particular channel.',
				usage: stripIndents`invasionset
        leader \`true|false\`
        geofilter \`distance(km/m) lattitude,longitude|city\`
        train`,
			},
		});

		this.data.addBooleanOption((leaderOption) =>
			leaderOption.setName('leader').setDescription('Whether or not to filter on leaders.'),
		);

		addTrainFilterOption(this.data);
	}
}
