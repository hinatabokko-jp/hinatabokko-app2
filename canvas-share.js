const firebaseConfig = {
    apiKey: "AIzaSyDKrAD162EYHWzB6hTR2vYUuQ7M41RjT8g",
    authDomain: "canvas-share-b0784.firebaseapp.com",
    databaseURL: "https://canvas-share-b0784-default-rtdb.firebaseio.com",
    projectId: "canvas-share-b0784",
    storageBucket: "canvas-share-b0784.firebasestorage.app",
    messagingSenderId: "1034578016604",
    appId: "1:1034578016604:web:79fefa67439c2a32cee999",
    measurementId: "G-DWMNPSFTVB"
};

let db = null;
try {
    if (firebaseConfig.apiKey && !firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
        db = firebase.database();
    }
} catch (e) {
    console.log("Firebase初期化エラー:", e);
}

const canvasWidth = 512;
const canvasHeight = 384;
let currentActiveUser = 'a';

const createDefaultLayers = () => {
    const l1Canvas = document.createElement('canvas');
    l1Canvas.width = canvasWidth; l1Canvas.height = canvasHeight;
    
    const l2Canvas = document.createElement('canvas');
    l2Canvas.width = canvasWidth; l2Canvas.height = canvasHeight;
    const l2Ctx = l2Canvas.getContext('2d', { willReadFrequently: true });
    l2Ctx.fillStyle = '#ffffff';
    l2Ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    const l3Canvas = document.createElement('canvas');
    l3Canvas.width = canvasWidth; l3Canvas.height = canvasHeight;

    return [
        { id: 1, name: 'レイヤー 1 (下)', visible: true, opacity: 1, canvas: l1Canvas, ctx: l1Canvas.getContext('2d', { willReadFrequently: true }) },
        { id: 2, name: 'レイヤー 2 (背景白)', visible: true, opacity: 1, canvas: l2Canvas, ctx: l2Ctx },
        { id: 3, name: 'レイヤー 3 (上)', visible: true, opacity: 1, canvas: l3Canvas, ctx: l3Canvas.getContext('2d', { willReadFrequently: true }) }
    ];
};

const workspaces = {
    a: {
        color: '#ec4899',
        size: 8,
        opacity: 1,
        shape: 'normal',
        tool: 'brush',
        layers: createDefaultLayers(),
        activeLayerId: 3,
        history: [],
        redoStack: [],
        selection: null
    },
    b: {
        color: '#6366f1',
        size: 8,
        opacity: 1,
        shape: 'normal',
        tool: 'brush',
        layers: createDefaultLayers(),
        activeLayerId: 3,
        history: [],
        redoStack: [],
        selection: null
    }
};

function initWorkspace(prefix) {
    const ws = workspaces[prefix];
    const container = document.querySelector(`.canvas-wrapper-${prefix}`);
    if (!container) return;
    container.innerHTML = '';

    ws.layers.forEach((layer) => {
        if (layer.canvas) {
            layer.canvas.className = `absolute inset-0 w-full h-full touch-none ${layer.visible ? '' : 'hidden'}`;
            layer.canvas.style.opacity = layer.opacity;
            container.appendChild(layer.canvas);
        }
    });

    let selCanvas = container.querySelector('.selection-overlay');
    if (!selCanvas) {
        selCanvas = document.createElement('canvas');
        selCanvas.width = canvasWidth;
        selCanvas.height = canvasHeight;
        selCanvas.className = 'absolute inset-0 w-full h-full pointer-events-none selection-overlay';
        container.appendChild(selCanvas);
    }

    if (ws.history.length === 0) {
        saveState(prefix);
    }

    if (!container.dataset.initialized) {
        setupDrawingEvents(prefix, container);
        container.dataset.initialized = "true";
    }

    if (db) {
        listenSyncedCanvas(prefix);
    }
}

function listenSyncedCanvas(prefix) {
    const syncRef = db.ref(`canvas_share_message_rooms/room_v1/${prefix}/syncedImage`);
    syncRef.on('value', (snapshot) => {
        const dataUrl = snapshot.val();
        if (!dataUrl) return;

        const ws = workspaces[prefix];
        const img = new Image();
        img.onload = () => {
            const targetLayer = ws.layers.find(l => l.id === ws.activeLayerId) || ws.layers[ws.layers.length - 1];
            if (targetLayer && targetLayer.ctx) {
                targetLayer.ctx.clearRect(0, 0, canvasWidth, canvasHeight);
                targetLayer.ctx.drawImage(img, 0, 0);
                saveState(prefix);
            }
        };
        img.src = dataUrl;
    });
}

function sendSyncCanvas(prefix, silent = false) {
    const ws = workspaces[prefix];
    const tempCvs = document.createElement('canvas');
    tempCvs.width = canvasWidth; tempCvs.height = canvasHeight;
    const tCtx = tempCvs.getContext('2d');
    ws.layers.forEach(l => {
        if (l.visible && l.canvas) {
            tCtx.globalAlpha = l.opacity;
            tCtx.drawImage(l.canvas, 0, 0);
        }
    });

    const dataUrl = tempCvs.toDataURL('image/png');

    if (db) {
        db.ref(`canvas_share_message_rooms/room_v1/${prefix}/syncedImage`).set(dataUrl)
            .then(() => {
                if (!silent) alert(`プレイヤー${prefix.toUpperCase()}のキャンバスを反映しました！`);
            })
            .catch((err) => {
                if (!silent) alert("反映に失敗しました: " + err.message);
            });
    } else if (!silent) {
        alert("Firebaseが設定されていないため、この環境では同期されません。");
    }
}

