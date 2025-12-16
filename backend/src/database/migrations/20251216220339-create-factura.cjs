'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('factura', {
      id_factura: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      id_cliente: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: {
            tableName: 'cliente',
            schema: 'ventas'
          },
          key: 'id_cliente'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      id_vendedor: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: {
            tableName: 'usuario',
            schema: 'seguridad'
          },
          key: 'id_usuario'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      id_estado_sri: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: {
            tableName: 'estado_sri',
            schema: 'catalogo'
          },
          key: 'id_estado_sri'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
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
      id_metodo_pago: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: {
            tableName: 'metodo_pago',
            schema: 'catalogo'
          },
          key: 'id_metodo_pago'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      tipo_venta: {
        type: Sequelize.ENUM('CONTADO', 'CREDITO'),
        allowNull: false,
        defaultValue: 'CONTADO'
      },
      plazo_credito_dias: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      fecha_vencimiento: {
        type: Sequelize.DATEONLY,
        allowNull: true
      },
      saldo_pendiente: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true,
        defaultValue: 0.00
      },
      referencia_pago: {
        type: Sequelize.STRING(50),
        allowNull: true
      },
      secuencial: {
        type: Sequelize.STRING(17),
        allowNull: false,
        unique: true
      },
      clave_acceso_sri: {
        type: Sequelize.STRING(49),
        allowNull: true,
        unique: true
      },
      numero_autorizacion: {
        type: Sequelize.STRING(49),
        allowNull: true
      },
      fecha_emision: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      fecha_autorizacion: {
        type: Sequelize.DATE,
        allowNull: true
      },
      subtotal_sin_iva: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.00
      },
      subtotal_con_iva: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.00
      },
      total_descuento: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.00
      },
      total_iva: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.00
      },
      total: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.00
      },
      xml_firmado_url: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      xml_respuesta_sri: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      mensaje_sri: {
        type: Sequelize.TEXT,
        allowNull: true
      }
    }, {
      schema: 'ventas'
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable({ tableName: 'factura', schema: 'ventas' });
  }
};
