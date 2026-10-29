import { get, set as dbSet } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";
import { doc, setDoc, getDoc, deleteDoc, collection, getDocs } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { signInAnonymously } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { auth, firestore, passcodeRef, appId, showModal } from "./config.js";
import { renderMessages, scrollToBottom } from "./memo.js";

const lockScreen = document.getElementById('lock-screen');
const appContent = document.getElementById('app-content');
const passInput = document.getElementById('pass-input');
const passBtn = document.getElementById('pass-btn');
const passError = document.getElementById('pass-error');
const rememberMeCheckbox = document.getElementById('remember-me-checkbox');
const changeUserBtn = document.getElementById('changeUserBtn');

let myUid = localStorage.getItem('memo_app_uid');
if (!myUid) {
  myUid = 'user_' + Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
  localStorage.setItem('memo_app_uid', myUid);
}

changeUserBtn.addEventListener('click', () => {
  sessionStorage.removeItem('memo_app_unlocked');
  localStorage.removeItem('memo_app_unlocked');
  lockScreen.style.display = 'flex';
  appContent.style.display = 'none';
  passInput.value = '';
});

async function handleAuth() {
  const inputPass = passInput.value;
  if (!inputPass) {
    passError.textContent = 'あいことばを入力してください';
    passError.style.display = 'block';
    return;
  }

  try {
    const snap = await get(passcodeRef);
    const correctPass = snap.exists() ? snap.val() : '1234';

    if (inputPass === correctPass) {
      await verifyAndUnlock();
    } else {
      passError.textContent = 'あいことばが違います';
      passError.style.display = 'block';
    }
  } catch (e) {
    const correctPass = '1234';
    if (inputPass === correctPass) {
      await verifyAndUnlock();
    } else {
      passError.textContent = 'あいことばが違います';
      passError.style.display = 'block';
    }
  }
}

async function verifyAndUnlock() {
  try {
    await signInAnonymously(auth);
  } catch (error) {
    console.error("認証エラー:", error);
  }

  if (rememberMeCheckbox.checked) {
    localStorage.setItem('memo_app_unlocked', 'true');
  } else {
    sessionStorage.setItem('memo_app_unlocked', 'true');
  }
  unlockApp();
}

async function registerCurrentDeviceUser() {
  try {
    const configSnap = await getDoc(doc(firestore, 'artifacts', appId, 'public', 'data', 'settings', 'roomConfig'));
    const roomConfig = configSnap.exists() ? configSnap.data() : {};
    const isLocked = roomConfig.roomLocked || false;

    const usersSnap = await getDocs(collection(firestore, 'artifacts', appId, 'public', 'data', 'users'));
    let registeredUsersList = [];
    usersSnap.forEach(docSnap => {
      registeredUsersList.push({ id: docSnap.id, ...docSnap.data() });
    });

    const foundUserByUid = registeredUsersList.find(u => (u.userId === myUid || u.id === myUid));

    if (foundUserByUid && foundUserByUid.accessDenied) {
      showModal("アクセス制限", "今は入室できません。");
      return false;
    }

    if (isLocked && !foundUserByUid) {
      showModal("入室制限", "現在ルームがロックされており、未登録ユーザーは入室できません。");
      return false;
    }

    const userRef = doc(firestore, 'artifacts', appId, 'public', 'data', 'users', myUid);
    await setDoc(userRef, { 
      userId: myUid, 
      userAgent: navigator.userAgent, 
      lastLoginAt: new Date().toISOString(), 
      accessDenied: (foundUserByUid ? foundUserByUid.accessDenied : false) 
    }, { merge: true });

    return true;
  } catch (err) {
    console.error("User registration error:", err);
    return true;
  }
}

export async function unlockApp() {
  const canAccess = await registerCurrentDeviceUser();

  if (canAccess) {
    lockScreen.style.display = 'none';
    appContent.style.display = 'flex';

    renderMessages();
    scrollToBottom();
  }
}

passBtn.addEventListener('click', handleAuth);
passInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') handleAuth();
});

const openAdminModalBtn = document.getElementById('open-admin-login-modal');
const adminLoginModal = document.getElementById('admin-login-modal');
const adminLoginCloseX = document.getElementById('admin-login-close-x');
const adminLoginSubmit = document.getElementById('admin-login-submit');
const adminPanelModal = document.getElementById('admin-panel-modal');
const adminPanelCloseX = document.getElementById('admin-panel-close-x');
const adminPanelCloseBtn = document.getElementById('admin-panel-close-btn');

openAdminModalBtn.addEventListener('click', () => {
  document.getElementById('admin-id-input').value = '';
  document.getElementById('admin-pass-input').value = '';
  document.getElementById('admin-login-error').style.display = 'none';
  adminLoginModal.classList.add('active');
});
adminLoginCloseX.addEventListener('click', () => adminLoginModal.classList.remove('active'));

