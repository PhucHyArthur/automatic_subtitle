let offscreenDocument; // Khai báo biến để lưu tham chiếu đến tài liệu ngoài màn hình

chrome.runtime.onMessage.addListener(async (message) => {
    if (message.type === 'start-recording' && message.target === 'service-worker') {
        const existingContexts = await chrome.runtime.getContexts({});
        const [currentTab] = await chrome.tabs.query({ active: true, currentWindow: true });

        offscreenDocument = existingContexts.find(
            (c) => c.contextType === 'OFFSCREEN_DOCUMENT'
        );

        // If an offscreen document is not already open, create one.
        if (!offscreenDocument) {
            // Create an offscreen document.
            await chrome.offscreen.createDocument({
                url: 'offscreen.html',
                reasons: ['USER_MEDIA'],
                justification: 'Recording from chrome.tabCapture API'
            });
        }

        // Get a MediaStream for the active tab.
        const streamId = await chrome.tabCapture.getMediaStreamId({
            targetTabId: currentTab.id
        });

        // Send the stream ID to the offscreen document to start recording.
        chrome.runtime.sendMessage({
            type: 'start-recording',
            target: 'offscreen',
            data: streamId
        });

    } else if (message.type === 'stop-recording' && message.target === 'service-worker') {
        // Stop recording
        chrome.runtime.sendMessage({
            type: 'stop-recording',
            target: 'offscreen'
        });
    } else if (message.type === 'transcription') {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs[0]) {
                chrome.tabs.sendMessage(tabs[0].id, {
                    type: 'transcription',
                    data: message.data
                });
            }
        });
    }
});

