import readXlsxFile from 'read-excel-file/node';
import { CompraGeneral, PeriodoCompra, CompraInterna, ComunidadMp, ProveedorMp, CategoriaMp, ProductoMp, NegociadorMp, FechaMp } from '../models/index.js';
import { Op } from 'sequelize';

// Column mapping: Excel header → DB field
const COLUMN_MAP = {
    'NUMERO': 'numero',
    'FECHA': 'fecha',
    'COMUNIDAD': 'comunidad',
    'CODIGO': 'codigo',
    'PROVEEDOR': 'proveedor',
    'CATEGORIA': 'categoria',
    'PRODUCTO': 'producto',
    'CANTIDAD': 'cantidad',
    'V. UNITARIO': 'valor_unitario',
    'TOTAL': 'total',
    'NEGOCIADOR': 'negociador'
};

const STRING_FIELDS = ['numero', 'comunidad', 'codigo', 'proveedor', 'categoria', 'producto', 'negociador'];
const INTEGER_FIELDS = ['cantidad'];
const DECIMAL_FIELDS = ['valor_unitario', 'total'];
const DATE_FIELDS = ['fecha'];

export class CompraGeneralService {

    // ── Private ETL helpers ──────────────────────────────────────────

    /**
     * Fix corrupted UTF-8 characters (mojibake) produced by some Excel exports.
     * Idempotent: if the string is already clean, it passes through unchanged.
     */
    _fixEncoding(str) {
        if (typeof str !== 'string') return str;

        const replacements = [
            ['Ã±', 'ñ'],
            ['Ã¡', 'á'],
            ['Ã©', 'é'],
            ['Ã\u00AD', 'í'],   // Ã followed by soft-hyphen
            ['Ã³', 'ó'],
            ['Ãº', 'ú'],
            ['Ã¼', 'ü'],
            ['Ã\u0091', 'Ñ'],   // Ã followed by ''
            ['Ã', 'í'],        // bare Ã followed by nothing recognisable → common case
            
            // Unicode string representations (mojibake from bad exports or bad conversions)
            ['U00D1', 'Ñ'],
            ['U00F1', 'ñ'],
            ['\\u00D1', 'Ñ'],
            ['\\u00F1', 'ñ'],
            ['\\u00d1', 'Ñ'],
            ['\\u00f1', 'ñ'],
            ['u00d1', 'Ñ'],
            ['u00f1', 'ñ'],
            ['U00C1', 'Á'],
            ['U00E1', 'á'],
            ['\\u00C1', 'Á'],
            ['\\u00E1', 'á'],
            ['u00c1', 'Á'],
            ['u00e1', 'á'],
            ['U00C9', 'É'],
            ['U00E9', 'é'],
            ['\\u00C9', 'É'],
            ['\\u00E9', 'é'],
            ['u00c9', 'É'],
            ['u00e9', 'é'],
            ['U00CD', 'Í'],
            ['U00ED', 'í'],
            ['\\u00CD', 'Í'],
            ['\\u00ED', 'í'],
            ['u00cd', 'Í'],
            ['u00ed', 'í'],
            ['U00D3', 'Ó'],
            ['U00F3', 'ó'],
            ['\\u00D3', 'Ó'],
            ['\\u00F3', 'ó'],
            ['u00d3', 'Ó'],
            ['u00f3', 'ó'],
            ['U00DA', 'Ú'],
            ['U00FA', 'ú'],
            ['\\u00DA', 'Ú'],
            ['\\u00FA', 'ú'],
            ['u00da', 'Ú'],
            ['u00fa', 'ú'],
        ];

        let result = str;
        for (const [bad, good] of replacements) {
            result = result.split(bad).join(good);
        }

        // Remove stray Â characters that appear in mojibake
        result = result.replace(/Â/g, '');

        return result;
    }

    /**
     * Trim leading/trailing whitespace and collapse multiple internal spaces.
     */
    _trimAndClean(str) {
        if (typeof str !== 'string') return str;
        return str.trim().replace(/\s{2,}/g, ' ');
    }

