// ============================================
// 1. services/sri.service.js - SIMPLIFICADO
// ============================================
import xmlbuilder2 from 'xmlbuilder2';
import forge from 'node-forge';
import fs from 'fs/promises';
import moment from 'moment';
import axios from 'axios';
import FormData from 'form-data';
import { ConfiguracionSri, Factura, Cliente, DetalleFactura, Producto, ValorIva, CertificadoDigital, ClienteIdentificacion, TipoIdentificacion } from '../models/index.js';
import { CertificateService } from './certificate.service.js';

export class SriService {
    constructor() {
        this.certificateService = new CertificateService();

        // Detectar modo
        this.useDbCertificates = process.env.USE_DB_CERTIFICATES === 'true';
        this.modoMock = false;

        if (!this.useDbCertificates && !process.env.CERTIFICADO_PATH) {
            this.modoMock = true;
            console.log('🧪 SRI Service en MODO PRUEBA (sin certificado)');
        } else if (this.useDbCertificates) {
            console.log('✅ SRI Service usando CERTIFICADO DE BASE DE DATOS');
        } else {
            console.log('📁 SRI Service usando ARCHIVO ESTÁTICO');
        }
    }

    // ============================================
    // GENERAR CLAVE DE ACCESO
    // ============================================
    generarClaveAcceso(fechaEmision, tipoComprobante, ruc, ambiente, serie, secuencial, codigoNumerico, tipoEmision) {
        const fecha = moment(fechaEmision).format('DDMMYYYY');
        const tipo = tipoComprobante.padStart(2, '0');
        const rucEmisor = ruc.padStart(13, '0');
        const amb = ambiente.toString();
        const serieCompleta = serie.replace('-', '');
        const secuencialFormateado = secuencial.padStart(9, '0');
        const codNum = codigoNumerico.padStart(8, '0');
        const tipEmis = tipoEmision.toString();

        const claveBase = fecha + tipo + rucEmisor + amb + serieCompleta + secuencialFormateado + codNum + tipEmis;
        const digito = this._calcularDigitoVerificador(claveBase);

        return claveBase + digito;
    }

    _calcularDigitoVerificador(clave) {
        const factores = [2, 3, 4, 5, 6, 7];
        let suma = 0;
        let factor = 0;

        for (let i = clave.length - 1; i >= 0; i--) {
            suma += parseInt(clave[i]) * factores[factor];
            factor = (factor + 1) % 6;
        }

        const residuo = suma % 11;
        const digito = residuo === 0 ? 0 : 11 - residuo;
        return digito === 11 ? 0 : digito;
    }

