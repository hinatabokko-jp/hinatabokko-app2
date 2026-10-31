/**
 * MEETING UP - Single Page Interactive Application Logic
 * Supports GPS real-time updates, custom Leaflet mapping, distance/bearing math,
 * messaging, preset codes, and admin features.
 */

// Global State
const STATE = {
    currentUser: null,       // { uid, nickname, isAdmin }
    currentRoom: null,       // { roomId, name, type, inviteCode, ... }
    watchPositionId: null,   // Geolocation watch ID
    map: null,               // Leaflet map instance
    markers: {},             // Map markers indexed by UID
    myLocation: null,        // { lat, lng }
    users: [],               // Mocked/Synced Users List
    rooms: [],               // Active Rooms List
    chatMessages: []         // Active Chat Feed
};

// Configuration & Constants
const CONFIG = {
    APP_PASSPHRASE: "meeting2026",
    ADMIN_PASSPHRASE: "admin2026",
    ADMIN_UID: "ADMIN_SPECIAL_UID_001",
    GPS_INTERVAL: 4000
};

// Initialization on DOM ready
document.addEventListener("DOMContentLoaded", () => {
    initApp();
});

function initApp() {
    setupInitialData();
    bindEvents();
}

/**
 * Setup default mock/in-memory persistent state (simulating Firebase Realtime Data)
 */
function setupInitialData() {
    STATE.users = [
        { uid: "ADMIN_SPECIAL_UID_001", nickname: "管理者(あなた)", status: "active", isAdmin: true },
        { uid: "USER_002", nickname: "るみ", status: "active", isAdmin: false },
        { uid: "USER_003", nickname: "けんた", status: "active", isAdmin: false }
    ];

    STATE.rooms = [
        {
            id: "ROOM_FIXED_FAMILY",
            name: "ファミリーグループ (固定)",
            type: "fixed",
            inviteCode: "999888",
            members: ["ADMIN_SPECIAL_UID_001", "USER_002"],
            locations: {
                "USER_002": { lat: 35.6812, lng: 139.7671, accuracy: 5, updatedAt: new Date() }
            }
        },
        {
            id: "ROOM_EVENT_STADIUM",
            name: "サッカー観戦・西ゲート",
            type: "invite",
            inviteCode: "123456",
            members: ["USER_002", "USER_003"],
            locations: {}
        }
    ];
}

/**
 * Event Bindings
 */
function bindEvents() {
    // Auth & Login
    document.getElementById("btnLogin").addEventListener("click", handleLogin);

    // User Menu Click Handler
    document.getElementById("btnUserMenu").addEventListener("click", handleUserMenuClick);

    // Room operations
    document.getElementById("btnCreateRoomModal").addEventListener("click", () => showModal("createRoomModal"));
    document.getElementById("btnCloseCreateRoom").addEventListener("click", () => hideModal("createRoomModal"));
    document.getElementById("btnConfirmCreateRoom").addEventListener("click", handleCreateRoom);
    document.getElementById("btnJoinByCode").addEventListener("click", handleJoinByCode);

    // Active Room Actions
    document.getElementById("btnLeaveRoom").addEventListener("click", handleLeaveRoom);
    document.getElementById("btnToggleGps").addEventListener("click", toggleGpsSharing);

    // Chat
    document.getElementById("btnSendMessage").addEventListener("click", handleSendMessage);
    document.querySelectorAll(".preset-msg").forEach(btn => {
        btn.addEventListener("click", (e) => {
            document.getElementById("inputChatMessage").value = e.target.innerText;
            handleSendMessage();
        });
    });

    // Admin
    document.getElementById("btnAdminDashboard").addEventListener("click", openAdminDashboard);
    document.getElementById("btnCloseAdmin").addEventListener("click", () => hideModal("adminModal"));
}

/**
 * Handle Login System
 */
