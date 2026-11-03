/**
 * Gallery機能ロジック (Firebase / Firestore 保存版)
 */
import { firestore, appId } from "./config.js";
import { collection, addDoc, getDocs, deleteDoc, doc, query, orderBy } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

let itemToDeleteId = null;

// Firestoreのコレクション参照（既存のMEMOアプリと同じデータ構造パスを使用）
const galleryCollectionRef = collection(firestore, 'artifacts', appId, 'public', 'data', 'gallery_images');

// Firebase (Firestore) から全画像を取得
async function getImagesFromFirestore() {
    try {
        const q = query(galleryCollectionRef, orderBy('timestamp', 'desc'));
        const querySnapshot = await getDocs(q);
        const results = [];
        querySnapshot.forEach((docSnap) => {
            results.push({ id: docSnap.id, ...docSnap.data() });
        });
        return results;
    } catch (error) {
        console.error('Firestore fetch error:', error);
        return [];
    }
}

// Firebase (Firestore) に画像を保存
async function saveImageToFirestore(imageData) {
    try {
        const docRef = await addDoc(galleryCollectionRef, imageData);
        return { id: docRef.id, ...imageData };
    } catch (error) {
        console.error('Firestore save error:', error);
        throw error;
    }
}

// Firebase (Firestore) から画像を削除
async function deleteImageFromFirestore(id) {
    try {
        const docRef = doc(firestore, 'artifacts', appId, 'public', 'data', 'gallery_images', id);
        await deleteDoc(docRef);
    } catch (error) {
        console.error('Firestore delete error:', error);
        throw error;
    }
}

// 初期サンプル画像データ
const SAMPLE_IMAGES = [
    {
        src: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=900&auto=format&fit=crop',
        name: 'Portrait Neon City',
        timestamp: Date.now() - 3600000 * 2,
        caption: '🖼️ 夜の街とネオンライト 🌆✨'
    },
    {
        src: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=900&auto=format&fit=crop',
        name: 'Natural Light Portrait',
        timestamp: Date.now() - 3600000 * 5,
        caption: '🖼️ 木漏れ日のポートレート 🌿'
    }
];

export async function setupGalleryModule() {
    let images = await getImagesFromFirestore();

    // データが全く無ければサンプルをプリロード
    if (images.length === 0) {
        for (const item of SAMPLE_IMAGES) {
            await saveImageToFirestore(item);
        }
        images = await getImagesFromFirestore();
    }

    renderFeed(images);
    setupGalleryEventListeners();
}

// フィード描画
function renderFeed(items) {
    const container = document.getElementById('gallery-feed-container');
    const emptyState = document.getElementById('gallery-empty-state');
    if (!container) return;

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

// 単一カードエレメントの生成 (縦長・アスペクト比固定 9:16)
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

// イベントハンドラー初期化
function setupGalleryEventListeners() {
    const inputs = ['gallery-upload-input', 'gallery-empty-upload-input', 'gallery-footer-upload-input'];
    inputs.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.addEventListener('change', handleFileSelect);
    });

    document.getElementById('gallery-btn-scroll-top').addEventListener('click', () => {
        document.getElementById('gallery-feed-container').scrollTo({ top: 0, behavior: 'smooth' });
    });

    document.getElementById('gallery-btn-reset-demo').addEventListener('click', async () => {
        if (confirm('すべてのギャラリー画像をリセットして初期状態に戻しますか？')) {
            const currentItems = await getImagesFromFirestore();
            for (const item of currentItems) {
                await deleteImageFromFirestore(item.id);
            }
            for (const item of SAMPLE_IMAGES) {
                await saveImageToFirestore(item);
            }
            renderFeed(await getImagesFromFirestore());
            showGalleryToast('初期データにリセットしました');
        }
    });

    document.getElementById('gallery-close-modal-btn').addEventListener('click', closeFullModal);
    document.getElementById('gallery-fullmodal').addEventListener('click', (e) => {
        if (e.target.id === 'gallery-fullmodal') closeFullModal();
    });

    document.getElementById('gallery-cancel-delete-btn').addEventListener('click', closeDeleteModal);
    document.getElementById('gallery-confirm-delete-btn').addEventListener('click', async () => {
        if (itemToDeleteId) {
            await deleteImageFromFirestore(itemToDeleteId);
            closeDeleteModal();
            renderFeed(await getImagesFromFirestore());
            showGalleryToast('画像を削除しました', 'delete');
        }
    });

    const openBtn = document.getElementById('open-gallery-modal-btn');
    const closeBtn = document.getElementById('close-gallery-modal-btn');
    const modal = document.getElementById('gallery-modal-overlay');

    if (openBtn && modal) {
        openBtn.addEventListener('click', () => modal.classList.add('active'));
    }
    if (closeBtn && modal) {
        closeBtn.addEventListener('click', () => modal.classList.remove('active'));
    }
}

// 画像・PDF選択処理
async function handleFileSelect(e) {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    let loadedImageCount = 0;
    let loadedPdfPagesCount = 0;

    for (const file of files) {
        if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
            showGalleryLoading('PDFを変換中...', `${file.name} を読み込んでいます`);
            try {
                const pageImages = await convertPdfToJpg(file);
                for (let i = 0; i < pageImages.length; i++) {
                    const newItem = {
                        src: pageImages[i],
                        name: `${file.name} - Page ${i + 1}`,
                        timestamp: Date.now() - (pageImages.length - i),
                        caption: '🖼️ PDFから変換されたページ'
                    };
                    await saveImageToFirestore(newItem);
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
                await saveImageToFirestore(newItem);
                loadedImageCount++;
            } catch (err) {
                console.error('File reading error:', err);
            }
        }
    }

    if (loadedImageCount > 0 || loadedPdfPagesCount > 0) {
        renderFeed(await getImagesFromFirestore());
        showGalleryToast('Firebaseに画像を保存しました');
    }
    e.target.value = '';
}

// PDF変換
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
    document.getElementById('gallery-loading-title').textContent = title;
    document.getElementById('gallery-loading-desc').textContent = desc;
    overlay.classList.remove('hidden');
    overlay.classList.add('flex');
}

function hideGalleryLoading() {
    const overlay = document.getElementById('gallery-loading-overlay');
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
    modal.classList.remove('hidden');
    modal.classList.add('flex');
}

function closeDeleteModal() {
    itemToDeleteId = null;
    const modal = document.getElementById('gallery-delete-modal');
    modal.classList.add('hidden');
    modal.classList.remove('flex');
}

function openFullModal(src, filename) {
    const modal = document.getElementById('gallery-fullmodal');
    const img = document.getElementById('gallery-modal-img');
    const dlBtn = document.getElementById('gallery-modal-download-btn');

    img.src = src;
    dlBtn.onclick = () => downloadImage(src, filename);

    modal.classList.remove('hidden');
    modal.classList.add('flex');
    setTimeout(() => modal.classList.remove('opacity-0'), 10);
}

function closeFullModal() {
    const modal = document.getElementById('gallery-fullmodal');
    modal.classList.add('opacity-0');
    setTimeout(() => {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
        document.getElementById('gallery-modal-img').src = '';
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
