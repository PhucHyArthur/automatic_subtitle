
// document.addEventListener('DOMContentLoaded', function () {
//     // Lấy các phần tử từ DOM
//     let startButton = document.getElementById('startButton');
//     let stopButton = document.getElementById('stopButton');
//     let recordedAudio = document.getElementById('recordedAudio');
//     let capturedStream;
//     let mediaRecorder;
//     let recordedChunks = [];
//     let audioContext;
//     let sourceNode;
//     let destinationNode;
//     let audioUrls = [];
//     let allRecordedChunks = [];


//     let recordingIndex = 0; // Để xác định audio thẻ nào sẽ được ghi tiếp theo

//     function sendAudioToApi(recordedChunks) {

//         const startTime = Date.now();
//         console.log("Start time", startTime);

//         console.log(`Bắt đầu gửi dữ liệu đến API tại: ${new Date().toLocaleTimeString()}`);

//         let recordedBlob = new Blob(recordedChunks, { type: 'audio/webm' });

//         let formData = new FormData();
//         formData.append('file', recordedBlob, 'recordedAudio.webm');

//         fetch('http://localhost:3000/transcribe', {
//             method: 'POST',
//             body: formData
//         })
//             .then(response => response.json())
//             .then(data => {
//                 // console.log('Transcription:', data);
//                 const endTime = Date.now();
//                 console.log("End time", endTime);
//                 console.log("Total time ", endTime - startTime);

//                 console.log(`API Response tại: ${new Date().toLocaleTimeString()}`, data);

//                 // Đảm bảo content script đã được inject và sẵn sàng nhận tin nhắn
//                 chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
//                     if (tabs[0]) {
//                         chrome.tabs.sendMessage(tabs[0].id, { type: 'transcription', data: data }, (response) => {
//                             if (chrome.runtime.lastError) {
//                                 console.error(chrome.runtime.lastError.message);
//                             } else {
//                                 console.log('Message sent to content script', response);
//                             }
//                         });
//                     }
//                 });
//             })

//             .catch(error => console.error('Error:', error));
//     }


//     // Các thẻ audio
//     // const audioElements = [
//     //     document.getElementById('recordedAudio1'),
//     //     document.getElementById('recordedAudio2'),
//     //     document.getElementById('recordedAudio3'),
//     // ];

//     // Lắng nghe sự kiện click của nút startButton
//     startButton.addEventListener('click', function () {
//         // Sử dụng API chrome.tabCapture để capture âm thanh từ tab hiện tại
//         console.log(`Bắt đầu ghi âm tại: ${new Date().toLocaleTimeString()}`);

//         chrome.tabCapture.capture({ audio: true }, function (stream) {
//             if (chrome.runtime.lastError) {
//                 console.error(chrome.runtime.lastError.message);
//                 return;
//             }
//             console.log(`Stream captured tại: ${new Date().toLocaleTimeString()}`);

//             capturedStream = stream;
//             // recordedChunks = [];

//             audioContext = new AudioContext();
//             sourceNode = audioContext.createMediaStreamSource(capturedStream);
//             sourceNode.connect(audioContext.destination);
//             destinationNode = audioContext.createMediaStreamDestination();
//             sourceNode.connect(destinationNode);

//             mediaRecorder = new MediaRecorder(destinationNode.stream);

//             mediaRecorder.ondataavailable = function (e) {
//                 if (e.data.size > 0) {
//                     const newChunk = e.data;
//                     recordedChunks.push(newChunk);
//                     allRecordedChunks.push(newChunk);
//                     // sendAudioToApi(recordedChunks)
//                 }
//             };

//             mediaRecorder.start();

//             // // Set up an interval to request data every 1 second
//             // const requestDataInterval = setInterval(() => {
//             //     // Request data from the MediaRecorder
//             //     mediaRecorder.requestData();

//             //     // Send the collected chunks to the API
//             //     if (recordedChunks.length > 0) {
//             //         console.log("recordedChunks in mediaRecorder.requestData();", recordedChunks);

//             //         console.log(`Data available tại mediaRecorder.requestData: ${new Date().toLocaleTimeString()}`);
//             //         sendAudioToApi(recordedChunks);
//             //         // Clear the recordedChunks array
//             //         recordedChunks = [];
//             //     }
//             // }, 1000);

