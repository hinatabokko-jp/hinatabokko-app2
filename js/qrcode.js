const state = {
    type: 'url',
    data: 'https://example.com',
    dotsColor: '#000000',
    bgColor: '#ffffff',
    isBgTransparent: false,
    useGradient: false,
    gradientEndColor: '#a855f7',
    gradientType: 'linear',
    dotsStyle: 'square',
    cornerStyle: 'square',
    errorLevel: 'M',
    logoUrl: '',
    logoSize: 0.4,
    logoMargin: 5
};

let qrCodeStyling = null;

function encodeUtf8(str) {
    if (!str) return '';
    try { return unescape(encodeURIComponent(str)); } catch (e) { return str; }
}

function getQRCodeOptions(size = 240) {
    return {
        width: size,
        height: size,
        type: 'canvas',
        data: encodeUtf8(state.data),
        image: state.logoUrl,
        margin: 4,
        dotsOptions: {
            color: state.dotsColor,
            type: state.dotsStyle,
            gradient: state.useGradient ? {
                type: state.gradientType,
                colorStops: [
                    { offset: 0, color: state.dotsColor },
                    { offset: 1, color: state.gradientEndColor }
                ]
            } : null
        },
        backgroundOptions: {
            color: state.isBgTransparent ? 'transparent' : state.bgColor
        },
        imageOptions: {
            crossOrigin: 'anonymous',
            imageSize: state.logoSize,
            margin: state.logoMargin
        },
        cornersSquareOptions: {
            type: state.cornerStyle,
            color: state.dotsColor
        },
        cornersDotOptions: {
            color: state.dotsColor
        },
        qrOptions: {
            errorCorrectionLevel: state.errorLevel
        }
    };
}

function initQRCode() {
    if (typeof QRCodeStyling === 'undefined') {
        setTimeout(initQRCode, 100);
        return;
    }

    qrCodeStyling = new QRCodeStyling(getQRCodeOptions(240));

    const container = document.getElementById('qrcode-container');
    container.innerHTML = '';
    qrCodeStyling.append(container);
    syncQuietZoneAppearance();
}

function syncQuietZoneAppearance() {
    const quietZone = document.getElementById('qrQuietZone');
    if (!quietZone) return;

    if (state.isBgTransparent) {
        quietZone.classList.add('is-transparent');
        quietZone.style.backgroundColor = '';
    } else {
        quietZone.classList.remove('is-transparent');
        // QRコード背景色と周囲クワイエットゾーンの色を連動させ、スキャン境界の誤認識を防ぐ
        quietZone.style.backgroundColor = state.bgColor;
    }
}

function updateQRCode() {
    if (!qrCodeStyling) return;
    buildDataPayload();
    syncQuietZoneAppearance();

    qrCodeStyling.update({
        data: encodeUtf8(state.data),
        image: state.logoUrl,
        dotsOptions: {
            color: state.dotsColor,
            type: state.dotsStyle,
            gradient: state.useGradient ? {
                type: state.gradientType,
                colorStops: [
                    { offset: 0, color: state.dotsColor },
                    { offset: 1, color: state.gradientEndColor }
                ]
            } : null
        },
        backgroundOptions: {
            color: state.isBgTransparent ? 'transparent' : state.bgColor
        },
        imageOptions: {
            imageSize: state.logoSize,
            margin: state.logoMargin
        },
        cornersSquareOptions: {
            type: state.cornerStyle,
            color: state.dotsColor
        },
        cornersDotOptions: {
            color: state.dotsColor
        },
        qrOptions: {
            errorCorrectionLevel: state.errorLevel
        }
    });
}

