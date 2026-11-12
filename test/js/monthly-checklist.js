// js/monthly-checklist.js

const STORAGE_KEY = 'monthly_checklist_state_v1';

const CHECKLIST_ITEMS = [
  "スクリレで連絡する",
  "学級担任に連絡する",
  "ダスキンのお金をばあばに渡す",
  "自治会費をばあばに渡す",
  "前月分の使途報告をまとめる",
  "チャレンジを見て漢字ドリルなどの問題を作成する",
  "翌月分のピアノの月謝を用意する",
  "翌月分の習字の月謝を用意する",
  "SAISONカード引落額確認18日",
  "PayPayカード引落額確認",
  "セブンカード引落額確認",
  "口座の残高が足りるか確認",
  "給与明細をプリントアウトする",
  "翌月のカレンダーに予定を記入する"
];

class MonthlyChecklistModalManager {
  constructor() {
    this.initialized = false;
    this.modalOverlay = null;
    this.container = null;
  }

  init() {
    if (this.initialized) return;

    // モーダルのHTMLが存在しない場合は動的に生成してbodyに追加
    if (!document.getElementById('monthly-checklist-modal-overlay')) {
      const modalHTML = `
        <div id="monthly-checklist-modal-overlay" class="modal-overlay">
          <div class="modal-container" style="max-width: 520px;">
            <div class="modal-header">
              <div class="modal-title" style="display: flex; align-items: center; gap: 8px;">
                <span>📖</span> 月ごとの予定チェックリスト
              </div>
              <button id="monthly-checklist-modal-close-x" class="modal-close-btn">✕</button>
            </div>
            <div class="modal-body" style="gap: 12px; max-height: 60vh; overflow-y: auto;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                <div class="section-title" style="margin-bottom: 0;">今月の確認項目</div>
                <button id="monthly-reset-btn" class="secondary-btn" style="font-size: 0.75rem; color: #fb7185; border-color: rgba(244, 63, 94, 0.3);">すべてはずす</button>
              </div>
              <div id="monthly-checklist-container" style="display: flex; flex-direction: column; gap: 10px;"></div>
            </div>
            <div class="modal-footer">
              <div></div>
              <button id="monthly-checklist-close-btn" class="secondary-btn">閉じる</button>
            </div>
          </div>
        </div>
      `;
      document.body.insertAdjacentHTML('beforeend', modalHTML);
    }

    this.modalOverlay = document.getElementById('monthly-checklist-modal-overlay');
    this.container = document.getElementById('monthly-checklist-container');
    const closeBtn = document.getElementById('monthly-checklist-close-btn');
    const closeXBtn = document.getElementById('monthly-checklist-modal-close-x');
    const resetBtn = document.getElementById('monthly-reset-btn');

    if (closeBtn) closeBtn.addEventListener('click', () => this.close());
    if (closeXBtn) closeXBtn.addEventListener('click', () => this.close());
    if (this.modalOverlay) {
      this.modalOverlay.addEventListener('click', (e) => {
        if (e.target === this.modalOverlay) this.close();
      });
    }

    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        localStorage.removeItem(STORAGE_KEY);
        this.renderChecklist();
      });
    }

    this.initialized = true;
  }

  renderChecklist() {
    if (!this.container) return;

    let savedState = {};
    try {
      savedState = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
    } catch (e) {
      savedState = {};
    }

    this.container.innerHTML = '';
    CHECKLIST_ITEMS.forEach((text, index) => {
      const isChecked = !!savedState[index];
      const itemWrapper = document.createElement('label');
      itemWrapper.style.cssText = "display: flex; align-items: flex-start; gap: 12px; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); padding: 12px 14px; border-radius: 10px; cursor: pointer; transition: all 0.2s;";

      itemWrapper.onmouseover = () => itemWrapper.style.background = "rgba(168, 85, 247, 0.08)";
      itemWrapper.onmouseout = () => itemWrapper.style.background = "rgba(255,255,255,0.03)";

      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.checked = isChecked;
      checkbox.dataset.index = index;
      checkbox.style.cssText = "width: 18px; height: 18px; accent-color: #ec4899; cursor: pointer; margin-top: 1px; border-radius: 4px; flex-shrink: 0;";

      const textSpan = document.createElement('span');
      textSpan.textContent = text;
      textSpan.style.cssText = "font-size: 0.9rem; line-height: 1.4; color: #f1f5f9; word-break: break-all; transition: all 0.2s;";
      this.updateTextStyle(textSpan, isChecked);

      checkbox.addEventListener('change', (e) => {
        let currentStates = {};
        try {
          currentStates = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
        } catch (err) {
          currentStates = {};
        }
        currentStates[index] = e.target.checked;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(currentStates));
        this.updateTextStyle(textSpan, e.target.checked);
      });

      itemWrapper.appendChild(checkbox);
      itemWrapper.appendChild(textSpan);
      this.container.appendChild(itemWrapper);
    });
  }

  updateTextStyle(span, checked) {
    if (checked) {
      span.style.textDecoration = 'line-through';
      span.style.color = '#94a3b8';
    } else {
      span.style.textDecoration = 'none';
      span.style.color = '#f1f5f9';
    }
  }

  open() {
    this.init();
    this.renderChecklist();
    if (this.modalOverlay) {
      this.modalOverlay.classList.add('active');
    }
  }

  close() {
    if (this.modalOverlay) {
      this.modalOverlay.classList.remove('active');
    }
  }
}

const instance = new MonthlyChecklistModalManager();

// グローバルから確実に呼び出せるように即時登録
window.MonthlyChecklistModal = {
  open: () => instance.open(),
  close: () => instance.close()
};

// DOM読み込み完了時に初期化およびボタンのイベントリスナーを登録
const setupChecklistModal = () => {
  instance.init();
  const openBtn = document.getElementById('monthly-checklist-modal-open-btn');
  if (openBtn && !openBtn.dataset.checklistBound) {
    openBtn.dataset.checklistBound = 'true';
    openBtn.addEventListener('click', (e) => {
      e.preventDefault();
      instance.open();
    });
  }
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', setupChecklistModal);
} else {
  setupChecklistModal();
}

export const MonthlyChecklistModal = window.MonthlyChecklistModal;