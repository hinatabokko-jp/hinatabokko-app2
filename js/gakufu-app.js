import { db, auth } from "./config.js";
import { ref, onValue, set, update, remove, get } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";
import { signInAnonymously, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

/* ==========================================================================
   1. MEMO.html 共通あいことば認証 ＆ Firebase Realtime Database 接続
   ========================================================================== */
const gakufuFoldersRef = ref(db, "gakufu_folders");
const settingsPassRef = ref(db, "settings/passcode");
const roomLockRef = ref(db, "app_settings/room_lock");
const usersRef = ref(db, "users");

const DEVICE_ID_KEY = "memo_app_device_id";
const AUTO_LOGIN_KEY = "memo_app_auto_login";
const ADMIN_ID = "admin";
const ADMIN_PASS = "admin1234";

// タブレット画面で綺麗に見え、かつ容量を抑えるサイズ設定（長辺最大1536px / JPEG品質0.80）
const TABLET_MAX_SIDE = 1536;
const TABLET_JPEG_QUALITY = 0.8;

// 端末内画像保存用 IndexedDB 設定
const IDB_NAME = "ScoreStageLocalImagesDB";
const IDB_VERSION = 1;
const IDB_STORE_IMAGES = "images";

function openImageDb() {
    return new Promise((resolve, reject) => {
        const req = indexedDB.open(IDB_NAME, IDB_VERSION);
        req.onupgradeneeded = (e) => {
            const database = e.target.result;
            if (!database.objectStoreNames.contains(IDB_STORE_IMAGES)) {
                const store = database.createObjectStore(IDB_STORE_IMAGES, { keyPath: "pageId" });
                store.createIndex("folderId", "folderId", { unique: false });
            }
        };
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error || new Error("IndexedDBを開けませんでした"));
    });
}

async function saveLocalImageBlob(pageId, folderId, blob) {
    const database = await openImageDb();
    return new Promise((resolve, reject) => {
        const tx = database.transaction(IDB_STORE_IMAGES, "readwrite");
        tx.objectStore(IDB_STORE_IMAGES).put({
            pageId: String(pageId),
            folderId: String(folderId),
            blob,
            savedAt: Date.now()
        });
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error || new Error("端末への画像保存に失敗しました"));
    });
}

async function getLocalImagesByFolder(folderId) {
    const database = await openImageDb();
    return new Promise((resolve, reject) => {
        const tx = database.transaction(IDB_STORE_IMAGES, "readonly");
        const index = tx.objectStore(IDB_STORE_IMAGES).index("folderId");
        const req = index.getAll(String(folderId));
        req.onsuccess = () => {
            const map = new Map();
            (req.result || []).forEach((item) => {
                if (item && item.pageId && item.blob) {
                    map.set(item.pageId, item.blob);
                }
            });
            resolve(map);
        };
        req.onerror = () => reject(req.error || new Error("端末画像の読み込みに失敗しました"));
    });
}

async function deleteLocalImage(pageId) {
    const database = await openImageDb();
    return new Promise((resolve) => {
        const tx = database.transaction(IDB_STORE_IMAGES, "readwrite");
        tx.objectStore(IDB_STORE_IMAGES).delete(String(pageId));
        tx.oncomplete = () => resolve();
        tx.onerror = () => resolve();
    });
}

async function deleteLocalImagesByFolder(folderId) {
    const database = await openImageDb();
    return new Promise((resolve) => {
        const tx = database.transaction(IDB_STORE_IMAGES, "readwrite");
        const store = tx.objectStore(IDB_STORE_IMAGES);
        const index = store.index("folderId");
        const req = index.getAllKeys(String(folderId));
        req.onsuccess = () => {
            (req.result || []).forEach((key) => store.delete(key));
        };
        tx.oncomplete = () => resolve();
        tx.onerror = () => resolve();
    });
}

function getDeviceId() {
    let id = localStorage.getItem(DEVICE_ID_KEY);
    if (!id) {
        id = "dev_" + Date.now() + "_" + Math.random().toString(36).substring(2, 9);
        localStorage.setItem(DEVICE_ID_KEY, id);
    }
    return id;
}

let currentPasscode = "1234";
let isRoomLocked = false;
let isAuthenticated = false;
let foldersListenerAttached = false;

let folders = [];           // [{ id, name, note, pageOrder: [pageId1...], pagesMeta: { [pageId]: {...} }, updatedAt }]
let currentFolderId = null;
let currentPages = [];      // [{ id, folderId, name, url, width, height, sizeBytes, hasLocalImage }]
let activeObjectUrls = [];  // メモリ解放用 ObjectURL リスト

// ビューワー状態
let currentPageIndex = 0;
let isSpreadMode = false;
let isChromeVisible = true;

// メトロノーム状態
let audioCtx = null;
let metronomeTimer = null;
let isMetronomePlaying = false;
let metroBpm = 100;

function revokeActiveObjectUrls() {
    activeObjectUrls.forEach((url) => {
        try {
            URL.revokeObjectURL(url);
        } catch (_) {}
    });
    activeObjectUrls = [];
}

// 初期化
window.addEventListener("DOMContentLoaded", () => {
    initFirebaseAuthAndListeners();
    setupLoginEvents();
    setupViewerGestures();
});

function initFirebaseAuthAndListeners() {
    onAuthStateChanged(auth, async (user) => {
        if (!user) {
            signInAnonymously(auth).catch((err) => {
                console.error("Anonymous auth error:", err);
                showToast("Firebase認証エラー: " + err.message, "error");
            });
            return;
        }

        // あいことば監視
        onValue(settingsPassRef, (snap) => {
            if (snap.exists() && snap.val()) {
                currentPasscode = String(snap.val());
            }
        });

        // ルームロック状態監視
        onValue(roomLockRef, (snap) => {
            isRoomLocked = snap.exists() ? Boolean(snap.val()) : false;
            const toggle = document.getElementById("room-lock-toggle");
            if (toggle) toggle.checked = isRoomLocked;
        });

        // 自動ログイン判定
        if (localStorage.getItem(AUTO_LOGIN_KEY) === "true" && !isAuthenticated) {
            const allowed = await registerOrCheckDeviceAccess();
            if (allowed) {
                enterApp();
            }
        }
    });

    if (!auth.currentUser) {
        signInAnonymously(auth).catch((err) => {
            console.error("Anonymous auth error:", err);
            showToast("Firebase認証エラー: " + err.message, "error");
        });
    }
}

