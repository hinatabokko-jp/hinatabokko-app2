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
