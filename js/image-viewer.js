/**
 * 画像ビューワー機能（シングルトン設計・GPUアクセラレーション対応）
 */
export function initImageViewer() {
  // すでにビューワー要素が存在しない場合のみDOMに常駐させる（シングルトン設計）
  let viewerOverlay = document.getElementById('global-image-viewer');
  if (!viewerOverlay) {
    viewerOverlay = document.createElement('div');
    viewerOverlay.id = 'global-image-viewer';
    viewerOverlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background-color: rgba(0, 0, 0, 0.85);
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
      z-index: 20000;
      display: flex;
      justify-content: center;
      align-items: center;
      opacity: 0;
      visibility: hidden;
      transition: opacity 0.25s ease, visibility 0.25s ease;
      touch-action: none;
      will-change: opacity;
    `;

    viewerOverlay.innerHTML = `
      <button id="viewer-close-btn" style="
        position: absolute;
        top: 20px;
        right: 20px;
        background: rgba(255, 255, 255, 0.1);
        border: 1px solid rgba(255, 255, 255, 0.2);
        color: #ffffff;
        width: 40px;
        height: 40px;
        border-radius: 50%;
        font-size: 1.2rem;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 20001;
        transition: background 0.2s;
      ">✕</button>
      <div style="
        width: 100%;
        height: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
        padding: 20px;
        overflow: hidden;
      ">
        <img id="viewer-target-img" style="
          max-width: 100%;
          max-height: 100%;
          object-fit: contain;
          border-radius: 8px;
          transform: translate3d(0, 0, 0) scale(1);
          will-change: transform;
          transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1);
          box-shadow: 0 10px 30px rgba(0,0,0,0.5);
        " alt="Expanded View">
      </div>
    `;
    document.body.appendChild(viewerOverlay);
  }

  const targetImg = document.getElementById('viewer-target-img');
  const closeBtn = document.getElementById('viewer-close-btn');

  // ビューワーを開く関数
  window.openImageViewer = function(imgSrc) {
    if (!imgSrc) return;
    targetImg.src = imgSrc;
    viewerOverlay.style.visibility = 'visible';
    viewerOverlay.style.opacity = '1';
    // スムーズな拡大アニメーション
    targetImg.style.transform = 'translate3d(0, 0, 0) scale(1)';
  };

  // ビューワーを閉じる関数（メモリリーク防止のための後始末を含む）
  function closeImageViewer() {
    viewerOverlay.style.opacity = '0';
    viewerOverlay.style.visibility = 'hidden';
    setTimeout(() => {
      targetImg.src = ''; // 画像の参照をクリア
    }, 250);
  }

  closeBtn.addEventListener('click', closeImageViewer);
  viewerOverlay.addEventListener('click', (e) => {
    if (e.target === viewerOverlay) {
      closeImageViewer();
    }
  });

  // ESCキーで閉じる
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeImageViewer();
    }
  });
}