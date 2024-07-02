// let count = 0;
// function sendAudioToApi(recordedChunks) {
//     const startTime = Date.now();
//     console.log("Start time", startTime);



//     console.log(`Bắt đầu gửi dữ liệu đến API tại: ${new Date().toLocaleTimeString()}`);

//     let recordedBlob = new Blob(recordedChunks, { type: 'audio/wav' });


//     let formData = new FormData();
//     formData.append('file', recordedBlob, 'recordedAudio.wav');
//     fetch('http://localhost:3000/transcribe', {
//         method: 'POST',
//         body: formData
//     })
//         .then(response => response.json())
//         .then(data => {
//             // console.log('Transcription:', data);
//             const endTime = Date.now();
//             console.log("End time", endTime);
//             console.log("Total time ", endTime - startTime);
//             console.log(`API Response tại: ${new Date().toLocaleTimeString()}`, data);
//             if (data.transcription) {
//                 let textContent = data.transcription;
//                 console.log(textContent)
//                 chrome.runtime.sendMessage({
//                     type: 'transcription',
//                     data: textContent,
//                 });
//             } else {
//                 console.error('Transcription failed:', data);
//             }
//         })
//         .catch(error => console.error('Error:', error));
// }
// // // Hàm lưu tệp âm thanh xuống máy
// // function saveAudioToFile(audioBlob, fileName) {
// //     const url = URL.createObjectURL(audioBlob);
// //     const a = document.createElement('a');
// //     a.style.display = 'none';
// //     a.href = url;
// //     a.download = fileName;
// //     document.body.appendChild(a);
// //     a.click();
// //     URL.revokeObjectURL(url);
// // }




// let recorder;
// let chunk = [];
// let totalData = [];
// let requestDataInterval = null; // Lưu trữ ID của khoảng thời gian

// chrome.runtime.onMessage.addListener(async (message) => {
//     if (message.target === 'offscreen') {
//         switch (message.type) {
//             case 'start-recording':
//                 startRecording(message.data);
//                 break;
//             case 'stop-recording':
//                 stopRecording();
//                 break;
//         }
//     }
// });

// // let intervalCounter = 0; // Bộ đếm số lần ghi âm
// // const maxIntervals = 60; // Số lần ghi âm (60 giây)

// async function startRecording(streamId) {
//     if (recorder?.state === 'recording') {
//         throw new Error('Đã có một phiên ghi âm đang diễn ra.');
//     }

//     const media = await navigator.mediaDevices.getUserMedia({
//         audio: {
//             mandatory: {
//                 chromeMediaSource: 'tab',
//                 chromeMediaSourceId: streamId
//             }
//         }
//     });

//     // Tiếp tục phát âm thanh được ghi lại cho người dùng nghe.
//     const output = new AudioContext();
//     const source = output.createMediaStreamSource(media);
//     source.connect(output.destination);

//     // // Dừng ghi âm trước đó nếu có
//     // if (recorder) {
//     //     recorder.stream.getTracks().forEach((t) => t.stop());
//     //     recorder = null;
//     // }

//     // // Xóa khoảng thời gian trước đó nếu có
//     // if (requestDataInterval) {
//     //     clearInterval(requestDataInterval);
//     //     requestDataInterval = null;
//     // }

//     // Bắt đầu ghi âm mới
//     recorder = new MediaRecorder(media, { mimeType: 'audio/webm' });
//     recorder.ondataavailable = event => {
//         chunk.push(event.data);
//         totalData.push(event.data);
//     };

//     requestDataInterval = setInterval(() => {
//         if (recorder && recorder.state === "recording") {
//             recorder.stop();

//             recorder.onstop = async function () {
//                 if (chunk.length > 0) {
//                     let newChunk = chunk;
//                     chunk = [];
//                     sendAudioToApi(newChunk);
//                 } else {
//                     console.warn('Không có dữ liệu âm thanh nào được ghi lại.');
//                 }
//             };

//             recorder.start();
//         }
//     }, 1100);

//     recorder.start();

// }

// async function stopRecording() {
//     if (recorder) {
//         recorder.stop();
//         recorder.stream.getTracks().forEach((t) => t.stop());
//         recorder = null;
//     }

//     if (requestDataInterval) {
//         clearInterval(requestDataInterval);
//         requestDataInterval = null;
//     }

