'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // 1. Obtener IDs necesarios
    const [estadosCliente] = await queryInterface.sequelize.query(
      `SELECT id_estado_cliente, codigo FROM catalogo.estado_cliente`
    );
    const estadoActivo = estadosCliente.find(e => e.codigo === 'CLIENTE_ACTIVO');

    const [parroquias] = await queryInterface.sequelize.query(
      `SELECT id_parroquia, codigo FROM catalogo.parroquia`
    );
    const parroquia = parroquias.find(p => p.codigo === '170150'); // Quito

    const [tiposIdentificacion] = await queryInterface.sequelize.query(
      `SELECT id_tipo_identificacion, codigo FROM catalogo.tipo_identificacion`
    );
    const tipoCF = tiposIdentificacion.find(t => t.codigo === 'SRI_CONSUMIDOR_FINAL');

    // 2. Cliente Consumidor Final
    if (estadoActivo && parroquia && tipoCF) {
      // Verificar si ya existe
      const [clientes] = await queryInterface.sequelize.query(
        `SELECT id_cliente FROM ventas.cliente WHERE nombre = 'CONSUMIDOR FINAL'`
      );

      if (clientes.length === 0) {
        await queryInterface.bulkInsert({ tableName: 'cliente', schema: 'ventas' }, [{
          nombre: 'CONSUMIDOR FINAL',
          apellido: 'FINAL',
          es_empresa: false,
          celular: 'N/A',
          email: 'N/A',
          direccion: 'N/A',
          id_parroquia: parroquia.id_parroquia,
          id_estado_cliente: estadoActivo.id_estado_cliente,
          fecha_creacion: new Date(),
          fecha_actualizacion: new Date()
        }]);

        // Obtener ID del cliente creado
        const [nuevoCliente] = await queryInterface.sequelize.query(
          `SELECT id_cliente FROM ventas.cliente WHERE nombre = 'CONSUMIDOR FINAL'`
        );

        if (nuevoCliente.length > 0) {
          await queryInterface.bulkInsert({ tableName: 'cliente_identificacion', schema: 'ventas' }, [{
            id_cliente: nuevoCliente[0].id_cliente,
            id_tipo_identificacion: tipoCF.id_tipo_identificacion,
            identificacion: 'CF',
            es_principal: true
          }]);
        }
      }
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete({ tableName: 'cliente_identificacion', schema: 'ventas' }, null, {});
    await queryInterface.bulkDelete({ tableName: 'cliente', schema: 'ventas' }, null, {});
  }
};