    /**
     * Convert string values to uppercase.
     */
    _toUpperCase(str) {
        if (typeof str !== 'string') return str;
        return str.toUpperCase();
    }

    /**
     * Parse a date value (string dd/mm/yyyy or JS Date) → 'YYYY-MM-DD'.
     * Returns null if invalid or empty.
     */
    _parseDate(value) {
        if (value === null || value === undefined || value === '') return null;

        // If it is already a JS Date object
        if (value instanceof Date) {
            if (isNaN(value.getTime())) return null;
            const y = value.getUTCFullYear();
            const m = String(value.getUTCMonth() + 1).padStart(2, '0');
            const d = String(value.getUTCDate()).padStart(2, '0');
            return `${y}-${m}-${d}`;
        }

        // If it is a string in dd/mm/yyyy format
        if (typeof value === 'string') {
            const trimmed = value.trim();
            if (trimmed === '') return null;

            const parts = trimmed.split('/');
            if (parts.length === 3) {
                const day = parseInt(parts[0], 10);
                const month = parseInt(parts[1], 10);
                const year = parseInt(parts[2], 10);

                if (isNaN(day) || isNaN(month) || isNaN(year)) return null;
                if (month < 1 || month > 12 || day < 1 || day > 31) return null;

                return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            }
        }

        // If it is a string in YYYY-MM-DD or ISO format
        if (typeof value === 'string') {
            const date = new Date(value);
            if (!isNaN(date.getTime())) {
                const y = date.getUTCFullYear();
                const m = String(date.getUTCMonth() + 1).padStart(2, '0');
                const d = String(date.getUTCDate()).padStart(2, '0');
                return `${y}-${m}-${d}`;
            }
        }

        return null;
    }

    /**
     * Parse a value to decimal. Handles comma-separated strings ('0,82' → 0.82)
     * and already-numeric values.
     */
    _parseDecimal(value) {
        if (value === null || value === undefined || value === '') return null;
        if (typeof value === 'number') return isNaN(value) ? null : value;

        if (typeof value === 'string') {
            const cleaned = value.trim().replace(',', '.');
            const num = parseFloat(cleaned);
            return isNaN(num) ? null : num;
        }

        return null;
    }

    /**
     * Parse a value to integer.
     */
    _parseInt(value) {
        if (value === null || value === undefined || value === '') return null;
        if (typeof value === 'number') return isNaN(value) ? null : Math.round(value);

        if (typeof value === 'string') {
            const num = parseInt(value.trim(), 10);
            return isNaN(num) ? null : num;
        }

        return null;
    }

    /**
     * Replace null/empty values with sensible defaults.
     * Returns { row, replacedCount } so we can track statistics.
     */
    _replaceNulls(row) {
        let replacedCount = 0;

        for (const field of STRING_FIELDS) {
            if (row[field] === null || row[field] === undefined || row[field] === '') {
                row[field] = 'SIN DATO';
                replacedCount++;
            }
        }

        for (const field of INTEGER_FIELDS) {
            if (row[field] === null || row[field] === undefined || row[field] === '') {
                row[field] = 0;
                replacedCount++;
            }
        }

        for (const field of DECIMAL_FIELDS) {
            if (row[field] === null || row[field] === undefined || row[field] === '') {
                row[field] = 0.00;
                replacedCount++;
            }
        }

        // Date fields: keep null (irrecoverable)

        return { row, replacedCount };
    }

    /**
     * Remove rows where ALL columns are empty/null.
     */
    _removeEmptyRows(rows) {
        return rows.filter(row => {
            return Object.keys(COLUMN_MAP).some(excelCol => {
                const dbField = COLUMN_MAP[excelCol];
                const val = row[dbField];
                return val !== null && val !== undefined && val !== '' && val !== 0;
            });
        });
    }

