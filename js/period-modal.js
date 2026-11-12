/* Luna Diary - 生理記録モーダル (Realtime Database完全対応版) */
import { db } from "./config.js";
import { ref, get, set } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

(() => {
  "use strict";

  const DB_PATH = "settings/lunaDiary_period_records";

  const PROFILES = [
    { id: "ru", label: "る", icon: "🌷" },
    { id: "hi", label: "ひ", icon: "🌸" }
  ];

  let activeProfile = "ru";
  let overlay = null;
  let importInput = null;
  
  // 周期設定を保存するため cycles を追加
  let cachedData = { ru: [], hi: [], cycles: { ru: 28, hi: 28 } };

  function toISODate(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }

  function todayISO() {
    const now = new Date();
    return toISODate(
      new Date(now.getFullYear(), now.getMonth(), now.getDate())
    );
  }

  function parseISODate(value) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value || "")) {
      return null;
    }

    const [y, m, d] = value.split("-").map(Number);
    const date = new Date(y, m - 1, d);

    if (
      date.getFullYear() !== y ||
      date.getMonth() !== m - 1 ||
      date.getDate() !== d
    ) {
      return null;
    }

    return date;
  }

  function formatDate(value) {
    const date = parseISODate(value);
    if (!date) return value;

    return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
  }

  function addDays(date, days) {
    const result = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate()
    );

    result.setDate(result.getDate() + days);
    return result;
  }

  function dayDifference(a, b) {
    return Math.round((b - a) / 86400000);
  }

  // Realtime Databaseからデータ読み込み
  async function loadData() {
    try {
      if (!db) return cachedData;
      const dataRef = ref(db, DB_PATH);
      const snapshot = await get(dataRef);

      if (!snapshot.exists()) {
        return { ru: [], hi: [], cycles: { ru: 28, hi: 28 } };
      }

      const parsed = snapshot.val();
      const clean = { ru: [], hi: [], cycles: { ru: 28, hi: 28 } };

      for (const profile of PROFILES) {
        const rows = Array.isArray(parsed[profile.id])
          ? parsed[profile.id]
          : [];

        clean[profile.id] = [...new Set(
          rows.filter(value =>
            typeof value === "string" && parseISODate(value)
          )
        )].sort();
      }
      
      // 周期データの読み込み
      if (parsed.cycles) {
        clean.cycles = { ...clean.cycles, ...parsed.cycles };
      }

      cachedData = clean;
      return clean;

    } catch (error) {
      console.error("Firebaseデータ読み込みエラー", error);
      return cachedData;
    }
  }

  // Realtime Databaseへデータ保存
  async function saveData(data) {
    try {
      if (!db) {
        throw new Error("Database接続が見つかりません。");
      }
      const dataRef = ref(db, DB_PATH);
      await set(dataRef, data);
      cachedData = data;
      return true;

    } catch (error) {
      console.error("Firebaseデータ保存エラー", error);
      alert("記録を保存できませんでした。通信環境や設定を確認してください。");
      return false;
    }
  }

  // 周期・次回予定日の計算（手動入力された周期を基準に計算）
  function getStats(records, cycle) {
    if (!records.length) {
      return {
        nextDate: null
      };
    }

    const lastStart = parseISODate(
      records[records.length - 1]
    );

    return {
      nextDate: toISODate(
        addDays(lastStart, cycle)
      )
    };
  }

  function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, char => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    })[char]);
  }

  // CSSを自動生成
  function ensureStyles() {
    if (document.getElementById("luna-period-styles")) {
      return;
    }

    const style = document.createElement("style");

    style.id = "luna-period-styles";

    style.textContent = `
      .luna-period-overlay {
        position: fixed;
        inset: 0;
        z-index: 99999;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 16px;
        background: rgba(10,8,18,.72);
        backdrop-filter: blur(8px);
        -webkit-backdrop-filter: blur(8px);
        font-family: "M PLUS Rounded 1c",
          "Hiragino Kaku Gothic ProN",
          "Yu Gothic", sans-serif;
      }

      .luna-period-overlay[hidden] {
        display: none;
      }

      .luna-period-modal {
        position: relative;
        width: min(100%,480px);
        max-height: min(92vh,820px);
        overflow: auto;
        color: #f7eff8;
        background: #211d2e;
        border: 1px solid rgba(255,255,255,.12);
        border-radius: 24px;
        box-shadow: 0 24px 80px rgba(0,0,0,.45);
        padding: 22px;
      }

      .luna-period-modal * {
        box-sizing: border-box;
      }

      .luna-period-head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
      }

      .luna-period-brand {
        margin: 0;
        color: #edc8df;
        font-size: 22px;
        letter-spacing: .04em;
      }

      .luna-period-close {
        width: 38px;
        height: 38px;
        border: 0;
        border-radius: 50%;
        color: #f7eff8;
        background: #393246;
        font-size: 22px;
        cursor: pointer;
      }

      .luna-period-subtitle {
        margin: 5px 0 18px;
        color: #bdb2c7;
        font-size: 12px;
      }

      .luna-period-tabs {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 9px;
        margin-bottom: 16px;
      }

      .luna-period-tab {
        padding: 12px;
        border: 1px solid #51445d;
        border-radius: 14px;
        color: #e9ddea;
        background: #30293c;
        font: inherit;
        cursor: pointer;
      }

      .luna-period-tab[aria-pressed="true"] {
        color: #fff;
        border-color: #bd83a8;
        background: #68465f;
      }

      .luna-period-summary {
        padding: 18px;
        border-radius: 18px;
        margin-bottom: 17px;
        background: linear-gradient(
          135deg,#44334d,#342d49
        );
      }

      .luna-period-caption {
        color: #cbbbd1;
        font-size: 12px;
      }

      .luna-period-next {
        margin: 5px 0 3px;
        color: #f2cce2;
        font-size: 30px;
        font-weight: 700;
      }

      .luna-period-note {
        margin: 0;
        color: #cbbbd1;
        font-size: 12px;
        line-height: 1.6;
      }

      .luna-period-stats {
        display: flex;
        gap: 18px;
        margin-top: 15px;
        padding-top: 13px;
        border-top: 1px solid #65546d;
      }

      .luna-period-stat strong {
        display: block;
        margin-top: 3px;
        font-size: 17px;
      }

      /* 周期の手動入力ボックス用スタイル追加 */
      .luna-period-cycle-input {
        width: 60px;
        padding: 2px 6px;
        background: transparent;
        border: 1px solid #5b5064;
        border-radius: 6px;
        color: #fff;
        font: inherit;
        font-size: 17px;
        font-weight: 700;
        text-align: right;
      }

      .luna-period-cycle-input:focus {
        outline: none;
        border-color: #bd83a8;
      }

      .luna-period-section-title {
        margin: 18px 0 10px;
        font-size: 14px;
      }

      .luna-period-entry {
        display: flex;
        gap: 9px;
        align-items: center;
      }

      .luna-period-date {
        min-width: 0;
        flex: 1;
        padding: 12px;
        color: #282130;
        background: #fff;
        border: 1px solid #d7cbdc;
        border-radius: 12px;
        font: inherit;
      }

      .luna-period-add {
        padding: 12px 15px;
        border: 0;
        border-radius: 12px;
        color: #fff;
        background: #ad7199;
        font: inherit;
        font-weight: 700;
        cursor: pointer;
        white-space: nowrap;
      }

      .luna-period-message {
        min-height: 18px;
        margin: 8px 0 0;
        color: #e9bcd6;
        font-size: 12px;
      }

      .luna-period-list {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }

      .luna-period-record {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        padding: 11px 12px;
        border: 1px solid #484052;
        border-radius: 12px;
        background: #2c2738;
      }

      .luna-period-record-date {
        font-size: 13px;
      }

      .luna-period-record-meta {
        color: #bdb2c7;
        font-size: 11px;
        margin-top: 3px;
      }

      .luna-period-delete {
        padding: 7px 10px;
        color: #e8c7d8;
        background: transparent;
        border: 1px solid #72566b;
        border-radius: 9px;
        font: inherit;
        font-size: 11px;
        cursor: pointer;
      }

      .luna-period-tools {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        margin-top: 18px;
      }

      .luna-period-tool {
        flex: 1;
        min-width: 120px;
        padding: 10px;
        border: 1px solid #5b5064;
        border-radius: 11px;
        color: #e9ddea;
        background: #302b3b;
        font: inherit;
        font-size: 12px;
        cursor: pointer;
      }

      .luna-period-footnote {
        margin: 14px 0 0;
        color: #a99eaf;
        font-size: 10px;
        line-height: 1.7;
      }

      .luna-period-empty {
        padding: 16px;
        color: #bdb2c7;
        text-align: center;
        font-size: 12px;
        border: 1px dashed #5b5064;
        border-radius: 12px;
      }

      @media (max-width:420px) {
        .luna-period-modal {
          padding: 17px;
          border-radius: 20px;
        }

        .luna-period-entry {
          flex-direction: column;
          align-items: stretch;
        }

        .luna-period-add {
          width: 100%;
        }
      }
    `;

    document.head.appendChild(style);
  }

  // モーダル画面描画
  async function render() {
    if (!overlay) return;

    const data = await loadData();
    const records = data[activeProfile];
    const cycle = data.cycles ? (data.cycles[activeProfile] || 28) : 28;
    const stats = getStats(records, cycle);

    const profile = PROFILES.find(
      item => item.id === activeProfile
    );

    const today = todayISO();

    overlay.innerHTML = `
      <section
        class="luna-period-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="luna-period-title"
      >
        <div class="luna-period-head">
          <h2 class="luna-period-brand" id="luna-period-title">
            Luna Diary 🌙
          </h2>

          <button
            class="luna-period-close"
            type="button"
            data-action="close"
            aria-label="閉じる"
          >×</button>
        </div>

        <p class="luna-period-subtitle">
          ふたりの生理記録
        </p>

        <div class="luna-period-tabs" aria-label="記録する人">
          ${PROFILES.map(item => `
            <button
              class="luna-period-tab"
              type="button"
              data-profile="${item.id}"
              aria-pressed="${item.id === activeProfile}"
            >
              ${item.icon} ${item.label}
            </button>
          `).join("")}
        </div>

        <div class="luna-period-summary">
          <div class="luna-period-caption">
            ${profile.label} の次回生理予定日
          </div>

          <div class="luna-period-next">
            ${
              stats.nextDate
                ? escapeHTML(formatDate(stats.nextDate))
                : "まだ予測できません"
            }
          </div>

          <p class="luna-period-note">
            ${
              stats.nextDate
                ? "設定した周期からの目安です。実際の日付とは前後することがあります。"
                : "生理開始日を記録すると、設定した周期をもとに予測します。"
            }
          </p>

          <div class="luna-period-stats">
            <div class="luna-period-stat">
              <span class="luna-period-caption">設定周期</span>
              <div style="display: flex; align-items: baseline; margin-top: 3px;">
                <input type="number" class="luna-period-cycle-input" value="${cycle}" min="1" max="100">
                <span style="font-size: 17px; font-weight: bold; margin-left: 4px;">日</span>
              </div>
            </div>

            <div class="luna-period-stat">
              <span class="luna-period-caption">開始日の記録</span>
              <strong>${records.length}回</strong>
            </div>
          </div>
        </div>

        <h3 class="luna-period-section-title">
          生理開始日を記録
        </h3>

        <form class="luna-period-entry" data-form="add">
          <input
            class="luna-period-date"
            type="date"
            name="startDate"
            max="${today}"
            value="${today}"
            required
            aria-label="生理開始日"
          >

          <button class="luna-period-add" type="submit">
            ＋ 記録する
          </button>
        </form>

        <p
          class="luna-period-message"
          aria-live="polite"
          data-message
        ></p>

        <h3 class="luna-period-section-title">
          過去の記録
        </h3>

        <div class="luna-period-list">
          ${
            records.length
              ? records.slice().reverse().map((date, index) => {
                  const originalIndex = records.length - 1 - index;
                  const nextOlder = records[originalIndex - 1];

                  const interval = nextOlder
                    ? dayDifference(
                        parseISODate(nextOlder),
                        parseISODate(date)
                      )
                    : null;

                  return `
                    <div class="luna-period-record">
                      <div>
                        <div class="luna-period-record-date">
                          ${escapeHTML(formatDate(date))}
                        </div>

                        <div class="luna-period-record-meta">
                          ${
                            interval
                              ? `前回から ${interval}日`
                              : "最初の記録"
                          }
                        </div>
                      </div>

                      <button
                        class="luna-period-delete"
                        type="button"
                        data-delete="${escapeHTML(date)}"
                      >
                        削除
                      </button>
                    </div>
                  `;
                }).join("")
              : `
                <div class="luna-period-empty">
                  まだ記録がありません。
                </div>
              `
          }
        </div>

        <div class="luna-period-tools">
          <button
            class="luna-period-tool"
            type="button"
            data-action="export"
          >
            バックアップを書き出す
          </button>

          <button
            class="luna-period-tool"
            type="button"
            data-action="import"
          >
            バックアップを読み込む
          </button>
        </div>

        <p class="luna-period-footnote">
          記録はRealtime Databaseに安全に保存されます。
          端末を変更してもデータが同期されます。
          予測日は目安であり、周期が安定していない時期は
          大きく変動することがあります。
        </p>
      </section>
    `;

    // 閉じる
    overlay.querySelector(
      '[data-action="close"]'
    ).addEventListener("click", close);

    // ユーザー切り替え
    overlay.querySelectorAll("[data-profile]").forEach(button => {
      button.addEventListener("click", () => {
        activeProfile = button.dataset.profile;
        render();
      });
    });

    // 周期の保存（手動入力）
    const cycleInput = overlay.querySelector('.luna-period-cycle-input');
    if (cycleInput) {
      cycleInput.addEventListener('change', async (event) => {
        let val = parseInt(event.target.value, 10);
        if (isNaN(val) || val < 1) val = 28; // 不正な値のフォールバック
        
        const current = await loadData();
        current.cycles[activeProfile] = val;
        if (await saveData(current)) {
          render();
        }
      });
    }

    // 日にち入力時の経過日数表示
    const dateInput = overlay.querySelector('.luna-period-date');
    const messageEl = overlay.querySelector('[data-message]');
    
    function updateDateMessage() {
      const selectedDateStr = dateInput.value;
      const selectedDate = parseISODate(selectedDateStr);
      if (!selectedDate) {
        messageEl.textContent = "";
        return;
      }
      
      // 選択した日付より前の記録から最新のものを取得
      const pastRecords = records.filter(d => d < selectedDateStr).sort();
      if (pastRecords.length > 0) {
        const lastRecordDate = parseISODate(pastRecords[pastRecords.length - 1]);
        const diffDays = dayDifference(lastRecordDate, selectedDate);
        messageEl.textContent = `前回から${diffDays}日です`;
      } else {
        messageEl.textContent = "";
      }
    }

    dateInput.addEventListener('input', updateDateMessage);
    updateDateMessage(); // 初期表示時の計算

    // 新規登録
    overlay.querySelector(
      '[data-form="add"]'
    ).addEventListener("submit", async event => {
      event.preventDefault();

      const value = new FormData(
        event.currentTarget
      ).get("startDate");

      const date = parseISODate(value);

      if (!date || value > todayISO()) {
        messageEl.textContent = "今日までの日付を選択してください。";
        return;
      }

      const current = await loadData();

      if (current[activeProfile].includes(value)) {
        messageEl.textContent = "この日付はすでに記録されています。";
        return;
      }

      current[activeProfile].push(value);
      current[activeProfile].sort();

      if (await saveData(current)) {
        render();
      }
    });

    // 記録削除
    overlay.querySelectorAll("[data-delete]").forEach(button => {
      button.addEventListener("click", async () => {
        const date = button.dataset.delete;

        if (!confirm(
          `${formatDate(date)} の記録を削除しますか？`
        )) {
          return;
        }

        const current = await loadData();

        current[activeProfile] =
          current[activeProfile].filter(
            item => item !== date
          );

        if (await saveData(current)) {
          render();
        }
      });
    });

    // バックアップ
    overlay.querySelector(
      '[data-action="export"]'
    ).addEventListener("click", exportBackup);

    // 復元
    overlay.querySelector(
      '[data-action="import"]'
    ).addEventListener("click", () => {
      importInput.click();
    });
  }

  // JSON書き出し
  async function exportBackup() {
    const data = await loadData();

    const blob = new Blob(
      [
        JSON.stringify({
          app: "Luna Diary",
          version: 1,
          exportedAt: new Date().toISOString(),
          records: data
        }, null, 2)
      ],
      { type: "application/json" }
    );

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download =
      `luna-diary-backup-${todayISO()}.json`;

    document.body.appendChild(link);
    link.click();
    link.remove();

    URL.revokeObjectURL(url);
  }

  // JSON読み込み
  function importBackup(file) {
    const reader = new FileReader();

    reader.onload = async () => {
      try {
        const parsed = JSON.parse(reader.result);
        const source = parsed.records || parsed;

        const imported = {
          ru: [],
          hi: [],
          cycles: { ru: 28, hi: 28 }
        };

        for (const profile of PROFILES) {
          const rows = Array.isArray(
            source[profile.id]
          )
            ? source[profile.id]
            : [];

          imported[profile.id] = [...new Set(
            rows.filter(value =>
              typeof value === "string" &&
              parseISODate(value)
            )
          )].sort();
        }
        
        // 周期データの引き継ぎ
        if (source.cycles) {
          imported.cycles = { ...imported.cycles, ...source.cycles };
        }

        if (!confirm(
          "現在の記録をバックアップの内容に置き換えます。よろしいですか？"
        )) {
          return;
        }

        if (await saveData(imported)) {
          alert("バックアップを読み込みました。");
          render();
        }

      } catch (error) {
        alert(
          "バックアップを読み込めませんでした。JSONファイルを確認してください。"
        );

      } finally {
        importInput.value = "";
      }
    };

    reader.readAsText(file);
  }

  // モーダルを開く
  async function open() {
    ensureStyles();

    if (overlay) {
      overlay.hidden = false;

      if (!overlay._lunaKeyHandler) {
        const onKeyDown = event => {
          if (
            event.key === "Escape" &&
            overlay &&
            !overlay.hidden
          ) {
            close();
          }
        };

        document.addEventListener(
          "keydown",
          onKeyDown
        );

        overlay._lunaKeyHandler = onKeyDown;
      }

      await render();
      return;
    }

    overlay = document.createElement("div");
    overlay.className = "luna-period-overlay";

    overlay.addEventListener("click", event => {
      if (event.target === overlay) {
        close();
      }
    });

    document.body.appendChild(overlay);

    // バックアップ読み込み用
    importInput = document.createElement("input");
    importInput.type = "file";
    importInput.accept = ".json,application/json";
    importInput.hidden = true;

    importInput.addEventListener("change", () => {
      if (
        importInput.files &&
        importInput.files[0]
      ) {
        importBackup(importInput.files[0]);
      }
    });

    document.body.appendChild(importInput);

    // Escapeキーで閉じる
    const onKeyDown = event => {
      if (
        event.key === "Escape" &&
        overlay &&
        !overlay.hidden
      ) {
        close();
      }
    };

    document.addEventListener(
      "keydown",
      onKeyDown
    );

    overlay._lunaKeyHandler = onKeyDown;

    await render();

    const closeBtn = overlay.querySelector(".luna-period-close");
    if (closeBtn) closeBtn.focus();
  }

  // モーダルを閉じる
  function close() {
    if (!overlay) return;

    overlay.hidden = true;

    if (overlay._lunaKeyHandler) {
      document.removeEventListener(
        "keydown",
        overlay._lunaKeyHandler
      );

      overlay._lunaKeyHandler = null;
    }
  }

  // 外部から呼び出す機能
  window.PeriodModal = Object.freeze({
    open,
    close
  });

})();
