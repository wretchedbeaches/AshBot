import Listener from "../../struct/listeners/Listener";

export default class ReadyListener extends Listener {
  public constructor() {
    super('processUncaughtException', {
      emitter: 'process',
      event: 'uncaughtException',
      category: 'process',
    });
  }

  public execute(error): void {  
    console.log("UNCAUGHT EXCEPTION");
    console.log(error);
  }
}

