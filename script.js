function updateClock() {
    try {
        const now = new Date();
        const options = { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true };
        const dateOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };

        const timeStr = now.toLocaleTimeString('ms-MY', options).toUpperCase();
        const dateStr = now.toLocaleDateString('ms-MY', dateOptions);

        const ids = ['clock', 'date', 'dash-clock', 'dash-date', 'dash-clock-big', 'dash-date-big'];
        ids.forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                const val = (id.includes('date')) ? dateStr : timeStr;
                if (el.tagName === 'INPUT') el.value = val;
                else el.textContent = val;
            }
        });
    } catch (e) { console.error('Clock error:', e); }
}

window.togglePasswordVisibility = function (inputId, btn) {
    const input = document.getElementById(inputId);
    if (!input) return;

    const isPassword = input.type === 'password';
    input.type = isPassword ? 'text' : 'password';

    const svg = btn.querySelector('svg');
    if (svg) {
        if (isPassword) {
            svg.innerHTML = `
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7a10.057 10.057 0 012.183-3.043m3.016-1.558A9.992 9.992 0 0112 5c4.478 0 8.268 2.943 9.542 7a10.057 10.057 0 01-2.183 3.043M9.9 9.9a3 3 0 114.2 4.2M3 3l18 18"/>
            `;
        } else {
            svg.innerHTML = `
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
            `;
        }
    }
}

function startClock() {
    if (window.clockInterval) clearInterval(window.clockInterval);
    updateClock();
    window.clockInterval = setInterval(updateClock, 1000);
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', startClock);
} else {
    startClock();
}


const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwijGRohY9lP0Jg2Pi99F8KiiwdldFHJjsWSwQTisDNvOxT1EBfNxvTR_YLz8SNxPuggQ/exec';
const AUTH_TOKEN = 'CInta_Mtaa2026_diRkhsg';

const GoogleSheetsDB = {
    isConfigured: function () {
        return GOOGLE_SCRIPT_URL && GOOGLE_SCRIPT_URL !== 'YOUR_GOOGLE_SCRIPT_URL_HERE';
    },

    testConnection: async function () {
        if (!this.isConfigured()) {
            console.warn('⚠️ Google Sheets belum dikonfigurasi. Sila masukkan URL Apps Script.');
            return { success: false, error: 'Not configured' };
        }

        try {
            const response = await fetch(`${GOOGLE_SCRIPT_URL}?action=test&token=${encodeURIComponent(AUTH_TOKEN)}`);
            const result = await response.json();
            if (result.success) {
                // console.log('✅ Google Sheets Connected!');
            }
            return result;
        } catch (error) {
            console.error('❌ Google Sheets connection failed:', error);
            return { success: false, error: error.message };
        }
    },


    fetchAll: async function () {
        if (!this.isConfigured()) return { success: false, data: [] };

        try {
            const response = await fetch(`${GOOGLE_SCRIPT_URL}?action=getAll&token=${encodeURIComponent(AUTH_TOKEN)}`);
            const result = await response.json();
            // console.log('📥 Data fetched from Google Sheets:', result);
            return result;
        } catch (error) {
            console.error('❌ Fetch from Google Sheets failed:', error);
            return { success: false, data: [], error: error.message };
        }
    },


    add: async function (type, item) {
        if (!this.isConfigured()) return { success: false };

        try {
            const response = await fetch(GOOGLE_SCRIPT_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'text/plain' },
                body: JSON.stringify({ action: 'add', type: type, item: item, token: AUTH_TOKEN })
            });
            const result = await response.json();
            // console.log('📤 Data added to Google Sheets:', result);
            return result;
        } catch (error) {
            console.error('❌ Add to Google Sheets failed:', error);
            return { success: false, error: error.message };
        }
    },


    update: async function (type, id, item) {
        if (!this.isConfigured()) return { success: false };

        try {
            const response = await fetch(GOOGLE_SCRIPT_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'text/plain' },
                body: JSON.stringify({ action: 'update', type: type, id: id, item: item, token: AUTH_TOKEN })
            });
            const result = await response.json();
            // console.log('📝 Data updated in Google Sheets:', result);
            return result;
        } catch (error) {
            console.error('❌ Update Google Sheets failed:', error);
            return { success: false, error: error.message };
        }
    },


    delete: async function (type, id) {
        if (!this.isConfigured()) return { success: false };

        try {
            const response = await fetch(GOOGLE_SCRIPT_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'text/plain' },
                body: JSON.stringify({ action: 'delete', type: type, id: id, token: AUTH_TOKEN })
            });
            const result = await response.json();
            // console.log('🗑️ Data deleted from Google Sheets:', result);
            return result;
        } catch (error) {
            console.error('❌ Delete from Google Sheets failed:', error);
            return { success: false, error: error.message };
        }
    },


    syncToSheets: async function (allData) {
        if (!this.isConfigured()) return { success: false };

        try {
            // console.log('🔄 Syncing all data to Google Sheets...');
            const response = await fetch(GOOGLE_SCRIPT_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'text/plain' },
                body: JSON.stringify({ action: 'sync', allData: allData, token: AUTH_TOKEN })
            });
            const result = await response.json();
            // console.log('✅ Sync complete:', result);
            return result;
        } catch (error) {
            console.error('❌ Sync to Google Sheets failed:', error);
            return { success: false, error: error.message };
        }
    },


    exportLocalToSheets: async function () {
        const localData = JSON.parse(localStorage.getItem('dewanData') || '[]');
        if (localData.length === 0) {
            console.log('ℹ️ Tiada data untuk export');
            return { success: false, error: 'No local data' };
        }

        console.log(`📤 Exporting ${localData.length} items to Google Sheets...`);
        return await this.syncToSheets(localData);
    },


    importFromSheets: async function () {
        const result = await this.fetchAll();
        if (result.success && result.data) {
            localStorage.setItem('dewanData', JSON.stringify(result.data));
            console.log(`📥 Imported ${result.data.length} items from Google Sheets`);

            if (typeof DataStore !== 'undefined') {
                DataStore.notify();
            }
            return { success: true, count: result.data.length };
        }
        return { success: false };
    }
};

window.GoogleSheetsDB = GoogleSheetsDB;

let auth = null;
let isUserMode = (new URLSearchParams(window.location.search).get('user') === 'true') || window.location.hash.includes('user=true');
let firebaseInitialized = false;
let firebaseReadyPromise = null;

function getFirebaseReady() {
    return new Promise((resolve) => {
        if (firebaseInitialized && auth) {
            resolve();
            return;
        }

        const checkInterval = setInterval(() => {
            if (firebaseInitialized && auth && typeof firebase !== 'undefined') {
                clearInterval(checkInterval);
                resolve();
            }
        }, 100);

        setTimeout(() => {
            clearInterval(checkInterval);
            resolve(); // Resolve anyway to avoid infinite wait
        }, 10000);
    });

}

function showLoginError(message, duration = 7000) {
    const errDiv = document.getElementById('login-error');
    const msgEl = document.getElementById('login-error-msg');
    const details = document.getElementById('login-error-details');

    if (errDiv) {
        errDiv.classList.remove('hidden');
        errDiv.classList.add('flex');
    }
    if (msgEl) msgEl.textContent = message;

    console.error('Login error:', message);

    setTimeout(() => {
        if (errDiv) {
            errDiv.classList.add('hidden');
            errDiv.classList.remove('flex');
        }
    }, duration);
}

async function ensureFirebaseSDKs(timeoutMs = 10000) {
    if (typeof firebase !== 'undefined') return;
    if (window._firebaseLoadAttempted) return; // prevent duplicate attempts
    window._firebaseLoadAttempted = true;

    const statusEl = document.getElementById('login-status');
    if (statusEl) {
        statusEl.textContent = 'Memuat Firebase SDK...';
        statusEl.classList.remove('hidden');
    }

    const urls = [
        'https://www.gstatic.com/firebasejs/10.7.0/firebase-app-compat.js',
        'https://www.gstatic.com/firebasejs/10.7.0/firebase-auth-compat.js',
        'https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore-compat.js'
    ];

    function loadScript(url) {
        return new Promise((resolve, reject) => {
            const s = document.createElement('script');
            s.src = url;
            s.async = true;
            s.onload = () => resolve();
            s.onerror = () => reject(new Error('Gagal memuat ' + url));
            document.head.appendChild(s);
        });
    }

    const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout memuat Firebase SDK')), timeoutMs));

    try {
        await Promise.race([Promise.all(urls.map(loadScript)), timeoutPromise]);
        if (statusEl) {
            statusEl.textContent = 'Firebase SDK dimuat';
            setTimeout(() => statusEl.classList.add('hidden'), 1500);
        }
        console.log('✅ Firebase SDKs loaded dynamically');
    } catch (err) {
        if (statusEl) {
            statusEl.textContent = 'Gagal memuat Firebase SDK';
        }
        console.error('❌ ensureFirebaseSDKs error:', err);
        throw err;
    }
}

const firebaseConfig = {
    apiKey: "AIzaSyAYBhrerG2yfHk-xFna0tLI-QbaVDNaV5M",
    authDomain: "sistem-alat-ganti.firebaseapp.com",
    projectId: "sistem-alat-ganti",
    storageBucket: "sistem-alat-ganti.firebasestorage.app",
    messagingSenderId: "974832583504",
    appId: "1:974832583504:web:2001b035fb35093c252255",
    measurementId: "G-44E4RC3EC8"
};

async function initializeFirebase() {
    if (firebaseInitialized) {
        console.log('ℹ️ Firebase already initialized');
        return;
    }

    if (typeof firebase === 'undefined') {
        try {
            await ensureFirebaseSDKs();
        } catch (err) {
            console.error('❌ Firebase SDK load failed:', err);
            showLoginError('Gagal memuat Firebase SDK. Sila semak sambungan rangkaian atau pembekal CDN.');
            setTimeout(initializeFirebase, 3000);
            return;
        }
    }

    try {
        if (!firebase.apps.length) {
            firebase.initializeApp(firebaseConfig);
            // console.log('🔥 Firebase app initialized');
        }

        auth = firebase.auth();
        window.auth = auth; // Expose globally for reset password function
        if (typeof firebase.firestore === 'function') {
            db = firebase.firestore();
            window.db = db;
            // console.log('🔥 Firestore ready');
        }
        firebaseInitialized = true;
        window.firebaseReady = true;
        // console.log('🔥 Firebase Auth ready');

        setupAuthListener();

    } catch (error) {
        console.error('❌ Firebase initialization error:', error);
        showLoginError('Firebase initialization error: ' + (error.message || error));
        setTimeout(initializeFirebase, 1000);
    }
}

function setupAuthListener() {
    if (!auth) {
        console.error('❌ Auth not available for listener');
        return;
    }

    try {
        auth.onAuthStateChanged(async (user) => {
            if (user) {
                // console.log('✅ User logged in:', user.email);

                const isLoggedInFlag = localStorage.getItem('isLoggedIn') === 'true';
                const isManualStarted = sessionStorage.getItem('manualLoginStarted') === 'true' || sessionStorage.getItem('manualLoginInProgress') === 'true';

                if (!isLoggedInFlag && !isManualStarted) {
                    console.log('🛑 Auth state detected but isLoggedIn flag is missing/false. Forcing signout to prevent auto-login loop.');
                    auth.signOut();
                    return;
                }

                sessionStorage.setItem('loggedIn', 'true');
                localStorage.setItem('isLoggedIn', 'true');
                localStorage.setItem('userEmail', user.email);

                const userName = user.displayName || user.email.split('@')[0];
                localStorage.setItem('userName', userName);

                updateUserUI(userName, user.email, user.photoURL);

                if (typeof db !== 'undefined') {
                    db.collection('users').doc(user.uid).get()
                        .then(docSnap => {
                            if (docSnap.exists) {
                                const u = docSnap.data();
                                const finalName = u.name || userName;

                                if (u.status === 'Disekat') {
                                    console.warn('⛔ Akaun disekat (dari listener):', user.email);
                                    showLoginError('Akses ditolak. Akaun anda telah disekat. Sila hubungi pentadbir utama.');
                                    auth.signOut();
                                    return;
                                }

                                localStorage.setItem('userRole', u.role || '');
                                localStorage.setItem('userName', finalName);
                                updateUserUI(finalName, user.email, user.photoURL);

                                if (!sessionStorage.getItem('manualLoginInProgress')) {
                                    finalizeLoginUI();
                                }
                            } else {
                                console.warn('⛔ Profil Firestore tidak dijumpai:', user.email);
                                if (!sessionStorage.getItem('manualLoginInProgress')) {
                                    showLoginError('Akses ditolak. Akaun anda tidak berdaftar dalam sistem.');
                                    auth.signOut();
                                }
                            }
                        }).catch(err => {
                            console.warn('Firestore read error:', err);
                            if (!sessionStorage.getItem('manualLoginInProgress')) {
                                finalizeLoginUI();
                            }
                        });
                } else {
                    if (!sessionStorage.getItem('manualLoginInProgress')) {
                        finalizeLoginUI();
                    }
                }

                function finalizeLoginUI() {
                    const pageLogin = document.getElementById('login-page');
                    const pageApp = document.getElementById('app');

                    if (pageLogin) {
                        pageLogin.classList.add('hidden');
                        pageLogin.style.display = 'none';
                    }
                    if (pageApp) {
                        pageApp.classList.remove('hidden');
                        pageApp.style.display = 'flex';
                    }

                    if (typeof DataStore !== 'undefined') {
                        DataStore.notify();
                    }
                    const lastPage = localStorage.getItem('lastPage') || 'dashboard';
                    showPage(lastPage);
                }
            } else {
                console.log('ℹ️ No user logged in');

                if (isUserMode) {
                    console.log('🚀 User Mode: Skipping login page force');
                    return;
                }

                const isLocalLogin = localStorage.getItem('loginType') === 'local';
                if (isLocalLogin) {
                    console.log('✅ Local session active, ignoring Firebase null user');
                    return;
                }

                sessionStorage.removeItem('loggedIn');
                localStorage.removeItem('isLoggedIn');
                localStorage.removeItem('loginType');

                const pageLogin = document.getElementById('login-page');
                const pageApp = document.getElementById('app');
                if (pageApp) {
                    pageApp.classList.add('hidden');
                    pageApp.style.display = 'none';
                }
                if (pageLogin) {
                    pageLogin.classList.remove('hidden');
                    pageLogin.style.display = 'flex';
                }
            }
        });
    } catch (error) {
        console.error('❌ Error setting up auth listener:', error);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    initializeFirebase();


});




/*
document.getElementById('form-user-permohonan').addEventListener('submit', async (e) => {
    ...
});
*/

document.getElementById('form-permohonan').addEventListener('submit', async (e) => {
    e.preventDefault();
    console.log('🚀 Admin form submitted');

    const btn = document.getElementById('btn-submit-permohonan');
    btn.disabled = true;
    btn.textContent = 'Menghantar...';

    const jenisPermohonan = document.getElementById('jenis-permohonan-hidden').value;
    const itemsDataStr = document.getElementById('items-data-hidden').value;

    const data = {
        type: 'permohonan',
        nama: document.getElementById('nama-pemohon').value,
        email: document.getElementById('email-pemohon').value,
        nomorTelefon: document.getElementById('nombor-telefon').value,
        cawangan: document.getElementById('cawangan').value,
        jenisPermohonan: jenisPermohonan,
        items: document.getElementById('item-dipinjam-hidden').value || jenisPermohonan,
        itemsData: itemsDataStr || '',
        tarikhMulaPinjam: document.getElementById('tarikh-mula').value,
        tarikhPulang: document.getElementById('tarikh-pulang').value,
        tujuan: document.getElementById('tujuan').value,
        status: 'Dalam Proses',
        catatan: '',
        createdAt: new Date().toISOString()
    };

    console.log('📦 Admin data to save:', data);

    const result = await DataStore.add(data);

    if (result.isOk) {
        showToast('Permohonan berjaya ditambah!');
        closeModal('modal-permohonan');
        document.getElementById('form-permohonan').reset();
        document.querySelectorAll('.jenis-btn').forEach(btn => {
            btn.classList.remove('border-indigo-600', 'bg-indigo-50');
            btn.classList.add('border-slate-200');
        });
        document.getElementById('field-senarai-item').classList.add('hidden');
        document.getElementById('admin-terma-dewan').classList.add('hidden');
        document.getElementById('admin-terma-peralatan').classList.add('hidden');
        document.getElementById('admin-terma-warning').classList.add('hidden');

        renderPermohonan();
        updateDashboard();
    } else {
        console.error('❌ Error:', result.error);
        showToast('Gagal menambah permohonan');
    }

    btn.disabled = false;
    btn.textContent = 'Hantar Permohonan';
});

/**
 * Calculates available stock for a specific item during a specific time period.
 * @param {string} itemId The __backendId of the equipment
 * @param {string} startDate ISO string or valid date string
 * @param {string} endDate ISO string or valid date string
 * @param {string} excludePermohonanId (Optional) ID of a permohonan to ignore (useful when editing a request)
 * @returns {number} The remaining units available
 */
function parseSafeDate(dateStr) {
    if (!dateStr) return new Date(NaN);
    if (dateStr instanceof Date) return dateStr;

    let d = new Date(dateStr);
    if (!isNaN(d.getTime())) return d;

    if (typeof dateStr === 'string' && dateStr.includes('/')) {
        const parts = dateStr.split(' ')[0].split('/');
        if (parts.length === 3) {
            d = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
            if (!isNaN(d.getTime())) return d;
        }
    }
    return new Date(NaN);
}

function getAvailableStock(itemId, startDate = null, endDate = null, excludePermohonanId = null) {
    const p = allData.find(d => d.type === 'peralatan' && String(d.__backendId) === String(itemId));
    if (!p) return 0;

    let unitsInUse = 0;
    const totalStock = parseInt(p.kuantiti) || 0;

    const start = parseSafeDate(startDate);
    const end = parseSafeDate(endDate);

    const hasDates = !isNaN(start.getTime()) && !isNaN(end.getTime());

    const activePermohonan = allData.filter(d =>
        d.type === 'permohonan' &&
        !['selesai', 'ditolak', 'dibatalkan'].includes((d.status || '').toLowerCase()) &&
        String(d.__backendId) !== String(excludePermohonanId)
    );

    activePermohonan.forEach(req => {
        let shouldDeduct = false;

        if (hasDates) {
            const reqStart = parseSafeDate(req.tarikhMulaPinjam);
            const reqEnd = parseSafeDate(req.tarikhPulang);
            if (!isNaN(reqStart.getTime()) && !isNaN(reqEnd.getTime())) {
                if (start < reqEnd && end > reqStart) {
                    shouldDeduct = true;
                }
            }
        } else {
            shouldDeduct = true;
        }

        if (shouldDeduct) {
            try {
                const itemsData = req.itemsData;
                if (itemsData) {
                    const items = (typeof itemsData === 'string') ? JSON.parse(itemsData) : itemsData;
                    if (Array.isArray(items)) {
                        const match = items.find(i => String(i.id) === String(itemId));
                        if (match) {
                            unitsInUse += parseInt(match.qty) || 0;
                        }
                    }
                } else if (req.items && req.items.includes(p.namaPeralatan)) {
                    const match = req.items.match(new RegExp(`${p.namaPeralatan}\\s*\\((\\d+)\\s*unit\\)`, 'i'));
                    unitsInUse += match ? parseInt(match[1]) : 1;
                }
            } catch (e) {
                console.warn('Inventory calc deduction error:', e);
            }
        }
    });

    const baki = totalStock - unitsInUse;
    return Math.max(0, baki);
}

const DataStore = {
    key: 'dewanData',
    syncEnabled: true, // Toggle to enable/disable Google Sheets sync

    get: function () {
        try {
            const data = localStorage.getItem(this.key);
            return data ? JSON.parse(data) : [];
        } catch (e) {
            console.error('❌ DataStore.get Error:', e);
            return [];
        }
    },

    save: function (data) {
        if (!Array.isArray(data)) return;

        const processedData = data.map((item, idx) => {
            if (!item.__backendId) {
                item.__backendId = item.id || `temp_${item.type || 'unknown'}_${idx}_${Date.now()}`;
            }
            return item;
        });

        localStorage.setItem(this.key, JSON.stringify(processedData));
        allData = processedData;
        this.notify();
    },

    add: async function (item) {
        const data = this.get();
        item.__backendId = Date.now().toString();
        if (!item.type && item.nama && item.tarikhMulaPinjam) {
            item.type = 'permohonan';
        }
        console.log('📦 Saving Item to DataStore:', item);
        data.push(item);
        this.save(data);

        if (this.syncEnabled && GoogleSheetsDB.isConfigured()) {
            try {
                const res = await GoogleSheetsDB.add(item.type, item);
                if (!res.success) {
                    console.error('❌ Google Sheets add failed:', res.error);
                    showToast('Gagal menyelaraskan ke Google Sheets: ' + (res.error || 'Ralat tidak diketahui'), 'error');
                }
            } catch (err) {
                console.warn('⚠️ Google Sheets sync failed (add):', err);
                showToast('Ralat sambungan ke Google Sheets.', 'error');
            }
        }

        return { isOk: true };
    },

    update: async function (id, updatedItem) {
        let data = this.get();
        const targetId = String(id).trim();
        const index = data.findIndex(d => d.__backendId && String(d.__backendId).trim() === targetId);

        if (index !== -1) {
            const oldType = data[index].type;
            data[index] = { ...data[index], ...updatedItem };
            this.save(data);

            if (this.syncEnabled && GoogleSheetsDB.isConfigured()) {
                try {
                    const res = await GoogleSheetsDB.update(oldType || updatedItem.type, targetId, data[index]);
                    if (!res.success) {
                        console.error('❌ Google Sheets update failed:', res.error);
                        showToast('Gagal mengemaskini Google Sheets: ' + (res.error || 'Ralat tidak diketahui'), 'error');
                    } else {
                        console.log('✅ Google Sheets update success');
                    }
                } catch (err) {
                    console.warn('⚠️ Google Sheets sync failed (update):', err);
                    showToast('Ralat sambungan semasa mengemaskini Google Sheets.', 'error');
                }
            }

            return { isOk: true };
        }
        return Promise.resolve({ isOk: false, error: 'Item not found' });
    },

    remove: async function (id, fallbackType = 'permohonan') {
        let data = this.get();
        const targetId = String(id).trim();

        const item = data.find(d => d.__backendId && String(d.__backendId).trim() === targetId);
        const itemType = item ? item.type : fallbackType;

        console.log(`🗑️ DataStore: Attempting delete of [${itemType}] ID: ${targetId}`);

        const initialLength = data.length;
        data = data.filter(d => !d.__backendId || String(d.__backendId).trim() !== targetId);

        this.save(data);

        if (this.syncEnabled && GoogleSheetsDB.isConfigured()) {
            try {
                console.log(`📡 Syncing delete to Sheets for [${itemType}] ID: ${targetId}`);
                const result = await GoogleSheetsDB.delete(itemType, targetId);
                if (result.success) {
                    console.log('📡 Sheets delete success:', result);
                } else {
                    console.error('❌ Sheets delete failed:', result.error);
                    showToast('Gagal memadam data pada Google Sheets: ' + (result.error || 'Ralat tidak diketahui'), 'error');
                }
            } catch (err) {
                console.warn('⚠️ Google Sheets sync failed (delete):', err);
                showToast('Gagal menyambung ke Google Sheets untuk pemadaman.', 'error');
            }
        }

        return { isOk: true };
    },

    notify: function () {
        allData = this.get();
        // console.log('🔄 DataStore Notify: refreshing UI');

        const tasks = [
            { name: 'Dashboard', fn: updateDashboard },
            { name: 'Permohonan', fn: renderPermohonan },
            { name: 'Kategori', fn: renderKategori },
            { name: 'Peralatan', fn: renderPeralatan },
            { name: 'Item Dropdown', fn: updateItemDropdown },
            { name: 'Kategori Dropdown', fn: updateKategoriDropdown },
            { name: 'User Item Dropdown', fn: updateUserItemDropdown },
            { name: 'Laporan', fn: renderLaporan },
            { name: 'Background Settings', fn: applyBgSettings },
            { name: 'Logo Settings', fn: applyLogoSettings },
            { name: 'Notifications', fn: updateNotifications }
        ];

        tasks.forEach(t => {
            try {
                if (typeof t.fn === 'function') t.fn();
            } catch (e) {
                console.warn(`⚠️ UI Task [${t.name}] failed:`, e.message);
            }
        });
    },

    getByDateRange: function (startDate, endDate) {
        return this.get().filter(d => {
            if (d.type !== 'permohonan') return false;
            const appDate = new Date(d.tarikhMulaPinjam);
            return appDate >= startDate && appDate <= endDate;
        });
    },

    loadFromGoogleSheets: async function () {
        if (!GoogleSheetsDB.isConfigured()) {
            console.log('ℹ️ Google Sheets not configured, using localStorage only');
            return false;
        }

        try {
            console.log('📥 Loading data from Google Sheets...');
            const result = await GoogleSheetsDB.fetchAll();

            if (result.success && result.data && result.data.length > 0) {
                this.save(result.data);
                console.log(`✅ Loaded ${result.data.length} items from Google Sheets`);
                return true;
            } else {
                console.log('ℹ️ No data in Google Sheets, using localStorage');
                return false;
            }
        } catch (error) {
            console.error('❌ Failed to load from Google Sheets:', error);
            return false;
        }
    },

    syncAllToSheets: async function () {
        if (!GoogleSheetsDB.isConfigured()) {
            console.warn('⚠️ Google Sheets not configured');
            return { success: false };
        }

        const allData = this.get();
        console.log(`🔄 Syncing ${allData.length} items to Google Sheets...`);

        const result = await GoogleSheetsDB.syncToSheets(allData);

        if (result.success) {
            showToast('✅ Data berjaya di-sync ke Google Sheets!');
        } else {
            showToast('❌ Gagal sync ke Google Sheets');
        }

        return result;
    }
};

