import { db } from "./config.js";
import { ref, onValue, set, remove } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

const imagesRef = ref(db, 'gallery_images');
let itemToDeleteId = null;
let cachedImages = [];

// ピンチイン・ピンチアウト / ズーム・パン用変数
let currentScale = 1;
let minScale = 1;
let maxScale = 4;
let translateX = 0;
let translateY = 0;
let isDragging = false;
let startX = 0;
let startY = 0;
let initialPinchDistance = 0;
let initialScale = 1;

// 認証解除（アンロック）後にGalleryのデータを読み込み開始
window.initGalleryApp = function() {
    onValue(imagesRef, async (snapshot) => {
        const data = snapshot.val();
        let items = [];
        if (data) {
            items = Object.values(data);
        }

        items.sort((a, b) => b.timestamp - a.timestamp);
        cachedImages = items;
        renderFeed(cachedImages);
    });
};

// すでにログイン状態の場合は即時初期化
if (localStorage.getItem('memo_app_unlocked') === 'true' || sessionStorage.getItem('memo_app_unlocked') === 'true') {
    window.initGalleryApp();
}

// 認証画面からのアンロック検知
const observer = new MutationObserver(() => {
    const appContent = document.getElementById('app-content');
    if (appContent && appContent.style.display !== 'none' && !window._galleryInitialized) {
        window._galleryInitialized = true;
        window.initGalleryApp();
    }
});
const appContentEl = document.getElementById('app-content');
if (appContentEl) {
    observer.observe(appContentEl, { attributes: true, attributeFilter: ['style'] });
}

function renderFeed(items) {
    const container = document.getElementById('feed-container');
    const emptyState = document.getElementById('empty-state');

    container.innerHTML = '';

    if (!items || items.length === 0) {
        container.classList.add('hidden');
        emptyState.classList.remove('hidden');
        emptyState.classList.add('flex');
        return;
    }

    container.classList.remove('hidden');
    emptyState.classList.add('hidden');
    emptyState.classList.remove('flex');

    items.forEach(item => {
        const card = createCardElement(item);
        container.appendChild(card);
    });
}

function createCardElement(item) {
    const formattedDate = new Date(item.timestamp).toLocaleString('ja-JP', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });

    const card = document.createElement('article');
    card.className = 'bg-cardBg border border-gray-800/80 rounded-2xl overflow-hidden shadow-xl flex flex-col mb-4 transition-all hover:border-gray-700/80';
    card.dataset.id = item.id;

    card.innerHTML = `
        <div class="px-3.5 py-3 flex items-center justify-between border-b border-gray-800/50 bg-cardBg">
            <div class="flex items-center gap-2.5">
                <div class="w-7 h-7 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white text-[10px] font-bold">
                    <i class="fa-solid fa-user"></i>
                </div>
                <div>
                    <p class="text-xs font-semibold text-gray-200 line-clamp-1">${escapeHtml(item.name || '無題の画像')}</p>
                    <p class="text-[10px] text-gray-400">${formattedDate}</p>
                </div>
            </div>
            <div class="flex items-center gap-1">
                <button class="download-btn w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-white hover:bg-gray-800 transition" title="ダウンロード">
                    <i class="fa-solid fa-download text-xs"></i>
                </button>
                <button class="delete-btn w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-red-400 hover:bg-gray-800 transition" title="削除">
                    <i class="fa-regular fa-trash-can text-xs"></i>
                </button>
            </div>
        </div>

        <div class="relative w-full aspect-[9/16] bg-black overflow-hidden cursor-pointer group image-container">
            <img src="${item.src}" alt="${escapeHtml(item.name)}" class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy">
            
            <div class="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <span class="bg-black/60 text-white text-xs px-3 py-1.5 rounded-full backdrop-blur-md flex items-center gap-1.5 border border-white/10">
                    <i class="fa-solid fa-expand text-xs"></i> 拡大表示
                </span>
            </div>

            ${item.caption ? `
                <div class="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-3.5 pt-8 text-xs text-gray-200 backdrop-blur-[1px]">
                    <p class="line-clamp-2">${escapeHtml(item.caption)}</p>
                </div>
            ` : ''}
        </div>
    `;

    card.querySelector('.image-container').addEventListener('click', () => openFullModal(item.src, item.name));
    card.querySelector('.download-btn').addEventListener('click', (e) => {
        e.stopPropagation();
        downloadImageAsJpg(item.src, item.name || 'image.jpg');
    });
    card.querySelector('.delete-btn').addEventListener('click', (e) => {
        e.stopPropagation();
        promptDelete(item.id);
    });

    return card;
}

