from flask import Flask, request, redirect, jsonify
import requests

app = Flask(__name__)

# Your Deriv App ID
APP_ID = '76613'

# This must match the redirect URL you set in Deriv dashboard
REDIRECT_URI = 'http://127.0.0.1:5556/oauth_callback'

# OAuth URLs
AUTH_URL = f'https://oauth.deriv.com/oauth2/authorize?app_id={APP_ID}&redirect_uri={REDIRECT_URI}&response_type=code&scope=read'
TOKEN_URL = 'https://api.deriv.com/oauth2/token'

# Temporary token storage
tokens = {}

@app.route('/')
def home():
    return "Hello, this is the Flask server!"

@app.route('/login')
def login():
    return redirect(AUTH_URL)

@app.route('/oauth_callback')
def oauth_callback():
    code = request.args.get('code')
    if not code:
        return "Error: No code received", 400

    data = {
        'app_id': APP_ID,
        'grant_type': 'authorization_code',
        'code': code,
        'redirect_uri': REDIRECT_URI
    }

    response = requests.post(TOKEN_URL, data=data)

    if response.status_code == 200:
        token_data = response.json()
        tokens['access_token'] = token_data.get('access_token')
        tokens['refresh_token'] = token_data.get('refresh_token')
        return jsonify(token_data)
    else:
        return f"Error getting token: {response.text}", 400

@app.route('/status')
def status():
    if 'access_token' in tokens:
        return jsonify(tokens)
    else:
        return "No tokens saved. Login at /login", 400

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5556)
