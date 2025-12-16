'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('producto', {
      id_producto: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      id_categoria: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: {
            tableName: 'categoria',
            schema: 'inventario'
          },
          key: 'id_categoria'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      id_estado_producto: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: {
            tableName: 'estado_producto',
            schema: 'catalogo'
          },
          key: 'id_estado_producto'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      codigo_producto: {
        type: Sequelize.STRING(50),
        allowNull: false,
        unique: true
      },
      nombre: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      precio: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      stock_inicial: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      stock_actual: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      stock_minimo: {
        type: Sequelize.INTEGER,
        allowNull: false
      }
    }, {
      schema: 'inventario'
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable({ tableName: 'producto', schema: 'inventario' });
  }
};
