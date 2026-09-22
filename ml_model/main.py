from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sqlalchemy.orm import Session
import bcrypt  # Nayi security library

# Database imports
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


# --- 🧠 AI MODEL TRAINING (In-Memory) ---
print("Initializing HerBalance AI Brain...")
try:
    try:
        df = pd.read_excel('PCOS_data_without_infertility.xlsx', sheet_name="Full_new")
    except:
        df = pd.read_excel('PCOS_data_without_infertility.xlsx')
        
    selected_columns = [
        'PCOS (Y/N)', ' Age (yrs)', 'Weight (Kg)', 'BMI', 'Cycle(R/I)', 
        'Cycle length(days)', 'Weight gain(Y/N)', 'hair growth(Y/N)', 
        'Skin darkening (Y/N)', 'Hair loss(Y/N)', 'Pimples(Y/N)', 
        'Fast food (Y/N)', 'Reg.Exercise(Y/N)'
    ]
    df_app = df[selected_columns].copy()
    df_app['Fast food (Y/N)'] = df_app['Fast food (Y/N)'].fillna(df_app['Fast food (Y/N)'].mode()[0]).astype(int)
    df_app['Cycle(R/I)'] = df_app['Cycle(R/I)'].map({2: 0, 4: 1})
    
    X = df_app.drop('PCOS (Y/N)', axis=1)
    y = df_app['PCOS (Y/N)']
    
    model = RandomForestClassifier(random_state=42)
    model.fit(X, y)
    print("Model trained and loaded into memory successfully! 🚀")
except Exception as e:
    print(f"Error during training: {e}")


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


# --- 🚀 API ROUTES ---

@app.get("/")
def read_root():
    return {"message": "HerBalance API is LIVE! 🌸"}

# 1. SIGNUP API
@app.post("/signup")
def create_user(user: UserCreate, db: Session = Depends(get_db)):
    # Check if user already exists
    existing_user = db.query(User).filter(User.email == user.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Create new user securely
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

# 3. ML PREDICTION API
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

    prediction = model.predict(input_df)[0]
    probability = model.predict_proba(input_df)[0][1]

    return {
        "status": "success",
        "risk_flag": int(prediction),
        "probability_percentage": round(probability * 100, 2)
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=False)