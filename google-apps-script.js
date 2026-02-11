/**
 * ============================================
 * GOOGLE APPS SCRIPT - DATABASE API
 * Portal Pengurusan Dewan Sri Kinabatangan
 * ============================================
 * 
 * ARAHAN:
 * 1. Buka Google Spreadsheet anda
 * 2. Click Extensions > Apps Script
 * 3. Padam semua kod, paste kod ini
 * 4. Save dan Deploy sebagai Web App
 * 5. Copy URL deployment ke script.js
 */

// ===== CONFIGURATION (TETAPAN) =====
// ANDA BOLEH TAMBAH SHEET BARU DI SINI
const SHEET_CONFIG = {
    permohonan: {
        name: 'Permohonan',
        headers: ['__backendId', 'noPermohonan', 'nama', 'email', 'nomorTelefon', 'cawangan', 'jenisPermohonan', 'items', 'itemsData', 'tarikhMulaPinjam', 'tarikhPulang', 'tujuan', 'status', 'catatan', 'createdAt']
    },
    kategori: {
        name: 'Kategori',
        headers: ['__backendId', 'namaKategori', 'createdAt']
    },
    peralatan: {
        name: 'Peralatan',
        headers: ['__backendId', 'kategori', 'namaPeralatan', 'kuantiti', 'kuantitiTersedia', 'totalBaru', 'totalRosak', 'lastUpdateBaru', 'lastUpdateRosak', 'lastUpdateJumlah', 'createdAt']
    },
    tetapan: {
        name: 'Tetapan',
        headers: ['__backendId', 'key', 'value', 'updatedAt']
    },
    log_stok: {
        name: 'LogStok',
        headers: ['__backendId', 'peralatanId', 'namaPeralatan', 'jenisPerubahan', 'kuantiti', 'catatan', 'timestamp']
    },
    // CONTOH: Jika anda mahu tambah sheet 'Peserta'
    // peserta: {
    //     name: 'SenaraiPeserta',
    //     headers: ['__backendId', 'nama', 'ic', 'phone']
    // }
};

// ===== MAIN HANDLERS =====

/**
 * Handle GET requests - Read data
 */
function doGet(e) {
    try {
        const action = e.parameter.action || 'getAll';
        const type = e.parameter.type || 'permohonan';

        let result;

        switch (action) {
            case 'getAll':
                result = getAllData();
                break;
            case 'getByType':
                result = getDataByType(type);
                break;
            case 'test':
                result = { success: true, message: 'Connection OK!', timestamp: new Date().toISOString() };
                break;
            default:
                result = getAllData();
        }

        return ContentService
            .createTextOutput(JSON.stringify(result))
            .setMimeType(ContentService.MimeType.JSON);

    } catch (error) {
        return ContentService
            .createTextOutput(JSON.stringify({ success: false, error: error.toString() }))
            .setMimeType(ContentService.MimeType.JSON);
    }
}

/**
 * Handle POST requests - Create, Update, Delete
 */
function doPost(e) {
    try {
        const data = JSON.parse(e.postData.contents);
        const action = data.action || 'add';

        let result;

        switch (action) {
            case 'add':
                result = addData(data.type, data.item);
                break;
            case 'update':
                result = updateData(data.type, data.id, data.item);
                break;
            case 'delete':
                result = deleteData(data.type, data.id);
                break;
            case 'bulkAdd':
                result = bulkAddData(data.type, data.items);
                break;
            case 'sync':
                result = syncAllData(data.allData);
                break;
            default:
                result = { success: false, error: 'Unknown action' };
        }

        return ContentService
            .createTextOutput(JSON.stringify(result))
            .setMimeType(ContentService.MimeType.JSON);

    } catch (error) {
        return ContentService
            .createTextOutput(JSON.stringify({ success: false, error: error.toString() }))
            .setMimeType(ContentService.MimeType.JSON);
    }
}

// ===== DATA OPERATIONS =====

/**
 * Get headers for a specific data type
 * (This function is now redundant as headers are in SHEET_CONFIG)
 */
function getHeadersForType(type) {
    const config = SHEET_CONFIG[type];
    return config ? config.headers : [];
}

/**
 * Get all data from all sheets defined in SHEET_CONFIG
 */
function getAllData() {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const allData = [];

    Object.keys(SHEET_CONFIG).forEach(type => {
        const config = SHEET_CONFIG[type];
        const sheet = getSheetRobust(ss, config.name);

        if (sheet) {
            const data = getSheetData(ss, sheet.getName());
            data.forEach(row => { row.type = type; allData.push(row); });
        }
    });

    return { success: true, data: allData };
}

/**
 * Get data by type
 */
function getDataByType(type) {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const config = SHEET_CONFIG[type];

    if (!config) return { success: false, error: 'Unknown type: ' + type };

    const sheet = getSheetRobust(ss, config.name);
    if (!sheet) return { success: false, error: 'Sheet not found: ' + config.name };

    const data = getSheetData(ss, sheet.getName());
    data.forEach(row => row.type = type);

    return { success: true, data: data };
}