async function ensureAuthenticatedForDb() {
    if (auth.currentUser) return true;
    try {
        await signInAnonymously(auth);
        return Boolean(auth.currentUser);
    } catch (err) {
        console.error("Auth retry failed:", err);
        showToast("通信認証に失敗しました: " + err.message, "error");
        return false;
    }
}

async function registerOrCheckDeviceAccess() {
    await ensureAuthenticatedForDb();
    const devId = getDeviceId();
    const userRef = ref(db, `users/${devId}`);
    try {
        const snap = await get(userRef);
        if (snap.exists()) {
            const userData = snap.val();
            if (userData.blocked) {
                showToast("この端末はアクセスが制限されています", "error");
                return false;
            }
            await update(userRef, { lastAccess: Date.now() });
            return true;
        } else {
            if (isRoomLocked) {
                showToast("現在、新規端末の入室はロックされています", "error");
                return false;
            }
            await set(userRef, {
                id: devId,
                name: navigator.userAgent.includes("iPad") ? "iPad" : "端末 (" + devId.slice(-4) + ")",
                blocked: false,
                createdAt: Date.now(),
                lastAccess: Date.now()
            });
            return true;
        }
    } catch (e) {
        console.error(e);
        return true;
    }
}

function setupLoginEvents() {
    const passInput = document.getElementById("pass-input");
    const passBtn = document.getElementById("pass-btn");
    const passError = document.getElementById("pass-error");
    const rememberCheck = document.getElementById("remember-me-checkbox");

    if (localStorage.getItem(AUTO_LOGIN_KEY) === "true") {
        rememberCheck.checked = true;
    }

    const attemptLogin = async () => {
        const entered = passInput.value.trim();
        passError.style.display = "none";

        await ensureAuthenticatedForDb();

        try {
            const snap = await get(settingsPassRef);
            if (snap.exists() && snap.val()) {
                currentPasscode = String(snap.val());
            }
        } catch (_) {}

        if (entered === currentPasscode) {
            const allowed = await registerOrCheckDeviceAccess();
            if (!allowed) return;

            if (rememberCheck.checked) {
                localStorage.setItem(AUTO_LOGIN_KEY, "true");
            } else {
                localStorage.removeItem(AUTO_LOGIN_KEY);
            }
            passInput.value = "";
            enterApp();
        } else {
            passError.style.display = "block";
        }
    };

    passBtn.addEventListener("click", attemptLogin);
    passInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") attemptLogin();
    });

    // 管理画面ログインモーダル
    const openAdminBtn = document.getElementById("open-admin-login-modal");
    const adminLoginModal = document.getElementById("admin-login-modal");
    const adminLoginCloseX = document.getElementById("admin-login-close-x");
    const adminLoginSubmit = document.getElementById("admin-login-submit");
    const adminPanelModal = document.getElementById("admin-panel-modal");

    openAdminBtn.addEventListener("click", () => {
        document.getElementById("admin-login-error").style.display = "none";
        adminLoginModal.classList.add("active");
    });
    adminLoginCloseX.addEventListener("click", () => adminLoginModal.classList.remove("active"));

    adminLoginSubmit.addEventListener("click", () => {
        const idVal = document.getElementById("admin-id-input").value.trim();
        const pwVal = document.getElementById("admin-pass-input").value.trim();
        if (idVal === ADMIN_ID && pwVal === ADMIN_PASS) {
            adminLoginModal.classList.remove("active");
            document.getElementById("admin-id-input").value = "";
            document.getElementById("admin-pass-input").value = "";
            openAdminPanel();
        } else {
            document.getElementById("admin-login-error").style.display = "block";
        }
    });

    document.getElementById("admin-panel-close-x").addEventListener("click", () => adminPanelModal.classList.remove("active"));
    document.getElementById("admin-panel-close-btn").addEventListener("click", () => adminPanelModal.classList.remove("active"));

    // あいことば変更
    document.getElementById("update-passcode-btn").addEventListener("click", async () => {
        const newCode = document.getElementById("new-passcode-input").value.trim();
        if (!newCode) return;
        await ensureAuthenticatedForDb();
        await set(settingsPassRef, newCode);
        document.getElementById("new-passcode-input").value = "";
        showToast("あいことばを変更しました", "success");
    });

    // ルームロック切替
    document.getElementById("room-lock-toggle").addEventListener("change", async (e) => {
        await ensureAuthenticatedForDb();
        await set(roomLockRef, e.target.checked);
        showToast(e.target.checked ? "新規ロックを有効にしました" : "新規ロックを解除しました", "info");
    });
}

function openAdminPanel() {
    const adminPanelModal = document.getElementById("admin-panel-modal");
    adminPanelModal.classList.add("active");

    onValue(usersRef, (snap) => {
        const listEl = document.getElementById("admin-users-list");
        listEl.innerHTML = "";
        if (!snap.exists()) {
            listEl.innerHTML = '<div class="text-xs text-zinc-400">登録済み端末はありません</div>';
            return;
        }
        const usersObj = snap.val();
        Object.values(usersObj).forEach((u) => {
            const row = document.createElement("div");
            row.className = "admin-user-row";
            row.innerHTML = `
                <div>
                    <div style="font-weight: 600; font-size: 0.9rem;">${escapeHtml(u.name || u.id)}</div>
                    <div style="font-size: 0.72rem; color: var(--text-muted);">${u.id}</div>
                </div>
                <button class="secondary-btn" style="font-size: 0.75rem; ${u.blocked ? 'color: #34d399;' : 'color: #fb7185;'}">
                    ${u.blocked ? "ブロック解除" : "ブロック"}
                </button>
            `;
            row.querySelector("button").onclick = async () => {
                await ensureAuthenticatedForDb();
                await update(ref(db, `users/${u.id}`), { blocked: !u.blocked });
            };
            listEl.appendChild(row);
        });
    });
}

