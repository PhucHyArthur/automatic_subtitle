import subprocess
import os
from pydub import AudioSegment

audio_path = './audio'
def convert_wav(input_path: str, output_path : str) : 
    command = ['ffmpeg', '-i', input_path, '-c:a', 'pcm_f32le', output_path]
    subprocess.run(command,stdout=subprocess.DEVNULL,stdin=subprocess.DEVNULL)    

def concat_audio():
    out_file = 'concat.wav'
    combined = AudioSegment.empty()
    for i in range(11,27):
        segment = AudioSegment.from_wav(f'./audio/segment_{i+1}.wav')
        combined += segment
    combined.export(out_file, format="wav")
    
if __name__ == '__main__':
    folder = os.listdir(audio_path) 
    for i in range(len(folder)) : 
        input_count = folder[i].split(".")[0].split('_')[1]
        print("input_count : ", input_count)
        output_path = f'./audio/segment_{input_count}.wav'
        try : 
            convert_wav(f'./audio/{folder[i]}', output_path)
        except: 
            print(f"Conversion failed for {folder[i]}")
            continue
    
    # concat_audio()