function buildDataPayload() {
    switch (state.type) {
        case 'url':
            state.data = document.getElementById('inputUrlText').value.trim() || 'https://example.com';
            break;
        case 'wifi': {
            const ssid = document.getElementById('wifiSsid').value.trim();
            const pass = document.getElementById('wifiPassword').value;
            const type = document.getElementById('wifiType').value;
            const hidden = document.getElementById('wifiHidden').checked;
            state.data = ssid ? `WIFI:S:${ssid};T:${type};P:${pass};H:${hidden};;` : 'WIFI:S:MyNetwork;T:WPA;P:password;;';
            break;
        }
        case 'vcard': {
            const name = document.getElementById('vcardName').value.trim() || '山田 太郎';
            const org = document.getElementById('vcardOrg').value.trim();
            const title = document.getElementById('vcardTitle') ? document.getElementById('vcardTitle').value.trim() : '';
            const tel = document.getElementById('vcardTel').value.trim();
            const email = document.getElementById('vcardEmail').value.trim();
            const url = document.getElementById('vcardUrl') ? document.getElementById('vcardUrl').value.trim() : '';
            const lines = ['BEGIN:VCARD', 'VERSION:3.0', `FN:${name}`];
            if (org) lines.push(`ORG:${org}`);
            if (title) lines.push(`TITLE:${title}`);
            if (tel) lines.push(`TEL;TYPE=CELL:${tel}`);
            if (email) lines.push(`EMAIL:${email}`);
            if (url) lines.push(`URL:${url}`);
            lines.push('END:VCARD');
            state.data = lines.join('\r\n');
            break;
        }
        case 'email': {
            const to = document.getElementById('emailTo').value.trim();
            const sub = document.getElementById('emailSubject').value.trim();
            const body = document.getElementById('emailBody').value.trim();
            state.data = to ? `mailto:${to}?subject=${encodeURIComponent(sub)}&body=${encodeURIComponent(body)}` : 'mailto:info@example.com';
            break;
        }
        case 'phone': {
            const num = document.getElementById('phoneNum').value.trim() || '09000000000';
            const isSms = document.getElementById('isSms').checked;
            const smsBody = document.getElementById('smsBody').value.trim();
            state.data = isSms ? `smsto:${num}:${smsBody}` : `tel:${num}`;
            break;
        }
    }
}

