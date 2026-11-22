import { db } from "./config.js";
import { ref, onValue, set, update, remove } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

const imagesRef = ref(db, 'gallery_images');
let itemToDeleteId = null;
let cachedImages = [];

// 並び替えモーダル用状態管理
let reorderPostId = null;
let reorderSlides = [];
let draggedReorderIndex = null;

// 拡大モーダル内の複数画像状態管理
let modalSlides = [];
let modalCurrentIndex = 0;

// ピンチイン・ピンチアウト / ズーム・パン用変数
let currentScale = 1;
let minScale = 1;
let maxScale = 5;
let translateX = 0;
let translateY = 0;
let isDragging = false;
let startX = 0;
let startY = 0;
let initialPinchDistance = 0;
let initialScale = 1;
let lastTapTime = 0;

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

// 投稿アイテムから表示用スライド配列を正規化（複数画像・単一画像・音声対応）
function normalizeSlides(item) {
    if (Array.isArray(item.images) && item.images.length > 0) {
        return item.images.map((img, idx) => {
            if (typeof img === 'string') {
                return { src: img, name: `${item.name || 'image'} (${idx + 1})` };
            }
            return {
                src: img.src,
                name: img.name || item.name || `image_${idx + 1}.jpg`
            };
        });
    }
    return [{ src: item.src, name: item.name || '無題の画像' }];
}

