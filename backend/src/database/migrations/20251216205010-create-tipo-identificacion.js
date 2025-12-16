'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // 1. Crear la tabla en el esquema 'catalogo'
    await queryInterface.createTable('tipo_identificacion', {
      id_tipo_identificacion: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      tipo_identificacion: {
        type: Sequelize.STRING(255),
        allowNull: false,
        comment: 'Nombre del tipo de identificación (ej: RUC, Cédula)'
      },
      codigo: {
        type: Sequelize.STRING(20),
        allowNull: false,
        unique: true,
        comment: 'Código único para referencias del sistema (ej: SRI_RUC)'
      },
      descripcion: {
        type: Sequelize.TEXT,
        allowNull: false,
        comment: 'Descripción detallada del tipo de identificación'
      }
    }, {
      schema: 'catalogo',
      comment: 'Tabla de tipos de identificación para clientes y contribuyentes'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable({
      tableName: 'tipo_identificacion',
      schema: 'catalogo'
    });
  }
};
