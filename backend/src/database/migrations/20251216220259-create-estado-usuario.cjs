'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('estado_usuario', {
      id_estado_usuario: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      estado_usuario: {
        type: Sequelize.STRING(30),
        allowNull: false
      },
      codigo: {
        type: Sequelize.STRING(20),
        allowNull: false,
        unique: true
      }
    }, {
      schema: 'seguridad'
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable({ tableName: 'estado_usuario', schema: 'seguridad' });
  }
};