function enterApp() {
    isAuthenticated = true;
    document.getElementById("lock-screen").style.display = "none";
    document.getElementById("library-view").classList.remove("hidden");
    document.getElementById("library-view").classList.add("flex");
    attachFoldersListener();
}

window.lockApp = function () {
    closeViewer();
    revokeActiveObjectUrls();
    isAuthenticated = false;
    localStorage.removeItem(AUTO_LOGIN_KEY);
    document.getElementById("remember-me-checkbox").checked = false;
    document.getElementById("library-view").classList.add("hidden");
    document.getElementById("folder-detail-view").classList.add("hidden");
    document.getElementById("lock-screen").style.display = "flex";
};

/* ==========================================================================
   2. 楽曲フォルダー管理（Firebase Realtime Database 同期）
   ========================================================================== */
function normalizeFolderRecord(key, raw) {
    const folder = raw && typeof raw === "object" ? { ...raw } : {};
    folder.id = String(folder.id || key);
    folder.name = String(folder.name || "無題の曲");
    folder.note = String(folder.note || "");
    folder.pageOrder = Array.isArray(folder.pageOrder)
        ? folder.pageOrder.map((id) => String(id))
        : (folder.pageOrder && typeof folder.pageOrder === "object" ? Object.values(folder.pageOrder).map((id) => String(id)) : []);
    folder.pagesMeta = (folder.pagesMeta && typeof folder.pagesMeta === "object") ? folder.pagesMeta : {};
    folder.updatedAt = Number(folder.updatedAt || 0);
    return folder;
}

function attachFoldersListener() {
    if (foldersListenerAttached) return;
    foldersListenerAttached = true;

    onValue(gakufuFoldersRef, async (snapshot) => {
        const data = snapshot.val();
        if (!data || typeof data !== "object") {
            folders = [];
        } else {
            folders = Object.entries(data)
                .map(([key, val]) => normalizeFolderRecord(key, val))
                .sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
        }
        renderFolders();

        // フォルダー詳細画面を開いている場合は最新の曲名・ページ順を反映
        if (currentFolderId) {
            const current = folders.find((f) => f.id === currentFolderId);
            if (current) {
                document.getElementById("detail-folder-title").textContent = current.name;
                await syncCurrentFolderPagesView();
            } else {
                backToLibrary();
            }
        }
    }, (err) => {
        console.error("Folders listener error:", err);
        showToast("フォルダー同期エラー: " + err.message, "error");
    });
}

window.renderFolders = function () {
    const grid = document.getElementById("folders-grid");
    const emptyState = document.getElementById("empty-folders-state");
    const query = document.getElementById("search-input").value.trim().toLowerCase();

    document.getElementById("folder-count-label").textContent = `${folders.length}曲の楽譜を管理中`;

    const filtered = folders.filter((f) =>
        (f.name && f.name.toLowerCase().includes(query)) ||
        (f.note && f.note.toLowerCase().includes(query))
    );

    grid.innerHTML = "";

    if (filtered.length === 0) {
        emptyState.classList.remove("hidden");
        emptyState.classList.add("flex");
        return;
    }

    emptyState.classList.add("hidden");
    emptyState.classList.remove("flex");

    filtered.forEach((folder) => {
        const pageCount = Array.isArray(folder.pageOrder) ? folder.pageOrder.length : 0;
        const card = document.createElement("div");
        card.className = "glass rounded-3xl p-5 flex flex-col justify-between hover:border-blue-500/40 transition group cursor-pointer active:scale-[0.99]";
        card.onclick = (e) => {
            if (e.target.closest("button")) return;
            openFolderDetail(folder.id);
        };

        card.innerHTML = `
            <div>
                <div class="flex items-start justify-between gap-3 mb-3">
                    <div class="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500/20 to-indigo-500/20 border border-blue-400/20 flex items-center justify-center text-blue-400 shrink-0">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2z"/>
                        </svg>
                    </div>
                    <span class="px-3 py-1 rounded-full text-xs font-bold ${pageCount > 0 ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/25' : 'bg-zinc-800 text-zinc-400'}">
                        ${pageCount} ページ
                    </span>
                </div>
                <h3 class="text-lg font-bold text-white line-clamp-2 mb-1 group-hover:text-blue-300 transition">${escapeHtml(folder.name)}</h3>
                <p class="text-xs text-zinc-400 line-clamp-1 min-h-[1.25rem]">${folder.note ? escapeHtml(folder.note) : 'メモなし'}</p>
            </div>

            <div class="flex items-center justify-between pt-4 mt-4 border-t border-white/10">
                <span class="text-xs font-semibold text-blue-400 flex items-center gap-1">
                    <span>フォルダーを開く</span>
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"/></svg>
                </span>
                <div class="flex items-center gap-1">
                    <button onclick="openFolderModal('${folder.id}')" class="p-2.5 rounded-xl text-zinc-400 hover:text-white hover:bg-white/10 transition" title="名前変更">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/></svg>
                    </button>
                    <button onclick="deleteFolder('${folder.id}')" class="p-2.5 rounded-xl text-zinc-400 hover:text-red-400 hover:bg-red-500/10 transition" title="フォルダー削除">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                    </button>
                </div>
            </div>
        `;
        grid.appendChild(card);
    });
};

window.openFolderModal = function (folderId = null) {
    const modal = document.getElementById("folder-modal");
    const titleEl = document.getElementById("folder-modal-title");
    const idInput = document.getElementById("edit-folder-id");
    const nameInput = document.getElementById("folder-name-input");
    const noteInput = document.getElementById("folder-note-input");

    if (folderId) {
        const folder = folders.find((f) => f.id === folderId);
        if (!folder) return;
        titleEl.textContent = "フォルダー情報の編集";
        idInput.value = folder.id;
        nameInput.value = folder.name;
        noteInput.value = folder.note || "";
    } else {
        titleEl.textContent = "新規楽曲フォルダー";
        idInput.value = "";
        nameInput.value = "";
        noteInput.value = "";
    }

    modal.classList.remove("hidden");
    modal.classList.add("flex");
    setTimeout(() => nameInput.focus(), 100);
};

