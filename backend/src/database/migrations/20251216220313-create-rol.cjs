'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('rol', {
      id_rol: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      rol: {
        type: Sequelize.STRING(50),
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
    await queryInterface.dropTable({ tableName: 'rol', schema: 'seguridad' });
  }
};
