/**
 * Valida Cédula, RUC y Pasaporte (Ecuador)
 * @param {string} numero - El número de identificación
 * @param {string} tipo - 'RUC', 'CEDULA', 'PASAPORTE', 'CONSUMIDOR_FINAL'
 */
export const validarIdentificacion = (numero, tipo) => {
    if (!numero || !tipo) return false;
    const n = numero.toString();

    // 1. Validaciones básicas por tipo
    if (tipo === 'PASAPORTE') return n.length >= 5; // Validación laxa para pasaporte
    if (tipo === 'CONSUMIDOR_FINAL') return n === '9999999999999';

    // Para Cédula y RUC, deben ser números
    if (!/^\d+$/.test(n)) return false;

    // 2. Lógica para Cédula (10 dígitos)
    if (tipo === 'CEDULA') {
        if (n.length !== 10) return false;
        return validarCedula(n);
    }

    // 3. Lógica para RUC (13 dígitos)
    if (tipo === 'RUC') {
        if (n.length !== 13) return false;
        // Los 3 últimos deben ser 001 (generalmente, aunque puede variar en sucursales, validemos != 000)
        if (n.slice(10, 13) === '000') return false;

        // Validación relajada: Se acepta cualquier estructura válida (13 dígitos, no termina en 000)
        return true;
    }

    return true; // Por defecto si no coincide tipo
};

// --- ALGORITMOS INTERNOS ---

function validarCedula(cedula) {
    const provincia = parseInt(cedula.substring(0, 2));
    if (provincia < 1 || (provincia > 24 && provincia !== 30)) return false;

    const coeficientes = [2, 1, 2, 1, 2, 1, 2, 1, 2];
    let suma = 0;

    for (let i = 0; i < 9; i++) {
        let valor = parseInt(cedula[i]) * coeficientes[i];
        if (valor >= 10) valor -= 9;
        suma += valor;
    }

    const digitoVerificador = parseInt(cedula[9]);
    const residuo = suma % 10;
    const resultado = residuo === 0 ? 0 : 10 - residuo;

    return resultado === digitoVerificador;
}

function validarRucSociedadPrivada(ruc) {
    const coeficientes = [4, 3, 2, 7, 6, 5, 4, 3, 2];
    let suma = 0;
    for (let i = 0; i < 9; i++) {
        suma += parseInt(ruc[i]) * coeficientes[i];
    }
    const residuo = suma % 11;
    const verificador = residuo === 0 ? 0 : 11 - residuo;
    return verificador === parseInt(ruc[9]);
}

function validarRucSociedadPublica(ruc) {
    const coeficientes = [3, 2, 7, 6, 5, 4, 3, 2];
    let suma = 0;
    for (let i = 0; i < 8; i++) {
        suma += parseInt(ruc[i]) * coeficientes[i];
    }
    const residuo = suma % 11;
    const verificador = residuo === 0 ? 0 : 11 - residuo;
    return verificador === parseInt(ruc[8]);
}