function renderFeed(items) {
    const container = document.getElementById('feed-container');
    const emptyState = document.getElementById('empty-state');

    if (!container || !emptyState) return;
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
    const slides = normalizeSlides(item);
    const isMulti = slides.length > 1;
    const isAudio = item.type === 'audio' || (slides[0] && typeof slides[0].src === 'string' && slides[0].src.startsWith('data:audio/'));
    let activeIndex = 0;

    const formattedDate = new Date(item.timestamp).toLocaleString('ja-JP', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });

    const card = document.createElement('article');
    card.className = 'bg-cardBg border border-gray-800/80 rounded-2xl overflow-hidden shadow-xl flex flex-col mb-4 transition-all hover:border-gray-700/80';
    card.dataset.id = item.id;

    const titleText = isMulti
        ? `${item.name || '無題の投稿'} (${slides.length}枚)`
        : (item.name || '無題の画像');

    card.innerHTML = `
        <div class="px-3.5 py-3 flex items-center justify-between border-b border-gray-800/50 bg-cardBg">
            <div class="flex items-center gap-2.5 min-w-0">
                <div class="w-7 h-7 shrink-0 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white text-[10px] font-bold">
                    <i class="fa-solid fa-user"></i>
                </div>
                <div class="min-w-0">
                    <p class="text-xs font-semibold text-gray-200 line-clamp-1">${escapeHtml(titleText)}</p>
                    <p class="text-[10px] text-gray-400">${formattedDate}</p>
                </div>
            </div>
            <div class="flex items-center gap-1 shrink-0">
                ${isMulti && !isAudio ? `
                <button class="reorder-btn w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-indigo-400 hover:bg-gray-800 transition" title="画像の並び替え">
                    <i class="fa-solid fa-arrow-up-down text-xs"></i>
                </button>` : ''}
                ${!isAudio ? `
                <button class="download-btn w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-white hover:bg-gray-800 transition" title="表示中の画像をダウンロード">
                    <i class="fa-solid fa-download text-xs"></i>
                </button>` : ''}
                <button class="delete-btn w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-red-400 hover:bg-gray-800 transition" title="削除">
                    <i class="fa-regular fa-trash-can text-xs"></i>
                </button>
            </div>
        </div>

        <div class="relative w-full aspect-[9/16] bg-black overflow-hidden cursor-pointer group image-container">
            <img src="${slides[0].src}" alt="${escapeHtml(slides[0].name)}" class="card-slide-img w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy">
            
            <div class="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                <span class="bg-black/60 text-white text-xs px-3 py-1.5 rounded-full backdrop-blur-md flex items-center gap-1.5 border border-white/10">
                    <i class="fa-solid fa-expand text-xs"></i> 拡大表示
                </span>
            </div>

            ${isMulti ? `
                <span class="slide-badge absolute top-3 right-3 bg-black/70 text-white text-[11px] font-semibold px-2.5 py-1 rounded-full backdrop-blur-md border border-white/10 z-10 pointer-events-none">
                    1 / ${slides.length}
                </span>

                <button type="button" class="slide-prev-btn hidden absolute left-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/60 hover:bg-black/80 text-white items-center justify-center z-10 backdrop-blur-md border border-white/10 transition" title="前の画像">
                    <i class="fa-solid fa-chevron-left text-xs"></i>
                </button>
                <button type="button" class="slide-next-btn absolute right-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center z-10 backdrop-blur-md border border-white/10 transition" title="次の画像">
                    <i class="fa-solid fa-chevron-right text-xs"></i>
                </button>

                <div class="slide-dots absolute bottom-3 left-0 right-0 flex justify-center gap-1.5 z-10 pointer-events-none">
                    ${slides.map((_, idx) => `
                        <span class="h-1.5 rounded-full transition-all ${idx === 0 ? 'w-4 bg-white' : 'w-1.5 bg-white/40'}"></span>
                    `).join('')}
                </div>
            ` : ''}

            ${item.caption ? `
                <div class="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-3.5 pt-8 text-xs text-gray-200 backdrop-blur-[1px]">
                    <p class="line-clamp-2">${escapeHtml(item.caption)}</p>
                </div>
            ` : ''}
        </div>
    `;

    const imgContainer = card.querySelector('.image-container');
    const slideImg = card.querySelector('.card-slide-img');
    const badgeEl = card.querySelector('.slide-badge');
    const prevBtn = card.querySelector('.slide-prev-btn');
    const nextBtn = card.querySelector('.slide-next-btn');
    const dotsEl = card.querySelector('.slide-dots');

    function updateCardSlide(nextIdx) {
        if (nextIdx < 0 || nextIdx >= slides.length) return;
        activeIndex = nextIdx;
        const currentSlide = slides[activeIndex];
        slideImg.src = currentSlide.src;
        slideImg.alt = currentSlide.name;

        if (badgeEl) {
            badgeEl.textContent = `${activeIndex + 1} / ${slides.length}`;
        }
        if (prevBtn) {
            prevBtn.classList.toggle('hidden', activeIndex === 0);
            prevBtn.classList.toggle('flex', activeIndex > 0);
        }
        if (nextBtn) {
            nextBtn.classList.toggle('hidden', activeIndex === slides.length - 1);
            nextBtn.classList.toggle('flex', activeIndex < slides.length - 1);
        }
        if (dotsEl) {
            const dots = Array.from(dotsEl.children);
            dots.forEach((dot, idx) => {
                dot.className = `h-1.5 rounded-full transition-all ${idx === activeIndex ? 'w-4 bg-white' : 'w-1.5 bg-white/40'}`;
            });
        }
    }

    if (prevBtn) {
        prevBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            updateCardSlide(activeIndex - 1);
        });
    }
    if (nextBtn) {
        nextBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            updateCardSlide(activeIndex + 1);
        });
    }

    // カード上での横スワイプ対応
    let cardTouchStartX = 0;
    let cardTouchStartY = 0;
    let cardSwiped = false;

    imgContainer.addEventListener('touchstart', (e) => {
        if (e.touches.length === 1) {
            cardTouchStartX = e.touches[0].clientX;
            cardTouchStartY = e.touches[0].clientY;
            cardSwiped = false;
        }
    }, { passive: true });

    imgContainer.addEventListener('touchend', (e) => {
        if (!isMulti || e.changedTouches.length === 0) return;
        const dx = e.changedTouches[0].clientX - cardTouchStartX;
        const dy = e.changedTouches[0].clientY - cardTouchStartY;
        if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy) * 1.3) {
            cardSwiped = true;
            if (dx < 0 && activeIndex < slides.length - 1) {
                updateCardSlide(activeIndex + 1);
            } else if (dx > 0 && activeIndex > 0) {
                updateCardSlide(activeIndex - 1);
            }
        }
    }, { passive: true });

    imgContainer.addEventListener('click', () => {
        if (cardSwiped) {
            cardSwiped = false;
            return;
        }
        openFullModal(slides, activeIndex);
    });

    const reorderBtn = card.querySelector('.reorder-btn');
    if (reorderBtn) {
        reorderBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            openReorderModal(item, slides);
        });
    }

    const dlBtn = card.querySelector('.download-btn');
    if (dlBtn) {
        dlBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const target = slides[activeIndex] || slides[0];
            downloadImageAsJpg(target.src, target.name || 'image.jpg');
        });
    }

    card.querySelector('.delete-btn').addEventListener('click', (e) => {
        e.stopPropagation();
        promptDelete(item.id);
    });

    return card;
}