// ==========================================
// 描画・選択・移動イベント処理
// ==========================================
function setupDrawingEvents(prefix, wrapper) {
    let isDrawing = false;
    let isSelecting = false;
    let isMovingSelection = false;
    let selStartX = 0, selStartY = 0;
    let moveStartX = 0, moveStartY = 0;
    let lastX = 0, lastY = 0;
    let lastSpeed = 0;
    let strokePoints = [];

    const getCoords = (e) => {
        const rect = wrapper.getBoundingClientRect();
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        return {
            x: Math.floor((clientX - rect.left) * (canvasWidth / rect.width)),
            y: Math.floor((clientY - rect.top) * (canvasHeight / rect.height))
        };
    };

    const startAction = (e) => {
        const coords = getCoords(e);
        const ws = workspaces[prefix];
        const activeLayer = ws.layers.find(l => l.id === ws.activeLayerId);
        if (!activeLayer) return;

        if (ws.tool === 'select') {
            if (ws.selection) {
                const s = ws.selection;
                if (coords.x >= s.x && coords.x <= s.x + s.w && coords.y >= s.y && coords.y <= s.y + s.h) {
                    isMovingSelection = true;
                    moveStartX = coords.x;
                    moveStartY = coords.y;
                    return;
                } else {
                    commitSelection(prefix);
                }
            }
            isSelecting = true;
            selStartX = coords.x;
            selStartY = coords.y;
            ws.selection = { x: selStartX, y: selStartY, w: 0, h: 0, imageData: null };
            return;
        }

        if (ws.selection) {
            commitSelection(prefix);
        }

        if (ws.tool === 'bucket') {
            saveState(prefix);
            floodFill(prefix, coords.x, coords.y, ws.color, ws.opacity);
            return;
        }

        isDrawing = true;
        saveState(prefix);
        lastX = coords.x;
        lastY = coords.y;
        lastSpeed = 0;
        strokePoints = [{x: coords.x, y: coords.y}];
        drawPoint(prefix, coords.x, coords.y);
    };

    const moveAction = (e) => {
        const coords = getCoords(e);
        const ws = workspaces[prefix];
        const activeLayer = ws.layers.find(l => l.id === ws.activeLayerId);

        if (ws.tool === 'select') {
            if (isMovingSelection && ws.selection) {
                const dx = coords.x - moveStartX;
                const dy = coords.y - moveStartY;
                ws.selection.x += dx;
                ws.selection.y += dy;
                moveStartX = coords.x;
                moveStartY = coords.y;
                renderSelectionOverlay(prefix, wrapper);
                return;
            }
            if (isSelecting && ws.selection) {
                const currentX = coords.x;
                const currentY = coords.y;
                const x = Math.min(selStartX, currentX);
                const y = Math.min(selStartY, currentY);
                const w = Math.abs(currentX - selStartX);
                const h = Math.abs(currentY - selStartY);
                ws.selection = { x, y, w, h, imageData: null };
                renderSelectionOverlay(prefix, wrapper);
                return;
            }
            return;
        }

        if (!isDrawing) return;
        if (!activeLayer || !activeLayer.visible) return;

        const dx = coords.x - lastX;
        const dy = coords.y - lastY;
        const dist = Math.hypot(dx, dy);

        if (ws.shape === 'calligraphy') {
            if (dist >= 1.5) {
                strokePoints.push({x: coords.x, y: coords.y});
                lastX = coords.x;
                lastY = coords.y;
                redrawCurrentStroke(ws, activeLayer.ctx, strokePoints);
            }
            return;
        }

        const speed = dist;
        const currentSpeed = lastSpeed * 0.7 + speed * 0.3;
        lastSpeed = currentSpeed;

        renderBrushStroke(ws, activeLayer.ctx, lastX, lastY, coords.x, coords.y, currentSpeed);
        lastX = coords.x;
        lastY = coords.y;
    };

    const endAction = () => {
        const ws = workspaces[prefix];
        if (ws.tool === 'select') {
            if (isSelecting && ws.selection) {
                const s = ws.selection;
                if (s.w > 2 && s.h > 2) {
                    const activeLayer = ws.layers.find(l => l.id === ws.activeLayerId);
                    if (activeLayer) {
                        s.imageData = activeLayer.ctx.getImageData(s.x, s.y, s.w, s.h);
                        activeLayer.ctx.clearRect(s.x, s.y, s.w, s.h);
                        saveState(prefix);
                    }
                } else {
                    ws.selection = null;
                }
                isSelecting = false;
                renderSelectionOverlay(prefix, wrapper);
            }
            if (isMovingSelection) {
                isMovingSelection = false;
                saveState(prefix);
            }
            return;
        }

        if (isDrawing) {
            isDrawing = false;
            lastSpeed = 0;
            if (ws.shape === 'calligraphy' && strokePoints.length > 0) {
                const activeLayer = ws.layers.find(l => l.id === ws.activeLayerId);
                if (activeLayer && activeLayer.visible) {
                    renderCalligraphyPath(ws, activeLayer.ctx, strokePoints);
                }
            }
            strokePoints = [];
        }
    };

    wrapper.addEventListener('mousedown', startAction);
    wrapper.addEventListener('mousemove', moveAction);
    window.addEventListener('mouseup', endAction);
    wrapper.addEventListener('touchstart', (e) => { e.preventDefault(); startAction(e); }, { passive: false });
    wrapper.addEventListener('touchmove', (e) => { e.preventDefault(); moveAction(e); }, { passive: false });
    window.addEventListener('touchend', endAction);

    window.addEventListener('paste', (e) => {
        if (currentActiveUser !== prefix) return;
        const items = (e.clipboardData || e.originalEvent.clipboardData).items;
        for (let item of items) {
            if (item.type.indexOf('image') === 0) {
                const blob = item.getAsFile();
                const reader = new FileReader();
                reader.onload = (event) => {
                    const img = new Image();
                    img.onload = () => {
                        const ws = workspaces[prefix];
                        const activeLayer = ws.layers.find(l => l.id === ws.activeLayerId);
                        if (!activeLayer) return;
                        saveState(prefix);
                        const pasteW = Math.min(img.width, canvasWidth);
                        const pasteH = Math.min(img.height, canvasHeight);
                        const pasteX = Math.floor((canvasWidth - pasteW) / 2);
                        const pasteY = Math.floor((canvasHeight - pasteH) / 2);
                        activeLayer.ctx.drawImage(img, pasteX, pasteY, pasteW, pasteH);
                        saveState(prefix);
                        alert("画像を貼り付けました！");
                    };
                    img.src = event.target.result;
                };
                reader.readAsDataURL(blob);
            }
        }
    });
}

