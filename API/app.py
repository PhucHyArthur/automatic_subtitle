# import subprocess
# from flask import Flask, request, jsonify
# from flask_cors import CORS
# import moviepy.editor as moviepy
# import threading
# from vosk import Model, KaldiRecognizer
# import json

# app = Flask(__name__)
# app.config['CORS_HEADERS'] = 'Content-Type'

# cors = CORS(app)

# count = 0
# count_lock = threading.Lock()

# default_sr = 22050
# vosk_model_path = "vosk-model-small-en-us-0.15" 
# model = Model(vosk_model_path)
# recognizer = KaldiRecognizer(model, default_sr)

# @app.route('/transcribe', methods=['POST'])

# def transcribe_audio():
#     if 'file' not in request.files:
#         return jsonify({"error": "No file part"}), 400

#     webm_file = request.files['file']
    
#     if webm_file : 
#         global count
#         with count_lock:
#             print("Saving segment number:", count)
#             webm_file_name = webm_file.filename.split(".")[0] + "_" + str(count) + ".webm"
#             webm_file_path = './audio/' + webm_file_name
#             webm_file.save(webm_file_path)
#             output_path = f'./audio/segment_{count}.wav'
#             count += 1

#         success = convert_wav(webm_file_path, output_path)
    
#         if not success:
#             return jsonify({"error": "File conversion failed"}), 500

#         return jsonify({"message": "File saved successfully"}), 200
    
# def convert_wav(input_path: str, output_path : str) : 
#     command = ['ffmpeg', '-i', input_path, '-c:a', 'pcm_f32le', output_path]
#     subprocess.run(command,stdout=subprocess.PIPE,stdin=subprocess.PIPE)

# if __name__ == '__main__':
#     app.run(host='0.0.0.0', port=3000)

# import subprocess
# from flask import Flask, request, jsonify
# from flask_cors import CORS
# import threading
# from vosk import Model, KaldiRecognizer
# import json
# import os
# import librosa
# import numpy as np
# import aiofiles
# import asyncio
# from queue import Queue
# import logging
# app = Flask(__name__)
# app.config['CORS_HEADERS'] = 'Content-Type'
# cors = CORS(app)
# # Set up Flask logging
# log = logging.getLogger('werkzeug')
# log.setLevel(logging.ERROR)
# count = 0
# count_lock = threading.Lock()
# default_sr = 22050
# model_path = "vosk-model-small-en-us-0.15"
# model = Model(model_path)
# recognizer = KaldiRecognizer(model, default_sr)
# # Queue to hold files for processing
# file_queue = Queue()
# @app.route('/transcribe', methods=['POST'])

# def split_on_silence(y, sr):
#     # Setting Detecting Unvoice Frame by Librosa
#     custom_ref = 0.2
#     top_db = 20
#     intervals = librosa.effects.split(y, top_db=top_db, ref=custom_ref)
#     return intervals

# def recognizer_audio(pcm_data):
#     recognizer.AcceptWaveform(pcm_data)
#     result = recognizer.FinalResult()
#     result_dict = json.loads(result)
#     print(result_dict['text'])

# async def transcribe_audio():
#     if 'file' not in request.files:
#         return jsonify({"error": "No file part"}), 400
#     webm_file = request.files['file']
#     if webm_file:
#         global count
#         with count_lock:
#             webm_file_name = webm_file.filename.split(".")[0] + "_" + str(count) + ".webm"
#             webm_file_path = './audio/' + webm_file_name
#             os.makedirs(os.path.dirname(webm_file_path), exist_ok=True)
#             async with aiofiles.open(webm_file_path, 'wb') as f:
#                 await f.write(webm_file.read())
#             output_path = f'./audio/segment_{count}.wav'
#             count += 1
#         file_queue.put((webm_file_path, output_path))
#         return jsonify({"message": "File received and queued for processing"}), 200
# async def convert_wav(input_path: str, output_path: str) -> bool:
#     try:
#         command = ['ffmpeg', '-loglevel', 'error', '-i', input_path, '-c:a', 'pcm_s16le', output_path]
#         process = await asyncio.create_subprocess_exec(*command, stdout=subprocess.PIPE, stdin=subprocess.PIPE)
#         await process.communicate()
#         return True
#     except Exception as e:
#         print(f"Conversion error: {e}")
#         return False
# async def librosa_load_async(path: str):
#     loop = asyncio.get_event_loop()
#     return await loop.run_in_executor(None, librosa.load, path)
# def process_files():
#     while True:
#         webm_file_path, output_path = file_queue.get()
#         asyncio.run(process_file(webm_file_path, output_path))
#         file_queue.task_done()
# async def process_file(webm_file_path, output_path):
#     success = await convert_wav(webm_file_path, output_path)
#     if not success:
#         print(f"File conversion failed for {webm_file_path}")
#         return
#     audio_data, _ = await librosa_load_async(output_path)
#     pcm_data = (audio_data * 32767).astype(np.int16).tobytes()
#     recognizer.AcceptWaveform(pcm_data)
#     result = recognizer.FinalResult()
#     result_dict = json.loads(result)
#     print(result_dict['text'])
#     # Return the transcription as JSON response
#     return result
# # Start the background thread to process files
# threading.Thread(target=process_files, daemon=True).start()
# if __name__ == '__main__':
#     app.run(host='0.0.0.0', port=3000)

