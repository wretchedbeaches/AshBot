import { Collection } from 'discord.js';

type ModelIdentifier = string | number;

interface SequelizeProviderOptions {
	idColumn?: string;
	dataColumn?: string;
}

interface SequelizeProviderAttributes {
	table: any;
	idColumn: string;
	dataColumn?: string;
	items: Collection<number | string, any>;
}

class SequelizeProvider implements SequelizeProviderAttributes {
	public table: any;
	public idColumn: string;
	public dataColumn?: string;
	public items: Collection<ModelIdentifier, any>;

	public constructor(table, options: SequelizeProviderOptions) {
		const { idColumn = 'id', dataColumn } = options;
		this.table = table;
		this.idColumn = idColumn;
		this.dataColumn = dataColumn;
	}

	public async init(): Promise<void> {
		const rows = await this.table.findAll();
		for (const row of rows) {
			this.items.set(row[this.idColumn], this.dataColumn ? row[this.dataColumn] : row);
		}
	}

	public get(id: ModelIdentifier, key: string, defaultValue: any): typeof this.table {
		if (this.items.has(id)) {
			const value = this.items.get(id)[key];
			return value == null ? defaultValue : value;
		}

		return defaultValue;
	}

	public set(id: ModelIdentifier, key: string, value: any): Promise<boolean> {
		const data = this.items.get(id) || {};
		data[key] = value;
		this.items.set(id, data);

		if (this.dataColumn != null) {
			return this.table.upsert({
				[this.idColumn]: id,
				[this.dataColumn]: data,
			});
		}

		return this.table.upsert({
			[this.idColumn]: id,
			[key]: value,
		});
	}

	public delete(id: ModelIdentifier, key: string): Promise<boolean> {
		const data = this.items.get(id) || {};
		// eslint-disable-next-line @typescript-eslint/no-dynamic-delete
		delete data[key];

		if (this.dataColumn != null) {
			return this.table.upsert({
				[this.idColumn]: id,
				[this.dataColumn]: data,
			});
		}

		return this.table.upsert({
			[this.idColumn]: id,
			[key]: null,
		});
	}

	public clear(id: ModelIdentifier): Promise<void> {
		this.items.delete(id);
		return this.table.destroy({ where: { [this.idColumn]: id } });
	}
}

export default SequelizeProvider;
