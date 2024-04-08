from flask import Flask, request, render_template, jsonify
from openai import OpenAI
from gpt import generate_golf_swing_feedback

client = OpenAI(api_key='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')

app = Flask(__name__)

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/login')
def login():
    return render_template('login.html')

@app.route('/dashboard')
def dashboard():
    return render_template('dashboard.html')

@app.route('/analyze')
def analyze():
    return render_template('analyze.html')

@app.route('/get-feedback', methods=['POST'])
def get_feedback():
    user_angles = request.json['user_angles']
    pro_angles = request.json['pro_angles']

    # function fdefined in gpt.py
    feedback = generate_golf_swing_feedback(user_angles, pro_angles)
    
    return jsonify({'feedback': feedback})