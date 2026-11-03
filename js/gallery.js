/**
 * Gallery機能ロジック (gallery.js) - 修正版
 */
import { ref, push, set, remove, onValue } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";
import { db } from "./config.js";

const GALLERY_PATH = 'gallery_images';
let itemToDeleteId = null;

export function setupGalleryModule() {
    const galleryRef = ref(db, GALLERY_PATH);

    // FirebaseからリアルタイムにGalleryデータを取得・同期
    onValue(galleryRef, (snapshot) => {
        const data = snapshot.val();
        let images = [];
        if (data) {
            images = Object.keys(data).map(key => ({
                id: key,
                ...data[key]
            }));
            // タイムスタンプの降順（新しい順）にソート
            images.sort((a, b) => b.timestamp - a.timestamp);
        }
        renderFeed(images);
    });

    setupGalleryEventListeners();
}

function renderFeed(items) {
    const container = document.getElementById('gallery-feed-container');
    const emptyState = document.getElementById('gallery-empty-state');
    if (!container) return;

    container.innerHTML = '';

    if (!items || items.length === 0) {
        container.classList.add('hidden');
        if (emptyState) {
            emptyState.classList.remove('hidden');
            emptyState.classList.add('flex');
        }
        return;
    }

    container.classList.remove('hidden');
    if (emptyState) {
        emptyState.classList.add('hidden');
        emptyState.classList.remove('flex');
    }

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
    card.className = 'bg-[#161b26] border border-gray-800/80 rounded-2xl overflow-hidden shadow-xl flex flex-col mb-4 transition-all hover:border-gray-700/80';
    card.dataset.id = item.id;

    card.innerHTML = `
        <div class="px-3.5 py-3 flex items-center justify-between border-b border-gray-800/50 bg-[#161b26]">
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
        downloadImage(item.src, item.name || 'image.jpg');
    });
    card.querySelector('.delete-btn').addEventListener('click', (e) => {
        e.stopPropagation();
        promptDelete(item.id);
    });

    return card;
}

function setupGalleryEventListeners() {
    const inputs = ['gallery-upload-input', 'gallery-empty-upload-input', 'gallery-footer-upload-input'];
    inputs.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.addEventListener('change', handleFileSelect);
    });

    const scrollTopBtn = document.getElementById('gallery-btn-scroll-top');
    if (scrollTopBtn) {
        scrollTopBtn.addEventListener('click', () => {
            const container = document.getElementById('gallery-feed-container');
            if (container) container.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    const closeFullModalBtn = document.getElementById('gallery-close-modal-btn');
    if (closeFullModalBtn) {
        closeFullModalBtn.addEventListener('click', closeFullModal);
    }

    const fullModal = document.getElementById('gallery-fullmodal');
    if (fullModal) {
        fullModal.addEventListener('click', (e) => {
            if (e.target.id === 'gallery-fullmodal') closeFullModal();
        });
    }

    const cancelDeleteBtn = document.getElementById('gallery-cancel-delete-btn');
    if (cancelDeleteBtn) {
        cancelDeleteBtn.addEventListener('click', closeDeleteModal);
    }

    const confirmDeleteBtn = document.getElementById('gallery-confirm-delete-btn');
    if (confirmDeleteBtn) {
        confirmDeleteBtn.addEventListener('click', async () => {
            if (itemToDeleteId) {
                await remove(ref(db, `${GALLERY_PATH}/${itemToDeleteId}`));
                closeDeleteModal();
                showGalleryToast('画像を削除しました', 'delete');
            }
        });
    }

    const openBtn = document.getElementById('open-gallery-modal-btn');
    const closeBtn = document.getElementById('close-gallery-modal-btn');
    const modal = document.getElementById('gallery-modal-overlay');

    if (openBtn && modal) {
        openBtn.addEventListener('click', () => modal.classList.add('active'));
    }
    // HTML側のギャラリー閉じるボタン（もしあれば）の紐付け
    const galleryCloseBtn = document.querySelector('#gallery-modal-overlay .modal-close-btn');
    if (galleryCloseBtn && modal) {
        galleryCloseBtn.addEventListener('click', () => modal.classList.remove('active'));
    }
}

async function handleFileSelect(e) {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    let loadedImageCount = 0;
    let loadedPdfPagesCount = 0;
    const galleryRef = ref(db, GALLERY_PATH);

    for (const file of files) {
        if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
            showGalleryLoading('PDFを変換中...', `${file.name} を読み込んでいます`);
            try {
                const pageImages = await convertPdfToJpg(file);
                for (let i = 0; i < pageImages.length; i++) {
                    const newItem = {
                        src: pageImages[i],
                        name: `${file.name} - Page ${i + 1}`,
                        timestamp: Date.now() + i,
                        caption: '🖼️ PDFから変換されたページ'
                    };
                    const newRef = push(galleryRef);
                    await set(newRef, newItem);
                    loadedPdfPagesCount++;
                }
            } catch (err) {
                console.error('PDF Conversion Error:', err);
                showGalleryToast('PDFの変換に失敗しました', 'delete');
            } finally {
                hideGalleryLoading();
            }
        } else if (file.type.startsWith('image/')) {
            try {
                const dataUrl = await readFileAsDataURL(file);
                const newItem = {
                    src: dataUrl,
                    name: file.name,
                    timestamp: Date.now(),
                    caption: '🖼️ アップロードされた画像'
                };
                const newRef = push(galleryRef);
                await set(newRef, newItem);
                loadedImageCount++;
            } catch (err) {
                console.error('File reading error:', err);
            }
        }
    }

    if (loadedImageCount > 0 || loadedPdfPagesCount > 0) {
        showGalleryToast('画像を追加しました');
    }
    e.target.value = '';
}

async function convertPdfToJpg(file) {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    const images = [];

    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const scale = 2.0;
        const viewport = page.getViewport({ scale });

        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        await page.render({ canvasContext: context, viewport }).promise;
        images.push(canvas.toDataURL('image/jpeg', 0.9));
    }
    return images;
}

function showGalleryLoading(title, desc) {
    const overlay = document.getElementById('gallery-loading-overlay');
    if (!overlay) return;
    document.getElementById('gallery-loading-title').textContent = title;
    document.getElementById('gallery-loading-desc').textContent = desc;
    overlay.classList.remove('hidden');
    overlay.classList.add('flex');
}

function hideGalleryLoading() {
    const overlay = document.getElementById('gallery-loading-overlay');
    if (!overlay) return;
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

function downloadImage(url, filename) {
    const a = document.createElement('a');
    a.href = url;
    a.download = filename || 'downloaded-portrait.jpg';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    showGalleryToast('画像をダウンロードしました');
}

function promptDelete(id) {
    itemToDeleteId = id;
    const modal = document.getElementById('gallery-delete-modal');
    if (modal) {
        modal.classList.remove('hidden');
        modal.classList.add('flex');
    }
}

function closeDeleteModal() {
    itemToDeleteId = null;
    const modal = document.getElementById('gallery-delete-modal');
    if (modal) {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
    }
}

function openFullModal(src, filename) {
    const modal = document.getElementById('gallery-fullmodal');
    const img = document.getElementById('gallery-modal-img');
    const dlBtn = document.getElementById('gallery-modal-download-btn');

    if (!modal || !img) return;

    img.src = src;
    if (dlBtn) dlBtn.onclick = () => downloadImage(src, filename);

    modal.classList.remove('hidden');
    modal.classList.add('flex');
    setTimeout(() => modal.classList.remove('opacity-0'), 10);
}

function closeFullModal() {
    const modal = document.getElementById('gallery-fullmodal');
    if (!modal) return;
    modal.classList.add('opacity-0');
    setTimeout(() => {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
        const img = document.getElementById('gallery-modal-img');
        if (img) img.src = '';
    }, 300);
}

function showGalleryToast(message, type = 'info') {
    const container = document.getElementById('gallery-toast-container');
    if (!container) return;
    const toast = document.createElement('div');
    const icon = type === 'delete' ? 'fa-trash-can' : 'fa-circle-check';
    const iconColor = type === 'delete' ? 'text-red-400' : 'text-emerald-400';

    toast.className = 'bg-gray-800/90 border border-gray-700/80 text-gray-100 text-xs py-2.5 px-4 rounded-full shadow-2xl backdrop-blur-md flex items-center gap-2 transition-all duration-300 opacity-0 translate-y-[-10px]';
    toast.innerHTML = `<i class="fa-solid ${icon} ${iconColor}"></i> <span>${escapeHtml(message)}</span>`;

    container.appendChild(toast);
    setTimeout(() => toast.classList.remove('opacity-0', 'translate-y-[-10px]'), 10);
    setTimeout(() => {
        toast.classList.add('opacity-0', 'translate-y-[-10px]');
        setTimeout(() => toast.remove(), 300);
    }, 2500);
}

function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}
