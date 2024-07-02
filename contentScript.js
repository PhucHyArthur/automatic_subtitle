// Biến lưu trữ cửa sổ overlay hiện tại
let overlayDiv = null;

// Hàm để tạo hoặc cập nhật cửa sổ overlay với dữ liệu mới từ message.data
function updateOverlay(data) {
    if (!overlayDiv) {
        createOverlay(data);
    } else {
        let translateText = overlayDiv.querySelector('.hello');
        if (translateText) {
            translateText.textContent = data || 'Loading...';
        }
    }
}

// Hàm để tạo cửa sổ overlay mới
function createOverlay(data) {
    overlayDiv = document.createElement('div');
    overlayDiv.classList.add('overlay');

    var divkhung = document.createElement('div');
    divkhung.classList.add('divkhung');

    var titleDiv = document.createElement('div');
    titleDiv.classList.add('title');
    titleDiv.textContent = 'Translation';

    var closeButton = document.createElement('button');
    closeButton.classList.add('close-button');
    closeButton.addEventListener('click', function () {
        document.body.removeChild(overlayDiv);
        overlayDiv = null; // Đặt lại overlayDiv về null khi đóng cửa sổ
        chrome.runtime.sendMessage({
            type: 'stop1-recording',
            target: 'offscreen'
        });
    });

    var framworkTranslate = document.createElement('div');
    framworkTranslate.classList.add('framworkTranslate');

    var translateText = document.createElement('div');
    translateText.classList.add('hello');
    translateText.textContent = data.transcription || 'Loading...'; // Sử dụng dữ liệu từ message

    divkhung.appendChild(closeButton);
    divkhung.appendChild(titleDiv);
    overlayDiv.appendChild(divkhung);
    framworkTranslate.appendChild(translateText);
    overlayDiv.appendChild(framworkTranslate);
    document.body.appendChild(overlayDiv);

    var offsetX, offsetY;

    overlayDiv.addEventListener('mousedown', function (e) {
        offsetX = e.clientX - overlayDiv.getBoundingClientRect().left;
        offsetY = e.clientY - overlayDiv.getBoundingClientRect().top;
        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
        e.preventDefault();
    });

    function onMouseMove(e) {
        var newX = e.clientX - offsetX;
        var newY = e.clientY - offsetY;
        overlayDiv.style.left = newX + 'px';
        overlayDiv.style.top = newY + 'px';
    }

    function onMouseUp(e) {
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
    }
}

// Lắng nghe sự kiện từ background hoặc popup
chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
    if (message.type === 'transcription') {
        console.log('Transcription:', message.data);

        // Cập nhật hoặc tạo cửa sổ overlay với dữ liệu mới từ message
        updateOverlay(message.data);
    }
});