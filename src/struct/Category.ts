import { Collection } from 'discord.js';
import BaseModule from './BaseModule';

export default class Category extends Collection<string, BaseModule> {
	public id: string;

	public constructor(id: string, iterables: BaseModule[] = []) {
		super(iterables.map((iterable) => [iterable.id, iterable]));
		this.id = id;
	}

	public reloaderAll(): Category {
		for (const module of Array.from(this.values())) {
			if (module.filepath) module.reload();
		}
		return this;
	}

	public removeAll(): Category {
		for (const module of Array.from(this.values())) {
			if (module.filepath) module.remove();
		}
		return this;
	}

	public toString(): string {
		return this.id;
	}
}
