'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('estado_cliente', {
      id_estado_cliente: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      codigo: {
        type: Sequelize.STRING(20),
        allowNull: false,
        unique: true
      },
      nombre: {
        type: Sequelize.STRING(50),
        allowNull: false
      },
      descripcion: {
        type: Sequelize.TEXT,
        allowNull: true
      }
    }, {
      schema: 'catalogo'
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable({ tableName: 'estado_cliente', schema: 'catalogo' });
  }
};
