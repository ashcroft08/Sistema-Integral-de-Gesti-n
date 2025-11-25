// src/utils/lookup.js
import { Rol, EstadoUsuario } from '../models/index.js';

export let ROLE_IDS = {};
export let USER_STATE_IDS = {};

export async function loadLookups() {
    const roles = await Rol.findAll({ attributes: ['id_rol', 'rol'] });
    ROLE_IDS = roles.reduce((acc, r) => {
        acc[r.rol] = r.id_rol;
        return acc;
    }, {});

    const estados = await EstadoUsuario.findAll({ attributes: ['id_estado_usuario', 'estado_usuario'] });
    USER_STATE_IDS = estados.reduce((acc, e) => {
        acc[e.estado_usuario] = e.id_estado_usuario;
        return acc;
    }, {});

    console.log('✅ Lookup tables cargadas:', { ROLE_IDS, USER_STATE_IDS });
}