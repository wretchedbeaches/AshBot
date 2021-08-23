import Sequelize, { DataTypes, Model, Optional } from 'sequelize';

export interface pokemon_shiny_statsAttributes {
  date: string;
  pokemon_id: number;
  count: number;
}

export type pokemon_shiny_statsPk = "date" | "pokemon_id";
export type pokemon_shiny_statsId = pokemon_shiny_stats[pokemon_shiny_statsPk];
export type pokemon_shiny_statsCreationAttributes = Optional<pokemon_shiny_statsAttributes, pokemon_shiny_statsPk>;

export class pokemon_shiny_stats extends Model<pokemon_shiny_statsAttributes, pokemon_shiny_statsCreationAttributes> implements pokemon_shiny_statsAttributes {
  date!: string;
  pokemon_id!: number;
  count!: number;


  static initModel(sequelize: Sequelize.Sequelize): typeof pokemon_shiny_stats {
    pokemon_shiny_stats.init({
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      primaryKey: true
    },
    pokemon_id: {
      type: DataTypes.SMALLINT.UNSIGNED,
      allowNull: false,
      primaryKey: true
    },
    count: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {
    sequelize,
    tableName: 'pokemon_shiny_stats',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "date" },
          { name: "pokemon_id" },
        ]
      },
    ]
  });
  return pokemon_shiny_stats;
  }
}