# import subprocess
# from flask import Flask, request, jsonify
# from flask_cors import CORS
# import threading
# from vosk import Model, KaldiRecognizer
# import json
# import os
# import librosa
# import numpy as np
# import aiofiles
# import asyncio
# from queue import Queue
# import logging

# app = Flask(__name__)
# app.config['CORS_HEADERS'] = 'Content-Type'
# cors = CORS(app)

# # Set up Flask logging
# log = logging.getLogger('werkzeug')
# log.setLevel(logging.ERROR)
# count = 0
# count_lock = threading.Lock()

# default_sr = 22050
# model_path = "vosk-model-small-en-us-0.15"
# model = Model(model_path)
# recognizer = KaldiRecognizer(model, default_sr)

# # Queue to hold files for processing
# file_queue = Queue()

# def split_on_silence(y, sr):
#     custom_ref = 0.2
#     top_db = 20
#     intervals = librosa.effects.split(y, top_db=top_db, ref=custom_ref)
#     return intervals

# def recognizer_audio(pcm_data):
#     recognizer.AcceptWaveform(pcm_data)
#     result = recognizer.FinalResult()
#     result_dict = json.loads(result)
#     print(result_dict['text'])
#     return result_dict['text']

# array_temps = []

# @app.route('/transcribe', methods=['POST'])

# async def transcribe_audio():
#     if 'file' not in request.files:
#         return jsonify({"error": "No file part"}), 400
#     webm_file = request.files['file']
#     if webm_file:
#         global count
#         with count_lock:
#             webm_file_name = webm_file.filename.split(".")[0] + "_" + str(count) + ".webm"
#             webm_file_path = './audio/' + webm_file_name
#             os.makedirs(os.path.dirname(webm_file_path), exist_ok=True)
#             async with aiofiles.open(webm_file_path, 'wb') as f:
#                 await f.write(webm_file.read())
#             output_path = f'./audio/segment_{count}.wav'
#             count += 1
#         file_queue.put((webm_file_path, output_path))
        
#         # transcription = await process_file(webm_file_path, output_path)
#         # if transcription:
#         #     return jsonify({"transcription": transcription})
#         # else:
#         #     return jsonify({"error":"Transcription Failed"}), 500
#     return jsonify({"transcription" : "abc"})
# async def convert_wav(input_path: str, output_path: str) -> bool:
#     try:
#         command = ['ffmpeg', '-loglevel', 'error', '-i', input_path, '-c:a', 'pcm_s16le', output_path]
#         process = await asyncio.create_subprocess_exec(*command, stdout=subprocess.PIPE, stdin=subprocess.PIPE)
#         await process.communicate()
#         return True
#     except Exception as e:
#         print(f"Conversion error: {e}")
#         return False
    
# async def librosa_load_async(path: str):
#     loop = asyncio.get_event_loop()
#     return await loop.run_in_executor(None, librosa.load, path)

# def process_files():
#     while True:
#         webm_file_path, output_path = file_queue.get()
#         result = asyncio.run(process_file(webm_file_path, output_path))
#         file_queue.task_done()
#         if result:
#             return jsonify({"transcription": result})
#         else:
#             return jsonify({"error":"Transcription Failed"}), 500

# async def process_file(webm_file_path, output_path):
#     global array_temps

#     success = await convert_wav(webm_file_path, output_path)
#     if not success:
#         print(f"File conversion failed for {webm_file_path}")
#         return

#     audio_data, sr = await librosa_load_async(output_path)

#     intervals_array = split_on_silence(audio_data, sr)