function redrawCurrentStroke(ws, ctx, points) {
    if (points.length < 2) return;
    const p1 = points[points.length - 2];
    const p2 = points[points.length - 1];
    renderCalligraphySegment(ws, ctx, p1, p2);
}

function commitSelection(prefix) {
    const ws = workspaces[prefix];
    if (!ws.selection || !ws.selection.imageData) {
        ws.selection = null;
        const wrapper = document.querySelector(`.canvas-wrapper-${prefix}`);
        if (wrapper) renderSelectionOverlay(prefix, wrapper);
        return;
    }
    const s = ws.selection;
    const activeLayer = ws.layers.find(l => l.id === ws.activeLayerId);
    if (activeLayer && s.w > 0 && s.h > 0) {
        activeLayer.ctx.putImageData(s.imageData, s.x, s.y);
    }
    ws.selection = null;
    const wrapper = document.querySelector(`.canvas-wrapper-${prefix}`);
    if (wrapper) renderSelectionOverlay(prefix, wrapper);
    saveState(prefix);
}

function renderSelectionOverlay(prefix, wrapper) {
    const ws = workspaces[prefix];
    const selCanvas = wrapper.querySelector('.selection-overlay');
    if (!selCanvas) return;
    const sCtx = selCanvas.getContext('2d');
    sCtx.clearRect(0, 0, canvasWidth, canvasHeight);

    if (ws.selection) {
        const s = ws.selection;
        if (s.imageData) {
            sCtx.putImageData(s.imageData, s.x, s.y);
        }
        sCtx.save();
        sCtx.strokeStyle = prefix === 'a' ? '#6366f1' : '#ec4899';
        sCtx.lineWidth = 1.5;
        sCtx.setLineDash([4, 4]);
        sCtx.strokeRect(s.x, s.y, s.w, s.h);
        sCtx.restore();
    }
}

function drawPoint(prefix, x, y) {
    const ws = workspaces[prefix];
    const activeLayer = ws.layers.find(l => l.id === ws.activeLayerId);
    if (!activeLayer || !activeLayer.visible) return;
    if (ws.shape === 'calligraphy') {
        renderCalligraphyPath(ws, activeLayer.ctx, [{x, y}, {x: x+0.5, y: y+0.5}]);
    } else {
        renderBrushStroke(ws, activeLayer.ctx, x, y, x, y, 0);
    }
}

