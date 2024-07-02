import os
import json
import asyncio
import threading
import numpy as np
from queue import Queue
import librosa
from vosk import Model, KaldiRecognizer
from fastapi import FastAPI, File, UploadFile
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import socketio
import aiofiles

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

sio = socketio.AsyncServer(async_mode='asgi', cors_allowed_origins='*')
app_socket = socketio.ASGIApp(sio, app)

model_path = "vosk-model-small-en-us-0.15"
model = Model(model_path)
recognizer = KaldiRecognizer(model, 22050)

file_queue = Queue()
count_lock = threading.Lock()
count = 0

array_temps = []

def split_on_silence(y, sr):
    custom_ref = 0.2
    top_db = 20
    intervals = librosa.effects.split(y, top_db=top_db, ref=custom_ref)
    return intervals

def recognizer_audio(pcm_data):
    recognizer.AcceptWaveform(pcm_data)
    result = recognizer.FinalResult()
    result_dict = json.loads(result)
    return result_dict['text']

@app.post("/transcribe")
async def transcribe_audio(file: UploadFile = File(...)):
    if not file:
        return JSONResponse(status_code=400, content={"error": "No file part"})

    global count
    with count_lock:
        webm_file_name = file.filename.split(".")[0] + "_" + str(count) + ".webm"
        webm_file_path = './audio/' + webm_file_name
        os.makedirs(os.path.dirname(webm_file_path), exist_ok=True)
        async with aiofiles.open(webm_file_path, 'wb') as f:
            await f.write(await file.read())
        output_path = f'./audio/segment_{count}.wav'
        count += 1

    file_queue.put((webm_file_path, output_path))
    return {"transcription": "abc"}

async def convert_wav(input_path: str, output_path: str) -> bool:
    try:
        command = ['ffmpeg', '-loglevel', 'error', '-i', input_path, '-c:a', 'pcm_s16le', output_path]
        process = await asyncio.create_subprocess_exec(*command, stdout=asyncio.subprocess.PIPE, stdin=asyncio.subprocess.PIPE)
        await process.communicate()
        return True
    except Exception as e:
        print(f"Conversion error: {e}")
        return False

async def librosa_load_async(path: str):
    loop = asyncio.get_event_loop()
    return await loop.run_in_executor(None, librosa.load, path)

def process_files():
    while True:
        webm_file_path, output_path = file_queue.get()
        result = asyncio.run(process_file(webm_file_path, output_path))
        if result:
            asyncio.run(sio.emit('transcription_result', {'transcription': result}))
        file_queue.task_done()
        os.remove(webm_file_path)
        os.remove(output_path)

async def process_file(webm_file_path, output_path):
    global array_temps

    success = await convert_wav(webm_file_path, output_path)
    if not success:
        print(f"File conversion failed for {webm_file_path}")
        return

    audio_data, sr = await librosa_load_async(output_path)

    intervals_array = split_on_silence(audio_data, sr)
    transcription = ""

    if intervals_array.size == 0:
        pcm_data = b''.join([(temp * 32767).astype(np.int16).tobytes() for temp in array_temps])
        transcription = recognizer_audio(pcm_data)
        array_temps = []
    else:
        if (np.subtract(intervals_array[0][0], 0) < 500) and (np.subtract(sr, intervals_array[-1][1]) < 2000):
            pcm_data = b''.join([(temp * 32767).astype(np.int16).tobytes() for temp in array_temps])
            transcription = recognizer_audio(pcm_data)
            array_temps = []
            array_temps.append(audio_data)
        elif (np.subtract(intervals_array[0][0], 0) > 500) and (np.subtract(sr, intervals_array[-1][1]) > 2000):
            array_temps.append(audio_data)
            pcm_data = b''.join([(temp * 32767).astype(np.int16).tobytes() for temp in array_temps])
            transcription = recognizer_audio(pcm_data)
            array_temps = []
        else:
            array_temps.append(audio_data)
    print("transcription: ", transcription)
    return transcription

threading.Thread(target=process_files, daemon=True).start()

if __name__ == '__main__':
    import uvicorn
    uvicorn.run(app_socket, host='0.0.0.0', port=3000)