/**
 * Convert sheet to array of objects
 */
function getSheetData(ss, sheetName) {
    const sheet = ss.getSheetByName(sheetName);
    if (!sheet) return [];

    const data = sheet.getDataRange().getValues();
    if (data.length < 2) return []; // No data rows

    const headers = data[0].map(h => h ? h.toString().trim() : '');
    const rows = data.slice(1);

    return rows.map(row => {
        const obj = {};
        headers.forEach((header, index) => {
            if (header) {
                obj[header] = row[index];
            }
        });
        return obj;
    }).filter(obj => {
        // Check if row has at least one non-empty value
        return Object.values(obj).some(val => val !== "" && val !== null && val !== undefined);
    });
}

/**
 * Add new data
 */
function addData(type, item) {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const config = SHEET_CONFIG[type];

    if (!config) return { success: false, error: 'Unknown type: ' + type };

    let sheet = getSheetRobust(ss, config.name);

    // Auto-create sheet if it doesn't exist
    if (!sheet) {
        sheet = ss.insertSheet(config.name);
        if (config.headers && config.headers.length > 0) {
            sheet.getRange(1, 1, 1, config.headers.length).setValues([config.headers]);
            // Style header
            sheet.getRange(1, 1, 1, config.headers.length).setFontWeight('bold').setBackground('#f3f4f6');
            sheet.setFrozenRows(1);
        }
    }

    // Get headers
    const headers = sheet.getRange(1, 1, 1, Math.max(1, sheet.getLastColumn())).getValues()[0]
        .map(h => h ? h.toString().trim() : '');

    // Build row data based on headers
    const rowData = headers.map(header => {
        if (!header) return '';
        const val = getValueFromItemCaseInsensitive(item, header);
        return val !== undefined ? prepareValueForSheet(val) : '';
    });

    // Append row
    sheet.appendRow(rowData);

    return { success: true, message: 'Data added successfully', id: item.__backendId };
}

/**
 * Update existing data
 */
function updateData(type, id, item) {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const config = SHEET_CONFIG[type];

    if (!config) return { success: false, error: 'Unknown type: ' + type };

    const sheet = getSheetRobust(ss, config.name);
    if (!sheet) return { success: false, error: 'Sheet not found: ' + config.name };

    const data = sheet.getDataRange().getValues();
    const headers = data[0].map(h => h ? h.toString().trim() : '');
    const idColIndex = headers.findIndex(h => h.toLowerCase() === '__backendid');

    if (idColIndex === -1) {
        return { success: false, error: '__backendId column not found in sheet: ' + config.name };
    }

    const targetId = String(id).trim();

    // Find row with matching ID
    for (let i = 1; i < data.length; i++) {
        const rowId = data[i][idColIndex];
        if (rowId && String(rowId).trim() === targetId) {
            // Update row
            const rowData = headers.map((header, idx) => {
                if (!header) return data[i][idx];

                // Special case: don't overwrite ID if it's missing in item
                if (header.toLowerCase() === '__backendid') return data[i][idx];

                // Prefer new item data (case-insensitive)
                const newVal = getValueFromItemCaseInsensitive(item, header);
                if (newVal !== undefined) {
                    return prepareValueForSheet(newVal);
                }
                return data[i][idx];
            });

            sheet.getRange(i + 1, 1, 1, rowData.length).setValues([rowData]);
            return { success: true, message: 'Data updated successfully' };
        }
    }

    return { success: false, error: 'ID not found in sheet [' + config.name + ']: ' + targetId };
}

/**
 * Delete data by ID
 */
function deleteData(type, id) {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const config = SHEET_CONFIG[type];

    if (!config) return { success: false, error: 'Unknown type: ' + type };

    const sheet = getSheetRobust(ss, config.name);
    if (!sheet) return { success: false, error: 'Sheet not found: ' + config.name };

    const data = sheet.getDataRange().getValues();
    const headers = data[0].map(h => h ? h.toString().trim() : '');
    const idColIndex = headers.findIndex(h => h.toLowerCase() === '__backendid');

    if (idColIndex === -1) {
        return { success: false, error: '__backendId column not found in sheet: ' + config.name };
    }

    const targetId = String(id).trim();

    // Find and delete row
    for (let i = 1; i < data.length; i++) {
        const rowId = data[i][idColIndex];
        if (rowId && String(rowId).trim() === targetId) {
            sheet.deleteRow(i + 1);
            return { success: true, message: 'Data deleted successfully' };
        }
    }

    return { success: false, error: 'ID not found in sheet [' + config.name + ']: ' + targetId };
}

/**
 * Bulk add data
 */
