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

// //sends reponses to and from the popup menu
// chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
//     if (request === "startCapture") {
//         startCapture();
//     }
// });


// const startCapture = function () {
//     chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
//         const tabId = tabs[0].id.toString();
//         console.log("tabId", tabId);
//         const abc = chrome.tabCapture
//         console.log("chrome.tabCapture.getMediaStreamId", abc.getMediaStreamId);
//         // CODE TO BLOCK CAPTURE ON YOUTUBE, DO NOT REMOVE
//         // if(tabs[0].url.toLowerCase().includes("youtube")) {
//         //   chrome.tabs.create({url: "error.html"});
//         // } else {

//         chrome.tabCapture.getMediaStreamId({}, (streamId) => {
//             console.log("streamId", streamId);
//         });
//         chrome.tabCapture.capture({ audio: true }, function (stream) {
//             console.log("stream", stream);
//         });


//         chrome.tabCapture.getMediaStreamId({ tabId: tabId }, (streamId) => {
//             if (!streamId) {
//                 console.error("Failed to get media stream ID.");
//                 return;
//             }

//             // Sử dụng ID luồng phương tiện để lấy luồng âm thanh từ tab
//             navigator.mediaDevices.getUserMedia({ audio: { mandatory: { chromeMediaSource: 'tab', chromeMediaSourceId: streamId } } })
//                 .then((stream) => {
//                     const format = 'mp3';
//                     const quality = 192;
//                     // Gọi hàm xử lý luồng âm thanh
//                     audioCapture(format, quality, stream);
//                 })
//                 .catch((error) => {
//                     console.error('getUserMedia error:', error);
//                 });
//         });
//         // }
//     });
// };




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