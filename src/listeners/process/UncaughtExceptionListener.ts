import Listener from '../../struct/listeners/Listener';

export default class UncaughtExceptionListener extends Listener {
	public constructor() {
		super('processUncaughtException', {
			emitter: 'process',
			event: 'uncaughtException',
			category: 'process',
		});
	}

	public execute(error): void {
		this.client!.logger.error(error, { event: 'UNCAUGHT EXCEPTION' });
	}
}
