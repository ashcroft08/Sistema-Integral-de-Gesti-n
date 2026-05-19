'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // 2. Configuración Token
    await queryInterface.bulkInsert({ tableName: 'configuracion_token', schema: 'configuracion' }, [{
      tiempo_expiracion: '2h',
      fecha_creacion: new Date(),
      fecha_actualizacion: new Date()
    }], { ignoreDuplicates: true });

    // 3. Configuración Bloqueo
    await queryInterface.bulkInsert({ tableName: 'configuracion_bloqueo', schema: 'configuracion' }, [{
      id_config_bloqueo: 1,
      intentos_maximos: 3,
      duracion_bloqueo_minutos: 15,
      fecha_creacion: new Date(),
      fecha_actualizacion: new Date()
    }], { ignoreDuplicates: true });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete({ tableName: 'configuracion_bloqueo', schema: 'configuracion' }, null, {});
    await queryInterface.bulkDelete({ tableName: 'configuracion_token', schema: 'configuracion' }, null, {});
  }
};