#     if intervals_array.size == 0: 
#         pcm_data = b''.join([(temp * 32767).astype(np.int16).tobytes() for temp in array_temps])
#         transcription = recognizer_audio(pcm_data)
#         array_temps = []
#     else:
#         if (np.subtract(intervals_array[0][0], 0) < 500) and (np.subtract(sr, intervals_array[-1][1]) < 2000):
#             pcm_data = b''.join([(temp * 32767).astype(np.int16).tobytes() for temp in array_temps])
#             transcription = recognizer_audio(pcm_data)
#             array_temps = []
#             array_temps.append(audio_data)
#         elif (np.subtract(intervals_array[0][0], 0) > 500) and (np.subtract(sr, intervals_array[-1][1]) > 2000):
#             array_temps.append(audio_data)
#             pcm_data = b''.join([(temp * 32767).astype(np.int16).tobytes() for temp in array_temps])
#             transcription = recognizer_audio(pcm_data)
#             array_temps = []
#         else:
#             array_temps.append(audio_data)
#     print("transcription: ",transcription)
#     return transcription
    

# threading.Thread(target=process_files, daemon=True).start()
# if __name__ == '__main__':
#     app.run(host='0.0.0.0', port=3000, debug=True)

# # loi
# import subprocess
# from flask import Flask, request, jsonify
# from flask_cors import CORS
# import threading
# from vosk import Model, KaldiRecognizer
# import json
# import os
# import librosa
# import numpy as np
# import aiofiles
# import asyncio
# from queue import Queue
# import logging
# import nest_asyncio

# nest_asyncio.apply()

# app = Flask(__name__)
# app.config['CORS_HEADERS'] = 'Content-Type'
# cors = CORS(app)

# # Set up Flask logging
# log = logging.getLogger('werkzeug')
# log.setLevel(logging.ERROR)
# count = 0
# count_lock = threading.Lock()

# default_sr = 22050
# model_path = "vosk-model-small-en-us-0.15"
# model = Model(model_path)
# recognizer = KaldiRecognizer(model, default_sr)

# # Queue to hold files for processing
# file_queue = Queue()

# def split_on_silence(y, sr):
#     custom_ref = 0.2
#     top_db = 20
#     intervals = librosa.effects.split(y, top_db=top_db, ref=custom_ref)
#     return intervals

# def recognizer_audio(pcm_data):
#     recognizer.AcceptWaveform(pcm_data)
#     result = recognizer.FinalResult()
#     result_dict = json.loads(result)
#     return result_dict['text']

# array_temps = []

# @app.route('/transcribe', methods=['POST'])

# async def transcribe_audio():
#     if 'file' not in request.files:
#         return jsonify({"error": "No file part"}), 400
#     webm_file = request.files['file']
#     if webm_file:
#         global count
#         with count_lock:
#             webm_file_name = webm_file.filename.split(".")[0] + "_" + str(count) + ".webm"
#             webm_file_path = './audio/' + webm_file_name
#             os.makedirs(os.path.dirname(webm_file_path), exist_ok=True)
#             async with aiofiles.open(webm_file_path, 'wb') as f:
#                 await f.write(webm_file.read())
#             output_path = f'./audio/segment_{count}.wav'
#             count += 1
#         file_queue.put((webm_file_path, output_path))

#     result = await process_files()
#     # abc = "khong co"
#     if result:
#         print("transcribe_audio- result", result)
#         # return jsonify({"transcription": result}),200
    
#     # return jsonify({"mang rong": abc}),200

#     # return jsonify({"error": "Transcription failed"}), 500
#     return "abc"

# async def convert_wav(input_path: str, output_path: str) -> bool:
#     try:
#         command = ['ffmpeg', '-loglevel', 'error', '-i', input_path, '-c:a', 'pcm_s16le', output_path]
#         process = await asyncio.create_subprocess_exec(*command, stdout=subprocess.PIPE, stdin=subprocess.PIPE)
#         await process.communicate()
#         return True
#     except Exception as e:
#         print(f"Conversion error: {e}")
#         return False

# async def librosa_load_async(path: str):
#     loop = asyncio.get_event_loop()
#     return await loop.run_in_executor(None, librosa.load, path)

# def process_files():
#     while True:
#         webm_file_path, output_path = file_queue.get()
#         result =  process_file(webm_file_path, output_path)
#         file_queue.task_done()
#         if result:
#             return result