window.addEventListener('storage', (e) => {
    if (e.key === DataStore.key) {
        console.log('🔄 Storan dikemaskini dari tab lain');
        DataStore.notify();
    }
});

let allData = DataStore.get();
let currentConfig = {};
let isLoggedIn = false;


const defaultConfig = {
    portal_title: 'PENGURUSAN DEWAN SRI KINABATANGAN',
    org_name: 'Sistem Portal',
    primary_color: '#4f46e5',
    secondary_color: '#f8fafc',
    text_color: '#1e293b',
    accent_color: '#fbbf24',
    surface_color: '#ffffff'
};

if (window.elementSdk) {
    window.elementSdk.init({
        defaultConfig,
        onConfigChange: async (config) => {
            currentConfig = config;
            document.getElementById('portal-title').textContent = config.portal_title || defaultConfig.portal_title;
            document.getElementById('org-name').textContent = config.org_name || defaultConfig.org_name;
        },
        mapToCapabilities: (config) => ({
            recolorables: [
                {
                    get: () => config.primary_color || defaultConfig.primary_color,
                    set: (value) => { config.primary_color = value; window.elementSdk.setConfig({ primary_color: value }); }
                },
                {
                    get: () => config.secondary_color || defaultConfig.secondary_color,
                    set: (value) => { config.secondary_color = value; window.elementSdk.setConfig({ secondary_color: value }); }
                },
                {
                    get: () => config.text_color || defaultConfig.text_color,
                    set: (value) => { config.text_color = value; window.elementSdk.setConfig({ text_color: value }); }
                },
                {
                    get: () => config.accent_color || defaultConfig.accent_color,
                    set: (value) => { config.accent_color = value; window.elementSdk.setConfig({ accent_color: value }); }
                },
                {
                    get: () => config.surface_color || defaultConfig.surface_color,
                    set: (value) => { config.surface_color = value; window.elementSdk.setConfig({ surface_color: value }); }
                }
            ],
            borderables: [],
            fontEditable: undefined,
            fontSizeable: undefined
        }),
        mapToEditPanelValues: (config) => new Map([
            ['portal_title', config.portal_title || defaultConfig.portal_title],
            ['org_name', config.org_name || defaultConfig.org_name]
        ])
    });
}


async function testGoogleSheetsConnection() {
    const indicator = document.getElementById('sheets-status-indicator');
    const statusText = document.getElementById('sheets-status-text');

    if (!indicator || !statusText) return;

    indicator.className = 'w-3 h-3 rounded-full bg-yellow-400 animate-pulse';
    statusText.textContent = 'Menguji sambungan...';

    try {
        const result = await GoogleSheetsDB.testConnection();

        if (result.success) {
            indicator.className = 'w-3 h-3 rounded-full bg-green-500';
            statusText.textContent = '✅ Sambungan berjaya!';
            showToast('✅ Google Sheets berjaya disambungkan!');
        } else {
            indicator.className = 'w-3 h-3 rounded-full bg-red-500';
            statusText.textContent = '❌ ' + (result.error || 'Gagal menyambung');
            showToast('❌ Gagal menyambung ke Google Sheets');
        }
    } catch (error) {
        indicator.className = 'w-3 h-3 rounded-full bg-red-500';
        statusText.textContent = '❌ Ralat: ' + error.message;
        showToast('❌ Ralat sambungan');
    }
}

async function syncDataToSheets() {
    if (!GoogleSheetsDB.isConfigured()) {
        showToast('⚠️ Sila konfigurasi Google Sheets terlebih dahulu');
        return;
    }

    showToast('🔄 Mengexport data ke Google Sheets...');

    try {
        const result = await DataStore.syncAllToSheets();
        if (result.success) {
            console.log('✅ Export complete:', result);
        }
    } catch (error) {
        console.error('Export error:', error);
        showToast('❌ Gagal export: ' + error.message);
    }
}

async function loadDataFromSheets() {
    if (!GoogleSheetsDB.isConfigured()) {
        showToast('⚠️ Sila konfigurasi Google Sheets terlebih dahulu');
        return;
    }

    showToast('📥 Memuat data dari Google Sheets...');

    try {
        const loaded = await DataStore.loadFromGoogleSheets();
        if (loaded) {
            showToast('✅ Data berjaya dimuat dari Google Sheets!');
        } else {
            showToast('ℹ️ Tiada data di Google Sheets');
        }
    } catch (error) {
        console.error('Import error:', error);
        showToast('❌ Gagal import: ' + error.message);
    }
}

function toggleAutoSync() {
    const toggle = document.getElementById('auto-sync-toggle');
    if (toggle) {
        DataStore.syncEnabled = toggle.checked;
        console.log('Auto-sync:', DataStore.syncEnabled ? 'ON' : 'OFF');
        showToast(DataStore.syncEnabled ? '✅ Auto-sync diaktifkan' : '⏸️ Auto-sync dinyahaktifkan');
    }
}

function updateSheetsStatusIndicator() {
    const indicator = document.getElementById('sheets-status-indicator');
    const statusText = document.getElementById('sheets-status-text');

    if (!indicator || !statusText) return;

    if (GoogleSheetsDB.isConfigured()) {
        indicator.className = 'w-3 h-3 rounded-full bg-yellow-400';
        statusText.textContent = 'Dikonfigurasi - Klik test untuk sahkan';
    } else {
        indicator.className = 'w-3 h-3 rounded-full bg-slate-400';
        statusText.textContent = 'Belum dikonfigurasi';
    }
}

async function autoLoadFromGoogleSheets() {
    if (!GoogleSheetsDB.isConfigured()) {
        console.log('ℹ️ Google Sheets not configured, using localStorage');
        applyBgSettings();
        applyLogoSettings();
        return;
    }

    try {
        console.log('🔄 Auto-loading data from Google Sheets...');

        const result = await GoogleSheetsDB.fetchAll();

        if (result.success && result.data && result.data.length > 0) {
            DataStore.save(result.data);
            console.log(`✅ Auto-loaded ${result.data.length} items from Google Sheets`);

            const indicator = document.getElementById('sheets-status-indicator');
            const statusText = document.getElementById('sheets-status-text');
            if (indicator) indicator.className = 'w-3 h-3 rounded-full bg-green-500';
            if (statusText) statusText.textContent = '✅ Data dimuat dari Google Sheets';
        } else {
            console.log('ℹ️ No data in Google Sheets or fetch failed, using localStorage');
            applyBgSettings();
            applyLogoSettings();
        }
    } catch (error) {
        console.warn('⚠️ Auto-load from Google Sheets failed:', error.message);
        applyBgSettings();
        applyLogoSettings();
    }
}

window.addEventListener('DOMContentLoaded', () => {
    try {
        if (!isUserMode) {
            isUserMode = (new URLSearchParams(window.location.search).get('user') === 'true') || window.location.hash.includes('user=true');
        }
        console.log('🔍 App Init - isUserMode:', isUserMode, 'Hash:', window.location.hash);

        updateSheetsStatusIndicator();

        autoLoadFromGoogleSheets().then(() => {
            if (!isUserMode) {
                startRealtimeSync();
            }
        });

        if (isUserMode) {
            console.log('🚀 User Mode Activated');
            const loginPage = document.getElementById('login-page');
            const appPage = document.getElementById('app');

            if (loginPage) {
                loginPage.classList.add('hidden');
                loginPage.style.setProperty('display', 'none', 'important');
            }
            if (appPage) {
                appPage.classList.add('hidden');
                appPage.style.setProperty('display', 'none', 'important');
            }

            const userModal = document.getElementById('modal-user-form');
            if (userModal) {
                userModal.classList.remove('hidden');
                userModal.style.display = 'flex'; // Ensure it's visible (flex for centering)
                const closeBtn = userModal.querySelector('button[onclick="closeUserForm()"]');
                if (closeBtn) closeBtn.style.display = 'none';
            } else {
                console.error('❌ modal-user-form NOT FOUND');
            }
            document.body.classList.add('user-mode');
            applyBgSettings();

            DataStore.notify();

        } else {
            const storedLogin = localStorage.getItem('isLoggedIn');
            if (storedLogin === 'true') {
                isLoggedIn = true;
                const pageLogin = document.getElementById('login-page');
                const pageApp = document.getElementById('app');

                if (pageLogin) {
                    pageLogin.classList.add('hidden');
                    pageLogin.style.display = 'none';
                }
                if (pageApp) {
                    pageApp.classList.remove('hidden');
                    pageApp.style.display = 'flex';
                }

                const hashPage = window.location.hash.replace('#', '');
                const storedPage = localStorage.getItem('lastPage');
                const validPages = ['dashboard', 'permohonan', 'peralatan', 'tetapan', 'laporan', 'admin'];

                let pageToLoad = 'dashboard';
                if (validPages.includes(hashPage)) {
                    pageToLoad = hashPage;
                } else if (validPages.includes(storedPage)) {
                    pageToLoad = storedPage;
                }

                showPage(pageToLoad);

                DataStore.notify();
            } else {
                const pageLogin = document.getElementById('login-page');
                const pageApp = document.getElementById('app');
                if (pageApp) {
                    pageApp.classList.add('hidden');
                    pageApp.style.display = 'none';
                }
                if (pageLogin) {
                    pageLogin.classList.remove('hidden');
                    pageLogin.style.display = 'flex';
                }

                if (window.location.hash) {
                    history.replaceState(null, null, ' ');
                }
            }
        }
    } catch (err) {
        console.error('❌ Critical App Init Error:', err);
    }
});

window.handleLogin = async function () {
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const username = usernameInput.value.trim();
    const password = passwordInput.value.trim();
    // console.log('🚀 Memulakan log masuk API untuk:', username);

    const userErr = document.getElementById('username-error');
    const passErr = document.getElementById('password-error');
    if (userErr) userErr.classList.add('hidden');
    if (passErr) passErr.classList.add('hidden');

    let hasClientError = false;
    if (!username || !username.includes('@')) {
        if (userErr) {
            userErr.textContent = !username ? 'Sila masukkan email.' : 'Sila masukkan format email yang lengkap (cth: user@gmail.com).';
            userErr.classList.remove('hidden');
        }
        hasClientError = true;
    }
    if (!password) {
        if (passErr) {
            passErr.textContent = 'Sila masukkan kata laluan.';
            passErr.classList.remove('hidden');
        }
        hasClientError = true;
    }

    if (hasClientError) return;

    const loginError = document.getElementById('login-error');
    if (loginError) loginError.classList.add('hidden');

    const progressBar = document.getElementById('login-progress-bar');
    if (progressBar) progressBar.style.width = '0%';

    const submitBtn = document.querySelector('#form-login button[type="submit"]') || document.getElementById('btn-login');
    const originalBtnHTML = submitBtn ? submitBtn.innerHTML : null;

    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = `
            <div class="flex items-center justify-center gap-2">
                <svg class="w-5 h-5 animate-spin-slow" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Sila tunggu...</span>
            </div>
        `;
    }

    function restoreSubmit() {
        if (submitBtn) {
            submitBtn.disabled = false;
            if (originalBtnHTML) submitBtn.innerHTML = originalBtnHTML;
        }
    }

    try {
        if (!window.auth) {
            throw new Error("Firebase Auth belum sedia. Sila refresh.");
        }

        // console.log('⏳ Mencuba log masuk Firebase Auth...');
        sessionStorage.setItem('manualLoginInProgress', 'true');
        const userCred = await window.auth.signInWithEmailAndPassword(username, password);
        const user = userCred.user;
        const uid = user.uid;
        // console.log('✅ Auth Berjaya! UID:', uid);

        localStorage.removeItem('loginAttempts_' + username);

        // console.log('⏳ Mencari profil dakam Firestore (users/' + uid + ')...');
        if (!window.db) {
            throw new Error("Firestore belum sedia.");
        }

        const snap = await window.db.collection("users").doc(uid).get();
        if (!snap.exists) {
            console.error('❌ Firestore Document TIDAK DIJUMPAI! Cari Document ID:', uid);
            await window.auth.signOut();
            throw new Error("❌ Data pengguna tidak dijumpai di Firestore (Cari Document ID: " + uid + ")");
        }

        const userData = snap.data();

        // Save last login time
        const now = new Date().toISOString();
        await window.db.collection("users").doc(uid).update({
            lastLogin: now
        }).catch(err => console.error("⚠️ Gagal simpan log masuk:", err));

        if (userData.status === 'Disekat') {
            await window.auth.signOut();
            throw new Error("❌ Akaun anda telah disekat. Sila hubungi pentadbir utama.");
        }

        sessionStorage.setItem("loggedIn", "true");
        sessionStorage.setItem("currentUser", JSON.stringify({
            uid,
            email: username,
            role: userData.role,
            name: userData.name
        }));

        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('loginType', 'firebase');
        localStorage.setItem('userName', userData.name || username.split('@')[0]);
        localStorage.setItem('userEmail', username);
        localStorage.setItem('userRole', userData.role || '');

        // SUCCESS UI
        const overlay = document.getElementById('login-success-overlay');
        const nameDisplay = document.getElementById('welcome-name');
        const progressBar = document.getElementById('login-progress-bar');

        if (overlay && nameDisplay) {
            nameDisplay.textContent = userData.name || username.split('@')[0];
            overlay.classList.remove('hidden');

            // Trigger progress bar animation
            setTimeout(() => {
                if (progressBar) progressBar.style.width = '100%';
            }, 100);

            // Wait 3 seconds then redirect
            await new Promise(resolve => setTimeout(resolve, 3000));
        } else {
            // Fallback for missing UI
            alert(`✅ Selamat datang, ${userData.name}`);
        }

        const pageLogin = document.getElementById('login-page');
        const pageApp = document.getElementById('app');

        if (pageLogin) pageLogin.classList.add('hidden');
        if (pageApp) {
            pageApp.classList.remove('hidden');
            pageApp.style.display = 'flex';
        }

        if (typeof DataStore !== 'undefined') DataStore.notify();

        const lastPage = localStorage.getItem('lastPage') || 'dashboard';
        showPage(lastPage);
        sessionStorage.removeItem('manualLoginInProgress');

    } catch (err) {
        sessionStorage.removeItem('manualLoginInProgress');
        console.error("❌ Login error:", err.code, err.message);

        let errorMsg = "Masalah log masuk. Sila semak kredensial anda.";

        if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
            errorMsg = "Email tidak dijumpai atau kata laluan salah.";
        } else if (err.code === 'auth/wrong-password') {
            let attempts = parseInt(localStorage.getItem('loginAttempts_' + username) || '0') + 1;
            localStorage.setItem('loginAttempts_' + username, attempts);

            if (attempts >= 3) {
                errorMsg = "Anda telah mencuba 3 kali. Sila reset password anda.";
            } else {
                errorMsg = "Kata laluan salah. Sila masukkan kata laluan yang betul.";
            }
        } else if (err.code === 'auth/invalid-email') {
            errorMsg = "Format email tidak sah.";
        } else if (err.code === 'auth/too-many-requests') {
            errorMsg = "Terlalu banyak percubaan. Sila reset kata laluan atau cuba lagi kemudian.";
        } else if (err.message && err.message.includes("Firestore")) {
            errorMsg = "Akses ditolak. Akaun anda wujud tetapi data profil tidak dijumpai dalam rekod sistem.";
        } else if (err.code === 'permission-denied' || (err.message && err.message.includes("permissions"))) {
            errorMsg = "Akses Firestore ditolak. Sila tetapkan 'Firestore Rules' di Firebase Console kepada 'Allow read/write if auth != null'.";
        } else {
            errorMsg = "Ralat: " + (err.message || "Sila cuba lagi.");
        }

        showLoginError(errorMsg);
    } finally {
        restoreSubmit();
    }
};

/**
 * RESET PASSWORD HELPERS
 */
window.showResetModal = function () {
    const modal = document.getElementById('modal-reset-password');
    if (modal) modal.classList.remove('hidden');
};

window.closeResetModal = function () {
    const modal = document.getElementById('modal-reset-password');
    if (modal) modal.classList.add('hidden');
};

window.handleResetPassword = async function () {
    const email = document.getElementById('reset-email').value.trim();
    const btn = document.getElementById('btn-submit-reset');

    if (!email) {
        alert("Sila masukkan email anda.");
        return;
    }

    btn.disabled = true;
    btn.textContent = "Sedang hantar...";

    try {
        await window.auth.sendPasswordResetEmail(email);
        alert("✅ Pautan reset kata laluan telah dihantar ke email anda. Sila semak inbox atau spam.");
        closeResetModal();
    } catch (error) {
        console.error("Reset Password Error:", error);
        if (error.code === 'auth/user-not-found') {
            alert("❌ Email ini tidak berdaftar dalam sistem.");
        } else {
            alert("❌ Gagal menghantar email reset: " + error.message);
        }
    } finally {
        btn.disabled = false;
        btn.textContent = "Hantar Pautan Reset";
    }
};


document.getElementById('form-login').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        e.preventDefault();
        handleLogin();
    }
});
document.getElementById('form-login').addEventListener('submit', (e) => {
    e.preventDefault();
    handleLogin();
});
const loginSubmitBtn = document.querySelector('#form-login button[type="submit"]');
if (loginSubmitBtn) {
    loginSubmitBtn.addEventListener('click', (e) => {
        e.preventDefault();
        // console.log('🔘 Login submit button clicked');
        handleLogin();
    });
}

function logout() {
    const confirmed = confirm('🚪 Adakah anda pasti mahu log keluar?\n\nSemua data cache akan dibersihkan dan anda perlu log masuk semula.');

    if (!confirmed) {
        // console.log('ℹ️ Logout cancelled by user');
        return;
    }

    // console.log('🚪 Logout confirmed - clearing all data...');

    const sheetsConfig = localStorage.getItem('sheetsConfig');
    const portalBg = localStorage.getItem('portalBgImage');
    const portalBgSize = localStorage.getItem('portalBgSize');
    const portalBgPos = localStorage.getItem('portalBgPosition');
    const portalLogo = localStorage.getItem('portalLogo');
    const portalLogoFit = localStorage.getItem('portalLogoFit');
    const autoLogout = localStorage.getItem('portalAutoLogout');

    // Record logout time before clearing data
    try {
        const userStr = sessionStorage.getItem("currentUser");
        if (userStr && window.db) {
            const userData = JSON.parse(userStr);
            if (userData.uid) {
                const now = new Date().toISOString();
                window.db.collection("users").doc(userData.uid).update({
                    lastLogout: now
                });
            }
        }
    } catch (e) { console.error("⚠️ Gagal simpan log keluar:", e); }

    localStorage.clear();

    if (sheetsConfig) localStorage.setItem('sheetsConfig', sheetsConfig);
    if (portalBg) localStorage.setItem('portalBgImage', portalBg);
    if (portalBgSize) localStorage.setItem('portalBgSize', portalBgSize);
    if (portalBgPos) localStorage.setItem('portalBgPosition', portalBgPos);
    if (portalLogo) localStorage.setItem('portalLogo', portalLogo);
    if (portalLogoFit) localStorage.setItem('portalLogoFit', portalLogoFit);
    if (autoLogout) localStorage.setItem('portalAutoLogout', autoLogout);

    sessionStorage.clear();

    isLoggedIn = false;
    allData = [];

    if (window.auth && window.firebaseInitialized) {
        window.auth.signOut()
            .then(() => {
                // console.log('✅ Firebase signed out');
                performLogoutRedirect();
            })
            .catch((error) => {
                console.error('⚠️ Firebase logout error (non-critical):', error.message);
                performLogoutRedirect();
            });
    } else {
        // console.log('ℹ️ Firebase not initialized, skipping Firebase sign-out');
        performLogoutRedirect();
    }
}

function performLogoutRedirect() {
    window.location.hash = '';

    showToast('✅ Anda telah berjaya log keluar', 'success');

    setTimeout(() => {
        window.location.href = window.location.origin + window.location.pathname;
    }, 500);
}


function getPermohonan() {
    return allData.filter(d => d.type === 'permohonan');
}

function getKategori() {
    return allData.filter(d => d.type === 'kategori');
}

function getPeralatan() {
    return allData.filter(d => d.type === 'peralatan');
}

function showPage(page) {
    document.querySelectorAll('.page').forEach(p => p.classList.add('hidden'));
    document.getElementById(`page-${page}`).classList.remove('hidden');
    document.querySelectorAll('.sidebar-item').forEach(item => {
        item.classList.remove('active');
        if (item.dataset.page === page) {
            item.classList.add('active');
        }
    });

    if (page === 'permohonan') {
        renderPermohonan();
    } else if (page === 'admin') {
        loadAdminData();
    }

    if (isLoggedIn) {
        localStorage.setItem('lastPage', page);
        if (window.location.hash !== '#' + page) {
            window.location.hash = page;
        }
    }

    const sidebar = document.getElementById('sidebar');
    if (window.innerWidth < 768 && sidebar.classList.contains('translate-x-0')) {
        toggleSidebar();
    }
}

window.addEventListener('hashchange', () => {
    if (!isLoggedIn) return;
    const page = window.location.hash.replace('#', '');
    const validPages = ['dashboard', 'permohonan', 'peralatan', 'tetapan', 'laporan'];
    if (validPages.includes(page)) {
        showPage(page);
    }
});

function openModal(id) {
    console.log('🔓 Opening modal:', id);
    const el = document.getElementById(id);
    if (!el) {
        console.error('❌ Modal element not found:', id);
        return;
    }
    el.classList.remove('hidden');
    const app = document.getElementById('app');
    const login = document.getElementById('login-page');
    const globalBg = document.getElementById('global-portal-bg');

    if (app) app.classList.add('modal-blur');
    if (login) login.classList.add('modal-blur');
    if (globalBg) globalBg.classList.add('modal-blur');

    // Prevent body scroll
    document.body.style.overflow = 'hidden';
}

function closeModal(id) {
    document.getElementById(id).classList.add('hidden');
    const app = document.getElementById('app');
    const login = document.getElementById('login-page');
    const globalBg = document.getElementById('global-portal-bg');

    const visibleModals = document.querySelectorAll('.fixed[id^=\"modal-\"]:not(.hidden)');
    if (visibleModals.length === 0) {
        if (app) app.classList.remove('modal-blur');
        if (login) login.classList.remove('modal-blur');
        if (globalBg) globalBg.classList.remove('modal-blur');

        // Restore body scroll
        document.body.style.overflow = 'auto';
    }
}

function showToast(message) {
    const toast = document.getElementById('toast');
    document.getElementById('toast-message').textContent = message;
    toast.classList.remove('hidden');
    setTimeout(() => toast.classList.add('hidden'), 3000);
}

function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebar-overlay');

    if (sidebar.classList.contains('-translate-x-full')) {
        sidebar.classList.remove('-translate-x-full');
        sidebar.classList.add('translate-x-0');
        overlay.classList.remove('hidden');
    } else {
        sidebar.classList.add('-translate-x-full');
        sidebar.classList.remove('translate-x-0');
        overlay.classList.add('hidden');
    }
}

function updateDashboard() {
    const permohonan = getPermohonan();
    const peralatan = getPeralatan();

    document.getElementById('stat-total').textContent = permohonan.length;
    document.getElementById('stat-pending').textContent = permohonan.filter(p => p.status === 'Dalam Proses').length;
    document.getElementById('stat-approved').textContent = permohonan.filter(p => p.status === 'Diluluskan').length;
    document.getElementById('stat-peralatan').textContent = peralatan.length;

    const recentContainer = document.getElementById('recent-applications');
    const recent = permohonan.slice(-5).reverse();

    if (recent.length === 0) {
        recentContainer.innerHTML = '<p class="text-slate-400 text-center py-8">Tiada permohonan terkini</p>';
    } else {
        recentContainer.innerHTML = recent.map(p => `
          <div class="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
            <div class="flex items-center gap-4">
              <div class="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-semibold">
                ${p.nama ? p.nama.charAt(0).toUpperCase() : 'U'}
              </div>
              <div>
                <p class="font-medium text-slate-800">${p.nama || 'Tidak diketahui'}</p>
                <p class="text-sm text-slate-500">${p.cawangan || '-'}</p>
              </div>
            </div>
            <span class="status-badge ${getStatusClass(p.status)}">${p.status || 'Dalam Proses'}</span>
          </div>
        `).join('');
    }
}

let lastNotificationCount = 0;
function updateNotifications() {
    const permohonan = allData.filter(d => d.type === 'permohonan' && d.status === 'Dalam Proses');
    const badge = document.getElementById('notification-badge');
    const countEl = document.getElementById('notification-count');

    if (!badge || !countEl) return;

    const currentCount = permohonan.length;

    if (currentCount > 0) {
        countEl.textContent = currentCount;
        badge.classList.remove('hidden');

        if (currentCount > lastNotificationCount) {
            playNotificationSound();
        }
        lastNotificationCount = currentCount;

        badge.classList.remove('animate-bounce');
        void badge.offsetWidth; // trigger reflow
        badge.classList.add('animate-bounce');
        setTimeout(() => badge.classList.remove('animate-bounce'), 1000);
    } else {
        badge.classList.add('hidden');
        lastNotificationCount = 0;
    }
}

