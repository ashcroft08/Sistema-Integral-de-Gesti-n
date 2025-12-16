'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('metodo_pago', {
      id_metodo_pago: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      codigo: {
        type: Sequelize.STRING(50),
        allowNull: false,
        unique: true
      },
      metodo_pago: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      codigo_sri: {
        type: Sequelize.STRING(2),
        allowNull: false
      },
      activo: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      }
    }, {
      schema: 'catalogo'
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable({ tableName: 'metodo_pago', schema: 'catalogo' });
  }
};
