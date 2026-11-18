import { db } from "./config.js";
import { ref, set } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

let mediaRecorder = null;
let audioChunks = [];
let audioStream = null;
let audioBlob = null;
let recordingTimer = null;
let recordingSeconds = 0;

// DOM要素の取得
const btnOpenRecordModal = document.getElementById('btn-open-record-modal');
const recordModal = document.getElementById('record-modal');
const btnCloseRecordModal = document.getElementById('close-record-modal');
const startButton = document.getElementById('startButton');
const stopButton = document.getElementById('stopButton');
const downloadButton = document.getElementById('downloadButton');
const postAudioButton = document.getElementById('postAudioButton');
const recordingStatus = document.getElementById('recordingStatus');
const recordingTime = document.getElementById('recordingTime');
const audioPlayback = document.getElementById('audioPlayback');
const audioPreviewWrapper = document.getElementById('audioPreviewWrapper');
const feedContainer = document.getElementById('feed-container');

// モーダル初期化リセット
function resetRecordingUI() {
    clearInterval(recordingTimer);
    if (mediaRecorder && mediaRecorder.state === 'recording') {
        mediaRecorder.stop();
    }
    if (audioStream) {
        audioStream.getTracks().forEach(track => track.stop());
        audioStream = null;
    }
    audioChunks = [];
    audioBlob = null;
    recordingSeconds = 0;

    recordingStatus.textContent = '待機中';
    recordingStatus.className = 'text-xs font-semibold text-gray-400 tracking-wider uppercase mb-1';
    recordingTime.textContent = '00:00';
    startButton.disabled = false;
    stopButton.disabled = true;
    downloadButton.disabled = true;
    postAudioButton.disabled = true;
    audioPreviewWrapper.classList.add('hidden');
    audioPreviewWrapper.classList.remove('flex');
    audioPlayback.src = '';
}