    // ============================================
    // GENERAR XML FACTURA
    // ============================================
    // services/sri.service.js
    async generarXmlFactura(idFactura) {
        const factura = await Factura.findByPk(idFactura, {
            include: [
                {
                    model: Cliente,
                    attributes: ['nombre', 'apellido', 'email', 'direccion'],
                    // ✅ INCLUIR IDENTIFICACIONES DEL CLIENTE
                    include: [
                        {
                            model: ClienteIdentificacion,
                            include: [
                                {
                                    model: TipoIdentificacion,
                                    attributes: ['tipo_identificacion', 'codigo']
                                }
                            ]
                        }
                    ]
                },
                {
                    model: DetalleFactura,
                    as: 'DetalleFactura',
                    include: [
                        { model: Producto, attributes: ['codigo_producto', 'nombre', 'precio'] },
                        { model: ValorIva, attributes: ['codigo', 'porcentaje_iva'] }
                    ]
                }
            ]
        });

        if (!factura) {
            throw new Error('Factura no encontrada');
        }

        const config = await ConfiguracionSri.findOne({ where: { activo: true } });
        if (!config) {
            throw new Error('Configuración SRI no encontrada');
        }

        // ✅ OBTENER IDENTIFICACIÓN PRINCIPAL DEL CLIENTE
        const cliente = factura.Cliente;
        const identificacionPrincipal = cliente.ClienteIdentificacions?.find(i => i.es_principal)
            || cliente.ClienteIdentificacions?.[0];

        if (!identificacionPrincipal) {
            throw new Error('El cliente no tiene ninguna identificación registrada');
        }

        const identificacion = identificacionPrincipal.identificacion;
        const tipoIdentificacion = identificacionPrincipal.TipoIdentificacion;

        // ✅ DETERMINAR CÓDIGO SRI DEL TIPO DE IDENTIFICACIÓN
        let tipoIdentificacionSri;
        switch (tipoIdentificacion.codigo) {
            case 'SRI_RUC':
                tipoIdentificacionSri = '04'; // RUC
                break;
            case 'SRI_CEDULA':
                tipoIdentificacionSri = '05'; // Cédula
                break;
            case 'SRI_PASAPORTE':
                tipoIdentificacionSri = '06'; // Pasaporte
                break;
            case 'SRI_CONSUMIDOR_FINAL':
                tipoIdentificacionSri = '07'; // Consumidor Final
                break;
            default:
                // Fallback basado en longitud (por si acaso)
                tipoIdentificacionSri = identificacion.length === 10 ? '05' :
                    identificacion.length === 13 ? '04' : '06';
        }

        // Generar clave de acceso si no existe
        if (!factura.clave_acceso_sri) {
            const [est, pe, sec] = factura.secuencial.split('-');
            const codigoNumerico = Math.floor(10000000 + Math.random() * 90000000).toString();

            const claveAcceso = this.generarClaveAcceso(
                factura.fecha_emision,
                '01',
                config.ruc,
                config.ambiente,
                `${est}${pe}`,
                sec,
                codigoNumerico,
                config.tipo_emision
            );

            await factura.update({ clave_acceso_sri: claveAcceso });
        }

        // Construir XML
        const root = xmlbuilder2.create({ version: '1.0', encoding: 'UTF-8' })
            .ele('factura', { id: 'comprobante', version: '1.0.0' });

        const infoTributaria = root.ele('infoTributaria');
        infoTributaria.ele('ambiente').txt(config.ambiente.toString());
        infoTributaria.ele('tipoEmision').txt(config.tipo_emision.toString());
        infoTributaria.ele('razonSocial').txt(config.razon_social);
        if (config.nombre_comercial) {
            infoTributaria.ele('nombreComercial').txt(config.nombre_comercial);
        }
        infoTributaria.ele('ruc').txt(config.ruc);
        infoTributaria.ele('claveAcceso').txt(factura.clave_acceso_sri);
        infoTributaria.ele('codDoc').txt('01');
        infoTributaria.ele('estab').txt(config.establecimiento);
        infoTributaria.ele('ptoEmi').txt(config.punto_emision);
        infoTributaria.ele('secuencial').txt(factura.secuencial.split('-')[2]);
        infoTributaria.ele('dirMatriz').txt(config.direccion_matriz);

        const infoFactura = root.ele('infoFactura');
        infoFactura.ele('fechaEmision').txt(moment(factura.fecha_emision).format('DD/MM/YYYY'));
        infoFactura.ele('dirEstablecimiento').txt(config.direccion_matriz);
        if (config.contribuyente_especial) {
            infoFactura.ele('contribuyenteEspecial').txt(config.contribuyente_especial);
        }
        infoFactura.ele('obligadoContabilidad').txt(config.obligado_contabilidad ? 'SI' : 'NO');

        // ✅ USAR TIPO DE IDENTIFICACIÓN CORRECTO
        infoFactura.ele('tipoIdentificacionComprador').txt(tipoIdentificacionSri);
        infoFactura.ele('razonSocialComprador').txt(`${cliente.nombre} ${cliente.apellido}`);
        infoFactura.ele('identificacionComprador').txt(identificacion);
        infoFactura.ele('direccionComprador').txt(cliente.direccion);

        infoFactura.ele('totalSinImpuestos').txt(
            (parseFloat(factura.subtotal_sin_iva) + parseFloat(factura.subtotal_con_iva)).toFixed(2)
        );
        infoFactura.ele('totalDescuento').txt(parseFloat(factura.total_descuento).toFixed(2));

        const totalConImpuestos = infoFactura.ele('totalConImpuestos');
        if (parseFloat(factura.subtotal_con_iva) > 0) {
            const totalImpuesto = totalConImpuestos.ele('totalImpuesto');
            totalImpuesto.ele('codigo').txt('2');
            totalImpuesto.ele('codigoPorcentaje').txt('2');
            totalImpuesto.ele('baseImponible').txt(parseFloat(factura.subtotal_con_iva).toFixed(2));
            totalImpuesto.ele('valor').txt(parseFloat(factura.total_iva).toFixed(2));
        }
        if (parseFloat(factura.subtotal_sin_iva) > 0) {
            const totalImpuesto = totalConImpuestos.ele('totalImpuesto');
            totalImpuesto.ele('codigo').txt('2');
            totalImpuesto.ele('codigoPorcentaje').txt('0');
            totalImpuesto.ele('baseImponible').txt(parseFloat(factura.subtotal_sin_iva).toFixed(2));
            totalImpuesto.ele('valor').txt('0.00');
        }

        infoFactura.ele('propina').txt('0.00');
        infoFactura.ele('importeTotal').txt(parseFloat(factura.total).toFixed(2));
        infoFactura.ele('moneda').txt('DOLAR');

        const detalles = root.ele('detalles');
        for (const det of factura.DetalleFactura) {
            const detalle = detalles.ele('detalle');
            detalle.ele('codigoPrincipal').txt(det.Producto.codigo_producto);
            detalle.ele('descripcion').txt(det.Producto.nombre);
            detalle.ele('cantidad').txt(det.cantidad.toString());
            detalle.ele('precioUnitario').txt(parseFloat(det.precio_unitario).toFixed(6));
            detalle.ele('descuento').txt(parseFloat(det.valor_descuento).toFixed(2));
            detalle.ele('precioTotalSinImpuesto').txt(parseFloat(det.subtotal).toFixed(2));

            const impuestos = detalle.ele('impuestos');
            const impuesto = impuestos.ele('impuesto');
            impuesto.ele('codigo').txt('2');
            impuesto.ele('codigoPorcentaje').txt(det.ValorIva.codigo);
            impuesto.ele('tarifa').txt(det.ValorIva.porcentaje_iva.toString());
            const baseImponible = parseFloat(det.subtotal);
            const valorIva = baseImponible * (parseFloat(det.ValorIva.porcentaje_iva) / 100);
            impuesto.ele('baseImponible').txt(baseImponible.toFixed(2));
            impuesto.ele('valor').txt(valorIva.toFixed(2));
        }

        const infoAdicional = root.ele('infoAdicional');
        infoAdicional.ele('campoAdicional', { nombre: 'Email' }).txt(cliente.email);

        return root.end({ prettyPrint: true });
    }