//     chunk = [];
// }

let count = 0;

const script = document.createElement('script');
script.src = chrome.runtime.getURL('libs/socket.io.min.js');
script.onload = () => {
  const socket = io('http://localhost:3000'); // Tạo kết nối WebSocket đến server

  // Lắng nghe sự kiện 'transcription_result' từ server
  socket.on('transcription_result', function(data) {
    console.log('Transcription:', data.transcription);
    if (data.transcription) {
      chrome.runtime.sendMessage({
        type: 'transcription',
        data: data.transcription,
      });
    } else {
      console.error('Transcription failed:', data);
    }
  });
}

function sendAudioToApi(recordedChunks) {
    const startTime = Date.now();
    console.log("Start time", startTime);

    console.log(`Bắt đầu gửi dữ liệu đến API tại: ${new Date().toLocaleTimeString()}`);

    let recordedBlob = new Blob(recordedChunks, { type: 'audio/wav' });


    let formData = new FormData();
    formData.append('file', recordedBlob, 'recordedAudio.wav');
    fetch('http://localhost:3000/transcribe', {
        method: 'POST',
        body: formData
    })
        .then(response => response.json())
        .then(data => {
            // console.log('Transcription:', data);
            const endTime = Date.now();
            console.log("End time", endTime);
            console.log("Total time ", endTime - startTime);
            console.log(`API Response tại: ${new Date().toLocaleTimeString()}`, data);
            // if (data.transcription) {
            //     let textContent = data.transcription;
            //     console.log(textContent)
            //     chrome.runtime.sendMessage({
            //         type: 'transcription',
            //         data: textContent,
            //     });
            // } else {
            //     console.error('Transcription failed:', data);
            // }
        })
        .catch(error => console.error('Error:', error));
}

let recorder;
let chunk = [];
let totalData = [];
let requestDataInterval = null; // Lưu trữ ID của khoảng thời gian

chrome.runtime.onMessage.addListener(async (message) => {
    if (message.target === 'offscreen') {
        switch (message.type) {
            case 'start-recording':
                startRecording(message.data);
                break;
            case 'stop-recording':
                stopRecording();
                break;
        }
    }
});

// let intervalCounter = 0; // Bộ đếm số lần ghi âm
// const maxIntervals = 60; // Số lần ghi âm (60 giây)

async function startRecording(streamId) {
    if (recorder?.state === 'recording') {
        throw new Error('Đã có một phiên ghi âm đang diễn ra.');
    }

    const media = await navigator.mediaDevices.getUserMedia({
        audio: {
            mandatory: {
                chromeMediaSource: 'tab',
                chromeMediaSourceId: streamId
            }
        }
    });

    // Tiếp tục phát âm thanh được ghi lại cho người dùng nghe.
    const output = new AudioContext();
    const source = output.createMediaStreamSource(media);
    source.connect(output.destination);

    // // Dừng ghi âm trước đó nếu có
    // if (recorder) {
    //     recorder.stream.getTracks().forEach((t) => t.stop());
    //     recorder = null;
    // }

    // // Xóa khoảng thời gian trước đó nếu có
    // if (requestDataInterval) {
    //     clearInterval(requestDataInterval);
    //     requestDataInterval = null;
    // }

    // Bắt đầu ghi âm mới
    recorder = new MediaRecorder(media, { mimeType: 'audio/webm' });
    recorder.ondataavailable = event => {
        chunk.push(event.data);
        totalData.push(event.data);
    };

    requestDataInterval = setInterval(() => {
        if (recorder && recorder.state === "recording") {
            recorder.stop();

            recorder.onstop = async function () {
                if (chunk.length > 0) {
                    let newChunk = chunk;
                    chunk = [];
                    sendAudioToApi(newChunk);
                } else {
                    console.warn('Không có dữ liệu âm thanh nào được ghi lại.');
                }
            };

            recorder.start();
        }
    }, 1100);

    recorder.start();

}

async function stopRecording() {
    if (recorder) {
        recorder.stop();
        recorder.stream.getTracks().forEach((t) => t.stop());
        recorder = null;
    }

    if (requestDataInterval) {
        clearInterval(requestDataInterval);
        requestDataInterval = null;
    }

    chunk = [];
}

(document.head || document.documentElement).appendChild(script);