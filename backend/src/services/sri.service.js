// ============================================
// services/sri.service.js
// ============================================
import xmlbuilder2 from 'xmlbuilder2';
import forge from 'node-forge';
import fs from 'fs/promises';
import crypto from 'crypto';
import moment from 'moment';
import axios from 'axios';
import FormData from 'form-data';
import { ConfiguracionSri, Factura, Cliente, DetalleFactura, Producto, ValorIva } from '../models/index.js';

export class SriService {

    // ============================================
    // 1. GENERAR CLAVE DE ACCESO (49 DÍGITOS)
    // ============================================
    generarClaveAcceso(fechaEmision, tipoComprobante, ruc, ambiente, serie, secuencial, codigoNumerico, tipoEmision) {
        const fecha = moment(fechaEmision).format('DDMMYYYY');
        const tipo = tipoComprobante.padStart(2, '0'); // 01 = Factura
        const rucEmisor = ruc.padStart(13, '0');
        const amb = ambiente.toString();
        const serieCompleta = serie.replace('-', ''); // 001001
        const secuencialFormateado = secuencial.padStart(9, '0');
        const codNum = codigoNumerico.padStart(8, '0');
        const tipEmis = tipoEmision.toString();

        const claveBase = fecha + tipo + rucEmisor + amb + serieCompleta + secuencialFormateado + codNum + tipEmis;

        // Calcular dígito verificador (Módulo 11)
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
    // 2. GENERAR XML DE FACTURA
    // ============================================
    async generarXmlFactura(idFactura) {
        const factura = await Factura.findByPk(idFactura, {
            include: [
                {
                    model: Cliente,
                    attributes: ['identificacion', 'nombre', 'apellido', 'email', 'direccion']
                },
                {
                    model: DetalleFactura,
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

        // Generar clave de acceso si no existe
        if (!factura.clave_acceso_sri) {
            const [est, pe, sec] = factura.secuencial.split('-');
            const codigoNumerico = Math.floor(10000000 + Math.random() * 90000000).toString();

            const claveAcceso = this.generarClaveAcceso(
                factura.fecha_emision,
                '01', // Factura
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

        // ====== INFO TRIBUTARIA ======
        const infoTributaria = root.ele('infoTributaria');
        infoTributaria.ele('ambiente').txt(config.ambiente.toString());
        infoTributaria.ele('tipoEmision').txt(config.tipo_emision.toString());
        infoTributaria.ele('razonSocial').txt(config.razon_social);
        if (config.nombre_comercial) {
            infoTributaria.ele('nombreComercial').txt(config.nombre_comercial);
        }
        infoTributaria.ele('ruc').txt(config.ruc);
        infoTributaria.ele('claveAcceso').txt(factura.clave_acceso_sri);
        infoTributaria.ele('codDoc').txt('01'); // Factura
        infoTributaria.ele('estab').txt(config.establecimiento);
        infoTributaria.ele('ptoEmi').txt(config.punto_emision);
        infoTributaria.ele('secuencial').txt(factura.secuencial.split('-')[2]);
        infoTributaria.ele('dirMatriz').txt(config.direccion_matriz);

        // ====== INFO FACTURA ======
        const infoFactura = root.ele('infoFactura');
        infoFactura.ele('fechaEmision').txt(moment(factura.fecha_emision).format('DD/MM/YYYY'));
        infoFactura.ele('dirEstablecimiento').txt(config.direccion_matriz);
        if (config.contribuyente_especial) {
            infoFactura.ele('contribuyenteEspecial').txt(config.contribuyente_especial);
        }
        infoFactura.ele('obligadoContabilidad').txt(config.obligado_contabilidad ? 'SI' : 'NO');

        // Cliente
        const cliente = factura.Cliente;
        infoFactura.ele('tipoIdentificacionComprador').txt(
            cliente.identificacion.length === 10 ? '05' : // Cédula
                cliente.identificacion.length === 13 ? '04' : // RUC
                    '06' // Pasaporte
        );
        infoFactura.ele('razonSocialComprador').txt(`${cliente.nombre} ${cliente.apellido}`);
        infoFactura.ele('identificacionComprador').txt(cliente.identificacion);
        infoFactura.ele('direccionComprador').txt(cliente.direccion);

        // Totales
        infoFactura.ele('totalSinImpuestos').txt(
            (parseFloat(factura.subtotal_sin_iva) + parseFloat(factura.subtotal_con_iva)).toFixed(2)
        );
        infoFactura.ele('totalDescuento').txt(parseFloat(factura.total_descuento).toFixed(2));

        // Impuestos totales
        const totalConImpuestos = infoFactura.ele('totalConImpuestos');
        if (parseFloat(factura.subtotal_con_iva) > 0) {
            const totalImpuesto = totalConImpuestos.ele('totalImpuesto');
            totalImpuesto.ele('codigo').txt('2'); // IVA
            totalImpuesto.ele('codigoPorcentaje').txt('2'); // 12%
            totalImpuesto.ele('baseImponible').txt(parseFloat(factura.subtotal_con_iva).toFixed(2));
            totalImpuesto.ele('valor').txt(parseFloat(factura.total_iva).toFixed(2));
        }
        if (parseFloat(factura.subtotal_sin_iva) > 0) {
            const totalImpuesto = totalConImpuestos.ele('totalImpuesto');
            totalImpuesto.ele('codigo').txt('2'); // IVA
            totalImpuesto.ele('codigoPorcentaje').txt('0'); // 0%
            totalImpuesto.ele('baseImponible').txt(parseFloat(factura.subtotal_sin_iva).toFixed(2));
            totalImpuesto.ele('valor').txt('0.00');
        }

        infoFactura.ele('propina').txt('0.00');
        infoFactura.ele('importeTotal').txt(parseFloat(factura.total).toFixed(2));
        infoFactura.ele('moneda').txt('DOLAR');

        // ====== DETALLES ======
        const detalles = root.ele('detalles');
        for (const det of factura.DetalleFacturas) {
            const detalle = detalles.ele('detalle');
            detalle.ele('codigoPrincipal').txt(det.Producto.codigo_producto);
            detalle.ele('descripcion').txt(det.Producto.nombre);
            detalle.ele('cantidad').txt(det.cantidad.toString());
            detalle.ele('precioUnitario').txt(parseFloat(det.precio_unitario).toFixed(6));
            detalle.ele('descuento').txt(parseFloat(det.valor_descuento).toFixed(2));
            detalle.ele('precioTotalSinImpuesto').txt(parseFloat(det.subtotal).toFixed(2));

            const impuestos = detalle.ele('impuestos');
            const impuesto = impuestos.ele('impuesto');
            impuesto.ele('codigo').txt('2'); // IVA
            impuesto.ele('codigoPorcentaje').txt(det.ValorIva.codigo);
            impuesto.ele('tarifa').txt(det.ValorIva.porcentaje_iva.toString());
            const baseImponible = parseFloat(det.subtotal);
            const valorIva = baseImponible * (parseFloat(det.ValorIva.porcentaje_iva) / 100);
            impuesto.ele('baseImponible').txt(baseImponible.toFixed(2));
            impuesto.ele('valor').txt(valorIva.toFixed(2));
        }

        // ====== INFO ADICIONAL ======
        const infoAdicional = root.ele('infoAdicional');
        infoAdicional.ele('campoAdicional', { nombre: 'Email' }).txt(cliente.email);

        return root.end({ prettyPrint: true });
    }

    // ============================================
    // 3. FIRMAR XML CON CERTIFICADO DIGITAL
    // ============================================
    async firmarXml(xmlString, certificadoPath, password) {
        try {
            const p12Buffer = await fs.readFile(certificadoPath);
            const p12Asn1 = forge.asn1.fromDer(p12Buffer.toString('binary'));
            const p12 = forge.pkcs12.pkcs12FromAsn1(p12Asn1, password);

            // Extraer certificado y clave privada
            const certBags = p12.getBags({ bagType: forge.pki.oids.certBag });
            const keyBags = p12.getBags({ bagType: forge.pki.oids.pkcs8ShroudedKeyBag });

            const cert = certBags[forge.pki.oids.certBag][0].cert;
            const privateKey = keyBags[forge.pki.oids.pkcs8ShroudedKeyBag][0].key;

            // Crear firma
            const md = forge.md.sha256.create();
            md.update(xmlString, 'utf8');
            const signature = privateKey.sign(md);

            // Construir XML firmado (simplificado - en producción usar xmldsig)
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

            return xmlFirmado;
        } catch (error) {
            throw new Error(`Error firmando XML: ${error.message}`);
        }
    }

    // ============================================
    // 4. ENVIAR AL SRI
    // ============================================
    async enviarAlSri(xmlFirmado) {
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

            // Parsear respuesta SOAP
            return {
                estado: response.data.includes('RECIBIDA') ? 'RECIBIDA' : 'ERROR',
                mensaje: response.data
            };
        } catch (error) {
            throw new Error(`Error enviando al SRI: ${error.message}`);
        }
    }

    // ============================================
    // 5. CONSULTAR AUTORIZACIÓN
    // ============================================
    async consultarAutorizacion(claveAcceso) {
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