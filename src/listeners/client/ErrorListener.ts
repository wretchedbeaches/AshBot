import Listener from '../../struct/listeners/Listener';

export default class ErrorListener extends Listener {
	public constructor() {
		super('clientError', {
			emitter: 'client',
			event: 'error',
			category: 'client',
		});
	}

	public execute(error: Error): void {
		this.handler.client.logger.error(error.message, { error: error, event: 'clientError' });
	}
}
