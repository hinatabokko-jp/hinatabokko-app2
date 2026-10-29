import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getDatabase, ref } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

// 1. MEMO専用のFirebase設定
const memoFirebaseConfig = {
  apiKey: "AIzaSyCPkZxnMh79D1OxIxYZbBbLLBi2wlyaa8Y",
  authDomain: "memo-32979.firebaseapp.com",
  databaseURL: "https://memo-32979-default-rtdb.firebaseio.com",
  projectId: "memo-32979",
  storageBucket: "memo-32979.firebasestorage.app",
  messagingSenderId: "798457900857",
  appId: "1:798457900857:web:8b5ac2812aee8c3c8402e8",
  measurementId: "G-7ZFJFTTHNW"
};

// 2. FamilyChat（カレンダー同期専用）のFirebase設定
const familyChatFirebaseConfig = {
  apiKey: "AIzaSyCfHE4gy8EFE3TxHQkw4jtiuMD9D3BrX6M",
  authDomain: "family-chat-2-bca6e.firebaseapp.com",
  projectId: "family-chat-2-bca6e",
  storageBucket: "family-chat-2-bca6e.firebasestorage.app",
  messagingSenderId: "542935840264",
  appId: "1:542935840264:web:055d64fbf310b537f403bd",
  measurementId: "G-FGVQ3784EN",
  databaseURL: "https://family-chat-2-bca6e-default-rtdb.firebaseio.com/"
};

// それぞれのアプリインスタンスを初期化
export const memoApp = initializeApp(memoFirebaseConfig, "memoApp");
export const familyChatApp = initializeApp(familyChatFirebaseConfig, "familyChatApp");

// データベース参照の振り分け
export const db = getDatabase(memoApp);
export const calendarDb = getDatabase(familyChatApp);
export const firestore = getFirestore(memoApp);
export const auth = getAuth(memoApp);
export const appId = "memo_app_v2";

export const messagesRef = ref(db, 'memos');
export const stampHistoryRef = ref(db, 'stamp_history');
export const passcodeRef = ref(db, 'settings/passcode');
export const calendarEventsRef = ref(calendarDb, 'calendar_events');

export function showModal(title, msg) {
  document.getElementById('alert-modal-title').textContent = title;
  document.getElementById('alert-modal-message').textContent = msg;
  document.getElementById('alert-modal').classList.add('active');
}

document.getElementById('alert-modal-ok').addEventListener('click', () => {
  document.getElementById('alert-modal').classList.remove('active');
});