document.addEventListener('DOMContentLoaded', () => {
    const inputs = ['image-upload-input', 'empty-upload-input', 'footer-upload-input'];
    inputs.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.addEventListener('change', handleFileSelect);
        }
    });

    document.getElementById('btn-scroll-top').addEventListener('click', () => {
        document.getElementById('feed-container').scrollTo({ top: 0, behavior: 'smooth' });
    });

    document.getElementById('btn-reset-demo').addEventListener('click', async () => {
        if (confirm('保存されているすべての画像を完全に削除しますか？')) {
            await remove(imagesRef);
            showToast('すべての画像を削除しました', 'delete');
        }
    });

    document.getElementById('close-modal-btn').addEventListener('click', closeModal);
    document.getElementById('fullmodal').addEventListener('click', (e) => {
        if (e.target.id === 'fullmodal' || e.target.id === 'modal-viewport') closeModal();
    });

    document.getElementById('cancel-delete-btn').addEventListener('click', closeDeleteModal);
    document.getElementById('confirm-delete-btn').addEventListener('click', async () => {
        if (itemToDeleteId) {
            await remove(ref(db, 'gallery_images/' + itemToDeleteId));
            closeDeleteModal();
            showToast('画像を削除しました', 'delete');
        }
    });

    setupImageZoomAndPan();
});

async function handleFileSelect(e) {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    let loadedImageCount = 0;
    let loadedPdfPagesCount = 0;

    for (const file of files) {
        if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
            showLoading('PDFを変換中...', `${file.name} を読み込んでいます`);
            try {
                const pageImages = await convertPdfToJpg(file);
                for (let i = 0; i < pageImages.length; i++) {
                    const newId = 'img_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4);
                    const newItem = {
                        id: newId,
                        src: pageImages[i],
                        name: `${file.name} - Page ${i + 1}`,
                        timestamp: Date.now() - (pageImages.length - i)
                    };
                    await set(ref(db, 'gallery_images/' + newId), newItem);
                    loadedPdfPagesCount++;
                }
            } catch (err) {
                console.error('PDF Conversion Error:', err);
                showToast('PDFの変換に失敗しました', 'delete');
            } finally {
                hideLoading();
            }
        } else if (file.type.startsWith('image/')) {
            try {
                const dataUrl = await readFileAsDataURL(file);
                const newId = 'img_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4);
                const newItem = {
                    id: newId,
                    src: dataUrl,
                    name: file.name,
                    timestamp: Date.now()
                };
                await set(ref(db, 'gallery_images/' + newId), newItem);
                loadedImageCount++;
            } catch (err) {
                console.error('File reading error:', err);
            }
        }
    }

    if (loadedImageCount > 0 || loadedPdfPagesCount > 0) {
        let msg = '';
        if (loadedPdfPagesCount > 0 && loadedImageCount > 0) {
            msg = `画像 ${loadedImageCount}件 と PDF ${loadedPdfPagesCount}ページを追加しました`;
        } else if (loadedPdfPagesCount > 0) {
            msg = `PDFから ${loadedPdfPagesCount}ページのJPG画像を保存しました`;
        } else {
            msg = `${loadedImageCount}件の画像を保存しました`;
        }
        showToast(msg);
    }

    e.target.value = '';
}

async function convertPdfToJpg(file) {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    const images = [];

    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        updateLoadingText(`PDFを変換中 (${pageNum}/${pdf.numPages}ページ)...`);
        
        const page = await pdf.getPage(pageNum);
        const scale = 2.0;
        const viewport = page.getViewport({ scale });

        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        await page.render({ canvasContext: context, viewport }).promise;
        const jpgDataUrl = canvas.toDataURL('image/jpeg', 0.9);
        images.push(jpgDataUrl);
    }

    return images;
}

function showLoading(title, desc) {
    const overlay = document.getElementById('loading-overlay');
    document.getElementById('loading-title').textContent = title;
    document.getElementById('loading-desc').textContent = desc;
    overlay.classList.remove('hidden');
    overlay.classList.add('flex');
}

function updateLoadingText(title) {
    document.getElementById('loading-title').textContent = title;
}

function hideLoading() {
    const overlay = document.getElementById('loading-overlay');
    overlay.classList.add('hidden');
    overlay.classList.remove('flex');
}

function readFileAsDataURL(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

function downloadImageAsJpg(url, filename) {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);

        const jpgDataUrl = canvas.toDataURL('image/jpeg', 0.9);

        let baseName = filename.substring(0, filename.lastIndexOf('.')) || filename;
        if (!baseName) baseName = 'image';
        const jpgFilename = `${baseName}.jpg`;

        const a = document.createElement('a');
        a.href = jpgDataUrl;
        a.download = jpgFilename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        showToast('JPEG形式でダウンロードしました');
    };
    img.onerror = () => {
        showToast('ダウンロードに失敗しました', 'delete');
    };
    img.src = url;
}

function promptDelete(id) {
    itemToDeleteId = id;
    const modal = document.getElementById('delete-modal');
    modal.classList.remove('hidden');
    modal.classList.add('flex');
}

function closeDeleteModal() {
    itemToDeleteId = null;
    const modal = document.getElementById('delete-modal');
    modal.classList.add('hidden');
    modal.classList.remove('flex');
}

