
document.addEventListener('DOMContentLoaded', function () {
    // Lấy các phần tử từ DOM
    var startButton = document.getElementById('startButton');
    var stopButton = document.getElementById('stopButton');
    var recordedAudio = document.getElementById('recordedAudio');
    var capturedStream;
    var mediaRecorder;
    var recordedChunks = [];
    var audioContext;
    var sourceNode;
    var destinationNode;

    function sendAudioToApi(recordedChunks) {
        console.log(`Bắt đầu gửi dữ liệu đến API tại: ${new Date().toLocaleTimeString()}`);

        var recordedBlob = new Blob(recordedChunks, { type: 'audio/webm' });

        var formData = new FormData();
        formData.append('file', recordedBlob, 'recordedAudio.webm');

        fetch('http://localhost:3000/transcribe', {
            method: 'POST',
            body: formData
        })
            .then(response => response.json())
            .then(data => {
                // console.log('Transcription:', data);
                console.log(`API Response tại: ${new Date().toLocaleTimeString()}`, data);

                // Đảm bảo content script đã được inject và sẵn sàng nhận tin nhắn
                chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                    if (tabs[0]) {
                        chrome.tabs.sendMessage(tabs[0].id, { type: 'transcription', data: data }, (response) => {
                            if (chrome.runtime.lastError) {
                                console.error(chrome.runtime.lastError.message);
                            } else {
                                console.log('Message sent to content script', response);
                            }
                        });
                    }
                });
            })

            .catch(error => console.error('Error:', error));
    }
    function sendAudioToApiStop(recordedChunks) {
        console.log(`Bắt đầu gửi Stop dữ liệu đến API tại: ${new Date().toLocaleTimeString()}`);

        var recordedBlob = new Blob(recordedChunks, { type: 'audio/webm' });

        var formData = new FormData();
        formData.append('file', recordedBlob, 'recordedAudio.webm');

        fetch('http://localhost:3000/transcribe', {
            method: 'POST',
            body: formData
        })
            .then(response => response.json())
            .then(data => {
                console.log('TranscriptionStop:', data);
                console.log(`API Stop Response tại: ${new Date().toLocaleTimeString()}`, data);

                // Đảm bảo content script đã được inject và sẵn sàng nhận tin nhắn
                chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                    if (tabs[0]) {
                        chrome.tabs.sendMessage(tabs[0].id, { type: 'tStopranscription', data: data }, (response) => {
                            if (chrome.runtime.lastError) {
                                console.error(chrome.runtime.lastError.message);
                            } else {
                                console.log('Message sent to content script', response);
                            }
                        });
                    }
                });
            })

            .catch(error => console.error('Error:', error));
    }
    // Lắng nghe sự kiện click của nút startButton
    startButton.addEventListener('click', function () {
        // Sử dụng API chrome.tabCapture để capture âm thanh từ tab hiện tại
        console.log(`Bắt đầu ghi âm tại: ${new Date().toLocaleTimeString()}`);

        chrome.tabCapture.capture({ audio: true }, function (stream) {
            if (chrome.runtime.lastError) {
                console.error(chrome.runtime.lastError.message);
                return;
            }
            console.log(`Stream captured tại: ${new Date().toLocaleTimeString()}`);

            capturedStream = stream;
            // recordedChunks = [];

            audioContext = new AudioContext();
            sourceNode = audioContext.createMediaStreamSource(capturedStream);
            sourceNode.connect(audioContext.destination);
            destinationNode = audioContext.createMediaStreamDestination();
            sourceNode.connect(destinationNode);

            mediaRecorder = new MediaRecorder(destinationNode.stream);

            mediaRecorder.ondataavailable = function (e) {
                if (e.data.size > 0) {
                    const newChunk = e.data;
                    console.log(`Data available tại: ${new Date().toLocaleTimeString()}`);
                    recordedChunks.push(newChunk);
                    sendAudioToApi(recordedChunks)
                }
            };

            mediaRecorder.start();

            const requestDataInterval = setInterval(() => {
                mediaRecorder.requestData();
            }, 1000);

        });
    });




    stopButton.addEventListener('click', function () {
        if (mediaRecorder && mediaRecorder.state !== "inactive") {
            mediaRecorder.stop();

            // Xử lý dữ liệu cuối cùng khi ghi âm dừng
            mediaRecorder.onstop = function () {
                console.log(`Recording stopped tại: ${new Date().toLocaleTimeString()}`);
                if (recordedChunks.length > 0) {
                    sendAudioToApiStop(recordedChunks);
                }
            };
        }
    });


    // stopButton.addEventListener('click', function () {
    //     if (mediaRecorder && mediaRecorder.state !== "inactive") {
    //         mediaRecorder.stop();

    //         mediaRecorder.onstop = function () {
    //             if (recordedChunks.length > 0) {
    //                 var recordedBlob = new Blob(recordedChunks, { type: 'audio/webm' });
    //                 var reader = new FileReader();
    //                 reader.onloadend = function () {
    //                     var base64data = reader.result;
    //                     chrome.storage.local.set({ 'recordedAudio': base64data }, function () {
    //                         console.log('Đã lưu âm thanh vào bộ nhớ');
    //                     });
    //                     var recordedUrl = URL.createObjectURL(recordedBlob);
    //                     recordedAudio.src = recordedUrl;
    //                 };
    //                 reader.readAsDataURL(recordedBlob);
    //             } else {
    //                 console.warn('Không có dữ liệu âm thanh nào được ghi lại.');
    //             }
    //             stream.getTracks().forEach(track => track.stop());
    //             audioContext.close();
    //         };
    //     }
    // });

    // chrome.storage.local.get('recordedAudio', function (data) {
    //     if (data.recordedAudio) {
    //         recordedAudio.src = data.recordedAudio;
    //     }
    // });
});