# async def process_file(webm_file_path, output_path):
#     global array_temps

#     success = await convert_wav(webm_file_path, output_path)
#     if not success:
#         print(f"File conversion failed for {webm_file_path}")
#         return

#     audio_data, sr = await librosa_load_async(output_path)

#     intervals_array = split_on_silence(audio_data, sr)

#     transcription = None
#     if intervals_array.size == 0:
#         pcm_data = b''.join([(temp * 32767).astype(np.int16).tobytes() for temp in array_temps])
#         transcription = recognizer_audio(pcm_data)
#         array_temps = []
#     else:
#         if (np.subtract(intervals_array[0][0], 0) < 500) and (np.subtract(sr, intervals_array[-1][1]) < 2000):
#             pcm_data = b''.join([(temp * 32767).astype(np.int16).tobytes() for temp in array_temps])
#             transcription = recognizer_audio(pcm_data)
#             array_temps = []
#             array_temps.append(audio_data)
#         elif (np.subtract(intervals_array[0][0], 0) > 500) and (np.subtract(sr, intervals_array[-1][1]) > 2000):
#             array_temps.append(audio_data)
#             pcm_data = b''.join([(temp * 32767).astype(np.int16).tobytes() for temp in array_temps])
#             transcription = recognizer_audio(pcm_data)
#             array_temps = []
#         else:
#             array_temps.append(audio_data)

#     if transcription:
#         # return transcription
#         # print("process_file", transcription)
#         return transcription


# threading.Thread(target=process_files, daemon=True).start()
# if __name__ == '__main__':
#     app.run(host='0.0.0.0', port=3000)

# import subprocess
# from flask import Flask, request, jsonify
# from flask_cors import CORS
# import threading
# from vosk import Model, KaldiRecognizer
# import json
# import os
# import librosa
# import numpy as np
# import aiofiles
# import asyncio
# from queue import Queue
# import logging

# app = Flask(__name__)
# app.config['CORS_HEADERS'] = 'Content-Type'
# cors = CORS(app)

# # Set up Flask logging
# log = logging.getLogger('werkzeug')
# log.setLevel(logging.ERROR)
# count = 0
# count_lock = threading.Lock()

# default_sr = 22050
# model_path = "vosk-model-small-en-us-0.15"
# model = Model(model_path)
# recognizer = KaldiRecognizer(model, default_sr)

# # Queue to hold files for processing
# file_queue = Queue()

# def split_on_silence(y, sr):
#     custom_ref = 0.2
#     top_db = 20
#     intervals = librosa.effects.split(y, top_db=top_db, ref=custom_ref)
#     return intervals

# def recognizer_audio(pcm_data):
#     recognizer.AcceptWaveform(pcm_data)
#     result = recognizer.FinalResult()
#     result_dict = json.loads(result)
#     print(result_dict['text'])
#     print(type(result_dict['text']))

# array_temps = []

# @app.route('/transcribe', methods=['POST'])

# async def transcribe_audio():
#     if 'file' not in request.files:
#         return jsonify({"error": "No file part"}), 400
#     webm_file = request.files['file']
#     if webm_file:
#         global count
#         with count_lock:
#             webm_file_name = webm_file.filename.split(".")[0] + "_" + str(count) + ".webm"
#             webm_file_path = './audio/' + webm_file_name
#             os.makedirs(os.path.dirname(webm_file_path), exist_ok=True)
#             async with aiofiles.open(webm_file_path, 'wb') as f:
#                 await f.write(webm_file.read())
#             output_path = f'./audio/segment_{count}.wav'
#             count += 1
#         file_queue.put((webm_file_path, output_path))
        

#         transcription = await process_file(webm_file_path, output_path)

#         if transcription:
#             return jsonify({"transcription": transcription}), 200

# async def convert_wav(input_path: str, output_path: str) -> bool:
#     try:
#         command = ['ffmpeg', '-y', '-loglevel', 'error', '-i', input_path, '-c:a', 'pcm_s16le', output_path]
#         process = await asyncio.create_subprocess_exec(*command, stdout=subprocess.PIPE, stdin=subprocess.PIPE)
#         await process.communicate()
#         return True
#     except Exception as e:
#         print(f"Conversion error: {e}")
#         return False

# async def librosa_load_async(path: str):
#     loop = asyncio.get_event_loop()
#     return await loop.run_in_executor(None, librosa.load, path)

