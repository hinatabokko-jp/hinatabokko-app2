/**
 * 手描きスタンプ作成モーダル用 JavaScript モジュール
 * - 2層レイヤー管理 (ドラッグ＆ドロップ順序変更対応)
 * - 各種ブラシ描画 (ペン、カリグラフィ、エアブラシ、油彩、クレヨン、マーカー、鉛筆、水彩)
 * - バケツ塗りつぶし (Flood Fill) 機能
 * - 履歴管理 (Undo)
 * - レイヤープレビューのリアルタイム更新
 */

(function () {
  'use strict';

  // モーダル要素の取得
  const stampModalOverlay = document.getElementById('stamp-modal-overlay');
  const stampModalCloseX = document.getElementById('stamp-modal-close-x');
  const stampCancelBtn = document.getElementById('stamp-cancel-btn');
  const backToCommentBtn = document.getElementById('back-to-comment-btn');
  const goToHistoryBtn = document.getElementById('go-to-history-btn');
  const stampSubmitBtn = document.getElementById('stamp-submit-btn');

  // キャンバスとコンテキスト
  const canvasBottom = document.getElementById('layer-bottom');
  const canvasTop = document.getElementById('layer-top');
  const ctxBottom = canvasBottom ? canvasBottom.getContext('2d', { willReadFrequently: true }) : null;
  const ctxTop = canvasTop ? canvasTop.getContext('2d', { willReadFrequently: true }) : null;

  // レイヤー関連のDOM
  const layerItem1 = document.getElementById('layer-item-1');
  const layerItem2 = document.getElementById('layer-item-2');
  const psPreview1 = document.getElementById('ps-preview-1');
  const psPreview2 = document.getElementById('ps-preview-2');
  const layersPanelContainer = document.getElementById('layers-panel-container');

  // ツールUIコントロール
  const stampColorInput = document.getElementById('stamp-color');
  const stampOpacityInput = document.getElementById('stamp-opacity');
  const stampSizeInput = document.getElementById('stamp-size');
  const brushSelect = document.getElementById('brush-select');
  const toolFill = document.getElementById('tool-fill');
  const toolEraser = document.getElementById('tool-eraser');
  const toolUndo = document.getElementById('tool-undo');
  const toolClear = document.getElementById('tool-clear');

  // アプリケーション状態管理
  let activeLayerId = 2; // デフォルトは Layer 2
  let layerOrder = [1, 2]; // 下から上への描画順序
  let currentTool = 'pen'; // 'pen', 'eraser', 'fill'
  let currentBrushType = 'pen';
  let isDrawing = false;
  let lastPoint = null;

  // 各レイヤーの描画履歴（Undo用）
  const historyStackMap = {
    1: [],
    2: []
  };
  const MAX_HISTORY = 20;

  // キャンバスマッピングヘルパー
  function getCanvasByLayerId(id) {
    // データ値に応じて割当 (レイヤー1=下キャンバス, レイヤー2=上キャンバス)
    return id === 1 ? canvasBottom : canvasTop;
  }

  function getCtxByLayerId(id) {
    return id === 1 ? ctxBottom : ctxTop;
  }

  function getActiveCtx() {
    return getCtxByLayerId(activeLayerId);
  }

  function getActiveCanvas() {
    return getCanvasByLayerId(activeLayerId);
  }

  // ----------------------------------------------------------------
  // 履歴（Undo）管理
  // ----------------------------------------------------------------
  function saveHistoryState(layerId) {
    const canvas = getCanvasByLayerId(layerId);
    const ctx = getCtxByLayerId(layerId);
    if (!canvas || !ctx) return;

    const stack = historyStackMap[layerId];
    if (stack.length >= MAX_HISTORY) {
      stack.shift();
    }
    stack.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
  }

  function undo(layerId) {
    const stack = historyStackMap[layerId];
    const canvas = getCanvasByLayerId(layerId);
    const ctx = getCtxByLayerId(layerId);

    if (stack.length > 0) {
      const lastState = stack.pop();
      ctx.putImageData(lastState, 0, 0);
      updateLayerPreviews();
    }
  }

  function clearLayer(layerId) {
    saveHistoryState(layerId);
    const canvas = getCanvasByLayerId(layerId);
    const ctx = getCtxByLayerId(layerId);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    updateLayerPreviews();
  }

  // レイヤーのサムネイル表示更新
  function updateLayerPreviews() {
    if (psPreview1 && canvasBottom) {
      psPreview1.src = canvasBottom.toDataURL();
    }
    if (psPreview2 && canvasTop) {
      psPreview2.src = canvasTop.toDataURL();
    }
  }

  // ----------------------------------------------------------------
  // レイヤー管理 & ドラッグ・アンド・ドロップ
  // ----------------------------------------------------------------
  function setActiveLayer(layerId) {
    activeLayerId = layerId;
    [layerItem1, layerItem2].forEach(item => {
      if (item) {
        const id = parseInt(item.getAttribute('data-layer'), 10);
        if (id === activeLayerId) {
          item.classList.add('active');
        } else {
          item.classList.remove('active');
        }
      }
    });
  }

  function setupLayerEvents() {
    [layerItem1, layerItem2].forEach(item => {
      if (!item) return;

      item.addEventListener('click', (e) => {
        const id = parseInt(item.getAttribute('data-layer'), 10);
        setActiveLayer(id);
      });

      // レイヤー順序変更用 D&D イベント
      item.addEventListener('dragstart', (e) => {
        e.dataTransfer.setData('text/plain', item.getAttribute('data-layer'));
      });

      item.addEventListener('dragover', (e) => {
        e.preventDefault();
      });

      item.addEventListener('drop', (e) => {
        e.preventDefault();
        const draggedLayerId = parseInt(e.dataTransfer.getData('text/plain'), 10);
        const targetLayerId = parseInt(item.getAttribute('data-layer'), 10);

        if (draggedLayerId !== targetLayerId) {
          swapLayers();
        }
      });
    });
  }

  function swapLayers() {
    layerOrder.reverse();
    // z-index と z-order を切り替え
    if (canvasBottom && canvasTop) {
      const isTopFirst = layerOrder[1] === 1;
      canvasBottom.style.zIndex = isTopFirst ? '2' : '1';
      canvasTop.style.zIndex = isTopFirst ? '1' : '2';
    }
    // パネル上の並び替え
    if (layersPanelContainer && layerItem1 && layerItem2) {
      if (layerOrder[1] === 1) {
        layersPanelContainer.insertBefore(layerItem1, layerItem2);
      } else {
        layersPanelContainer.insertBefore(layerItem2, layerItem1);
      }
    }
  }

  // ----------------------------------------------------------------
  // 描画エンジン (ブラッシュスタイル & バケツ塗りつぶし)
  // ----------------------------------------------------------------
  function hexToRgba(hex, alpha) {
    let c = hex.replace('#', '');
    if (c.length === 3) {
      c = c.split('').map(char => char + char).join('');
    }
    const num = parseInt(c, 16);
    return `rgba(${(num >> 16) & 255}, ${(num >> 8) & 255}, ${num & 255}, ${alpha})`;
  }

  function drawStroke(ctx, p1, p2) {
    const colorHex = stampColorInput.value;
    const opacity = parseFloat(stampOpacityInput.value);
    const baseSize = parseFloat(stampSizeInput.value);
    const color = colorHex;
    const dist = Math.hypot(p2.x - p1.x, p2.y - p1.y);

    ctx.save();

    if (currentTool === 'eraser') {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.beginPath();
      ctx.arc(p2.x, p2.y, baseSize / 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
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

    ctx.restore();
  }

  // バケツ塗りつぶし (Flood Fill Algorithm)
  function floodFill(ctx, startX, startY, fillColorHex, opacity) {
    const canvas = ctx.canvas;
    const width = canvas.width;
    const height = canvas.height;
    const imgData = ctx.getImageData(0, 0, width, height);
    const data = imgData.data;

    const pixelPos = (startY * width + startX) * 4;
    const startR = data[pixelPos];
    const startG = data[pixelPos + 1];
    const startB = data[pixelPos + 2];
    const startA = data[pixelPos + 3];

    // 新しい色のRGBA解析
    let c = fillColorHex.replace('#', '');
    if (c.length === 3) c = c.split('').map(x => x + x).join('');
    const fillR = parseInt(c.substring(0, 2), 16);
    const fillG = parseInt(c.substring(2, 4), 16);
    const fillB = parseInt(c.substring(4, 6), 16);
    const fillA = Math.round(opacity * 255);

    if (startR === fillR && startG === fillG && startB === fillB && startA === fillA) {
      return;
    }

    const matchStartColor = (pos) => {
      return (
        data[pos] === startR &&
        data[pos + 1] === startG &&
        data[pos + 2] === startB &&
        data[pos + 3] === startA
      );
    };

    const colorPixel = (pos) => {
      data[pos] = fillR;
      data[pos + 1] = fillG;
      data[pos + 2] = fillB;
      data[pos + 3] = fillA;
    };

    const queue = [[startX, startY]];
    while (queue.length > 0) {
      const [x, y] = queue.pop();
      let currentPos = (y * width + x) * 4;

      let topY = y;
      while (topY >= 0 && matchStartColor(currentPos)) {
        topY--;
        currentPos -= width * 4;
      }
      currentPos += width * 4;
      topY++;

      let reachLeft = false;
      let reachRight = false;

      while (topY < height && matchStartColor(currentPos)) {
        colorPixel(currentPos);

        if (x > 0) {
          if (matchStartColor(currentPos - 4)) {
            if (!reachLeft) {
              queue.push([x - 1, topY]);
              reachLeft = true;
            }
          } else if (reachLeft) {
            reachLeft = false;
          }
        }

        if (x < width - 1) {
          if (matchStartColor(currentPos + 4)) {
            if (!reachRight) {
              queue.push([x + 1, topY]);
              reachRight = true;
            }
          } else if (reachRight) {
            reachRight = false;
          }
        }

        topY++;
        currentPos += width * 4;
      }
    }

    ctx.putImageData(imgData, 0, 0);
  }

  // ----------------------------------------------------------------
  // イベントバインディング & キャンバス操作
  // ----------------------------------------------------------------
  function getCanvasCoordinates(e, canvas) {
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return {
      x: Math.round(((clientX - rect.left) / rect.width) * canvas.width),
      y: Math.round(((clientY - rect.top) / rect.height) * canvas.height)
    };
  }

  function handleStart(e) {
    const ctx = getActiveCtx();
    const canvas = getActiveCanvas();
    if (!ctx || !canvas) return;

    const pos = getCanvasCoordinates(e, canvas);

    if (currentTool === 'fill') {
      saveHistoryState(activeLayerId);
      floodFill(ctx, pos.x, pos.y, stampColorInput.value, parseFloat(stampOpacityInput.value));
      updateLayerPreviews();
      return;
    }

    isDrawing = true;
    lastPoint = pos;
    saveHistoryState(activeLayerId);
    drawStroke(ctx, pos, pos);
  }

  function handleMove(e) {
    if (!isDrawing) return;
    e.preventDefault();

    const ctx = getActiveCtx();
    const canvas = getActiveCanvas();
    if (!ctx || !canvas) return;

    const currentPoint = getCanvasCoordinates(e, canvas);
    drawStroke(ctx, lastPoint, currentPoint);
    lastPoint = currentPoint;
  }

  function handleEnd() {
    if (isDrawing) {
      isDrawing = false;
      lastPoint = null;
      updateLayerPreviews();
    }
  }

  function bindCanvasEvents() {
    const wrapper = document.querySelector('.canvas-wrapper');
    if (!wrapper) return;

    wrapper.addEventListener('mousedown', handleStart);
    wrapper.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleEnd);

    wrapper.addEventListener('touchstart', handleStart, { passive: false });
    wrapper.addEventListener('touchmove', handleMove, { passive: false });
    window.addEventListener('touchend', handleEnd);
  }

  // ----------------------------------------------------------------
  // ツールUI設定
  // ----------------------------------------------------------------
  function setupToolEvents() {
    if (brushSelect) {
      brushSelect.addEventListener('change', (e) => {
        currentBrushType = e.target.value;
        currentTool = 'pen';
        updateToolUIState();
      });
    }

    if (toolFill) {
      toolFill.addEventListener('click', () => {
        currentTool = 'fill';
        updateToolUIState();
      });
    }

    if (toolEraser) {
      toolEraser.addEventListener('click', () => {
        currentTool = 'eraser';
        updateToolUIState();
      });
    }

    if (toolUndo) {
      toolUndo.addEventListener('click', () => {
        undo(activeLayerId);
      });
    }

    if (toolClear) {
      toolClear.addEventListener('click', () => {
        clearLayer(activeLayerId);
      });
    }
  }

  function updateToolUIState() {
    if (toolFill) toolFill.classList.toggle('active', currentTool === 'fill');
    if (toolEraser) toolEraser.classList.toggle('active', currentTool === 'eraser');
  }

  // ----------------------------------------------------------------
  // モーダル表示・非表示コントロール
  // ----------------------------------------------------------------
  function openModal() {
    if (stampModalOverlay) stampModalOverlay.style.display = 'flex';
    updateLayerPreviews();
  }

  function closeModal() {
    if (stampModalOverlay) stampModalOverlay.style.display = 'none';
  }

  function exportMergedCanvas() {
    // 2つのレイヤーを1つのキャンバスに統合
    const exportCanvas = document.createElement('canvas');
    exportCanvas.width = 250;
    exportCanvas.height = 250;
    const expCtx = exportCanvas.getContext('2d');

    layerOrder.forEach(layerId => {
      const srcCanvas = getCanvasByLayerId(layerId);
      if (srcCanvas) {
        expCtx.drawImage(srcCanvas, 0, 0);
      }
    });

    return exportCanvas.toDataURL('image/png');
  }

  function setupModalNavigation() {
    if (stampModalCloseX) stampModalCloseX.addEventListener('click', closeModal);
    if (stampCancelBtn) stampCancelBtn.addEventListener('click', closeModal);

    if (backToCommentBtn) {
      backToCommentBtn.addEventListener('click', () => {
        closeModal();
      });
    }

    if (stampSubmitBtn) {
      stampSubmitBtn.addEventListener('click', () => {
        const dataUrl = exportMergedCanvas();
        // カスタムイベントの発行（外部で完成画像を受け取る用）
        const event = new CustomEvent('stampCreated', { detail: { dataUrl } });
        window.dispatchEvent(event);
        closeModal();
      });
    }
  }

  // ----------------------------------------------------------------
  // 初期化
  // ----------------------------------------------------------------
  function init() {
    setupLayerEvents();
    bindCanvasEvents();
    setupToolEvents();
    setupModalNavigation();
    setActiveLayer(2);
    updateLayerPreviews();
  }

  // DOM構築完了後に実行
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // 外部からのアクセスのためにAPIを公開
  window.StampModal = {
    open: openModal,
    close: closeModal,
    exportImage: exportMergedCanvas
  };
})();