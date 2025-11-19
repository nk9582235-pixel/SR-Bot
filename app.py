from flask import Flask
import os

app = Flask(__name__)

@app.route('/')
def hello_world():
    return 'Save Restricted Content Bot is running!'

@app.route('/health')
def health_check():
    return 'OK', 200

if __name__ == "__main__":
    # Get port from environment variable or default to 10000
    port = int(os.environ.get('PORT', 10000))
    app.run(host='0.0.0.0', port=port, debug=False)
