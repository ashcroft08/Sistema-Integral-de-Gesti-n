'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // 1. Obtener IDs necesarios
    const [estadosCategoria] = await queryInterface.sequelize.query(
      `SELECT id_estado_categoria, codigo FROM catalogo.estado_categoria`
    );
    const estadoCatActiva = estadosCategoria.find(e => e.codigo === 'CAT_ACTIVA');

    const [estadosProducto] = await queryInterface.sequelize.query(
      `SELECT id_estado_producto, codigo FROM catalogo.estado_producto`
    );
    const estadoProdActivo = estadosProducto.find(e => e.codigo === 'PROD_ACTIVO');

    if (estadoCatActiva) {
      // 2. Categorías
      const categorias = [
        { categoria: 'Chocolates', id_estado_categoria: estadoCatActiva.id_estado_categoria },
        { categoria: 'Artesanías', id_estado_categoria: estadoCatActiva.id_estado_categoria },
        { categoria: 'Materia Prima', id_estado_categoria: estadoCatActiva.id_estado_categoria }
      ];

      for (const c of categorias) {
        await queryInterface.bulkInsert({ tableName: 'categoria', schema: 'inventario' }, [c], { ignoreDuplicates: true });
      }

      // 3. Productos (Ejemplo)
      if (estadoProdActivo) {
        const [categoriasDb] = await queryInterface.sequelize.query(
          `SELECT id_categoria, categoria FROM inventario.categoria`
        );
        const catChocolate = categoriasDb.find(c => c.categoria === 'Chocolates');

        if (catChocolate) {
          const productos = [
            {
              id_categoria: catChocolate.id_categoria,
              id_estado_producto: estadoProdActivo.id_estado_producto,
              codigo_producto: 'CHO-001',
              nombre: 'Barra de Chocolate 50g',
              precio: 2.50,
              stock_inicial: 100,
              stock_actual: 100,
              stock_minimo: 10
            },
            {
              id_categoria: catChocolate.id_categoria,
              id_estado_producto: estadoProdActivo.id_estado_producto,
              codigo_producto: 'CHO-002',
              nombre: 'Barra de Chocolate 100g',
              precio: 4.50,
              stock_inicial: 50,
              stock_actual: 50,
              stock_minimo: 5
            }
          ];

          for (const p of productos) {
            await queryInterface.bulkInsert({ tableName: 'producto', schema: 'inventario' }, [p], { ignoreDuplicates: true });
          }
        }
      }
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete({ tableName: 'producto', schema: 'inventario' }, null, {});
    await queryInterface.bulkDelete({ tableName: 'categoria', schema: 'inventario' }, null, {});
  }
};
