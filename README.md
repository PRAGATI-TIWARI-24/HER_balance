# 🌸 HerBalance: AI-Powered PCOD Management & Awareness

HerBalance is a comprehensive full-stack application designed to help users track, manage, and understand PCOD through data-driven insights and Machine Learning. Built for informed self-management, it combines a premium user interface with an intelligent backend.

## 🚀 System Architecture & Flow Control

The application follows a modern, decoupled architecture ensuring security, speed, and seamless user experience:

1. **User Interface (React + Tailwind):** Captures user data (health logs, symptoms, assessment answers) via a responsive frontend.
2. **Authentication Flow:** Passwords are securely hashed using `bcrypt` before reaching the database.
3. **API Layer (FastAPI):** Acts as the bridge, processing requests and routing data.
4. **Database (SQLite):** Securely stores user profiles and tracking history.
5. **AI Engine:** Analyzes data using a trained Machine Learning model to return real-time risk assessments.

`[User Input] ➔ [React Frontend] ➔ [FastAPI] ➔ [SQLite & Random Forest ML] ➔ [Dashboard Insights]`

## 📊 AI Insights: What Matters Most?

Our Machine Learning model analyzes various lifestyle and physical parameters to predict risk. Based on our model's feature importance analysis, factors like **BMI**, **Skin darkening**, and overall **Weight** play the most critical role, followed by Age and Weight gain.

![HerBalance Symptoms Importance](Screenshot%202026-09-22%20213232.png)

## 🛠️ Tech Stack
* **Frontend:** React.js, Tailwind CSS, Vite
* **Backend:** FastAPI, Python
* **Database:** SQLite (with `bcrypt` for password hashing)
* **Machine Learning:** Scikit-learn (Random Forest)

## ✨ Key Features
* Secure User Authentication (Login/Signup Modal)
* Interactive Assessment Form
* AI-Driven Risk Prediction
* Personalized Dashboard with Cycle Tracking & Diet Recommendations