function playSuccessSound() {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(523.25, audioCtx.currentTime); // C5
    oscillator.frequency.exponentialRampToValueAtTime(1046.50, audioCtx.currentTime + 0.1); // C6

    gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.5);

    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    oscillator.start();
    oscillator.stop(audioCtx.currentTime + 0.5);
}

function playNotificationSound() {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    oscillator.type = 'triangle';
    oscillator.frequency.setValueAtTime(880, audioCtx.currentTime); // A5
    oscillator.frequency.exponentialRampToValueAtTime(440, audioCtx.currentTime + 0.2); // A4

    gainNode.gain.setValueAtTime(0.05, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);

    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    oscillator.start();
    oscillator.stop(audioCtx.currentTime + 0.3);
}

function getStatusClass(status) {
    switch (status) {
        case 'Diluluskan': return 'bg-green-100 text-green-700';
        case 'Ditolak': return 'bg-red-100 text-red-700';
        case 'Selesai': return 'bg-blue-100 text-blue-700';
        default: return 'bg-amber-100 text-amber-700';
    }
}

function renderPermohonan() {
    const tbody = document.getElementById('permohonan-table');

    if (!tbody) {
        console.warn('⚠️ renderPermohonan: Element #permohonan-table not found');
        return;
    }

    let permohonan = getPermohonan();

    const startDate = document.getElementById('filter-permohonan-mula')?.value;
    const endDate = document.getElementById('filter-permohonan-akhir')?.value;

    if (startDate || endDate) {
        permohonan = permohonan.filter(p => {
            const pinjamDate = new Date(p.tarikhMulaPinjam);
            const start = startDate ? new Date(startDate) : null;
            const end = endDate ? new Date(endDate) : null;

            if (start && end) {
                return pinjamDate >= start && pinjamDate <= end;
            } else if (start) {
                return pinjamDate >= start;
            } else if (end) {
                return pinjamDate <= end;
            }
            return true;
        });
    }

    if (permohonan.length === 0) {
        tbody.innerHTML = '<tr><td colspan="10" class="px-6 py-12 text-center text-slate-400">Tiada permohonan</td></tr>';
        return;
    }

    tbody.innerHTML = permohonan.map(p => {
        let itemsDisplay = '-';
        if (p.itemsData) {
            try {
                const items = JSON.parse(p.itemsData);
                itemsDisplay = items.map((item, idx) => `${idx + 1}. ${item.name} (${item.qty} unit)`).join('<br>');
            } catch (e) {
                itemsDisplay = p.items || '-';
            }
        } else if (p.items && p.items !== 'Dewan') {
            itemsDisplay = p.items;
        }

        return `
        <tr class="hover:bg-slate-50 transition-colors">
          <td class="px-6 py-4 text-indigo-900 font-mono text-xs font-bold" data-label="No. Rujukan">${p.noPermohonan || '-'}</td>
          
          <td class="px-6 py-4" data-label="Pemohon">
            <div class="flex items-center gap-3">
              <div class="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-semibold text-sm">
                ${p.nama ? p.nama.charAt(0).toUpperCase() : 'U'}
              </div>
              <span class="font-medium text-slate-800 text-right w-full md:w-auto">${p.nama || '-'}</span>
            </div>
          </td>
          <td class="px-6 py-4 text-slate-600 text-sm" data-label="Email">${p.email || '-'}</td>
          <td class="px-6 py-4 text-slate-600 text-sm" data-label="No. Telefon">${p.nomorTelefon || '-'}</td>
          <td class="px-6 py-4 text-slate-600 text-sm" data-label="Cawangan">${p.cawangan || '-'}</td>
          <td class="px-6 py-4 text-slate-600 text-sm font-semibold" data-label="Jenis">${p.jenisPermohonan || '-'}</td>
          <td class="px-6 py-4 text-slate-600 text-sm" data-label="Item">
            <div class="whitespace-pre-wrap">${itemsDisplay}</div>
          </td>
          <td class="px-6 py-4 text-slate-600 text-sm" data-label="Mula">${formatDate(p.tarikhMulaPinjam)}</td>
          <td class="px-6 py-4 text-slate-600 text-sm" data-label="Pulang">${formatDate(p.tarikhPulang)}</td>
          <td class="px-6 py-4" data-label="Status"><span><span class="status-badge ${getStatusClass(p.status)}">${p.status || 'Dalam Proses'}</span></span></td>
          <td class="px-6 py-4" data-label="Tindakan">
            <div class="flex gap-2 flex-wrap justify-center lg:justify-start lg:ml-auto">
              ${p.status === 'Selesai' ? '<span class="text-green-600 text-sm font-medium">✓ Selesai</span>' : `<button onclick="quickMarkCompleted('${p.__backendId}')" class="text-green-600 hover:text-green-800 text-sm font-medium" title="Tandai Selesai">✓ Selesai</button>`}
              <button onclick="openTindakan('${p.__backendId}')" class="text-indigo-600 hover:text-indigo-800 text-sm font-medium">Urus</button>
              <button onclick="openDeleteModal('${p.__backendId}', 'permohonan')" class="text-red-600 hover:text-red-800 text-sm font-medium">Padam</button>
            </div>
          </td>
        </tr>
            `}).join('');
}

function applyPermohonanFilter() {
    renderPermohonan();
}

function resetPermohonanFilter() {
    document.getElementById('filter-permohonan-mula').value = '';
    document.getElementById('filter-permohonan-akhir').value = '';
    document.getElementById('filter-permohonan-akhir').removeAttribute('min');
    renderPermohonan();
}

function updatePermohonanDateConstraints() {
    const startDateInput = document.getElementById('filter-permohonan-mula');
    const endDateInput = document.getElementById('filter-permohonan-akhir');

    if (startDateInput.value) {
        endDateInput.min = startDateInput.value;

        if (endDateInput.value && endDateInput.value < startDateInput.value) {
            endDateInput.value = '';
        }
    } else {
        endDateInput.removeAttribute('min');
    }
}

function updateAdminDateConstraints() {
    const startInput = document.getElementById('tarikh-mula');
    const endInput = document.getElementById('tarikh-pulang');

    if (startInput && endInput && startInput.value) {
        endInput.min = startInput.value;

        if (endInput.value && endInput.value < startInput.value) {
            endInput.value = '';
            showToast('⚠️ Tarikh tamat mesti selepas tarikh mula', 'warning');
        }
    } else if (endInput) {
        endInput.removeAttribute('min');
    }
}

function updateUserDateConstraints() {
    const startInput = document.getElementById('user-tarikh-mula');
    const endInput = document.getElementById('user-tarikh-pulang');

    if (startInput && endInput && startInput.value) {
        endInput.min = startInput.value;

        if (endInput.value && endInput.value < startInput.value) {
            endInput.value = '';
            showToast('⚠️ Tarikh tamat mesti selepas tarikh mula', 'warning');
        }
    } else if (endInput) {
        endInput.removeAttribute('min');
    }
}



function formatDate(dateStr) {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return date.toLocaleString('ms-MY', { dateStyle: 'short', timeStyle: 'short' });
}


function renderKategori() {
    const container = document.getElementById('kategori-list');

    if (!container) {
        console.warn('⚠️ renderKategori: Element #kategori-list not found');
        return;
    }

    const kategori = getKategori();

    if (kategori.length === 0) {
        container.innerHTML = '<p class="text-slate-400 text-center py-8">Tiada kategori</p>';
        return;
    }

    let html = `
    <div class="overflow-x-auto">
        <table class="w-full">
            <thead class="bg-slate-50">
                <tr>
                    <th class="px-4 py-3 text-left text-xs font-black text-slate-500 uppercase tracking-widest">Nama Kategori</th>
                    <th class="px-4 py-3 text-left text-xs font-black text-slate-500 uppercase tracking-widest">Tindakan</th>
                </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
    `;

    html += kategori.map(k => `
            <tr class="hover:bg-slate-50 transition-colors">
                <td class="px-4 py-3">
                    <p class="font-medium text-slate-800">${k.namaKategori || k.nama || '-'}</p>
                </td>
                <td class="px-4 py-3 text-left">
                    <div class="flex justify-end gap-1">
                        <button onclick="openEditKategori('${k.__backendId}')" class="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors" title="Edit">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                            </svg>
                        </button>
                        <button onclick="openDeleteModal('${k.__backendId}', 'kategori')" class="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Padam">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                            </svg>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');

    html += `
            </tbody>
        </table>
    </div>
    `;

    container.innerHTML = html;
}

function openEditKategori(id) {
    const targetId = String(id).trim();
    const data = allData.find(d => d.__backendId && String(d.__backendId).trim() === targetId);
    if (!data) {
        console.error('❌ Kategori not found for edit ID:', targetId);
        return;
    }

    document.getElementById('kategori-id').value = targetId;
    document.getElementById('nama-kategori').value = data.namaKategori || data.nama || '';

    const modal = document.getElementById('modal-kategori');
    if (modal) {
        modal.querySelector('h3').textContent = 'Edit Kategori';
        document.getElementById('btn-submit-kategori').textContent = 'Kemaskini';
    }

    openModal('modal-kategori');
}

function openAddPeralatan() {
    const form = document.getElementById('form-peralatan');
    if (form) form.reset();

    document.getElementById('peralatan-id').value = '';

    const modal = document.getElementById('modal-peralatan');
    if (modal) {
        modal.querySelector('h3').textContent = 'Tambah Peralatan';
        document.getElementById('btn-submit-peralatan').textContent = 'Simpan';
    }

    openModal('modal-peralatan');
}

function openAddKategori() {
    const form = document.getElementById('form-kategori');
    if (form) form.reset();

    document.getElementById('kategori-id').value = '';

    const modal = document.getElementById('modal-kategori');
    if (modal) {
        modal.querySelector('h3').textContent = 'Tambah Kategori';
        document.getElementById('btn-submit-kategori').textContent = 'Simpan';
    }

    openModal('modal-kategori');
}

function openEditPeralatan(id) {
    const targetId = String(id).trim();
    const data = allData.find(d => d.__backendId && String(d.__backendId).trim() === targetId);
    if (!data) {
        console.error('❌ Peralatan not found for edit ID:', targetId);
        return;
    }

    document.getElementById('peralatan-id').value = targetId;
    document.getElementById('kategori-peralatan').value = String(data.kategori || '');
    document.getElementById('nama-peralatan').value = data.namaPeralatan || '';
    document.getElementById('kuantiti-peralatan').value = data.kuantiti || 0;

    document.getElementById('tambah-baru').value = 0;
    document.getElementById('item-rosak').value = 0;

    const modal = document.getElementById('modal-peralatan');
    if (modal) {
        modal.querySelector('h3').textContent = 'Edit Peralatan';
        document.getElementById('btn-submit-peralatan').textContent = 'Kemaskini';
    }

    openModal('modal-peralatan');
}

function renderPeralatan() {
    const container = document.getElementById('peralatan-list');

    if (!container) {
        console.warn('⚠️ renderPeralatan: Element #peralatan-list not found');
        return;
    }

    const peralatan = getPeralatan();
    const kategori = getKategori();

    if (peralatan.length === 0) {
        container.innerHTML = '<p class="text-slate-400 text-center py-8">Tiada peralatan</p>';
        return;
    }

    let html = `
    <div class="overflow-x-auto">
        <table class="w-full">
            <thead class="bg-slate-50">
                <tr>
                    <th class="px-4 py-3 text-left text-xs font-black text-slate-500 uppercase tracking-widest">Peralatan</th>
                    <th class="px-4 py-3 text-left text-xs font-black text-slate-500 uppercase tracking-widest">Kategori</th>
                    <th class="px-4 py-3 text-left text-xs font-black text-slate-500 uppercase tracking-widest">Baki/Jumlah</th>
                    <th class="px-4 py-3 text-left text-xs font-black text-slate-500 uppercase tracking-widest">Tindakan</th>
                </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
    `;

    html += peralatan.map(p => {
        const kat = kategori.find(k => String(k.__backendId) === String(p.kategori));
        const bakiSekarang = getAvailableStock(p.__backendId);
        const statusColor = bakiSekarang > 0 ? 'text-green-600' : 'text-red-600';
        const logs = allData.filter(d => d.type === 'log_stok' && String(d.peralatanId) === String(p.__backendId));
        const calcBaru = logs
            .filter(l => ['Tambah Stok', 'Item Baru'].includes(l.jenisPerubahan))
            .reduce((sum, l) => sum + (parseInt(l.kuantiti) || 0), 0);
        const calcRosak = logs
            .filter(l => l.jenisPerubahan === 'Lapor Rosak')
            .reduce((sum, l) => sum + (parseInt(l.kuantiti) || 0), 0);

        return `
            <tr class="hover:bg-slate-50 transition-colors">
                <td class="px-4 py-3">
                    <p class="font-medium text-slate-800">${p.namaPeralatan || '-'}</p>
                </td>
                <td class="px-4 py-3">
                    <p class="text-sm text-slate-500">${kat ? kat.namaKategori || kat.nama : 'Tiada Kategori'}</p>
                </td>
                <td class="px-4 py-3 text-left">
                    <p class="text-xs ${statusColor} font-bold">${bakiSekarang} / ${p.kuantiti || 0}</p>
                </td>
                <td class="px-4 py-3 text-left">
                    <div class="flex justify-end gap-1">
                        <button onclick="openEditPeralatan('${p.__backendId}')" class="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors" title="Edit">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                            </svg>
                        </button>
                        <button onclick="openDeleteModal('${p.__backendId}', 'peralatan')" class="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Padam">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                            </svg>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');

    html += `
            </tbody>
        </table>
    </div>
    `;

    container.innerHTML = html;
}

function updateItemDropdown() {
    const container = document.getElementById('item-dipinjam-container');
    if (!container) {
        console.error('âŒ Container item-dipinjam-container NOT FOUND!');
        return;
    }

    const checkedItems = {};
    container.querySelectorAll('input.item-checkbox:checked').forEach(cb => {
        const id = cb.dataset.id;
        const qtyVal = document.getElementById(`qty-${id}`)?.value || "1";
        checkedItems[id] = qtyVal;
    });

    const peralatan = getPeralatan();
    const kategori = getKategori();
    const start = document.getElementById('tarikh-mula').value;
    const end = document.getElementById('tarikh-pulang').value;

    if (peralatan.length === 0) {
        container.innerHTML = '<p class="text-slate-400 text-sm text-center py-4">Tiada peralatan tersedia</p>';
        return;
    }

    container.innerHTML = peralatan.map(p => {
        const kat = kategori.find(k => k.__backendId === p.kategori);
        const tersedia = getAvailableStock(p.__backendId, start, end);
        const isAvailable = tersedia > 0;
        const wasChecked = checkedItems[p.__backendId] !== undefined;

        const maxQtyForValidation = tersedia + (wasChecked ? parseInt(checkedItems[p.__backendId]) : 0);

        return `
        <div class="border border-slate-200 rounded-lg p-3 bg-white">
            <label class="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" value="${p.namaPeralatan}" data-id="${p.__backendId}" 
                onchange="toggleQuantityInput('${p.__backendId}')" 
                class="item-checkbox w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-2 focus:ring-indigo-500" 
                ${!isAvailable && !wasChecked ? 'disabled' : ''} ${wasChecked ? 'checked' : ''}>
              <div class="flex-1">
                <span class="text-slate-700 font-medium">${p.namaPeralatan}</span>
                <span class="text-slate-500 text-sm ml-2">(${kat ? kat.namaKategori || kat.nama : '-'})</span>
                <span class="block text-xs ${isAvailable ? 'text-green-600' : 'text-red-600'} font-semibold mt-1">Baki: ${tersedia}/${p.kuantiti || 0} unit</span>
              </div>
            </label>
            <div id="qty-input-${p.__backendId}" class="${wasChecked ? '' : 'hidden'} mt-3 pl-7">
              <label class="block text-xs font-medium text-slate-700 mb-1">Kuantiti Dipinjam</label>
              <input type="number" id="qty-${p.__backendId}" min="1" max="${maxQtyForValidation}" 
                value="${wasChecked ? checkedItems[p.__backendId] : 1}" 
                onchange="validateQuantity('${p.__backendId}', ${maxQtyForValidation})" 
                oninput="validateQuantity('${p.__backendId}', ${maxQtyForValidation})" 
                class="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
            </div>
          </div>
            `;
    }).join('');
}

function toggleQuantityInput(id) {
    const checkbox = document.querySelector(`input[data-id="${id}"]`);
    const qtyInput = document.getElementById(`qty-input-${id}`);

    if (checkbox.checked) {
        qtyInput.classList.remove('hidden');
    } else {
        qtyInput.classList.add('hidden');
    }

    updateSelectedItems();
}

function validateQuantity(id, maxQty) {
    const input = document.getElementById(`qty-${id}`);
    const error = document.getElementById(`qty-error-${id}`);
    const value = parseInt(input.value) || 0;

    if (value > maxQty) {
        input.classList.add('border-red-500', 'focus:ring-red-500', 'focus:border-red-500');
        input.classList.remove('border-slate-200', 'focus:ring-indigo-500', 'focus:border-indigo-500');
        error.classList.remove('hidden');
        input.value = maxQty;
    } else if (value < 1 && input.value !== "") {
        input.value = 1;
        input.classList.remove('border-red-500', 'focus:ring-red-500', 'focus:border-red-500');
        input.classList.add('border-slate-200', 'focus:ring-indigo-500', 'focus:border-indigo-500');
        error.classList.add('hidden');
    } else {
        input.classList.remove('border-red-500', 'focus:ring-red-500', 'focus:border-red-500');
        input.classList.add('border-slate-200', 'focus:ring-indigo-500', 'focus:border-indigo-500');
        error.classList.add('hidden');
    }
    updateSelectedItems();
}

function updateSelectedItems() {
    const checkboxes = document.querySelectorAll('#item-dipinjam-container input[type="checkbox"]:checked');
    const selectedItems = [];
    const itemsData = [];

    checkboxes.forEach(cb => {
        const id = cb.dataset.id;
        const name = cb.value;
        const qtyInput = document.getElementById(`qty-${id}`);
        const qty = qtyInput ? parseInt(qtyInput.value) || 1 : 1;

        selectedItems.push(`${name} (${qty} unit)`);
        itemsData.push({ id, name, qty });
    });

    document.getElementById('item-dipinjam-hidden').value = selectedItems.join(', ');
    document.getElementById('items-data-hidden').value = JSON.stringify(itemsData);

    checkDateOverlap();
}

function refreshAdminInventoryDisplay() {
    updateItemDropdown();
    checkDateOverlap();
}

function checkDateOverlap() {
    const tarikhMula = document.getElementById('tarikh-mula').value;
    const tarikhPulang = document.getElementById('tarikh-pulang').value;
    const jenisPermohonan = document.getElementById('jenis-permohonan-hidden')?.value || '';
    const selections = jenisPermohonan.split(', ').filter(v => v);

    const errorDiv = document.getElementById('date-overlap-error');
    const errorMessage = document.getElementById('date-overlap-message');

    if (!tarikhMula || !tarikhPulang || selections.length === 0) {
        errorDiv.classList.add('hidden');
        return;
    }

    const startDate = new Date(tarikhMula);
    const endDate = new Date(tarikhPulang);

    const hasDewan = selections.includes('Dewan');
    const hasPeralatan = selections.includes('Peralatan');

    let hasConflict = false;
    let conflictMessages = [];

    if (hasDewan) {
        const dewanPermohonan = allData.filter(d =>
            d.type === 'permohonan' && d.jenisPermohonan && d.jenisPermohonan.includes('Dewan')
        );

        for (const permohonan of dewanPermohonan) {
            if (permohonan.status === 'Ditolak' || permohonan.status === 'Selesai') continue;

            const existingStart = new Date(permohonan.tarikhMulaPinjam);
            const existingEnd = new Date(permohonan.tarikhPulang);

            const existingEndMidnight = new Date(existingEnd);
            existingEndMidnight.setDate(existingEndMidnight.getDate() + 1);
            existingEndMidnight.setHours(0, 0, 0, 0);

            if (startDate < existingEndMidnight && endDate > existingStart) {
                hasConflict = true;
                conflictMessages.push(`Dewan telah ditempah pada ${formatDate(permohonan.tarikhMulaPinjam)} - ${formatDate(permohonan.tarikhPulang)}. Sila pilih tarikh lain.`);
                break;
            }
        }
    }

    if (hasPeralatan && !hasConflict) {
        const selectedItemsData = document.getElementById('items-data-hidden').value;
        if (selectedItemsData) {
            try {
                const itemsData = JSON.parse(selectedItemsData);
                for (const item of itemsData) {
                    const availableDuringPeriod = getAvailableStock(item.id, startDate, endDate);
                    if (item.qty > availableDuringPeriod) {
                        hasConflict = true;
                        const p = allData.find(d => d.__backendId === item.id);
                        const total = p ? (p.kuantiti || 0) : 0;
                        conflictMessages.push(`⚠️ ${item.name} tidak mencukupi pada tarikh tersebut. Baki: ${availableDuringPeriod}/${total} unit. Sila pilih tarikh lain.`);
                    }
                }
            } catch (e) {
                console.error('Error checking peralatan conflict:', e);
            }
        }
    }

    if (hasConflict) {
        errorMessage.innerHTML = conflictMessages.join('<br>');
        errorDiv.classList.remove('hidden');
    } else {
        errorDiv.classList.add('hidden');
    }
}

function checkUserDateOverlap() {
    const tarikhMula = document.getElementById('user-tarikh-mula').value;
    const tarikhPulang = document.getElementById('user-tarikh-pulang').value;
    const jenisPermohonan = document.getElementById('user-jenis-permohonan-hidden')?.value || '';
    const selections = jenisPermohonan.split(', ').filter(v => v);

    const errorDiv = document.getElementById('user-date-overlap-error');
    const errorMessage = document.getElementById('user-date-overlap-message');
    const submitBtn = document.getElementById('btn-submit-user-permohonan');
    const floatingReminder = document.getElementById('user-floating-reminder');
    const ticks = ['user-terma-dewan-tick', 'user-terma-peralatan-tick', 'user-terma-syarat-tick'];

    if (selections.includes('Peralatan')) {
        updateUserItemDropdown();
    }

    if (!tarikhMula || !tarikhPulang || selections.length === 0) {
        errorDiv?.classList.add('hidden');
        floatingReminder?.classList.add('hidden');
        const submitSection = document.getElementById('user-submit-section');
        if (submitSection) submitSection.classList.add('hidden');

        ticks.forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                el.disabled = false;
                el.parentElement.style.opacity = '1';
                el.parentElement.style.cursor = 'pointer';
            }
        });
        if (submitBtn) submitBtn.disabled = false;
        return;
    }

    const startDate = new Date(tarikhMula);
    const endDate = new Date(tarikhPulang);

    if (startDate >= endDate) {
        errorMessage.innerHTML = '⚠️ Tarikh mula mestilah sebelum tarikh tamat.';
        errorDiv.classList.remove('hidden');
        if (submitBtn) submitBtn.disabled = true;
        if (floatingReminder) floatingReminder.classList.remove('hidden');
        const submitSection = document.getElementById('user-submit-section');
        if (submitSection) submitSection.classList.add('hidden');

        ticks.forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                el.disabled = true;
                el.checked = false;
                el.parentElement.style.opacity = '0.5';
                el.parentElement.style.cursor = 'not-allowed';
            }
        });
        checkUserTerms();
        return;
    }

    let hasConflict = false;
    let conflictMessages = [];

    if (selections.includes('Dewan')) {
        const matchingPermohonan = allData.filter(d =>
            d.type === 'permohonan' &&
            d.jenisPermohonan &&
            d.jenisPermohonan.includes('Dewan') &&
            (d.status === 'Dalam Proses' || d.status === 'Diluluskan' || d.status === 'Selesai')
        );

        for (const p of matchingPermohonan) {
            const existingStart = new Date(p.tarikhMulaPinjam);
            const existingEnd = new Date(p.tarikhPulang);

            // Block until END of return day PLUS one more day as buffer
            const blockStart = new Date(existingStart);
            blockStart.setHours(0, 0, 0, 0);

            const blockEnd = new Date(existingEnd);
            blockEnd.setHours(23, 59, 59, 999);

            if (startDate <= blockEnd && endDate >= blockStart) {
                hasConflict = true;
                conflictMessages.push(`Dewan ini ditempah bermula ${existingStart.getDate()}/${existingStart.getMonth() + 1} sehingga ${existingEnd.getDate()}/${existingEnd.getMonth() + 1}, sila pilih tarikh seterusnya.`);
                break;
            }
        }
    }

    const itemsDataStr = document.getElementById('user-items-data-hidden').value;
    if (selections.includes('Peralatan') && itemsDataStr) {
        try {
            const selectedItems = JSON.parse(itemsDataStr);
            for (const item of selectedItems) {
                const totalStock = allData.find(d => d.type === 'peralatan' && d.__backendId === item.id)?.kuantiti || 0;

                let unitsInUse = 0;
                const relevantRequests = allData.filter(d =>
                    d.type === 'permohonan' &&
                    (d.status === 'Dalam Proses' || d.status === 'Diluluskan') &&
                    d.itemsData
                );

                for (const req of relevantRequests) {
                    const reqStart = new Date(req.tarikhMulaPinjam);
                    const reqEnd = new Date(req.tarikhPulang);

                    const reqEndMidnight = new Date(reqEnd);
                    reqEndMidnight.setDate(reqEndMidnight.getDate() + 1);
                    reqEndMidnight.setHours(0, 0, 0, 0);

                    if (startDate < reqEndMidnight && endDate > reqStart) {
                        const reqItems = JSON.parse(req.itemsData);
                        const match = reqItems.find(i => i.id === item.id);
                        if (match) unitsInUse += match.qty;
                    }
                }

                if (item.qty > (totalStock - unitsInUse)) {
                    hasConflict = true;
                    conflictMessages.push(`📦 <strong>${item.name}</strong> tidak mencukupi untuk tempoh ini. (Baki tersedia: ${totalStock - unitsInUse})`);
                }
            }
        } catch (e) { console.error(e); }
    }

    const qtyErrors = document.querySelectorAll('[id^="user-qty-error-"]:not(.hidden)');
    if (qtyErrors.length > 0) hasConflict = true;

    if (hasConflict) {
        errorMessage.innerHTML = conflictMessages.join('<br>');
        errorDiv.classList.remove('hidden');
        if (submitBtn) submitBtn.disabled = true;
        if (floatingReminder) floatingReminder.classList.remove('hidden');
        const submitSection = document.getElementById('user-submit-section');
        if (submitSection) submitSection.classList.add('hidden');

        ticks.forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                el.disabled = true;
                el.checked = false;
                el.parentElement.style.opacity = '0.5';
                el.parentElement.style.cursor = 'not-allowed';
            }
        });
        checkUserTerms();
    } else {
        errorDiv.classList.add('hidden');
        if (submitBtn) submitBtn.disabled = false;
        if (floatingReminder) floatingReminder.classList.add('hidden');

        ticks.forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                el.disabled = false;
                el.parentElement.style.opacity = '1';
                el.parentElement.style.cursor = 'pointer';
            }
        });
    }
}


