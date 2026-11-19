const STORAGE_KEY = "medical_dictionary_data";
const JSON_FILE_URL = "dictionary.json";

// サイドバー制御
const hamburgerBtn = document.getElementById("hamburgerBtn");
const sidebar = document.getElementById("sidebar");
const sidebarOverlay = document.getElementById("sidebarOverlay");
const sidebarCloseBtn = document.getElementById("sidebarCloseBtn");

function toggleSidebar() {
    if (sidebar.classList.contains("active")) { closeSidebar(); } else { openSidebar(); }
}
function openSidebar() { sidebar.classList.add("active"); sidebarOverlay.classList.add("active"); }
function closeSidebar() { sidebar.classList.remove("active"); sidebarOverlay.classList.remove("active"); }

hamburgerBtn.addEventListener("click", toggleSidebar);
sidebarOverlay.addEventListener("click", closeSidebar);
sidebarCloseBtn.addEventListener("click", closeSidebar);

// モーダル制御
const jsonModal = document.getElementById("json-modal");
const openManagerBtn = document.getElementById("open-manager-btn");
const closeManagerBtn = document.getElementById("close-manager-btn");

openManagerBtn.addEventListener("click", () => {
    jsonModal.classList.remove("hidden");
    renderAdminTable();
});
closeManagerBtn.addEventListener("click", () => {
    jsonModal.classList.add("hidden");
});

// 辞書データ配列
let dictionaryData = [];

// UI要素
const termsGrid = document.getElementById("terms-grid");
const emptyState = document.getElementById("empty-state");
const totalCountEl = document.getElementById("total-count");
const resultCountEl = document.getElementById("result-count");
const searchInput = document.getElementById("search-input");
const clearSearchBtn = document.getElementById("clear-search");
const initialButtonsContainer = document.getElementById("initial-buttons");
const categoryFilterContainer = document.getElementById("category-filters");
const filterStatusText = document.getElementById("filter-status-text");
const resetInitialBtn = document.getElementById("reset-initial");

// 管理画面用検索
const adminSearchInput = document.getElementById("admin-search-input");
const adminClearSearchBtn = document.getElementById("admin-clear-search");
const reloadJsonBtn = document.getElementById("reload-json-btn");
let adminSearchQuery = "";

let currentCategory = "ALL";
let currentInitial = "ALL";
let searchQuery = "";

