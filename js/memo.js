import { ref, push, onValue, remove, update } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";
import { db, messagesRef, stampHistoryRef } from "./config.js";

const chatBox = document.getElementById('chat-box');
const messageInput = document.getElementById('message-input');
const sendBtn = document.getElementById('send-btn');
const fileInput = document.getElementById('file-input');

const hamburgerBtn = document.getElementById('hamburger-btn');
const sidebar = document.getElementById('sidebar');
const overlay = document.getElementById('overlay');

const modalOpenBtn = document.getElementById('modal-open-btn');
const footerStampHistoryBtn = document.getElementById('footer-stamp-history-btn');
const commentModalOverlay = document.getElementById('comment-modal-overlay');
const modalCloseX = document.getElementById('modal-close-x');
const modalCloseBtn = document.getElementById('modal-close-btn');
const modalSubmitBtn = document.getElementById('modal-submit-btn');
const modalClearBtn = document.getElementById('modal-clear-btn');
const modalTextInput = document.getElementById('modal-text-input');
const emojiPalette = document.getElementById('emoji-palette');
const kaimojiPalette = document.getElementById('kaimoji-palette');

const historyModalOverlay = document.getElementById('history-modal-overlay');
const historyModalCloseX = document.getElementById('history-modal-close-x');
const historyModalCloseBtn = document.getElementById('history-modal-close-btn');
const historyGrid = document.getElementById('history-grid');
const stampUploadInput = document.getElementById('stamp-upload-input');

let cachedMessages = {};
let cachedStampHistory = {};

const emojis = ['✨', '👑', '💘', '❤', '🔥', '😊', '😍', '👏', '🎉', '🙌', '🌟', '👍', '💐', '🥰', '💯'];
const kaimojis = ['( ﾟДﾟ)', '( *´艸｀)', '( ;∀;)', '(^^)ﾉｼ'];

function insertAtCursor(field, text) {
  const startPos = field.selectionStart;
  const endPos = field.selectionEnd;
  field.value = field.value.substring(0, startPos) + text + field.value.substring(endPos);
  field.focus();
  field.setSelectionRange(startPos + text.length, startPos + text.length);
}

emojis.forEach(emoji => {
  const btn = document.createElement('button');
  btn.className = 'palette-btn';
  btn.textContent = emoji;
  btn.type = 'button';
  btn.addEventListener('click', () => insertAtCursor(modalTextInput, emoji));
  emojiPalette.appendChild(btn);
});

kaimojis.forEach(kaimoji => {
  const btn = document.createElement('button');
  btn.className = 'palette-btn kaimoji-btn';
  btn.textContent = kaimoji;
  btn.type = 'button';
  btn.addEventListener('click', () => insertAtCursor(modalTextInput, kaimoji));
  kaimojiPalette.appendChild(btn);
});

modalOpenBtn.addEventListener('click', () => {
  modalTextInput.value = messageInput.value;
  commentModalOverlay.classList.add('active');
  setTimeout(() => modalTextInput.focus(), 50);
});
const closeModal = () => commentModalOverlay.classList.remove('active');
modalCloseX.addEventListener('click', closeModal);
modalCloseBtn.addEventListener('click', closeModal);
modalClearBtn.addEventListener('click', () => { modalTextInput.value = ''; modalTextInput.focus(); });

modalSubmitBtn.addEventListener('click', () => {
  const text = modalTextInput.value.trim();
  if (text) {
    push(messagesRef, { text: text, timestamp: Date.now() });
    modalTextInput.value = '';
    messageInput.value = '';
    messageInput.style.height = '42px';
  }
  closeModal();
});

footerStampHistoryBtn.addEventListener('click', () => {
  renderStampHistory();
  historyModalOverlay.classList.add('active');
});

stampUploadInput.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (event) => {
    push(stampHistoryRef, { dataUrl: event.target.result, timestamp: Date.now() });
    stampUploadInput.value = '';
  };
  reader.readAsDataURL(file);
});

onValue(stampHistoryRef, (snapshot) => {
  cachedStampHistory = snapshot.val() || {};
  if (historyModalOverlay.classList.contains('active')) renderStampHistory();
});

