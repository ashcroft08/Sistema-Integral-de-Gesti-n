'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('notificaciones_stock', {
      id_notificacion: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      id_producto: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: {
            tableName: 'producto',
            schema: 'inventario'
          },
          key: 'id_producto'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      mensaje: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      leido: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      fecha_creacion: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      }
    }, {
      schema: 'inventario'
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable({ tableName: 'notificaciones_stock', schema: 'inventario' });
  }
};