// dictionary.json からの取得処理（キャッシュ回避付き）
async function fetchDictionaryJson() {
    const cacheBuster = `?t=${Date.now()}`;
    const response = await fetch(`${JSON_FILE_URL}${cacheBuster}`, { cache: "no-store" });
    if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${JSON_FILE_URL} の読み込みに失敗しました`);
    }
    const data = await response.json();
    if (!Array.isArray(data)) {
        throw new Error("dictionary.json の形式が配列ではありません");
    }
    return data;
}

// 初期読み込み処理：dictionary.json を優先取得し、失敗時のみ localStorage / デフォルトへフォールバック
async function loadDictionary(forceFromJson = false) {
    try {
        const jsonData = await fetchDictionaryJson();
        if (forceFromJson) {
            dictionaryData = jsonData;
            saveToLocalStorage();
        } else {
            const saved = localStorage.getItem(STORAGE_KEY);
            // dictionary.json の内容が更新されている場合は jsonData を優先反映
            // ユーザーがローカルで追加・編集した分がある場合は、jsonData 側になければマージ
            if (saved) {
                const savedData = JSON.parse(saved);
                const jsonIds = new Set(jsonData.map(item => item.id));
                const localOnlyItems = Array.isArray(savedData)
                    ? savedData.filter(item => !jsonIds.has(item.id))
                    : [];
                dictionaryData = [...jsonData, ...localOnlyItems];
                saveToLocalStorage();
            } else {
                dictionaryData = jsonData;
                saveToLocalStorage();
            }
        }
    } catch (e) {
        console.warn("外部JSONの読み込みに失敗したため、保存済みデータまたは内蔵デフォルトデータを使用します。", e);
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            dictionaryData = JSON.parse(saved);
        } else {
            dictionaryData = getDefaultData();
        }
    }

    // 現在の選択イニシャルに該当件数がなくなった場合は ALL に戻す
    if (currentInitial !== "ALL" && dictionaryData.filter(d => d.initial === currentInitial).length === 0) {
        currentInitial = "ALL";
    }

    initAlphabetButtons();
    render();
    if (!jsonModal.classList.contains("hidden")) {
        renderAdminTable();
    }
}

function saveToLocalStorage() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dictionaryData, null, 2));
}

function initAlphabetButtons() {
    const alphabets = ["#", ..."ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("")];
    let html = `<button data-initial="ALL" class="init-btn ${currentInitial === "ALL" ? "active bg-cyan-500 border-cyan-400 text-slate-950" : "bg-slate-800 border-bordercolor text-slate-200"} px-2.5 py-1 rounded-md text-xs font-bold shadow-sm transition-all">ALL</button>`;

    alphabets.forEach(letter => {
        const count = dictionaryData.filter(d => d.initial === letter).length;
        const hasItem = count > 0;
        const isSelected = currentInitial === letter && hasItem;
        html += `
            <button data-initial="${letter}" ${!hasItem ? "disabled" : ""} 
                class="init-btn ${isSelected ? "active" : ""} px-2 py-1 rounded-md text-xs font-semibold transition-all border 
                ${!hasItem
                    ? "bg-slate-900/50 border-slate-800 text-slate-600 cursor-not-allowed opacity-50"
                    : isSelected
                        ? "bg-cyan-500 border-cyan-400 text-slate-950 shadow-sm cursor-pointer"
                        : "bg-slate-800 border-bordercolor text-slate-200 hover:border-cyan-500 hover:text-cyan-400 cursor-pointer"}">
                ${letter}
            </button>
        `;
    });
    initialButtonsContainer.innerHTML = html;
}

function filterTerms() {
    return dictionaryData.filter(item => {
        const matchCategory = (currentCategory === "ALL") || (item.category === currentCategory);
        const matchInitial = (currentInitial === "ALL") || (item.initial === currentInitial);
        const q = searchQuery.toLowerCase().trim();
        const term = (item.term || "").toLowerCase();
        const reading = (item.reading || "").toLowerCase();
        const fullName = (item.fullName || "").toLowerCase();
        const meaning = (item.meaning || "").toLowerCase();
        const matchSearch = !q ||
            term.includes(q) ||
            reading.includes(q) ||
            fullName.includes(q) ||
            meaning.includes(q);
        return matchCategory && matchInitial && matchSearch;
    });
}

function render() {
    const filtered = filterTerms();
    totalCountEl.textContent = dictionaryData.length;
    resultCountEl.textContent = `${filtered.length}件`;

    let statusParts = [];
    if (currentCategory !== "ALL") {
        const catNames = { PCI: "PCI", CARD: "心臓病名", CHART: "カルテ略語", TL: "経過記録", ERCP: "ERCP" };
        statusParts.push(`カテゴリ: ${catNames[currentCategory] || currentCategory}`);
    }
    if (currentInitial !== "ALL") { statusParts.push(`イニシャル: ${currentInitial}`); }
    if (searchQuery) { statusParts.push(`検索: "${searchQuery}"`); }
    filterStatusText.textContent = statusParts.length > 0 ? `表示中: ${statusParts.join(" / ")}` : "表示中: すべての用語";

    termsGrid.innerHTML = "";
    if (filtered.length === 0) {
        emptyState.classList.remove("hidden");
        return;
    } else {
        emptyState.classList.add("hidden");
    }

    filtered.forEach(item => {
        const card = document.createElement("div");
        card.className = "bg-cardbg rounded-2xl border border-bordercolor p-5 shadow-lg hover:border-cyan-500/50 transition-all flex flex-col justify-between";

        let catBadgeClass = "bg-blue-950 text-blue-400 border-blue-800";
        let catBadgeText = "PCI";
        if (item.category === "CARD") { catBadgeClass = "bg-rose-950 text-rose-400 border-rose-800"; catBadgeText = "心臓病名"; }
        else if (item.category === "CHART") { catBadgeClass = "bg-amber-950 text-amber-400 border-amber-800"; catBadgeText = "カルテ略語"; }
        else if (item.category === "TL") { catBadgeClass = "bg-purple-950 text-purple-400 border-purple-800"; catBadgeText = "経過記録"; }
        else if (item.category === "ERCP") { catBadgeClass = "bg-emerald-950 text-emerald-400 border-emerald-800"; catBadgeText = "ERCP"; }

        const formattedMeaning = item.meaning ? item.meaning.replace(/\n/g, "<br>") : "";

        card.innerHTML = `
            <div>
                <div class="flex items-start justify-between gap-2 mb-2">
                    <div>
                        <span class="text-[10px] tracking-wider font-semibold text-slate-400 block uppercase">${item.reading || ""}</span>
                        <h3 class="text-xl font-bold text-cyan-300 tracking-wide">${item.term || ""}</h3>
                    </div>
                    <span class="text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${catBadgeClass}">
                        ${catBadgeText}
                    </span>
                </div>
                <p class="text-xs font-mono text-slate-400 mb-3 border-b border-bordercolor/60 pb-2">${item.fullName || ""}</p>
                <p class="text-sm text-slate-200 leading-relaxed">${formattedMeaning}</p>
            </div>
        `;
        termsGrid.appendChild(card);
    });
}

// 管理画面テーブル描画（検索フィルター対応）
function renderAdminTable() {
    const tbody = document.getElementById("admin-table-body");
    tbody.innerHTML = "";

    const q = adminSearchQuery.toLowerCase().trim();
    dictionaryData.forEach((item, index) => {
        const term = (item.term || "").toLowerCase();
        const reading = (item.reading || "").toLowerCase();
        const meaning = (item.meaning || "").toLowerCase();
        const category = (item.category || "").toLowerCase();

        if (q && !term.includes(q) && !reading.includes(q) && !meaning.includes(q) && !category.includes(q)) {
            return;
        }

        const tr = document.createElement("tr");
        tr.className = "hover:bg-slate-800/50";
        tr.innerHTML = `
            <td class="p-2.5 font-bold text-cyan-300">${item.term || ""}<br><span class="text-[10px] text-slate-400 font-normal">${item.reading || ""}</span></td>
            <td class="p-2.5"><span class="text-[10px] px-2 py-0.5 rounded bg-slate-800 border border-bordercolor">${item.category || ""}</span></td>
            <td class="p-2.5 text-slate-300 text-xs max-w-xs truncate">${item.meaning || ""}</td>
            <td class="p-2.5 text-right whitespace-nowrap">
                <button onclick="editTerm(${index})" class="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-cyan-400 rounded text-[11px] mr-1" title="編集"><i class="fa-solid fa-pen"></i></button>
                <button onclick="deleteTerm(${index})" class="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-rose-400 rounded text-[11px]" title="削除"><i class="fa-solid fa-trash"></i></button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

window.editTerm = function(index) {
    const item = dictionaryData[index];
    document.getElementById("edit-index").value = index;
    document.getElementById("input-id").value = item.id || "";
    document.getElementById("input-term").value = item.term || "";
    document.getElementById("input-reading").value = item.reading || "";
    document.getElementById("input-fullname").value = item.fullName || "";
    document.getElementById("input-category").value = item.category || "PCI";
    document.getElementById("input-initial").value = item.initial || "";
    document.getElementById("input-meaning").value = item.meaning || "";
    document.getElementById("form-title").textContent = "用語の編集 (index: " + index + ")";
    document.getElementById("cancel-edit-btn").classList.remove("hidden");
};

window.deleteTerm = function(index) {
    if (confirm(`「${dictionaryData[index].term}」を削除してもよろしいですか？`)) {
        dictionaryData.splice(index, 1);
        saveToLocalStorage();
        initAlphabetButtons();
        render();
        renderAdminTable();
    }
};

document.getElementById("cancel-edit-btn").addEventListener("click", () => {
    resetForm();
});

function resetForm() {
    document.getElementById("edit-index").value = "-1";
    document.getElementById("input-id").value = "";
    document.getElementById("input-term").value = "";
    document.getElementById("input-reading").value = "";
    document.getElementById("input-fullname").value = "";
    document.getElementById("input-category").value = "PCI";
    document.getElementById("input-initial").value = "";
    document.getElementById("input-meaning").value = "";
    document.getElementById("form-title").textContent = "新規用語の追加";
    document.getElementById("cancel-edit-btn").classList.add("hidden");
}

// 追加・更新保存
document.getElementById("save-term-btn").addEventListener("click", () => {
    const index = parseInt(document.getElementById("edit-index").value, 10);
    const newItem = {
        id: document.getElementById("input-id").value.trim() || "item_" + Date.now(),
        term: document.getElementById("input-term").value.trim(),
        reading: document.getElementById("input-reading").value.trim(),
        fullName: document.getElementById("input-fullname").value.trim(),
        category: document.getElementById("input-category").value,
        initial: document.getElementById("input-initial").value.trim().toUpperCase() || "A",
        meaning: document.getElementById("input-meaning").value
    };

    if (!newItem.term) {
        alert("用語名を入力してください。");
        return;
    }

    if (index === -1) {
        dictionaryData.push(newItem);
    } else {
        dictionaryData[index] = newItem;
    }

    saveToLocalStorage();
    initAlphabetButtons();
    render();
    renderAdminTable();
    resetForm();
    alert("保存しました。");
});

// dictionary.json から強制再読み込み
reloadJsonBtn.addEventListener("click", async () => {
    if (confirm("dictionary.json の内容でデータを再読み込みしますか？（未出力のローカル編集内容は上書きされます）")) {
        await loadDictionary(true);
        alert("dictionary.json から再読み込みしました。");
    }
});

// JSONファイルとしてエクスポート
document.getElementById("export-json-btn").addEventListener("click", () => {
    const jsonString = JSON.stringify(dictionaryData, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "dictionary.json";
    a.click();
    URL.revokeObjectURL(url);
});

// イベントリスナー設定
function setupEventListeners() {
    searchInput.addEventListener("input", (e) => {
        searchQuery = e.target.value;
        clearSearchBtn.classList.toggle("hidden", !searchQuery);
        render();
    });

    clearSearchBtn.addEventListener("click", () => {
        searchInput.value = "";
        searchQuery = "";
        clearSearchBtn.classList.add("hidden");
        render();
    });

    // 管理画面用検索イベント
    adminSearchInput.addEventListener("input", (e) => {
        adminSearchQuery = e.target.value;
        adminClearSearchBtn.classList.toggle("hidden", !adminSearchQuery);
        renderAdminTable();
    });

    adminClearSearchBtn.addEventListener("click", () => {
        adminSearchInput.value = "";
        adminSearchQuery = "";
        adminClearSearchBtn.classList.add("hidden");
        renderAdminTable();
    });

    initialButtonsContainer.addEventListener("click", (e) => {
        const btn = e.target.closest(".init-btn");
        if (!btn || btn.disabled) return;
        document.querySelectorAll(".init-btn").forEach(b => {
            b.classList.remove("active", "bg-cyan-500", "border-cyan-400", "text-slate-950");
            b.classList.add("bg-slate-800", "border-bordercolor", "text-slate-200");
        });
        btn.classList.add("active", "bg-cyan-500", "border-cyan-400", "text-slate-950");
        btn.classList.remove("bg-slate-800", "border-bordercolor", "text-slate-200");
        currentInitial = btn.dataset.initial;
        render();
    });

    categoryFilterContainer.addEventListener("click", (e) => {
        const btn = e.target.closest(".cat-btn");
        if (!btn) return;
        document.querySelectorAll(".cat-btn").forEach(b => {
            b.classList.remove("active", "bg-cyan-500", "border-cyan-400", "text-slate-950");
            b.classList.add("bg-slate-800", "border-bordercolor", "text-slate-300");
        });
        btn.classList.add("active", "bg-cyan-500", "border-cyan-400", "text-slate-950");
        btn.classList.remove("bg-slate-800", "border-bordercolor", "text-slate-300");
        currentCategory = btn.dataset.category;
        render();
    });

    resetInitialBtn.addEventListener("click", () => {
        currentInitial = "ALL";
        document.querySelectorAll(".init-btn").forEach(b => {
            if (b.dataset.initial === "ALL") {
                b.classList.add("active", "bg-cyan-500", "border-cyan-400", "text-slate-950");
                b.classList.remove("bg-slate-800", "border-bordercolor", "text-slate-200");
            } else {
                b.classList.remove("active", "bg-cyan-500", "border-cyan-400", "text-slate-950");
                b.classList.add("bg-slate-800", "border-bordercolor", "text-slate-200");
            }
        });
        render();
    });
}

// デフォルトデータフォールバック
function getDefaultData() {
    return [
        { id: "anamne", term: "アナムネ", reading: "アナムネ / あなむねーぜ", fullName: "Anamnese", category: "CHART", initial: "A", meaning: "医療における「アナムネ（正式名称：アナムネーゼ / Anamnese）」とは、患者から病歴や既往歴、生活状況などの情報を聴取すること、またはその記録を指す言葉です。\nドイツ語の「Anamnese（過去を思い出すこと・病歴）」が語源となっています。" },
        { id: "muntella", term: "ムンテラ", reading: "ムンテラ / むんてら", fullName: "Mundtherapie", category: "CHART", initial: "M", meaning: "ムンテラとは、医師が患者やその家族に対して病状や治療方針などを説明することです。\n現在では医師と患者が対等な立場で情報共有するインフォームド・コンセントが主流になっています。" }
    ];
}

window.addEventListener("DOMContentLoaded", () => {
    setupEventListeners();
    loadDictionary(false);
});