// ==========================================
// カリグラフィ専用の高品質リボンストローク生成ロジック
// ==========================================
function renderCalligraphyPath(ws, ctx, points) {
    if (!points || points.length === 0) return;
    ctx.save();
    ctx.globalAlpha = ws.opacity;
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = ws.color;
    ctx.strokeStyle = ws.color;

    const nibWidth = Math.max(2, ws.size);
    const angle = Math.PI / 4;
    const cosA = Math.cos(angle);
    const sinA = Math.sin(angle);

    const nx = cosA * (nibWidth / 2);
    const ny = sinA * (nibWidth / 2);

    if (points.length === 1) {
        const p = points[0];
        ctx.beginPath();
        ctx.ellipse(p.x, p.y, Math.abs(nx), Math.abs(ny), angle, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        return;
    }

    const leftPoints = [];
    const rightPoints = [];

    for (let i = 0; i < points.length; i++) {
        const p = points[i];
        leftPoints.push({ x: p.x - nx, y: p.y - ny });
        rightPoints.push({ x: p.x + nx, y: p.y + ny });
    }

    ctx.beginPath();
    ctx.moveTo(leftPoints[0].x, leftPoints[0].y);
    for (let i = 1; i < leftPoints.length; i++) {
        ctx.lineTo(leftPoints[i].x, leftPoints[i].y);
    }

    for (let i = rightPoints.length - 1; i >= 0; i--) {
        ctx.lineTo(rightPoints[i].x, rightPoints[i].y);
    }

    ctx.closePath();
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.fill();
    ctx.restore();
}

function renderCalligraphySegment(ws, ctx, p1, p2) {
    renderCalligraphyPath(ws, ctx, [p1, p2]);
}

function renderBrushStroke(ws, ctx, x1, y1, x2, y2, speed = 5) {
    ctx.save();
    ctx.globalAlpha = ws.opacity;

    if (ws.tool === 'eraser') {
        ctx.globalCompositeOperation = 'destination-out';
        ctx.strokeStyle = 'rgba(0,0,0,1)';
        ctx.lineWidth = ws.size;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
        ctx.restore();
        return;
    }

    ctx.globalCompositeOperation = 'source-over';
    ctx.strokeStyle = ws.color;
    ctx.fillStyle = ws.color;

    switch (ws.shape) {
        case 'calligraphy':
            renderCalligraphyPath(ws, ctx, [{x: x1, y: y1}, {x: x2, y: y2}]);
            break;
        case 'airbrush':
            const dist = Math.hypot(x2 - x1, y2 - y1);
            const steps = Math.max(1, Math.floor(dist));
            for (let i = 0; i <= steps; i++) {
                const cx = x1 + (x2 - x1) * (i / steps);
                const cy = y1 + (y2 - y1) * (i / steps);
                for (let j = 0; j < 6; j++) {
                    const angle = Math.random() * Math.PI * 2;
                    const r = Math.random() * (ws.size * 1.2);
                    ctx.fillRect(cx + Math.cos(angle)*r, cy + Math.sin(angle)*r, 1.2, 1.2);
                }
            }
            break;
        case 'crayon':
            const cDist = Math.hypot(x2 - x1, y2 - y1);
            const cSteps = Math.max(1, Math.floor(cDist));
            const radius = Math.max(2, ws.size * 0.9);
            
            ctx.globalAlpha = Math.min(1, ws.opacity * 0.55);

            for (let i = 0; i <= cSteps; i++) {
                const t = cSteps === 0 ? 0 : i / cSteps;
                const cx = x1 + (x2 - x1) * t;
                const cy = y1 + (y2 - y1) * t;
                
                const particleCount = Math.max(4, Math.floor(radius * 1.8));
                for (let p = 0; p < particleCount; p++) {
                    const angle = Math.random() * Math.PI * 2;
                    const r = Math.pow(Math.random(), 0.7) * radius;
                    const px = cx + Math.cos(angle) * r;
                    const py = cy + Math.sin(angle) * r;
                    
                    const pSize = Math.random() * 1.4 + 0.8;
                    ctx.globalAlpha = ws.opacity * (0.3 + Math.random() * 0.5);
                    ctx.fillRect(px, py, pSize, pSize);
                }
            }
            break;
        case 'marker':
            ctx.globalAlpha = ws.opacity * 0.4;
            ctx.lineWidth = Math.max(2, ws.size * 1.6);
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.stroke();
            break;
        case 'pencil':
            ctx.globalAlpha = ws.opacity * 0.8;
            ctx.lineWidth = Math.max(1, ws.size * 0.4);
            ctx.beginPath();
            ctx.moveTo(x1 + (Math.random()-0.5)*1.5, y1 + (Math.random()-0.5)*1.5);
            ctx.lineTo(x2, y2);
            ctx.stroke();
            break;
        case 'watercolor':
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';

            ctx.globalAlpha = ws.opacity * 0.12;
            ctx.lineWidth = Math.max(4, ws.size * 1.4);
            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.stroke();

            ctx.globalAlpha = ws.opacity * 0.28;
            ctx.lineWidth = Math.max(2, ws.size * 0.8);
            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.stroke();
            break;
        case 'brush':
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            const dynamicSize = Math.max(1.5, ws.size * Math.max(0.2, 1.8 - Math.min(speed * 0.08, 1.2)));
            ctx.lineWidth = dynamicSize;
            ctx.globalAlpha = Math.min(1, ws.opacity * (1.1 - Math.min(speed * 0.03, 0.4)));
            
            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.stroke();

            if (ws.size > 4) {
                ctx.globalAlpha *= 0.4;
                ctx.lineWidth = dynamicSize * 0.5;
                ctx.beginPath();
                ctx.moveTo(x1 + 0.8, y1 + 0.8);
                ctx.lineTo(x2 + 0.8, y2 + 0.8);
                ctx.stroke();
            }
            break;
        default:
            ctx.lineWidth = ws.size;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.stroke();
            break;
    }
    ctx.restore();
}

function floodFill(prefix, startX, startY, fillColorHex, opacity) {
    const ws = workspaces[prefix];
    const activeLayer = ws.layers.find(l => l.id === ws.activeLayerId);
    if (!activeLayer) return;
    const ctx = activeLayer.ctx;
    const imgData = ctx.getImageData(0, 0, canvasWidth, canvasHeight);
    const data = imgData.data;
    const startIdx = (startY * canvasWidth + startX) * 4;
    const startR = data[startIdx], startG = data[startIdx + 1], startB = data[startIdx + 2], startA = data[startIdx + 3];

    const r = parseInt(fillColorHex.slice(1, 3), 16);
    const g = parseInt(fillColorHex.slice(3, 5), 16);
    const b = parseInt(fillColorHex.slice(5, 7), 16);
    if (startR === r && startG === g && startB === b) return;

    const queue = [[startX, startY]];
    const visited = new Uint8Array(canvasWidth * canvasHeight);

    while (queue.length > 0) {
        const [x, y] = queue.pop();
        if (x < 0 || x >= canvasWidth || y < 0 || y >= canvasHeight) continue;
        const idx = y * canvasWidth + x;
        if (visited[idx]) continue;
        visited[idx] = 1;

        const currIdx = idx * 4;
        if (data[currIdx] === startR && data[currIdx+1] === startG && data[currIdx+2] === startB && data[currIdx+3] === startA) {
            data[currIdx] = r; data[currIdx+1] = g; data[currIdx+2] = b; data[currIdx+3] = Math.round(opacity * 255);
            queue.push([x+1, y], [x-1, y], [x, y+1], [x, y-1]);
        }
    }
    ctx.putImageData(imgData, 0, 0);
}

function saveState(prefix) {
    const ws = workspaces[prefix];
    const snapshot = ws.layers.map(l => {
        if (l.ctx) {
            return l.ctx.getImageData(0, 0, canvasWidth, canvasHeight);
        }
        return null;
    });
    ws.history.push(snapshot);
    if (ws.history.length > 20) ws.history.shift();
    ws.redoStack = [];
    updateUndoRedoButtons(prefix);
}

function updateUndoRedoButtons(prefix) {
    const ws = workspaces[prefix];
    const undoBtn = document.querySelector(`.undo-btn-${prefix}`);
    const redoBtn = document.querySelector(`.redo-btn-${prefix}`);
    if (undoBtn) undoBtn.disabled = ws.history.length <= 1;
    if (redoBtn) redoBtn.disabled = ws.redoStack.length === 0;
}

function updateColorIndicator(prefix) {
    const ws = workspaces[prefix];
    const indicator = document.getElementById(`color-indicator-${prefix}`);
    if (indicator) {
        indicator.style.backgroundColor = ws.color;
    }
}

['a', 'b'].forEach(prefix => {
    const undoBtn = document.querySelector(`.undo-btn-${prefix}`);
    const redoBtn = document.querySelector(`.redo-btn-${prefix}`);
    const clearBtn = document.querySelector(`.clear-btn-${prefix}`);
    const syncBtn = document.querySelector(`.sync-btn-${prefix}`);
    const saveBtn = document.querySelector(`.save-btn-${prefix}`);

    if (undoBtn) {
        undoBtn.addEventListener('click', () => {
            const ws = workspaces[prefix];
            if (ws.history.length <= 1) return;
            ws.redoStack.push(ws.history.pop());
            const prev = ws.history[ws.history.length - 1];
            ws.layers.forEach((l, idx) => { if (prev[idx]) l.ctx.putImageData(prev[idx], 0, 0); });
            updateUndoRedoButtons(prefix);
        });
    }

    if (redoBtn) {
        redoBtn.addEventListener('click', () => {
            const ws = workspaces[prefix];
            if (ws.redoStack.length === 0) return;
            const next = ws.redoStack.pop();
            ws.history.push(next);
            ws.layers.forEach((l, idx) => { if (next[idx]) l.ctx.putImageData(next[idx], 0, 0); });
            updateUndoRedoButtons(prefix);
        });
    }

    if (clearBtn) {
        clearBtn.addEventListener('click', () => {
            saveState(prefix);
            workspaces[prefix].layers.forEach(l => {
                if (l.id !== 2) {
                    l.ctx.clearRect(0, 0, canvasWidth, canvasHeight);
                }
            });
            sendSyncCanvas(prefix, true);
        });
    }

    if (syncBtn) {
        syncBtn.addEventListener('click', () => {
            sendSyncCanvas(prefix);
        });
    }

    document.querySelectorAll(`.tool-btn-${prefix}`).forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll(`.tool-btn-${prefix}`).forEach(b => {
                b.classList.remove('bg-indigo-600', 'bg-pink-600', 'text-white', 'shadow');
                b.classList.add('text-slate-400', 'hover:text-white', 'hover:bg-dark-800');
            });
            btn.classList.add(prefix === 'a' ? 'bg-indigo-600' : 'bg-pink-600', 'text-white', 'shadow');
            btn.classList.remove('text-slate-400', 'hover:text-white', 'hover:bg-dark-800');
            workspaces[prefix].tool = btn.getAttribute('data-tool');
        });
    });

    if (saveBtn) {
        saveBtn.addEventListener('click', () => {
            const titleInput = document.querySelector(`.stamp-title-${prefix}`);
            const title = titleInput ? titleInput.value.trim() || `作品 (${prefix.toUpperCase()})` : `作品 (${prefix.toUpperCase()})`;
            const ws = workspaces[prefix];
            const tempCvs = document.createElement('canvas');
            tempCvs.width = canvasWidth; tempCvs.height = canvasHeight;
            const tCtx = tempCvs.getContext('2d');
            ws.layers.forEach(l => {
                if (l.visible && l.canvas) {
                    tCtx.globalAlpha = l.opacity;
                    tCtx.drawImage(l.canvas, 0, 0);
                }
            });

            const stamps = JSON.parse(localStorage.getItem('canvas_share_artworks') || '[]');
            stamps.unshift({ id: Date.now(), title, dataUrl: tempCvs.toDataURL('image/png'), date: new Date().toLocaleDateString() });
            localStorage.setItem('canvas_share_artworks', JSON.stringify(stamps));
            updateStampCount();
            alert(`作品「${title}」を保存しました！`);
        });
    }
});

