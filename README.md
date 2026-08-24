# Sirius AI – AI-Powered Emotional Wellness Companion

Sirius AI is an AI-powered emotional wellness chatbot designed to provide users with a supportive and conversational space for discussing stress, emotions, loneliness, motivation, relaxation, sleep, study-related stress, and everyday well-being.

The application combines an AI conversational assistant with wellness-focused features such as mood tracking, journaling, breathing exercises, analytics, and persistent chat history.

> **Note:** Sirius AI is designed for general emotional wellness support and is not a replacement for a qualified mental-health professional or medical advice.

---

## ✨ Features

### 🤖 AI Wellness Chatbot

Sirius AI provides natural conversational responses for topics related to:

* Stress and anxiety
* Emotional well-being
* Loneliness
* Motivation
* Relaxation
* Sleep and healthy routines
* Study and work-related stress
* Mood and self-reflection

### 💬 Chat System

* Start a new conversation
* Continue previous conversations
* View chat history
* Open previous conversations
* Delete conversations
* Maintain separate conversations using unique chat IDs

### 🔐 User Authentication

* User registration
* User login
* User logout
* User-specific data and conversations

### 🧠 Mood Tracking

Users can record their mood and track their emotional state over time.

### 📊 Mood Analytics

Mood information can be visualized to help users reflect on changes in their mood.

### 📔 Journal

Users can write personal journal entries for self-reflection.

### 🌬️ Relaxation & Breathing

The application includes relaxation and breathing-related features designed to help users take short breaks and practice calming exercises.

### 🎨 User Interface

* Responsive web interface
* Interactive chat experience
* Wellness-focused design
* Theme/settings functionality

---

## 🛠️ Technologies Used

### Frontend

* HTML5
* CSS3
* JavaScript
* Chart.js

### Backend

* Python
* Flask
* REST APIs

### Database

* SQLite

### AI

* Groq API
* Large Language Model (LLM)

### Development Tools

* Visual Studio Code
* Git
* GitHub
* Python Virtual Environment

---

## 🏗️ Project Structure

```text
sirius-ai-wellness-companion/
│
├── app.py
├── README.md
├── requirements.txt
├── .gitignore
│
├── static/
│   ├── css/
│   └── js/
│
├── templates/
│   └── index.html
│
└── ...
```

> Sensitive files such as `.env`, `.venv/`, and the local database are excluded from GitHub using `.gitignore`.

---

## ⚙️ How It Works

The application follows a simple full-stack architecture:

```text
User
  │
  ▼
Frontend
HTML + CSS + JavaScript
  │
  ▼
Flask Backend
  │
  ├── Authentication
  ├── Chat APIs
  ├── Mood APIs
  ├── Journal APIs
  └── Chat History APIs
  │
  ├──────────────► SQLite Database
  │
  └──────────────► Groq API
                         │
                         ▼
                    AI Response
                         │
                         ▼
                    User Interface
```

When a user sends a message, the frontend sends the request to the Flask backend. The backend processes the request, uses the AI model to generate a response, stores the conversation in the database, and returns the response to the frontend.

---

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/sirius-ai-wellness-companion.git
```

Move into the project directory:

```bash
cd sirius-ai-wellness-companion
```

---

### 2. Create a Virtual Environment

Create a Python virtual environment:

```bash
python -m venv .venv
```

Activate it on Windows:

```powershell
.venv\Scripts\Activate.ps1
```

---

### 3. Install Dependencies

Install the required Python packages:

```bash
pip install -r requirements.txt
```

---

## 🔑 Environment Variables

Sirius AI uses an API key to communicate with the AI service.

Create a `.env` file in the project root:

```env
GROQ_API_KEY=your_groq_api_key_here
```

The `.env` file should **never be committed to GitHub**.

The project uses environment variables so that sensitive API credentials are kept separate from the source code.

---

## ▶️ Running the Application

Start the Flask application:

```bash
python app.py
```

Then open the local address displayed by Flask in your browser.

---

## 🔒 Security

The project uses a `.gitignore` file to prevent sensitive and unnecessary files from being uploaded to GitHub.

The following files/directories are excluded:

```text
.env
.venv/
__pycache__/
*.pyc
mood.db
```

User conversations are associated with the logged-in user's account and individual chat sessions.

---

## 🎯 Project Goals

The main goals of Sirius AI are to:

* Provide an accessible AI-based wellness companion
* Help users reflect on their emotions
* Encourage healthy routines and self-reflection
* Provide a convenient conversational interface
* Demonstrate the integration of AI with a full-stack web application

---

## 🔮 Future Improvements

Possible future improvements include:

* Voice-based conversations
* Improved personalization
* More advanced mood analytics
* AI-generated wellness summaries
* Mobile application
* Notifications and reminders
* Improved security and authentication
* Cloud database integration
* Production deployment
* More advanced AI safety mechanisms

---

## ⚠️ Disclaimer

Sirius AI is an educational and wellness-focused software project.

It does not provide medical diagnosis, professional therapy, or emergency services. Users experiencing serious mental-health or medical concerns should seek help from an appropriately qualified professional.

---

## 👩‍💻 Author

**Vidya Nikam**

BSc Artificial Intelligence & Machine Learning

This project was developed as a full-stack AI application to explore the integration of conversational AI, web development, databases, and wellness-focused features.

---

## ⭐ Acknowledgements

This project uses open-source technologies and AI services including Flask, SQLite, JavaScript, Chart.js, and Groq.

If you find the project interesting, consider giving the repository a ⭐ on GitHub.