function handleLogin() {
    const nickname = document.getElementById("inputNickname").value.trim();
    const passphrase = document.getElementById("inputPassphrase").value.trim();

    if (!nickname) {
        showToast("ニックネームを入力してください");
        return;
    }

    if (passphrase !== CONFIG.APP_PASSPHRASE && passphrase !== CONFIG.ADMIN_PASSPHRASE) {
        showToast("合言葉が正しくありません");
        return;
    }

    const isAdmin = passphrase === CONFIG.ADMIN_PASSPHRASE;
    const uid = isAdmin ? CONFIG.ADMIN_UID : "UID_" + Math.random().toString(36).substring(2, 9);

    STATE.currentUser = {
        uid: uid,
        nickname: nickname,
        isAdmin: isAdmin
    };

    // Update UI Header
    document.getElementById("headerUserNav").classList.remove("hidden");
    document.getElementById("navNickname").innerText = nickname;

    const btnAdmin = document.getElementById("btnAdminDashboard");
    if (isAdmin) {
        btnAdmin.classList.remove("hidden");
        btnAdmin.style.display = "inline-flex";
    } else {
        btnAdmin.classList.add("hidden");
        btnAdmin.style.display = "none";
    }

    // Switch View
    document.getElementById("authSection").classList.add("hidden");
    document.getElementById("roomSelectSection").classList.remove("hidden");

    renderRoomsList();
    showToast(`ようこそ、${nickname} さん！${isAdmin ? '（管理者権限）' : ''}`);
}

/**
 * Handle User Menu Click (Header Nickname Button)
 */
function handleUserMenuClick() {
    if (!STATE.currentUser) return;

    if (STATE.currentUser.isAdmin) {
        openAdminDashboard();
    } else {
        if (confirm("ログアウトしてログイン画面に戻りますか？")) {
            location.reload();
        }
    }
}

/**
 * Enter Active Room Screen
 */
function enterRoom(roomId) {
    const room = STATE.rooms.find(r => r.id === roomId);
    if (!room) return;

    STATE.currentRoom = room;
    if (!room.members.includes(STATE.currentUser.uid)) {
        room.members.push(STATE.currentUser.uid);
    }

    // UI Updates
    document.getElementById("roomSelectSection").classList.add("hidden");
    document.getElementById("activeRoomSection").classList.remove("hidden");

    document.getElementById("activeRoomTitle").innerText = room.name;
    document.getElementById("activeRoomBadge").innerText = room.type === "fixed" ? "固定グループ" : "招待ルーム";
    document.getElementById("activeRoomCode").innerText = room.inviteCode;
    document.getElementById("participantCount").innerText = `${room.members.length}名参加中`;

    // Initialize Map and force size re-calculation
    initMap();
    setTimeout(() => {
        if (STATE.map) {
            STATE.map.invalidateSize();
        }
    }, 200);

    // Reset Chat Feed
    STATE.chatMessages = [];
    renderChatMessages();

    showToast(`「${room.name}」に入室しました`);
}

/**
 * Initialize Leaflet Interactive Map
 */
function initMap() {
    if (STATE.map) {
        STATE.map.remove();
        STATE.map = null;
    }

    // Default location: Tokyo Station or Geolocation
    const defaultLat = 35.681236;
    const defaultLng = 139.767125;

    const mapContainer = document.getElementById("map");
    if (!mapContainer) return;

    STATE.map = L.map("map", { zoomControl: false }).setView([defaultLat, defaultLng], 16);

    // Standard OpenStreetMap Tile Layer
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: "© OpenStreetMap contributors"
    }).addTo(STATE.map);

    L.control.zoom({ position: "topright" }).addTo(STATE.map);

    // If position already exists, update center
    if (STATE.myLocation) {
        STATE.map.setView([STATE.myLocation.lat, STATE.myLocation.lng], 16);
    }
}

/**
 * Render/Update Markers on Leaflet Map
 */