window.closeFolderModal = function () {
    const modal = document.getElementById("folder-modal");
    modal.classList.add("hidden");
    modal.classList.remove("flex");
};

window.saveFolderForm = async function (e) {
    e.preventDefault();
    await ensureAuthenticatedForDb();
    const id = String(document.getElementById("edit-folder-id").value || "");
    const name = document.getElementById("folder-name-input").value.trim();
    const note = document.getElementById("folder-note-input").value.trim();
    if (!name) return;

    try {
        if (id) {
            await set(ref(db, `gakufu_folders/${id}/name`), name);
            await set(ref(db, `gakufu_folders/${id}/note`), note);
            await set(ref(db, `gakufu_folders/${id}/updatedAt`), Date.now());
            if (currentFolderId === id) {
                document.getElementById("detail-folder-title").textContent = name;
            }
            showToast("フォルダーを更新しました", "success");
        } else {
            const newId = "fld_" + Date.now() + "_" + Math.random().toString(36).slice(2, 7);
            const newFolder = {
                id: newId,
                name,
                note,
                pageOrder: [],
                pagesMeta: {},
                updatedAt: Date.now()
            };
            await set(ref(db, `gakufu_folders/${newId}`), newFolder);
            showToast(`「${name}」を作成しました`, "success");
        }
        closeFolderModal();
    } catch (err) {
        console.error(err);
        showToast("保存に失敗しました: " + err.message, "error");
    }
};

window.deleteFolder = function (folderId) {
    const folder = folders.find((f) => f.id === folderId);
    if (!folder) return;

    showConfirm(
        "フォルダーの削除",
        `「${folder.name}」と中の楽譜ページをすべて削除しますか？この操作は取り消せません。`,
        async () => {
            await ensureAuthenticatedForDb();
            try {
                await remove(ref(db, `gakufu_folders/${folderId}`));
                await remove(ref(db, `gakufu_pages/${folderId}`));
                await deleteLocalImagesByFolder(folderId);
                showToast("フォルダーを削除しました", "info");
            } catch (err) {
                showToast("削除に失敗しました: " + err.message, "error");
            }
        }
    );
};

/* ==========================================================================
   3. フォルダー詳細・JPG縮小保存（IndexedDB）＆ 曲順同期（Firebase）
   ========================================================================== */
window.openFolderDetail = async function (folderId) {
    currentFolderId = String(folderId);
    const folder = folders.find((f) => f.id === currentFolderId);
    if (!folder) return;

    document.getElementById("library-view").classList.add("hidden");
    document.getElementById("folder-detail-view").classList.remove("hidden");
    document.getElementById("folder-detail-view").classList.add("flex");

    document.getElementById("detail-folder-title").textContent = folder.name;
    await syncCurrentFolderPagesView();
};

window.backToLibrary = function () {
    revokeActiveObjectUrls();
    currentFolderId = null;
    currentPages = [];
    document.getElementById("folder-detail-view").classList.add("hidden");
    document.getElementById("library-view").classList.remove("hidden");
    renderFolders();
};

window.editCurrentFolder = function () {
    if (currentFolderId) openFolderModal(currentFolderId);
};

async function syncCurrentFolderPagesView() {
    if (!currentFolderId) return;
    const folder = folders.find((f) => f.id === currentFolderId);
    if (!folder) return;

    try {
        const localBlobMap = await getLocalImagesByFolder(currentFolderId);
        const metaMap = folder.pagesMeta || {};

        // Firebase側の pageOrder を正とし、もしローカルのみにあるIDがあれば末尾に補完
        const orderIds = [...(folder.pageOrder || [])];
        localBlobMap.forEach((_, pid) => {
            if (!orderIds.includes(pid)) {
                orderIds.push(pid);
            }
        });

        revokeActiveObjectUrls();
        const assembled = [];

        orderIds.forEach((pid, idx) => {
            const blob = localBlobMap.get(pid) || null;
            const meta = metaMap[pid] || {};
            let url = "";
            if (blob) {
                url = URL.createObjectURL(blob);
                activeObjectUrls.push(url);
            }
            assembled.push({
                id: String(pid),
                folderId: currentFolderId,
                name: String(meta.name || `楽譜ページ_${idx + 1}.jpg`),
                width: Number(meta.width || 0),
                height: Number(meta.height || 0),
                sizeBytes: Number(meta.sizeBytes || (blob ? blob.size : 0)),
                url,
                hasLocalImage: Boolean(blob)
            });
        });

        currentPages = assembled;
        renderPagesGrid();

        const viewerOpen = !document.getElementById("viewer-overlay").classList.contains("hidden");
        if (viewerOpen && currentPages.length > 0) {
            if (currentPageIndex >= currentPages.length) {
                currentPageIndex = currentPages.length - 1;
            }
            renderViewerPage();
        }
    } catch (err) {
        console.error(err);
        showToast("楽譜ページの読み込みに失敗しました: " + err.message, "error");
    }
}

// タブレット画面で綺麗に見えるサイズまで縮小してJPEG Blobを生成
function resizeJpgToBlobForTablet(file, maxSide = TABLET_MAX_SIDE, quality = TABLET_JPEG_QUALITY) {
    return new Promise((resolve, reject) => {
        const sourceUrl = URL.createObjectURL(file);
        const img = new Image();

        img.onload = () => {
            URL.revokeObjectURL(sourceUrl);
            let targetW = img.naturalWidth || img.width;
            let targetH = img.naturalHeight || img.height;

            if (!targetW || !targetH) {
                reject(new Error(`画像サイズを取得できませんでした: ${file.name}`));
                return;
            }

            const longest = Math.max(targetW, targetH);
            if (longest > maxSide) {
                const scale = maxSide / longest;
                targetW = Math.round(targetW * scale);
                targetH = Math.round(targetH * scale);
            }

            const canvas = document.createElement("canvas");
            canvas.width = targetW;
            canvas.height = targetH;

            const ctx = canvas.getContext("2d");
            ctx.fillStyle = "#FFFFFF";
            ctx.fillRect(0, 0, targetW, targetH);
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = "high";
            ctx.drawImage(img, 0, 0, targetW, targetH);

            canvas.toBlob((blob) => {
                if (!blob) {
                    reject(new Error(`画像の圧縮に失敗しました: ${file.name}`));
                    return;
                }
                resolve({
                    blob,
                    width: targetW,
                    height: targetH,
                    sizeBytes: blob.size
                });
            }, "image/jpeg", quality);
        };

        img.onerror = () => {
            URL.revokeObjectURL(sourceUrl);
            reject(new Error(`画像の読み込みに失敗しました: ${file.name}`));
        };

        img.src = sourceUrl;
    });
}