//             // const requestDataInterval = setInterval(() => {
//             //     mediaRecorder.stop();

//             //     mediaRecorder.onstop = function () {
//             //         if (recordedChunks.length > 0) {
//             //             var recordedBlob = new Blob(recordedChunks, { type: 'audio/webm' });
//             //             var reader = new FileReader();
//             //             reader.onloadend = function () {
//             //                 var base64data = reader.result;
//             //                 chrome.storage.local.set({ 'recordedAudio': base64data }, function () {
//             //                     console.log('Đã lưu âm thanh vào bộ nhớ');
//             //                 });
//             //                 var recordedUrl = URL.createObjectURL(recordedBlob);
//             //                 recordedAudio.src = recordedUrl;
//             //             };
//             //             reader.readAsDataURL(recordedBlob);
//             //         } else {
//             //             console.warn('Không có dữ liệu âm thanh nào được ghi lại.');
//             //         }
//             //     };
//             //     mediaRecorder.start();

//             // }, 5000);



//             const requestDataInterval = setInterval(() => {
//                 if (mediaRecorder.state === "recording") {
//                     mediaRecorder.stop();

//                     mediaRecorder.onstop = function () {
//                         if (recordedChunks.length > 0) {
//                             sendAudioToApi(recordedChunks);
//                             const recordedBlob = new Blob(recordedChunks, { type: 'audio/webm' });
//                             const recordedUrl = URL.createObjectURL(recordedBlob);

//                             // Lưu URL vào thẻ audio tương ứng
//                             if (recordingIndex < 3) {
//                                 audioUrls[recordingIndex] = recordedUrl;
//                                 audioElements[recordingIndex].src = recordedUrl;
//                             }
//                             recordedChunks = [];
//                             mediaRecorder.start();

//                             recordingIndex++;

//                             console.log(`Đã lưu đoạn ghi âm vào thẻ recordedAudio${recordingIndex} và phát lại: ${new Date().toLocaleTimeString()}`);
//                         } else {
//                             console.warn('Không có dữ liệu âm thanh nào được ghi lại.');
//                         }
//                     };
//                 }
//             }, 1000); // 5 giây

//         });
//     });





//     stopButton.addEventListener('click', function () {
//         console.log("DAAAA clikc stop btn");
//         if (mediaRecorder && mediaRecorder.state !== "inactive") {
//             mediaRecorder.stop();

//             mediaRecorder.onstop = function () {
//                 if (allRecordedChunks.length > 0) {
//                     console.log(`Data available tại mediaRecorder.stop();: ${new Date().toLocaleTimeString()}`);
//                     console.log("allRecordedChunks ", allRecordedChunks);
//                     var recordedBlob = new Blob(allRecordedChunks, { type: 'audio/webm' });
//                     var reader = new FileReader();
//                     reader.onloadend = function () {
//                         var base64data = reader.result;
//                         chrome.storage.local.set({ 'recordedAudio': base64data }, function () {
//                             console.log('Đã lưu âm thanh vào bộ nhớ');
//                         });
//                         var recordedUrl = URL.createObjectURL(recordedBlob);
//                         recordedAudio.src = recordedUrl;
//                     };
//                     reader.readAsDataURL(recordedBlob);
//                 } else {
//                     console.warn('Không có dữ liệu âm thanh nào được ghi lại.');
//                 }
//                 capturedStream.getTracks().forEach(track => track.stop());
//                 audioContext.close();
//             };
//         }
//     });

//     chrome.storage.local.get('recordedAudio', function (data) {
//         if (data.recordedAudio) {
//             recordedAudio.src = data.recordedAudio;
//         }
//     });
// });


