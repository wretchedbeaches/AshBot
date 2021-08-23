import { Listener } from 'discord-akairo';

export default class ReadyListener extends Listener {
  public constructor() {
    super('ready', {
      emitter: 'client',
      event: 'ready',
      category: 'client',
    });
  }

  public exec(): void {  
    console.log(`[Bot] ${this.client.user.tag} is now online and ready!`);
  }
}