    // ============================================
    // FIRMAR XML - SIMPLIFICADO (sin parámetros)
    // ============================================
    async firmarXml(xmlString) {
        // MODO MOCK
        if (this.modoMock) {
            console.log('🧪 MOCK: Simulando firma digital...');
            return xmlString.replace(
                '</factura>',
                `<!-- FIRMA SIMULADA (MODO PRUEBA) -->
                <ds:Signature xmlns:ds="http://www.w3.org/2000/09/xmldsig#">
                    <ds:SignatureValue>MOCK_SIGNATURE_${Date.now()}</ds:SignatureValue>
                </ds:Signature>
                </factura>`
            );
        }

        try {
            let p12Buffer, password;

            // MODO BASE DE DATOS - BUSCA EL CERTIFICADO ACTIVO
            if (this.useDbCertificates) {
                // ✅ SIMPLIFICADO: Buscar el único certificado activo
                const cert = await CertificadoDigital.findOne({
                    where: { activo: true },
                    order: [['fecha_expiracion', 'DESC']]
                });

                if (!cert) {
                    throw new Error('No hay ningún certificado activo. Sube uno desde el panel de administración.');
                }

                // Verificar que no esté expirado
                if (new Date() > cert.fecha_expiracion) {
                    throw new Error(`Certificado expirado el ${cert.fecha_expiracion.toLocaleDateString()}. Por favor, sube uno nuevo.`);
                }

                const certData = await this.certificateService.getCertificateForSigning(cert.id_certificado);
                p12Buffer = certData.p12Buffer;
                password = certData.password;

                console.log(`✅ Usando certificado: ${cert.nombre} (Expira: ${cert.fecha_expiracion.toLocaleDateString()})`);
            }
            // MODO ARCHIVO ESTÁTICO
            else {
                const certPath = process.env.CERTIFICADO_PATH;
                if (!certPath) {
                    throw new Error('CERTIFICADO_PATH no configurado en .env');
                }

                p12Buffer = await fs.readFile(certPath);
                password = process.env.CERTIFICADO_PASSWORD;

                if (!password) {
                    throw new Error('CERTIFICADO_PASSWORD no configurado en .env');
                }

                console.log('✅ Usando certificado desde archivo estático');
            }

            // Firmar con forge (código igual)
            const p12Asn1 = forge.asn1.fromDer(p12Buffer.toString('binary'));
            const p12 = forge.pkcs12.pkcs12FromAsn1(p12Asn1, password);

            const certBags = p12.getBags({ bagType: forge.pki.oids.certBag });
            const keyBags = p12.getBags({ bagType: forge.pki.oids.pkcs8ShroudedKeyBag });

            const cert = certBags[forge.pki.oids.certBag][0].cert;
            const privateKey = keyBags[forge.pki.oids.pkcs8ShroudedKeyBag][0].key;

            const md = forge.md.sha256.create();
            md.update(xmlString, 'utf8');
            const signature = privateKey.sign(md);

            const signatureBase64 = forge.util.encode64(signature);
            const certBase64 = forge.util.encode64(forge.asn1.toDer(forge.pki.certificateToAsn1(cert)).getBytes());

            const xmlFirmado = xmlString.replace(
                '</factura>',
                `<ds:Signature xmlns:ds="http://www.w3.org/2000/09/xmldsig#">
                    <ds:SignedInfo>
                        <ds:SignatureMethod Algorithm="http://www.w3.org/2001/04/xmldsig-more#rsa-sha256"/>
                    </ds:SignedInfo>
                    <ds:SignatureValue>${signatureBase64}</ds:SignatureValue>
                    <ds:KeyInfo>
                        <ds:X509Data>
                            <ds:X509Certificate>${certBase64}</ds:X509Certificate>
                        </ds:X509Data>
                    </ds:KeyInfo>
                </ds:Signature>
                </factura>`
            );

            // Limpiar memoria
            if (p12Buffer) {
                p12Buffer.fill(0);
            }

            return xmlFirmado;

        } catch (error) {
            throw new Error(`Error firmando XML: ${error.message}`);
        }
    }

