/**
 * Valida Cédula, RUC y Pasaporte (Ecuador) - Versión Frontend
 * @param {string} numero - El número de identificación
 * @param {string} tipoCodigo - Código del tipo de identificación (SRI_RUC, SRI_CEDULA, etc.)
 */
export const validarIdentificacionFrontend = (numero, tipoCodigo) => {
    if (!numero || !tipoCodigo) return false;
    const n = numero.toString();

    // Mapear códigos de BD a tipos del validador
    const mapaCodigos = {
        'SRI_RUC': 'RUC',
        'SRI_CEDULA': 'CEDULA',
        'SRI_PASAPORTE': 'PASAPORTE',
        'SRI_CONSUMIDOR_FINAL': 'CONSUMIDOR_FINAL'
    };

    const tipoParaValidar = mapaCodigos[tipoCodigo];
    if (!tipoParaValidar) return false;

    // 1. Validaciones básicas por tipo
    if (tipoParaValidar === 'PASAPORTE') return n.length >= 5;
    if (tipoParaValidar === 'CONSUMIDOR_FINAL') return n === '9999999999999';

    // Para Cédula y RUC, deben ser números
    if (!/^\d+$/.test(n)) return false;

    // 2. Lógica para Cédula (10 dígitos)
    if (tipoParaValidar === 'CEDULA') {
        if (n.length !== 10) return false;
        return validarCedula(n);
    }

    // 3. Lógica para RUC (13 dígitos)
    if (tipoParaValidar === 'RUC') {
        if (n.length !== 13) return false;
        if (n.slice(10, 13) === '000') return false;

        const tercerDigito = parseInt(n[2]);

        if (tercerDigito < 6) {
            return validarCedula(n.substring(0, 10));
        } else if (tercerDigito === 9) {
            return validarRucSociedadPrivada(n);
        } else if (tercerDigito === 6) {
            return validarRucSociedadPublica(n);
        }
        return false;
    }

    return true;
};

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