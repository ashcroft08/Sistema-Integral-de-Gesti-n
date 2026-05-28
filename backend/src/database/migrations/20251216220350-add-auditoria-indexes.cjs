'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Índices para auditoria.auditoria
    await queryInterface.addIndex(
      { tableName: 'auditoria', schema: 'auditoria' },
      ['fecha'],
      { name: 'idx_auditoria_fecha' }
    );

    await queryInterface.addIndex(
      { tableName: 'auditoria', schema: 'auditoria' },
      ['id_usuario'],
      { name: 'idx_auditoria_usuario' }
    );

    await queryInterface.addIndex(
      { tableName: 'auditoria', schema: 'auditoria' },
      ['accion'],
      { name: 'idx_auditoria_accion' }
    );

    // Índices para auditoria.error
    await queryInterface.addIndex(
      { tableName: 'error', schema: 'auditoria' },
      ['fecha'],
      { name: 'idx_error_fecha' }
    );

    await queryInterface.addIndex(
      { tableName: 'error', schema: 'auditoria' },
      ['nivel'],
      { name: 'idx_error_nivel' }
    );

    await queryInterface.addIndex(
      { tableName: 'error', schema: 'auditoria' },
      ['id_usuario'],
      { name: 'idx_error_usuario' }
    );
  },

  async down(queryInterface, Sequelize) {
    // Remover índices de auditoria.auditoria
    await queryInterface.removeIndex(
      { tableName: 'auditoria', schema: 'auditoria' },
      'idx_auditoria_fecha'
    );
    await queryInterface.removeIndex(
      { tableName: 'auditoria', schema: 'auditoria' },
      'idx_auditoria_usuario'
    );
    await queryInterface.removeIndex(
      { tableName: 'auditoria', schema: 'auditoria' },
      'idx_auditoria_accion'
    );

    // Remover índices de auditoria.error
    await queryInterface.removeIndex(
      { tableName: 'error', schema: 'auditoria' },
      'idx_error_fecha'
    );
    await queryInterface.removeIndex(
      { tableName: 'error', schema: 'auditoria' },
      'idx_error_nivel'
    );
    await queryInterface.removeIndex(
      { tableName: 'error', schema: 'auditoria' },
      'idx_error_usuario'
    );
  }
};
