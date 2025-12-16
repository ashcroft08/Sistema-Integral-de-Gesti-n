'use strict';
const bcrypt = require('bcryptjs');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // 1. Estados de Usuario
    const estadosUsuario = [
      { estado_usuario: 'Activo', codigo: 'ESTADO_ACTIVO' },
      { estado_usuario: 'Inactivo', codigo: 'ESTADO_INACTIVO' },
      { estado_usuario: 'Bloqueado', codigo: 'ESTADO_BLOQUEADO' }
    ];

    for (const estado of estadosUsuario) {
      await queryInterface.bulkInsert({ tableName: 'estado_usuario', schema: 'seguridad' }, [estado], { ignoreDuplicates: true });
    }

    // Obtener IDs de estados
    const [estados] = await queryInterface.sequelize.query(
      `SELECT id_estado_usuario, codigo FROM seguridad.estado_usuario`
    );
    const estadoActivo = estados.find(e => e.codigo === 'ESTADO_ACTIVO');

    // 2. Roles
    const roles = [
      { rol: 'Superusuario', codigo: 'ROL_SUPER' },
      { rol: 'Administrador', codigo: 'ROL_ADMIN' },
      { rol: 'Vendedor', codigo: 'ROL_VENDEDOR' },
      { rol: 'Contador', codigo: 'ROL_CONTADOR' }
    ];

    for (const rol of roles) {
      await queryInterface.bulkInsert({ tableName: 'rol', schema: 'seguridad' }, [rol], { ignoreDuplicates: true });
    }

    // Obtener IDs de roles
    const [rolesDb] = await queryInterface.sequelize.query(
      `SELECT id_rol, codigo FROM seguridad.rol`
    );
    const rolSuper = rolesDb.find(r => r.codigo === 'ROL_SUPER');

    // 3. Usuario Admin
    if (rolSuper && estadoActivo) {
      const hashedPassword = await bcrypt.hash('Admin08_*', 10);

      // Verificar si existe
      const [users] = await queryInterface.sequelize.query(
        `SELECT id_usuario FROM seguridad.usuario WHERE email = 'admin@gmail.com'`
      );

      if (users.length === 0) {
        await queryInterface.bulkInsert({ tableName: 'usuario', schema: 'seguridad' }, [{
          id_rol: rolSuper.id_rol,
          id_estado_usuario: estadoActivo.id_estado_usuario,
          nombre: 'Administrador',
          apellido: 'Sistema',
          email: 'admin@gmail.com',
          password: hashedPassword,
          primer_ingreso: true,
          intentos_fallidos: 0
        }]);
      }
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete({ tableName: 'usuario', schema: 'seguridad' }, { email: 'admin@gmail.com' }, {});
    await queryInterface.bulkDelete({ tableName: 'rol', schema: 'seguridad' }, null, {});
    await queryInterface.bulkDelete({ tableName: 'estado_usuario', schema: 'seguridad' }, null, {});
  }
};