    /**
     * Remove duplicate rows by numero+fecha+codigo combination, keeping the first occurrence.
     */
    _removeDuplicates(rows) {
        const seen = new Set();
        const unique = [];
        let duplicateCount = 0;

        for (const row of rows) {
            const key = `${row.numero}|${row.fecha}|${row.codigo}`;
            if (seen.has(key)) {
                duplicateCount++;
            } else {
                seen.add(key);
                unique.push(row);
            }
        }

        return { unique, duplicateCount };
    }

    // ── Public methods ───────────────────────────────────────────────

    /**
     * Main ETL pipeline: reads Excel buffer, cleans data, and bulk-inserts into CompraGeneral.
     */
    async processExcel(fileBuffer, id_periodo_compra = null) {
        if (id_periodo_compra) {
            const periodo = await PeriodoCompra.findByPk(parseInt(id_periodo_compra, 10));
            if (periodo && periodo.estado === 'APROBADO') {
                throw new Error('Este período ya se encuentra APROBADO y está bloqueado para nuevas cargas o modificaciones.');
            }
        }

        // 1. Read Excel file from buffer
        const rawRows = await readXlsxFile(fileBuffer);

        if (!rawRows || rawRows.length < 2) {
            return {
                totalFilasExcel: 0,
                filasInsertadas: 0,
                filasVacias: 0,
                duplicadosEliminados: 0,
                camposRellenados: 0,
                datos: []
            };
        }

        // 2. Extract headers (first row) and map to DB fields
        const headers = rawRows[0].map(h => (h ? String(h).trim().toUpperCase() : ''));
        const dataRows = rawRows.slice(1);
        const totalFilasExcel = dataRows.length;

        // 3. Map each row to an object using the column mapping
        let mappedRows = dataRows.map(row => {
            const obj = {};
            headers.forEach((header, index) => {
                const dbField = COLUMN_MAP[header];
                if (dbField) {
                    obj[dbField] = row[index] !== undefined ? row[index] : null;
                }
            });
            obj.id_periodo_compra = id_periodo_compra ? parseInt(id_periodo_compra, 10) : null;
            return obj;
        });

        // 4. Apply text cleaning pipeline to string fields
        mappedRows = mappedRows.map(row => {
            for (const field of STRING_FIELDS) {
                if (row[field] !== null && row[field] !== undefined) {
                    let val = String(row[field]);
                    val = this._fixEncoding(val);
                    val = this._trimAndClean(val);
                    val = this._toUpperCase(val);
                    row[field] = val;
                }
            }
            return row;
        });

        // 5. Parse typed fields
        mappedRows = mappedRows.map(row => {
            for (const field of DATE_FIELDS) {
                row[field] = this._parseDate(row[field]);
            }
            for (const field of DECIMAL_FIELDS) {
                row[field] = this._parseDecimal(row[field]);
            }
            for (const field of INTEGER_FIELDS) {
                row[field] = this._parseInt(row[field]);
            }
            return row;
        });

        // 6. Remove completely empty rows
        const beforeEmpty = mappedRows.length;
        mappedRows = this._removeEmptyRows(mappedRows);
        const filasVacias = beforeEmpty - mappedRows.length;

        // 7. Remove duplicates
        const { unique, duplicateCount } = this._removeDuplicates(mappedRows);
        mappedRows = unique;

        // 8. Replace nulls with defaults
        let camposRellenados = 0;
        mappedRows = mappedRows.map(row => {
            const { row: cleanedRow, replacedCount } = this._replaceNulls(row);
            camposRellenados += replacedCount;
            return cleanedRow;
        });

        // 9. Bulk insert into database
        const insertedRows = await CompraGeneral.bulkCreate(mappedRows);

        return {
            totalFilasExcel,
            filasInsertadas: insertedRows.length,
            filasVacias,
            duplicadosEliminados: duplicateCount,
            camposRellenados,
            datos: insertedRows
        };
    }

