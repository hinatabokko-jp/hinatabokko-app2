// stamp-modal.js
import { ref, push, remove, onValue } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

export function initStampModal({ db, messagesRef, stampHistoryRef }) {
  // --- DOM要素の取得 ---
  const footerStampOpenBtn = document.getElementById('footer-stamp-open-btn');
  const footerStampHistoryOpenBtn = document.getElementById('footer-stamp-history-btn');
  
  const stampModalOverlay = document.getElementById('stamp-modal-overlay');
  const stampModalCloseX = document.getElementById('stamp-modal-close-x');
  const stampCancelBtn = document.getElementById('stamp-cancel-btn');
  const goToHistoryBtn = document.getElementById('go-to-history-btn');
  const stampSubmitBtn = document.getElementById('stamp-submit-btn');

  const layerItem1 = document.getElementById('layer-item-1');
  const layerItem2 = document.getElementById('layer-item-2');
  const psPreview1 = document.getElementById('ps-preview-1');
  const psPreview2 = document.getElementById('ps-preview-2');

  const historyModalOverlay = document.getElementById('history-modal-overlay');
  const historyModalCloseX = document.getElementById('history-modal-close-x');
  const historyModalCloseBtn = document.getElementById('history-modal-close-btn');
  const backToStampDrawBtn = document.getElementById('back-to-stamp-draw-btn');
  const historyGrid = document.getElementById('history-grid');
  const stampUploadInput = document.getElementById('stamp-upload-input');

  const canvasA = document.getElementById('layer-bottom');
  const canvasB = document.getElementById('layer-top');
  const ctxA = canvasA.getContext('2d', { willReadFrequently: true });
  const ctxB = canvasB.getContext('2d', { willReadFrequently: true });

  let activeLayerId = 2;
  const layerOrder = [1, 2];

  const stampColorInput = document.getElementById('stamp-color');
  const stampOpacityInput = document.getElementById('stamp-opacity');
  const stampSizeInput = document.getElementById('stamp-size');
  const brushSelect = document.getElementById('brush-select');
  const toolFill = document.getElementById('tool-fill');
  const toolEraser = document.getElementById('tool-eraser');
  const toolClear = document.getElementById('tool-clear');

  let cachedStampHistory = {};
  let currentTool = 'pen';
  let currentBrushType = 'pen';
  let lastPoint = null;

  // --- レイヤー管理 ---
  function getLayerObj(id) {
    if (id === 1) return { canvas: canvasA, ctx: ctxA };
    return { canvas: canvasB, ctx: ctxB };
  }

  function getActiveLayer() { return getLayerObj(activeLayerId); }

  function updateLayerDOMOrder() {
    if (activeLayerId === 1) {
      canvasA.style.zIndex = 10; canvasB.style.zIndex = 5;
    } else {
      canvasA.style.zIndex = 5; canvasB.style.zIndex = 10;
    }
    layerItem1.classList.toggle('active', activeLayerId === 1);
    layerItem2.classList.toggle('active', activeLayerId === 2);
  }

  layerItem1.addEventListener('click', () => { activeLayerId = 1; updateLayerDOMOrder(); });
  layerItem2.addEventListener('click', () => { activeLayerId = 2; updateLayerDOMOrder(); });

  function updateLayerPreviews() {
    psPreview1.src = canvasA.toDataURL();
    psPreview2.src = canvasB.toDataURL();
  }

  // --- モーダルの開閉イベント ---
  footerStampOpenBtn.addEventListener('click', () => {
    stampModalOverlay.classList.add('active');
    updateLayerPreviews();
  });
  footerStampHistoryOpenBtn.addEventListener('click', () => {
    renderStampHistory();
    historyModalOverlay.classList.add('active');
  });

  stampModalCloseX.addEventListener('click', () => stampModalOverlay.classList.remove('active'));
  stampCancelBtn.addEventListener('click', () => stampModalOverlay.classList.remove('active'));

  // --- ツール設定 ---
  toolFill.addEventListener('click', () => { 
    currentTool = 'fill'; 
    toolEraser.classList.remove('active'); 
    toolFill.classList.add('active'); 
  });

  toolEraser.addEventListener('click', () => { 
    currentTool = 'eraser'; 
    toolEraser.classList.add('active'); 
    toolFill.classList.remove('active'); 
  });

  brushSelect.addEventListener('change', () => {
    currentTool = 'pen';
    currentBrushType = brushSelect.value;
    toolFill.classList.remove('active');
    toolEraser.classList.remove('active');
  });

  toolClear.addEventListener('click', () => {
    const { ctx, canvas } = getActiveLayer();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    updateLayerPreviews();
  });

  function getCanvasCoords(e, canvasEl) {
    const rect = canvasEl.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return {
      x: Math.floor((clientX - rect.left) * (canvasEl.width / rect.width)),
      y: Math.floor((clientY - rect.top) * (canvasEl.height / rect.height))
    };
  }

  function hexToRgb(hex) {
    let c = hex.replace('#', '');
    if (c.length === 3) c = c.split('').map(x => x + x).join('');
    const num = parseInt(c, 16);
    return { r: (num >> 16) & 255, g: (num >> 8) & 255, b: num & 255 };
  }

  // 塗りつぶし (Flood Fill)
  function floodFill(canvas, startX, startY, fillColorHex, opacity) {
    const ctx = canvas.getContext('2d');
    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imgData.data;
    const width = canvas.width;
    const height = canvas.height;

    const targetPos = (startY * width + startX) * 4;
    const targetR = data[targetPos];
    const targetG = data[targetPos + 1];
    const targetB = data[targetPos + 2];
    const targetA = data[targetPos + 3];

    const fillRgb = hexToRgb(fillColorHex);
    const fillA = Math.round(opacity * 255);

    if (targetR === fillRgb.r && targetG === fillRgb.g && targetB === fillRgb.b && targetA === fillA) return;

    const queue = [[startX, startY]];
    const visited = new Uint8Array(width * height);

    while (queue.length > 0) {
      const [x, y] = queue.pop();
      const pos = (y * width + x) * 4;
      const idx = y * width + x;

      if (x < 0 || x >= width || y < 0 || y >= height) continue;
      if (visited[idx]) continue;
      visited[idx] = 1;

      if (Math.abs(data[pos] - targetR) < 30 &&
          Math.abs(data[pos + 1] - targetG) < 30 &&
          Math.abs(data[pos + 2] - targetB) < 30 &&
          Math.abs(data[pos + 3] - targetA) < 30) {
        data[pos] = fillRgb.r;
        data[pos + 1] = fillRgb.g;
        data[pos + 2] = fillRgb.b;
        data[pos + 3] = fillA;

        queue.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]);
      }
    }
    ctx.putImageData(imgData, 0, 0);
  }

  // ブラシ描画処理（各種ブラシの質感向上）
  function drawStroke(ctx, p1, p2) {
    const color = stampColorInput.value;
    const baseSize = parseFloat(stampSizeInput.value);
    const opacity = parseFloat(stampOpacityInput.value);
    const dist = Math.hypot(p2.x - p1.x, p2.y - p1.y);

    if (currentTool === 'eraser') {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.globalAlpha = opacity;
      ctx.strokeStyle = color;
      ctx.lineWidth = baseSize;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.stroke();
      return;
    }

    ctx.globalCompositeOperation = 'source-over';

    switch (currentBrushType) {
      case 'calligraphy-brush':
        ctx.globalAlpha = opacity;
        ctx.strokeStyle = color;
        ctx.lineCap = 'round';
        ctx.lineWidth = Math.max(1, baseSize * (1 - Math.min(dist / 20, 0.7)));
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();
        break;

      case 'calligraphy-pen':
        ctx.globalAlpha = opacity;
        ctx.fillStyle = color;
        const stepsCallig = Math.max(1, Math.floor(dist));
        for (let i = 0; i <= stepsCallig; i++) {
          const curX = p1.x + (p2.x - p1.x) * (i / stepsCallig);
          const curY = p1.y + (p2.y - p1.y) * (i / stepsCallig);
          ctx.beginPath();
          ctx.ellipse(curX, curY, baseSize, Math.max(1, baseSize / 4), Math.PI / 4, 0, Math.PI * 2);
          ctx.fill();
        }
        break;

      case 'airbrush':
        ctx.globalAlpha = opacity * 0.15;
        ctx.fillStyle = color;
        const airSteps = Math.max(1, Math.floor(dist / 2));
        for (let i = 0; i <= airSteps; i++) {
          const curX = p1.x + (p2.x - p1.x) * (i / airSteps);
          const curY = p1.y + (p2.y - p1.y) * (i / airSteps);
          const numParticles = Math.floor(baseSize * 2);
          for (let p = 0; p < numParticles; p++) {
            const r = Math.random() * baseSize * 1.2;
            const a = Math.random() * Math.PI * 2;
            ctx.fillRect(curX + r * Math.cos(a), curY + r * Math.sin(a), 1, 1);
          }
        }
        break;

      case 'oil':
        ctx.globalAlpha = opacity * 0.7;
        ctx.strokeStyle = color;
        ctx.lineCap = 'butt';
        ctx.lineWidth = baseSize;
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();
        break;

      case 'crayon':
        ctx.globalAlpha = opacity * 0.6;
        ctx.fillStyle = color;
        const craySteps = Math.max(1, Math.floor(dist));
        for (let i = 0; i <= craySteps; i++) {
          const curX = p1.x + (p2.x - p1.x) * (i / craySteps);
          const curY = p1.y + (p2.y - p1.y) * (i / craySteps);
          for (let j = 0; j < baseSize * 1.5; j++) {
            const rx = (Math.random() - 0.5) * baseSize;
            const ry = (Math.random() - 0.5) * baseSize;
            if (Math.hypot(rx, ry) <= baseSize / 2) {
              ctx.fillRect(curX + rx, curY + ry, 1.5, 1.5);
            }
          }
        }
        break;

      case 'marker':
        ctx.globalAlpha = opacity * 0.4;
        ctx.fillStyle = color;
        const markSteps = Math.max(1, Math.floor(dist));
        for (let i = 0; i <= markSteps; i++) {
          const curX = p1.x + (p2.x - p1.x) * (i / markSteps);
          const curY = p1.y + (p2.y - p1.y) * (i / markSteps);
          ctx.beginPath();
          ctx.arc(curX, curY, baseSize, 0, Math.PI * 2);
          ctx.fill();
        }
        break;

      case 'pencil':
        ctx.globalAlpha = opacity * 0.8;
        ctx.fillStyle = color;
        const pSteps = Math.max(1, Math.floor(dist));
        for (let i = 0; i <= pSteps; i++) {
          const curX = p1.x + (p2.x - p1.x) * (i / pSteps);
          const curY = p1.y + (p2.y - p1.y) * (i / pSteps);
          for (let j = 0; j < baseSize; j++) {
            const rx = (Math.random() - 0.5) * (baseSize / 2);
            const ry = (Math.random() - 0.5) * (baseSize / 2);
            ctx.fillRect(curX + rx, curY + ry, 1, 1);
          }
        }
        break;

      case 'watercolor':
        ctx.globalAlpha = opacity * 0.12;
        ctx.fillStyle = color;
        const wcSteps = Math.max(1, Math.floor(dist / 2));
        for (let i = 0; i <= wcSteps; i++) {
          const curX = p1.x + (p2.x - p1.x) * (i / wcSteps);
          const curY = p1.y + (p2.y - p1.y) * (i / wcSteps);
          ctx.beginPath();
          ctx.arc(curX, curY, baseSize * 1.3, 0, Math.PI * 2);
          ctx.fill();
        }
        break;

      case 'pen':
      default:
        ctx.globalAlpha = opacity;
        ctx.strokeStyle = color;
        ctx.lineWidth = baseSize;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();
        break;
    }
  }

  // キャンバス描画イベントのバインド
  [canvasA, canvasB].forEach(targetCanvas => {
    let isTargetDrawing = false;
    function startDraw(e) {
      const activeObj = getActiveLayer();
      if (targetCanvas !== activeObj.canvas) return;
      const pos = getCanvasCoords(e, targetCanvas);

      if (currentTool === 'fill') {
        floodFill(targetCanvas, pos.x, pos.y, stampColorInput.value, parseFloat(stampOpacityInput.value));
        updateLayerPreviews();
        return;
      }

      isTargetDrawing = true;
      lastPoint = pos;
      drawStroke(activeObj.ctx, pos, pos);
    }
    function moveDraw(e) {
      if (!isTargetDrawing) return;
      const activeObj = getActiveLayer();
      if (targetCanvas !== activeObj.canvas) return;
      e.preventDefault();
      const pos = getCanvasCoords(e, targetCanvas);
      drawStroke(activeObj.ctx, lastPoint, pos);
      lastPoint = pos;
    }
    function endDraw() {
      if (isTargetDrawing) {
        isTargetDrawing = false;
        lastPoint = null;
        updateLayerPreviews();
      }
    }
    targetCanvas.addEventListener('mousedown', startDraw);
    targetCanvas.addEventListener('mousemove', moveDraw);
    targetCanvas.addEventListener('mouseup', endDraw);
    targetCanvas.addEventListener('mouseleave', endDraw);
    targetCanvas.addEventListener('touchstart', startDraw, { passive: false });
    targetCanvas.addEventListener('touchmove', moveDraw, { passive: false });
    targetCanvas.addEventListener('touchend', endDraw);
  });

  // スタンプの完成・送信
  stampSubmitBtn.addEventListener('click', () => {
    const exportCanvas = document.createElement('canvas');
    exportCanvas.width = 250; exportCanvas.height = 250;
    const expCtx = exportCanvas.getContext('2d');
    layerOrder.forEach(id => expCtx.drawImage(getLayerObj(id).canvas, 0, 0));
    
    const stampDataUrl = exportCanvas.toDataURL('image/png');
    
    push(messagesRef, { text: '', fileData: stampDataUrl, fileName: `stamp_${Date.now()}.png`, isStamp: true, timestamp: Date.now() });
    push(stampHistoryRef, { dataUrl: stampDataUrl, timestamp: Date.now() });
    
    ctxA.clearRect(0, 0, canvasA.width, canvasA.height);
    ctxB.clearRect(0, 0, canvasB.width, canvasB.height);
    updateLayerPreviews();
    stampModalOverlay.classList.remove('active');
  });

  // --- スタンプ履歴・アップロード機能 ---
  stampUploadInput.addEventListener('change', async (e) => {
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
      historyGrid.innerHTML = '<div style="color:var(--text-muted); font-size:0.85rem; grid-column:1/-1; text-align:center;">履歴はありません</div>';
      return;
    }
    keys.reverse().forEach(key => {
      const item = cachedStampHistory[key];
      const card = document.createElement('div');
      card.className = 'history-card';
      card.innerHTML = `
        <div class="history-img-wrapper"><img src="${item.dataUrl}" class="history-img"></div>
        <div style="display:flex; gap:6px; width:100%;">
          <button class="stamp-nav-btn send-hist" data-key="${key}" style="flex:1; padding:6px; font-size:0.75rem;">送信</button>
          <button class="stamp-nav-btn del-hist" data-key="${key}" style="flex:1; padding:6px; font-size:0.75rem; background:rgba(244,63,94,0.2); color:#fda4af;">削除</button>
        </div>
      `;
      card.querySelector('.send-hist').addEventListener('click', () => {
        push(messagesRef, { text: '', fileData: item.dataUrl, fileName: `stamp_${Date.now()}.png`, isStamp: true, timestamp: Date.now() });
        historyModalOverlay.classList.remove('active');
      });
      card.querySelector('.del-hist').addEventListener('click', () => {
        if (confirm('削除しますか？')) remove(ref(db, `stamp_history/${key}`));
      });
      historyGrid.appendChild(card);
    });
  }

  goToHistoryBtn.addEventListener('click', () => { stampModalOverlay.classList.remove('active'); renderStampHistory(); historyModalOverlay.classList.add('active'); });
  backToStampDrawBtn.addEventListener('click', () => { historyModalOverlay.classList.remove('active'); stampModalOverlay.classList.add('active'); });
  historyModalCloseX.addEventListener('click', () => historyModalOverlay.classList.remove('active'));
  historyModalCloseBtn.addEventListener('click', () => historyModalOverlay.classList.remove('active'));
}
