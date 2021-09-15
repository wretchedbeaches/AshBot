import { Interaction } from "discord.js";
import BaseModule, { BaseModuleOptions } from "../BaseModule";

interface InhibitorOptions extends BaseModuleOptions {
  reason: string;
}

export default class Inhibitor extends BaseModule {
  public id: string;
  public reason: string;

  public constructor(id: string, options: InhibitorOptions) {
    super(id, options);
    this.id = id;
    this.reason = options.reason;
  }

  // TODO: update command type
  public exec(interaction: Interaction, command: any): boolean | Promise<boolean> {
    throw new Error('not imlemented');
  }
};