function renderStampHistory() {
  historyGrid.innerHTML = '';
  const keys = Object.keys(cachedStampHistory);
  if (keys.length === 0) {
    historyGrid.innerHTML = '<div style="color:var(--text-muted); font-size:0.85rem; grid-column:1/-1; text-align:center; padding: 20px;">履歴はありません</div>';
    return;
  }
  keys.reverse().forEach(key => {
    const item = cachedStampHistory[key];
    const card = document.createElement('div');
    card.className = 'history-card';
    card.innerHTML = `
      <div class="history-img-wrapper"><img src="${item.dataUrl}" class="history-img"></div>
      <div class="history-actions">
        <button class="history-action-btn send" data-key="${key}">💬 追加</button>
        <button class="history-action-btn del" data-key="${key}">🗑 削除</button>
      </div>
    `;
    card.querySelector('.send').addEventListener('click', () => {
      push(messagesRef, { text: '', fileData: item.dataUrl, fileName: `stamp_${Date.now()}.png`, isStamp: true, timestamp: Date.now() });
      historyModalOverlay.classList.remove('active');
    });
    card.querySelector('.del').addEventListener('click', () => {
      if (confirm('削除しますか？')) remove(ref(db, `stamp_history/${key}`));
    });
    historyGrid.appendChild(card);
  });
}

historyModalCloseX.addEventListener('click', () => historyModalOverlay.classList.remove('active'));
historyModalCloseBtn.addEventListener('click', () => historyModalOverlay.classList.remove('active'));

hamburgerBtn.addEventListener('click', () => { sidebar.classList.toggle('open'); overlay.classList.toggle('active'); });
overlay.addEventListener('click', () => { sidebar.classList.remove('open'); overlay.classList.remove('active'); });

function sendMessage() {
  const text = messageInput.value.trim();
  if (!text) return;
  push(messagesRef, { text: text, timestamp: Date.now() });
  messageInput.value = '';
  messageInput.style.height = '42px';
}

fileInput.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;

  if (file.type.startsWith('image/')) {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        const MAX_WIDTH = 800, MAX_HEIGHT = 800;
        if (width > height) {
          if (width > MAX_WIDTH) { height *= MAX_WIDTH / width; width = MAX_WIDTH; }
        } else {
          if (height > MAX_HEIGHT) { width *= MAX_HEIGHT / height; height = MAX_HEIGHT; }
        }
        canvas.width = width; canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        const resizedDataUrl = canvas.toDataURL('image/jpeg', 0.8);
        push(messagesRef, { text: '', fileData: resizedDataUrl, fileName: file.name, fileType: 'image/jpeg', isImage: true, timestamp: Date.now() });
        fileInput.value = '';
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  } else {
    const reader = new FileReader();
    reader.onload = (event) => {
      push(messagesRef, { text: '', fileData: event.target.result, fileName: file.name, fileType: file.type, isImage: false, timestamp: Date.now() });
      fileInput.value = '';
    };
    reader.readAsDataURL(file);
  }
});

function deleteMessage(key) {
  if (confirm('削除しますか？')) remove(ref(db, `memos/${key}`));
}

function updateMessage(key, newText) {
  if (!newText.trim()) return;
  update(ref(db, `memos/${key}`), { text: newText.trim() });
}

function renderFormattedText(container, text) {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  let lastIndex = 0, match;
  while ((match = urlRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      container.appendChild(document.createTextNode(text.substring(lastIndex, match.index)));
    }
    const link = document.createElement('a');
    link.href = match[0];
    link.textContent = match[0];
    link.className = 'chat-link';
    link.target = '_blank';
    container.appendChild(link);
    lastIndex = urlRegex.lastIndex;
  }
  if (lastIndex < text.length) {
    container.appendChild(document.createTextNode(text.substring(lastIndex)));
  }
}

export function scrollToBottom() {
  requestAnimationFrame(() => {
    chatBox.scrollTop = chatBox.scrollHeight;
  });
}

