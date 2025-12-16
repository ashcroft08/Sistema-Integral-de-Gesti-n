'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('detalle_factura', {
      id_detalle_factura: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      id_factura: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: {
            tableName: 'factura',
            schema: 'ventas'
          },
          key: 'id_factura'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
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
      id_descuento: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: {
            tableName: 'descuento',
            schema: 'ventas'
          },
          key: 'id_descuento'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      id_valor_iva: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: {
            tableName: 'valor_iva',
            schema: 'catalogo'
          },
          key: 'id_iva'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      cantidad: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      precio_unitario: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      subtotal: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      porcentaje_descuento: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: false,
        defaultValue: 0
      },
      valor_descuento: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      total: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      }
    }, {
      schema: 'ventas'
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable({ tableName: 'detalle_factura', schema: 'ventas' });
  }
};
