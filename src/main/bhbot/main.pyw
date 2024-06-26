import threading
from datetime import datetime, timedelta
from bot import *
from flask import Flask, request, jsonify, Response
import queue
from flask_cors import CORS
import json
import logging
import time
import os

app = Flask(__name__)
CORS(app)

# Queue and thread to manage the bot
bot_queue = queue.Queue()
bot_thread = None
config = Config.load()
bot = BrawlhallaBot(config, Hotkeys.load(), bot_queue)

class MemoryHandler(logging.Handler):
    def __init__(self, capacity=100):
        super().__init__()
        self.capacity = capacity
        self.log_records = []

    def emit(self, record):
        try:
            message = self.format(record)
            if len(self.log_records) >= self.capacity:
                self.log_records.pop(0)
            self.log_records.append(message)
            print(message) 
        except:
            pass

    def get_logs(self):
        current_logs = self.log_records[:]
        self.log_records.clear()
        return current_logs

memory_handler = MemoryHandler()
logger.addHandler(memory_handler)

last_request_time = datetime.now()

def monitor_activity():
    global last_request_time
    while True:
        if datetime.now() - last_request_time > timedelta(seconds=1):
            print("No GET /get_logs request received in last 5 seconds, shutting down.")
            if bot_thread and bot_thread.is_alive():
                bot_queue.put_nowait('STOP')
            brawlhalla = BrawlhallaProcess.find()
            if brawlhalla:
                pythoncom.CoInitialize()
                sessions = AudioUtilities.GetAllSessions()
                for session in sessions:
                    interface = session.SimpleAudioVolume
                    if session.Process and session.Process.name() == "BrawlhallaGame.exe":
                        brawlhalla.kill()
                        interface.SetMute(0, None)
                        logger.info(f"Muted BrawlhallaGame.exe")
            os._exit(0)
        time.sleep(1)

@app.before_first_request
def initialize_bot():
    bot.config = Config.load()
    brawlhalla = BrawlhallaProcess.find()
    if brawlhalla:
        brawlhalla.kill()
    bot_thread = threading.Thread(target=bot.main_loop, daemon=True)
    bot_thread.start()

@app.route('/get_logs', methods=['GET'])
def get_logs():
    bot.config = Config.load()
    global last_request_time
    last_request_time = datetime.now()  # Update the last request time on each call
    logs = memory_handler.get_logs()
    response = Response(json.dumps(logs, ensure_ascii=False), mimetype='application/json; charset=utf-8')
    return response

if __name__ == '__main__':
    monitor_thread = threading.Thread(target=monitor_activity, daemon=True)
    monitor_thread.start()
    print("Server starting on port 30000")
    app.run(host='0.0.0.0', port=30000, debug=True)