function updateKategoriDropdown() {
    const select = document.getElementById('kategori-peralatan');

    if (!select) {
        console.warn('⚠️ updateKategoriDropdown: Element #kategori-peralatan not found');
        return;
    }

    const kategori = getKategori();

    select.innerHTML = '<option value="">Pilih Kategori</option>' +
        kategori.map(k => `<option value="${k.__backendId}">${k.namaKategori || k.nama || 'Tiada Nama'}</option>`).join('');
}

function updateUserItemDropdown() {
    const container = document.getElementById('user-item-dipinjam-container');
    if (!container) return;

    const checkedItems = {};
    container.querySelectorAll('input.user-item-checkbox:checked').forEach(cb => {
        const id = cb.dataset.id;
        const qtyVal = document.getElementById(`user-qty-${id}`)?.value || "1";
        checkedItems[id] = qtyVal;
    });

    const peralatan = getPeralatan();
    const kategori = getKategori();
    const tarikhMula = document.getElementById('user-tarikh-mula').value;
    const tarikhPulang = document.getElementById('user-tarikh-pulang').value;

    if (peralatan.length === 0) {
        container.innerHTML = '<p class="text-slate-400 text-sm text-center py-8">Tiada peralatan tersedia</p>';
        return;
    }

    container.innerHTML = peralatan.map(p => {
        const kat = kategori.find(k => k.__backendId === p.kategori);
        const available = getAvailableStock(p.__backendId, tarikhMula, tarikhPulang);
        const totalStock = p.kuantiti || 0;
        const wasChecked = checkedItems[p.__backendId] !== undefined;
        const isAvailable = available > 0 || wasChecked;
        const statusColor = isAvailable ? 'text-green-600' : 'text-red-600';

        return `
    <div class="border-2 border-slate-200 rounded-xl p-4 bg-white hover:border-purple-300 transition-colors ${!isAvailable ? 'opacity-60 bg-slate-50' : ''}">
            <label class="flex items-center gap-3 ${isAvailable ? 'cursor-pointer' : 'cursor-not-allowed'}">
              <input type="checkbox" value="${p.namaPeralatan}" data-id="${p.__backendId}" 
                onchange="toggleUserQtyInput('${p.__backendId}')" 
                class="user-item-checkbox w-5 h-5 text-purple-600 border-slate-300 rounded focus:ring-2 focus:ring-purple-500" 
                ${!isAvailable ? 'disabled' : ''} ${wasChecked ? 'checked' : ''}>
              <div class="flex-1">
                <span class="text-slate-800 font-semibold">${p.namaPeralatan}</span>
                <span class="text-slate-500 text-sm ml-2">(${kat ? kat.namaKategori || kat.nama : '-'})</span>
                <span class="block text-xs ${statusColor} font-bold mt-1">
                    ${available > 0 ? `Baki Tersedia: ${available}/${totalStock} unit` : 'Tiada Stok Tersedia'}
                </span>
              </div>
            </label>
            <div id="user-qty-input-${p.__backendId}" class="${wasChecked ? '' : 'hidden'} mt-3 pl-8">
                <label class="block text-xs font-medium text-slate-700 mb-1">Kuantiti Dipinjam (Maks: ${available + (wasChecked ? parseInt(checkedItems[p.__backendId]) : 0)})</label>
                <input type="number" id="user-qty-${p.__backendId}" min="1" max="${available + (wasChecked ? parseInt(checkedItems[p.__backendId]) : 0)}" 
                    value="${wasChecked ? checkedItems[p.__backendId] : 1}" 
                    oninput="validateUserQty('${p.__backendId}', ${available + (wasChecked ? parseInt(checkedItems[p.__backendId]) : 0)})" 
                    class="w-full px-3 py-2 border-2 border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500">
                <p id="user-qty-error-${p.__backendId}" class="hidden text-[10px] text-red-600 mt-1 font-bold animate-pulse">
                    ⚠️ Kuantiti melebihi baki stok yang tersedia!
                </p>
            </div>
          </div>
    `;
    }).join('');
}

function toggleUserQtyInput(id) {
    const cb = document.querySelector(`.user-item-checkbox[data-id="${id}"]`);
    const inputDiv = document.getElementById(`user-qty-input-${id}`);
    if (cb.checked) {
        inputDiv.classList.remove('hidden');
    } else {
        inputDiv.classList.add('hidden');
    }
    updateUserSelectedItems();
}

function validateUserQty(id, max) {
    const input = document.getElementById(`user-qty-${id}`);
    const error = document.getElementById(`user-qty-error-${id}`);
    let val = parseInt(input.value) || 0;

    if (val > max) {
        input.value = max;
        input.classList.add('border-red-500', 'bg-red-50', 'text-red-900');
        input.classList.remove('border-slate-200', 'bg-white');
        error.classList.remove('hidden');
    } else if (val < 1 && input.value !== "") {
        input.value = 1;
        input.classList.remove('border-red-500', 'bg-red-50', 'text-red-900');
        input.classList.add('border-slate-200', 'bg-white');
        error.classList.add('hidden');
    } else {
        input.classList.remove('border-red-500', 'bg-red-50', 'text-red-900');
        input.classList.add('border-slate-200', 'bg-white');
        error.classList.add('hidden');
    }
    updateUserSelectedItems();
}

function closeUserForm() {
    const urlParams = new URLSearchParams(window.location.search);
    const isUserMode = urlParams.get('user') === 'true' || window.location.hash.includes('user=true');

    if (isUserMode) {
        window.close();
        setTimeout(() => {
            alert("Sila tutup tab ini secara manual.");
        }, 100);
    } else {
        closeModal('modal-user-form');
        setTimeout(() => {
            document.getElementById('form-user-permohonan').classList.remove('hidden');
            document.getElementById('user-success-container').classList.add('hidden');
        }, 500);
    }
}

function resetUserFormForNew() {
    document.getElementById('user-success-container').classList.add('hidden');
    document.getElementById('form-user-permohonan').classList.remove('hidden');

    document.getElementById('form-user-permohonan').reset();
    document.querySelectorAll('.user-jenis-btn').forEach(b => {
        b.classList.remove('border-purple-600', 'bg-purple-50');
        b.classList.add('border-slate-200');
    });
    toggleUserPermohonanFields();
    updateUserItemDropdown();
}

function selectUserJenisPermohonan(value, button) {
    const isActive = button.classList.contains('border-purple-600');

    if (isActive) {
        button.classList.remove('border-purple-600', 'bg-purple-50');
        button.classList.add('border-slate-200');
    } else {
        button.classList.remove('border-slate-200');
        button.classList.add('border-purple-600', 'bg-purple-50');
    }

    const selectedButtons = document.querySelectorAll('.user-jenis-btn.border-purple-600');
    const selectedValues = Array.from(selectedButtons).map(btn => {
        const titleEl = btn.querySelector('p.font-semibold');
        return titleEl ? titleEl.textContent.trim() : btn.textContent.trim();
    });

    document.getElementById('user-jenis-permohonan-hidden').value = selectedValues.join(', ');

    toggleUserPermohonanFields();
}

function toggleUserPermohonanFields() {
    const selectedValues = document.getElementById('user-jenis-permohonan-hidden')?.value || '';
    const selections = selectedValues.split(', ').filter(v => v);

    const fieldSenariItem = document.getElementById('user-field-senarai-item');

    const hasPeralatan = selections.includes('Peralatan');
    const hasDewan = selections.includes('Dewan');

    if (hasPeralatan) {
        fieldSenariItem.classList.remove('hidden');
        document.getElementById('user-item-dipinjam-hidden').setAttribute('required', 'required');
    } else {
        fieldSenariItem.classList.add('hidden');
        document.getElementById('user-item-dipinjam-hidden').removeAttribute('required');
        document.querySelectorAll('.user-item-checkbox').forEach(cb => cb.checked = false);
        document.getElementById('user-item-dipinjam-hidden').value = '';
        document.getElementById('user-items-data-hidden').value = '';
    }

    const termaDewan = document.getElementById('user-terma-dewan');
    const termaPeralatan = document.getElementById('user-terma-peralatan');

    if (hasDewan) {
        termaDewan.classList.remove('hidden');
    } else {
        termaDewan.classList.add('hidden');
        document.getElementById('user-terma-dewan-tick').checked = false;
    }

    if (hasPeralatan) {
        termaPeralatan.classList.remove('hidden');
    } else {
        termaPeralatan.classList.add('hidden');
        document.getElementById('user-terma-peralatan-tick').checked = false;
    }

    let sectionNumber = 3;
    if (hasPeralatan) {
        sectionNumber = 4;
    }

    const tarikhSection = document.getElementById('tarikh-section-number');
    const tujuanSection = document.getElementById('tujuan-section-number');
    const termaSection = document.getElementById('terma-section-number');

    if (tarikhSection) tarikhSection.textContent = sectionNumber;
    if (tujuanSection) tujuanSection.textContent = sectionNumber + 1;
    if (termaSection) termaSection.textContent = sectionNumber + 2;

    const availGuide = document.getElementById('user-availability-guide');
    if (hasDewan) {
        availGuide?.classList.remove('hidden');
        renderUserAvailabilityCalendar();
    } else {
        availGuide?.classList.add('hidden');
    }

    checkUserDateOverlap();
    checkUserTerms();
}

function renderUserAvailabilityCalendar() {
    const container = document.getElementById('availability-calendar-container');
    if (!container) return;

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const firstDay = new Date(currentYear, currentMonth, 1).getDay();

    const dewanPermohonan = allData.filter(d =>
        d.type === 'permohonan' &&
        d.jenisPermohonan?.includes('Dewan') &&
        (d.status === 'Dalam Proses' || d.status === 'Diluluskan' || d.status === 'Selesai')
    );

    const monthNames = ["Januari", "Februari", "Mac", "April", "Mei", "Jun", "Julai", "Ogos", "September", "Oktober", "November", "Disember"];

    let html = `<div class="col-span-7 text-center font-black text-slate-700 mb-2 py-1 border-b border-slate-200">${monthNames[currentMonth]} ${currentYear}</div>`;
    const dayNames = ['Aha', 'Isn', 'Sel', 'Rab', 'Kha', 'Jum', 'Sab'];
    dayNames.forEach(d => {
        html += `<div class="text-center font-bold text-slate-400 py-1">${d}</div>`;
    });

    for (let i = 0; i < firstDay; i++) {
        html += `<div class="cal-empty"></div>`;
    }

    for (let d = 1; d <= daysInMonth; d++) {
        const checkDate = new Date(currentYear, currentMonth, d);
        checkDate.setHours(12, 0, 0, 0);

        let statusClass = 'cal-day-available'; // Default Green

        // Priority: Blocked (Red) > Pending (Blue)
        let isBlocked = false;
        let isPending = false;

        for (const p of dewanPermohonan) {
            const start = new Date(p.tarikhMulaPinjam);
            const end = new Date(p.tarikhPulang);
            const bStart = new Date(start); bStart.setHours(0, 0, 0, 0);
            const bEnd = new Date(end); bEnd.setHours(23, 59, 59, 999);

            if (checkDate >= bStart && checkDate <= bEnd) {
                if (p.status === 'Diluluskan' || p.status === 'Selesai') {
                    isBlocked = true;
                    break;
                } else if (p.status === 'Dalam Proses') {
                    isPending = true;
                }
            }
        }

        if (isBlocked) statusClass = 'cal-day-blocked';
        else if (isPending) statusClass = 'cal-day-pending';

        html += `<div class="cal-day ${statusClass}">${d}</div>`;
    }

    container.innerHTML = html;
}

function checkUserTerms() {
    const jenisPermohonan = document.getElementById('user-jenis-permohonan-hidden')?.value || '';
    const selections = jenisPermohonan.split(', ').filter(v => v);

    const hasDewan = selections.includes('Dewan');
    const hasPeralatan = selections.includes('Peralatan');

    const overlapError = document.getElementById('user-date-overlap-error');
    if (overlapError && !overlapError.classList.contains('hidden')) {
        const submitSection = document.getElementById('user-submit-section');
        if (submitSection) submitSection.classList.add('hidden');

        ['user-terma-dewan-tick', 'user-terma-peralatan-tick', 'user-terma-syarat-tick'].forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                el.disabled = true;
                el.checked = false;
                el.parentElement.style.opacity = '0.5';
                el.parentElement.style.cursor = 'not-allowed';
            }
        });
        return;
    }

    let allChecked = true;

    if (hasDewan) {
        const dewanTick = document.getElementById('user-terma-dewan-tick');
        if (!dewanTick || !dewanTick.checked) {
            allChecked = false;
        }
    }

    if (hasPeralatan) {
        const peralatanTick = document.getElementById('user-terma-peralatan-tick');
        if (!peralatanTick || !peralatanTick.checked) {
            allChecked = false;
        }
    }

    const syaratTick = document.getElementById('user-terma-syarat-tick');
    if (!syaratTick || !syaratTick.checked) {
        allChecked = false;
    }

    const submitSection = document.getElementById('user-submit-section');
    const warningDiv = document.getElementById('user-terma-warning');

    if (allChecked && selections.length > 0) {
        submitSection.classList.remove('hidden');
        warningDiv.classList.add('hidden');
    } else {
        submitSection.classList.add('hidden');
        if (selections.length > 0) {
            warningDiv.classList.remove('hidden');
        } else {
            warningDiv.classList.add('hidden');
        }
    }
}

function updateUserSelectedItems() {
    const checkboxes = document.querySelectorAll('.user-item-checkbox:checked');
    const selectedItems = [];
    const itemsData = [];

    checkboxes.forEach(cb => {
        const id = cb.dataset.id;
        const name = cb.value;
        const qtyInput = document.getElementById(`user-qty-${id}`);
        const qty = qtyInput ? parseInt(qtyInput.value) || 1 : 1;

        selectedItems.push(`${name} (${qty} unit)`);
        itemsData.push({ id, name, qty });
    });

    document.getElementById('user-item-dipinjam-hidden').value = selectedItems.join(', ');
    document.getElementById('user-items-data-hidden').value = JSON.stringify(itemsData);

    checkUserDateOverlap();
}

function refreshUserInventoryDisplay() {
    updateUserItemDropdown();
    checkUserDateOverlap();
}

function checkUserDateOverlap() {
    const tarikhMula = document.getElementById('user-tarikh-mula').value;
    const tarikhPulang = document.getElementById('user-tarikh-pulang').value;
    const jenisPermohonan = document.getElementById('user-jenis-permohonan-hidden')?.value || '';
    const selections = jenisPermohonan.split(', ').filter(v => v);

    const errorDiv = document.getElementById('user-date-overlap-error');
    const errorMessage = document.getElementById('user-date-overlap-message');

    if (!tarikhMula || !tarikhPulang || selections.length === 0) {
        errorDiv.classList.add('hidden');
        return;
    }

    const startDate = new Date(tarikhMula);
    const endDate = new Date(tarikhPulang);

    const hasDewan = selections.includes('Dewan');
    const hasPeralatan = selections.includes('Peralatan');

    let hasConflict = false;
    let conflictMessages = [];

    if (hasDewan) {
        const dewanPermohonan = allData.filter(d =>
            d.type === 'permohonan' && d.jenisPermohonan && d.jenisPermohonan.includes('Dewan')
        );

        for (const permohonan of dewanPermohonan) {
            if (permohonan.status === 'Ditolak' || permohonan.status === 'Selesai') continue;

            const existingStart = new Date(permohonan.tarikhMulaPinjam);
            const existingEnd = new Date(permohonan.tarikhPulang);

            if (startDate < existingEnd && endDate > existingStart) {
                hasConflict = true;
                conflictMessages.push(`ðŸ›ï¸ Dewan telah ditempah pada ${formatDate(permohonan.tarikhMulaPinjam)} - ${formatDate(permohonan.tarikhPulang)}. Sila pilih tarikh lain.`);
                break;
            }
        }
    }

    if (hasPeralatan && !hasConflict) {
        const selectedItemsData = document.getElementById('user-items-data-hidden').value;
        if (selectedItemsData) {
            const itemsData = JSON.parse(selectedItemsData);

            for (const item of itemsData) {
                const peralatan = allData.find(d => d.__backendId === item.id);
                if (!peralatan) continue;

                let unitsInUse = 0;

                const peralatanPermohonan = allData.filter(d =>
                    d.type === 'permohonan' &&
                    d.itemsData &&
                    (d.status === 'Dalam Proses' || d.status === 'Diluluskan')
                );

                for (const permohonan of peralatanPermohonan) {
                    const existingStart = new Date(permohonan.tarikhMulaPinjam);
                    const existingEnd = new Date(permohonan.tarikhPulang);

                    if (startDate < existingEnd && endDate > existingStart) {
                        const permohonanItems = JSON.parse(permohonan.itemsData);
                        const usedItem = permohonanItems.find(i => i.id === item.id);
                        if (usedItem) {
                            unitsInUse += usedItem.qty;
                        }
                    }
                }

                const totalAvailable = peralatan.kuantiti || 0;
                const availableDuringPeriod = totalAvailable - unitsInUse;

                if (item.qty > availableDuringPeriod) {
                    hasConflict = true;
                    conflictMessages.push(`⚠️ ${item.name} tidak mencukupi pada tarikh tersebut. Tersedia: ${availableDuringPeriod} unit. Sila pilih tarikh lain.`);
                }
            }
        }
    }

    if (hasConflict) {
        errorMessage.innerHTML = conflictMessages.join('<br><br>');
        errorDiv.classList.remove('hidden');
    } else {
        errorDiv.classList.add('hidden');
    }
}

function showSharelinkInfo() {
    console.log('🔗 showSharelinkInfo called');
    const currentURL = window.location.origin + window.location.pathname;
    const sharelinkURL = `${currentURL}?user=true`;
    console.log('🔗 Generated Link:', sharelinkURL);

    const input = document.getElementById('sharelink-url');
    if (input) {
        input.value = sharelinkURL;
    } else {
        console.error('❌ Element #sharelink-url not found');
    }

    console.log('🔗 Opening modal-sharelink');
    openModal('modal-sharelink');
}

function copySharelink() {
    const input = document.getElementById('sharelink-url');
    input.select();
    input.setSelectionRange(0, 99999);

    try {
        navigator.clipboard.writeText(input.value).then(() => {
            showToast('Link berjaya disalin!');
        }).catch(() => {
            document.execCommand('copy');
            showToast('Link berjaya disalin!');
        });
    } catch (err) {
        showToast('Gagal menyalin link');
    }
}


function selectJenisPermohonan(value, button) {
    const isActive = button.classList.contains('border-indigo-600');

    if (isActive) {
        button.classList.remove('border-indigo-600', 'bg-indigo-50');
        button.classList.add('border-slate-200');
    } else {
        button.classList.remove('border-slate-200');
        button.classList.add('border-indigo-600', 'bg-indigo-50');
    }

    const selectedButtons = document.querySelectorAll('.jenis-btn.border-indigo-600');
    const selectedValues = Array.from(selectedButtons).map(btn => {
        const span = btn.querySelector('span');
        return span ? span.textContent.trim() : btn.textContent.trim();
    });

    document.getElementById('jenis-permohonan-hidden').value = selectedValues.join(', ');

    togglePermohonanFields();
}

function togglePermohonanFields() {
    const selectedValues = document.getElementById('jenis-permohonan-hidden')?.value || '';
    const selections = selectedValues.split(', ').filter(v => v);

    const fieldSenariItem = document.getElementById('field-senarai-item');
    const hasPeralatan = selections.includes('Peralatan');
    const hasDewan = selections.includes('Dewan');

    if (hasPeralatan && fieldSenariItem) {
        fieldSenariItem.classList.remove('hidden');
    } else if (fieldSenariItem) {
        fieldSenariItem.classList.add('hidden');
    }

    const termaDewan = document.getElementById('admin-terma-dewan');
    const termaPeralatan = document.getElementById('admin-terma-peralatan');

    if (termaDewan) {
        if (hasDewan) {
            termaDewan.classList.remove('hidden');
        } else {
            termaDewan.classList.add('hidden');
            const tick = document.getElementById('admin-terma-dewan-tick');
            if (tick) tick.checked = false;
        }
    }

    if (termaPeralatan) {
        if (hasPeralatan) {
            termaPeralatan.classList.remove('hidden');
        } else {
            termaPeralatan.classList.add('hidden');
            const tick = document.getElementById('admin-terma-peralatan-tick');
            if (tick) tick.checked = false;
        }
    }

    if (typeof checkAdminTerms === 'function') checkAdminTerms();
    if (typeof checkDateOverlap === 'function') checkDateOverlap();
}

function checkAdminTerms() {
    const jenisPermohonan = document.getElementById('jenis-permohonan-hidden')?.value || '';
    const selections = jenisPermohonan.split(', ').filter(v => v);

    const hasDewan = selections.includes('Dewan');
    const hasPeralatan = selections.includes('Peralatan');

    let allChecked = true;

    if (hasDewan) {
        const dewanTick = document.getElementById('admin-terma-dewan-tick');
        if (!dewanTick.checked) {
            allChecked = false;
        }
    }

    if (hasPeralatan) {
        const peralatanTick = document.getElementById('admin-terma-peralatan-tick');
        if (!peralatanTick.checked) {
            allChecked = false;
        }
    }

    const syaratTick = document.getElementById('admin-terma-syarat-tick');
    if (!syaratTick.checked) {
        allChecked = false;
    }

    const submitBtn = document.getElementById('btn-submit-permohonan');
    const warningDiv = document.getElementById('admin-terma-warning');

    if (allChecked && selections.length > 0) {
        submitBtn.disabled = false;
        submitBtn.classList.remove('opacity-50', 'cursor-not-allowed');
        warningDiv.classList.add('hidden');
    } else {
        submitBtn.disabled = true;
        submitBtn.classList.add('opacity-50', 'cursor-not-allowed');
        if (selections.length > 0) {
            warningDiv.classList.remove('hidden');
        } else {
            warningDiv.classList.add('hidden');
        }
    }
}

function openTindakan(id) {
    const permohonan = allData.find(d => String(d.__backendId) === String(id));
    if (!permohonan) {
        showToast('Data tidak dijumpai');
        return;
    }

    document.getElementById('tindakan-id').value = id;
    document.getElementById('detail-nama').textContent = permohonan.nama;
    document.getElementById('detail-email').textContent = permohonan.email;
    document.getElementById('detail-telefon').textContent = permohonan.nomorTelefon;
    document.getElementById('detail-cawangan').textContent = permohonan.cawangan;
    document.getElementById('detail-jenis').textContent = permohonan.jenisPermohonan;
    document.getElementById('detail-items').textContent = permohonan.items;

    document.getElementById('detail-tarikh-mula').textContent = formatDate(permohonan.tarikhMulaPinjam);
    document.getElementById('detail-tarikh-tamat').textContent = formatDate(permohonan.tarikhPulang);

    document.getElementById('detail-tujuan').textContent = permohonan.tujuan;

    document.getElementById('status-permohonan').value = permohonan.status || 'Dalam Proses';
    document.getElementById('catatan-admin').value = permohonan.catatan || '';

    const formatForInput = (isoDate) => {
        if (!isoDate) return '';
        const d = new Date(isoDate);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        const hours = String(d.getHours()).padStart(2, '0');
        const minutes = String(d.getMinutes()).padStart(2, '0');
        return `${year}-${month}-${day}T${hours}:${minutes}`;
    };

    document.getElementById('edit-tarikh-mula').value = formatForInput(permohonan.tarikhMulaPinjam);
    document.getElementById('edit-tarikh-tamat').value = formatForInput(permohonan.tarikhPulang);

    document.getElementById('tarikh-selesai').value = permohonan.tarikhSelesai ? formatDate(permohonan.tarikhSelesai) : '';

    const btnSelesai = document.getElementById('btn-mark-selesai');
    if (permohonan.status === 'Selesai' || permohonan.statusSelesai === true) {
        btnSelesai.classList.add('hidden');
    } else {
        btnSelesai.classList.remove('hidden');
    }

    const jenisNormalized = (permohonan.jenisPermohonan || '').trim().toLowerCase();
    // console.log('🔍 openTindakan - Jenis Permohonan:', permohonan.jenisPermohonan, '| Normalized:', jenisNormalized);

    document.getElementById('toggle-edit-dates').checked = false;
    document.getElementById('date-edit-section').classList.add('hidden');

    if (jenisNormalized.includes('peralatan')) {
        // console.log('✅ Showing items edit section (contains Peralatan)');
        document.getElementById('items-edit-section').classList.remove('hidden');
        document.getElementById('toggle-edit-items').checked = false;
        document.getElementById('items-edit-container-wrapper').classList.add('hidden');
        populateItemsEditContainer(permohonan);
    } else {
        // console.log('❌ Hiding items edit section (does not contain Peralatan)');
        document.getElementById('items-edit-section').classList.add('hidden');
    }

    openModal('modal-tindakan');
}

