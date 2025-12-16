'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // 1. Configuración SRI
    const ambiente = process.env.SRI_ENVIRONMENT || '1';
    const urlBase = ambiente === '1'
      ? 'https://celcer.sri.gob.ec/comprobantes-electronicos-ws'
      : 'https://cel.sri.gob.ec/comprobantes-electronicos-ws';

    await queryInterface.bulkInsert({ tableName: 'configuracion_sri', schema: 'configuracion' }, [{
      razon_social: 'ASOCIACIÓN KALLARI',
      ruc: '1234567890001',
      direccion_matriz: 'Dirección de la asociación',
      establecimiento: '001',
      punto_emision: '001',
      ambiente: parseInt(ambiente),
      tipo_emision: 1,
      obligado_contabilidad: true,
      url_recepcion: `${urlBase}/RecepcionComprobantesOffline?wsdl`,
      url_autorizacion: `${urlBase}/AutorizacionComprobantesOffline?wsdl`,
      activo: true,
      fecha_creacion: new Date(),
      fecha_actualizacion: new Date()
    }], { ignoreDuplicates: true });

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
    await queryInterface.bulkDelete({ tableName: 'configuracion_sri', schema: 'configuracion' }, null, {});
  }
};
