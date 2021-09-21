import Listener from "../../struct/listeners/Listener";

export default class ReadyListener extends Listener {
  public constructor() {
    super('ready', {
      emitter: 'client',
      event: 'ready',
      category: 'client',
    });
  }

  public execute(): void {  
    console.log(`[Bot] ${this.client.user.tag} is now online and ready!`);
  }
}

