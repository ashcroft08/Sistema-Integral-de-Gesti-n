'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('movimiento_inventario', {
      id_movimiento_inventario: {
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
        onDelete: 'RESTRICT'
      },
      id_tipo_movimiento: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: {
            tableName: 'tipo_movimiento',
            schema: 'catalogo'
          },
          key: 'id_tipo_movimiento'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      cantidad: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      fecha_movimiento: {
        type: Sequelize.DATE,
        allowNull: false
      },
      stock_anterior: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      stock_nuevo: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      id_detalle_factura: {
        type: Sequelize.INTEGER,
        allowNull: true // <-- Permite nulos
      },
      detalle: {
        type: Sequelize.TEXT,
        allowNull: true
      }
    }, {
      schema: 'inventario'
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable({ tableName: 'movimiento_inventario', schema: 'inventario' });
  }
};
