// // const url = window.location.href;

// // if (url.indexOf("dashboard.") < 0) {
// //     console.log("1");
// //     setInterval(() => {
// //         console.log("12");
// //         const videos = document.getElementById("themeProvider");
// //         console.log("videos", videos);
// //         // for (let i = 0; i < videos.length; i++) {
// //         //     if (
// //         //         videos.length > 2 &&
// //         //         videos[i].parentElement &&
// //         //         videos[i].parentElement.childNodes &&
// //         //         videos[i].parentElement.childNodes.length <= 2
// //         //     ) {
// //         //         const button = document.createElement("buttonabc");
// //         //         button.textContent = "x";
// //         //         button.classList.add("chrome-extension-button");
// //         //         button.onclick = function (e) {
// //         //             e.stopPropagation();
// //         //             if (button.classList.contains("highlight")) {
// //         //                 button.classList.remove("highlight");
// //         //             } else {
// //         //                 button.classList.add("highlight");
// //         //             }
// //         //         };
// //         //         videos[i].parentElement.appendChild(button);
// //         //     }
// //         // }
// //         const button = document.createElement("buttonabc");
// //         button.textContent = "x";
// //         button.classList.add("chrome-extension-button");
// //         button.id = "btn123";
// //         button.onclick = function (e) {
// //             e.stopPropagation();
// //             if (button.classList.contains("highlight")) {
// //                 button.classList.remove("highlight");
// //             } else {
// //                 button.classList.add("highlight");
// //             }
// //         };
// //         videos.parentElement.appendChild(button);
// //         chrome.tabCapture.capture({ audio: true }, (stream) => {
// //             const output = new AudioContext();
// //             const source = output.createMediaStreamSource(stream);
// //             source.connect(output.destination);
// //             console.log("source123", source);
// //         });
// //         console.log("123");


// //     }, 5000);
// // }





// const extend = function () { //helper function to merge objects
//     let target = arguments[0],
//         sources = [].slice.call(arguments, 1);
//     for (let i = 0; i < sources.length; ++i) {
//         let src = sources[i];
//         for (key in src) {
//             let val = src[key];
//             target[key] = typeof val === "object"
//                 ? extend(typeof target[key] === "object" ? target[key] : {}, val)
//                 : val;
//         }
//     }
//     return target;
// };

// chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
//     if (request.message === "startCapture" && request.audioStream) {
//         console.log("startCapture");

//         console.log("request.audioStream", request.audioStream);
//         // // Lấy thẻ audio
//         // const audioElement = document.getElementById('recordedAudio');


//         // // Thiết lập MediaStream cho thẻ audio
//         // audioElement.srcObject = request.audioStream;
//         // audioElement.play();

//         // startCapture()
//     } else if (message.message === "cancelCapture") {
//         stopCapture();
//     }
// });


// chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
//     if (request.message === "startCapture") {
//         // Listen for the incoming stream via a long-lived connection
//         chrome.runtime.onConnect.addListener(port => {
//             port.onMessage.addListener(msg => {
//                 if (msg.stream) {
//                     // Create an audio element
//                     const audioElement = document.getElementById('recordedAudio');

//                     // Set the hidden attribute to false to make it visible
//                     audioElement.hidden = false;

//                     // Assign the MediaStream to the audio element
//                     audioElement.srcObject = msg.stream;

//                     // Play the audio
//                     audioElement.play();
//                 }
//             });
//         });
//     }
// });





// const startCapture = function () {
//     // CODE TO BLOCK CAPTURE ON YOUTUBE, DO NOT REMOVE
//     // if(tabs[0].url.toLowerCase().includes("youtube")) {
//     //   chrome.tabs.create({url: "error.html"});
//     // } else {


//     const format = "mp3";
//     const quality = 192;
//     audioCapture(format, quality);

//     // }

// }


// const audioCapture = (format, quality, stream) => {
//     let startTabId; //tab when the capture is started
//     let timeout;
//     let completeTabID; //tab when the capture is stopped
//     let audioURL = null; //resulting object when encoding is completed
//     chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => startTabId = tabs[0].id) //saves start tab
//     const liveStream = stream;
//     const audioCtx = new AudioContext();
//     const source = audioCtx.createMediaStreamSource(stream);
//     let mediaRecorder = new Recorder(source); //initiates the recorder based on the current stream
//     mediaRecorder.setEncoding(format); //sets encoding based on options
//     if (format === "mp3") {
//         mediaRecorder.setOptions({ mp3: { bitRate: quality } });
//     }
//     mediaRecorder.startRecording();

//     function onStopClick(request) { //click on popup
//         if (request === "cancelCapture") {
//             stopCapture();
//         } else if (request === "cancelCapture") {
//             cancelCapture();
//         } else if (request.cancelEncodeID) {
//             if (request.cancelEncodeID === startTabId && mediaRecorder) {
//                 mediaRecorder.cancelEncoding();
//             }
//         }
//     }

//     chrome.runtime.onMessage.addListener(onStopClick);
//     mediaRecorder.onComplete = (recorder, blob) => {
//         audioURL = window.URL.createObjectURL(blob);
//         if (completeTabID) {
//             chrome.tabs.sendMessage(completeTabID, { type: "encodingComplete", audioURL });
//         }

//         const recordedAudio = document.getElementById('recordedAudio');
//         recordedAudio.src = audioURL;
//         recordedAudio.removeAttribute('hidden');

//         mediaRecorder = null;
//     }