    /**
     * Get all CompraGeneral records with pagination.
     */
    async getAll(page = 1, limit = 20, id_periodo_compra = null) {
        const offset = (page - 1) * limit;
        const where = id_periodo_compra ? { id_periodo_compra: parseInt(id_periodo_compra, 10) } : {};

        const { count, rows } = await CompraGeneral.findAndCountAll({
            where,
            limit,
            offset,
            order: [['id_compra_general', 'ASC']]
        });

        // Calculate aggregate summaries for the selected period
        let resumen = null;
        if (count > 0) {
            const stats = await CompraGeneral.findOne({
                attributes: [
                    [CompraGeneral.sequelize.fn('SUM', CompraGeneral.sequelize.col('cantidad')), 'totalCantidad'],
                    [CompraGeneral.sequelize.fn('SUM', CompraGeneral.sequelize.col('total')), 'totalInversion'],
                    [CompraGeneral.sequelize.fn('AVG', CompraGeneral.sequelize.col('valor_unitario')), 'promedioValorUnitario']
                ],
                where,
                raw: true
            });

            resumen = {
                totalCantidad: stats ? parseInt(stats.totalCantidad, 10) || 0 : 0,
                totalInversion: stats ? parseFloat(stats.totalInversion) || 0 : 0,
                promedioValorUnitario: stats ? parseFloat(stats.promedioValorUnitario) || 0 : 0
            };
        }

        return {
            compras: rows,
            total: count,
            pagina: page,
            totalPaginas: Math.ceil(count / limit),
            resumen
        };
    }

    async deleteAll(id_periodo_compra = null) {
        if (id_periodo_compra) {
            const periodo = await PeriodoCompra.findByPk(parseInt(id_periodo_compra, 10));
            if (periodo && periodo.estado === 'APROBADO') {
                throw new Error('Este período ya se encuentra APROBADO y está bloqueado. No se pueden eliminar o modificar sus registros.');
            }
        }
        const where = id_periodo_compra ? { id_periodo_compra: parseInt(id_periodo_compra, 10) } : {};
        const count = await CompraGeneral.destroy({ where });
        return count;
    }

    /**
     * Create a new purchase period/quarter.
     */
    async createPeriodo(data) {
        const nombreTrimmed = data.nombre ? data.nombre.trim() : '';
        if (!nombreTrimmed) {
            throw new Error('El nombre del período es requerido');
        }

        // Validate date order
        if (new Date(data.fecha_inicio) > new Date(data.fecha_fin)) {
            throw new Error('La fecha de inicio no puede ser posterior a la fecha de fin');
        }

        // 1. Check duplicate by name case-insensitive
        const exist = await PeriodoCompra.findOne({
            where: {
                nombre: { [Op.iLike]: nombreTrimmed }
            }
        });

        if (exist) {
            throw new Error(`Ya existe un trimestre o período registrado con el nombre "${nombreTrimmed}"`);
        }

        // 2. Check duplicate by date range overlap
        const overlap = await PeriodoCompra.findOne({
            where: {
                fecha_inicio: { [Op.lte]: data.fecha_fin },
                fecha_fin: { [Op.gte]: data.fecha_inicio }
            }
        });

        if (overlap) {
            throw new Error(`Las fechas seleccionadas colisionan con el período existente "${overlap.nombre}" (${overlap.fecha_inicio} a ${overlap.fecha_fin})`);
        }

        // Auto-calculate quarter (trimestre) and year (anio) from start date if not provided
        let trimestreVal = data.trimestre;
        let anioVal = data.anio;
        if (!trimestreVal && data.fecha_inicio) {
            const date = new Date(data.fecha_inicio);
            if (!isNaN(date.getTime())) {
                const month = date.getUTCMonth() + 1; // 1-12
                trimestreVal = Math.ceil(month / 3);
            }
        }
        if (!anioVal && data.fecha_inicio) {
            const date = new Date(data.fecha_inicio);
            if (!isNaN(date.getTime())) {
                anioVal = date.getUTCFullYear();
            }
        }

        const periodo = await PeriodoCompra.create({
            ...data,
            nombre: nombreTrimmed,
            trimestre: trimestreVal ? parseInt(trimestreVal, 10) : null,
            anio: anioVal ? parseInt(anioVal, 10) : null
        });
        return periodo;
    }