function bulkAddData(type, items) {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const config = SHEET_CONFIG[type];

    if (!config) return { success: false, error: 'Unknown type: ' + type };

    const sheet = getSheetRobust(ss, config.name);
    if (!sheet) return { success: false, error: 'Sheet not found: ' + config.name };

    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0]
        .map(h => h ? h.toString().trim() : '');

    const rows = items.map(item => {
        return headers.map(header => {
            const val = getValueFromItemCaseInsensitive(item, header);
            return val !== undefined ? prepareValueForSheet(val) : '';
        });
    });

    if (rows.length > 0) {
        sheet.getRange(sheet.getLastRow() + 1, 1, rows.length, headers.length).setValues(rows);
    }

    return { success: true, message: `${rows.length} items added successfully` };
}

/**
 * Sync all data - Clear and rewrite
 */
function syncAllData(allData) {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const results = {};

    // Iterate through all configured types
    Object.keys(SHEET_CONFIG).forEach(type => {
        const config = SHEET_CONFIG[type];
        const sheetName = config.name;

        // Filter data for this type
        const items = allData.filter(d => d.type === type);

        // Auto create sheet if needed
        let sheet = getSheetRobust(ss, sheetName);
        if (!sheet) {
            // Only create if we have data or want to initialize
            if (config.headers && config.headers.length > 0) {
                sheet = ss.insertSheet(sheetName);
                sheet.getRange(1, 1, 1, config.headers.length).setValues([config.headers]);
            } else {
                return;
            }
        }

        const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0]
            .map(h => h ? h.toString().trim() : '');

        // Clear existing data (keep headers)
        const lastRow = sheet.getLastRow();
        if (lastRow > 1) {
            sheet.deleteRows(2, lastRow - 1);
        }

        // Add new data
        if (items.length > 0) {
            const rows = items.map(item => {
                return headers.map(header => {
                    if (!header) return '';
                    const val = getValueFromItemCaseInsensitive(item, header);
                    return val !== undefined ? prepareValueForSheet(val) : '';
                });
            });

            sheet.getRange(2, 1, rows.length, headers.length).setValues(rows);
        }

        results[type] = items.length;
    });

    return {
        success: true,
        message: 'All data synced successfully',
        counts: results
    };
}

// ===== UTILITY FUNCTIONS =====

/**
 * Initialize sheets with headers (run manually once)
 */
function initializeSheets() {
    const ss = SpreadsheetApp.getActiveSpreadsheet();

    Object.keys(SHEET_CONFIG).forEach(type => {
        const config = SHEET_CONFIG[type];

        let sheet = ss.getSheetByName(config.name);
        if (!sheet) {
            sheet = ss.insertSheet(config.name);
        }
        sheet.clear();
        sheet.getRange(1, 1, 1, config.headers.length).setValues([config.headers]);
        sheet.setFrozenRows(1);
    });

    return { success: true, message: 'Sheets initialized successfully' };
}

function createOrUpdateSheet(ss, sheetName, headers) {
    let sheet = ss.getSheetByName(sheetName);

    if (!sheet) {
        sheet = ss.insertSheet(sheetName);
    }

    // Set headers
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);

    // Format header row
    sheet.getRange(1, 1, 1, headers.length)
        .setBackground('#4f46e5')
        .setFontColor('#ffffff')
        .setFontWeight('bold');
}

/**
 * Robustly find a sheet by name (case-insensitive and trimmed)
 */
function getSheetRobust(ss, name) {
    if (!name) return null;
    const sheets = ss.getSheets();
    const searchName = name.toLowerCase().trim();
    for (let i = 0; i < sheets.length; i++) {
        const sheetName = sheets[i].getName().toLowerCase().trim();
        if (sheetName === searchName) {
            return sheets[i];
        }
    }
    return null;
}

/**
 * Case-insensitive lookup for item properties
 */
function getValueFromItemCaseInsensitive(item, header) {
    if (!item || !header) return undefined;

    // Exact match first
    if (item[header] !== undefined) return item[header];

    // Case-insensitive match
    const lowerHeader = header.toLowerCase();
    const keys = Object.keys(item);
    for (let i = 0; i < keys.length; i++) {
        const key = keys[i].toLowerCase();
        if (key === lowerHeader) {
            return item[keys[i]];
        }

        // Handle common spelling variations for phone number
        if ((lowerHeader === 'nomortelefon' || lowerHeader === 'nombortelefon') &&
            (key === 'nomortelefon' || key === 'nombortelefon')) {
            return item[keys[i]];
        }
    }
    return undefined;
}

/**
 * Prepare value for Google Sheets (handles leading zeros)
 */
function prepareValueForSheet(val) {
    if (val === undefined || val === null) return '';
    const strVal = String(val);
    // If it starts with 0 and is all digits, prefix with ' to preserve zero
    if (strVal.startsWith('0') && strVal.length > 1 && /^\d+$/.test(strVal)) {
        return "'" + strVal;
    }
    return val;
}