// ==========================================
// テキスト生成モーダル関連ロジック
// ==========================================
const tgTextInput = document.getElementById('tg-textInput');
const tgFontFamily = document.getElementById('tg-fontFamily');
const tgFontSize = document.getElementById('tg-fontSize');
const tgFontSizeVal = document.getElementById('tg-fontSizeVal');
const tgTextAlign = document.getElementById('tg-textAlign');
const tgLineHeight = document.getElementById('tg-lineHeight');
const tgLineHeightVal = document.getElementById('tg-lineHeightVal');
const tgLetterSpacing = document.getElementById('tg-letterSpacing');
const tgLetterSpacingVal = document.getElementById('tg-letterSpacingVal');
const tgTextColor = document.getElementById('tg-textColor');
const tgTextColorHex = document.getElementById('tg-textColorHex');
const tgStroke1Color = document.getElementById('tg-stroke1Color');
const tgStroke1ColorHex = document.getElementById('tg-stroke1ColorHex');
const tgStroke2Color = document.getElementById('tg-stroke2Color');
const tgStroke2ColorHex = document.getElementById('tg-stroke2ColorHex');
const tgStroke1Width = document.getElementById('tg-stroke1Width');
const tgStroke1WidthVal = document.getElementById('tg-stroke1WidthVal');
const tgStroke2Width = document.getElementById('tg-stroke2Width');
const tgStroke2WidthVal = document.getElementById('tg-stroke2WidthVal');
const tgPreviewCanvas = document.getElementById('tg-previewCanvas');
const tgCtx = tgPreviewCanvas ? tgPreviewCanvas.getContext('2d') : null;

