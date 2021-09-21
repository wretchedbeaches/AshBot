import Listener from "../../struct/listeners/Listener";

export default class UncaughtExceptionListener extends Listener {
  public constructor() {
    super('processUncaughtException', {
      emitter: 'process',
      event: 'uncaughtException',
      category: 'process',
    });
  }

  public execute(error): void {
    // TODO: Update logging
    console.log("UNCAUGHT EXCEPTION");
    console.log(error);
  }
}

