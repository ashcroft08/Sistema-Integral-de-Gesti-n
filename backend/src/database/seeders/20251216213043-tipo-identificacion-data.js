'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const tiposIdentificacion = [
      {
        tipo_identificacion: 'RUC',
        codigo: 'SRI_RUC',
        descripcion: 'Registro Único de Contribuyentes'
      },
      {
        tipo_identificacion: 'Cédula',
        codigo: 'SRI_CEDULA',
        descripcion: 'Cédula de identidad'
      },
      {
        tipo_identificacion: 'Pasaporte',
        codigo: 'SRI_PASAPORTE',
        descripcion: 'Documento para extranjeros'
      },
      {
        tipo_identificacion: 'Consumidor Final',
        codigo: 'SRI_CONSUMIDOR_FINAL',
        descripcion: 'Ventas menores'
      }
    ];

    // Insertar evitando duplicados
    for (const tipo of tiposIdentificacion) {
      await queryInterface.sequelize.query(`
        INSERT INTO catalogo.tipo_identificacion 
          (tipo_identificacion, codigo, descripcion)
        VALUES 
          (:tipo_identificacion, :codigo, :descripcion)
        ON CONFLICT (codigo) DO NOTHING
      `, {
        replacements: tipo,
        type: queryInterface.sequelize.QueryTypes.INSERT
      });
    }

    console.log('✅ Datos iniciales de TipoIdentificacion insertados');
  },

  async down(queryInterface, Sequelize) {
    // Eliminar solo los datos insertados por este seeder
    await queryInterface.bulkDelete(
      { tableName: 'tipo_identificacion', schema: 'catalogo' },
      {
        codigo: ['SRI_RUC', 'SRI_CEDULA', 'SRI_PASAPORTE', 'SRI_CONSUMIDOR_FINAL']
      }
    );
  }
};
