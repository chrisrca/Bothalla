import threading

from bot import *

from flask import Flask, request, jsonify
import threading
import queue
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# Queue and thread to manage the bot
bot_queue = queue.Queue()
bot_thread = None

class MemoryHandler(logging.Handler):
    def __init__(self, capacity=100):
        super().__init__()
        self.capacity = capacity
        self.log_records = []

    def emit(self, record):
        try:
            message = self.format(record)
            if len(self.log_records) >= self.capacity:
                self.log_records.pop(0)  # Remove the oldest record
            self.log_records.append(message)
        # except Exception as e:
            # message = f"Error formatting log: {str(e)} - Original message: {record.getMessage()}"
        except:
            pass

    def get_logs(self):
        current_logs = self.log_records[:]
        self.log_records.clear()
        return current_logs
    
memory_handler = MemoryHandler()
logger.addHandler(memory_handler)

@app.route('/toggle_bot', methods=['POST'])
def toggle_bot():
    try:
        global bot_thread
        if bot_thread and bot_thread.is_alive():
            bot_queue.put_nowait('STOP')
        else:
            config = Config.load()
            bot = BrawlhallaBot(config, Hotkeys.load(), bot_queue)
            bot_thread = threading.Thread(target=bot.main_loop, daemon=True)
            bot_thread.start()
        return jsonify({"status": "Bot toggled"})
    except Exception as e:
        logger.exception("Failed to toggle bot")
        return jsonify({"error": str(e)}), 500


@app.route('/get_logs', methods=['GET'])
def get_logs():
    logs = memory_handler.get_logs()
    return jsonify(logs)

if __name__ == '__main__':
    print(f"Server starting on port 30000")
    app.run(host='0.0.0.0', port=30000, debug=True)