document.addEventListener('DOMContentLoaded', function () {
    // Lấy các phần tử từ DOM
    let startButton = document.getElementById('startButton');
    let stopButton = document.getElementById('stopButton');
    let recordedAudio = document.getElementById('recordedAudio');
    let capturedStream;
    let mediaRecorder;
    let recordedChunks = [];
    let audioContext;
    let sourceNode;
    let destinationNode;
    let audioUrls = [];
    let allRecordedChunks = [];
    let recordingIndex = 0; // Để xác định audio thẻ nào sẽ được ghi tiếp theo


    //Function Call API
    function sendAudioToApi(recordedChunks) {
        const startTime = Date.now();
        console.log("Start time", startTime);

        console.log(`Bắt đầu gửi dữ liệu đến API tại: ${new Date().toLocaleTimeString()}`);

        // Tạo Blob từ các chunks
        let recordedBlob = new Blob(recordedChunks, { type: 'audio/webm' });

        // Chuyển Blob thành ArrayBuffer
        recordedBlob.arrayBuffer().then(arrayBuffer => {
            console.log("arrayBuffer", arrayBuffer);
            fetch('http://localhost:3000/transcribe', {
                method: 'POST',
                headers: {
                    'Content-Type': 'audio/webm' // Đặt đúng Content-Type
                },
                body: arrayBuffer // Gửi ArrayBuffer trực tiếp
            })
                .then(response => response.json())
                .then(data => {
                    const endTime = Date.now();
                    console.log("End time", endTime);
                    console.log("Total time ", endTime - startTime);

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
        }).catch(error => console.error('Error converting Blob to ArrayBuffer:', error));
    }



    // Các thẻ audio
    const audioElements = [
        document.getElementById('recordedAudio1'),
        document.getElementById('recordedAudio2'),
        document.getElementById('recordedAudio3'),
    ];
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
            audioContext = new AudioContext();
            sourceNode = audioContext.createMediaStreamSource(capturedStream);
            sourceNode.connect(audioContext.destination);
            destinationNode = audioContext.createMediaStreamDestination();
            sourceNode.connect(destinationNode);

            mediaRecorder = new MediaRecorder(destinationNode.stream);

            mediaRecorder.ondataavailable = function (e) {
                if (e.data.size > 0) {
                    const newChunk = e.data;
                    recordedChunks.push(newChunk);
                }
            };

            mediaRecorder.start();

            const requestDataInterval = setInterval(() => {
                if (mediaRecorder.state === "recording") {
                    mediaRecorder.stop();

                    mediaRecorder.onstop = function () {
                        if (recordedChunks.length > 0) {
                            // Call API 
                            sendAudioToApi(recordedChunks);
                            const recordedBlob = new Blob(recordedChunks, { type: 'audio/webm' });
                            const recordedUrl = URL.createObjectURL(recordedBlob);

                            // Lưu URL vào thẻ audio tương ứng
                            if (recordingIndex < 3) {
                                audioUrls[recordingIndex] = recordedUrl;
                                audioElements[recordingIndex].src = recordedUrl;
                            }
                            recordedChunks = [];
                            mediaRecorder.start();

                            recordingIndex++;

                            console.log(`Đã lưu đoạn ghi âm vào thẻ recordedAudio${recordingIndex} và phát lại: ${new Date().toLocaleTimeString()}`);
                        } else {
                            console.warn('Không có dữ liệu âm thanh nào được ghi lại.');
                        }
                    };
                }
            }, 1000);

        });
    });

    // Lắng nghe sự kiện click của nút StopBtn

    stopButton.addEventListener('click', function () {
        console.log("DAAAA clikc stop btn");
        if (mediaRecorder && mediaRecorder.state !== "inactive") {
            mediaRecorder.stop();

            mediaRecorder.onstop = function () {
                if (allRecordedChunks.length > 0) {
                    console.log(`Data available tại mediaRecorder.stop();: ${new Date().toLocaleTimeString()}`);
                    console.log("allRecordedChunks ", allRecordedChunks);
                    var recordedBlob = new Blob(allRecordedChunks, { type: 'audio/webm' });
                    var reader = new FileReader();
                    reader.onloadend = function () {
                        var base64data = reader.result;
                        chrome.storage.local.set({ 'recordedAudio': base64data }, function () {
                            console.log('Đã lưu âm thanh vào bộ nhớ');
                        });
                        var recordedUrl = URL.createObjectURL(recordedBlob);
                        recordedAudio.src = recordedUrl;
                    };
                    reader.readAsDataURL(recordedBlob);
                } else {
                    console.warn('Không có dữ liệu âm thanh nào được ghi lại.');
                }
                capturedStream.getTracks().forEach(track => track.stop());
                audioContext.close();
            };
        }
    });

    chrome.storage.local.get('recordedAudio', function (data) {
        if (data.recordedAudio) {
            recordedAudio.src = data.recordedAudio;
        }
    });
});