function populateItemsEditContainer(permohonan) {
    const container = document.getElementById('items-edit-container');
    const peralatan = getPeralatan();

    if (peralatan.length === 0) {
        container.innerHTML = '<p class="text-slate-400 text-sm text-center py-4">Tiada peralatan tersedia</p>';
        return;
    }

    let selectedItems = [];
    if (permohonan.itemsData) {
        try {
            selectedItems = JSON.parse(permohonan.itemsData);
        } catch (e) {
            selectedItems = [];
        }
    }

    container.innerHTML = peralatan.map((p, idx) => {
        const selected = selectedItems.find(item => String(item.id) === String(p.__backendId));
        const qty = selected ? (parseInt(selected.qty) || 0) : 0;

        const bakiTersedia = getAvailableStock(p.__backendId, permohonan.tarikhMulaPinjam, permohonan.tarikhPulang, permohonan.__backendId);
        const isAvailable = bakiTersedia > 0;

        return `
    <div class="border border-slate-300 rounded-lg p-4 bg-white hover:bg-slate-50 transition-colors">
        <div class="flex items-start gap-4">
            <div class="flex items-center pt-1">
                <input type="checkbox" id="item-tindakan-${p.__backendId}" class="item-tindakan-checkbox w-5 h-5 cursor-pointer"
                    data-name="${p.namaPeralatan}" ${selected ? 'checked' : ''}>
            </div>
            <div class="flex-1 min-w-0">
                <label for="item-tindakan-${p.__backendId}" class="cursor-pointer block">
                    <p class="font-bold text-slate-800 text-base">${idx + 1}. ${p.namaPeralatan}</p>
                    <p class="text-xs ${isAvailable ? 'text-green-600' : 'text-red-600'} font-semibold mt-1">Baki Stok (Luar Permohonan Ini): ${bakiTersedia} unit</p>
                </label>
            </div>
            <div class="flex items-center gap-2 flex-shrink-0">
                <input type="number" id="qty-tindakan-${p.__backendId}" min="1" value="${selected ? qty : 1}"
                    class="item-tindakan-qty w-20 px-3 py-2 border border-slate-300 rounded-lg text-center text-sm font-medium" ${selected ? '' : 'disabled'}>
                    <span class="text-sm text-slate-600 font-medium min-w-[40px]">unit</span>
            </div>
        </div>
    </div>
    `;
    }).join('');

    document.querySelectorAll('.item-tindakan-checkbox').forEach(checkbox => {
        checkbox.addEventListener('change', function () {
            const id = this.id.replace('item-tindakan-', '');
            const qtyInput = document.getElementById(`qty-tindakan-${id}`);
            if (qtyInput) {
                qtyInput.disabled = !this.checked;
            }
        });
    });
}

function collectTindakanItems() {
    const selected = [];
    document.querySelectorAll('.item-tindakan-checkbox:checked').forEach(checkbox => {
        const id = checkbox.id.replace('item-tindakan-', '');
        const name = checkbox.dataset.name;
        const qtyInput = document.getElementById(`qty-tindakan-${id}`);
        const qty = qtyInput ? (parseInt(qtyInput.value) || 1) : 1;
        selected.push({ id, name, qty });
    });
    return selected;
}

function markAsCompleted() {
    const id = document.getElementById('tindakan-id').value;
    const data = allData.find(d => String(d.__backendId) === String(id));

    if (!data) {
        showToast('❌ Data tidak dijumpai');
        return;
    }

    if (!data.statusSelesai) {
        data.statusSelesai = true;
        data.tarikhSelesai = new Date().toISOString();
        data.status = 'Selesai';
        DataStore.save(allData);
        showToast('✅ Tarikh selesai telah direkodkan!');
    } else {
        showToast('⚠️ Tarikh selesai sudah direkodkan sebelumnya');
    }

    document.getElementById('tarikh-selesai').value = formatDate(data.tarikhSelesai);
    document.getElementById('status-permohonan').value = 'Selesai';
}

function quickMarkCompleted(id) {
    const data = allData.find(d => String(d.__backendId) === String(id));

    if (!data) {
        showToast('❌ Data tidak dijumpai');
        return;
    }

    if (!data.statusSelesai) {
        data.statusSelesai = true;
        data.tarikhSelesai = new Date().toISOString();
        data.status = 'Selesai';
        DataStore.save(allData);
        showToast('✅ Permohonan ditandai selesai!');
        renderPermohonan();
        renderLaporanDewanTable(getPermohonan()); // Update laporan
    } else {
        showToast('⚠️ Permohonan sudah ditandai selesai sebelumnya');
    }
}

document.getElementById('form-tindakan').addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('tindakan-id').value;
    const status = document.getElementById('status-permohonan').value;
    const catatan = document.getElementById('catatan-admin').value;

    const newTarikhMula = document.getElementById('edit-tarikh-mula').value;
    const newTarikhTamat = document.getElementById('edit-tarikh-tamat').value;

    const data = allData.find(d => String(d.__backendId) === String(id));
    if (data) {
        const updates = {
            status: status,
            catatan: catatan,
            tarikhMulaPinjam: newTarikhMula ? new Date(newTarikhMula).toISOString() : data.tarikhMulaPinjam,
            tarikhPulang: newTarikhTamat ? new Date(newTarikhTamat).toISOString() : data.tarikhPulang
        };

        // Check if normalized type includes pperalatan
        const typeNormalized = (data.jenisPermohonan || '').toLowerCase();
        if (typeNormalized.includes('peralatan')) {
            const selectedItems = collectTindakanItems();
            // console.log('📦 Updating Admin Items:', selectedItems);

            updates.itemsData = JSON.stringify(selectedItems);
            updates.items = selectedItems.length > 0
                ? selectedItems.map(item => `${item.name} (${item.qty} unit)`).join(', ')
                : 'Tiada item';
        }

        if (status === 'Selesai' && !data.statusSelesai) {
            updates.statusSelesai = true;
            updates.tarikhSelesai = new Date().toISOString();
        }

        // console.log('🚀 Submitting Admin Updates:', updates);
        await DataStore.update(id, updates);

        showToast('✅ Berjaya dikemaskini!');
        closeModal('modal-tindakan');

        updateDashboard();
        renderPermohonan();
        renderLaporan(); // Update reports
    } else {
        showToast('❌ Ralat: Data tidak dijumpai');
    }
});


function openDeleteModal(id, type) {
    document.getElementById('delete-id').value = id;
    document.getElementById('delete-type').value = type;
    openModal('modal-delete');
}



function confirmDelete() {
    const id = document.getElementById('delete-id').value;
    const type = document.getElementById('delete-type').value;
    let deletedItemName = '';

    if (type === 'peralatan') {
        const item = allData.find(d => String(d.__backendId) === String(id));
        if (item) deletedItemName = item.namaPeralatan;
    }

    DataStore.remove(id, type).then(async () => {
        showToast('Item berjaya dipadam');
        closeModal('modal-delete');

        if (type === 'peralatan' && deletedItemName) {
            await DataStore.add({
                type: 'log_stok',
                peralatanId: id,
                namaPeralatan: deletedItemName,
                jenisPerubahan: 'Hapus Item',
                kuantiti: 0,
                catatan: 'Item telah dipadam dari inventori',
                timestamp: new Date().toISOString()
            });
        }

        if (type === 'permohonan') {
            updateDashboard();
            renderPermohonan();
        } else if (type === 'kategori') {
            renderKategori();
            updateKategoriDropdown();
            renderPeralatan(); // Peralatan list might change visuals if cat removed
        } else if (type === 'peralatan') {
            renderPeralatan();
            updateItemDropdown();
            updateUserItemDropdown();
            updateDashboard(); // Stats might change
        }
        renderLaporan();
    });
}



function renderLaporan() {
    try {
        const toolbar = document.getElementById('editor-toolbar');
        if (toolbar && !toolbar.classList.contains('hidden')) {
            console.log('📝 Word Mode active, skipping update.');
            return;
        }

        const startEl = document.getElementById('filter-tarikh-mula');
        const endEl = document.getElementById('filter-tarikh-akhir');
        if (!startEl || !endEl) return;

        if (!startEl.value && !endEl.value) {
            const now = new Date();
            startEl.value = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
            endEl.value = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
        }

        const permohonan = getPermohonan();
        const statusCounts = permohonan.reduce((acc, curr) => {
            acc[curr.status] = (acc[curr.status] || 0) + 1;
            return acc;
        }, {});

        const chartStatusDiv = document.getElementById('chart-status');
        if (chartStatusDiv) {
            if (Object.keys(statusCounts).length === 0) {
                chartStatusDiv.innerHTML = '<p class="text-slate-400 text-center py-8">Tiada data untuk tempoh ini</p>';
            } else {
                chartStatusDiv.innerHTML = Object.entries(statusCounts).map(([status, count]) => `
                    <div class="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 mb-3">
                        <span class="font-bold text-slate-700 text-xs uppercase tracking-wider">${status}</span>
                        <span class="font-black text-indigo-600 text-xl">${count}</span>
                    </div>
                `).join('');
            }
        }

        const itemUsage = {};
        const now = new Date();

        permohonan.forEach(p => {
            const isHandled = ['diluluskan', 'dalam proses'].includes((p.status || '').toLowerCase());
            if (!isHandled) return;

            const updateTime = p.updatedAt || p.createdAt;

            if (p.itemsData) {
                try {
                    const items = typeof p.itemsData === 'string' ? JSON.parse(p.itemsData) : p.itemsData;
                    if (Array.isArray(items)) {
                        items.forEach(item => {
                            const qty = parseInt(item.qty) || 0;
                            if (!itemUsage[item.name]) {
                                itemUsage[item.name] = { qty: 0, latest: null };
                            }
                            itemUsage[item.name].qty += qty;
                            if (!itemUsage[item.name].latest || new Date(updateTime) > new Date(itemUsage[item.name].latest)) {
                                itemUsage[item.name].latest = updateTime;
                            }
                        });
                    }
                } catch (e) { }
            } else if (p.items && p.items !== 'Dewan') {
                if (!itemUsage[p.items]) {
                    itemUsage[p.items] = { qty: 0, latest: null };
                }
                itemUsage[p.items].qty += 1;
                if (!itemUsage[p.items].latest || new Date(updateTime) > new Date(itemUsage[p.items].latest)) {
                    itemUsage[p.items].latest = updateTime;
                }
            }
        });

        const sortedUsage = Object.entries(itemUsage)
            .map(([name, data]) => [name, data.qty])
            .sort((a, b) => b[1] - a[1]);

        const top5Usage = sortedUsage.slice(0, 5);
        const maxUsage = top5Usage.length > 0 ? top5Usage[0][1] : 1;
        const chartPeralatanDiv = document.getElementById('chart-peralatan');

        if (chartPeralatanDiv) {
            if (top5Usage.length === 0) {
                chartPeralatanDiv.innerHTML = '<p class="text-slate-400 text-center py-4 text-xs italic">Tiada penggunaan peralatan</p>';
            } else {
                chartPeralatanDiv.innerHTML = top5Usage.map(([name, count]) => {
                    const perc = Math.max(10, (count / maxUsage) * 100);
                    return `
                        <div class="mb-4">
                            <div class="flex justify-between items-center text-[11px] font-bold mb-1.5">
                                <span class="text-slate-700">${name}</span>
                                <span class="text-indigo-600">${count} Unit Diguna</span>
                            </div>
                            <div class="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                                <div class="bg-indigo-600 h-full rounded-full transition-all duration-1000" style="width: ${perc}%"></div>
                            </div>
                        </div>`
                }).join('');
            }
        }

        const activeStatusEl = document.getElementById('report-active-status');
        const topItemEl = document.getElementById('report-top-item');
        const approvalRateEl = document.getElementById('report-approval-rate');

        if (activeStatusEl) activeStatusEl.textContent = permohonan.length > 10 ? 'Sangat Tinggi' : permohonan.length > 0 ? 'Aktif' : 'Pasif';
        if (topItemEl) topItemEl.textContent = sortedUsage.length > 0 ? sortedUsage[0][0] : '-';
        if (approvalRateEl) {
            const approved = permohonan.filter(p => p.status === 'Diluluskan').length;
            const rate = permohonan.length > 0 ? Math.round((approved / permohonan.length) * 100) : 0;
            approvalRateEl.textContent = `${rate}% `;
        }

        renderLaporanPeralatanTable(itemUsage);
        renderLaporanDewanTable(permohonan);
        renderLogStok();

    } catch (err) {
        console.error('❌ renderLaporan failed:', err);
    }
}

function renderLaporanPeralatanTable(usageData) {
    const tbody = document.getElementById('laporan-peralatan-table');
    if (!tbody) return;

    const peralatan = getPeralatan();
    const kategori = getKategori();

    if (peralatan.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="px-6 py-12 text-center text-slate-400 italic">Tiada data inventori</td></tr>';
        return;
    }

    const seen = new Set();
    const unique = peralatan.filter(p => {
        const key = p.namaPeralatan.toLowerCase().trim();
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
    });

    const thead = tbody.closest('table').querySelector('thead');
    if (thead) {
        thead.innerHTML = `
            <tr class="bg-slate-50">
                <th class="px-4 py-4 text-left text-[9px] font-black text-slate-500 uppercase tracking-widest">Peralatan</th>
                <th class="px-4 py-4 text-left text-[9px] font-black text-slate-500 uppercase tracking-widest">Baru (+)</th>
                <th class="px-4 py-4 text-left text-[9px] font-black text-slate-500 uppercase tracking-widest">Rosak (-)</th>
                <th class="px-4 py-4 text-left text-[9px] font-black text-slate-500 uppercase tracking-widest">Jumlah</th>
                <th class="px-4 py-4 text-left text-[9px] font-black text-slate-500 uppercase tracking-widest">Diguna</th>
                <th class="px-4 py-4 text-left text-[9px] font-black text-slate-500 uppercase tracking-widest">Baki</th>
                <th class="px-4 py-4 text-left text-[9px] font-black text-slate-500 uppercase tracking-widest">Status</th>
            </tr>
        `;
    }

    tbody.innerHTML = unique.map(p => {
        const usageDataForItem = usageData[p.namaPeralatan] || { qty: 0, latest: null };
        const usageCount = usageDataForItem.qty;
        const total = parseInt(p.kuantiti) || 0;
        const baki = Math.max(0, total - usageCount);
        const hasStock = baki > 0;

        const logs = allData.filter(d => d.type === 'log_stok' && String(d.peralatanId) === String(p.__backendId));
        const calcBaru = logs
            .filter(l => ['Tambah Stok', 'Item Baru'].includes(l.jenisPerubahan))
            .reduce((sum, l) => sum + (parseInt(l.kuantiti) || 0), 0);
        const calcRosak = logs
            .filter(l => l.jenisPerubahan === 'Lapor Rosak')
            .reduce((sum, l) => sum + (parseInt(l.kuantiti) || 0), 0);

        const logsBaru = logs.filter(l => ['Tambah Stok', 'Item Baru'].includes(l.jenisPerubahan));
        const logsRosak = logs.filter(l => l.jenisPerubahan === 'Lapor Rosak');
        const latestBaru = logsBaru.length > 0 ? logsBaru.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))[0].timestamp : null;
        const latestRosak = logsRosak.length > 0 ? logsRosak.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))[0].timestamp : null;

        const dateBaru = latestBaru ? `<br><span class="text-[8px] opacity-60">${formatRelativeDate(latestBaru)}</span>` : '';
        const dateRosak = latestRosak ? `<br><span class="text-[8px] opacity-60">${formatRelativeDate(latestRosak)}</span>` : '';
        const dateJumlah = p.lastUpdateJumlah ? `<br><span class="text-[8px] opacity-60">${formatRelativeDate(p.lastUpdateJumlah)}</span>` : '';
        const dateLatestUse = usageDataForItem.latest ? `<br><span class="text-[8px] opacity-60">${formatRelativeDate(usageDataForItem.latest)}</span>` : '';

        return `
            <tr class="hover:bg-slate-50 transition-colors border-b border-slate-100">
                <td class="px-4 py-4" data-label="Peralatan">
                    <p class="font-bold text-slate-800 text-xs">${p.namaPeralatan}</p>
                </td>
                <td class="px-4 py-4 text-left" data-label="Baru (+)">
                    <span><span class="text-green-600 font-bold">${calcBaru}</span>${dateBaru}</span>
                </td>
                <td class="px-4 py-4 text-left" data-label="Rosak (-)">
                    <span><span class="text-red-500 font-bold">${calcRosak}</span>${dateRosak}</span>
                </td>
                <td class="px-4 py-4 text-left" data-label="Jumlah">
                    <span><span class="text-slate-800 font-black">${total}</span>${dateJumlah}</span>
                </td>
                <td class="px-4 py-4 text-left" data-label="Diguna">
                    <span><span class="text-indigo-600 font-bold">${usageCount}</span>${dateLatestUse}</span>
                </td>
                <td class="px-4 py-4 text-left" data-label="Baki">
                    <span class="font-bold border-b-2 ${hasStock ? 'border-green-400 text-green-700' : 'border-red-400 text-red-700'}">${baki}</span>
                </td>
                <td class="px-4 py-4 text-left" data-label="Status">
                    <span class="status-badge ${hasStock ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}">
                        ${hasStock ? 'Sedia' : 'Habis'}
                    </span>
                </td>
            </tr>
        `;
    }).join('');
}

window.toggleReportSection = function (sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        if (section.classList.contains('hidden')) {
            section.classList.remove('hidden');
        } else {
            section.classList.add('hidden');
        }
    }
};