function formatFileSize(bytes) {
    if (!bytes || bytes <= 0) return "";
    if (bytes < 1024 * 1024) {
        return `${Math.round(bytes / 1024)}KB`;
    }
    return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
}

// JPGファイル追加処理
window.handleJpgUpload = async function (event) {
    const files = Array.from(event.target.files || []);
    event.target.value = "";
    if (!files.length || !currentFolderId) return;

    const jpgFiles = files.filter((f) =>
        f.type === "image/jpeg" || f.type === "image/jpg" || /\.(jpe?g)$/i.test(f.name)
    );

    if (jpgFiles.length === 0) {
        showToast("JPG形式の画像ファイルを選択してください", "error");
        return;
    }

    jpgFiles.sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: "base" }));
    await importAndSaveJpgFiles(jpgFiles);
};

async function importAndSaveJpgFiles(files) {
    await ensureAuthenticatedForDb();

    const progressOverlay = document.getElementById("upload-progress-overlay");
    const progressTitle = document.getElementById("upload-progress-title");
    const progressText = document.getElementById("upload-progress-text");
    const progressBar = document.getElementById("upload-progress-bar");

    progressTitle.textContent = "タブレット向けに縮小して端末へ保存中...";
    progressOverlay.classList.remove("hidden");
    progressOverlay.classList.add("flex");

    let totalOriginalBytes = 0;
    let totalCompressedBytes = 0;

    try {
        const folder = folders.find((f) => f.id === currentFolderId);
        if (!folder) throw new Error("フォルダーが見つかりません");

        const nextOrder = Array.isArray(folder.pageOrder) ? [...folder.pageOrder] : [];
        const nextMeta = { ...(folder.pagesMeta || {}) };

        // もし別端末で作られた「未保存ページ（同名ファイル）」が既にある場合は、そのページIDに画像を紐づける
        const existingMissingByName = new Map();
        currentPages.forEach((p) => {
            if (!p.hasLocalImage && p.name) {
                existingMissingByName.set(p.name, p.id);
            }
        });

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            totalOriginalBytes += file.size || 0;

            progressText.textContent = `${i + 1} / ${files.length} ページ処理中... (${file.name})`;
            progressBar.style.width = `${Math.round(((i + 0.4) / files.length) * 100)}%`;

            const processed = await resizeJpgToBlobForTablet(file, TABLET_MAX_SIDE, TABLET_JPEG_QUALITY);
            totalCompressedBytes += processed.sizeBytes;

            const matchedMissingId = existingMissingByName.get(file.name);
            const pageId = matchedMissingId || ("pg_" + Date.now() + "_" + i + "_" + Math.random().toString(36).slice(2, 6));

            if (matchedMissingId) {
                existingMissingByName.delete(file.name);
            } else {
                nextOrder.push(pageId);
            }

            // 画像本体（Blob）は端末の IndexedDB に保存
            await saveLocalImageBlob(pageId, currentFolderId, processed.blob);

            // 軽量なメタ情報のみ Firebase 用オブジェクトへ格納
            nextMeta[pageId] = {
                id: String(pageId),
                name: String(file.name),
                width: Number(processed.width),
                height: Number(processed.height),
                sizeBytes: Number(processed.sizeBytes),
                createdAt: Date.now()
            };

            progressBar.style.width = `${Math.round(((i + 1) / files.length) * 100)}%`;
        }

        const nextUpdatedAt = Date.now();
        folder.pageOrder = nextOrder;
        folder.pagesMeta = nextMeta;
        folder.updatedAt = nextUpdatedAt;

        // Firebase には軽量な曲順配列とメタ情報だけを個別に保存（スタック超過やパスエラーを完全防止）
        await set(ref(db, `gakufu_folders/${currentFolderId}/pageOrder`), nextOrder);
        await set(ref(db, `gakufu_folders/${currentFolderId}/pagesMeta`), nextMeta);
        await set(ref(db, `gakufu_folders/${currentFolderId}/updatedAt`), nextUpdatedAt);

        await syncCurrentFolderPagesView();

        progressOverlay.classList.add("hidden");
        progressOverlay.classList.remove("flex");

        const savedSummary = totalOriginalBytes > totalCompressedBytes
            ? `（${formatFileSize(totalOriginalBytes)} → ${formatFileSize(totalCompressedBytes)}）`
            : `（${formatFileSize(totalCompressedBytes)}）`;
        showToast(`${files.length}ページを取り込みました${savedSummary}`, "success");
    } catch (err) {
        console.error(err);
        progressOverlay.classList.add("hidden");
        progressOverlay.classList.remove("flex");
        showToast(err.message || "画像の取り込み中にエラーが発生しました", "error");
    }
}

