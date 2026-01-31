# AI Resume Ranker

An AI-powered resume ranking and candidate management system built with React, FastAPI, and Firebase.

## 🚀 Features

- **Job Posting Management**: Create and manage job postings
- **Resume Upload & Processing**: Upload multiple resumes (PDF/DOCX) with automatic text extraction
- **AI-Powered Ranking**: Intelligent resume ranking using Sentence Transformers
- **Advanced Filtering**: Filter candidates by score, experience, skills, and education
- **Test Management**: Generate and manage candidate assessments with Gemini AI
- **Test Results Dashboard**: View and analyze candidate test performance
- **User Authentication**: Secure login with Firebase Authentication
- **Admin Dashboard**: Manage users and system settings

## 🛠️ Tech Stack

### Frontend
- **React** 18.x with Vite
- **React Router** for navigation
- **Axios** for API calls
- **Tailwind CSS** for styling
- **Firebase** for authentication

### Backend
- **FastAPI** (Python)
- **Firebase Admin SDK** for Firestore database
- **Google Gemini AI** for test question generation
- **Sentence Transformers** for resume ranking
- **python-docx** & **PyPDF2** for document processing

## 📋 Prerequisites

- **Node.js** 18+ and npm
- **Python** 3.9+
- **Firebase** account
- **Google Gemini API** key

## 🔧 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/sunildta/ai-resume-ranker.git
cd ai-resume-ranker
```

### 2. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Set up environment variables
cp .env.example .env
# Edit .env and add your GEMINI_API_KEY
```

### 3. Firebase Configuration

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select existing one
3. Go to **Project Settings** > **Service Accounts**
4. Click **"Generate New Private Key"**
5. Download the JSON file
6. Rename it to `firebase_key.json`
7. Place it in the `backend/` folder

### 4. Frontend Setup

```bash
# From project root
npm install

# Create Firebase config for frontend
# Edit src/firebase/firebaseConfig.js with your Firebase web app credentials
```

### 5. Firebase Web App Config

1. In Firebase Console, go to Project Settings
2. Scroll to "Your apps" section
3. Click the web icon (</>) to create a web app
4. Copy the configuration
5. Update `src/firebase/firebaseConfig.js` with your config

## 🚀 Running the Application

### Start Backend Server

```bash
cd backend
python -m uvicorn main:app --reload
```

Backend will run on: **http://localhost:8000**

### Start Frontend Development Server

```bash
# From project root
npm run dev
```

Frontend will run on: **http://localhost:5173**

## 📁 Project Structure

```
ai-resume-ranker/
├── backend/
│   ├── app/
│   │   ├── routers/          # API route handlers
│   │   └── services/         # Business logic (Gemini, etc.)
│   ├── config/               # Configuration files
│   ├── middleware/           # Request validation, CORS
│   ├── models/               # Pydantic models
│   ├── utils/                # Helper functions
│   ├── uploads/              # Uploaded resume files
│   ├── main.py               # FastAPI application
│   └── requirements.txt      # Python dependencies
│
├── src/
│   ├── components/           # Reusable React components
│   ├── contexts/             # React Context providers
│   ├── dashboard/            # Dashboard pages
│   ├── firebase/             # Firebase configuration
│   ├── pages/                # Public pages
│   └── utils/                # Utility functions
│
├── public/                   # Static assets
└── package.json              # Node dependencies
```

## 🔐 Security Notes

⚠️ **IMPORTANT**: Never commit the following files:
- `backend/firebase_key.json` - Firebase credentials
- `backend/.env` - Environment variables with API keys
- `backend/uploads/` - User-uploaded resumes

These are already excluded in `.gitignore`.

## 📝 Environment Variables

### Backend (.env)
```env
GEMINI_API_KEY=your_gemini_api_key_here
DEBUG=True
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 👤 Author

**Sunil Yadav**
- GitHub: [@sunildta](https://github.com/sunildta)

## 🙏 Acknowledgments

- Google Gemini AI for test generation
- Sentence Transformers for resume ranking
- Firebase for backend services
- React and FastAPI communities