adminLoginSubmit.addEventListener('click', () => {
  const idVal = document.getElementById('admin-id-input').value;
  const passVal = document.getElementById('admin-pass-input').value;
  if (idVal === 'master' && passVal === '0813') {
    adminLoginModal.classList.remove('active');
    openAdminPanel();
  } else {
    document.getElementById('admin-login-error').style.display = 'block';
  }
});

adminPanelCloseX.addEventListener('click', () => adminPanelModal.classList.remove('active'));
adminPanelCloseBtn.addEventListener('click', () => adminPanelModal.classList.remove('active'));

window.toggleUserAccess = async function(userId, isDenied) {
  await setDoc(doc(firestore, 'artifacts', appId, 'public', 'data', 'users', userId), { accessDenied: isDenied }, { merge: true });
};

window.promptDeleteUser = async function(userId, nickname) {
  if (confirm(`ユーザーを削除しますか？`)) {
    await deleteDoc(doc(firestore, 'artifacts', appId, 'public', 'data', 'users', userId));
    openAdminPanel();
  }
};

window.toggleRoomLock = async function(isLocked) {
  await setDoc(doc(firestore, 'artifacts', appId, 'public', 'data', 'settings', 'roomConfig'), { roomLocked: isLocked }, { merge: true });
};

const updatePasscodeBtn = document.getElementById('update-passcode-btn');
updatePasscodeBtn.addEventListener('click', async () => {
  const newPass = document.getElementById('new-passcode-input').value.trim();
  if (!newPass) {
    showModal("エラー", "新しいあいことばを入力してください。");
    return;
  }
  try {
    await dbSet(passcodeRef, newPass);
    showModal("成功", "あいことばを変更しました。");
    document.getElementById('new-passcode-input').value = '';
  } catch (err) {
    console.error("Passcode update error:", err);
    showModal("エラー", "あいことばの変更に失敗しました。");
  }
});

async function openAdminPanel() {
  adminPanelModal.classList.add('active');
  const usersListContainer = document.getElementById('admin-users-list');
  usersListContainer.innerHTML = '<div style="color:var(--text-muted); font-size:0.85rem; text-align:center; padding:10px;">読み込み中...</div>';

  try {
    const configSnap = await getDoc(doc(firestore, 'artifacts', appId, 'public', 'data', 'settings', 'roomConfig'));
    const roomLocked = configSnap.exists() ? (configSnap.data().roomLocked || false) : false;
    const roomLockToggle = document.getElementById('room-lock-toggle');
    roomLockToggle.checked = roomLocked;
    roomLockToggle.onchange = (e) => toggleRoomLock(e.target.checked);

    const usersSnap = await getDocs(collection(firestore, 'artifacts', appId, 'public', 'data', 'users'));
    usersListContainer.innerHTML = '';
    
    if (usersSnap.empty) {
      usersListContainer.innerHTML = '<div style="color:var(--text-muted); font-size:0.85rem; text-align:center; padding:10px;">登録ユーザーはありません</div>';
      return;
    }

    usersSnap.forEach(docSnap => {
      const user = { id: docSnap.id, ...docSnap.data() };
      const row = document.createElement('div');
      row.className = 'admin-user-row';
      row.innerHTML = `
        <div style="font-size:0.85rem; word-break:break-all; max-width: 55%;">
          <div style="font-weight:600; color:#fff;">UID: ${user.userId || user.id}</div>
          <div style="font-size:0.7rem; color:var(--text-muted);">最終ログイン: ${user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString() : '不明'}</div>
        </div>
        <div style="display: flex; align-items: center; gap: 12px;">
          <div style="display: flex; align-items: center; gap: 6px; font-size: 0.75rem; color: var(--text-muted);">
            <span>アクセス拒否</span>
            <label class="toggle-switch-label">
              <input type="checkbox" class="toggle-switch-input" ${user.accessDenied ? 'checked' : ''} onchange="toggleUserAccess('${user.id}', this.checked)">
              <div class="toggle-switch-slider"></div>
            </label>
          </div>
          <button onclick="promptDeleteUser('${user.id}', '${user.userId || user.id}')" style="padding: 6px 10px; border-radius: 8px; background: rgba(244,63,94,0.15); color: #fb7185; border: 1px solid rgba(244,63,94,0.3); font-size: 0.75rem; font-weight: 600; cursor: pointer;">削除</button>
        </div>
      `;
      usersListContainer.appendChild(row);
    });
  } catch (err) {
    console.error("Admin panel load error:", err);
    usersListContainer.innerHTML = '<div style="color:var(--danger-color); font-size:0.85rem; text-align:center; padding:10px;">データの取得に失敗しました</div>';
  }
}

if (localStorage.getItem('memo_app_unlocked') === 'true' || sessionStorage.getItem('memo_app_unlocked') === 'true') {
  unlockApp();
}