function renderPagesGrid() {
    const grid = document.getElementById("pages-grid");
    const emptyState = document.getElementById("empty-pages-state");
    const hintBar = document.getElementById("page-sort-hint");
    const startBtn = document.getElementById("start-viewer-btn");
    const folder = folders.find((f) => f.id === currentFolderId);

    const total = currentPages.length;
    const totalSizeBytes = currentPages.reduce((sum, p) => sum + (p.sizeBytes || 0), 0);
    const sizeInfoText = totalSizeBytes > 0 ? ` ・ 合計 ${formatFileSize(totalSizeBytes)}` : "";
    const noteText = folder && folder.note ? ` ・ ${folder.note}` : "";
    document.getElementById("detail-folder-subtitle").textContent = `全 ${total} ページ${sizeInfoText}${noteText}`;

    startBtn.disabled = total === 0;
    grid.innerHTML = "";

    if (total === 0) {
        emptyState.classList.remove("hidden");
        emptyState.classList.add("flex");
        hintBar.classList.add("hidden");
        return;
    }

    emptyState.classList.add("hidden");
    emptyState.classList.remove("flex");
    hintBar.classList.remove("hidden");

    const pageOptionsHtml = currentPages.map((_, i) =>
        `<option value="${i}">P.${i + 1}</option>`
    ).join("");

    currentPages.forEach((page, index) => {
        const pageNum = index + 1;
        const card = document.createElement("div");
        card.className = "glass rounded-3xl overflow-hidden flex flex-col border border-white/10 hover:border-blue-500/40 transition group";

        const dimsText = (page.width && page.height) ? `${page.width}×${page.height}` : "";
        const sizeText = page.sizeBytes ? formatFileSize(page.sizeBytes) : "";
        const metaBadge = [dimsText, sizeText].filter(Boolean).join(" • ");

        const previewHtml = page.hasLocalImage && page.url
            ? `<img src="${page.url}" alt="P.${pageNum}" loading="lazy" class="w-full h-full object-contain bg-white group-hover:scale-[1.02] transition duration-200">`
            : `<div class="w-full h-full flex flex-col items-center justify-center text-center p-4 bg-zinc-900/90 text-zinc-400">
                   <svg class="w-8 h-8 text-amber-400 mb-2" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                       <path stroke-linecap="round" stroke-linejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                   </svg>
                   <span class="text-xs font-bold text-amber-300">端末未保存</span>
                   <span class="text-[10px] text-zinc-400 mt-1">JPGを追加で紐づけ</span>
               </div>`;

        card.innerHTML = `
            <!-- 楽譜サムネイル領域（タップでそのページから演奏開始） -->
            <div onclick="openViewer(${index})" class="relative aspect-[3/4] bg-zinc-900 overflow-hidden cursor-pointer">
                ${previewHtml}
                
                <!-- 大きなページ番号バッジ -->
                <div class="absolute top-3 left-3 px-3 py-1.5 rounded-xl bg-blue-600 text-white font-extrabold text-sm shadow-lg">
                    P.${pageNum}
                </div>

                <!-- 削除ボタン -->
                <button onclick="event.stopPropagation(); deletePage('${page.id}')" class="absolute top-3 right-3 w-9 h-9 rounded-xl bg-black/70 hover:bg-red-600 text-white flex items-center justify-center backdrop-blur-md transition" title="このページを削除">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
                </button>
            </div>

            <!-- ページ番号並べ替えコントロール -->
            <div class="p-3 bg-zinc-900/80 flex flex-col gap-2">
                <div class="px-1">
                    <p class="text-[11px] text-zinc-300 truncate" title="${escapeHtml(page.name)}">${escapeHtml(page.name)}</p>
                    ${metaBadge ? `<p class="text-[10px] text-zinc-500 font-mono mt-0.5">${metaBadge}</p>` : ''}
                </div>
                
                <div class="flex items-center justify-between gap-1.5">
                    <button onclick="movePage(${index}, ${index - 1})" ${index === 0 ? 'disabled' : ''} class="flex-1 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 disabled:opacity-25 disabled:pointer-events-none text-white flex items-center justify-center transition" title="前のページへ">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7"/></svg>
                    </button>

                    <select onchange="movePage(${index}, parseInt(this.value))" aria-label="ページ番号を変更" class="py-2 px-2.5 rounded-xl bg-zinc-800 border border-white/10 text-white text-xs font-bold text-center focus:outline-none focus:border-blue-500">
                        ${pageOptionsHtml.replace(`value="${index}"`, `value="${index}" selected`)}
                    </select>

                    <button onclick="movePage(${index}, ${index + 1})" ${index === total - 1 ? 'disabled' : ''} class="flex-1 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 disabled:opacity-25 disabled:pointer-events-none text-white flex items-center justify-center transition" title="次のページへ">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"/></svg>
                    </button>
                </div>
            </div>
        `;
        grid.appendChild(card);
    });
}

window.movePage = async function (fromIndex, toIndex) {
    if (fromIndex === toIndex || toIndex < 0 || toIndex >= currentPages.length) return;

    await ensureAuthenticatedForDb();
    const folder = folders.find((f) => f.id === currentFolderId);
    if (!folder) return;

    const nextPages = [...currentPages];
    const [movedItem] = nextPages.splice(fromIndex, 1);
    nextPages.splice(toIndex, 0, movedItem);

    const nextOrder = nextPages.map((p) => String(p.id));
    const nextUpdatedAt = Date.now();
    folder.pageOrder = nextOrder;
    folder.updatedAt = nextUpdatedAt;
    currentPages = nextPages;
    renderPagesGrid();

    await set(ref(db, `gakufu_folders/${currentFolderId}/pageOrder`), nextOrder);
    await set(ref(db, `gakufu_folders/${currentFolderId}/updatedAt`), nextUpdatedAt);

    showToast(`P.${toIndex + 1} に移動しました`, "info");
};

window.sortPagesByFilename = async function () {
    await ensureAuthenticatedForDb();
    const folder = folders.find((f) => f.id === currentFolderId);
    if (!folder) return;

    const sorted = [...currentPages].sort((a, b) =>
        (a.name || "").localeCompare(b.name || "", undefined, { numeric: true, sensitivity: "base" })
    );
    const nextOrder = sorted.map((p) => String(p.id));
    const nextUpdatedAt = Date.now();
    folder.pageOrder = nextOrder;
    folder.updatedAt = nextUpdatedAt;
    currentPages = sorted;
    renderPagesGrid();

    await set(ref(db, `gakufu_folders/${currentFolderId}/pageOrder`), nextOrder);
    await set(ref(db, `gakufu_folders/${currentFolderId}/updatedAt`), nextUpdatedAt);

    showToast("ファイル名順にページ番号を振り直しました", "success");
};

