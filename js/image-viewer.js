/**
 * 画像拡大ビューワー機能 (image-viewer.js)
 * チャット内で送受信された画像をスマホの画像ビューワーのように全画面で拡大表示します。
 */

export function initImageViewer() {
  // 画像ビューワー用のモーダルを動的に生成してDOMに追加
  if (document.getElementById('image-viewer-modal')) return;

  const modalHtml = `
    <div id="image-viewer-modal" style="
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
      flex-direction: column;
      justify-content: center;
      align-items: center;
      opacity: 0;
      visibility: hidden;
      transition: opacity 0.3s ease, visibility 0.3s ease;
      padding: 20px;
    ">
      <button id="image-viewer-close" style="
        position: absolute;
        top: 20px;
        right: 20px;
        background: rgba(255, 255, 255, 0.1);
        border: 1px solid rgba(255, 255, 255, 0.2);
        color: #fff;
        width: 40px;
        height: 40px;
        border-radius: 50%;
        font-size: 1.2rem;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s;
        z-index: 20001;
      ">✕</button>
      <div style="
        max-width: 100%;
        max-height: 85vh;
        display: flex;
        justify-content: center;
        align-items: center;
        overflow: auto;
      ">
        <img id="image-viewer-img" src="" alt="拡大画像" style="
          max-width: 100%;
          max-height: 85vh;
          object-fit: contain;
          border-radius: 8px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.8);
          transform: scale(0.95);
          transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        ">
      </div>
    </div>
  `;

  document.body.insertAdjacentHTML('beforeend', modalHtml);

  const modal = document.getElementById('image-viewer-modal');
  const modalImg = document.getElementById('image-viewer-img');
  const closeBtn = document.getElementById('image-viewer-close');

  const closeModal = () => {
    modal.style.opacity = '0';
    modal.style.visibility = 'hidden';
    modalImg.style.transform = 'scale(0.95)';
  };

  closeBtn.addEventListener('click', closeModal);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      closeModal();
    }
  });

  // ESCキーでも閉じられるように
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeModal();
    }
  });

  // グローバル関数として開く関数を公開（またはイベント委任で対応）
  window.openImageViewer = (imgSrc) => {
    if (!imgSrc) return;
    modalImg.src = imgSrc;
    modal.style.opacity = '1';
    modal.style.visibility = 'visible';
    modalImg.style.transform = 'scale(1)';
  };
}