function updateTgLabels() {
    if (!tgFontSizeVal) return;
    tgFontSizeVal.textContent = tgFontSize.value + 'px';
    tgLineHeightVal.textContent = tgLineHeight.value;
    tgLetterSpacingVal.textContent = tgLetterSpacing.value + 'px';
    tgStroke1WidthVal.textContent = tgStroke1Width.value + 'px';
    tgStroke2WidthVal.textContent = tgStroke2Width.value + 'px';

    tgTextColorHex.textContent = tgTextColor.value.toUpperCase();
    tgStroke1ColorHex.textContent = tgStroke1Color.value.toUpperCase();
    tgStroke2ColorHex.textContent = tgStroke2Color.value.toUpperCase();
}

function drawTextWithLetterSpacing(ctx, text, x, y, align, spacing, drawAction) {
    if (spacing === 0) {
        drawAction(text, x, y);
        return;
    }
    let totalWidth = 0;
    for (let i = 0; i < text.length; i++) {
        totalWidth += ctx.measureText(text[i]).width + (i < text.length - 1 ? spacing : 0);
    }
    let currentX = x;
    if (align === 'center') {
        currentX = x - (totalWidth / 2);
    } else if (align === 'right') {
        currentX = x - totalWidth;
    }
    for (let i = 0; i < text.length; i++) {
        const char = text[i];
        drawAction(char, currentX, y);
        currentX += ctx.measureText(char).width + spacing;
    }
}

function renderTextGeneratorPreview() {
    if (!tgCtx) return;
    updateTgLabels();

    const pWidth = 400;
    const pHeight = 300;
    tgPreviewCanvas.width = pWidth;
    tgPreviewCanvas.height = pHeight;
    tgCtx.clearRect(0, 0, pWidth, pHeight);

    const lines = tgTextInput.value.split('\n');
    const fontName = tgFontFamily.value;
    const baseFontSize = parseInt(tgFontSize.value, 10);
    const align = tgTextAlign.value;
    const lHeight = parseFloat(tgLineHeight.value);
    const lSpacing = parseInt(tgLetterSpacing.value, 10);

    tgCtx.font = `900 ${baseFontSize}px ${fontName}`;
    tgCtx.textBaseline = 'middle';
    tgCtx.textAlign = (lSpacing === 0) ? align : 'left';

    const lineHeightPx = baseFontSize * lHeight;
    const totalTextHeight = lines.length * lineHeightPx;
    let startY = (pHeight - totalTextHeight) / 2 + (lineHeightPx / 2);

    let startX = pWidth / 2;
    if (align === 'left') startX = pWidth * 0.1;
    if (align === 'right') startX = pWidth * 0.9;

    lines.forEach((line, index) => {
        const currentY = startY + (index * lineHeightPx);

        const s2W = parseInt(tgStroke2Width.value, 10);
        const s1W = parseInt(tgStroke1Width.value, 10);
        const totalStroke = s1W + s2W;
        if (totalStroke > 0) {
            tgCtx.lineWidth = totalStroke * 2;
            tgCtx.strokeStyle = tgStroke2Color.value;
            tgCtx.lineJoin = 'round';
            tgCtx.miterLimit = 2;
            drawTextWithLetterSpacing(tgCtx, line, startX, currentY, align, lSpacing, (txt, cx, cy) => {
                tgCtx.strokeText(txt, cx, cy);
            });
        }

        if (s1W > 0) {
            tgCtx.lineWidth = s1W * 2;
            tgCtx.strokeStyle = tgStroke1Color.value;
            tgCtx.lineJoin = 'round';
            tgCtx.miterLimit = 2;
            drawTextWithLetterSpacing(tgCtx, line, startX, currentY, align, lSpacing, (txt, cx, cy) => {
                tgCtx.strokeText(txt, cx, cy);
            });
        }

        tgCtx.fillStyle = tgTextColor.value;
        drawTextWithLetterSpacing(tgCtx, line, startX, currentY, align, lSpacing, (txt, cx, cy) => {
            tgCtx.fillText(txt, cx, cy);
        });
    });
}

window.openTextGeneratorModalFor = function(prefix) {
    currentActiveUser = prefix;
    openModal('text-generator-modal');
    setTimeout(renderTextGeneratorPreview, 50);
};

window.copyGeneratedTextToClipboard = async function() {
    renderTextGeneratorPreview();
    const copyBtn = document.getElementById('tg-copyBtn');
    const originalHTML = copyBtn.innerHTML;

    try {
        return new Promise((resolve, reject) => {
            tgPreviewCanvas.toBlob(async (blob) => {
                if (!blob) {
                    reject(new Error('画像の生成に失敗しました'));
                    return;
                }
                try {
                    await navigator.clipboard.write([
                        new ClipboardItem({ 'image/png': blob })
                    ]);
                    copyBtn.innerHTML = '<i class="fa-solid fa-check text-emerald-400"></i> コピーしました！';
                    setTimeout(() => {
                        copyBtn.innerHTML = originalHTML;
                    }, 2000);
                    resolve(blob);
                } catch (err) {
                    reject(err);
                }
            }, 'image/png');
        });
    } catch (err) {
        console.error(err);
        alert('お使いのブラウザ環境ではクリップボードへの画像コピーがサポートされていません。');
    }
};

window.pasteGeneratedTextToCanvas = async function() {
    try {
        const blob = await window.copyGeneratedTextToClipboard();
        if (!blob) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const img = new Image();
            img.onload = () => {
                const ws = workspaces[currentActiveUser];
                const activeLayer = ws.layers.find(l => l.id === ws.activeLayerId);
                if (!activeLayer) return;
                saveState(currentActiveUser);
                
                const pW = img.width;
                const pH = img.height;
                const drawX = Math.floor((canvasWidth - pW) / 2);
                const drawY = Math.floor((canvasHeight - pH) / 2);
                
                activeLayer.ctx.drawImage(img, drawX, drawY);
                saveState(currentActiveUser);
                
                closeModal('text-generator-modal');
                alert(`プレイヤー${currentActiveUser.toUpperCase()}のキャンバスにテキストを貼り付けました！`);
            };
            img.src = event.target.result;
        };
        reader.readAsDataURL(blob);
    } catch (err) {
        console.error(err);
        alert('キャンバスへの貼り付けに失敗しました。');
    }
};