function openFullModal(src, filename) {
    const modal = document.getElementById('fullmodal');
    const img = document.getElementById('modal-img');
    const dlBtn = document.getElementById('modal-download-btn');

    img.src = src;
    dlBtn.onclick = () => downloadImageAsJpg(src, filename);

    resetZoom();

    modal.classList.remove('hidden');
    modal.classList.add('flex');
    setTimeout(() => {
        modal.classList.remove('opacity-0');
    }, 10);
}

function closeModal() {
    const modal = document.getElementById('fullmodal');
    modal.classList.add('opacity-0');
    setTimeout(() => {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
        document.getElementById('modal-img').src = '';
        resetZoom();
    }, 300);
}

/* ピンチイン・ピンチアウト & PC Ctrl+ホイール拡大/ドラッグ移動制御 */
function setupImageZoomAndPan() {
    const modalImg = document.getElementById('modal-img');
    const viewport = document.getElementById('modal-viewport');

    function updateTransform() {
        if (currentScale <= 1) {
            translateX = 0;
            translateY = 0;
        }
        modalImg.style.transform = `translate(${translateX}px, ${translateY}px) scale(${currentScale})`;
    }

    function resetZoom() {
        currentScale = 1;
        translateX = 0;
        translateY = 0;
        isDragging = false;
        updateTransform();
    }

    window.resetZoom = resetZoom;

    // PC Ctrl + Wheel 拡大縮小
    viewport.addEventListener('wheel', (e) => {
        if (!e.ctrlKey) return;
        e.preventDefault();

        const zoomFactor = e.deltaY < 0 ? 1.15 : 0.85;
        const newScale = Math.min(Math.max(currentScale * zoomFactor, minScale), maxScale);

        currentScale = newScale;
        updateTransform();
    }, { passive: false });

    // タッチ操作（ピンチイン・ピンチアウト & ドラッグ）
    viewport.addEventListener('touchstart', (e) => {
        if (e.touches.length === 2) {
            initialPinchDistance = Math.hypot(
                e.touches[0].clientX - e.touches[1].clientX,
                e.touches[0].clientY - e.touches[1].clientY
            );
            initialScale = currentScale;
        } else if (e.touches.length === 1 && currentScale > 1) {
            isDragging = true;
            startX = e.touches[0].clientX - translateX;
            startY = e.touches[0].clientY - translateY;
        }
    }, { passive: true });

    viewport.addEventListener('touchmove', (e) => {
        if (e.touches.length === 2) {
            e.preventDefault();
            const currentDist = Math.hypot(
                e.touches[0].clientX - e.touches[1].clientX,
                e.touches[0].clientY - e.touches[1].clientY
            );
            if (initialPinchDistance > 0) {
                const scale = (currentDist / initialPinchDistance) * initialScale;
                currentScale = Math.min(Math.max(scale, minScale), maxScale);
                updateTransform();
            }
        } else if (e.touches.length === 1 && isDragging && currentScale > 1) {
            e.preventDefault();
            translateX = e.touches[0].clientX - startX;
            translateY = e.touches[0].clientY - startY;
            updateTransform();
        }
    }, { passive: false });

    viewport.addEventListener('touchend', (e) => {
        if (e.touches.length < 2) {
            initialPinchDistance = 0;
        }
        if (e.touches.length === 0) {
            isDragging = false;
        }
    });

    // マウスドラッグ操作（PCで拡大時）
    viewport.addEventListener('mousedown', (e) => {
        if (currentScale > 1) {
            isDragging = true;
            startX = e.clientX - translateX;
            startY = e.clientY - translateY;
            viewport.style.cursor = 'grabbing';
        }
    });

    window.addEventListener('mousemove', (e) => {
        if (isDragging && currentScale > 1) {
            translateX = e.clientX - startX;
            translateY = e.clientY - startY;
            updateTransform();
        }
    });

    window.addEventListener('mouseup', () => {
        isDragging = false;
        viewport.style.cursor = 'default';
    });
}

function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    
    const icon = type === 'delete' ? 'fa-trash-can' : 'fa-circle-check';
    const iconColor = type === 'delete' ? 'text-red-400' : 'text-emerald-400';

    toast.className = 'bg-gray-800/90 border border-gray-700/80 text-gray-100 text-xs py-2.5 px-4 rounded-full shadow-2xl backdrop-blur-md flex items-center gap-2 transition-all duration-300 opacity-0 translate-y-[-10px]';
    toast.innerHTML = `<i class="fa-solid ${icon} ${iconColor}"></i> <span>${escapeHtml(message)}</span>`;

    container.appendChild(toast);

    setTimeout(() => {
        toast.classList.remove('opacity-0', 'translate-y-[-10px]');
    }, 10);

    setTimeout(() => {
        toast.classList.add('opacity-0', 'translate-y-[-10px]');
        setTimeout(() => {
            toast.remove();
        }, 300);
    }, 2500);
}

function escapeHtml(str) {
    if (!str) return '';
    return str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}