window.deletePage = function (pageId) {
    showConfirm(
        "ページの削除",
        "この楽譜ページを削除しますか？（残りのページ番号は自動的に詰められます）",
        async () => {
            await ensureAuthenticatedForDb();
            const folder = folders.find((f) => f.id === currentFolderId);
            if (!folder) return;

            const nextOrder = (folder.pageOrder || []).filter((id) => id !== pageId);
            const nextUpdatedAt = Date.now();
            folder.pageOrder = nextOrder;
            folder.updatedAt = nextUpdatedAt;
            if (folder.pagesMeta) {
                delete folder.pagesMeta[pageId];
            }

            await deleteLocalImage(pageId);
            await remove(ref(db, `gakufu_folders/${currentFolderId}/pagesMeta/${pageId}`));
            await set(ref(db, `gakufu_folders/${currentFolderId}/pageOrder`), nextOrder);
            await set(ref(db, `gakufu_folders/${currentFolderId}/updatedAt`), nextUpdatedAt);

            await syncCurrentFolderPagesView();
            showToast("ページを削除しました", "info");
        }
    );
};

/* ==========================================================================
   4. iPad楽譜ビューワー（演奏モード・左右半分タップ・見開き・スワイプ・メトロノーム）
   ========================================================================== */
window.openViewer = function (startIndex = 0) {
    if (currentPages.length === 0) return;

    const folder = folders.find((f) => f.id === currentFolderId);
    document.getElementById("viewer-song-title").textContent = folder ? folder.name : "";

    isSpreadMode = window.innerWidth >= 1024 && currentPages.length > 1;
    updateSpreadButtonUI();

    currentPageIndex = Math.max(0, Math.min(startIndex, currentPages.length - 1));
    if (isSpreadMode && currentPageIndex % 2 === 1) {
        currentPageIndex -= 1;
    }

    isChromeVisible = true;
    updateChromeVisibility();

    const overlay = document.getElementById("viewer-overlay");
    overlay.classList.remove("hidden");
    overlay.classList.add("flex");

    renderViewerPage();
};

window.closeViewer = function () {
    stopMetronome();
    document.getElementById("metronome-panel").classList.add("hidden");
    const overlay = document.getElementById("viewer-overlay");
    overlay.classList.add("hidden");
    overlay.classList.remove("flex");
};

window.toggleSpreadMode = function () {
    isSpreadMode = !isSpreadMode;
    if (isSpreadMode && currentPageIndex % 2 === 1) {
        currentPageIndex = Math.max(0, currentPageIndex - 1);
    }
    updateSpreadButtonUI();
    renderViewerPage();
};

function updateSpreadButtonUI() {
    const label = document.getElementById("spread-mode-label");
    label.textContent = isSpreadMode ? "見開き2ページ" : "1ページ表示";
}

function renderViewerSlot(pageObj, imgEl, missingEl, missingNameEl, badgeEl, pageNumber) {
    badgeEl.textContent = `P.${pageNumber}`;
    badgeEl.classList.remove("hidden");
    if (pageObj && pageObj.hasLocalImage && pageObj.url) {
        imgEl.src = pageObj.url;
        imgEl.classList.remove("hidden");
        missingEl.classList.add("hidden");
        missingEl.classList.remove("flex");
    } else {
        imgEl.src = "";
        imgEl.classList.add("hidden");
        missingNameEl.textContent = pageObj ? `${pageObj.name} をこの端末で追加してください` : "";
        missingEl.classList.remove("hidden");
        missingEl.classList.add("flex");
    }
}

function renderViewerPage() {
    const total = currentPages.length;
    if (total === 0) return;

    const slot1 = document.getElementById("page-slot-1");
    const slot2 = document.getElementById("page-slot-2");
    const img1 = document.getElementById("sheet-img-1");
    const img2 = document.getElementById("sheet-img-2");
    const missing1 = document.getElementById("sheet-missing-1");
    const missing2 = document.getElementById("sheet-missing-2");
    const missingName1 = document.getElementById("sheet-missing-name-1");
    const missingName2 = document.getElementById("sheet-missing-name-2");
    const badge1 = document.getElementById("viewer-badge-1");
    const badge2 = document.getElementById("viewer-badge-2");

    const page1 = currentPages[currentPageIndex];
    renderViewerSlot(page1, img1, missing1, missingName1, badge1, currentPageIndex + 1);

    if (isSpreadMode) {
        slot1.classList.remove("w-full");
        slot1.classList.add("w-1/2");
        slot2.classList.remove("hidden");
        slot2.classList.add("flex", "w-1/2");

        if (currentPageIndex + 1 < total) {
            const page2 = currentPages[currentPageIndex + 1];
            renderViewerSlot(page2, img2, missing2, missingName2, badge2, currentPageIndex + 2);
            document.getElementById("viewer-page-indicator").textContent =
                `P.${currentPageIndex + 1} - P.${currentPageIndex + 2} / 全${total}ページ`;
        } else {
            img2.classList.add("hidden");
            missing2.classList.add("hidden");
            missing2.classList.remove("flex");
            badge2.classList.add("hidden");
            document.getElementById("viewer-page-indicator").textContent =
                `P.${currentPageIndex + 1} / 全${total}ページ`;
        }
    } else {
        slot1.classList.remove("w-1/2");
        slot1.classList.add("w-full");
        slot2.classList.add("hidden");
        slot2.classList.remove("flex", "w-1/2");
        document.getElementById("viewer-page-indicator").textContent =
            `P.${currentPageIndex + 1} / 全${total}ページ`;
    }

    const scrubber = document.getElementById("viewer-scrubber");
    scrubber.max = Math.max(0, total - 1);
    scrubber.value = currentPageIndex;
    document.getElementById("viewer-scrubber-text").textContent = `${currentPageIndex + 1} / ${total} ページ`;
}

window.nextPage = function () {
    const step = isSpreadMode ? 2 : 1;
    if (currentPageIndex + step < currentPages.length) {
        currentPageIndex += step;
        renderViewerPage();
    } else if (!isSpreadMode && currentPageIndex < currentPages.length - 1) {
        currentPageIndex = currentPages.length - 1;
        renderViewerPage();
    } else {
        showToast("最後のページです", "info");
    }
};