window.addModalLayerAndPaste = function() {
    const ws = workspaces[currentActiveUser];
    const newId = ws.layers.length + 1;
    const newLayer = {
        id: newId,
        name: `レイヤー ${newId}`,
        visible: true,
        opacity: 1,
        canvas: null,
        ctx: null
    };
    const cvs = document.createElement('canvas');
    cvs.width = canvasWidth;
    cvs.height = canvasHeight;
    newLayer.canvas = cvs;
    newLayer.ctx = cvs.getContext('2d', { willReadFrequently: true });

    ws.layers.push(newLayer);
    ws.activeLayerId = newId;

    initWorkspace(currentActiveUser);
    alert(`最上層に「${newLayer.name}」を追加し、選択状態にしました！`);
};

[tgTextInput, tgFontFamily, tgFontSize, tgTextAlign, tgLineHeight, tgLetterSpacing, tgTextColor, tgStroke1Color, tgStroke2Color, tgStroke1Width, tgStroke2Width].forEach(el => {
    if (el) {
        el.addEventListener('input', renderTextGeneratorPreview);
        el.addEventListener('change', renderTextGeneratorPreview);
    }
});

// Test Canvas setup in Brush Modal
let testCanvas, testCtx;
const testWidth = 300;
const testHeight = 225;

function initTestCanvas() {
    testCanvas = document.getElementById('test-canvas');
    if (!testCanvas) return;
    testCanvas.width = testWidth;
    testCanvas.height = testHeight;
    testCtx = testCanvas.getContext('2d', { willReadFrequently: true });

    const wrapper = document.getElementById('test-canvas-wrapper');
    if (!wrapper || wrapper.dataset.initialized) return;

    let isTestDrawing = false;
    let lastX = 0, lastY = 0;
    let lastSpeed = 0;
    let testPoints = [];

    const getCoords = (e) => {
        const rect = wrapper.getBoundingClientRect();
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        return {
            x: Math.floor((clientX - rect.left) * (testWidth / rect.width)),
            y: Math.floor((clientY - rect.top) * (testHeight / rect.height))
        };
    };

    const start = (e) => {
        const coords = getCoords(e);
        isTestDrawing = true;
        lastX = coords.x;
        lastY = coords.y;
        lastSpeed = 0;
        testPoints = [{x: coords.x, y: coords.y}];
        renderBrushStroke(workspaces[currentActiveUser], testCtx, coords.x, coords.y, coords.x, coords.y, 0);
    };

    const move = (e) => {
        if (!isTestDrawing) return;
        const coords = getCoords(e);
        const ws = workspaces[currentActiveUser];
        const dx = coords.x - lastX;
        const dy = coords.y - lastY;
        const dist = Math.hypot(dx, dy);

        if (ws.shape === 'calligraphy') {
            if (dist >= 1.5) {
                testPoints.push({x: coords.x, y: coords.y});
                lastX = coords.x;
                lastY = coords.y;
                renderCalligraphySegment(ws, testCtx, testPoints[testPoints.length-2], testPoints[testPoints.length-1]);
            }
            return;
        }

        const speed = dist;
        const currentSpeed = lastSpeed * 0.7 + speed * 0.3;
        lastSpeed = currentSpeed;

        renderBrushStroke(ws, testCtx, lastX, lastY, coords.x, coords.y, currentSpeed);
        lastX = coords.x;
        lastY = coords.y;
    };

    const end = () => { 
        isTestDrawing = false; 
        lastSpeed = 0; 
        if (workspaces[currentActiveUser].shape === 'calligraphy' && testPoints.length > 0) {
            renderCalligraphyPath(workspaces[currentActiveUser], testCtx, testPoints);
        }
        testPoints = [];
    };

    wrapper.addEventListener('mousedown', start);
    wrapper.addEventListener('mousemove', move);
    window.addEventListener('mouseup', end);
    wrapper.addEventListener('touchstart', (e) => { e.preventDefault(); start(e); }, { passive: false });
    wrapper.addEventListener('touchmove', (e) => { e.preventDefault(); move(e); }, { passive: false });
    window.addEventListener('touchend', end);

    wrapper.dataset.initialized = "true";
}

window.clearTestCanvas = function() {
    if (testCtx) {
        testCtx.clearRect(0, 0, testWidth, testHeight);
    }
};

window.openBrushModalFor = function(prefix) {
    currentActiveUser = prefix;
    const ws = workspaces[prefix];
    const modalColor = document.getElementById('modal-color');
    const modalSize = document.getElementById('modal-size');
    const sizeVal = document.getElementById('brush-size-val');
    const modalOpacity = document.getElementById('modal-opacity');
    const opacityVal = document.getElementById('brush-opacity-val');

    if (modalColor) modalColor.value = ws.color;
    if (modalSize) modalSize.value = ws.size;
    if (sizeVal) sizeVal.textContent = ws.size + 'px';
    if (modalOpacity) modalOpacity.value = ws.opacity;
    if (opacityVal) opacityVal.textContent = Math.round(ws.opacity * 100) + '%';
    
    updateBrushShapeUI(ws.shape);
    openModal('brush-modal');
    setTimeout(initTestCanvas, 50);
};

window.openLayerModalFor = function(prefix) {
    currentActiveUser = prefix;
    renderLayerList();
    openModal('layer-modal');
};

window.openModal = function(id) {
    const m = document.getElementById(id);
    if (m) m.classList.remove('hidden');
};

