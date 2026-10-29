/**
 * MEMOアプリ - 画像拡大表示（画像ビューア）機能
 */
export function initImageViewer() {
  // ビューア用HTML要素の動的生成
  if (document.getElementById('image-viewer-modal')) return;

  const viewerModal = document.createElement('div');
  viewerModal.id = 'image-viewer-modal';
  viewerModal.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background-color: rgba(0, 0, 0, 0.9);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    z-index: 20000;
    display: flex;
    justify-content: center;
    align-items: center;
    opacity: 0;
    visibility: hidden;
    transition: opacity 0.3s ease, visibility 0.3s ease;
    touch-action: none;
    overflow: hidden;
  `;

  viewerModal.innerHTML = `
    <button id="image-viewer-close" style="
      position: absolute;
      top: 20px;
      right: 20px;
      background: rgba(255, 255, 255, 0.1);
      border: 1px solid rgba(255, 255, 255, 0.2);
      color: #fff;
      width: 44px;
      height: 44px;
      border-radius: 50%;
      font-size: 1.2rem;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 20001;
      transition: background 0.2s;
    ">✕</button>
    <div id="image-viewer-container" style="
      width: 100%;
      height: 100%;
      display: flex;
      justify-content: center;
      align-items: center;
      position: relative;
      overflow: hidden;
    ">
      <img id="image-viewer-img" src="" alt="拡大画像" style="
        max-width: 90%;
        max-height: 90%;
        object-fit: contain;
        transform-origin: center center;
        transition: transform 0.05s ease-out;
        user-select: none;
        pointer-events: auto;
      " />
    </div>
  `;

  document.body.appendChild(viewerModal);

  const imgElement = document.getElementById('image-viewer-img');
  const closeBtn = document.getElementById('image-viewer-close');
  const container = document.getElementById('image-viewer-container');

  let scale = 1;
  let minScale = 1;
  let maxScale = 5;
  let posX = 0;
  let posY = 0;
  
  let isDragging = false;
  let startX = 0;
  let startY = 0;

  let initialDistance = 0;
  let initialScale = 1;

  function resetTransform() {
    scale = 1;
    posX = 0;
    posY = 0;
    updateTransform();
  }

  function updateTransform() {
    imgElement.style.transform = `translate(${posX}px, ${posY}px) scale(${scale})`;
  }

  function openModal(imgSrc) {
    if (!imgSrc) return;
    imgElement.src = imgSrc;
    resetTransform();
    viewerModal.style.opacity = '1';
    viewerModal.style.visibility = 'visible';
    document.body.style.overflow = 'hidden'; // 背後スクロール防止
  }

  function closeModal() {
    viewerModal.style.opacity = '0';
    viewerModal.style.visibility = 'hidden';
    document.body.style.overflow = '';
    setTimeout(() => {
      imgElement.src = '';
      resetTransform();
    }, 300);
  }

  closeBtn.addEventListener('click', closeModal);
  viewerModal.addEventListener('click', (e) => {
    if (e.target === viewerModal || e.target === container) {
      closeModal();
    }
  });

  // チャット内の画像クリックを監視（送信画像・受信画像両対応）
  document.addEventListener('click', (e) => {
    const target = e.target;
    if (target.tagName === 'IMG' && (target.classList.contains('chat-image') || target.classList.contains('chat-stamp'))) {
      e.stopPropagation();
      openModal(target.src);
    }
  });

  // タッチ操作（ピンチイン・ピンチアウト・ドラッグ）
  container.addEventListener('touchstart', (e) => {
    if (e.touches.length === 1) {
      isDragging = true;
      startX = e.touches[0].clientX - posX;
      startY = e.touches[0].clientY - posY;
    } else if (e.touches.length === 2) {
      isDragging = false;
      initialDistance = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      initialScale = scale;
    }
  }, { passive: false });

  container.addEventListener('touchmove', (e) => {
    e.preventDefault();
    if (isDragging && e.touches.length === 1) {
      posX = e.touches[0].clientX - startX;
      posY = e.touches[0].clientY - startY;
      updateTransform();
    } else if (e.touches.length === 2) {
      const currentDistance = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      if (initialDistance > 0) {
        let newScale = initialScale * (currentDistance / initialDistance);
        scale = Math.max(minScale, Math.min(maxScale, newScale));
        updateTransform();
      }
    }
  }, { passive: false });

  container.addEventListener('touchend', (e) => {
    if (e.touches.length < 2) {
      initialDistance = 0;
    }
    if (e.touches.length === 0) {
      isDragging = false;
    }
  });

  // マウスドラッグ対応（PCでの確認用）
  container.addEventListener('mousedown', (e) => {
    isDragging = true;
    startX = e.clientX - posX;
    startY = e.clientY - posY;
  });

  container.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    posX = e.clientX - startX;
    posY = e.clientY - startY;
    updateTransform();
  });

  container.addEventListener('mouseup', () => {
    isDragging = false;
  });

  container.addEventListener('wheel', (e) => {
    e.preventDefault();
    const zoomIntensity = 0.1;
    if (e.deltaY < 0) {
      scale = Math.min(maxScale, scale + zoomIntensity);
    } else {
      scale = Math.max(minScale, scale - zoomIntensity);
    }
    updateTransform();
  }, { passive: false });
}