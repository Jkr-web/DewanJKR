/**
 * ============================================================
 * SECURED GOOGLE APPS SCRIPT - DATABASE API (VERSION 2.0)
 * Portal Pengurusan Dewan Sri Kinabatangan
 * ============================================================
 */

// 1. KUNCI RAHSIA (Tukar ini kepada kod rahsia anda sendiri)
const AUTH_TOKEN = "CInta_Mtaa2026_diRkhsg";

// 2. KONFIGURASI SHEET
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
    }
};

// --- FUNGSI KESELAMATAN ---
function isAuthorized(e, isPost = false) {
    let tokenRequest;
    if (isPost) {
        try {
            const body = JSON.parse(e.postData.contents);
            tokenRequest = body.token;
        } catch (f) { return false; }
    } else {
        tokenRequest = e.parameter.token;
    }
    return tokenRequest === AUTH_TOKEN;
}

// --- MAIN HANDLERS ---
function doGet(e) {
    if (!isAuthorized(e)) {
        return createJsonResponse({ success: false, error: "Akses tidak dibenarkan!" });
    }

    try {
        const action = e.parameter.action || 'getAll';
        const type = e.parameter.type || 'permohonan';
        let result;

        if (action === 'getAll') result = getAllData();
        else if (action === 'getByType') result = getDataByType(type);
        else result = { success: false, error: "Action tidak sah" };

        return createJsonResponse(result);
    } catch (error) {
        return createJsonResponse({ success: false, error: error.toString() });
    }
}

function doPost(e) {
    if (!isAuthorized(e, true)) {
        return createJsonResponse({ success: false, error: "Akses tidak dibenarkan!" });
    }

    try {
        const data = JSON.parse(e.postData.contents);
        const action = data.action;
        let result;

        switch (action) {
            case 'add': result = addData(data.type, data.item); break;
            case 'update': result = updateData(data.type, data.id, data.item); break;
            case 'delete': result = deleteData(data.type, data.id); break;
            case 'bulkAdd': result = bulkAddData(data.type, data.items); break;
            case 'sync': result = syncAllData(data.allData); break;
            default: result = { success: false, error: 'Action tidak dikenali' };
        }
        return createJsonResponse(result);
    } catch (err) {
        return createJsonResponse({ success: false, error: err.toString() });
    }
}

function createJsonResponse(obj) {
    return ContentService.createTextOutput(JSON.stringify(obj))
        .setMimeType(ContentService.MimeType.JSON);
}

// --- DATA OPERATIONS (FUNGSI ASAL ANDA) ---

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

function getDataByType(type) {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const config = SHEET_CONFIG[type];
    if (!config) return { success: false, error: 'Unknown type' };
    const sheet = getSheetRobust(ss, config.name);
    if (!sheet) return { success: false, error: 'Sheet not found' };
    const data = getSheetData(ss, sheet.getName());
    data.forEach(row => row.type = type);
    return { success: true, data: data };
}

function getSheetData(ss, sheetName) {
    const sheet = ss.getSheetByName(sheetName);
    if (!sheet) return [];
    const data = sheet.getDataRange().getValues();
    if (data.length < 2) return [];
    const headers = data[0].map(h => h ? h.toString().trim() : '');
    const rows = data.slice(1);
    return rows.map(row => {
        const obj = {};
        headers.forEach((header, index) => { if (header) obj[header] = row[index]; });
        return obj;
    }).filter(obj => Object.values(obj).some(val => val !== ""));
}

function addData(type, item) {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const config = SHEET_CONFIG[type];
    let sheet = getSheetRobust(ss, config.name);
    if (!sheet) {
        sheet = ss.insertSheet(config.name);
        sheet.getRange(1, 1, 1, config.headers.length).setValues([config.headers]);
    }
    const headers = sheet.getRange(1, 1, 1, Math.max(1, sheet.getLastColumn())).getValues()[0].map(h => h.toString().trim());
    const rowData = headers.map(header => {
        const val = getValueFromItemCaseInsensitive(item, header);
        return val !== undefined ? prepareValueForSheet(val) : '';
    });
    sheet.appendRow(rowData);
    return { success: true, message: 'Data ditambah' };
}

function updateData(type, id, item) {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const config = SHEET_CONFIG[type];
    const sheet = getSheetRobust(ss, config.name);
    const data = sheet.getDataRange().getValues();
    const headers = data[0].map(h => h.toString().trim());
    const idColIndex = headers.findIndex(h => h.toLowerCase() === '__backendid');
    const targetId = String(id).trim();

    for (let i = 1; i < data.length; i++) {
        if (String(data[i][idColIndex]).trim() === targetId) {
            const rowData = headers.map((header, idx) => {
                if (header.toLowerCase() === '__backendid') return data[i][idx];
                const newVal = getValueFromItemCaseInsensitive(item, header);
                return newVal !== undefined ? prepareValueForSheet(newVal) : data[i][idx];
            });
            sheet.getRange(i + 1, 1, 1, rowData.length).setValues([rowData]);
            return { success: true };
        }
    }
    return { success: false, error: 'ID tidak jumpa' };
}

function deleteData(type, id) {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const config = SHEET_CONFIG[type];
    const sheet = getSheetRobust(ss, config.name);
    const data = sheet.getDataRange().getValues();
    const headers = data[0].map(h => h.toString().trim());
    const idColIndex = headers.findIndex(h => h.toLowerCase() === '__backendid');
    const targetId = String(id).trim();

    for (let i = 1; i < data.length; i++) {
        if (String(data[i][idColIndex]).trim() === targetId) {
            sheet.deleteRow(i + 1);
            return { success: true };
        }
    }
    return { success: false };
}

// --- UTILITIES ---
function getSheetRobust(ss, name) {
    const sheets = ss.getSheets();
    for (let i = 0; i < sheets.length; i++) {
        if (sheets[i].getName().toLowerCase().trim() === name.toLowerCase().trim()) return sheets[i];
    }
    return null;
}

function getValueFromItemCaseInsensitive(item, header) {
    if (!item) return undefined;
    const lowerHeader = header.toLowerCase();
    const keys = Object.keys(item);
    for (let key of keys) {
        if (key.toLowerCase() === lowerHeader) return item[key];
    }
    return undefined;
}

function prepareValueForSheet(val) {
    if (val === undefined || val === null) return '';
    const strVal = String(val);
    if (strVal.startsWith('0') && strVal.length > 1 && /^\d+$/.test(strVal)) return "'" + strVal;
    return val;
}