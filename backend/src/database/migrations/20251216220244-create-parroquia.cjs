'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('parroquia', {
      id_parroquia: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      parroquia: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      codigo: {
        type: Sequelize.STRING(10),
        allowNull: true
      },
      id_canton: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: {
            tableName: 'canton',
            schema: 'catalogo'
          },
          key: 'id_canton'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      }
    }, {
      schema: 'catalogo'
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable({ tableName: 'parroquia', schema: 'catalogo' });
  }
};