function renderLogStok() {
    const tbody = document.getElementById('laporan-log-table');
    if (!tbody) return;

    const logs = allData.filter(d => d.type === 'log_stok').sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    if (logs.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" class="px-6 py-4 text-left text-slate-400">Tiada rekod transaksi buat masa ini.</td></tr>`;
        return;
    }

    tbody.innerHTML = logs.map(log => {
        const date = new Date(log.timestamp).toLocaleDateString('ms-MY', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

        let typeClass = 'bg-slate-100 text-slate-700';
        let typeIcon = '';

        if (log.jenisPerubahan && log.jenisPerubahan.toLowerCase().includes('rosak')) {
            typeClass = 'bg-red-100 text-red-700';
            typeIcon = '-';
        } else if (log.jenisPerubahan && log.jenisPerubahan.toLowerCase().includes('tambah') || log.jenisPerubahan.toLowerCase().includes('baru')) {
            typeClass = 'bg-green-100 text-green-700';
            typeIcon = '+';
        }

        return `
            <tr class="hover:bg-slate-50 transition-colors border-b border-slate-100">
                <td class="px-4 py-3 text-xs text-slate-600 font-medium whitespace-nowrap" data-label="Tarikh">${date}</td>
                <td class="px-4 py-3 text-xs text-slate-800 font-bold" data-label="Peralatan">${log.namaPeralatan || '-'}</td>
                <td class="px-4 py-3 text-left" data-label="Jenis">
                    <span class="px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${typeClass}">
                        ${log.jenisPerubahan || 'Kemaskini'}
                    </span>
                </td>
                <td class="px-4 py-3 text-left text-xs font-bold font-mono" data-label="Kuantiti">
                    <span>${typeIcon}${log.kuantiti || 0}</span>
                </td>
                <td class="px-4 py-3 text-xs text-slate-500 italic" data-label="Catatan">
                    ${log.catatan || '-'}
                </td>
            </tr>
        `;
    }).join('');
}

function formatRelativeDate(isoDate) {
    if (!isoDate) return '-';
    const date = new Date(isoDate);
    return date.toLocaleDateString('ms-MY', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
}

function renderLaporanDewanTable(permohonanData) {
    const tbody = document.getElementById('laporan-dewan-table');
    if (!tbody) return;

    const dewanApps = permohonanData.filter(p => {
        const jenis = (p.jenisPermohonan || '').toLowerCase();
        const items = (p.items || '').toLowerCase();
        return (jenis.includes('dewan') || items.includes('dewan')) && (p.status === 'Diluluskan' || p.status === 'Selesai');
    });

    if (dewanApps.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" class="px-6 py-10 text-center text-slate-300 font-medium italic">Tiada permohonan dewan direkodkan</td></tr>';
        return;
    }

    const now = new Date();
    const sortedApps = [...dewanApps].sort((a, b) => new Date(a.tarikhMulaPinjam) - new Date(b.tarikhMulaPinjam));


    const pastEvents = sortedApps.filter(p => {
        return p.status === 'Selesai';
    });

    const upcomingEvents = sortedApps.filter(p => {
        const startDate = new Date(p.tarikhMulaPinjam);
        return startDate > now;
    });

    const ongoingEvents = sortedApps.filter(p => {
        const startDate = new Date(p.tarikhMulaPinjam);
        const endDate = new Date(p.tarikhPulang);
        const nextDayMidnight = new Date(endDate);
        nextDayMidnight.setDate(nextDayMidnight.getDate() + 1);
        nextDayMidnight.setHours(0, 0, 0, 0);
        return startDate <= now && now < nextDayMidnight;
    });

    let html = `
    <tr class="bg-indigo-50/50">
        <td colspan="4" class="px-6 py-3 text-[10px] font-black text-indigo-600 uppercase tracking-widest">
            Rekod Ringkasan Fasiliti
        </td>
    </tr>
    <tr class="border-b border-slate-100">
        <td class="px-6 py-6" colspan="2">
            <div class="flex items-center gap-4">
                <div class="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center border border-indigo-200 shadow-sm">
                    <svg class="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                </div>
                <div>
                    <p class="font-black text-slate-900 text-lg leading-tight uppercase">Dewan Sri Kinabatangan</p>
                    <p class="text-[10px] text-slate-400 uppercase font-black tracking-widest mt-1">Status Asset: Sedia Digunakan</p>
                </div>
            </div>
        </td>
        <td class="px-6 py-6 text-center">
            <div class="inline-flex flex-col items-center bg-white px-6 py-3 rounded-2xl border border-slate-200">
                <span class="text-2xl font-black text-slate-800">${dewanApps.length}</span>
                <span class="text-[9px] text-slate-400 uppercase font-black tracking-widest mt-1">Total Acara</span>
            </div>
        </td>
        <td class="px-6 py-6 text-right">
            <p class="text-[10px] text-slate-400 font-bold uppercase mb-1">Kadar Penggunaan</p>
            <p class="text-sm font-black text-indigo-600">${Math.min(100, Math.round((dewanApps.length / 30) * 100))}% Bulanan</p>
        </td>
    </tr>
`;

    html += `
    <tr class="bg-orange-50">
        <td colspan="4" class="px-6 py-4 text-[10px] font-black text-orange-600 uppercase tracking-widest">
            🔴 Acara Sedang Berlangsung (${ongoingEvents.length})
        </td>
    </tr>
    `;
    if (ongoingEvents.length === 0) {
        html += `<tr><td colspan="4" class="px-6 py-4 text-left text-xs text-slate-400 italic">Tiada acara sedang berlangsung</td></tr>`;
    } else {
        ongoingEvents.forEach(p => {
            html += `
                <tr class="border-b border-orange-100 transition-colors hover:bg-orange-50/30 bg-orange-50/10">
                    <td class="px-6 py-4" data-label="Perincian">
                        <div>
                            <p class="text-sm font-bold text-orange-900">${p.tujuan || 'Aktiviti Dewan'}</p>
                            <p class="text-[10px] text-orange-500 tracking-wide">${p.nama || 'Pemohon'}</p>
                        </div>
                    </td>
                    <td class="px-6 py-4" data-label="Waktu">
                        <div class="text-xs text-orange-700 font-medium">
                            <p class="text-orange-900 font-bold">Penggunaan</p>
                            <p class="font-bold">${new Date(p.tarikhMulaPinjam).toLocaleDateString('ms-MY', { day: '2-digit', month: 'short' })} - ${new Date(p.tarikhPulang).toLocaleDateString('ms-MY', { day: '2-digit', month: 'short' })}</p>
                        </div>
                    </td>
                    <td class="px-6 py-4 text-left" data-label="Status"><span><span class="px-2 py-1 bg-orange-200 text-orange-800 text-[9px] font-bold rounded-full uppercase tracking-widest shadow-sm">Aktif</span></span></td>
                    <td class="px-6 py-4 text-left text-[10px] font-black text-orange-600 uppercase tracking-tighter" data-label="Info">Berlangsung</td>
                </tr>
            `;
        });
    }

    html += `
    <tr class="bg-indigo-50/30">
        <td colspan="4" class="px-6 py-4 text-[10px] font-black text-indigo-600 uppercase tracking-widest">
            📅 Acara Akan Datang (${upcomingEvents.length})
        </td>
    </tr>
    `;
    if (upcomingEvents.length === 0) {
        html += `<tr><td colspan="4" class="px-6 py-4 text-left text-xs text-slate-400 italic">Tiada acara akan datang</td></tr>`;
    } else {
        upcomingEvents.slice(0, 3).forEach(p => {
            html += `
                <tr class="border-b border-slate-50 transition-colors hover:bg-indigo-50/20">
                    <td class="px-6 py-4">
                        <p class="text-sm font-bold text-indigo-900">${p.tujuan || 'Aktiviti Dewan'}</p>
                        <p class="text-[10px] text-indigo-400 tracking-wide">${p.nama || 'Pemohon'}</p>
                    </td>
                    <td class="px-6 py-4">
                        <div class="text-xs text-indigo-600 font-medium">
                            <p class="text-indigo-900 font-bold">Tarikh Penggunaan</p>
                            <p class="font-bold">${new Date(p.tarikhMulaPinjam).toLocaleDateString('ms-MY', { day: '2-digit', month: 'short', year: 'numeric' })} - ${new Date(p.tarikhPulang).toLocaleDateString('ms-MY', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                        </div>
                    </td>
                    <td class="px-6 py-4 text-left"><span class="px-2 py-1 bg-indigo-100 text-indigo-700 text-[9px] font-bold rounded-full uppercase tracking-widest shadow-sm">Booking</span></td>
                    <td class="px-6 py-4 text-left text-[10px] font-black text-indigo-600 uppercase tracking-tighter">Sedia </td>
                </tr>
            `;
        });
    }

    html += `
    <tr class="bg-slate-50">
        <td colspan="4" class="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">
            🕒 Acara Terdahulu (${pastEvents.length})
        </td>
    </tr>
    `;
    if (pastEvents.length === 0) {
        html += `<tr><td colspan="4" class="px-6 py-4 text-left text-xs text-slate-400 italic">Tiada acara terdahulu</td></tr>`;
    } else {
        pastEvents.slice(-3).reverse().forEach(p => {
            html += `
                <tr class="border-b border-slate-50 transition-colors hover:bg-slate-50/50">
                    <td class="px-6 py-4">
                        <p class="text-sm font-bold text-slate-700">${p.tujuan || 'Aktiviti Dewan'}</p>
                        <p class="text-[10px] text-slate-400 tracking-wide">${p.nama || 'Pemohon'}</p>
                    </td>
                    <td class="px-6 py-4">
                        <div class="text-xs text-slate-500 font-medium">
                            <p class="text-slate-600 font-bold">Tarikh Tamat</p>
                            <p>${new Date(p.tarikhMulaPinjam).toLocaleDateString('ms-MY', { day: '2-digit', month: 'short', year: 'numeric' })} - ${new Date(p.tarikhPulang).toLocaleDateString('ms-MY', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                        </div>
                    </td>
                    <td class="px-6 py-4 text-left"><span class="px-2 py-1 bg-slate-100 text-slate-600 text-[9px] font-bold rounded-full uppercase">Selesai</span></td>
                    <td class="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-tighter">Arsip</td>
                </tr>
            `;
        });
    }

    tbody.innerHTML = html;
}

function resetDateFilter() {
    document.getElementById('filter-tarikh-mula').value = '';
    document.getElementById('filter-tarikh-akhir').value = '';
    DataStore.notify(); // Re-render everything with original data
    showToast('🔄 Filter dikosongkan');
}

function applyDateFilter() {
    console.log('applyDateFilter called');
    try {
        DataStore.notify();
        renderLaporan();
        showToast('✅ Data telah dikemaskini');
    } catch (e) {
        console.error('❌ applyDateFilter error:', e);
        showToast('❌ Gagal menerapkan filter. Lihat console.');
    }
}

function applyPermohonanDateFilter() {
    console.log('applyPermohonanDateFilter called');
    try {
        DataStore.notify();
        renderPermohonan();
        showToast('✅ Filter telah diterapkan');
    } catch (e) {
        console.error('❌ applyPermohonanDateFilter error:', e);
        showToast('❌ Gagal menerapkan filter permohonan. Lihat console.');
    }
}

function resetPermohonanDateFilter() {
    const filterStart = document.getElementById('permohonan-filter-tarikh-mula');
    const filterEnd = document.getElementById('permohonan-filter-tarikh-akhir');
    if (filterStart) filterStart.value = '';
    if (filterEnd) filterEnd.value = '';
    try {
        DataStore.notify();
        renderPermohonan();
        showToast('🔄 Filter dikosongkan');
    } catch (e) {
        console.error('❌ resetPermohonanDateFilter error:', e);
        showToast('❌ Gagal reset filter. Lihat console.');
    }
}

function toggleDownloadMenu() {
    const menu = document.getElementById('download-menu');
    if (menu) {
        menu.classList.toggle('hidden');
    }
}

window.addEventListener('click', (e) => {
    const menu = document.getElementById('download-menu');
    const btn = e.target.closest('button[onclick="toggleDownloadMenu()"]');
    if (menu && !menu.classList.contains('hidden') && !btn) {
        menu.classList.add('hidden');
    }
});

function downloadExcel() {
    const data = getPermohonan();
    if (!data.length) {
        showToast('Tiada data untuk dimuat turun');
        return;
    }

    const headers = [
        'Nama Pemohon',
        'Email',
        'No. Telefon',
        'Cawangan',
        'Jenis Permohonan',
        'Item Dipinjam',
        'Tarikh Mula',
        'Tarikh Pulang',
        'Tujuan',
        'Status',
        'Catatan Admin'
    ];

    const rows = data.map(row => {
        const items = row.items ? row.items.replace(/,/g, ';') : '-';

        return [
            `"${row.nama || ''}"`,
            `"${row.email || ''}"`,
            `"${row.nomorTelefon || ''}"`,
            `"${row.cawangan || ''}"`,
            `"${row.jenisPermohonan || ''}"`,
            `"${items}"`,
            `"${row.tarikhMulaPinjam || ''}"`,
            `"${row.tarikhPulang || ''}"`,
            `"${(row.tujuan || '').replace(/"/g, '""')}"`, // Escape quotes
            `"${row.status || ''}"`,
            `"${(row.catatan || '').replace(/"/g, '""')}"`
        ];
    });

    const csvContent = [
        headers.join(','),
        ...rows.map(r => r.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Senarai_Permohonan_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toggleDownloadMenu(); // Close menu
    showToast('Fail berjaya dimuat turun!');
}

function downloadPDF() {
    toggleDownloadMenu();

    const startDate = document.getElementById('filter-permohonan-mula')?.value;
    const endDate = document.getElementById('filter-permohonan-akhir')?.value;
    const dateRangeText = (startDate || endDate)
        ? `${startDate || '-'} hingga ${endDate || '-'}`
        : 'Semua Tarikh';

    const logoContainer = document.getElementById('sidebar-logo-container');
    let logoHTML = '';
    if (logoContainer) {
        const logoImg = logoContainer.querySelector('img');
        if (logoImg) {
            logoHTML = `<img src="${logoImg.src}" style="width: 80px; height: 80px; object-fit: contain;" />`;
        }
    }

    let permohonan = getPermohonan();

    if (startDate || endDate) {
        permohonan = permohonan.filter(p => {
            const pinjamDate = new Date(p.tarikhMulaPinjam);
            const start = startDate ? new Date(startDate) : null;
            const end = endDate ? new Date(endDate) : null;

            if (start && end) {
                return pinjamDate >= start && pinjamDate <= end;
            } else if (start) {
                return pinjamDate >= start;
            } else if (end) {
                return pinjamDate <= end;
            }
            return true;
        });
    }

    const tableRows = permohonan.map(p => {
        let itemsDisplay = '-';
        if (p.itemsData) {
            try {
                const items = JSON.parse(p.itemsData);
                itemsDisplay = items.map((item, idx) => `${idx + 1}. ${item.name} (${item.qty})`).join(', ');
            } catch (e) {
                itemsDisplay = p.items || '-';
            }
        } else if (p.items && p.items !== 'Dewan') {
            itemsDisplay = p.items;
        }

        return `
            <tr>
                <td style="border: 1px solid #e5e7eb; padding: 8px; font-size: 8pt;">${p.noPermohonan || '-'}</td>
                <td style="border: 1px solid #e5e7eb; padding: 8px; font-size: 8pt;">${p.nama || '-'}</td>
                <td style="border: 1px solid #e5e7eb; padding: 8px; font-size: 8pt;">${p.email || '-'}</td>
                <td style="border: 1px solid #e5e7eb; padding: 8px; font-size: 8pt;">${p.nomorTelefon || '-'}</td>
                <td style="border: 1px solid #e5e7eb; padding: 8px; font-size: 8pt;">${p.cawangan || '-'}</td>
                <td style="border: 1px solid #e5e7eb; padding: 8px; font-size: 8pt;">${p.jenisPermohonan || '-'}</td>
                <td style="border: 1px solid #e5e7eb; padding: 8px; font-size: 8pt;">${itemsDisplay}</td>
                <td style="border: 1px solid #e5e7eb; padding: 8px; font-size: 8pt;">${formatDate(p.tarikhMulaPinjam)}</td>
                <td style="border: 1px solid #e5e7eb; padding: 8px; font-size: 8pt;">${formatDate(p.tarikhPulang)}</td>
                <td style="border: 1px solid #e5e7eb; padding: 8px; font-size: 8pt;">${p.status || 'Dalam Proses'}</td>
            </tr>
        `;
    }).join('');

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
        showToast('❌ Sila benarkan popup untuk mencetak');
        return;
    }

    printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>Senarai Permohonan - Dewan Sri Kinabatangan</title>
            <style>
                @page {
                    size: A4 portrait;
                    margin: 15mm;
                }
                
                * {
                    margin: 0;
                    padding: 0;
                    box-sizing: border-box;
                }
                
                body {
                    font-family: 'Arial', sans-serif;
                    color: #1e293b;
                    background: white;
                }
                
                .header {
                    text-align: center;
                    margin-bottom: 20px;
                    padding-bottom: 15px;
                    border-bottom: 3px solid #667eea;
                }
                
                .header-content {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 20px;
                    margin-bottom: 10px;
                }
                
                .logo {
                    flex-shrink: 0;
                }
                
                .title-section {
                    text-align: left;
                }
                
                h1 {
                    font-size: 18pt;
                    font-weight: bold;
                    color: #1e293b;
                    margin-bottom: 5px;
                }
                
                .subtitle {
                    font-size: 12pt;
                    color: #64748b;
                    font-weight: 600;
                }
                
                .date-range {
                    font-size: 10pt;
                    color: #475569;
                    margin-top: 10px;
                    font-weight: bold;
                }
                
                table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-top: 15px;
                }
                
                th {
                    background: #f1f5f9;
                    border: 1px solid #e5e7eb;
                    padding: 10px 8px;
                    text-align: left;
                    font-size: 8pt;
                    font-weight: bold;
                    color: #475569;
                    text-transform: uppercase;
                }
                
                td {
                    border: 1px solid #e5e7eb;
                    padding: 8px;
                    font-size: 8pt;
                    vertical-align: top;
                }
                
                tr:nth-child(even) {
                    background: #f9fafb;
                }
                
                .footer {
                    margin-top: 20px;
                    padding-top: 10px;
                    border-top: 2px solid #e5e7eb;
                    text-align: center;
                    font-size: 8pt;
                    color: #64748b;
                }
            </style>
        </head>
        <body>
            <div class="header">
                <div class="header-content">
                    ${logoHTML ? `<div class="logo">${logoHTML}</div>` : ''}
                    <div class="title-section">
                        <h1>Senarai Permohonan</h1>
                        <div class="subtitle">Dewan Sri Kinabatangan</div>
                    </div>
                </div>
                <div class="date-range">Tempoh: ${dateRangeText}</div>
            </div>
            
            <table>
                <thead>
                    <tr>
                        <th>No. Rujukan</th>
                        <th>Pemohon</th>
                        <th>Email</th>
                        <th>No. Telefon</th>
                        <th>Cawangan</th>
                        <th>Jenis</th>
                        <th>Item</th>
                        <th>Tarikh Mula</th>
                        <th>Tarikh Pulang</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
                    ${tableRows}
                </tbody>
            </table>
            
            <div class="footer">
                Dijana pada: ${new Date().toLocaleString('ms-MY', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: 'numeric',
        minute: 'numeric'
    })}
            </div>
        </body>
        </html>
    `);

    printWindow.document.close();

    setTimeout(() => {
        printWindow.print();
    }, 500);
}

function printReport() {
    window.print();
}

let currentBgBase64 = null;

function handleBgUpload(input) {
    const file = input.files[0];
    const preview = document.getElementById('bg-preview');

    if (file) {
        if (file.size > 2 * 1024 * 1024) { // 2MB Limit
            showToast('⚠️ Fail terlalu besar! Had 2MB sahaja.');
            input.value = '';
            return;
        }

        const reader = new FileReader();
        reader.onload = function (e) {
            currentBgBase64 = e.target.result;
            preview.innerHTML = `<img src="${currentBgBase64}" class="w-full h-full object-cover">`;
            const bgUrlInput = document.getElementById('bg-url');
            if (bgUrlInput) bgUrlInput.value = ''; // Clear URL if upload used
        };
        reader.readAsDataURL(file);
    }
}

function handleBgUrl(url) {
    if (!url) return;
    currentBgBase64 = url;
    const preview = document.getElementById('bg-preview');
    if (preview) {
        preview.innerHTML = `<img src="${url}" class="w-full h-full object-cover" onerror="this.parentElement.innerHTML='<span class=\"text-xs text-red-500\">URL tidak sah</span>'">`;
    }
}

function resetBgImage() {
    localStorage.removeItem('portalBgImage');
    localStorage.removeItem('portalBgSize');
    localStorage.removeItem('portalBgPosition');
    currentBgBase64 = null;
    document.getElementById('bg-preview').innerHTML = '<span class="text-xs">Tiada imej dipilih</span>';
    applyBgSettings();
    showToast('🗑️ Latar belakang telah dipadam.');
}

function updateBgPreview() {
    const preview = document.getElementById('bg-preview');
    const size = document.getElementById('bg-size').value;
    const pos = document.getElementById('bg-position').value;
    const img = preview.querySelector('img');
    if (img) {
        img.style.objectFit = size;
        img.style.objectPosition = pos;
    }
}

function saveBgSettings() {
    const size = document.getElementById('bg-size').value;
    const pos = document.getElementById('bg-position').value;

    if (currentBgBase64) {
        localStorage.setItem('portalBgImage', currentBgBase64);
        savePortalSetting('portalBgImage', currentBgBase64);
    }

    localStorage.setItem('portalBgSize', size);
    localStorage.setItem('portalBgPosition', pos);

    savePortalSetting('portalBgSize', size);
    savePortalSetting('portalBgPosition', pos);

    applyBgSettings();
    showToast('✅ Tetapan latar belakang berjaya disimpan (Local & Online)');
}

async function savePortalSetting(key, val) {
    const id = `setting_${key}`;
    const setting = {
        type: 'tetapan',
        __backendId: id,
        key: key,
        value: val,
        updatedAt: new Date().toISOString()
    };

    const existing = allData.find(d => d.__backendId === id);
    if (existing) {
        await DataStore.update(id, { value: val, updatedAt: new Date().toISOString() });
    } else {
        await DataStore.add(setting);
    }
}

function applyBgSettings() {
    const bgFromData = allData.find(d => d.key === 'portalBgImage')?.value;
    const savedBg = bgFromData || localStorage.getItem('portalBgImage');

    const sizeFromData = allData.find(d => d.key === 'portalBgSize')?.value;
    const savedSize = sizeFromData || localStorage.getItem('portalBgSize') || 'cover';

    const posFromData = allData.find(d => d.key === 'portalBgPosition')?.value;
    const savedPos = posFromData || localStorage.getItem('portalBgPosition') || 'center';

    let bgEl = document.getElementById('global-portal-bg');
    if (!bgEl) {
        bgEl = document.createElement('div');
        bgEl.id = 'global-portal-bg';
        bgEl.className = 'fixed inset-0 -z-50 pointer-events-none transition-all duration-700';
        document.body.prepend(bgEl);
    }

    if (savedBg) {
        bgEl.style.backgroundImage = `linear-gradient(rgba(15, 23, 42, 0.5), rgba(15, 23, 42, 0.5)), url(${savedBg})`;
        bgEl.style.backgroundSize = savedSize;
        bgEl.style.backgroundPosition = savedPos;
        bgEl.style.backgroundRepeat = 'no-repeat';
        bgEl.style.backgroundAttachment = 'fixed';
    } else {
        bgEl.style.backgroundImage = '';
    }
    bgEl.style.opacity = '1';

    const preview = document.getElementById('bg-preview');
    if (preview && savedBg) {
        preview.innerHTML = `<img src="${savedBg}" style="width:100%; height:100%; object-fit:${savedSize}; object-position:${savedPos};">`;
    }
}

let currentLogoBase64 = null;

function handleLogoUpload(input) {
    const file = input.files[0];
    const preview = document.getElementById('logo-preview');

    if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
            currentLogoBase64 = e.target.result;
            preview.innerHTML = `<img src="${currentLogoBase64}" class="w-full h-full object-contain">`;
        };
        reader.readAsDataURL(file);
    }
}

function resetLogoImage() {
    localStorage.removeItem('portalLogo');
    localStorage.removeItem('portalLogoFit');
    currentLogoBase64 = null;
    document.getElementById('logo-preview').innerHTML = '<span class="text-[10px]">Tiada logo</span>';
    applyLogoSettings();
    showToast('🗑️ Logo telah di-reset ke asal.');
}

function updateLogoPreview() {
    const preview = document.getElementById('logo-preview');
    const fit = document.getElementById('logo-fit').value;
    const img = preview.querySelector('img');
    if (img) img.style.objectFit = fit;
}

function handleLogoUrl(url) {
    if (!url) return;
    currentLogoBase64 = url;
    const preview = document.getElementById('logo-preview');
    if (preview) {
        preview.innerHTML = `<img src="${url}" class="w-full h-full object-contain" onerror="this.parentElement.innerHTML='<span class=\"text-xs text-red-500\">URL tidak sah</span>'">`;
    }
}

function saveLogoSettings() {
    const fit = document.getElementById('logo-fit').value;
    if (currentLogoBase64) {
        localStorage.setItem('portalLogo', currentLogoBase64);
        savePortalSetting('portalLogo', currentLogoBase64);
    }
    localStorage.setItem('portalLogoFit', fit);
    savePortalSetting('portalLogoFit', fit);
    applyLogoSettings();
    showToast('✅ Tetapan logo berjaya disimpan (Online Sync)!');
}


function applyLogoSettings() {
    const logoFromData = allData.find(d => d.key === 'portalLogo')?.value;
    const savedLogo = logoFromData || localStorage.getItem('portalLogo');

    const fitFromData = allData.find(d => d.key === 'portalLogoFit')?.value;
    const savedFit = fitFromData || localStorage.getItem('portalLogoFit') || 'contain';

    const loginTarget = document.getElementById('login-logo-container');
    const sidebarTarget = document.getElementById('sidebar-logo-container');
    const preview = document.getElementById('logo-preview');

    if (savedLogo) {
        const logoHTML = `<img src="${savedLogo}" style="width:100%; height:100%; object-fit:${savedFit}; padding:4px;">`;
        if (loginTarget) loginTarget.innerHTML = logoHTML;
        if (sidebarTarget) sidebarTarget.innerHTML = logoHTML;

        if (document.getElementById('logo-fit')) {
            document.getElementById('logo-fit').value = savedFit;
        }

        if (preview) {
            preview.innerHTML = `<img src="${savedLogo}" style="width:100%; height:100%; object-fit:${savedFit};">`;
        }
    } else {
        const originalSVGs = {
            login: '<svg id="login-logo-svg" class="w-12 h-12" fill="none" stroke="currentColor" viewbox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>',
            sidebar: '<svg id="sidebar-logo-svg" class="w-6 h-6 text-indigo-900" fill="none" stroke="currentColor" viewbox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>'
        };
        if (loginTarget) loginTarget.innerHTML = originalSVGs.login;
        if (sidebarTarget) sidebarTarget.innerHTML = originalSVGs.sidebar;
    }
}



function checkAuth() {
    const isLocalLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const isSessionLoggedIn = sessionStorage.getItem('loggedIn') === 'true';
    const pageLogin = document.getElementById('login-page');
    const pageApp = document.getElementById('app');

    if ((isLocalLoggedIn || isSessionLoggedIn) && pageLogin && pageApp) {
        pageLogin.classList.add('hidden');
        pageApp.classList.remove('hidden');
        pageApp.style.display = 'flex';

        const name = localStorage.getItem('userName') || 'Admin';
        const email = localStorage.getItem('userEmail') || '';
        updateUserUI(name, email);
    }
}

function updateUserUI(name, email, photoURL = null) {
    if (!name) return;
    // console.log('👤 Updating User UI:', name);

    const headerNameArr = document.querySelectorAll('header p.text-sm.font-bold.text-slate-800, #app header .text-slate-800 p.font-bold');
    const headerAvatarArr = document.querySelectorAll('header div.w-9.h-9.bg-gradient-to-br, #app header .w-9.h-9');

    headerNameArr.forEach(el => el.textContent = name);
    headerAvatarArr.forEach(el => el.textContent = name.charAt(0).toUpperCase());

    const sidebarName = document.querySelector('aside p.text-sm.font-medium');
    const sidebarEmail = document.querySelector('aside p.text-xs.text-indigo-300');
    const sidebarAvatar = document.querySelector('aside div.w-8.h-8.bg-amber-400');

    if (sidebarName) sidebarName.textContent = name;
    if (sidebarEmail) sidebarEmail.textContent = email || 'Pentadbir Sistem';
    if (sidebarAvatar) sidebarAvatar.textContent = name.charAt(0).toUpperCase();

}

document.addEventListener('DOMContentLoaded', checkAuth);

let timeoutReminder, autoLogout;
let timeoutLimit = parseInt(localStorage.getItem('portalAutoLogout')) * 1000 || 30 * 1000; // Default 30s
let reminderTime = timeoutLimit > 20000 ? timeoutLimit - 10000 : timeoutLimit * 0.7; // Reminder 10s before or 70% of time

const timeoutReminderDiv = document.createElement('div');
timeoutReminderDiv.style.cssText = 'position:fixed;bottom:30px;left:50%;transform:translateX(-50%);background:rgba(225,29,72,0.95);color:#fff;padding:18px 25px;border-radius:12px;font-weight:700;box-shadow:0 0 15px #e11d48,0 0 25px rgba(225,29,72,0.5);text-align:center;display:none;z-index:9999;';
timeoutReminderDiv.innerHTML = `⚠️ Sesi anda hampir tamat! <br><span style="font-size:10px; opacity:0.8;">Skrin akan logout sebentar lagi kerana tiada aktiviti.</span> <br> <button id="stayLoggedIn" style="margin-top:10px;padding:8px 16px;border:none;border-radius:10px;background:#fff;color:#e11d48;font-weight:bold;cursor:pointer;box-shadow:0 5px 15px rgba(0,0,0,0.2);">Terus Login</button>`;
document.body.appendChild(timeoutReminderDiv);

function resetIdleTimer() {
    clearTimeout(timeoutReminder);
    clearTimeout(autoLogout);
    timeoutReminderDiv.style.display = 'none';
    startIdleTimer();
}

function startIdleTimer() {
    if (sessionStorage.getItem('loggedIn') !== 'true') return;

    timeoutReminder = setTimeout(() => {
        timeoutReminderDiv.style.display = 'block';
    }, reminderTime);

    autoLogout = setTimeout(() => {
        sessionStorage.removeItem("loggedIn");
        localStorage.removeItem("isLoggedIn");
        window.location.href = "index.html";
    }, timeoutLimit);
}

['mousemove', 'keydown', 'click', 'scroll', 'touchstart'].forEach(evt => {
    document.addEventListener(evt, resetIdleTimer, false);
});

document.addEventListener('click', (e) => {
    if (e.target.id === 'stayLoggedIn') {
        resetIdleTimer();
    }
});

startIdleTimer();

const logoutBtn = document.getElementById('logoutBtn');

if (logoutBtn) {
    logoutBtn.addEventListener('click', e => {
        e.preventDefault();
        e.stopPropagation(); // ⬅️ INI FIX UTAMA
        const dashboardState = {
            scrollY: window.scrollY,
            lastSection: window.location.hash || '#dashboard'
        };
        localStorage.setItem('dashboardState', JSON.stringify(dashboardState));

        let overlayDiv = document.createElement('div');
        overlayDiv.id = "logoutOverlay";
        overlayDiv.style.display = 'block';
        document.body.appendChild(overlayDiv);

        let confirmDiv = document.createElement('div');
        confirmDiv.id = "confirmLogoutDiv";
        confirmDiv.style.cssText = `
      position:fixed;top:50%;left:50%;
      transform:translate(-50%,-50%);
      background:rgba(44,62,80,0.95);
      color:#fff;
      padding:25px 35px;
      border-radius:15px;
      box-shadow:0 0 20px #3498db,0 0 35px rgba(52,152,219,0.5);
      text-align:center;
      z-index:9999;
    `;
        confirmDiv.innerHTML = `
      <p>⚠️ Anda pasti mahu logout?</p>
      <div style="margin-top:20px;display:flex;justify-content:space-around;gap:15px;">
        <button id="cancelLogoutBtn" style="
          padding:10px 20px;
          border:none;
          border-radius:12px;
          background:#7f8c8d;
          color:#fff;
          font-weight:bold;
          cursor:pointer;
          box-shadow:0 6px 15px rgba(0,0,0,0.4);
        ">Batal</button>
        <button id="confirmLogoutBtn" style="
          padding:10px 20px;
          border:none;
          border-radius:12px;
          background:#e74c3c;
          color:#fff;
          font-weight:bold;
          cursor:pointer;
          box-shadow:0 6px 15px rgba(0,0,0,0.4),0 0 15px #e74c3c;
        ">Logout</button>
      </div>
    `;
        document.body.appendChild(confirmDiv);

        const cancelBtn = document.getElementById('cancelLogoutBtn');
        const confirmBtn = document.getElementById('confirmLogoutBtn');

        cancelBtn.addEventListener('click', () => {
            confirmDiv.remove();
            overlayDiv.remove(); // hilangkan kabur
            const savedState = JSON.parse(localStorage.getItem('dashboardState'));
            if (savedState) {
                window.scrollTo({ top: savedState.scrollY, behavior: 'smooth' });
                if (savedState.lastSection) {
                    const sectionEl = document.querySelector(savedState.lastSection);
                    if (sectionEl) sectionEl.scrollIntoView({ behavior: 'smooth' });
                }
            }
        });

        confirmDiv.addEventListener('click', async (e) => {
            if (e.target && e.target.id === 'confirmLogoutBtn') {
                confirmDiv.style.opacity = "0.7";
                confirmDiv.style.pointerEvents = "none";

                let logoutLoading = document.createElement('div');
                logoutLoading.id = "globalLogoutLoading";
                logoutLoading.style.cssText = `
                    position:fixed;top:0;left:0;width:100%;height:100%;
                    background:rgba(0,0,0,0.8);
                    z-index:10000;
                    display:flex;flex-direction:column;align-items:center;justify-content:center;
                    color:white;font-family:sans-serif;
                `;
                logoutLoading.innerHTML = `
                    <div class="w-16 h-16 border-4 border-white/20 border-t-white rounded-full animate-spin mb-4"></div>
                    <h2 class="text-xl font-bold tracking-widest">SEDANG LOGOUT...</h2>
                    <p class="text-sm text-gray-400 mt-2">Menyimpan data dan menamatkan sesi</p>
                `;
                document.body.appendChild(logoutLoading);

                try {
                    if (typeof auth !== 'undefined' && auth) {
                        await auth.signOut();
                        console.log('✅ Firebase Signed Out');
                    }

                    localStorage.setItem("isLoggedIn", "false");
                    localStorage.removeItem("userEmail");
                    localStorage.removeItem("userName");
                    localStorage.removeItem("userRole");
                    localStorage.removeItem("loginType");
                    localStorage.removeItem("dashboardState");

                    sessionStorage.clear();

                    setTimeout(() => {
                        window.location.href = "index.html";
                    }, 1000);

                } catch (err) {
                    console.error('Logout Error:', err);
                    window.location.href = "index.html";
                }
            }
        });
    });
}


window.loadAdminData = async function () {
    const tableBody = document.getElementById('admin-table-body');
    if (!tableBody) return;

    try {
        console.log('⏳ Memuatkan senarai pentadbir dari Firestore...');
        const snapshot = await window.db.collection("users").get();
        const adminList = [];
        snapshot.forEach(doc => {
            adminList.push({ uid: doc.id, ...doc.data() });
        });
        renderAdminTable(adminList);
    } catch (error) {
        console.error("❌ Gagal memuatkan data admin:", error);
    }
};

function renderAdminTable(admins) {
    const tableBody = document.getElementById('admin-table-body');
    if (!tableBody) return;

    const currentUserUID = window.auth && window.auth.currentUser ? window.auth.currentUser.uid : null;

    tableBody.innerHTML = admins.map(admin => {
        const status = admin.status || 'Aktif';
        const isBlocked = status === 'Disekat';
        const statusClass = isBlocked ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600';
        const isSelf = currentUserUID && admin.uid === currentUserUID;

        return `
            <tr class="hover:bg-slate-50 transition-colors ${isSelf ? 'bg-indigo-50/30' : ''}">
                <td class="px-6 py-4" data-label="Pentadbir">
                    <div class="flex items-center gap-2">
                        <div class="font-bold text-slate-800">${admin.name || '-'}</div>
                        ${isSelf ? '<span class="text-[10px] bg-slate-800 text-white px-2 py-0.5 rounded-full font-bold">ANDA</span>' : ''}
                    </div>
                </td>
                <td class="px-6 py-4 text-slate-600 font-medium" data-label="Email">${admin.email || admin.id}</td>
                <td class="px-6 py-4 text-left" data-label="Peranan">
                    <span class="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-xs font-bold">${admin.role || 'Staff'}</span>
                </td>
                <td class="px-6 py-4 text-center" data-label="Daftar Masuk">
                    <div class="flex flex-col items-center">
                        <span class="text-[11px] font-bold text-slate-700">${admin.lastLogin ? formatDate(admin.lastLogin) : '<span class="text-slate-300 font-normal italic">Belum Pernah</span>'}</span>
                        ${admin.lastLogin ? '<span class="text-[9px] text-green-600 font-bold uppercase tracking-tighter">Login Terakhir</span>' : ''}
                    </div>
                </td>
                <td class="px-6 py-4 text-center" data-label="Daftar Keluar">
                    <div class="flex flex-col items-center">
                        <span class="text-[11px] font-bold text-slate-700">
                            ${admin.lastLogout && (!admin.lastLogin || new Date(admin.lastLogout) > new Date(admin.lastLogin))
                ? formatDate(admin.lastLogout)
                : admin.lastLogin
                    ? '<span class="inline-flex items-center gap-1 text-blue-600 animate-pulse font-black italic">Sedang Aktif</span>'
                    : '<span class="text-slate-300 font-normal italic">-</span>'}
                        </span>
                        ${admin.lastLogout && (!admin.lastLogin || new Date(admin.lastLogout) > new Date(admin.lastLogin)) ? '<span class="text-[9px] text-orange-600 font-bold uppercase tracking-tighter">Logout Terakhir</span>' : ''}
                    </div>
                </td>
                <td class="px-6 py-4 text-center" data-label="Status">
                    <span class="px-3 py-1 ${statusClass} rounded-full text-xs font-bold">${status}</span>
                </td>
                <td class="px-6 py-4" data-label="Tindakan">
                    <div class="flex items-center justify-center gap-2">
                        <button onclick="editAdminName('${admin.uid}', '${admin.name || ''}')" class="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all" title="Edit Nama">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                            </svg>
                        </button>
                        ${isSelf ? '' : `
                            <button onclick="toggleAdminStatus('${admin.uid}', '${status}')" 
                                class="p-2 ${isBlocked ? 'text-green-600 hover:bg-green-50' : 'text-orange-600 hover:bg-orange-50'} rounded-lg transition-all" 
                                title="${isBlocked ? 'Aktifkan' : 'Sekat Akses'}">
                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="${isBlocked ? 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' : 'M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636'}" />
                                </svg>
                            </button>
                            <button onclick="deleteAdmin('${admin.uid}')" class="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all" title="Padam">
                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-4v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                            </button>
                        `}
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

const addAdminForm = document.getElementById("form-add-admin");
if (addAdminForm) {
    addAdminForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const name = document.getElementById("admin-nama").value;
        const email = document.getElementById("admin-email").value.trim();
        const role = document.getElementById("admin-role").value;
        const password = document.getElementById("admin-password").value;

        const emailErr = document.getElementById("admin-email-error");
        const passErr = document.getElementById("admin-password-error");
        if (emailErr) emailErr.classList.add('hidden');
        if (passErr) passErr.classList.add('hidden');

        let hasError = false;
        if (!email.includes('@')) {
            if (emailErr) {
                emailErr.textContent = "Sila masukkan email yang lengkap.";
                emailErr.classList.remove('hidden');
            }
            hasError = true;
        }

        const hasLetter = /[a-zA-Z]/.test(password);
        const hasNumber = /[0-9]/.test(password);
        if (password.length < 6 || !hasLetter || !hasNumber) {
            if (passErr) {
                passErr.textContent = "Password mesti sekurang-kurangnya 6 aksara dan mengandungi kombinasi HURUF & NOMBOR (Alphanumeric).";
                passErr.classList.remove('hidden');
            }
            hasError = true;
        }

        if (hasError) return;

        try {
            const submitBtn = e.target.querySelector('button[type="submit"]');
            submitBtn.disabled = true;
            submitBtn.innerHTML = 'Mendaftarkan...';

            let secondaryApp = firebase.initializeApp(firebaseConfig, "SecondaryApp_" + Date.now());
            let secondaryAuth = secondaryApp.auth();

            const userCredential = await secondaryAuth.createUserWithEmailAndPassword(email, password);
            const newUser = userCredential.user;
            const uid = newUser.uid; // Get UID from Auth

            await window.db.collection("users").doc(uid).set({
                name,
                email,
                role,
                status: 'Aktif',
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });

            await secondaryApp.delete();

            alert("✅ Pentadbir berjaya dicipta dalam Authentication & Firestore.");
            e.target.reset();
            document.getElementById('admin-form-container').classList.add('hidden');
            loadAdminData();
        } catch (error) {
            alert("❌ Gagal mendaftar: " + error.message);
        } finally {
            const submitBtn = e.target.querySelector('button[type="submit"]');
            submitBtn.disabled = false;
            submitBtn.innerHTML = 'Daftar Admin';
        }
    });
}

