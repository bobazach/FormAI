from flask import Flask, request, render_template, jsonify, redirect, url_for, flash
from gpt import generate_golf_swing_feedback
from models import db, User
# from dotenv import load_dotenv
import os

app = Flask(__name__)

# set a secret_key for running app
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY')
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///mydatabase.db'  # or another database URI
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Initialize SQLAlchemy with the Flask Application
db.init_app(app)

# Create tables in the database for all models that inherit from db.Model
with app.app_context():
    db.create_all()

# load_dotenv()
OPENAI_API_KEY = os.getenv('OPENAI_API_KEY')

@app.route('/')
def home():
    return render_template('index.html')

# @app.route('/login')
# def login():
#     return render_template('login.html')

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'GET':
        return render_template('login.html')
    elif request.method == 'POST':
        username_or_email = request.form['username']
        password = request.form['password']
        
        user = User.query.filter((User.username == username_or_email) | (User.email == username_or_email)).first()
        if user and user.check_password(password):
            # Log the user in (set up session, etc.)
            flash('Login successful! Redirecting...', 'success')
            return render_template('login.html', success='true')
        else:
            flash('Invalid username/email or password', 'error')
            return render_template('login.html')



@app.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'GET':
        return render_template('register.html', success='false')
    elif request.method == 'POST':
        email = request.form['email']
        username = request.form['username']
        password = request.form['password']

        user = User.query.filter((User.email == email) | (User.username == username)).first()
        if user:
            flash('User already exists', 'error')
            return render_template('register.html', success='false')
        
        new_user = User(email=email, username=username)
        new_user.set_password(password)
        db.session.add(new_user)
        db.session.commit()

        flash('Account created successfully! Redirecting to login...', 'success')
        return render_template('register.html', success='true')

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


if __name__ == '__main__':
    app.run(debug=True)