    /**
     * Get all purchase periods/quarters.
     */
    async getPeriodos() {
        const periodos = await PeriodoCompra.findAll({
            order: [['fecha_inicio', 'DESC']]
        });
        return periodos;
    }

    /**
     * Delete a period and all its associated purchases (cascade deletes purchases).
     */
    async deletePeriodo(id) {
        const count = await PeriodoCompra.destroy({
            where: { id_periodo_compra: parseInt(id, 10) }
        });
        return count;
    }

    /**
     * Update an existing period's information.
     */
    async updatePeriodo(id, data) {
        const idInt = parseInt(id, 10);
        
        // Find existing period to merge dates if only one is updated
        const existing = await PeriodoCompra.findByPk(idInt);
        if (!existing) {
            throw new Error('El período no existe');
        }

        const nombreTrimmed = data.nombre ? data.nombre.trim() : existing.nombre;
        const fechaInicio = data.fecha_inicio || existing.fecha_inicio;
        const fechaFin = data.fecha_fin || existing.fecha_fin;

        // Validate date order
        if (new Date(fechaInicio) > new Date(fechaFin)) {
            throw new Error('La fecha de inicio no puede ser posterior a la fecha de fin');
        }

        // 1. Check duplicate by name case-insensitive excluding this period itself
        if (data.nombre) {
            const existName = await PeriodoCompra.findOne({
                where: {
                    id_periodo_compra: { [Op.ne]: idInt },
                    nombre: { [Op.iLike]: nombreTrimmed }
                }
            });

            if (existName) {
                throw new Error(`Ya existe otro trimestre o período registrado con el nombre "${nombreTrimmed}"`);
            }
            data.nombre = nombreTrimmed;
        }

        // 2. Check duplicate by date range overlap excluding this period itself
        const overlap = await PeriodoCompra.findOne({
            where: {
                id_periodo_compra: { [Op.ne]: idInt },
                fecha_inicio: { [Op.lte]: fechaFin },
                fecha_fin: { [Op.gte]: fechaInicio }
            }
        });

        if (overlap) {
            throw new Error(`Las fechas seleccionadas colisionan con el período existente "${overlap.nombre}" (${overlap.fecha_inicio} a ${overlap.fecha_fin})`);
        }

        // Auto-calculate / update quarter (trimestre) and year (anio) from start date if needed
        let trimestreVal = data.trimestre;
        let anioVal = data.anio;
        if (data.fecha_inicio) {
            if (trimestreVal === undefined) {
                const date = new Date(data.fecha_inicio);
                if (!isNaN(date.getTime())) {
                    const month = date.getUTCMonth() + 1;
                    trimestreVal = Math.ceil(month / 3);
                }
            }
            if (anioVal === undefined) {
                const date = new Date(data.fecha_inicio);
                if (!isNaN(date.getTime())) {
                    anioVal = date.getUTCFullYear();
                }
            }
        }

        const updateData = {
            ...data,
            ...(trimestreVal !== undefined ? { trimestre: trimestreVal ? parseInt(trimestreVal, 10) : null } : {}),
            ...(anioVal !== undefined ? { anio: anioVal ? parseInt(anioVal, 10) : null } : {})
        };

        const [updatedRowsCount, updatedRows] = await PeriodoCompra.update(updateData, {
            where: { id_periodo_compra: idInt },
            returning: true
        });
        return updatedRowsCount > 0 ? updatedRows[0] : null;
    }