window.toggleAdminStatus = async function (uid, currentStatus) {
    if (window.auth && window.auth.currentUser && uid === window.auth.currentUser.uid) {
        alert("⚠️ Anda tidak boleh menyekat akaun anda sendiri!");
        return;
    }
    const newStatus = currentStatus === 'Aktif' ? 'Disekat' : 'Aktif';
    if (!confirm(`Tukar status akaun ini kepada ${newStatus}?`)) return;

    try {
        await window.db.collection("users").doc(uid).update({ status: newStatus });
        loadAdminData();
    } catch (error) {
        alert("Ralat kemaskini: " + error.message);
    }
};

window.deleteAdmin = async function (uid) {
    if (window.auth && window.auth.currentUser && uid === window.auth.currentUser.uid) {
        alert("⚠️ Anda tidak boleh memadam akaun anda sendiri semasa sedang log masuk!");
        return;
    }
    if (!confirm("Padam akaun pentadbir ini secara kekal dari Firestore?")) return;

    try {
        await window.db.collection("users").doc(uid).delete();
        loadAdminData();
    } catch (error) {
        alert("Ralat memadam: " + error.message);
    }
};

window.editAdminName = async function (uid, oldName) {
    const newName = prompt("Kemaskini Nama Pentadbir:", oldName);
    if (newName === null || newName.trim() === "" || newName === oldName) return;

    try {
        await window.db.collection("users").doc(uid).update({
            name: newName.trim(),
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        showToast("✅ Nama pentadbir dikemaskini");
        loadAdminData();
    } catch (error) {
        alert("Gagal kemaskini nama: " + error.message);
    }
};

document.addEventListener('click', (e) => {
    if (e.target.closest('[onclick*="showPage(\'admin\')"]')) {
        loadAdminData();
    }
});


function executeAdvancedPrint(editMode = false) {
    const showSummary = document.getElementById('print-summary').checked;
    const showPeralatan = document.getElementById('print-peralatan').checked;
    const showDewan = document.getElementById('print-dewan').checked;
    const showLog = document.getElementById('print-log').checked;

    const startDate = document.getElementById('filter-tarikh-mula').value;
    const endDate = document.getElementById('filter-tarikh-akhir').value;

    const dateRangeEl = document.getElementById('print-date-range');
    const generatedDateEl = document.getElementById('print-generated-date');
    const logoTarget = document.getElementById('print-logo-target');
    const currentLogoContainer = document.getElementById('sidebar-logo-container');

    if (logoTarget && currentLogoContainer) {
        logoTarget.innerHTML = currentLogoContainer.innerHTML;
        const logoImg = logoTarget.querySelector('img');
        if (logoImg) {
            logoImg.style.padding = '0';
            logoImg.style.width = '100%';
            logoImg.style.height = '100%';
        }
    }

    if (dateRangeEl) dateRangeEl.textContent = `TEMPOH: ${startDate || '-'} hingga ${endDate || '-'}`;
    if (generatedDateEl) generatedDateEl.textContent = `DIJANA: ${new Date().toLocaleString('ms-MY')}`;

    const summaryCards = document.getElementById('report-summary-cards');
    const summarySection = document.getElementById('report-summary-section');
    const peralatanSection = document.getElementById('report-section-peralatan');
    const dewanSection = document.getElementById('report-section-dewan');

    if (summaryCards) summaryCards.classList.toggle('print-hide', !showSummary);
    if (summarySection) summarySection.classList.toggle('print-hide', !showSummary);
    if (peralatanSection) peralatanSection.classList.toggle('print-hide', !showPeralatan);
    if (dewanSection) dewanSection.classList.toggle('print-hide', !showDewan);

    const logSection = document.getElementById('report-section-log');
    if (logSection) logSection.classList.toggle('print-hide', !showLog);

    closeModal('modal-pilih-laporan');

    if (editMode) {
        openReportPreviewModal();
    } else {
        triggerPrintAction();
    }
}

function triggerPrintAction() {
    document.getElementById('editor-toolbar').classList.add('hidden');
    document.getElementById('report-header-section').classList.add('no-print');
    document.getElementById('print-only-header').classList.remove('hidden');

    setTimeout(() => {
        window.print();
        document.getElementById('report-header-section').classList.remove('no-print');
        document.querySelectorAll('.print-hide').forEach(el => el.classList.remove('print-hide'));
        document.getElementById('print-only-header').classList.add('hidden');
    }, 250);
}

function openReportPreviewModal() {
    const modal = document.getElementById('reportPreviewModal');
    const editableArea = document.getElementById('reportEditableArea');
    if (!modal || !editableArea) return;

    const startDate = document.getElementById('filter-tarikh-mula').value;
    const endDate = document.getElementById('filter-tarikh-akhir').value;
    const dateText = (startDate || endDate)
        ? `${startDate || '-'} hingga ${endDate || '-'}`
        : "Sepanjang Masa";

    const activeStatus = document.getElementById('report-active-status').textContent;
    const topItem = document.getElementById('report-top-item').textContent;
    const approvalRate = document.getElementById('report-approval-rate').textContent;

    const showSummary = document.getElementById('print-summary').checked;
    const showPeralatan = document.getElementById('print-peralatan').checked;
    const showDewan = document.getElementById('print-dewan').checked;
    const showLog = document.getElementById('print-log').checked;

    const logoContainer = document.getElementById('sidebar-logo-container');
    let logoHTML = '';
    if (logoContainer) {
        const logoImg = logoContainer.querySelector('img');
        if (logoImg) {
            logoHTML = `<img src="${logoImg.src}" style="width: 80px; height: 80px; object-fit: contain;" />`;
        }
    }

    let reportContent = `
        <div class="report-document">
            
            <!-- FIXED HEADER -->
            <div class="report-header">
                <div style="display: flex; align-items: center; gap: 25px;">
                    ${logoHTML ? `<div class="logo-container">${logoHTML}</div>` : ''}
                    <div style="flex: 1;">
                        <h1>Laporan Pengurusan</h1>
                        <h2>Penggunaan Dewan dan Peralatan</h2>
                        <div class="date-info">
                            <p>📅 Tempoh: <strong>${dateText}</strong></p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- MAIN CONTENT -->
            <div class="report-body">
                
                ${showSummary ? `
                <div class="report-section" style="border-left: 6px solid #667eea;">
                    <h3 style="color: #667eea;">
                        Ringkasan Eksekutif
                    </h3>
                    <div class="stats-grid">
                        <div class="stat-card" style="background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); border-color: #bae6fd; color: #0369a1;">
                            <p>Status Keaktifan</p>
                            <p style="color: #0c4a6e;">${activeStatus}</p>
                        </div>
                        <div class="stat-card" style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border-color: #fcd34d; color: #92400e;">
                            <p>Item Paling Laris</p>
                            <p style="color: #78350f;">${topItem}</p>
                        </div>
                        <div class="stat-card" style="background: linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%); border-color: #86efac; color: #15803d;">
                            <p>Kadar Kelulusan</p>
                            <p style="color: #14532d;">${approvalRate}</p>
                        </div>
                    </div>
                </div>
                ` : ''}

                ${showPeralatan ? `
                <div class="report-section" style="border-left: 6px solid #f59e0b;">
                    <h3 style="color: #f59e0b;">
                        Analisis Peminjaman Peralatan
                    </h3>
                    <p style="font-size: 10pt; color: #64748b; margin-bottom: 15px;">Berikut adalah analisis kekerapan permohonan peralatan berdasarkan aliran inventori dan permintaan:</p>
                    <div style="border: 2px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
                        <table style="margin: 0;">
                            <thead>
                                <tr>
                                    <th style="border: 1px solid #e5e7eb; font-size: 8pt;">Peralatan</th>
                                    <th style="text-align: center; border: 1px solid #e5e7eb; font-size: 8pt;">Baru (+)</th>
                                    <th style="text-align: center; border: 1px solid #e5e7eb; font-size: 8pt;">Rosak (-)</th>
                                    <th style="text-align: center; border: 1px solid #e5e7eb; font-size: 8pt;">Jumlah</th>
                                    <th style="text-align: center; border: 1px solid #e5e7eb; font-size: 8pt;">Diguna</th>
                                    <th style="text-align: center; border: 1px solid #e5e7eb; font-size: 8pt;">Baki</th>
                                    <th style="text-align: right; border: 1px solid #e5e7eb; font-size: 8pt;">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${document.getElementById('laporan-peralatan-table').innerHTML}
                            </tbody>
                        </table>
                    </div>
                </div>
                ` : ''}

                ${showDewan ? `
                <div class="report-section" style="border-left: 6px solid #8b5cf6;">
                    <h3 style="color: #8b5cf6;">
                        Analisis Penggunaan Dewan
                    </h3>
                    <p style="font-size: 10pt; color: #64748b; margin-bottom: 15px;">Ringkasan penggunaan fasiliti dewan:</p>
                    <div style="border: 2px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
                        <table style="margin: 0;">
                            ${document.getElementById('laporan-dewan-table').innerHTML}
                        </table>
                    </div>
                </div>
                ` : ''}

                ${showLog ? `
                <div class="report-section" style="border-left: 6px solid #f97316; page-break-inside: avoid;">
                    <h3 style="color: #f97316;">
                        Log Transaksi Stok
                    </h3>
                    <p style="font-size: 10pt; color: #64748b; margin-bottom: 15px;">Sejarah penambahan dan kerosakan peralatan:</p>
                    <div style="border: 2px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
                        <table style="margin: 0; width: 100%; border-collapse: collapse;">
                            <thead>
                                <tr style="background-color: #f8fafc;">
                                    <th style="border: 1px solid #e5e7eb; font-size: 8pt; text-align: left; padding: 8px; font-weight: bold; color: #64748b; text-transform: uppercase;">Tarikh</th>
                                    <th style="border: 1px solid #e5e7eb; font-size: 8pt; text-align: left; padding: 8px; font-weight: bold; color: #64748b; text-transform: uppercase;">Peralatan</th>
                                    <th style="border: 1px solid #e5e7eb; font-size: 8pt; text-align: center; padding: 8px; font-weight: bold; color: #64748b; text-transform: uppercase;">Jenis</th>
                                    <th style="border: 1px solid #e5e7eb; font-size: 8pt; text-align: center; padding: 8px; font-weight: bold; color: #64748b; text-transform: uppercase;">Kuantiti</th>
                                    <th style="border: 1px solid #e5e7eb; font-size: 8pt; text-align: left; padding: 8px; font-weight: bold; color: #64748b; text-transform: uppercase;">Catatan</th>
                                </tr>
                            </thead>
                            <tbody style="font-size: 9pt;">
                                ${document.getElementById('laporan-log-table').innerHTML}
                            </tbody>
                        </table>
                    </div>
                </div>
                ` : ''}

            </div>

            <!-- FIXED FOOTER -->
            <div class="report-footer">
                <div class="footer-left">
                    <p>Sistem Pengurusan Peralatan & Dewan</p>
                    <p>Dewan Sri Kinabatangan</p>
                </div>
                <div class="footer-right">
                    <p>Dijana secara automatik pada:</p>
                    <p>${new Date().toLocaleString('ms-MY', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        hour12: true
    }).toUpperCase().replace(/AM/g, 'PAGI').replace(/PM/g, 'PTG')}</p>
                </div>
            </div>

        </div>
    `;

    editableArea.innerHTML = reportContent;
    modal.classList.add('active');

    editableArea.querySelectorAll('tr, td, th').forEach(el => {
        el.className = el.className.replace(/hover:bg-slate-50|transition-colors|bg-indigo-50\/50|bg-slate-50|bg-indigo-50\/30|border-b|border-slate-50|border-slate-100/g, '');
    });

    initReportPreviewListeners();
}

function closeReportPreviewModal() {
    const modal = document.getElementById('reportPreviewModal');
    if (modal) modal.classList.remove('active');
}

function initReportPreviewListeners() {
    if (window.reportPreviewInitialized) return;

    document.getElementById('closeReportPreview').onclick = closeReportPreviewModal;
    document.getElementById('cancelReportPreview').onclick = closeReportPreviewModal;

    document.getElementById('confirmPrintBtn').onclick = () => {
        const editableArea = document.getElementById('reportEditableArea');
        if (!editableArea) return;

        const printWindow = window.open('', '_blank');
        if (!printWindow) {
            showToast('❌ Sila benarkan popup untuk mencetak');
            return;
        }

        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <title>Laporan Pengurusan - Dewan & Peralatan</title>
                <style>
                    * { 
                        margin: 0; 
                        padding: 0; 
                        box-sizing: border-box; 
                    }
                    
                    @page { 
                        size: A4; 
                        margin: 0;
                    }
                    
                    body { 
                        font-family: 'Inter', 'Segoe UI', Arial, sans-serif; 
                        line-height: 1.6; 
                        color: #1e293b;
                        background: white;
                    }
                    
                    /* Fixed Header */
                    .report-header {
                        position: fixed;
                        top: 0;
                        left: 0;
                        right: 0;
                        height: 160px;
                        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                        color: white;
                        padding: 25px 35px;
                        border-bottom: 5px solid #4c51bf;
                        z-index: 1000;
                    }
                    
                    .report-header h1 {
                        font-size: 26pt;
                        font-weight: 900;
                        margin: 0;
                        text-transform: uppercase;
                        letter-spacing: 1px;
                        text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
                    }
                    
                    .report-header h2 {
                        font-size: 13pt;
                        font-weight: 600;
                        margin: 5px 0 0;
                        opacity: 0.95;
                        text-transform: uppercase;
                    }
                    
                    .report-header .date-info {
                        margin-top: 10px;
                        padding-top: 10px;
                        border-top: 2px solid rgba(255,255,255,0.3);
                        font-size: 10pt;
                    }
                    
                    .logo-container {
                        flex-shrink: 0;
                        background: white;
                        padding: 10px;
                        border-radius: 10px;
                        box-shadow: 0 8px 20px rgba(0,0,0,0.2);
                    }
                    
                    /* Fixed Footer */
                    .report-footer {
                        position: fixed;
                        bottom: 0;
                        left: 0;
                        right: 0;
                        height: 70px;
                        background: #1e293b;
                        color: white;
                        padding: 15px 35px;
                        border-top: 5px solid #475569;
                        z-index: 1000;
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                    }
                    
                    .footer-left p:first-child {
                        font-weight: 800;
                        font-size: 10pt;
                        text-transform: uppercase;
                        letter-spacing: 1px;
                        margin: 0;
                    }
                    
                    .footer-left p:last-child {
                        font-size: 8pt;
                        opacity: 0.7;
                        margin: 3px 0 0;
                    }
                    
                    .footer-right {
                        text-align: right;
                    }
                    
                    .footer-right p:first-child {
                        font-size: 8pt;
                        opacity: 0.8;
                        margin: 0;
                    }
                    
                    .footer-right p:last-child {
                        font-weight: 700;
                        font-size: 9pt;
                        margin: 3px 0 0;
                    }
                    
                    /* Main content with proper spacing */
                    .report-body {
                        padding: 0;
                        background: #f8fafc;
                        min-height: calc(100vh - 250px);
                    }
                    
                    /* Content sections */
                    .report-section {
                        background: white;
                        padding: 25px;
                        border-radius: 10px;
                        border: 1px solid #e5e7eb;
                        margin-bottom: 25px;
                        page-break-inside: avoid;
                        break-inside: avoid;
                    }
                    
                    .report-section h3 {
                        font-size: 15pt;
                        font-weight: 900;
                        text-transform: uppercase;
                        color: #1e293b;
                        margin: 0 0 18px;
                        display: flex;
                        align-items: center;
                        gap: 10px;
                        page-break-after: avoid;
                    }
                    
                    .section-number {
                        display: inline-flex;
                        align-items: center;
                        justify-content: center;
                        width: 32px;
                        height: 32px;
                        color: white;
                        border-radius: 8px;
                        font-size: 16pt;
                        flex-shrink: 0;
                    }
                    
                    /* Stats grid */
                    .stats-grid {
                        display: grid;
                        grid-template-columns: repeat(3, 1fr);
                        gap: 15px;
                        margin-top: 10px;
                    }
                    
                    .stat-card {
                        padding: 18px;
                        border-radius: 8px;
                        border: 2px solid;
                        text-align: center;
                        page-break-inside: avoid;
                    }
                    
                    .stat-card p:first-child {
                        font-size: 8pt;
                        margin: 0;
                        text-transform: uppercase;
                        font-weight: 800;
                        letter-spacing: 0.5px;
                    }
                    
                    .stat-card p:last-child {
                        font-size: 18pt;
                        font-weight: 900;
                        margin: 8px 0 0;
                    }
                    
                    /* Tables */
                    table { 
                        width: 100%; 
                        border-collapse: collapse; 
                        margin: 12px 0;
                        page-break-inside: auto;
                    }
                    
                    tr {
                        page-break-inside: avoid;
                        page-break-after: auto;
                    }
                    
                    th, td { 
                        padding: 10px; 
                        text-align: left; 
                        border: 1px solid #d1d5db;
                        font-size: 9pt;
                    }
                    
                    th { 
                        background: linear-gradient(135deg, #f8fafc, #f1f5f9);
                        font-weight: 800;
                        color: #475569;
                        text-transform: uppercase;
                        font-size: 8pt;
                        letter-spacing: 0.5px;
                    }

                    tbody tr:nth-child(even) {
                        background: #f9fafb;
                    }
                    
                    /* TAILWIND ICON SCALING FIXES */
                    .w-5 { width: 20px !important; } .h-5 { height: 20px !important; }
                    .w-6 { width: 24px !important; } .h-6 { height: 24px !important; }
                    .w-7 { width: 28px !important; } .h-7 { height: 28px !important; }
                    .w-8 { width: 32px !important; } .h-8 { height: 32px !important; }
                    .w-10 { width: 40px !important; } .h-10 { height: 40px !important; }
                    .w-12 { width: 48px !important; } .h-12 { height: 48px !important; }
                    .rounded-full { border-radius: 9999px !important; }
                    .rounded-xl { border-radius: 12px !important; }
                    .flex { display: flex !important; }
                    .items-center { align-items: center !important; }
                    .justify-center { justify-content: center !important; }
                    .gap-4 { gap: 1rem !important; }
                    svg { display: block; max-width: 100%; max-height: 100%; }

                    @media print {
                        body {
                            -webkit-print-color-adjust: exact;
                            print-color-adjust: exact;
                        }
                        .report-section {
                            box-shadow: none;
                        }
                    }
                </style>
            </head>
            <body>
                <table style="width: 100%; border: none; border-collapse: collapse; margin: 0; padding: 0;">
                    <thead>
                        <tr><td style="height: 170px; border: none; padding: 0;">&nbsp;</td></tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td style="border: none; padding: 0;">
                                <div class="report-body">
                                    ${editableArea.querySelector('.report-body').innerHTML}
                                </div>
                            </td>
                        </tr>
                    </tbody>
                    <tfoot>
                        <tr><td style="height: 80px; border: none; padding: 0;">&nbsp;</td></tr>
                    </tfoot>
                </table>

                <div class="report-header">
                    ${editableArea.querySelector('.report-header').innerHTML}
                </div>

                <div class="report-footer">
                    ${editableArea.querySelector('.report-footer').innerHTML}
                </div>
            </body>
            </html>
        `);

        printWindow.document.close();

        setTimeout(() => {
            printWindow.focus();
            printWindow.print();
            printWindow.close();
            closeReportPreviewModal();
            showToast('✅ Dokumen telah dihantar ke printer');
        }, 500);
    };

    document.getElementById('saveReportSettingsBtn').onclick = () => {
        showToast('✅ Tetapan laporan telah dikemaskini.');
    };

    document.getElementById('increaseFontSize').onclick = () => changeFontSize(2);
    document.getElementById('decreaseFontSize').onclick = () => changeFontSize(-2);

    document.getElementById('reportLogoInput').onchange = function (e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function (event) {
                const img = document.createElement('img');
                img.src = event.target.result;
                img.id = 'report-dynamic-logo';
                img.style.width = document.getElementById('logoWidthSlider').value + 'px';
                const logoTarget = document.getElementById('reportEditableArea').querySelector('#print-logo-target');
                if (logoTarget) {
                    logoTarget.innerHTML = '';
                    logoTarget.appendChild(img);
                }
            };
            reader.readAsDataURL(file);
        }
    };

    document.getElementById('logoWidthSlider').oninput = function (e) {
        const val = e.target.value;
        document.getElementById('logoWidthValue').textContent = val + 'px';
        const img = document.getElementById('report-dynamic-logo');
        if (img) img.style.width = val + 'px';
        else {
            const logoTarget = document.getElementById('reportEditableArea').querySelector('#print-logo-target img');
            if (logoTarget) logoTarget.style.width = val + 'px';
        }
    };

    window.reportPreviewInitialized = true;
}

function switchRibbonTab(tabId) {
    document.querySelectorAll('.ribbon-panel').forEach(p => p.classList.remove('active'));
    document.getElementById(tabId).classList.add('active');
    document.querySelectorAll('.ribbon-tab').forEach(t => t.classList.remove('active'));
    document.querySelector(`.ribbon-tab[onclick="switchRibbonTab('${tabId}')"]`).classList.add('active');
}

function transformText(type) {
    const selection = window.getSelection();
    if (!selection.rangeCount) return;
    let target = selection.commonAncestorContainer;
    if (target.nodeType === 3) target = target.parentElement;
    target.style.textTransform = type;
}

function updateLineHeight(val) {
    const selection = window.getSelection();
    if (!selection.rangeCount) return;
    let target = selection.commonAncestorContainer;
    if (target.nodeType === 3) target = target.parentElement;
    target.style.lineHeight = val;
}

window.formatDoc = function (cmd, value = null) {
    document.execCommand(cmd, false, value);
}

function toggleWordMode(active) {
    const toolbar = document.getElementById('editor-toolbar');
    const content = document.getElementById('page-laporan');
    if (active) {
        toolbar.classList.remove('hidden');
        content.classList.add('editing-active');
        document.querySelectorAll(`#page-laporan p, #page-laporan span, #page-laporan h1, #page-laporan h2, #page-laporan h3`).forEach(el => {
            if (el.innerText.trim().length > 0) el.setAttribute('contenteditable', 'true');
        });
    } else {
        toolbar.classList.add('hidden');
        content.classList.remove('editing-active');
        document.querySelectorAll('#page-laporan [contenteditable]').forEach(el => el.removeAttribute('contenteditable'));
    }
}

function changeFontSize(delta) {
    const selection = window.getSelection();
    if (!selection.rangeCount) return;

    const range = selection.getRangeAt(0);
    let target = range.commonAncestorContainer;

    if (target.nodeType === 3) target = target.parentElement;

    if (!selection.isCollapsed) {
        const currentSize = window.getComputedStyle(target).fontSize;
        const newSize = Math.max(8, parseFloat(currentSize) + delta) + 'px';
        target.style.fontSize = newSize;

        showToast(`📏 Saiz tulisan: ${newSize}`);
    } else {
        const currentSize = window.getComputedStyle(target).fontSize;
        const newSize = Math.max(8, parseFloat(currentSize) + delta) + 'px';
        target.style.fontSize = newSize;
    }
}

function saveEditorChanges() {
    toggleWordMode(false);
    showToast('✅ Tetapan disimpan. Memulakan cetakan...');
    setTimeout(triggerPrintAction, 500);
}

let isSyncing = false;
const SYNC_INTERVAL = 15000; // Check every 15 seconds

function startRealtimeSync() {
    console.log('📡 Starting Real-time Sync (Interval: 15s)');

    setInterval(async () => {
        if (localStorage.getItem('isLoggedIn') !== 'true') return;

        if (isSyncing || !GoogleSheetsDB.isConfigured()) return;

        isSyncing = true;
        try {
            const result = await fetch(`${GOOGLE_SCRIPT_URL}?action=getAll`).then(r => r.json());

            if (result.success && result.data) {
                const currentCount = allData.length;
                const newCount = result.data.length;

                if (newCount !== currentCount) {
                    console.log(`🔔 New update detected! ${currentCount} -> ${newCount}`);

                    const isNewData = newCount > currentCount;

                    localStorage.setItem('dewanData', JSON.stringify(result.data));
                    allData = result.data;
                    DataStore.notify();

                    if (isNewData) {
                        playNotificationSound();
                        showToast(`🔔 ${newCount - currentCount} permohonan/data baru diterima!`);

                        const indicator = document.getElementById('sheets-status-indicator');
                        if (indicator) {
                            indicator.className = 'w-3 h-3 rounded-full bg-blue-500 animate-pulse';
                            setTimeout(() => indicator.className = 'w-3 h-3 rounded-full bg-green-500', 2000);
                        }
                    }
                }
            }
        } catch (err) {
            console.warn('Silent sync warning:', err.message);
        } finally {
            isSyncing = false;
        }
    }, SYNC_INTERVAL);
}

function playNotificationSound() {
    const freshData = DataStore.get();

    const soundFromData = freshData.find(d => d.key === 'portalSoundChoice')?.value;
    const choice = soundFromData || localStorage.getItem('portalSoundChoice') || 'beep';

    const volFromData = freshData.find(d => d.key === 'portalSoundVolume')?.value;
    const volume = (volFromData || localStorage.getItem('portalSoundVolume') || 50) / 100;

    const customUrl = freshData.find(d => d.key === 'portalCustomSoundUrl')?.value || localStorage.getItem('portalCustomSoundUrl');

    try {
        if (choice === 'custom' && customUrl) {
            const audio = new Audio(customUrl);
            audio.volume = volume;
            audio.play().catch(e => console.error('Custom sound audio play failed', e));
        } else if (choice === 'bell') {
            playFreqSound([880, 1046.5], volume, 300);
        } else if (choice === 'modern') {
            playFreqSound([440, 554.37, 659.25], volume, 150, 50);
        } else {
            playFreqSound([500, 800], volume, 200, 50);
        }
    } catch (e) {
        console.error('Core audio play failed', e);
    }
}

function playFreqSound(freqs, volume, duration, gap = 50) {
    try {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        freqs.forEach((freq, idx) => {
            setTimeout(() => {
                const oscillator = audioCtx.createOscillator();
                const gainNode = audioCtx.createGain();
                oscillator.connect(gainNode);
                gainNode.connect(audioCtx.destination);
                oscillator.type = 'sine';
                oscillator.frequency.setValueAtTime(freq, audioCtx.currentTime);
                gainNode.gain.setValueAtTime(volume * 0.2, audioCtx.currentTime); // Normalise volume
                oscillator.start();
                setTimeout(() => oscillator.stop(), duration);
            }, idx * (duration + gap));
        });
    } catch (e) {
        console.warn('Frequency sound failed', e);
    }
}

function testNotificationSound() {
    const choice = document.getElementById('sound-choice').value;
    const volume = document.getElementById('sound-volume').value / 100;
    const customUrl = document.getElementById('custom-sound-url').value;

    if (choice === 'custom' && customUrl) {
        const audio = new Audio(customUrl);
        audio.volume = volume;
        audio.play().catch(e => {
            showToast('❌ Gagal memutar URL audio khas', 'error');
            console.error(e);
        });
    } else if (choice === 'bell') {
        playFreqSound([880, 1046.5], volume, 300);
    } else if (choice === 'modern') {
        playFreqSound([440, 554.37, 659.25], volume, 150, 50);
    } else {
        playFreqSound([500, 800], volume, 200, 50);
    }
}

async function saveSoundSettings() {
    const choice = document.getElementById('sound-choice').value;
    const volume = document.getElementById('sound-volume').value;
    const customUrl = document.getElementById('custom-sound-url').value;

    localStorage.setItem('portalSoundChoice', choice);
    localStorage.setItem('portalSoundVolume', volume);
    localStorage.setItem('portalCustomSoundUrl', customUrl);

    await savePortalSetting('portalSoundChoice', choice);
    await savePortalSetting('portalSoundVolume', volume);
    await savePortalSetting('portalCustomSoundUrl', customUrl);

    showToast('✅ Tetapan bunyi disimpan (Online Sync)!');
}

document.addEventListener('DOMContentLoaded', () => {
    const soundChoice = document.getElementById('sound-choice');
    if (soundChoice) {
        soundChoice.addEventListener('change', function () {
            const container = document.getElementById('custom-sound-container');
            if (this.value === 'custom') {
                container.classList.remove('hidden');
            } else {
                container.classList.add('hidden');
            }
        });
    }

    setTimeout(() => {
        const savedChoice = allData.find(d => d.key === 'portalSoundChoice')?.value || localStorage.getItem('portalSoundChoice');
        if (savedChoice && document.getElementById('sound-choice')) {
            document.getElementById('sound-choice').value = savedChoice;
            if (savedChoice === 'custom') document.getElementById('custom-sound-container').classList.remove('hidden');
        }

        const savedVol = allData.find(d => d.key === 'portalSoundVolume')?.value || localStorage.getItem('portalSoundVolume');
        if (savedVol && document.getElementById('sound-volume')) {
            document.getElementById('sound-volume').value = savedVol;
            document.getElementById('volume-val').textContent = savedVol;
        }

        const savedUrl = allData.find(d => d.key === 'portalCustomSoundUrl')?.value || localStorage.getItem('portalCustomSoundUrl');
        if (savedUrl && document.getElementById('custom-sound-url')) {
            document.getElementById('custom-sound-url').value = savedUrl;
        }
    }, 1000);
});

function generateReferenceNo() {
    const now = new Date();
    const currentYear = now.getFullYear();

    const permohonanTahunIni = allData.filter(d => {
        if (d.type !== 'permohonan' || !d.noPermohonan) return false;
        const parts = d.noPermohonan.split('-');
        return parts.length === 3 && parts[2] === currentYear.toString();
    });

    let nextNumber = 1;
    if (permohonanTahunIni.length > 0) {
        const lastNo = permohonanTahunIni
            .map(d => parseInt(d.noPermohonan.split('-')[1]) || 0)
            .reduce((max, val) => Math.max(max, val), 0);
        nextNumber = lastNo + 1;
    }

    const paddedNo = nextNumber.toString().padStart(3, '0');
    return `DSK-${paddedNo}-${currentYear}`;
}

function attachUserFormHandler() {
    const form = document.getElementById('form-user-permohonan');
    if (!form) return;

    if (form.dataset.attached === 'true') return;
    form.dataset.attached = 'true';

    console.log('📝 User Form Handler Attached');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const btn = document.getElementById('btn-submit-user-permohonan'); // Ensure ID matches your HTML button
        const submitBtn = btn || form.querySelector('button[type="submit"]');

        const originalText = submitBtn ? submitBtn.innerHTML : 'Hantar';
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.textContent = 'Menghantar...';
        }

        try {
            const id = Date.now().toString();
            const noPermohonan = generateReferenceNo();

            const permohonan = {
                type: 'permohonan',
                __backendId: id,
                noPermohonan: noPermohonan,
                nama: document.getElementById('user-nama-pemohon').value,
                email: document.getElementById('user-email-pemohon').value,
                nomorTelefon: document.getElementById('user-nombor-telefon').value,
                cawangan: document.getElementById('user-cawangan').value,
                jenisPermohonan: document.getElementById('user-jenis-permohonan-hidden').value,
                tujuan: document.getElementById('user-tujuan').value,
                tarikhMulaPinjam: document.getElementById('user-tarikh-mula').value,
                tarikhPulang: document.getElementById('user-tarikh-pulang').value,
                itemsData: document.getElementById('user-items-data-hidden').value,
                items: document.getElementById('user-item-dipinjam-hidden').value,
                status: 'Dalam Proses',
                createdAt: new Date().toISOString()
            };

            console.log('🚀 Submitting User Permohonan:', permohonan);

            await DataStore.add(permohonan);

            form.classList.add('hidden');
            const successContainer = document.getElementById('user-success-container');
            if (successContainer) {
                successContainer.classList.remove('hidden');

                const refEl = document.getElementById('success-no-permohonan');
                if (refEl) {
                    refEl.textContent = noPermohonan;
                } else {
                    const p = document.createElement('p');
                    p.innerHTML = `<br>No. Rujukan: <strong class="text-2xl text-indigo-600">${noPermohonan}</strong>`;
                    const btnContainer = successContainer.querySelector('div.mt-10') || successContainer.lastElementChild;
                    successContainer.insertBefore(p, btnContainer);
                }
            }

            form.reset();

        } catch (error) {
            console.error('Submit Error:', error);
            showToast('❌ Gagal menghantar permohonan. Sila cuba lagi.');
        } finally {
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalText;
            }
        }
    });
}

