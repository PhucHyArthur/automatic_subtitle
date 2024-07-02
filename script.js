// script.js
// Yêu cầu service-worker gửi dữ liệu đến trang này
chrome.runtime.sendMessage({ type: 'init' });

// Lắng nghe tin nhắn để hiển thị dữ liệu
chrome.runtime.onMessage.addListener((message) => {
    if (message.type === 'display') {
        const resultDiv = document.getElementById('result');
        resultDiv.textContent = JSON.stringify(message.apiResponse, null, 2);
    }
});


window.open("", "huh", "width=320,height=210,scrollbars=no,toolbar=no,screenx=0,screeny=0,location=no,titlebar=no,directories=no,status=no,menubar=no");