# def process_files():
#     while True:
#         webm_file_path, output_path = file_queue.get()
#         asyncio.run(process_file(webm_file_path, output_path))
#         file_queue.task_done()

# async def process_file(webm_file_path, output_path):
#     global array_temps

#     success = await convert_wav(webm_file_path, output_path)
#     if not success:
#         print(f"File conversion failed for {webm_file_path}")
#         return

#     audio_data, sr = await librosa_load_async(output_path)

#     intervals_array = split_on_silence(audio_data, sr)

#     transcription = None
    
#     if intervals_array.size == 0:
#         pcm_data = b''.join([(temp * 32767).astype(np.int16).tobytes() for temp in array_temps])
#         transcription = recognizer_audio(pcm_data)
#         array_temps = []
#     else:
#         if (np.subtract(intervals_array[0][0], 0) < 500) and (np.subtract(sr, intervals_array[-1][1]) < 2000):
#             pcm_data = b''.join([(temp * 32767).astype(np.int16).tobytes() for temp in array_temps])
#             transcription = recognizer_audio(pcm_data)
#             array_temps = []
#             array_temps.append(audio_data)
#         elif (np.subtract(intervals_array[0][0], 0) > 500) and (np.subtract(sr, intervals_array[-1][1]) > 2000):
#             array_temps.append(audio_data)
#             pcm_data = b''.join([(temp * 32767).astype(np.int16).tobytes() for temp in array_temps])
#             transcription = recognizer_audio(pcm_data)
#             array_temps = []
#         else:
#             array_temps.append(audio_data)
    
#     return transcription

# threading.Thread(target=process_files, daemon=True).start()
# if __name__ == '__main__':
#     app.run(host='0.0.0.0', port=3000)

import subprocess
from flask import Flask, request, jsonify
from flask_cors import CORS
import threading
from vosk import Model, KaldiRecognizer
import json
import os
import librosa
import numpy as np
import aiofiles
import asyncio
from queue import Queue
import logging
from flask_socketio import SocketIO, emit

app = Flask(__name__)
app.config['CORS_HEADERS'] = 'Content-Type'
cors = CORS(app)
socketio = SocketIO(app, cors_allowed_origins="*")

# Set up Flask logging
log = logging.getLogger('werkzeug')
log.setLevel(logging.ERROR)
count = 0
count_lock = threading.Lock()

default_sr = 22050
model_path = "vosk-model-small-en-us-0.15"
model = Model(model_path)
recognizer = KaldiRecognizer(model, default_sr)

# Queue to hold files for processing
file_queue = Queue()

def split_on_silence(y, sr):
    custom_ref = 0.2
    top_db = 20
    intervals = librosa.effects.split(y, top_db=top_db, ref=custom_ref)
    return intervals

def recognizer_audio(pcm_data):
    recognizer.AcceptWaveform(pcm_data)
    result = recognizer.FinalResult()
    result_dict = json.loads(result)
    # print(result_dict['text'])
    return result_dict['text']

array_temps = []

@app.route('/transcribe', methods=['POST'])
async def transcribe_audio():
    if 'file' not in request.files:
        return jsonify({"error": "No file part"}), 400
    webm_file = request.files['file']
    if webm_file:
        global count
        with count_lock:
            webm_file_name = webm_file.filename.split(".")[0] + "_" + str(count) + ".webm"
            webm_file_path = './audio/' + webm_file_name
            os.makedirs(os.path.dirname(webm_file_path), exist_ok=True)
            async with aiofiles.open(webm_file_path, 'wb') as f:
                await f.write(webm_file.read())
            output_path = f'./audio/segment_{count}.wav'
            count += 1
        file_queue.put((webm_file_path, output_path))
        
        # transcription = await process_file(webm_file_path, output_path)
        # if transcription:
        #     return jsonify({"transcription": transcription})
        # else:
        #     return jsonify({"error":"Transcription Failed"}), 500
    return jsonify({"transcription" : "abc"})
async def convert_wav(input_path: str, output_path: str) -> bool:
    try:
        command = ['ffmpeg', '-loglevel', 'error', '-i', input_path, '-c:a', 'pcm_s16le', output_path]
        process = await asyncio.create_subprocess_exec(*command, stdout=subprocess.PIPE, stdin=subprocess.PIPE)
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
        if result : 
            socketio.emit('transcription_result', {'transcription': result})
        file_queue.task_done()

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
    print("transcription: ",transcription)
    return transcription
    
threading.Thread(target=process_files, daemon=True).start()
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=3000, debug=True)