function updateMapMarkers() {
    if (!STATE.map || !STATE.currentRoom) return;

    const locations = STATE.currentRoom.locations;

    Object.keys(locations).forEach(uid => {
        const loc = locations[uid];
        const isSelf = uid === STATE.currentUser.uid;
        const nickname = isSelf ? `${STATE.currentUser.nickname}(自分)` : getNicknameByUid(uid);

        const customIcon = L.divIcon({
            className: "custom-pin",
            html: `
                <div class="flex flex-col items-center">
                    <div class="bg-slate-900/90 text-slate-100 text-[10px] font-bold px-2 py-0.5 rounded-md border border-purple-500 shadow-md whitespace-nowrap">
                        ${nickname}
                    </div>
                    <div class="w-4 h-4 rounded-full ${isSelf ? 'bg-pink-500' : 'bg-indigo-500'} border-2 border-white shadow-lg animate-bounce mt-0.5"></div>
                </div>
            `,
            iconSize: [60, 40],
            iconAnchor: [30, 40]
        });

        if (STATE.markers[uid]) {
            STATE.markers[uid].setLatLng([loc.lat, loc.lng]);
        } else {
            STATE.markers[uid] = L.marker([loc.lat, loc.lng], { icon: customIcon }).addTo(STATE.map);
        }
    });

    // Remove obsolete markers
    Object.keys(STATE.markers).forEach(uid => {
        if (!locations[uid]) {
            STATE.map.removeLayer(STATE.markers[uid]);
            delete STATE.markers[uid];
        }
    });
}

/**
 * Calculate Distance & Bearing for Member Proximity Cards
 */
function updateProximityCards() {
    const proximityList = document.getElementById("proximityList");
    proximityList.innerHTML = "";

    if (!STATE.myLocation || !STATE.currentRoom) return;

    Object.keys(STATE.currentRoom.locations).forEach(uid => {
        if (uid === STATE.currentUser.uid) return;

        const targetLoc = STATE.currentRoom.locations[uid];
        const dist = calculateDistance(STATE.myLocation.lat, STATE.myLocation.lng, targetLoc.lat, targetLoc.lng);
        const bearing = calculateBearing(STATE.myLocation.lat, STATE.myLocation.lng, targetLoc.lat, targetLoc.lng);
        const directionText = getDirectionName(bearing);
        const name = getNicknameByUid(uid);

        const card = document.createElement("div");
        card.className = "glass-panel p-2.5 rounded-xl border border-slate-800 min-w-[140px] flex flex-col justify-between space-y-1 shadow-md";
        card.innerHTML = `
            <div class="text-[11px] font-bold text-slate-200 truncate">${name}</div>
            <div class="text-xs font-black brand-gradient-text">${dist < 1000 ? Math.round(dist) + 'm' : (dist/1000).toFixed(1) + 'km'}</div>
            <div class="text-[10px] text-slate-400 font-semibold"><i class="fa-solid fa-compass text-purple-400 mr-1"></i>${directionText}</div>
        `;

        // Proximity alert if less than 20m
        if (dist <= 20) {
            showToast(`✨ ${name} さんが近くにいます！（${Math.round(dist)}m）`);
        }

        proximityList.appendChild(card);
    });
}

/**
 * Send Message Logic
 */
function handleSendMessage() {
    const input = document.getElementById("inputChatMessage");
    const text = input.value.trim();
    if (!text) return;

    STATE.chatMessages.push({
        sender: STATE.currentUser.nickname,
        text: text,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    });

    input.value = "";
    renderChatMessages();
}

function renderChatMessages() {
    const feed = document.getElementById("chatFeed");
    feed.innerHTML = "";

    if (STATE.chatMessages.length === 0) {
        feed.innerHTML = '<div class="text-center text-slate-500 text-[10px] py-2">メッセージ履歴はありません</div>';
        return;
    }

    STATE.chatMessages.forEach(msg => {
        const item = document.createElement("div");
        item.className = "flex justify-between items-start space-x-2 text-slate-300";
        item.innerHTML = `
            <div>
                <strong class="text-purple-400 font-bold">${msg.sender}:</strong>
                <span class="text-slate-200">${msg.text}</span>
            </div>
            <span class="text-[9px] text-slate-500 whitespace-nowrap">${msg.time}</span>
        `;
        feed.appendChild(item);
    });

    feed.scrollTop = feed.scrollHeight;
}

