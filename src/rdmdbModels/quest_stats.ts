import Sequelize, { DataTypes, Model, Optional } from 'sequelize';

export interface quest_statsAttributes {
  date: string;
  reward_type: number;
  pokemon_id: number;
  item_id: number;
  count: number;
}

export type quest_statsPk = "date" | "reward_type" | "pokemon_id" | "item_id";
export type quest_statsId = quest_stats[quest_statsPk];
export type quest_statsCreationAttributes = Optional<quest_statsAttributes, quest_statsPk>;

export class quest_stats extends Model<quest_statsAttributes, quest_statsCreationAttributes> implements quest_statsAttributes {
  date!: string;
  reward_type!: number;
  pokemon_id!: number;
  item_id!: number;
  count!: number;


  static initModel(sequelize: Sequelize.Sequelize): typeof quest_stats {
    quest_stats.init({
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      primaryKey: true
    },
    reward_type: {
      type: DataTypes.SMALLINT.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
      primaryKey: true
    },
    pokemon_id: {
      type: DataTypes.SMALLINT.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
      primaryKey: true
    },
    item_id: {
      type: DataTypes.SMALLINT.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
      primaryKey: true
    },
    count: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {
    sequelize,
    tableName: 'quest_stats',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "date" },
          { name: "reward_type" },
          { name: "pokemon_id" },
          { name: "item_id" },
        ]
      },
    ]
  });
  return quest_stats;
  }
}
