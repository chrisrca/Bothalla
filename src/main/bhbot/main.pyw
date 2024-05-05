import threading

from bot import *

from flask import Flask, request, jsonify
import threading
import queue
import socket
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# Queue and thread to manage the bot
bot_queue = queue.Queue()
bot_thread = None

def find_free_port():
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        s.bind(('', 0))
        return s.getsockname()[1]

@app.route('/toggle_bot', methods=['POST'])
def toggle_bot():
    global bot_thread
    if bot_thread and bot_thread.is_alive():
        bot_queue.put_nowait('STOP')
    else:
        config = Config.load()
        bot = BrawlhallaBot(config, Hotkeys.load(), bot_queue)
        bot_thread = threading.Thread(target=bot.main_loop, daemon=True)
        bot_thread.start()
    return jsonify({"status": "Bot toggled"})

if __name__ == '__main__':
    port = find_free_port()
    with open('..//flask.cfg', 'w') as config_file:
        config_file.write(f"PORT={port}\n")
    print(f"Server starting on port {port}")
    app.run(host='0.0.0.0', port=port, debug=True)