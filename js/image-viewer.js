// js/image-viewer.js

export function initImageViewer() {
  // 拡大表示用モーダルのHTML要素を動的生成してbodyに追加
  const viewerOverlay = document.createElement('div');
  viewerOverlay.id = 'image-viewer-modal';
  viewerOverlay.className = 'modal-overlay';
  viewerOverlay.style.zIndex = '20000';
  viewerOverlay.innerHTML = `
    <div style="position: relative; max-width: 90vw; max-height: 90vh; display: flex; align-items: center; justify-content: center;">
      <button id="image-viewer-close" style="position: absolute; top: -45px; right: 0; background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); color: #fff; width: 36px; height: 36px; border-radius: 50%; font-size: 1.1rem; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.2s;">✕</button>
      <img id="image-viewer-img" style="max-width: 100%; max-height: 85vh; object-fit: contain; border-radius: 12px; box-shadow: 0 20px 40px rgba(0,0,0,0.8);" />
    </div>
  `;
  document.body.appendChild(viewerOverlay);

  const viewerImg = document.getElementById('image-viewer-img');
  const closeBtn = document.getElementById('image-viewer-close');

  // チャット内の画像クリックイベントを委譲で検知して拡大表示
  document.addEventListener('click', (e) => {
    if (e.target && e.target.classList.contains('chat-image')) {
      viewerImg.src = e.target.src;
      viewerOverlay.classList.add('active');
    }
  });

  // 閉じる処理
  const closeViewer = () => {
    viewerOverlay.classList.remove('active');
  };

  closeBtn.addEventListener('click', closeViewer);
  viewerOverlay.addEventListener('click', (e) => {
    if (e.target === viewerOverlay) {
      closeViewer();
    }
  });
}
