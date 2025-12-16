'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('descuento', {
      id_descuento: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      descuento: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      porcentaje_descuento: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: false
      },
      codigo: {
        type: Sequelize.STRING(20),
        allowNull: false,
        unique: true
      },
      activo: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      }
    }, {
      schema: 'ventas'
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable({ tableName: 'descuento', schema: 'ventas' });
  }
};
