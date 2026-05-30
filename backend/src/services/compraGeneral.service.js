// src/services/compraGeneral.service.js
import readXlsxFile from 'read-excel-file/node';
import { CompraGeneral, PeriodoCompra } from '../models/index.js';
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
            const y = value.getFullYear();
            const m = String(value.getMonth() + 1).padStart(2, '0');
            const d = String(value.getDate()).padStart(2, '0');
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
}