    // ============================================
    // OBTENER INFO DEL CERTIFICADO ACTIVO
    // ============================================
    async getCertificateInfo() {
        if (!this.useDbCertificates) {
            return {
                source: 'archivo',
                mensaje: 'Usando certificado desde archivo estático'
            };
        }

        const cert = await CertificadoDigital.findOne({
            where: { activo: true },
            order: [['fecha_expiracion', 'DESC']]
        });

        if (!cert) {
            return {
                existe: false,
                mensaje: '⚠️ No hay certificado activo. Sube uno desde el panel de administración.'
            };
        }

        const diasRestantes = Math.ceil((cert.fecha_expiracion - new Date()) / (1000 * 60 * 60 * 24));

        return {
            existe: true,
            nombre: cert.nombre,
            emisor: cert.emisor,
            fecha_expiracion: cert.fecha_expiracion,
            diasRestantes,
            estado: diasRestantes < 0 ? 'expirado' : diasRestantes < 30 ? 'por_expirar' : 'vigente',
            alerta: diasRestantes < 30 && diasRestantes >= 0
                ? `⚠️ El certificado expira en ${diasRestantes} días. Considera renovarlo pronto.`
                : null
        };
    }

    // ============================================
    // ENVIAR AL SRI
    // ============================================
    async enviarAlSri(xmlFirmado) {
        if (this.modoMock) {
            console.log('🧪 MOCK: Simulando envío al SRI...');
            await new Promise(resolve => setTimeout(resolve, 1000));
            return {
                estado: 'RECIBIDA',
                mensaje: 'MOCK: Comprobante recibido (simulación)',
                claveAcceso: xmlFirmado.match(/<claveAcceso>(.*?)<\/claveAcceso>/)?.[1]
            };
        }

        const config = await ConfiguracionSri.findOne({ where: { activo: true } });
        const formData = new FormData();
        formData.append('xml', Buffer.from(xmlFirmado), {
            filename: 'comprobante.xml',
            contentType: 'text/xml'
        });

        try {
            const response = await axios.post(config.url_recepcion, formData, {
                headers: formData.getHeaders(),
                timeout: 30000
            });

            return {
                estado: response.data.includes('RECIBIDA') ? 'RECIBIDA' : 'ERROR',
                mensaje: response.data
            };
        } catch (error) {
            throw new Error(`Error enviando al SRI: ${error.message}`);
        }
    }

    // ============================================
    // CONSULTAR AUTORIZACIÓN
    // ============================================
    async consultarAutorizacion(claveAcceso) {
        if (this.modoMock) {
            console.log('🧪 MOCK: Simulando autorización...');
            await new Promise(resolve => setTimeout(resolve, 1500));
            return {
                autorizado: true,
                numeroAutorizacion: claveAcceso,
                fechaAutorizacion: new Date(),
                xmlRespuesta: `MOCK: Autorización simulada`
            };
        }

        const config = await ConfiguracionSri.findOne({ where: { activo: true } });

        try {
            const response = await axios.post(
                config.url_autorizacion,
                `<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
                    <soap:Body>
                        <autorizacionComprobante>
                            <claveAccesoComprobante>${claveAcceso}</claveAccesoComprobante>
                        </autorizacionComprobante>
                    </soap:Body>
                </soap:Envelope>`,
                {
                    headers: { 'Content-Type': 'text/xml' },
                    timeout: 30000
                }
            );

            const autorizado = response.data.includes('AUTORIZADO');
            return {
                autorizado,
                numeroAutorizacion: autorizado ? claveAcceso : null,
                fechaAutorizacion: autorizado ? new Date() : null,
                xmlRespuesta: response.data
            };
        } catch (error) {
            throw new Error(`Error consultando autorización: ${error.message}`);
        }
    }
}