window.closeModal = function(id) {
    const m = document.getElementById(id);
    if (m) m.classList.add('hidden');
};

window.setBrushColor = function(color) {
    workspaces[currentActiveUser].color = color;
    const modalColor = document.getElementById('modal-color');
    if (modalColor) modalColor.value = color;
    updateColorIndicator(currentActiveUser);
};

window.setBrushSize = function(size) {
    workspaces[currentActiveUser].size = parseInt(size);
    const sizeVal = document.getElementById('brush-size-val');
    if (sizeVal) sizeVal.textContent = size + 'px';
};

window.setBrushOpacity = function(opacity) {
    workspaces[currentActiveUser].opacity = parseFloat(opacity);
    const opacityVal = document.getElementById('brush-opacity-val');
    if (opacityVal) opacityVal.textContent = Math.round(opacity * 100) + '%';
};

window.setBrushShape = function(shape) {
    workspaces[currentActiveUser].shape = shape;
    updateBrushShapeUI(shape);
};

function updateBrushShapeUI(activeShape) {
    ['normal', 'calligraphy', 'airbrush', 'crayon', 'marker', 'pencil', 'watercolor', 'brush'].forEach(s => {
        const btn = document.getElementById(`shape-${s}`);
        if (btn) {
            if (s === activeShape) {
                btn.className = "p-2 rounded-xl border border-indigo-500 bg-indigo-950/60 text-indigo-300 text-xs font-bold text-left transition flex items-center space-x-2";
            } else {
                btn.className = "p-2 rounded-xl border border-dark-700 bg-dark-800 hover:bg-dark-700 text-slate-300 text-xs font-bold text-left transition flex items-center space-x-2";
            }
        }
    });
}

window.renderLayerList = function() {
    const container = document.getElementById('layer-list-container');
    if (!container) return;
    const ws = workspaces[currentActiveUser];
    container.innerHTML = '';
    ws.layers.slice().reverse().forEach(layer => {
        const div = document.createElement('div');
        div.className = `flex items-center justify-between p-3 rounded-2xl border ${layer.id === ws.activeLayerId ? 'border-indigo-500 bg-indigo-950/40' : 'border-dark-800 bg-dark-900'}`;
        div.innerHTML = `
            <div class="flex items-center space-x-3 flex-1">
                <button onclick="toggleLayerVisibility(${layer.id})" class="text-slate-400 hover:text-slate-200">
                    <i class="fa-solid ${layer.visible ? 'fa-eye text-indigo-400' : 'fa-eye-slash'}"></i>
                </button>
                <span class="font-bold text-xs text-slate-300 flex-1">${layer.name}</span>
            </div>
            <div class="flex items-center space-x-2">
                <input type="range" min="0" max="1" step="0.1" value="${layer.opacity}" oninput="changeLayerOpacity(${layer.id}, this.value)" class="w-20 accent-indigo-500 bg-dark-800">
                <button onclick="setActiveLayer(${layer.id})" class="px-2.5 py-1 rounded-xl text-xs font-bold ${layer.id === ws.activeLayerId ? 'bg-indigo-600 text-white' : 'bg-dark-800 text-slate-300'}">選択</button>
            </div>
        `;
        container.appendChild(div);
    });
};

window.addNewLayer = function() {
    const ws = workspaces[currentActiveUser];
    const newId = ws.layers.length + 1;
    ws.layers.push({ id: newId, name: `レイヤー ${newId}`, visible: true, opacity: 1, canvas: null, ctx: null });
    const cvs = document.createElement('canvas');
    cvs.width = canvasWidth; cvs.height = canvasHeight;
    ws.layers[ws.layers.length - 1].canvas = cvs;
    ws.layers[ws.layers.length - 1].ctx = cvs.getContext('2d', { willReadFrequently: true });
    
    initWorkspace(currentActiveUser);
    renderLayerList();
};

window.setActiveLayer = function(id) {
    workspaces[currentActiveUser].activeLayerId = id;
    renderLayerList();
};

window.toggleLayerVisibility = function(id) {
    const ws = workspaces[currentActiveUser];
    const layer = ws.layers.find(l => l.id === id);
    if (layer) {
        layer.visible = !layer.visible;
        if (layer.canvas) {
            layer.canvas.classList.toggle('hidden', !layer.visible);
        }
        renderLayerList();
    }
};

window.changeLayerOpacity = function(id, val) {
    const ws = workspaces[currentActiveUser];
    const layer = ws.layers.find(l => l.id === id);
    if (layer) {
        layer.opacity = val;
        if (layer.canvas) {
            layer.canvas.style.opacity = val;
        }
    }
};

let qrInitialized = false;
const qrModal = document.getElementById('qr-modal');
const qrModalBtn = document.getElementById('qr-modal-btn');

if (qrModalBtn && qrModal) {
    qrModalBtn.addEventListener('click', () => {
        qrModal.classList.remove('hidden');
        if (!qrInitialized) {
            const container = document.getElementById('qrcode-container');
            container.innerHTML = '';
            new QRCode(container, {
                text: "https://hinatabokko-jp.github.io/hinatabokko-app2/page31.html",
                width: 180,
                height: 180,
                colorDark: "#020617",
                colorLight: "#ffffff",
                correctLevel: QRCode.CorrectLevel.H
            });
            qrInitialized = true;
        }
    });
}

window.copyInviteUrl = function() {
    const input = document.getElementById('invite-url-input');
    input.select();
    navigator.clipboard.writeText(input.value).then(() => {
        alert("招待用URLをコピーしました！");
    }).catch(err => {
        alert("コピーに失敗しました");
    });
};

// 初期化実行
window.addEventListener('DOMContentLoaded', () => {
    initWorkspace('a');
    initWorkspace('b');
    if (typeof updateStampCount === 'function') {
        updateStampCount();
    }
});