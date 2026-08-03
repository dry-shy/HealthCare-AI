<<<<<<< HEAD
# HealthCare-AI
=======
# 🏥 HealthCare AI - Smart Health Assistant

<div align="center">

![Healthcare AI](https://img.shields.io/badge/Healthcare-AI%20Powered-00d4aa?style=for-the-badge&logo=heart&logoColor=white)
![MERN Stack](https://img.shields.io/badge/Stack-MERN-61DAFB?style=for-the-badge&logo=react&logoColor=white)

**A comprehensive AI-powered healthcare application built with the MERN stack**

</div>

---

## 🌟 Overview

HealthCare AI is a modern, full-stack healthcare application that leverages artificial intelligence to provide users with health guidance, symptom analysis, and wellness recommendations. Built with a beautiful glassmorphism UI design, it offers a seamless healthcare experience.

> ⚠️ **Disclaimer**: This application provides AI-generated health guidance only. It is NOT a substitute for professional medical advice, diagnosis, or treatment. Always consult a qualified healthcare provider for medical concerns.

---

## ✨ Features

### 📸 Photo-Based Health Analysis
- Upload photos of skin conditions, rashes, or injuries
- AI analyzes images using Hugging Face models
- Receive severity assessment (mild/moderate/urgent)
- Get personalized advice and recommendations

### 📝 Symptom Tracker
- Select from 25+ predefined symptoms or add custom ones
- Track symptom severity over time (1-10 scale)
- AI connects symptoms to possible conditions
- View symptom timeline and identify patterns

### 💬 AI Health Assistant
- Interactive chat with AI for health guidance
- Evidence-based over-the-counter medicine suggestions
- Safety warnings and drug contraindications
- Professional, empathetic responses

### 🌿 Home Remedies Database
- Natural remedies for common conditions
- Diet and lifestyle recommendations
- Hygiene tips and precautions
- AI-generated remedy suggestions

### 🏥 Nearby Hospitals Finder
- GPS-based hospital and clinic search
- Filter by distance and specialty
- Emergency contacts (108, 112)
- Integration with Google Maps (optional)

### 📊 Personal Health Dashboard
- Comprehensive health history overview
- Visual symptom timeline
- AI-generated health insights
- Export your health data

### 🔐 Privacy & Security
- Encrypted passwords with bcrypt
- JWT-based authentication
- User-controlled data sharing preferences
- Secure data deletion options

---

## 🛠️ Tech Stack

| Category | Technology |
|----------|------------|
| **Frontend** | React 18, Vite, React Router v6 |
| **Backend** | Node.js, Express.js |
| **Database** | MongoDB with Mongoose ODM |
| **AI/ML** | Hugging Face Inference API |
| **Cloud Storage** | Cloudinary (images) |
| **Maps** | Google Places API (optional) |
| **Authentication** | JWT (JSON Web Tokens) |
| **Styling** | Vanilla CSS with Glassmorphism |
| **File Upload** | Multer |

---

## 📦 Installation

### Prerequisites

- Node.js 18+ 
- MongoDB (local or MongoDB Atlas)
- Hugging Face API Token

### 1. Clone the Repository

```bash
git clone https://github.com/dry-shy/HealthCare-AI.git
cd HealthCare-AI
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Copy the environment template and configure:

```bash
cp .env.example .env
```

Edit `.env` with your credentials:

```env
# MongoDB Connection
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/healthcare

# JWT Secret (use a strong random string)
JWT_SECRET=your_super_secret_jwt_key_minimum_32_characters

# Grok API Token
GROK_TOKEN=hf_your_token_here

# Google Maps API Key (optional - for real hospital data)
GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here

# Server Configuration
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

Start the backend server:

```bash
npm run dev
```

### 3. Frontend Setup

```bash
cd ../frontend
npm install
npm run dev
```

### 4. Access the Application

| Service | URL |
|---------|-----|
| 🌐 Frontend | http://localhost:5173 |
| 🔧 Backend API | http://localhost:5000/api |
| 📋 API Health Check | http://localhost:5000/api/health |

---

## 📁 Project Structure

```
HealthCare-AI/
├── 📂 backend/
│   ├── 📂 config/
│   │   └── db.js                    # MongoDB connection
│   ├── 📂 controllers/
│   │   ├── authController.js        # User authentication
│   │   ├── healthCheckController.js # Photo analysis
│   │   ├── symptomController.js     # Symptom tracking
│   │   ├── remedyController.js      # Home remedies
│   │   ├── medicineController.js    # Medicine advice
│   │   ├── hospitalController.js    # Hospital finder
│   │   └── dashboardController.js   # Health dashboard
│   ├── 📂 middleware/
│   │   ├── authMiddleware.js        # JWT verification
│   │   ├── uploadMiddleware.js      # File upload (Multer)
│   │   └── errorMiddleware.js       # Error handling
│   ├── 📂 models/
│   │   ├── User.js                  # User schema
│   │   ├── HealthCheck.js           # Health check records
│   │   ├── SymptomRecord.js         # Symptom entries
│   │   └── Remedy.js                # Remedy database
│   ├── 📂 routes/                   # API route definitions
│   ├── 📂 services/
│   │   └── aiService.js             # Hugging Face AI integration
│   ├── 📂 uploads/                  # Uploaded images
│   ├── .env.example                 # Environment template
│   ├── server.js                    # Entry point
│   └── package.json
│
├── 📂 frontend/
│   ├── 📂 src/
│   │   ├── 📂 components/
│   │   │   └── 📂 common/           # Header, Footer, Loading
│   │   ├── 📂 context/
│   │   │   └── AuthContext.jsx      # Auth state management
│   │   ├── 📂 pages/                # Page components
│   │   ├── 📂 services/
│   │   │   └── api.js               # Axios API client
│   │   ├── 📂 styles/
│   │   │   └── index.css            # Global styles
│   │   ├── App.jsx                  # Main app component
│   │   └── main.jsx                 # React entry point
│   ├── index.html
│   └── package.json
│
├── .gitignore
└── README.md
```

---

## 🔑 API Endpoints

### 🔐 Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login user |
| GET | `/api/auth/me` | Get current user profile |
| PUT | `/api/auth/profile` | Update user profile |
| PUT | `/api/auth/password` | Change password |
| DELETE | `/api/auth/account` | Delete account |

### 📸 Health Check

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/health-check/analyze` | Analyze health photo |
| GET | `/api/health-check` | Get all health checks |
| GET | `/api/health-check/:id` | Get single health check |
| GET | `/api/health-check/stats` | Get statistics |
| DELETE | `/api/health-check/:id` | Archive health check |

### 📝 Symptoms

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/symptoms` | Create symptom record |
| GET | `/api/symptoms` | Get all symptom records |
| GET | `/api/symptoms/:id` | Get single record |
| GET | `/api/symptoms/timeline` | Get symptom timeline |
| GET | `/api/symptoms/list` | Get predefined symptoms |
| PUT | `/api/symptoms/:id` | Update record |
| DELETE | `/api/symptoms/:id` | Archive record |

### 🌿 Remedies

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/remedies` | Get all remedies |
| GET | `/api/remedies/:id` | Get single remedy |
| GET | `/api/remedies/categories` | Get remedy categories |
| GET | `/api/remedies/condition/:condition` | Get by condition |
| POST | `/api/remedies/ai` | Get AI-generated remedies |
| POST | `/api/remedies/:id/rate` | Rate a remedy |

### 💊 Medicine

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/medicine/advice` | Get medicine advice |
| POST | `/api/medicine/chat` | Chat with AI assistant |
| GET | `/api/medicine/otc` | Get OTC medicine info |
| GET | `/api/medicine/telemedicine` | Get telemedicine info |

### 🏥 Hospitals

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/hospitals/nearby` | Find nearby hospitals |
| GET | `/api/hospitals/:id` | Get hospital details |
| GET | `/api/hospitals/emergency` | Get emergency contacts |
| GET | `/api/hospitals/specialists` | Get specialist types |

### 📊 Dashboard

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/dashboard` | Get dashboard overview |
| GET | `/api/dashboard/history` | Get health history |
| GET | `/api/dashboard/insights` | Get AI insights |
| GET | `/api/dashboard/export` | Export user data |
| DELETE | `/api/dashboard/data` | Delete all data |

---

## 🔑 Getting API Keys

### Grok Token (Required)

1. Go to [Grok API](https://console.groq.com/keys)
2. Click "New token"
3. Create a token with `read` permissions
4. Add to `.env` as `Grok_TOKEN`

### Google Maps API (Optional)

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project
3. Enable **Places API**
4. Create credentials (API Key)
5. Add to `.env` as `GOOGLE_MAPS_API_KEY`

### Cloudinary (Optional - for Cloud Image Storage)

1. Go to [Cloudinary Console](https://cloudinary.com/console)
2. Sign up for a free account
3. Copy your credentials from the Dashboard:
   - Cloud Name
   - API Key
   - API Secret
4. Add to `.env`:
   ```env
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   ```

> **Note**: If Cloudinary is not configured, images will be stored locally in the `uploads/` folder.

---

## 🎨 Screenshots

<div align="center">
   
## Login Page

![Login](Login.png)

## Home Page

![Home](Home.png)

## Features
![Features](Features.png)


## Dashboard
![Dashboard](Dashboard.png)

## AI Assistant
![AI Chat](AI_Assistant.png)

## Symptom Analysis
![Symptom Analysis](SymptomTracker.png)

## Photo Analysis
![Photo Analysis](PhotoAnalysis.png)

## Hospital_Finder
![Hospital_Finder](Hospital_Finder.png)

</div>

---

## 🚀 Deployment

### Backend (Render/Railway/Heroku)

1. Set environment variables in your hosting platform
2. Build command: `npm install`
3. Start command: `node server.js`

### Frontend (Vercel/Netlify)

1. Build command: `npm run build`
2. Output directory: `dist`
3. Set `VITE_API_URL` to your backend URL

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request


---
## 👨‍💻 Author

**Diwakar**

- 🎓 B.Tech - Computer Science & Engineering
- 💻 MERN Stack Developer

### GitHub

https://github.com/dry-shy

### LinkedIn

https://www.linkedin.com/in/diwakar-yadav-0341aa29a/

---