/**
 * Admin Dashboard View Rendering
 */
function openAdminDashboard() {
    if (!STATE.currentUser || !STATE.currentUser.isAdmin) {
        showToast("管理者権限がありません");
        return;
    }

    showModal("adminModal");

    // Render Users List
    const userContainer = document.getElementById("adminUserList");
    userContainer.innerHTML = "";

    STATE.users.forEach(u => {
        const row = document.createElement("div");
        row.className = "flex justify-between items-center glass-panel p-2.5 rounded-lg text-xs border border-slate-800";
        row.innerHTML = `
            <div>
                <span class="font-bold text-slate-200">${u.nickname}</span>
                <span class="text-[10px] text-slate-500 block font-mono">UID: ${u.uid}</span>
            </div>
            <button class="bg-rose-500/20 text-rose-300 text-[10px] px-2 py-1 rounded hover:bg-rose-500/30">停止</button>
        `;
        userContainer.appendChild(row);
    });

    // Render Active Rooms List
    const roomContainer = document.getElementById("adminRoomList");
    roomContainer.innerHTML = "";

    STATE.rooms.forEach(r => {
        const row = document.createElement("div");
        row.className = "flex justify-between items-center glass-panel p-2.5 rounded-lg text-xs border border-slate-800";
        row.innerHTML = `
            <div>
                <span class="font-bold text-slate-200">${r.name}</span>
                <span class="text-[10px] text-slate-400 block">コード: ${r.inviteCode}</span>
            </div>
            <button class="bg-rose-600 text-white text-[10px] px-2 py-1 rounded font-bold shadow hover:bg-rose-700">強制終了</button>
        `;
        row.querySelector("button").addEventListener("click", () => {
            STATE.rooms = STATE.rooms.filter(item => item.id !== r.id);
            openAdminDashboard();
            renderRoomsList();
            showToast(`ルーム「${r.name}」を強制終了しました`);
        });
        roomContainer.appendChild(row);
    });
}

/**
 * Leave Current Active Room
 */
function handleLeaveRoom() {
    if (STATE.watchPositionId !== null) {
        toggleGpsSharing();
    }

    STATE.currentRoom = null;
    document.getElementById("activeRoomSection").classList.add("hidden");
    document.getElementById("roomSelectSection").classList.remove("hidden");

    renderRoomsList();
    showToast("ルームから退室しました");
}

/**
 * Utility Functions (Math, UI Helpers)
 */
function getNicknameByUid(uid) {
    const user = STATE.users.find(u => u.uid === uid);
    return user ? user.nickname : "メンバー";
}

function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371e3; // metres
    const φ1 = lat1 * Math.PI/180;
    const φ2 = lat2 * Math.PI/180;
    const Δφ = (lat2-lat1) * Math.PI/180;
    const Δλ = (lon2-lon1) * Math.PI/180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c; // Distance in meters
}

function calculateBearing(lat1, lon1, lat2, lon2) {
    const y = Math.sin((lon2 - lon1) * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180);
    const x = Math.cos(lat1 * Math.PI / 180) * Math.sin(lat2 * Math.PI / 180) -
              Math.sin(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.cos((lon2 - lon1) * Math.PI / 180);
    const θ = Math.atan2(y, x);
    return (θ * 180 / Math.PI + 360) % 360;
}

function getDirectionName(bearing) {
    const directions = ["北", "北東", "東", "南東", "南", "南西", "西", "北西"];
    const index = Math.round(bearing / 45) % 8;
    return directions[index] + "方向";
}

function showModal(id) {
    document.getElementById(id).classList.remove("hidden");
}

function hideModal(id) {
    document.getElementById(id).classList.add("hidden");
}

function showToast(message) {
    const toast = document.getElementById("toast");
    document.getElementById("toastMessage").innerText = message;
    toast.classList.remove("hidden");
    setTimeout(() => {
        toast.classList.add("hidden");
    }, 3000);
}