/* 並び替えモーダル制御 */
function openReorderModal(item, slides) {
    const modal = document.getElementById('reorder-modal');
    const titleEl = document.getElementById('reorder-post-title');
    if (!modal) return;

    reorderPostId = item.id;
    reorderSlides = slides.map(s => ({ src: s.src, name: s.name }));
    draggedReorderIndex = null;

    if (titleEl) {
        titleEl.textContent = item.name || '無題の投稿';
    }

    renderReorderList();
    modal.classList.remove('hidden');
    modal.classList.add('flex');
}

function closeReorderModal() {
    const modal = document.getElementById('reorder-modal');
    if (!modal) return;
    modal.classList.add('hidden');
    modal.classList.remove('flex');
    reorderPostId = null;
    reorderSlides = [];
    draggedReorderIndex = null;
}

function moveReorderSlide(fromIdx, toIdx) {
    if (fromIdx === toIdx) return;
    if (fromIdx < 0 || fromIdx >= reorderSlides.length) return;
    if (toIdx < 0 || toIdx >= reorderSlides.length) return;

    const [moved] = reorderSlides.splice(fromIdx, 1);
    reorderSlides.splice(toIdx, 0, moved);
    renderReorderList();
}

function renderReorderList() {
    const listEl = document.getElementById('reorder-list');
    if (!listEl) return;
    listEl.innerHTML = '';

    reorderSlides.forEach((slide, idx) => {
        const tile = document.createElement('div');
        tile.className = 'bg-darkBg/90 border border-gray-800 rounded-xl overflow-hidden flex flex-col transition select-none';
        tile.draggable = true;
        tile.dataset.index = idx;

        tile.innerHTML = `
            <div class="relative aspect-[3/4] bg-black overflow-hidden">
                <img src="${slide.src}" alt="${escapeHtml(slide.name)}" class="w-full h-full object-cover pointer-events-none" loading="lazy">
                <span class="absolute top-2 left-2 bg-indigo-600/90 text-white text-[11px] font-bold px-2 py-0.5 rounded-full shadow">
                    ${idx + 1}枚目
                </span>
            </div>
            <div class="p-2 flex items-center justify-between gap-1 bg-cardBg/80 border-t border-gray-800/70">
                <button type="button" class="move-left-btn flex-1 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 disabled:opacity-30 disabled:pointer-events-none text-gray-200 text-xs flex items-center justify-center transition" ${idx === 0 ? 'disabled' : ''} title="前へ移動">
                    <i class="fa-solid fa-chevron-left"></i>
                </button>
                <button type="button" class="move-right-btn flex-1 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 disabled:opacity-30 disabled:pointer-events-none text-gray-200 text-xs flex items-center justify-center transition" ${idx === reorderSlides.length - 1 ? 'disabled' : ''} title="次へ移動">
                    <i class="fa-solid fa-chevron-right"></i>
                </button>
            </div>
        `;

        const leftBtn = tile.querySelector('.move-left-btn');
        const rightBtn = tile.querySelector('.move-right-btn');
        if (leftBtn) {
            leftBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                moveReorderSlide(idx, idx - 1);
            });
        }
        if (rightBtn) {
            rightBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                moveReorderSlide(idx, idx + 1);
            });
        }

        // PCドラッグ＆ドロップ並び替え
        tile.addEventListener('dragstart', () => {
            draggedReorderIndex = idx;
            tile.classList.add('opacity-50', 'border-indigo-500');
        });
        tile.addEventListener('dragend', () => {
            tile.classList.remove('opacity-50', 'border-indigo-500');
            draggedReorderIndex = null;
        });
        tile.addEventListener('dragover', (e) => {
            e.preventDefault();
            tile.classList.add('border-indigo-400');
        });
        tile.addEventListener('dragleave', () => {
            tile.classList.remove('border-indigo-400');
        });
        tile.addEventListener('drop', (e) => {
            e.preventDefault();
            tile.classList.remove('border-indigo-400');
            if (draggedReorderIndex !== null && draggedReorderIndex !== idx) {
                moveReorderSlide(draggedReorderIndex, idx);
                draggedReorderIndex = null;
            }
        });

        listEl.appendChild(tile);
    });
}

