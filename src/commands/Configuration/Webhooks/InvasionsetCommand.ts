import { stripIndents } from 'common-tags';
import BaseWebhooksetCommand from './BaseWebhooksetCommand';

export default class InvasionSetCommand extends BaseWebhooksetCommand {
	public constructor() {
		super('invasionset', {
			webhookType: 'invasion',
			description: {
				content: 'Set or remove the invasion webhook configuration for a particular channel.',
				usage: stripIndents`invasionset
        leader \`true|false\`
        geofilter \`distance(km/m) lattitude,longitude|city\`
        train`,
			},
		});
	}
}