function setupEventListeners() {
    // Tab Handling
    const tabs = [
        { id: 'tabInput', sec: 'contentSection' },
        { id: 'tabStyle', sec: 'styleSection' },
        { id: 'tabLogo', sec: 'logoSection' }
    ];

    tabs.forEach(t => {
        document.getElementById(t.id).addEventListener('click', () => {
            tabs.forEach(x => {
                document.getElementById(x.id).classList.remove('active');
                document.getElementById(x.sec).classList.add('hidden');
            });
            document.getElementById(t.id).classList.add('active');
            document.getElementById(t.sec).classList.remove('hidden');
        });
    });

    // Type Buttons
    document.querySelectorAll('.type-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.type-btn').forEach(b => {
                b.classList.remove('active');
            });
            btn.classList.add('active');

            state.type = btn.dataset.type;
            ['formUrl', 'formWifi', 'formVcard', 'formEmail', 'formPhone'].forEach(id => {
                document.getElementById(id).classList.add('hidden');
            });
            document.getElementById('form' + state.type.charAt(0).toUpperCase() + state.type.slice(1)).classList.remove('hidden');
            updateQRCode();
        });
    });

    // Color & Style Bindings
    const bindColor = (pickerId, textId, stateKey) => {
        const picker = document.getElementById(pickerId);
        const text = document.getElementById(textId);
        picker.addEventListener('input', (e) => {
            text.value = e.target.value;
            state[stateKey] = e.target.value;
            updateQRCode();
        });
        text.addEventListener('input', (e) => {
            if (/^#[0-9A-F]{6}$/i.test(e.target.value)) {
                picker.value = e.target.value;
                state[stateKey] = e.target.value;
                updateQRCode();
            }
        });
    };

    bindColor('colorDot', 'colorDotText', 'dotsColor');
    bindColor('colorBg', 'colorBgText', 'bgColor');
    bindColor('colorGradientEnd', 'colorGradientEndText', 'gradientEndColor');

    document.getElementById('bgTransparent').addEventListener('change', (e) => {
        state.isBgTransparent = e.target.checked;
        updateQRCode();
    });

    document.getElementById('useGradient').addEventListener('change', (e) => {
        state.useGradient = e.target.checked;
        document.getElementById('gradientControls').classList.toggle('hidden', !e.target.checked);
        updateQRCode();
    });

    document.getElementById('gradientType').addEventListener('change', (e) => {
        state.gradientType = e.target.value;
        updateQRCode();
    });

    // Dot Style Buttons
    document.querySelectorAll('.dot-style-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.dot-style-btn').forEach(b => b.classList.remove('active'));
            e.currentTarget.classList.add('active');
            state.dotsStyle = e.currentTarget.dataset.dotstyle;
            updateQRCode();
        });
    });

    // Corner Style Buttons
    document.querySelectorAll('.corner-style-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.corner-style-btn').forEach(b => b.classList.remove('active'));
            e.currentTarget.classList.add('active');
            state.cornerStyle = e.currentTarget.dataset.cornerstyle;
            updateQRCode();
        });
    });

    document.getElementById('errorCorrectionLevel').addEventListener('change', (e) => {
        state.errorLevel = e.target.value;
        updateQRCode();
    });

    // Preset Logo Buttons
    document.querySelectorAll('.preset-logo-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.preset-logo-btn').forEach(b => b.classList.remove('active'));
            e.currentTarget.classList.add('active');
            state.logoUrl = e.currentTarget.dataset.logo;
            updateQRCode();
        });
    });

    // File Logo Upload
    document.getElementById('logoFileInput').addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                document.querySelectorAll('.preset-logo-btn').forEach(b => b.classList.remove('active'));
                state.logoUrl = event.target.result;
                // ロゴ挿入時はエラー訂正レベルを自動的にHへ引き上げ読み取りやすさを確保
                if (state.errorLevel === 'L' || state.errorLevel === 'M') {
                    state.errorLevel = 'H';
                    document.getElementById('errorCorrectionLevel').value = 'H';
                }
                updateQRCode();
                showToast('ロゴ画像を読み込みました');
            };
            reader.readAsDataURL(file);
        }
    });

    // Attach input listeners
    ['inputUrlText', 'wifiSsid', 'wifiPassword', 'wifiType', 'wifiHidden', 'vcardName', 'vcardOrg', 'vcardTitle', 'vcardTel', 'vcardEmail', 'vcardUrl', 'emailTo', 'emailSubject', 'emailBody', 'phoneNum', 'smsBody'].forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.addEventListener('input', updateQRCode);
            el.addEventListener('change', updateQRCode);
        }
    });

    document.getElementById('isSms').addEventListener('change', (e) => {
        document.getElementById('smsMessageArea').classList.toggle('hidden', !e.target.checked);
        updateQRCode();
    });

    // Download Action (選択された出力サイズを反映)
    document.getElementById('downloadBtn').addEventListener('click', async () => {
        const format = document.getElementById('exportFormat').value;
        const size = parseInt(document.getElementById('exportSize').value, 10) || 600;
        const exportQr = new QRCodeStyling(getQRCodeOptions(size));
        await exportQr.download({ name: 'qrcode_' + Date.now(), extension: format });
        showToast('ダウンロードを開始しました');
    });

    // Copy Action
    document.getElementById('copyImageBtn').addEventListener('click', async () => {
        const canvas = document.querySelector('#qrcode-container canvas');
        if (canvas) {
            canvas.toBlob(async (blob) => {
                try {
                    await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
                    showToast('クリップボードにコピーしました！');
                } catch (e) {
                    showToast('お使いのブラウザでは直接コピーに対応していません', true);
                }
            });
        }
    });

    // Theme Toggle
    document.getElementById('themeToggleBtn').addEventListener('click', () => {
        document.documentElement.classList.toggle('dark');
    });
}

let toastTimer = null;
function showToast(msg, isError = false) {
    const toast = document.getElementById('toast');
    const icon = document.getElementById('toastIcon');
    document.getElementById('toastMsg').innerText = msg;

    if (isError) {
        icon.className = 'fa-solid fa-circle-exclamation text-rose-400';
    } else {
        icon.className = 'fa-solid fa-circle-check text-purple-400';
    }

    toast.classList.remove('translate-y-24', 'opacity-0');
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
        toast.classList.add('translate-y-24', 'opacity-0');
    }, 3000);
}

window.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
    initQRCode();
});