    /**
     * Run transactional ETL pipeline to load general purchases into the production Data Warehouse (compra_interna)
     * and lock the period by updating its status to 'APROBADO'.
     */
    async approvePeriod(id_periodo_compra) {
        const idInt = parseInt(id_periodo_compra, 10);
        const periodo = await PeriodoCompra.findByPk(idInt);
        if (!periodo) {
            throw new Error('El período no existe');
        }
        if (periodo.estado === 'APROBADO') {
            throw new Error('Este período ya ha sido aprobado y cargado al Data Warehouse.');
        }

        // Fetch staging purchases for the period
        const stagingPurchases = await CompraGeneral.findAll({
            where: { id_periodo_compra: idInt }
        });

        if (stagingPurchases.length === 0) {
            throw new Error('No hay registros de compras cargados en este período para poder aprobar.');
        }

        const sequelize = CompraGeneral.sequelize;
        const transaction = await sequelize.transaction();

        try {
            const dwRecords = [];

            // caches to prevent redundant dimension database lookups
            const comunidadesCache = {};
            const proveedoresCache = {};
            const categoriasCache = {};
            const productosCache = {};
            const negociadoresCache = {};
            const fechasCache = {};

            // Helper maps for Spanish month and day names
            const MONTH_NAMES_MAP = {
                1: 'ENERO', 2: 'FEBRERO', 3: 'MARZO', 4: 'ABRIL',
                5: 'MAYO', 6: 'JUNIO', 7: 'JULIO', 8: 'AGOSTO',
                9: 'SEPTIEMBRE', 10: 'OCTUBRE', 11: 'NOVIEMBRE', 12: 'DICIEMBRE'
            };
            const DAY_NAMES_MAP = {
                0: 'DOMINGO', 1: 'LUNES', 2: 'MARTES', 3: 'MIÉRCOLES',
                4: 'JUEVES', 5: 'VIERNES', 6: 'SÁBADO'
            };

            for (const purchase of stagingPurchases) {
                const comName = purchase.comunidad || 'SIN DATO';
                const provName = purchase.proveedor || 'SIN DATO';
                const catName = purchase.categoria || 'SIN DATO';
                const prodName = purchase.producto || 'SIN DATO';
                const negName = purchase.negociador || 'SIN DATO';

                // 1. Resolve Comunidad
                if (!comunidadesCache[comName]) {
                    const [record] = await ComunidadMp.findOrCreate({
                        where: { comunidad: comName },
                        defaults: { comunidad: comName },
                        transaction
                    });
                    comunidadesCache[comName] = record.id_comunidad_mp;
                }

                // 2. Resolve Proveedor
                if (!proveedoresCache[provName]) {
                    const [record] = await ProveedorMp.findOrCreate({
                        where: { proveedor: provName },
                        defaults: { proveedor: provName },
                        transaction
                    });
                    proveedoresCache[provName] = record.id_proveedor_mp;
                }

                // 3. Resolve Categoria
                if (!categoriasCache[catName]) {
                    const [record] = await CategoriaMp.findOrCreate({
                        where: { categoria: catName },
                        defaults: { categoria: catName },
                        transaction
                    });
                    categoriasCache[catName] = record.id_categoria_mp;
                }

                // 4. Resolve Producto
                if (!productosCache[prodName]) {
                    const [record] = await ProductoMp.findOrCreate({
                        where: { producto: prodName },
                        defaults: { producto: prodName },
                        transaction
                    });
                    productosCache[prodName] = record.id_producto_mp;
                }

                // 5. Resolve Negociador
                if (!negociadoresCache[negName]) {
                    const [record] = await NegociadorMp.findOrCreate({
                        where: { negociador: negName },
                        defaults: { negociador: negName },
                        transaction
                    });
                    negociadoresCache[negName] = record.id_negociador_mp;
                }

                // 6. Resolve Fecha (Dimensión Temporal)
                const fechaStr = purchase.fecha; // 'YYYY-MM-DD'
                if (fechaStr && !fechasCache[fechaStr]) {
                    const dateObj = new Date(fechaStr + 'T12:00:00Z'); // noon UTC to avoid timezone shifts
                    const dia = dateObj.getUTCDate();
                    const mes = dateObj.getUTCMonth() + 1;
                    const anio = dateObj.getUTCFullYear();
                    const trimestre = Math.ceil(mes / 3);
                    const nombreMes = MONTH_NAMES_MAP[mes] || 'DESCONOCIDO';
                    const nombreDiaSemana = DAY_NAMES_MAP[dateObj.getUTCDay()] || 'DESCONOCIDO';

                    const [record] = await FechaMp.findOrCreate({
                        where: { fecha: fechaStr },
                        defaults: {
                            fecha: fechaStr,
                            dia,
                            mes,
                            anio,
                            trimestre,
                            nombre_mes: nombreMes,
                            nombre_dia_semana: nombreDiaSemana
                        },
                        transaction
                    });
                    fechasCache[fechaStr] = record.id_fecha_mp;
                }

                // Build target DW record
                dwRecords.push({
                    id_comunidad_mp: comunidadesCache[comName],
                    id_proveedor_mp: proveedoresCache[provName],
                    id_categoria_mp: categoriasCache[catName],
                    id_producto_mp: productosCache[prodName],
                    id_negociador_mp: negociadoresCache[negName],
                    id_fecha_compra: fechasCache[fechaStr] || null,
                    cantidad_libra: purchase.cantidad,
                    costo_unitario: purchase.valor_unitario,
                    total: purchase.total,
                    id_periodo_compra: idInt
                });
            }

            // Clean any existing records in DW for this period to allow re-runs (safe migration strategy)
            await CompraInterna.destroy({
                where: { id_periodo_compra: idInt },
                transaction
            });

            // Bulk insert into DW
            await CompraInterna.bulkCreate(dwRecords, { transaction });

            // Update Periodo status to APROBADO
            await PeriodoCompra.update(
                { estado: 'APROBADO' },
                {
                    where: { id_periodo_compra: idInt },
                    transaction
                }
            );

            await transaction.commit();

            return {
                comprasProcesadas: dwRecords.length,
                comunidadesUnicas: Object.keys(comunidadesCache).length,
                proveedoresUnicos: Object.keys(proveedoresCache).length
            };

        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

    async getPeriodReport(id) {
        const idInt = parseInt(id, 10);
        if (isNaN(idInt)) {
            throw new Error('ID de período inválido');
        }

        const period = await PeriodoCompra.findByPk(idInt);
        if (!period) {
            throw new Error('El período seleccionado no existe');
        }

        // Fetch all CompraInterna records for this period, including CategoriaMp, FechaMp and ProductoMp
        const records = await CompraInterna.findAll({
            where: { id_periodo_compra: idInt },
            include: [
                {
                    model: CategoriaMp,
                    attributes: ['categoria']
                },
                {
                    model: FechaMp,
                    attributes: ['fecha', 'dia', 'mes', 'anio', 'trimestre', 'nombre_mes', 'nombre_dia_semana']
                },
                {
                    model: ProductoMp,
                    attributes: ['producto']
                }
            ],
            order: [[FechaMp, 'mes', 'ASC'], [FechaMp, 'dia', 'ASC']]
        });

        // Determine the maximum month code in this period's records
        let maxMonth = 1;
        records.forEach(r => {
            if (r.FechaMp && r.FechaMp.mes > maxMonth) {
                maxMonth = r.FechaMp.mes;
            }
        });

        // Helper to get the last Friday of a month
        const getLastFridayOfMonth = (year, month) => {
            const lastDay = new Date(Date.UTC(year, month, 0));
            const dayOfWeek = lastDay.getUTCDay();
            let diff = dayOfWeek - 5;
            if (diff < 0) diff += 7;
            const lastFriday = new Date(lastDay);
            lastFriday.setUTCDate(lastDay.getUTCDate() - diff);
            return lastFriday.getUTCDate();
        };

        const SPANISH_MONTHS = [
            'ENERO', 'FEBRERO', 'MARZO', 'ABRIL', 'MAYO', 'JUNIO',
            'JULIO', 'AGOSTO', 'SEPTIEMBRE', 'OCTUBRE', 'NOVIEMBRE', 'DICIEMBRE'
        ];

        // Aggregation structure grouped by month (from FechaMp dimension)
        const monthlyGroups = {};

        records.forEach(record => {
            const fechaDim = record.FechaMp;
            if (!fechaDim) return;

            let monthCode = fechaDim.mes; // integer 1-12
            let monthName = fechaDim.nombre_mes; // 'ENERO', 'FEBRERO', etc.

            // Option B: Shift purchases of the last week of the month (starting from the last Friday)
            // to the next month, unless it is the final month of the period.
            if (monthCode < maxMonth) {
                const lastFriday = getLastFridayOfMonth(fechaDim.anio, monthCode);
                if (fechaDim.dia >= lastFriday) {
                    monthCode += 1;
                    monthName = SPANISH_MONTHS[monthCode - 1] || fechaDim.nombre_mes;
                }
            }

            if (!monthlyGroups[monthCode]) {
                monthlyGroups[monthCode] = {
                    mes: monthName,
                    codigoMes: monthCode,
                    organico: { qq: 0, monto: 0 },
                    convencional: { qq: 0, monto: 0 },
                    total: { qq: 0, monto: 0 }
                };
            }

            const catName = record.CategoriaMp?.categoria?.toLowerCase() || '';
            const isOrganico = catName.includes('orgánico') || catName.includes('organico');

            const qq = parseFloat(record.cantidad_libra) / 100;
            const monto = parseFloat(record.total);

            if (isOrganico) {
                monthlyGroups[monthCode].organico.qq += qq;
                monthlyGroups[monthCode].organico.monto += monto;
            } else {
                monthlyGroups[monthCode].convencional.qq += qq;
                monthlyGroups[monthCode].convencional.monto += monto;
            }

            // Always add to total
            monthlyGroups[monthCode].total.qq += qq;
            monthlyGroups[monthCode].total.monto += monto;
        });

        // Convert monthlyGroups to sorted array (sorted by month integer)
        const sortedMonths = Object.keys(monthlyGroups)
            .sort((a, b) => parseInt(a) - parseInt(b))
            .map(code => {
                const group = monthlyGroups[code];
                return {
                    mes: group.mes,
                    organico: {
                        qq: Math.round(group.organico.qq * 100) / 100,
                        monto: Math.round(group.organico.monto * 100) / 100
                    },
                    convencional: {
                        qq: Math.round(group.convencional.qq * 100) / 100,
                        monto: Math.round(group.convencional.monto * 100) / 100
                    },
                    total: {
                        qq: Math.round(group.total.qq * 100) / 100,
                        monto: Math.round(group.total.monto * 100) / 100
                    }
                };
            });

        // Calculate grand totals
        const grandTotals = {
            organico: { qq: 0, monto: 0 },
            convencional: { qq: 0, monto: 0 },
            total: { qq: 0, monto: 0 }
        };

        sortedMonths.forEach(m => {
            grandTotals.organico.qq += m.organico.qq;
            grandTotals.organico.monto += m.organico.monto;
            grandTotals.convencional.qq += m.convencional.qq;
            grandTotals.convencional.monto += m.convencional.monto;
            grandTotals.total.qq += m.total.qq;
            grandTotals.total.monto += m.total.monto;
        });

        // Round grand totals
        grandTotals.organico.qq = Math.round(grandTotals.organico.qq * 100) / 100;
        grandTotals.organico.monto = Math.round(grandTotals.organico.monto * 100) / 100;
        grandTotals.convencional.qq = Math.round(grandTotals.convencional.qq * 100) / 100;
        grandTotals.convencional.monto = Math.round(grandTotals.convencional.monto * 100) / 100;
        grandTotals.total.qq = Math.round(grandTotals.total.qq * 100) / 100;
        grandTotals.total.monto = Math.round(grandTotals.total.monto * 100) / 100;

        return {
            periodo: {
                id_periodo_compra: period.id_periodo_compra,
                nombre: period.nombre,
                estado: period.estado
            },
            reporte: sortedMonths,
            totalesGenerales: grandTotals
        };
    }
}