document.addEventListener('DOMContentLoaded', () => {
    const formKategori = document.getElementById('form-kategori');
    if (formKategori) {
        formKategori.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = document.getElementById('btn-submit-kategori');
            const editId = document.getElementById('kategori-id').value;

            btn.disabled = true;
            btn.textContent = 'Menyimpan...';

            const data = {
                type: 'kategori',
                namaKategori: document.getElementById('nama-kategori').value,
                createdAt: new Date().toISOString()
            };

            let result;
            if (editId) {
                result = await DataStore.update(editId, data);
            } else {
                result = await DataStore.add(data);
            }

            if (result.isOk) {
                showToast(editId ? 'Kategori berjaya dikemaskini!' : 'Kategori berjaya ditambah!');
                closeModal('modal-kategori');
                formKategori.reset();
                document.getElementById('kategori-id').value = '';
            }
            btn.disabled = false;
            btn.textContent = 'Simpan';
        });
    }

    const formPeralatan = document.getElementById('form-peralatan');
    if (formPeralatan) {
        formPeralatan.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = document.getElementById('btn-submit-peralatan');
            const editId = document.getElementById('peralatan-id').value;

            btn.disabled = true;
            btn.textContent = 'Menyimpan...';

            const addedBaru = parseInt(document.getElementById('tambah-baru').value) || 0;
            const addedRosak = parseInt(document.getElementById('item-rosak').value) || 0;

            let existing = null;
            if (editId) {
                existing = allData.find(d => String(d.__backendId) === String(editId));
            }

            const now = new Date().toISOString();

            let currentTotal = existing ? (parseInt(existing.kuantiti) || 0) : 0;
            let totalBaru = existing ? (parseInt(existing.totalBaru) || 0) : 0;
            let totalRosak = existing ? (parseInt(existing.totalRosak) || 0) : 0;

            let lastUpdateBaru = existing ? existing.lastUpdateBaru : null;
            let lastUpdateRosak = existing ? existing.lastUpdateRosak : null;
            let lastUpdateJumlah = existing ? existing.lastUpdateJumlah : null;

            if (addedBaru > 0) {
                currentTotal += addedBaru;
                totalBaru += addedBaru;
                lastUpdateBaru = now;
                lastUpdateJumlah = now;

                if (editId) {
                    await DataStore.add({
                        type: 'log_stok',
                        peralatanId: editId,
                        namaPeralatan: document.getElementById('nama-peralatan').value,
                        jenisPerubahan: 'Tambah Stok',
                        kuantiti: addedBaru,
                        catatan: 'Penambahan stok manual',
                        timestamp: now
                    });
                }
            }

            if (addedRosak > 0) {
                currentTotal = Math.max(0, currentTotal - addedRosak);
                totalRosak += addedRosak;
                lastUpdateRosak = now;
                lastUpdateJumlah = now;

                if (editId) {
                    await DataStore.add({
                        type: 'log_stok',
                        peralatanId: editId,
                        namaPeralatan: document.getElementById('nama-peralatan').value,
                        jenisPerubahan: 'Lapor Rosak',
                        kuantiti: addedRosak,
                        catatan: 'Dilaporkan rosak',
                        timestamp: now
                    });
                }
            }

            const data = {
                type: 'peralatan',
                kategori: document.getElementById('kategori-peralatan').value,
                namaPeralatan: document.getElementById('nama-peralatan').value,
                kuantiti: currentTotal,
                kuantitiTersedia: currentTotal, // Will be recalculated by sync logic anyway
                totalBaru: totalBaru,
                totalRosak: totalRosak,
                lastUpdateBaru: lastUpdateBaru,
                lastUpdateRosak: lastUpdateRosak,
                lastUpdateJumlah: lastUpdateJumlah,
                createdAt: existing ? existing.createdAt : now
            };

            let result;
            if (editId) {
                result = await DataStore.update(editId, data);
            } else {
                data.totalBaru = data.kuantiti;
                data.lastUpdateBaru = now;
                data.lastUpdateJumlah = now;
                result = await DataStore.add(data);

                await DataStore.add({
                    type: 'log_stok',
                    peralatanId: data.__backendId,
                    namaPeralatan: data.namaPeralatan,
                    jenisPerubahan: 'Item Baru',
                    kuantiti: data.kuantiti,
                    catatan: 'Pendaftaran item baru',
                    timestamp: now
                });
            }

            if (result.isOk) {
                showToast(editId ? 'Peralatan dikemaskini!' : 'Peralatan berjaya ditambah!');
                closeModal('modal-peralatan');
                formPeralatan.reset();
                document.getElementById('peralatan-id').value = '';

                renderPeralatan();
                if (typeof renderLaporan === 'function') renderLaporan();
            }
            btn.disabled = false;
            btn.textContent = editId ? 'Kemaskini' : 'Simpan';
        });
    }
});

async function saveSecuritySettings() {
    const duration = parseInt(document.getElementById('auto-logout-duration').value);

    if (isNaN(duration) || duration < 10) {
        showToast('❌ Tempoh minimum adalah 10 saat', 'error');
        return;
    }

    localStorage.setItem('portalAutoLogout', duration);

    timeoutLimit = duration * 1000;
    reminderTime = timeoutLimit > 20000 ? timeoutLimit - 10000 : timeoutLimit * 0.7;

    if (typeof savePortalSetting === 'function') {
        await savePortalSetting('portalAutoLogout', duration);
    }

    showToast('✅ Tetapan keselamatan disimpan! Timer dimulakan semula.');

    resetIdleTimer();
}

document.addEventListener('DOMContentLoaded', () => {
    const savedDuration = localStorage.getItem('portalAutoLogout') || "30";
    const durationInput = document.getElementById('auto-logout-duration');
    if (durationInput) {
        durationInput.value = savedDuration;
    }
});

document.addEventListener('DOMContentLoaded', attachUserFormHandler);


/* --- SHARE LINK & QR CODE --- */

function initShareLink() {
    const baseUrl = window.location.origin + window.location.pathname;
    const shareUrl = `${baseUrl}#user=true`;

    const input = document.getElementById('sharelink-url');
    const img = document.getElementById('share-qr-img');

    if (input) {
        input.value = shareUrl;
    }

    if (img) {
        // Use QR Server API
        const qrApi = `https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=${encodeURIComponent(shareUrl)}`;
        img.src = qrApi;
    }
}

function copySharelink() {
    const input = document.getElementById('sharelink-url');
    if (!input) return;

    input.select();
    input.setSelectionRange(0, 99999);

    try {
        navigator.clipboard.writeText(input.value).then(() => {
            showToast('✅ Link berjaya disalin!');
        });
    } catch (err) {
        document.execCommand('copy');
        showToast('✅ Link berjaya disalin!');
    }
}

function downloadShareQR() {
    const img = document.getElementById('share-qr-img');
    if (!img || !img.src) {
        showToast('QR Code belum sedia');
        return;
    }

    const qrUrl = img.src;

    fetch(qrUrl)
        .then(response => response.blob())
        .then(blob => {
            const blobUrl = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = blobUrl;
            a.download = 'borang-qr-code.png';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(blobUrl);
            showToast('✅ QR Code sedang dimuat turun...');
        })
        .catch(() => {
            window.open(qrUrl, '_blank');
            showToast('⚠️ Gagal auto-download. Sila "Save Image As" di tab baru.');
        });
}

// Ensure initShareLink is called when opening modal
if (typeof window.openModal !== 'undefined') {
    const originalOpenModal = window.openModal;
    window.openModal = function (id) {
        originalOpenModal(id);
        if (id === 'modal-sharelink') initShareLink();
    };
}


/* --- SHARE LINK TRIGGER --- */
function showSharelinkInfo() {
    // Open the modal using available method
    if (typeof openModal === 'function') {
        openModal('modal-sharelink');
    } else if (typeof window.openModal === 'function') {
        window.openModal('modal-sharelink');
    } else {
        const m = document.getElementById('modal-sharelink');
        if (m) m.classList.remove('hidden');
    }

    // Initialize content
    if (typeof initShareLink === 'function') {
        initShareLink();
    }
}


function previewUserForm() {
    const baseUrl = window.location.origin + window.location.pathname;
    window.open(baseUrl + '#user=true', '_blank');
}
