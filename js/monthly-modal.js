import { db } from "./config.js";
// Firebase SDKがModular / Compatどちらであっても安全にインポート・利用できるように配慮
import { doc, getDoc, setDoc, onSnapshot } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

document.addEventListener('DOMContentLoaded', () => {
  // タブ1の初期項目
  const initialChecklistItems = [
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

  // タブ2の月ごとの初期データ
  const initialMonthlyData = [
    {
      summary: "１月",
      details: [
        "１月３日 お坊さん お菓子を用意",
        "１月７日 七草粥",
        "１月１５日 善哉",
        "１月１５日 正月飾りを片付ける",
        "１月３１日 Amazon支払い",
        "恵方巻を予約する",
        "美容室の予約をする（３月から花粉症で大変）"
      ]
    },
    {
      summary: "２月",
      details: [
        "節分の日に恵方巻を食べる",
        "サッカー、ユニフォームレプリカ買うなら２月",
        "１８日 結婚記念日"
      ]
    },
    {
      summary: "３月",
      details: [
        "ピアノの調律をお願いする",
        "天気予報で最高気温が１０℃超えないならダウン着てく",
        "９年生を送る会は中学生の卒業式",
        "前期課程修了式は小学生の卒業式",
        "親戚の子の入学祝を渡す １万円",
        "京都・東山 花灯路",
        "花粉症 二重マスク（布マスク＋サージカルマスク）"
      ]
    },
    {
      summary: "４月",
      details: [
        "お花見",
        "タイヤ交換",
        "車の税金支払い",
        "OTTADEの電池を変える（単５）",
        "スクリレ毎年登録必要"
      ]
    },
    {
      summary: "５月",
      details: [
        "夏服を買う",
        "ゴールデンウィークは苗箱作り、田植え",
        "５月３０日 お母さん誕生日"
      ]
    },
    {
      summary: "６月",
      details: [
        "６月３０日 水無月を食べる",
        "冷蔵庫の製氷フィルター交換 R８年７月→",
        "６月の第３日曜日、父の日",
        "６月２0日以降、寝るときエアコン冷房２７度しずか、朝方４時にはOFFになるようにする",
        "体育祭",
        "学校の美化活動",
        "７月３0日は休みにする"
      ]
    },
    {
      summary: "７月",
      details: [
        "ふみの日記念切手を買う",
        "ひなたちゃんの誕生日ケーキを予約する",
        "土用の丑の日にうな重を食べる",
        "黒酢とFe入り飲料（飲むの忘れると体力激低下）",
        "中町の納涼祭",
        "勝林島のお祭り"
      ]
    },
    {
      summary: "８月",
      details: [
        "夏休みが終わるころ、上履きが小さくなって履けない。早めに買いに行く。"
      ]
    },
    {
      summary: "９月",
      details: [
        "蚊に注意",
        "AEONのネットショップでおせち予約"
      ]
    },
    {
      summary: "１０月",
      details: [
        "インフルエンザ予防接種予約",
        "冬服を買う",
        "１０月３1日ハロウィン"
      ]
    },
    {
      summary: "１１月",
      details: [
        "ソフトバレー大会",
        "自転車の保険更新（自分の自転車）",
        "ケンタッキークリスマス予約",
        "１１月１8日UNIQLO感謝祭",
        "１１月２5日頃ブラックフライデー",
        "クリスマスプレゼント用意"
      ]
    },
    {
      summary: "１２月",
      details: [
        "お年玉用の診察を用意する",
        "ダウンコート＋インナーダウン"
      ]
    }
  ];

  const modalOverlay = document.getElementById('monthly-checklist-modal-overlay');
  const openBtn = document.getElementById('monthly-checklist-modal-open-btn');
  const closeBtn = document.getElementById('monthly-checklist-close-btn');
  const closeXBtn = document.getElementById('monthly-checklist-modal-close-x');
  
  const tabBtn1 = document.getElementById('tab-btn-1');
  const tabBtn2 = document.getElementById('tab-btn-2');
  const tabContent1 = document.getElementById('tab-content-1');
  const tabContent2 = document.getElementById('tab-content-2');

  const resetBtn1 = document.getElementById('monthly-reset-btn');
  const resetBtn2 = document.getElementById('monthly-reset-tab2-btn');
  
  const container1 = document.getElementById('monthly-checklist-container');
  const container2 = document.getElementById('monthly-accordion-container');

  // Firebase Firestore Doc Reference for ToDo & Monthly schedule storage
  const docRef = doc(db, "app_settings", "monthly_checklist_data");

  let appData = {
    checklistState: {},
    checklistCustom: initialChecklistItems,
    accordionState: {},
    accordionCustom: initialMonthlyData
  };

  // Firebaseからデータを同期取得（リアルタイム監視）
  onSnapshot(docRef, (docSnap) => {
    if (docSnap.exists()) {
      const remoteData = docSnap.data();
      if (remoteData.checklistState) appData.checklistState = remoteData.checklistState;
      if (remoteData.checklistCustom) appData.checklistCustom = remoteData.checklistCustom;
      if (remoteData.accordionState) appData.accordionState = remoteData.accordionState;
      if (remoteData.accordionCustom) appData.accordionCustom = remoteData.accordionCustom;
    } else {
      // 初回データがない場合は初期データを書き込む
      saveToFirebase();
    }
    renderChecklist1();
    renderChecklist2();
  }, (error) => {
    console.error("Firebase sync error, fallback to localStorage:", error);
    // 万が一オフラインやエラーの場合はローカルストレージにフォールバック
    loadFromLocalStorage();
    renderChecklist1();
    renderChecklist2();
  });

  async function saveToFirebase() {
    try {
      await setDoc(docRef, appData, { merge: true });
    } catch (e) {
      console.error("Failed to save to Firebase:", e);
      saveToLocalStorage();
    }
  }

  function loadFromLocalStorage() {
    try {
      appData.checklistState = JSON.parse(localStorage.getItem('monthly_checklist_state_v1')) || {};
      appData.checklistCustom = JSON.parse(localStorage.getItem('monthly_checklist_custom_data_v1')) || initialChecklistItems;
      appData.accordionState = JSON.parse(localStorage.getItem('monthly_accordion_state_v1')) || {};
      appData.accordionCustom = JSON.parse(localStorage.getItem('monthly_accordion_custom_data_v1')) || initialMonthlyData;
    } catch(e) {}
  }

  function saveToLocalStorage() {
    localStorage.setItem('monthly_checklist_state_v1', JSON.stringify(appData.checklistState));
    localStorage.setItem('monthly_checklist_custom_data_v1', JSON.stringify(appData.checklistCustom));
    localStorage.setItem('monthly_accordion_state_v1', JSON.stringify(appData.accordionState));
    localStorage.setItem('monthly_accordion_custom_data_v1', JSON.stringify(appData.accordionCustom));
  }

  // タブ切替処理
  if (tabBtn1 && tabBtn2) {
    tabBtn1.addEventListener('click', () => {
      tabBtn1.classList.add('active');
      tabBtn1.style.borderBottom = '2px solid var(--accent-purple)';
      tabBtn2.classList.remove('active');
      tabBtn2.style.borderBottom = 'none';
      tabContent1.style.display = 'flex';
      tabContent2.style.display = 'none';
    });

    tabBtn2.addEventListener('click', () => {
      tabBtn2.classList.add('active');
      tabBtn2.style.borderBottom = '2px solid var(--accent-purple)';
      tabBtn1.classList.remove('active');
      tabBtn1.style.borderBottom = 'none';
      tabContent2.style.display = 'flex';
      tabContent1.style.display = 'none';
    });
  }

  // タブ1（ToDoList：編集・追加機能付き）の描画
  function renderChecklist1() {
    if (!container1) return;
    container1.innerHTML = '';
    
    appData.checklistCustom.forEach((text, index) => {
      const isChecked = !!appData.checklistState[index];
      const itemWrapper = document.createElement('div');
      itemWrapper.style.cssText = "display: flex; align-items: flex-start; gap: 10px; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); padding: 10px 14px; border-radius: 10px; transition: all 0.2s;";
      
      itemWrapper.onmouseover = () => itemWrapper.style.background = "rgba(168, 85, 247, 0.08)";
      itemWrapper.onmouseout = () => itemWrapper.style.background = "rgba(255,255,255,0.03)";

      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.checked = isChecked;
      checkbox.style.cssText = "width: 18px; height: 18px; accent-color: #ec4899; cursor: pointer; margin-top: 2px; border-radius: 4px; flex-shrink: 0;";

      checkbox.addEventListener('change', (e) => {
        appData.checklistState[index] = e.target.checked;
        saveToFirebase();
        updateTextStyle(textSpan, e.target.checked);
      });

      const textSpan = document.createElement('span');
      textSpan.textContent = text;
      textSpan.style.cssText = "font-size: 0.9rem; line-height: 1.4; color: #f1f5f9; word-break: break-all; flex: 1; padding-top: 1px; transition: all 0.2s;";
      updateTextStyle(textSpan, isChecked);

      // 編集ボタン
      const editBtn = document.createElement('button');
      editBtn.innerHTML = '<i class="fa-solid fa-pen"></i>';
      editBtn.title = "編集";
      editBtn.style.cssText = "background: none; border: none; color: var(--text-muted); cursor: pointer; font-size: 0.75rem; padding: 4px; transition: color 0.2s; flex-shrink: 0;";
      editBtn.onmouseover = () => editBtn.style.color = "#fff";
      editBtn.onmouseout = () => editBtn.style.color = "var(--text-muted)";

      editBtn.addEventListener('click', () => {
        const inputField = document.createElement('input');
        inputField.type = 'text';
        inputField.value = textSpan.textContent;
        inputField.className = 'input-field-cal';
        inputField.style.cssText = "font-size: 0.9rem; padding: 4px 8px; width: 100%; border-radius: 6px;";

        itemWrapper.replaceChild(inputField, textSpan);
        editBtn.style.display = 'none';
        inputField.focus();

        const saveEdit = () => {
          const newVal = inputField.value.trim();
          if (newVal !== "") {
            appData.checklistCustom[index] = newVal;
            saveToFirebase();
          }
          renderChecklist1();
        };

        inputField.addEventListener('blur', saveEdit);
        inputField.addEventListener('keydown', (e) => {
          if (e.key === 'Enter') saveEdit();
        });
      });

      // 削除ボタン
      const deleteBtn = document.createElement('button');
      deleteBtn.innerHTML = '<i class="fa-solid fa-trash"></i>';
      deleteBtn.title = "削除";
      deleteBtn.style.cssText = "background: none; border: none; color: rgba(244, 63, 94, 0.7); cursor: pointer; font-size: 0.75rem; padding: 4px; transition: color 0.2s; flex-shrink: 0;";
      deleteBtn.onmouseover = () => deleteBtn.style.color = "#f43f5e";
      deleteBtn.onmouseout = () => deleteBtn.style.color = "rgba(244, 63, 94, 0.7)";

      deleteBtn.addEventListener('click', () => {
        appData.checklistCustom.splice(index, 1);
        saveToFirebase();
        renderChecklist1();
      });

      itemWrapper.appendChild(checkbox);
      itemWrapper.appendChild(textSpan);
      itemWrapper.appendChild(editBtn);
      itemWrapper.appendChild(deleteBtn);
      container1.appendChild(itemWrapper);
    });

    // 項目追加用コンテナ
    const addRow = document.createElement('div');
    addRow.style.cssText = "display: flex; gap: 8px; margin-top: 4px;";

    const addInput = document.createElement('input');
    addInput.type = 'text';
    addInput.placeholder = '新しい確認項目を追加...';
    addInput.className = 'input-field-cal';
    addInput.style.cssText = "font-size: 0.88rem; padding: 8px 12px; border-radius: 8px; flex: 1;";

    const addBtn = document.createElement('button');
    addBtn.textContent = '追加';
    addBtn.className = 'secondary-btn';
    addBtn.style.cssText = "font-size: 0.8rem; padding: 8px 16px; background: rgba(168, 85, 247, 0.15); border-color: rgba(168, 85, 247, 0.4); color: #d8b4fe;";

    const handleAdd = () => {
      const val = addInput.value.trim();
      if (val) {
        appData.checklistCustom.push(val);
        saveToFirebase();
        renderChecklist1();
      }
    };

    addBtn.addEventListener('click', handleAdd);
    addInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') handleAdd();
    });

    addRow.appendChild(addInput);
    addRow.appendChild(addBtn);
    container1.appendChild(addRow);
  }

  // タブ2（月ごとのアコーディオン、編集・追加機能付き）の描画
  function renderChecklist2() {
    if (!container2) return;
    container2.innerHTML = '';

    appData.accordionCustom.forEach((monthObj, mIndex) => {
      const detailsEl = document.createElement('details');
      detailsEl.style.cssText = "background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 10px; overflow: hidden; transition: all 0.2s;";

      const summaryEl = document.createElement('summary');
      summaryEl.textContent = monthObj.summary;
      summaryEl.style.cssText = "padding: 12px 16px; font-weight: 700; font-size: 0.95rem; color: #d8b4fe; cursor: pointer; user-select: none; background: rgba(168, 85, 247, 0.05); outline: none;";
      
      summaryEl.onmouseover = () => summaryEl.style.background = "rgba(168, 85, 247, 0.12)";
      summaryEl.onmouseout = () => summaryEl.style.background = "rgba(168, 85, 247, 0.05)";

      const contentDiv = document.createElement('div');
      contentDiv.style.cssText = "padding: 12px 16px; display: flex; flex-direction: column; gap: 8px; border-top: 1px solid rgba(255,255,255,0.05);";

      monthObj.details.forEach((detailText, dIndex) => {
        const uniqueKey = `${mIndex}-${dIndex}`;
        const isChecked = !!appData.accordionState[uniqueKey];

        const itemWrapper = document.createElement('div');
        itemWrapper.style.cssText = "display: flex; align-items: flex-start; gap: 10px; padding: 8px 10px; background: rgba(0,0,0,0.15); border-radius: 8px; transition: all 0.2s;";

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = isChecked;
        checkbox.style.cssText = "width: 16px; height: 16px; accent-color: #ec4899; cursor: pointer; margin-top: 4px; border-radius: 4px; flex-shrink: 0;";

        checkbox.addEventListener('change', (e) => {
          appData.accordionState[uniqueKey] = e.target.checked;
          saveToFirebase();
          updateTextStyle(textSpan, e.target.checked);
        });

        const textSpan = document.createElement('span');
        textSpan.textContent = detailText;
        textSpan.style.cssText = "font-size: 0.88rem; line-height: 1.4; color: #f1f5f9; word-break: break-all; flex: 1; padding-top: 1px;";
        updateTextStyle(textSpan, isChecked);

        // 編集ボタン
        const editBtn = document.createElement('button');
        editBtn.innerHTML = '<i class="fa-solid fa-pen"></i>';
        editBtn.title = "編集";
        editBtn.style.cssText = "background: none; border: none; color: var(--text-muted); cursor: pointer; font-size: 0.75rem; padding: 4px; transition: color 0.2s; flex-shrink: 0;";
        editBtn.onmouseover = () => editBtn.style.color = "#fff";
        editBtn.onmouseout = () => editBtn.style.color = "var(--text-muted)";

        editBtn.addEventListener('click', () => {
          const inputField = document.createElement('input');
          inputField.type = 'text';
          inputField.value = textSpan.textContent;
          inputField.className = 'input-field-cal';
          inputField.style.cssText = "font-size: 0.88rem; padding: 4px 8px; width: 100%; border-radius: 6px;";

          itemWrapper.replaceChild(inputField, textSpan);
          editBtn.style.display = 'none';
          inputField.focus();

          const saveEdit = () => {
            const newVal = inputField.value.trim();
            if (newVal !== "") {
              appData.accordionCustom[mIndex].details[dIndex] = newVal;
              saveToFirebase();
            }
            renderChecklist2();
          };

          inputField.addEventListener('blur', saveEdit);
          inputField.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') saveEdit();
          });
        });

        // 削除ボタン
        const deleteBtn = document.createElement('button');
        deleteBtn.innerHTML = '<i class="fa-solid fa-trash"></i>';
        deleteBtn.title = "削除";
        deleteBtn.style.cssText = "background: none; border: none; color: rgba(244, 63, 94, 0.7); cursor: pointer; font-size: 0.75rem; padding: 4px; transition: color 0.2s; flex-shrink: 0;";
        deleteBtn.onmouseover = () => deleteBtn.style.color = "#f43f5e";
        deleteBtn.onmouseout = () => deleteBtn.style.color = "rgba(244, 63, 94, 0.7)";

        deleteBtn.addEventListener('click', () => {
          appData.accordionCustom[mIndex].details.splice(dIndex, 1);
          saveToFirebase();
          renderChecklist2();
        });

        itemWrapper.appendChild(checkbox);
        itemWrapper.appendChild(textSpan);
        itemWrapper.appendChild(editBtn);
        itemWrapper.appendChild(deleteBtn);
        contentDiv.appendChild(itemWrapper);
      });

      // 項目追加用コンテナ
      const addRow = document.createElement('div');
      addRow.style.cssText = "display: flex; gap: 8px; margin-top: 4px;";

      const addInput = document.createElement('input');
      addInput.type = 'text';
      addInput.placeholder = '新しい予定を追加...';
      addInput.className = 'input-field-cal';
      addInput.style.cssText = "font-size: 0.85rem; padding: 6px 10px; border-radius: 6px; flex: 1;";

      const addBtn = document.createElement('button');
      addBtn.textContent = '追加';
      addBtn.className = 'secondary-btn';
      addBtn.style.cssText = "font-size: 0.75rem; padding: 6px 12px; background: rgba(168, 85, 247, 0.15); border-color: rgba(168, 85, 247, 0.4); color: #d8b4fe;";

      const handleAdd = () => {
        const val = addInput.value.trim();
        if (val) {
          appData.accordionCustom[mIndex].details.push(val);
          saveToFirebase();
          renderChecklist2();
        }
      };

      addBtn.addEventListener('click', handleAdd);
      addInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') handleAdd();
      });

      addRow.appendChild(addInput);
      addRow.appendChild(addBtn);
      contentDiv.appendChild(addRow);

      detailsEl.appendChild(summaryEl);
      detailsEl.appendChild(contentDiv);
      container2.appendChild(detailsEl);
    });
  }

  function updateTextStyle(span, checked) {
    if (checked) {
      span.style.textDecoration = 'line-through';
      span.style.color = '#94a3b8';
    } else {
      span.style.textDecoration = 'none';
      span.style.color = '#f1f5f9';
    }
  }

  if (openBtn && modalOverlay) {
    openBtn.addEventListener('click', () => {
      modalOverlay.classList.add('active');
    });
  }

  const closeModal = () => {
    if (modalOverlay) modalOverlay.classList.remove('active');
  };

  if (closeBtn) closeBtn.addEventListener('click', closeModal);
  if (closeXBtn) closeXBtn.addEventListener('click', closeModal);
  if (modalOverlay) {
    modalOverlay.addEventListener('click', (e) => {
      if (e.target === modalOverlay) closeModal();
    });
  }

  // タブ1リセット
  if (resetBtn1) {
    resetBtn1.addEventListener('click', () => {
      appData.checklistState = {};
      appData.checklistCustom = initialChecklistItems;
      saveToFirebase();
      renderChecklist1();
    });
  }

  // タブ2リセット
  if (resetBtn2) {
    resetBtn2.addEventListener('click', () => {
      appData.accordionState = {};
      appData.accordionCustom = initialMonthlyData;
      saveToFirebase();
      renderChecklist2();
    });
  }
});