//     const stopCapture = function () {
//         console.log("stopCapture1");
//         let endTabId;
//         //check to make sure the current tab is the tab being captured
//         chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
//             endTabId = tabs[0].id;
//             if (mediaRecorder && startTabId === endTabId) {
//                 mediaRecorder.finishRecording();
//                 chrome.tabs.create({ url: "complete.html" }, (tab) => {
//                     completeTabID = tab.id;
//                     let completeCallback = () => {
//                         chrome.tabs.sendMessage(tab.id, { type: "createTab", format: format, audioURL, startID: startTabId });
//                     }
//                     setTimeout(completeCallback, 500);
//                 });
//                 closeStream(endTabId);
//             }
//         })
//     }

//     const cancelCapture = function () {
//         console.log("stopCapture2");

//         let endTabId;
//         chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
//             endTabId = tabs[0].id;
//             if (mediaRecorder && startTabId === endTabId) {
//                 mediaRecorder.cancelRecording();
//                 closeStream(endTabId);
//             }
//         })
//     }

//     //removes the audio context and closes recorder to save memory
//     const closeStream = function (endTabId) {
//         chrome.commands.onCommand.removeListener(onStopCommand);
//         chrome.runtime.onMessage.removeListener(onStopClick);
//         mediaRecorder.onTimeout = () => { };
//         audioCtx.close();
//         liveStream.getAudioTracks()[0].stop();
//         sessionStorage.removeItem(endTabId);
//         chrome.runtime.sendMessage({ captureStopped: endTabId });
//     }

//     mediaRecorder.onTimeout = stopCapture;
// }




// const WORKER_FILE = {
//     wav: "WavWorker.js",
//     mp3: "Mp3Worker.js"
// };

// // default configs
// const CONFIGS = {
//     workerDir: "/workers/",     // worker scripts dir (end with /)
//     numChannels: 2,     // number of channels
//     encoding: "wav",    // encoding (can be changed at runtime)

//     // runtime options
//     options: {
//         encodeAfterRecord: true, // process encoding after recording
//         progressInterval: 1000,   // encoding progress report interval (millisec)
//         bufferSize: undefined,    // buffer size (use browser default)

//         // encoding-specific options
//         wav: {
//             mimeType: "audio/wav"
//         },
//         mp3: {
//             mimeType: "audio/mpeg",
//             bitRate: 192            // (CBR only): bit rate = [64 .. 320]
//         }
//     }
// };


// class Recorder {

//     constructor(source, configs) { //creates audio context from the source and connects it to the worker
//         extend(this, CONFIGS, configs || {});
//         this.context = source.context;
//         if (this.context.createScriptProcessor == null)
//             this.context.createScriptProcessor = this.context.createJavaScriptNode;
//         this.input = this.context.createGain();
//         source.connect(this.input);
//         this.buffer = [];
//         this.initWorker();
//     }

//     isRecording() {
//         return this.processor != null;
//     }

//     setEncoding(encoding) {
//         if (!this.isRecording() && this.encoding !== encoding) {
//             this.encoding = encoding;
//             this.initWorker();
//         }
//     }

//     setOptions(options) {
//         if (!this.isRecording()) {
//             extend(this.options, options);
//             this.worker.postMessage({ command: "options", options: this.options });
//         }
//     }

//     startRecording() {
//         if (!this.isRecording()) {
//             let numChannels = this.numChannels;
//             let buffer = this.buffer;
//             let worker = this.worker;
//             this.processor = this.context.createScriptProcessor(
//                 this.options.bufferSize,
//                 this.numChannels, this.numChannels);
//             this.input.connect(this.processor);
//             this.processor.connect(this.context.destination);
//             this.processor.onaudioprocess = function (event) {
//                 for (var ch = 0; ch < numChannels; ++ch)
//                     buffer[ch] = event.inputBuffer.getChannelData(ch);
//                 worker.postMessage({ command: "record", buffer: buffer });
//             };
//             this.worker.postMessage({
//                 command: "start",
//                 bufferSize: this.processor.bufferSize
//             });
//             this.startTime = Date.now();
//         }
//     }

//     cancelRecording() {
//         if (this.isRecording()) {
//             this.input.disconnect();
//             this.processor.disconnect();
//             delete this.processor;
//             this.worker.postMessage({ command: "cancel" });
//         }
//     }

//     finishRecording() {
//         if (this.isRecording()) {
//             this.input.disconnect();
//             this.processor.disconnect();
//             delete this.processor;
//             this.worker.postMessage({ command: "finish" });
//         }
//     }

//     cancelEncoding() {
//         if (this.options.encodeAfterRecord)
//             if (!this.isRecording()) {
//                 this.onEncodingCanceled(this);
//                 this.initWorker();
//             }
//     }

//     initWorker() {
//         if (this.worker != null)
//             this.worker.terminate();
//         this.onEncoderLoading(this, this.encoding);
//         this.worker = new Worker(this.workerDir + WORKER_FILE[this.encoding]);
//         let _this = this;
//         this.worker.onmessage = function (event) {
//             let data = event.data;
//             switch (data.command) {
//                 case "loaded":
//                     _this.onEncoderLoaded(_this, _this.encoding);
//                     break;
//                 case "timeout":
//                     _this.onTimeout(_this);
//                     break;
//                 case "progress":
//                     _this.onEncodingProgress(_this, data.progress);
//                     break;
//                 case "complete":
//                     _this.onComplete(_this, data.blob);
//             }
//         }
//         this.worker.postMessage({
//             command: "init",
//             config: {
//                 sampleRate: this.context.sampleRate,
//                 numChannels: this.numChannels
//             },
//             options: this.options
//         });
//     }

//     onEncoderLoading(recorder, encoding) { }
//     onEncoderLoaded(recorder, encoding) { }
//     onTimeout(recorder) { }
//     onEncodingProgress(recorder, progress) { }
//     onEncodingCanceled(recorder) { }
//     onComplete(recorder, blob) { }

// }




chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'transcription') {
        console.log('Transcription:', message.data);
        sendResponse({ received: true });
    }
});
