'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // 1. Tipo Identificación
    const tiposIdentificacion = [
      { tipo_identificacion: 'Cédula', codigo: 'SRI_CEDULA', descripcion: 'Cédula de identidad' },
      { tipo_identificacion: 'RUC', codigo: 'SRI_RUC', descripcion: 'Registro Único de Contribuyentes' },
      { tipo_identificacion: 'Pasaporte', codigo: 'SRI_PASAPORTE', descripcion: 'Pasaporte' },
      { tipo_identificacion: 'Consumidor Final', codigo: 'SRI_CONSUMIDOR_FINAL', descripcion: 'Venta a consumidor final' }
    ];
    for (const t of tiposIdentificacion) {
      await queryInterface.bulkInsert({ tableName: 'tipo_identificacion', schema: 'catalogo' }, [t], { ignoreDuplicates: true });
    }

    // 2. Tipo Movimiento
    const tiposMovimiento = [
      { tipo_movimiento: 'MOV_INICIAL', descripcion: 'Inventario Inicial' },
      { tipo_movimiento: 'MOV_COMPRA', descripcion: 'Compra / Reabastecimiento' },
      { tipo_movimiento: 'MOV_VENTA', descripcion: 'Venta' },
      { tipo_movimiento: 'MOV_AJUSTE', descripcion: 'Ajuste / Pérdida' }
    ];

    for (const t of tiposMovimiento) {
      await queryInterface.bulkInsert({ tableName: 'tipo_movimiento', schema: 'catalogo' }, [t], { ignoreDuplicates: true });
    }

    // 3. Estado SRI
    const estadosSri = [
      { estado_sri: 'Pendiente', codigo: 'SRI_PENDIENTE', descripcion: 'Pendiente de envío al SRI' },
      { estado_sri: 'Firmado', codigo: 'SRI_FIRMADO', descripcion: 'XML firmado digitalmente' }, // ✅ AGREGAR
      { estado_sri: 'Recibida', codigo: 'SRI_RECIBIDA', descripcion: 'Recibida por el SRI' }, // ✅ AGREGAR
      { estado_sri: 'Autorizado', codigo: 'SRI_AUTORIZADO', descripcion: 'Autorizado por el SRI' },
      { estado_sri: 'Rechazado', codigo: 'SRI_RECHAZADO', descripcion: 'Rechazado por el SRI' },
      { estado_sri: 'Devuelta', codigo: 'SRI_DEVUELTA', descripcion: 'Devuelta por el SRI' }, // ✅ AGREGAR (opcional)
      { estado_sri: 'Anulado', codigo: 'SRI_ANULADO', descripcion: 'Anulado' }
    ];

    for (const e of estadosSri) {
      await queryInterface.bulkInsert(
        { tableName: 'estado_sri', schema: 'catalogo' },
        [e],
        { ignoreDuplicates: true }
      );
    }

    // 4. Estado Producto
    const estadosProducto = [
      { estado_producto: 'Activo', codigo: 'PRO_ACTIVO' },
      { estado_producto: 'Descontinuado', codigo: 'PRO_DESCONTINUADO' }
    ];
    for (const e of estadosProducto) {
      await queryInterface.bulkInsert({ tableName: 'estado_producto', schema: 'catalogo' }, [e], { ignoreDuplicates: true });
    }

    // 5. Estado Categoria
    const estadosCategoria = [
      { estado_categoria: 'Activa', codigo: 'CAT_ACTIVA' },
      { estado_categoria: 'Inactiva', codigo: 'CAT_INACTIVA' }
    ];
    for (const e of estadosCategoria) {
      await queryInterface.bulkInsert({ tableName: 'estado_categoria', schema: 'catalogo' }, [e], { ignoreDuplicates: true });
    }

    // 6. Estado Cliente
    const estadosCliente = [
      { nombre: 'Activo', codigo: 'CLIENTE_ACTIVO', descripcion: 'Cliente habilitado' },
      { nombre: 'Inactivo', codigo: 'CLIENTE_INACTIVO', descripcion: 'Cliente temporalmente inactivo (ej: moroso)' }
    ];
    for (const e of estadosCliente) {
      await queryInterface.bulkInsert({ tableName: 'estado_cliente', schema: 'catalogo' }, [e], { ignoreDuplicates: true });
    }

    // 7. Valor IVA
    const valoresIva = [
      { codigo: 'IVA_0', porcentaje_iva: 0, descripcion: 'IVA 0%', activo: true },
      { codigo: 'IVA_12', porcentaje_iva: 12, descripcion: 'IVA 12%', activo: false },
      { codigo: 'IVA_15', porcentaje_iva: 15, descripcion: 'IVA 15%', activo: true }
    ];
    for (const v of valoresIva) {
      await queryInterface.bulkInsert({ tableName: 'valor_iva', schema: 'catalogo' }, [v], { ignoreDuplicates: true });
    }

    // 8. Métodos de Pago SRI Ecuador (nombres para usuario ERP local)
    const metodosPago = [
      { metodo_pago: 'Efectivo', codigo: 'PAGO_EFECTIVO', codigo_sri: '01', activo: true },
      { metodo_pago: 'Compensación de deudas', codigo: 'PAGO_COMPENSACION', codigo_sri: '15', activo: true },
      { metodo_pago: 'Tarjeta de débito', codigo: 'PAGO_TD', codigo_sri: '16', activo: true },
      { metodo_pago: 'Dinero electrónico (ej: Yape, Kash)', codigo: 'PAGO_DINERO_ELECTRONICO', codigo_sri: '17', activo: true },
      { metodo_pago: 'Tarjeta prepago', codigo: 'PAGO_TARJETA_PREPAGO', codigo_sri: '18', activo: true },
      { metodo_pago: 'Tarjeta de crédito', codigo: 'PAGO_TC', codigo_sri: '19', activo: true },
      { metodo_pago: 'Transferencia / Depósito bancario', codigo: 'PAGO_TRANSFERENCIA', codigo_sri: '20', activo: true },
      { metodo_pago: 'Cheque / Letra de cambio', codigo: 'PAGO_CHEQUE_LETRA', codigo_sri: '21', activo: true }
    ];
    for (const m of metodosPago) {
      await queryInterface.bulkInsert({ tableName: 'metodo_pago', schema: 'catalogo' }, [m], { ignoreDuplicates: true });
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete({ tableName: 'metodo_pago', schema: 'catalogo' }, null, {});
    await queryInterface.bulkDelete({ tableName: 'valor_iva', schema: 'catalogo' }, null, {});
    await queryInterface.bulkDelete({ tableName: 'estado_cliente', schema: 'catalogo' }, null, {});
    await queryInterface.bulkDelete({ tableName: 'estado_categoria', schema: 'catalogo' }, null, {});
    await queryInterface.bulkDelete({ tableName: 'estado_producto', schema: 'catalogo' }, null, {});
    await queryInterface.bulkDelete({ tableName: 'estado_sri', schema: 'catalogo' }, null, {});
    await queryInterface.bulkDelete({ tableName: 'tipo_movimiento', schema: 'catalogo' }, null, {});
    await queryInterface.bulkDelete({ tableName: 'tipo_identificacion', schema: 'catalogo' }, null, {});
  }
};