// 録音開始
async function startRecording() {
    try {
        // マイクへのアクセス
        audioStream = await navigator.mediaDevices.getUserMedia({
            audio: true
        });

        audioChunks = [];
        audioBlob = null;
        recordingSeconds = 0;
        recordingTime.textContent = '00:00';

        // 録音形式を選択
        let mimeType = '';
        if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
            mimeType = 'audio/webm;codecs=opus';
        } else if (MediaRecorder.isTypeSupported('audio/webm')) {
            mimeType = 'audio/webm';
        }

        mediaRecorder = mimeType
            ? new MediaRecorder(audioStream, { mimeType })
            : new MediaRecorder(audioStream);

        // 音声データを受け取る
        mediaRecorder.ondataavailable = (event) => {
            if (event.data.size > 0) {
                audioChunks.push(event.data);
            }
        };

        // 録音終了時
        mediaRecorder.onstop = () => {
            audioBlob = new Blob(audioChunks, {
                type: mediaRecorder.mimeType || 'audio/webm'
            });

            // 再生用URLを作成
            const audioURL = URL.createObjectURL(audioBlob);
            audioPlayback.src = audioURL;

            // プレビュー・保存・投稿ボタンを有効化
            audioPreviewWrapper.classList.remove('hidden');
            audioPreviewWrapper.classList.add('flex');
            downloadButton.disabled = false;
            postAudioButton.disabled = false;

            // マイクを解放
            if (audioStream) {
                audioStream.getTracks().forEach(track => track.stop());
                audioStream = null;
            }
        };

        // 録音開始（音は鳴らさない）
        mediaRecorder.start();

        startButton.disabled = true;
        stopButton.disabled = false;
        downloadButton.disabled = true;
        postAudioButton.disabled = true;
        audioPreviewWrapper.classList.add('hidden');
        audioPreviewWrapper.classList.remove('flex');

        recordingStatus.textContent = '● 録音中';
        recordingStatus.className = 'text-xs font-semibold text-rose-400 tracking-wider uppercase mb-1 animate-pulse';

        // 経過時間表示
        recordingTimer = setInterval(() => {
            recordingSeconds++;
            const minutes = Math.floor(recordingSeconds / 60);
            const seconds = recordingSeconds % 60;
            recordingTime.textContent =
                `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
        }, 1000);

    } catch (error) {
        console.error('マイクエラー:', error);
        showNotice('マイクを使用できませんでした。マイクの使用を許可してください。');
    }
}

// 録音停止
function stopRecording() {
    if (mediaRecorder && mediaRecorder.state === 'recording') {
        mediaRecorder.stop();
    }
    clearInterval(recordingTimer);

    startButton.disabled = false;
    stopButton.disabled = true;
    recordingStatus.textContent = '録音終了';
    recordingStatus.className = 'text-xs font-semibold text-indigo-400 tracking-wider uppercase mb-1';
}

// 音声ファイル保存
function downloadRecording() {
    if (!audioBlob) return;

    const url = URL.createObjectURL(audioBlob);
    const link = document.createElement('a');

    link.href = url;
    link.download = `recording_${Date.now()}.webm`;
    link.click();

    URL.revokeObjectURL(url);
}

// BlobをBase64 DataURLに変換
function blobToDataURL(blob) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
}

// 録音データをギャラリーへ投稿
async function postRecording() {
    if (!audioBlob) return;

    postAudioButton.disabled = true;
    postAudioButton.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> 投稿中...';

    try {
        const dataUrl = await blobToDataURL(audioBlob);
        const now = new Date();
        const dateStr = `${now.getMonth() + 1}月${now.getDate()}日 ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
        const durationText = recordingTime.textContent;
        const newId = 'audio_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4);

        const newItem = {
            id: newId,
            src: dataUrl,
            type: 'audio',
            duration: durationText,
            name: `ボイスメモ (${durationText}) - ${dateStr}`,
            timestamp: Date.now()
        };

        await set(ref(db, 'gallery_images/' + newId), newItem);

        // モーダルを閉じてリセット
        resetRecordingUI();
        recordModal.classList.add('hidden');
        recordModal.classList.remove('flex');
    } catch (err) {
        console.error('音声投稿エラー:', err);
        showNotice('音声の投稿に失敗しました。');
    } finally {
        postAudioButton.innerHTML = '<i class="fa-solid fa-paper-plane"></i> 投稿する';
    }
}

// 汎用ポップアップ通知（既存モーダル利用）
function showNotice(msg) {
    const alertModal = document.getElementById('alert-modal');
    const alertMsg = document.getElementById('alert-modal-message');
    const alertOk = document.getElementById('alert-modal-ok');
    if (alertModal && alertMsg && alertOk) {
        alertMsg.textContent = msg;
        alertModal.classList.add('active');
        alertOk.onclick = () => alertModal.classList.remove('active');
    }
}

// タイムラインに音声データ（data:audio/...）が描画された際にプレイヤーUIへ自動変換する監視処理
function enhanceAudioCards() {
    if (!feedContainer) return;
    const images = feedContainer.querySelectorAll('img');
    images.forEach((img) => {
        const src = img.getAttribute('src') || '';
        if (src.startsWith('data:audio/')) {
            const parent = img.parentElement;
            if (parent && !parent.querySelector('audio')) {
                const audioWrapper = document.createElement('div');
                audioWrapper.className = 'w-full p-5 bg-gradient-to-br from-indigo-950/60 via-cardBg to-purple-950/40 flex flex-col items-center justify-center gap-3 rounded-xl border border-indigo-500/20';
                audioWrapper.innerHTML = `
                    <div class="w-12 h-12 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-400 flex items-center justify-center shadow-inner">
                        <i class="fa-solid fa-waveform-lines fa-microphone text-xl"></i>
                    </div>
                    <audio controls src="${src}" class="w-full h-10 rounded-lg"></audio>
                `;
                img.style.display = 'none';
                parent.appendChild(audioWrapper);
            }
        }
    });
}

// フィードの変更を監視して音声カードをプレイヤー化
if (feedContainer) {
    const observer = new MutationObserver(() => {
        enhanceAudioCards();
    });
    observer.observe(feedContainer, { childList: true, subtree: true });
}

// イベントリスナー登録
if (btnOpenRecordModal) {
    btnOpenRecordModal.addEventListener('click', () => {
        resetRecordingUI();
        recordModal.classList.remove('hidden');
        recordModal.classList.add('flex');
    });
}

if (btnCloseRecordModal) {
    btnCloseRecordModal.addEventListener('click', () => {
        resetRecordingUI();
        recordModal.classList.add('hidden');
        recordModal.classList.remove('flex');
    });
}

if (startButton) startButton.addEventListener('click', startRecording);
if (stopButton) stopButton.addEventListener('click', stopRecording);
if (downloadButton) downloadButton.addEventListener('click', downloadRecording);
if (postAudioButton) postAudioButton.addEventListener('click', postRecording);

// 画面を閉じる・離れる際の録音停止
window.addEventListener('pagehide', () => {
    clearInterval(recordingTimer);
    if (mediaRecorder && mediaRecorder.state === 'recording') {
        mediaRecorder.stop();
    }
    if (audioStream) {
        audioStream.getTracks().forEach(track => track.stop());
    }
});