window.prevPage = function () {
    const step = isSpreadMode ? 2 : 1;
    if (currentPageIndex - step >= 0) {
        currentPageIndex -= step;
        renderViewerPage();
    } else if (currentPageIndex > 0) {
        currentPageIndex = 0;
        renderViewerPage();
    } else {
        showToast("最初のページです", "info");
    }
};

window.jumpToPage = function (index) {
    currentPageIndex = index;
    if (isSpreadMode && currentPageIndex % 2 === 1) {
        currentPageIndex = Math.max(0, currentPageIndex - 1);
    }
    renderViewerPage();
};

window.toggleViewerChrome = function () {
    isChromeVisible = !isChromeVisible;
    updateChromeVisibility();
};

function updateChromeVisibility() {
    const topBar = document.getElementById("viewer-top-bar");
    const bottomBar = document.getElementById("viewer-bottom-bar");
    const restoreBtn = document.getElementById("restore-chrome-btn");
    if (isChromeVisible) {
        topBar.classList.remove("-translate-y-full", "opacity-0", "pointer-events-none");
        bottomBar.classList.remove("translate-y-full", "opacity-0", "pointer-events-none");
        restoreBtn.classList.add("hidden");
    } else {
        topBar.classList.add("-translate-y-full", "opacity-0", "pointer-events-none");
        bottomBar.classList.add("translate-y-full", "opacity-0", "pointer-events-none");
        restoreBtn.classList.remove("hidden");
    }
}

function setupViewerGestures() {
    const stage = document.getElementById("viewer-stage");
    let touchStartX = 0;
    let touchStartY = 0;

    stage.addEventListener("touchstart", (e) => {
        if (e.touches.length === 1) {
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
        }
    }, { passive: true });

    stage.addEventListener("touchend", (e) => {
        if (e.changedTouches.length === 1) {
            const dx = e.changedTouches[0].clientX - touchStartX;
            const dy = e.changedTouches[0].clientY - touchStartY;
            if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) {
                if (dx < 0) nextPage();
                else prevPage();
            }
        }
    }, { passive: true });

    window.addEventListener("keydown", (e) => {
        const viewerOpen = !document.getElementById("viewer-overlay").classList.contains("hidden");
        if (!viewerOpen) return;

        if (e.key === "ArrowRight" || e.key === "PageDown" || e.key === " ") {
            e.preventDefault();
            nextPage();
        } else if (e.key === "ArrowLeft" || e.key === "PageUp") {
            e.preventDefault();
            prevPage();
        } else if (e.key === "Escape") {
            closeViewer();
        }
    });
}

/* ==========================================================================
   5. 練習用メトロノーム（Web Audio API）
   ========================================================================== */
window.toggleMetronomePanel = function () {
    const panel = document.getElementById("metronome-panel");
    panel.classList.toggle("hidden");
};

window.updateBpm = function (val) {
    metroBpm = parseInt(val, 10);
    document.getElementById("metro-bpm-val").textContent = metroBpm;
    if (isMetronomePlaying) {
        stopMetronome();
        startMetronome();
    }
};

window.toggleMetronomePlay = function () {
    if (isMetronomePlaying) {
        stopMetronome();
    } else {
        startMetronome();
    }
};

function startMetronome() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === "suspended") {
        audioCtx.resume();
    }

    isMetronomePlaying = true;
    document.getElementById("metro-play-label").textContent = "■ 停止";
    document.getElementById("metro-play-btn").classList.replace("bg-amber-500", "bg-red-500");
    document.getElementById("metro-play-btn").classList.replace("text-zinc-950", "text-white");

    const playClick = () => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(880, audioCtx.currentTime);
        gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.06);

        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.06);

        const dot = document.getElementById("metro-beat-dot");
        dot.classList.add("bg-amber-400", "scale-125");
        setTimeout(() => dot.classList.remove("bg-amber-400", "scale-125"), 90);
    };

    playClick();
    const intervalMs = (60 / metroBpm) * 1000;
    metronomeTimer = setInterval(playClick, intervalMs);
}

function stopMetronome() {
    isMetronomePlaying = false;
    if (metronomeTimer) {
        clearInterval(metronomeTimer);
        metronomeTimer = null;
    }
    const btn = document.getElementById("metro-play-btn");
    if (btn) {
        document.getElementById("metro-play-label").textContent = "▶ 開始";
        btn.classList.replace("bg-red-500", "bg-amber-500");
        btn.classList.replace("text-white", "text-zinc-950");
    }
}

/* ==========================================================================
   6. ユーティリティ（トースト通知・確認モーダル・HTMLエスケープ）
   ========================================================================== */
function showToast(message, type = "info") {
    const container = document.getElementById("toast-container");
    const toast = document.createElement("div");
    const colors = {
        success: "bg-emerald-600/95 border-emerald-400/30 text-white",
        error: "bg-red-600/95 border-red-400/30 text-white",
        info: "bg-zinc-800/95 border-white/15 text-zinc-100"
    };
    toast.className = `px-4 py-3 rounded-2xl border shadow-xl backdrop-blur-md text-sm font-medium text-center transition-all duration-300 transform translate-y-0 opacity-100 ${colors[type] || colors.info}`;
    toast.textContent = message;
    container.appendChild(toast);

    setTimeout(() => {
        toast.classList.add("opacity-0", "-translate-y-2");
        setTimeout(() => toast.remove(), 300);
    }, 2400);
}

function showConfirm(title, message, onConfirm) {
    const modal = document.getElementById("confirm-modal");
    document.getElementById("confirm-title").textContent = title;
    document.getElementById("confirm-message").textContent = message;

    const cancelBtn = document.getElementById("confirm-cancel");
    const okBtn = document.getElementById("confirm-ok");

    const cleanup = () => {
        modal.classList.add("hidden");
        modal.classList.remove("flex");
    };

    cancelBtn.onclick = cleanup;
    okBtn.onclick = () => {
        cleanup();
        onConfirm();
    };

    modal.classList.remove("hidden");
    modal.classList.add("flex");
}

function escapeHtml(str) {
    return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}