async function saveReorderedSlides() {
    if (!reorderPostId || !reorderSlides.length) return;

    const saveBtn = document.getElementById('save-reorder-btn');
    if (saveBtn) {
        saveBtn.disabled = true;
        saveBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> 保存中...';
    }

    try {
        await update(ref(db, 'gallery_images/' + reorderPostId), {
            src: reorderSlides[0].src,
            images: reorderSlides
        });
        closeReorderModal();
        showToast('画像の並び順を保存しました');
    } catch (err) {
        console.error('並び順保存エラー:', err);
        showToast('並び順の保存に失敗しました', 'delete');
    } finally {
        if (saveBtn) {
            saveBtn.disabled = false;
            saveBtn.innerHTML = '<i class="fa-solid fa-check"></i> 順番を保存';
        }
    }
}

function initGalleryEvents() {
    if (window._galleryEventsBound) return;
    window._galleryEventsBound = true;

    const inputs = ['image-upload-input', 'empty-upload-input', 'footer-upload-input'];
    inputs.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.addEventListener('change', handleFileSelect);
        }
    });

    const closeReorderBtn = document.getElementById('close-reorder-modal');
    if (closeReorderBtn) {
        closeReorderBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            closeReorderModal();
        });
    }

    const cancelReorderBtn = document.getElementById('cancel-reorder-btn');
    if (cancelReorderBtn) {
        cancelReorderBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            closeReorderModal();
        });
    }

    const saveReorderBtn = document.getElementById('save-reorder-btn');
    if (saveReorderBtn) {
        saveReorderBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            saveReorderedSlides();
        });
    }

    const scrollTopBtn = document.getElementById('btn-scroll-top');
    if (scrollTopBtn) {
        scrollTopBtn.addEventListener('click', () => {
            const feed = document.getElementById('feed-container');
            if (feed) feed.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    const resetDemoBtn = document.getElementById('btn-reset-demo');
    if (resetDemoBtn) {
        resetDemoBtn.addEventListener('click', async () => {
            if (confirm('保存されているすべての画像を完全に削除しますか？')) {
                await remove(imagesRef);
                showToast('すべての画像を削除しました', 'delete');
            }
        });
    }

    const closeModalBtn = document.getElementById('close-modal-btn');
    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            closeModal();
        });
    }

    const modalPrevBtn = document.getElementById('modal-prev-btn');
    if (modalPrevBtn) {
        modalPrevBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (modalCurrentIndex > 0) {
                setModalSlide(modalCurrentIndex - 1);
            }
        });
    }

    const modalNextBtn = document.getElementById('modal-next-btn');
    if (modalNextBtn) {
        modalNextBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (modalCurrentIndex < modalSlides.length - 1) {
                setModalSlide(modalCurrentIndex + 1);
            }
        });
    }

    const fullModal = document.getElementById('fullmodal');
    if (fullModal) {
        fullModal.addEventListener('click', (e) => {
            if (currentScale === 1 && (e.target.id === 'fullmodal' || e.target.id === 'modal-viewport')) {
                closeModal();
            }
        });
    }

    const cancelDeleteBtn = document.getElementById('cancel-delete-btn');
    if (cancelDeleteBtn) {
        cancelDeleteBtn.addEventListener('click', closeDeleteModal);
    }

    const confirmDeleteBtn = document.getElementById('confirm-delete-btn');
    if (confirmDeleteBtn) {
        confirmDeleteBtn.addEventListener('click', async () => {
            if (itemToDeleteId) {
                await remove(ref(db, 'gallery_images/' + itemToDeleteId));
                closeDeleteModal();
                showToast('画像を削除しました', 'delete');
            }
        });
    }

    setupImageZoomAndPan();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initGalleryEvents);
} else {
    initGalleryEvents();
}

