'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('provincia', {
      id_provincia: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      provincia: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      codigo: {
        type: Sequelize.STRING(10),
        allowNull: true
      }
    }, {
      schema: 'catalogo'
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable({ tableName: 'provincia', schema: 'catalogo' });
  }
};
