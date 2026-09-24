import importlib
# Load FastAPI dynamically so static analyzers do not report a missing import
# when the selected Python interpreter has not indexed site-packages yet.
fastapi = importlib.import_module("fastapi")
FastAPI = fastapi.FastAPI
Depends = fastapi.Depends
HTTPException = fastapi.HTTPException
from starlette.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pandas as pd
import joblib
import xgboost as xgb
from sqlalchemy.orm import Session
import bcrypt  # Nayi security library
import os

# Nayi libraries AI aur environment variables ke liye
import google.generativeai as genai
from dotenv import load_dotenv
from fastapi.responses import StreamingResponse

# .env file se secret keys load karne ke liye
load_dotenv(override=True)

# Database imports (Ensure your database.py is correctly set up)
from database import SessionLocal, User, AssessmentHistory

app = FastAPI(title="HerBalance Backend API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- 🔒 SECURITY: Password Encryption Setup (Updated) ---
def get_password_hash(password: str):
    # Password ko encode karke secure hash banate hain
    pwd_bytes = password.encode('utf-8')
    salt = bcrypt.gensalt()
    hashed_password = bcrypt.hashpw(pwd_bytes, salt)
    return hashed_password.decode('utf-8')

def verify_password(plain_password: str, hashed_password: str):
    # Check karte hain ki type kiya hua password database wale password se match karta hai ya nahi
    password_byte_enc = plain_password.encode('utf-8')
    hashed_password_byte_enc = hashed_password.encode('utf-8')
    return bcrypt.checkpw(password_byte_enc, hashed_password_byte_enc)


# --- 🗄️ DATABASE CONNECTION ---
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# --- 🧠 1. AI MODEL LOADING (XGBoost for Prediction) ---
print("Loading HerBalance XGBoost AI Brain...")

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
model_path = os.path.join(BASE_DIR, 'xgboost_model.pkl')

print(f"Model yahan dhoondha ja raha hai: {model_path}")

xgboost_model = joblib.load(model_path)
print("XGBoost Model loaded successfully! 🚀")


# --- 🤖 2. GENERATIVE AI SETUP (Gemini for Chat) ---
print("Setting up HerBalance AI Companion (Gemini)...")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

if not GEMINI_API_KEY:
    print("⚠️ WARNING: GEMINI_API_KEY is not set in your .env file!")
else:
    genai.configure(api_key=GEMINI_API_KEY)

# AI Companion ka dimag aur rules
system_instruction = """
You are 'HerBalance AI', a highly empathetic, professional, and knowledgeable personal health companion for women, specializing in PCOD/PCOS management and female hormonal health.

Your guidelines:
1. Tone: Warm, supportive, non-judgmental, and professional. 
2. No Medical Diagnosis: You must explicitly state that you are an AI companion, not a doctor. Never prescribe medicines.
3. Indian Context: Understand Indian dietary habits (e.g., roti, dal, paneer) and lifestyle when giving advice.
4. Concise & Actionable: Keep responses short (under 3-4 short paragraphs) and actionable. Do not use robotic or pre-programmed language.
"""

# Gemini Model Initialize
ai_companion_model = genai.GenerativeModel(
    model_name="gemini-3.6-flash",
    system_instruction=system_instruction
)


# --- 📝 SCHEMAS (Data Structures) ---
class PatientData(BaseModel):
    age: int
    weight: float
    bmi: float
    cycle_ri: int
    cycle_length: int
    weight_gain: int
    hair_growth: int
    skin_darkening: int
    hair_loss: int
    pimples: int
    fast_food: int
    reg_exercise: int

class UserCreate(BaseModel):
    name: str
    email: str
    password: str

class UserLogin(BaseModel):
    email: str
    password: str

# Naya schema chat message ke liye
class ChatMessage(BaseModel):
    message: str


# --- 🚀 API ROUTES ---

@app.get("/")
def read_root():
    return {"message": "HerBalance API is LIVE! 🌸"}

# 1. SIGNUP API
@app.post("/signup")
def create_user(user: UserCreate, db: Session = Depends(get_db)):
    existing_user = db.query(User).filter(User.email == user.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_pwd = get_password_hash(user.password)
    new_user = User(name=user.name, email=user.email, password_hash=hashed_pwd)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    return {"message": "Account created successfully! 🎉", "user_id": new_user.id}

# 2. LOGIN API
@app.post("/login")
def login_user(user: UserLogin, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.email == user.email).first()
    
    if not db_user or not verify_password(user.password, db_user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid email or password ❌")
        
    return {"message": f"Welcome back, {db_user.name}! 🌸", "user_id": db_user.id}

# 3. ML PREDICTION API (XGBoost)
@app.post("/predict")
def predict_risk(data: PatientData):
    input_df = pd.DataFrame([{
        ' Age (yrs)': data.age,
        'Weight (Kg)': data.weight,
        'BMI': data.bmi,
        'Cycle(R/I)': data.cycle_ri,
        'Cycle length(days)': data.cycle_length,
        'Weight gain(Y/N)': data.weight_gain,
        'hair growth(Y/N)': data.hair_growth,
        'Skin darkening (Y/N)': data.skin_darkening,
        'Hair loss(Y/N)': data.hair_loss,
        'Pimples(Y/N)': data.pimples,
        'Fast food (Y/N)': data.fast_food,
        'Reg.Exercise(Y/N)': data.reg_exercise
    }])

    prediction = xgboost_model.predict(input_df)[0]
    probability = xgboost_model.predict_proba(input_df)[0][1]

    return {
        "status": "success",
        "risk_flag": int(prediction),
        "probability_percentage": float(round(probability*100,2))
    }

# 4. 🤖 AI CHAT COMPANION API (Gemini LLM)
# 4. 🤖 AI CHAT COMPANION API (Word-by-Word Streaming)
@app.post("/chat")
async def ai_health_companion(chat: ChatMessage):
    if not GEMINI_API_KEY:
        raise HTTPException(status_code=500, detail="Gemini API Key is missing in backend!")
    
    # Ye generator function text ko tukdo (chunks) mein yield karega
    async def generate_stream():
        try:
            # stream=True is the real magic here!
            response = ai_companion_model.generate_content(chat.message, stream=True)
            for chunk in response:
                if chunk.text:
                    yield chunk.text
        except Exception as e:
            yield f"Error: {str(e)}"

    # Server-Sent Events (SSE) ki tarah data bhejna
    return StreamingResponse(generate_stream(), media_type="text/plain")
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=False)