export function renderMessages() {
  chatBox.innerHTML = '';

  Object.keys(cachedMessages).forEach(key => {
    const msg = cachedMessages[key];
    const msgDiv = document.createElement('div');
    msgDiv.className = `message`;

    const bubble = document.createElement('div');
    bubble.className = `bubble ${msg.isStamp ? 'stamp-bubble' : ''}`;

    if (msg.fileData) {
      if (msg.isStamp) {
        const img = document.createElement('img'); img.src = msg.fileData; img.className = 'chat-stamp';
        bubble.appendChild(img);
      } else if (msg.isImage) {
        const img = document.createElement('img'); img.src = msg.fileData; img.className = 'chat-image';
        bubble.appendChild(img);
      } else {
        const fa = document.createElement('div'); fa.className = 'file-attachment';
        fa.innerHTML = `📄 <span class="file-name">${msg.fileName}</span>`;
        bubble.appendChild(fa);
      }
    }
    if (msg.text) {
      const tn = document.createElement('div');
      renderFormattedText(tn, msg.text);
      bubble.appendChild(tn);
    }

    const metaInfo = document.createElement('div');
    metaInfo.className = 'meta-info';
    const timestamp = document.createElement('span');
    timestamp.className = 'timestamp';
    const d = new Date(msg.timestamp);
    timestamp.textContent = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
    metaInfo.appendChild(timestamp);

    if (msg.text && !msg.fileData) {
      const copyBtn = document.createElement('button');
      copyBtn.className = 'copy-btn';
      copyBtn.textContent = 'コピー';
      copyBtn.addEventListener('click', () => {
        navigator.clipboard.writeText(msg.text).then(() => {
          copyBtn.textContent = 'コピー完了';
          setTimeout(() => { copyBtn.textContent = 'コピー'; }, 1500);
        });
      });
      metaInfo.appendChild(copyBtn);

      const editBtn = document.createElement('button');
      editBtn.className = 'edit-btn'; editBtn.textContent = '編集';
      editBtn.addEventListener('click', () => {
        bubble.innerHTML = '';
        const editContainer = document.createElement('div');
        editContainer.className = 'edit-container';
        const editTextArea = document.createElement('textarea');
        editTextArea.className = 'edit-textarea';
        editTextArea.value = msg.text;
        editContainer.appendChild(editTextArea);

        const editActions = document.createElement('div');
        editActions.className = 'edit-actions';
        const saveBtn = document.createElement('button');
        saveBtn.className = 'edit-save-btn'; saveBtn.textContent = '保存';
        const cancelBtn = document.createElement('button');
        cancelBtn.className = 'edit-cancel-btn'; cancelBtn.textContent = 'キャンセル';

        editActions.appendChild(cancelBtn);
        editActions.appendChild(saveBtn);
        editContainer.appendChild(editActions);
        bubble.appendChild(editContainer);
        editTextArea.focus();

        saveBtn.addEventListener('click', () => updateMessage(key, editTextArea.value));
        cancelBtn.addEventListener('click', () => renderMessages());
      });
      metaInfo.appendChild(editBtn);
    }

    if (msg.fileData) {
      const dlBtn = document.createElement('button');
      dlBtn.className = 'delete-btn'; dlBtn.textContent = 'ダウンロード';
      dlBtn.addEventListener('click', () => {
        const a = document.createElement('a'); a.href = msg.fileData; a.download = msg.fileName || 'download'; a.click();
      });
      metaInfo.appendChild(dlBtn);
    }
    
    const delBtn = document.createElement('button');
    delBtn.className = 'delete-btn'; delBtn.textContent = '削除';
    delBtn.addEventListener('click', () => deleteMessage(key));
    metaInfo.appendChild(delBtn);

    msgDiv.appendChild(bubble);
    msgDiv.appendChild(metaInfo);
    chatBox.appendChild(msgDiv);
  });
  
  scrollToBottom();
}

function initChat() {
  onValue(messagesRef, (snapshot) => {
    cachedMessages = snapshot.val() || {};
    renderMessages();
  });

  sendBtn.addEventListener('click', sendMessage);
  messageInput.addEventListener('keydown', (e) => {
    if (!e.isComposing && e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });
  messageInput.addEventListener('input', () => {
    messageInput.style.height = 'auto';
    messageInput.style.height = Math.min(messageInput.scrollHeight, 120) + 'px';
  });
}

initChat();