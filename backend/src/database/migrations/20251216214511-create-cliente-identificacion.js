'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // 1. Crear la tabla principal
    await queryInterface.createTable('cliente_identificacion', {
      id_cliente_identificacion: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
        comment: 'ID único de la identificación del cliente'
      },
      id_cliente: {
        type: Sequelize.INTEGER,
        allowNull: false,
        comment: 'Referencia al cliente',
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
      id_tipo_identificacion: {
        type: Sequelize.INTEGER,
        allowNull: false,
        comment: 'Tipo de identificación (RUC, Cédula, etc.)',
        references: {
          model: {
            tableName: 'tipo_identificacion',
            schema: 'catalogo'
          },
          key: 'id_tipo_identificacion'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      identificacion: {
        type: Sequelize.STRING(50),
        allowNull: false,
        comment: 'Número de identificación (ej: 1234567890)'
      },
      es_principal: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false,
        comment: 'Indica si es la identificación principal del cliente'
      }
    }, {
      schema: 'ventas',
      comment: 'Tabla de identificaciones de clientes (pueden tener múltiples)'
    });

    // 2. Crear índice único compuesto para evitar duplicados
    await queryInterface.addIndex(
      { tableName: 'cliente_identificacion', schema: 'ventas' },
      ['id_tipo_identificacion', 'identificacion'],
      {
        unique: true,
        name: 'uq_cliente_ident_tipo_numero',
        where: {
          // Opcional: puedes agregar condiciones si necesitas
        }
      }
    );

    // 3. Índice para mejorar búsquedas por cliente
    await queryInterface.addIndex(
      { tableName: 'cliente_identificacion', schema: 'ventas' },
      ['id_cliente'],
      {
        name: 'idx_cliente_ident_cliente'
      }
    );

    // 4. Índice para búsquedas por identificación individual
    await queryInterface.addIndex(
      { tableName: 'cliente_identificacion', schema: 'ventas' },
      ['identificacion'],
      {
        name: 'idx_cliente_ident_numero'
      }
    );

    // 5. Índice para consultas de identificación principal
    await queryInterface.addIndex(
      { tableName: 'cliente_identificacion', schema: 'ventas' },
      ['id_cliente', 'es_principal'],
      {
        name: 'idx_cliente_ident_principal',
        where: {
          es_principal: true
        }
      }
    );

    console.log('✅ Tabla cliente_identificacion creada con índices');
  },

  async down(queryInterface, Sequelize) {
    // Eliminar índices primero (PostgreSQL requiere este orden)
    await queryInterface.removeIndex(
      { tableName: 'cliente_identificacion', schema: 'ventas' },
      'idx_cliente_ident_principal'
    );

    await queryInterface.removeIndex(
      { tableName: 'cliente_identificacion', schema: 'ventas' },
      'idx_cliente_ident_numero'
    );

    await queryInterface.removeIndex(
      { tableName: 'cliente_identificacion', schema: 'ventas' },
      'idx_cliente_ident_cliente'
    );

    await queryInterface.removeIndex(
      { tableName: 'cliente_identificacion', schema: 'ventas' },
      'uq_cliente_ident_tipo_numero'
    );

    // Eliminar la tabla
    await queryInterface.dropTable({
      tableName: 'cliente_identificacion',
      schema: 'ventas'
    });

    // Eliminar secuencia
    await queryInterface.sequelize.query(
      'DROP SEQUENCE IF EXISTS ventas.cliente_identificacion_id_cliente_identificacion_seq CASCADE'
    );
  }
};