async function handleFileSelect(e) {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    const collectedSlides = [];
    let loadedImageCount = 0;
    let loadedPdfPagesCount = 0;

    for (const file of files) {
        if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
            showLoading('PDFを変換中...', `${file.name} を読み込んでいます`);
            try {
                const pageImages = await convertPdfToJpg(file);
                for (let i = 0; i < pageImages.length; i++) {
                    collectedSlides.push({
                        src: pageImages[i],
                        name: `${file.name} - Page ${i + 1}`
                    });
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
                collectedSlides.push({
                    src: dataUrl,
                    name: file.name
                });
                loadedImageCount++;
            } catch (err) {
                console.error('File reading error:', err);
            }
        }
    }

    if (collectedSlides.length > 0) {
        const now = new Date();
        const dateStr = `${now.getMonth() + 1}月${now.getDate()}日 ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
        const postTitle = collectedSlides.length > 1
            ? `${collectedSlides[0].name.replace(/ - Page \d+$/, '')} (${dateStr})`
            : collectedSlides[0].name;

        const newId = 'img_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4);
        const newItem = {
            id: newId,
            src: collectedSlides[0].src,
            images: collectedSlides,
            name: postTitle,
            timestamp: Date.now()
        };

        await set(ref(db, 'gallery_images/' + newId), newItem);

        let msg = '';
        if (collectedSlides.length > 1) {
            msg = `1つの投稿に ${collectedSlides.length}枚の画像をまとめました`;
        } else if (loadedPdfPagesCount > 0) {
            msg = `PDFからJPG画像を保存しました`;
        } else {
            msg = `画像を保存しました`;
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

function updateModalNavigationUI() {
    const counterEl = document.getElementById('modal-counter');
    const prevBtn = document.getElementById('modal-prev-btn');
    const nextBtn = document.getElementById('modal-next-btn');
    const dotsEl = document.getElementById('modal-dots');
    const isMulti = modalSlides.length > 1;

    if (counterEl) {
        counterEl.classList.toggle('hidden', !isMulti);
        counterEl.textContent = `${modalCurrentIndex + 1} / ${modalSlides.length}`;
    }
    if (prevBtn) {
        prevBtn.classList.toggle('hidden', !isMulti || modalCurrentIndex === 0);
        prevBtn.classList.toggle('flex', isMulti && modalCurrentIndex > 0);
    }
    if (nextBtn) {
        nextBtn.classList.toggle('hidden', !isMulti || modalCurrentIndex === modalSlides.length - 1);
        nextBtn.classList.toggle('flex', isMulti && modalCurrentIndex < modalSlides.length - 1);
    }
    if (dotsEl) {
        dotsEl.classList.toggle('hidden', !isMulti);
        dotsEl.classList.toggle('flex', isMulti);
        dotsEl.innerHTML = isMulti ? modalSlides.map((_, idx) => `
            <span class="h-1.5 rounded-full transition-all ${idx === modalCurrentIndex ? 'w-4 bg-white' : 'w-1.5 bg-white/40'}"></span>
        `).join('') : '';
    }
}

function setModalSlide(index) {
    if (index < 0 || index >= modalSlides.length) return;
    modalCurrentIndex = index;
    const slide = modalSlides[modalCurrentIndex];
    const img = document.getElementById('modal-img');
    const dlBtn = document.getElementById('modal-download-btn');

    if (img) {
        img.src = slide.src;
        img.alt = slide.name || 'Full view';
    }
    if (dlBtn) {
        dlBtn.onclick = (e) => {
            e.stopPropagation();
            downloadImageAsJpg(slide.src, slide.name || 'gallery_image.jpg');
        };
    }

    if (typeof window.resetZoom === 'function') {
        window.resetZoom();
    }
    updateModalNavigationUI();
}

function openFullModal(slidesOrSrc, startIndexOrFilename = 0) {
    const modal = document.getElementById('fullmodal');
    if (!modal) return;

    if (Array.isArray(slidesOrSrc)) {
        modalSlides = slidesOrSrc;
        modalCurrentIndex = typeof startIndexOrFilename === 'number' ? startIndexOrFilename : 0;
    } else {
        modalSlides = [{ src: slidesOrSrc, name: typeof startIndexOrFilename === 'string' ? startIndexOrFilename : 'gallery_image.jpg' }];
        modalCurrentIndex = 0;
    }

    if (!modalSlides.length || !modalSlides[0].src) return;
    setModalSlide(modalCurrentIndex);

    modal.classList.remove('hidden');
    modal.classList.add('flex');
    requestAnimationFrame(() => {
        modal.classList.remove('opacity-0');
        modal.classList.add('opacity-100');
    });
}

function closeModal() {
    const modal = document.getElementById('fullmodal');
    const img = document.getElementById('modal-img');
    if (!modal) return;

    modal.classList.remove('opacity-100');
    modal.classList.add('opacity-0');
    setTimeout(() => {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
        if (img) img.src = '';
        modalSlides = [];
        modalCurrentIndex = 0;
        if (typeof window.resetZoom === 'function') {
            window.resetZoom();
        }
    }, 250);
}

/* ピンチイン・ピンチアウト & ダブルタップ & ホイール拡大/ドラッグ移動 & 複数画像左右スワイプ制御 */
function setupImageZoomAndPan() {
    const modalImg = document.getElementById('modal-img');
    const viewport = document.getElementById('modal-viewport');
    if (!modalImg || !viewport) return;

    let swipeStartX = 0;
    let swipeStartY = 0;
    let isSwipeTracking = false;

    function updateTransform(withTransition = false) {
        if (currentScale <= 1) {
            translateX = 0;
            translateY = 0;
        }
        modalImg.style.transition = withTransition ? 'transform 0.2s ease-out' : 'transform 0.04s linear';
        modalImg.style.transform = `translate3d(${translateX}px, ${translateY}px, 0) scale(${currentScale})`;
    }

    function resetZoom() {
        currentScale = 1;
        translateX = 0;
        translateY = 0;
        isDragging = false;
        isSwipeTracking = false;
        updateTransform(false);
    }

    window.resetZoom = resetZoom;

    function getTouchDistance(touches) {
        const dx = touches[0].clientX - touches[1].clientX;
        const dy = touches[0].clientY - touches[1].clientY;
        return Math.hypot(dx, dy);
    }

    // PCマウスホイールでのズーム操作
    viewport.addEventListener('wheel', (e) => {
        e.preventDefault();
        const delta = e.deltaY < 0 ? 0.25 : -0.25;
        currentScale = Math.min(Math.max(currentScale + delta, minScale), maxScale);
        if (currentScale === 1) {
            translateX = 0;
            translateY = 0;
        }
        updateTransform(true);
    }, { passive: false });

    // タッチ開始（ピンチ開始・ドラッグ開始・左右スワイプ開始・ダブルタップ判定）
    viewport.addEventListener('touchstart', (e) => {
        if (e.touches.length === 2) {
            e.preventDefault();
            isDragging = false;
            isSwipeTracking = false;
            initialPinchDistance = getTouchDistance(e.touches);
            initialScale = currentScale;
        } else if (e.touches.length === 1) {
            const now = Date.now();
            if (now - lastTapTime < 280) {
                e.preventDefault();
                isSwipeTracking = false;
                if (currentScale > 1.05) {
                    currentScale = 1;
                    translateX = 0;
                    translateY = 0;
                } else {
                    currentScale = 2.5;
                    translateX = 0;
                    translateY = 0;
                }
                updateTransform(true);
                lastTapTime = 0;
                return;
            }
            lastTapTime = now;

            if (currentScale > 1) {
                isDragging = true;
                isSwipeTracking = false;
                startX = e.touches[0].clientX - translateX;
                startY = e.touches[0].clientY - translateY;
            } else {
                isSwipeTracking = true;
                swipeStartX = e.touches[0].clientX;
                swipeStartY = e.touches[0].clientY;
            }
        }
    }, { passive: false });

    // タッチ移動（ピンチイン・ピンチアウト & 拡大中のパン移動 & 等倍時の横スワイプ追従）
    viewport.addEventListener('touchmove', (e) => {
        if (e.touches.length === 2 && initialPinchDistance > 0) {
            e.preventDefault();
            const currentDist = getTouchDistance(e.touches);
            const nextScale = Math.min(Math.max(initialScale * (currentDist / initialPinchDistance), minScale), maxScale);
            currentScale = nextScale;
            if (currentScale <= 1.02) {
                currentScale = 1;
                translateX = 0;
                translateY = 0;
            }
            updateTransform(false);
        } else if (e.touches.length === 1 && isDragging && currentScale > 1) {
            e.preventDefault();
            translateX = e.touches[0].clientX - startX;
            translateY = e.touches[0].clientY - startY;
            updateTransform(false);
        } else if (e.touches.length === 1 && isSwipeTracking && currentScale === 1 && modalSlides.length > 1) {
            const dx = e.touches[0].clientX - swipeStartX;
            const dy = e.touches[0].clientY - swipeStartY;
            if (Math.abs(dx) > Math.abs(dy)) {
                e.preventDefault();
                const clampedDx = Math.max(-120, Math.min(120, dx * 0.45));
                modalImg.style.transition = 'none';
                modalImg.style.transform = `translate3d(${clampedDx}px, 0, 0) scale(1)`;
            }
        }
    }, { passive: false });

    // タッチ終了（スワイプによる前後画像切り替え判定）
    viewport.addEventListener('touchend', (e) => {
        if (e.touches.length < 2) {
            initialPinchDistance = 0;
        }
        if (e.touches.length === 0) {
            if (isSwipeTracking && currentScale === 1 && e.changedTouches.length > 0 && modalSlides.length > 1) {
                const dx = e.changedTouches[0].clientX - swipeStartX;
                const dy = e.changedTouches[0].clientY - swipeStartY;
                if (Math.abs(dx) > 55 && Math.abs(dx) > Math.abs(dy) * 1.2) {
                    if (dx < 0 && modalCurrentIndex < modalSlides.length - 1) {
                        setModalSlide(modalCurrentIndex + 1);
                        isDragging = false;
                        isSwipeTracking = false;
                        return;
                    } else if (dx > 0 && modalCurrentIndex > 0) {
                        setModalSlide(modalCurrentIndex - 1);
                        isDragging = false;
                        isSwipeTracking = false;
                        return;
                    }
                }
                // 切り替わらなかった場合は元の位置に戻す
                modalImg.style.transition = 'transform 0.2s ease-out';
                modalImg.style.transform = 'translate3d(0, 0, 0) scale(1)';
            }

            isDragging = false;
            isSwipeTracking = false;
            if (currentScale <= 1) {
                currentScale = 1;
                translateX = 0;
                translateY = 0;
                updateTransform(true);
            }
        }
    });

    // マウスドラッグ操作（PCで拡大時のパン移動 / 等倍時の横スワイプ）
    let mouseDownX = 0;
    let mouseDownY = 0;
    let isMouseSwiping = false;

    viewport.addEventListener('mousedown', (e) => {
        if (e.button !== 0) return;
        if (currentScale > 1) {
            e.preventDefault();
            isDragging = true;
            startX = e.clientX - translateX;
            startY = e.clientY - translateY;
            viewport.style.cursor = 'grabbing';
        } else if (modalSlides.length > 1) {
            isMouseSwiping = true;
            mouseDownX = e.clientX;
            mouseDownY = e.clientY;
        }
    });

    window.addEventListener('mousemove', (e) => {
        if (isDragging && currentScale > 1) {
            translateX = e.clientX - startX;
            translateY = e.clientY - startY;
            updateTransform(false);
        }
    });

    window.addEventListener('mouseup', (e) => {
        if (isMouseSwiping && currentScale === 1 && modalSlides.length > 1) {
            const dx = e.clientX - mouseDownX;
            const dy = e.clientY - mouseDownY;
            if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.2) {
                if (dx < 0 && modalCurrentIndex < modalSlides.length - 1) {
                    setModalSlide(modalCurrentIndex + 1);
                } else if (dx > 0 && modalCurrentIndex > 0) {
                    setModalSlide(modalCurrentIndex - 1);
                }
            }
        }
        isMouseSwiping = false;
        isDragging = false;
        viewport.style.cursor = 'default';
    });
}

function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;
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
