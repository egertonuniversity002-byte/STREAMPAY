from fastapi import FastAPI, HTTPException, Depends, Request, Form, UploadFile, File, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, RedirectResponse
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, EmailStr
from typing import Optional, List, Dict, Any
import os
import uuid
import bcrypt
import jwt
from datetime import datetime, timedelta
import base64
import secrets
import asyncio
from urllib.parse import urlparse, quote
import json
import httpx 
from bson import ObjectId 
import re 
import logging 
from email_validator import validate_email, EmailNotValidError 
import xml.etree.ElementTree as ET

# Added for email functionality
from fastapi_mail import FastMail, MessageSchema, ConnectionConfig

from dotenv import load_dotenv
load_dotenv()   # ensures .env values are loaded

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

# Environment variables

MONGO_URL = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
JWT_SECRET = os.environ.get('JWT_SECRET', 'your-secret-key-here') # CHANGE THIS IN PRODUCTION!
BASE_URL = os.environ.get('BASE_URL', 'https://streampay-pdfq.onrender.com') # Your frontend base URL

CURRENCY_API_URL = os.environ.get('CURRENCY_API_URL', 'https://v6.exchangerate-api.com/v6/4bd219ce733e3e56dfff3e5a/latest/USD')
BASE_CURRENCY = 'USD'  # Base for the exchange rate API

# M-Pesa environment variables
MPESA_CONSUMER_KEY = os.environ.get('MPESA_CONSUMER_KEY', '')
MPESA_CONSUMER_SECRET = os.environ.get('MPESA_CONSUMER_SECRET', '')
MPESA_BUSINESS_SHORTCODE = os.environ.get('MPESA_BUSINESS_SHORTCODE', '')
MPESA_PASSKEY = os.environ.get('MPESA_PASSKEY', '')
MPESA_LIPA_NA_MPESA_SHORTCODE = os.environ.get('MPESA_LIPA_NA_MPESA_SHORTCODE', '') 
MPESA_B2C_SHORTCODE = os.environ.get('MPESA_B2C_SHORTCODE', '600991') 
MPESA_INITIATOR_NAME = os.environ.get('MPESA_INITIATOR_NAME', 'testapi') 
MPESA_SECURITY_CREDENTIAL = os.environ.get('MPESA_SECURITY_CREDENTIAL', '')

# PayPal environment variables
PAYPAL_CLIENT_ID = os.environ.get('PAYPAL_CLIENT_ID', '')
PAYPAL_CLIENT_SECRET = os.environ.get('PAYPAL_CLIENT_SECRET', '')
PAYPAL_MODE = os.environ.get('PAYPAL_MODE', 'live')  # or 'live'
PAYPAL_CURRENCY = os.environ.get('PAYPAL_CURRENCY', 'USD') 

# Pesapal environment variables
PESAPAL_CONSUMER_KEY = os.environ.get('PESAPAL_CONSUMER_KEY', '')
PESAPAL_CONSUMER_SECRET = os.environ.get('PESAPAL_CONSUMER_SECRET', '')
PESAPAL_ENVIRONMENT = os.environ.get('PESAPAL_ENVIRONMENT', 'live')  # or 'live'

# Paystack environment variables
PAYSTACK_SECRET_KEY = os.environ.get('PAYSTACK_SECRET_KEY', 'sk_test_0e11b4ffbd6f589362259934e6f55ae5cf665845')
PAYSTACK_PUBLIC_KEY = os.environ.get('PAYSTACK_PUBLIC_KEY', 'pk_test_6641f25de958f6aef729daf79c9b0f66d453d7de')

# Set Pesapal URLs based on environment
# Set Pesapal URLs based on environment
if PESAPAL_ENVIRONMENT == 'live':
    PESAPAL_BASE_URL = "https://pay.pesapal.com/v3"
else:
    PESAPAL_BASE_URL = "https://cybqa.pesapal.com/pesapalv3"

PESAPAL_AUTH_URL = f"{PESAPAL_BASE_URL}/api/Auth/RequestToken"
PESAPAL_ORDER_URL = f"{PESAPAL_BASE_URL}/api/Transactions/SubmitOrderRequest"
PESAPAL_IPN_URL = f"{PESAPAL_BASE_URL}/api/URLSetup/RegisterIPN"
PESAPAL_IPN_LIST_URL = f"{PESAPAL_BASE_URL}/api/URLSetup/GetRegisteredIPNs"
PESAPAL_STATUS_URL = f"{PESAPAL_BASE_URL}/api/Transactions/GetTransactionStatus"

BACKEND_URL = os.environ.get("BACKEND_URL", "https://official-paypal.onrender.com")




# Email configuration
conf = ConnectionConfig(
    MAIL_USERNAME=os.environ.get("MAIL_USERNAME"),
    MAIL_PASSWORD=os.environ.get("MAIL_PASSWORD"),
    MAIL_FROM=os.environ.get("MAIL_FROM"),
    MAIL_PORT=int(os.environ.get("MAIL_PORT",587)),
    MAIL_SERVER=os.environ.get("MAIL_SERVER"),
    MAIL_FROM_NAME=os.environ.get("MAIL_FROM_NAME"),
    MAIL_STARTTLS=True,
    MAIL_SSL_TLS=False,
    USE_CREDENTIALS=True,
    VALIDATE_CERTS=True
)

app = FastAPI(title="EarnPlatform API", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# MongoDB connection
mongo_client = AsyncIOMotorClient(MONGO_URL)
db = mongo_client.earnplatform

# Pydantic models
class UserRegister(BaseModel):
    email: str
    password: str
    full_name: str
    phone: str
    referral_code: Optional[str] = None
    role: Optional[str] = "user"
    preferred_currency: Optional[str] = "KES"

class UserLogin(BaseModel):
    email: str
    password: str

class PasswordResetRequest(BaseModel):
    email: str

class PasswordReset(BaseModel):
    token: str
    new_password: str

class DepositRequest(BaseModel):
    amount: float
    phone: str

class PayPalDepositRequest(BaseModel):
    amount: float

class PesapalDepositRequest(BaseModel):
    amount: float
    currency: str = "KES"
    phone: str
    first_name: str
    last_name: str
    email: str

class WithdrawalRequest(BaseModel):
    amount: float
    currency: str = "KES"
    phone: Optional[str] = None
    email: Optional[str] = None

class PaystackDepositRequest(BaseModel):
    amount: float
    email: EmailStr

class Task(BaseModel):
    title: str
    description: str
    reward: float
    type: str
    requirements: Dict[str, Any]
    media: Optional[Dict[str, Any]] = None  # e.g., {"video_url": "https://...", "image_url": "https://...", "youtube_id": "dQw4w9WgXcQ"}
    survey_questions: Optional[List[str]] = None  # Array of questions for survey tasks
    is_active: Optional[bool] = True

class TaskCompletion(BaseModel):
    task_id: str
    completion_data: Dict[str, Any]

class NotificationCreate(BaseModel):
    title: str
    message: str
    user_id: Optional[str] = None  

class UpdateWithdrawalStatus(BaseModel):
    status: str 
    reason: Optional[str] = None

class UpdateTaskStatus(BaseModel):
    is_active: bool

class WithdrawalApproval(BaseModel):
    transaction_id: str

class SpinAndWinRequest(BaseModel):
    winning_amount: float

class ClaimTeamReward(BaseModel):
    pass  # No body needed

# Utility functions
def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))

def create_jwt_token(user_id: str, email: str, role: str, is_activated: bool) -> str: 
    payload = {
        'user_id': user_id,
        'email': email,
        'role': role, 
        'is_activated': is_activated,
        'exp': datetime.utcnow() + timedelta(days=30)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm='HS256')

def verify_jwt_token(token: str) -> dict:
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=['HS256'])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

def generate_referral_code() -> str:
    return secrets.token_urlsafe(8).upper()

def json_serializable_doc(doc):
    """
    Recursively converts MongoDB ObjectId and datetime objects within a document
    or list of documents to strings for JSON serialization.
    Also renames '_id' to 'id'.
    """
    if isinstance(doc, list):
        return [json_serializable_doc(item) for item in doc]
    if isinstance(doc, dict):
        for key, value in doc.items():
            if isinstance(value, ObjectId):
                doc[key] = str(value)
            elif isinstance(value, datetime):
                doc[key] = value.isoformat()
            elif isinstance(value, dict):
                doc[key] = json_serializable_doc(value)
            elif isinstance(value, list):
                doc[key] = [json_serializable_doc(item) for item in value]
        if '_id' in doc:
            doc['id'] = str(doc.pop('_id'))
        return doc
    return doc

async def update_leg_sizes(current_id: str, leg_position: str, delta: int = 1, db_instance=None):
    """
    Recursively updates leg sizes up the binary tree.
    """
    if db_instance is None:
        db_instance = db
    
    current_user = await db_instance.users.find_one({"user_id": current_id})
    if not current_user:
        return
    
    # Update current user's leg size
    if leg_position == "left":
        await db_instance.users.update_one(
            {"user_id": current_id},
            {"$inc": {"left_leg_size": delta}}
        )
    else:
        await db_instance.users.update_one(
            {"user_id": current_id},
            {"$inc": {"right_leg_size": delta}}
        )
    
    # Recurse to parent
    parent_id = current_user.get("parent_id")
    if parent_id:
        parent_position = current_user.get("position")
        if parent_position:
            await update_leg_sizes(parent_id, parent_position, delta, db_instance)

async def trigger_binary_commissions(user_id: str, session=None, db_instance=None):
    """
    Triggers binary commissions up the tree when a user activates.
    Awards commissions to activated uplines up to 5 levels.
    """
    if db_instance is None:
        db_instance = db
    
    user = await db_instance.users.find_one({"user_id": user_id}, session=session)
    if not user or user.get("is_activated", False):
        return
    
    # Commission structure: level 1 (sponsor): 50, 2:30, 3:20, 4:10, 5:5 KES
    commissions = [50, 30, 20, 10, 5]
    
    current = user
    level = 1
    while current and current.get("parent_id") and level <= 5:
        parent_id = current["parent_id"]
        parent = await db_instance.users.find_one({"user_id": parent_id}, session=session)
        if not parent or not parent.get("is_activated", False):
            break
        
        if level - 1 < len(commissions):
            comm = commissions[level - 1]
            
            # Update parent balance, binary_earnings, and total_earned
            current_balance = float(parent.get("wallet_balance", 0))
            new_balance = current_balance + comm
            current_binary = float(parent.get("binary_earnings", 0))
            new_binary = current_binary + comm
            current_total_earned = float(parent.get("total_earned", 0))
            new_total_earned = current_total_earned + comm
            
            await db_instance.users.update_one(
                {"user_id": parent_id},
                {
                    "$set": {
                        "wallet_balance": str(new_balance),
                        "binary_earnings": str(new_binary),
                        "total_earned": str(new_total_earned)
                    }
                },
                session=session
            )
            
            # Create transaction record
            await db_instance.transactions.insert_one(
                {
                    "transaction_id": str(uuid.uuid4()),
                    "user_id": parent_id,
                    "type": "binary_commission",
                    "amount": str(comm),
                    "currency": "KES",
                    "status": "completed",
                    "description": f"Binary commission from level {level} downline activation",
                    "metadata": {"downline_id": user_id, "level": level},
                    "created_at": datetime.utcnow(),
                    "completed_at": datetime.utcnow()
                },
                session=session
            )
            
            # Create notification
            await create_notification(
                {
                    "title": "Binary Commission Earned!",
                    "message": f"You earned KES {comm:.2f} from your downline activation at level {level}",
                    "user_id": parent_id,
                    "type": "reward"
                },
                session=session,
                db_instance=db_instance
            )
        
        current = parent
        level += 1

def validate_and_format_phone(phone: str) -> str:
    """
    Validate and normalize phone number to E.164 format (+countrycode...).
    Supports all international numbers.
    """
    phone = phone.strip().replace(" ", "").replace("-", "").replace("(", "").replace(")", "")

    if not phone.startswith("+"):
        phone = "+" + phone

    if not re.match(r"^\+\d{7,15}$", phone):
        raise HTTPException(
            status_code=400,
            detail="Invalid phone number format. Use full international format like +2547xxxxxxx."
        )

    return phone


async def get_exchange_rate(from_currency: str, to_currency: str) -> float:
    """Get exchange rate from from_currency to to_currency using fixed-base cached rates (monthly refresh, fallback to saved)"""
    if from_currency == to_currency:
        return 1.0
    
    cache_id = "global_rates"
    rates_doc = await db.rates.find_one({"_id": cache_id})
    now = datetime.utcnow()
    cache_valid = rates_doc and (now - rates_doc.get('updated_at', datetime.min)) < timedelta(days=30)
    
    rates = rates_doc.get('rates', {}) if rates_doc else {}
    base = rates_doc.get('base', 'USD') if rates_doc else 'USD'
    
    # If cache valid and both currencies available, compute cross-rate
    if cache_valid and from_currency in rates and to_currency in rates:
        return rates[to_currency] / rates[from_currency]
    else:
        if not cache_valid:
            try:
                async with httpx.AsyncClient(timeout=10.0) as client:
                    response = await client.get(CURRENCY_API_URL)
                    response.raise_for_status()
                data = response.json()
                
                # Use the correct key for rates from API response
                rates = data.get('conversion_rates', {})
                base = data.get('base_code', 'USD')
                
                # Update/insert cache
                rates_doc = {
                    "_id": cache_id,
                    "base": base,
                    "rates": rates,
                    "date": data.get('time_last_update_utc'),
                    "updated_at": now
                }
                await db.rates.replace_one({"_id": cache_id}, rates_doc, upsert=True)
                logging.info("Exchange rates refreshed from API")
                
                if from_currency in rates and to_currency in rates:
                    return rates[to_currency] / rates[from_currency]
                else:
                    raise ValueError(f"One or both currencies {from_currency}/{to_currency} not supported by API")
                    
            except Exception as e:
                logging.error(f"Failed to fetch rates: {e}")
                if rates and from_currency in rates and to_currency in rates:
                    logging.warning(f"Using existing cached rates for {from_currency} to {to_currency}")
                    return rates[to_currency] / rates[from_currency]
                else:
                    logging.warning(f"Fallback rate 1.0 for unsupported {from_currency} to {to_currency}")
                    return 1.0
        else:
            # Cache valid but currencies missing: fallback
            logging.warning(f"Fallback rate 1.0 for {from_currency} to {to_currency} (not in cache)")
            return 1.0


# M-Pesa Utility Functions
async def get_mpesa_access_token():
    """Fetches M-Pesa API access token."""
    try:
        consumer_key_secret = f"{MPESA_CONSUMER_KEY}:{MPESA_CONSUMER_SECRET}"
        encoded_auth = base64.b64encode(consumer_key_secret.encode('utf-8')).decode('utf-8')
        
        async with httpx.AsyncClient() as client:
            response = await client.get(
                "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials",
                headers={"Authorization": f"Basic {encoded_auth}"}
            )
            response.raise_for_status() 
            return response.json()["access_token"]
    except httpx.HTTPStatusError as e:
        logging.error(f"M-Pesa Auth HTTP error: {e.response.status_code} - {e.response.text}")
        raise HTTPException(status_code=500, detail=f"M-Pesa authentication failed: {e.response.text}")
    except Exception as e:
        logging.error(f"M-Pesa Auth error: {e}")
        raise HTTPException(status_code=500, detail="Could not get M-Pesa access token")

async def generate_mpesa_password(timestamp: str):
    """Generates password for M-Pesa STK Push."""
    data_to_encode = f"{MPESA_LIPA_NA_MPESA_SHORTCODE}{MPESA_PASSKEY}{timestamp}"
    encoded_password = base64.b64encode(data_to_encode.encode('utf-8')).decode('utf-8')
    return encoded_password

# PayPal Utility Functions
async def get_paypal_access_token():
    """Fetches PayPal API access token."""
    try:
        client_id_secret = f"{PAYPAL_CLIENT_ID}:{PAYPAL_CLIENT_SECRET}"
        encoded_auth = base64.b64encode(client_id_secret.encode('utf-8')).decode('utf-8')
        
        paypal_auth_url = "https://api-m.sandbox.paypal.com/v1/oauth2/token" if PAYPAL_MODE == "sandbox" else "https://api-m.paypal.com/v1/oauth2/token"
        
        async with httpx.AsyncClient() as client:
            response = await client.post(
                paypal_auth_url,
                headers={
                    "Authorization": f"Basic {encoded_auth}",
                    "Content-Type": "application/x-www-form-urlencoded"
                },
                data="grant_type=client_credentials"
            )
            response.raise_for_status()
            return response.json()["access_token"]
    except httpx.HTTPStatusError as e:
        logging.error(f"PayPal Auth HTTP error: {e.response.status_code} - {e.response.text}")
        raise HTTPException(status_code=500, detail=f"PayPal authentication failed: {e.response.text}")
    except Exception as e:
        logging.error(f"PayPal Auth error: {e}")
        raise HTTPException(status_code=500, detail="Could not get PayPal access token")

# Pesapal Utility Functions
async def get_pesapal_access_token():
    """Fetches Pesapal API access token."""
    try:
        headers = {
            "Content-Type": "application/json",
            "Accept": "application/json"
        }
        
        payload = {
            "consumer_key": PESAPAL_CONSUMER_KEY,
            "consumer_secret": PESAPAL_CONSUMER_SECRET
        }
        
        async with httpx.AsyncClient() as client:
            response = await client.post(
                PESAPAL_AUTH_URL,
                json=payload,
                headers=headers
            )
            
            if response.status_code != 200:
                logging.error(f"Pesapal Auth failed: {response.status_code} - {response.text}")
                raise HTTPException(status_code=500, detail="Pesapal authentication failed")
                
            data = response.json()
            return data.get("token")
            
    except httpx.HTTPStatusError as e:
        logging.error(f"Pesapal Auth HTTP error: {e.response.status_code} - {e.response.text}")
        raise HTTPException(status_code=500, detail=f"Pesapal authentication failed: {e.response.text}")
    except Exception as e:
        logging.error(f"Pesapal Auth error: {e}")
        raise HTTPException(status_code=500, detail="Could not get Pesapal access token")

async def register_pesapal_ipn():
    """Register IPN (Instant Payment Notification) URL with Pesapal."""
    try:
        token = await get_pesapal_access_token()
        
        headers = {
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json",
            "Accept": "application/json"
        }
        
        payload = {
            "url": f"{BACKEND_URL}/api/payments/pesapal/ipn",
            "ipn_notification_type": "POST"
        }
        
        async with httpx.AsyncClient() as client:
            response = await client.post(
                PESAPAL_IPN_URL,
                json=payload,
                headers=headers
            )
            
            if response.status_code != 200:
                logging.error(f"Pesapal IPN registration failed: {response.status_code} - {response.text}")
                return None
                
            data = response.json()
            return data.get("ipn_id")
            
    except Exception as e:
        logging.error(f"Pesapal IPN registration error: {e}")
        return None

# New utility function for sending emails
async def send_email(subject: str, recipient: str, body: str):
    """Sends a generic email using the configured mail server."""
    message = MessageSchema(
        subject=subject,
        recipients=[recipient],
        body=body,
        subtype="html"
    )
    fm = FastMail(conf)
    try:
        await fm.send_message(message)
        logging.info(f"Email sent successfully to {recipient}")
    except Exception as e:
        logging.error(f"Failed to send email to {recipient}: {e}")

# Dependency to get the MongoDB database instance
async def get_db_instance():
    """Dependency to provide the MongoDB database instance."""
    return db

# Dependency to get current user
async def get_current_user(request: Request, db: AsyncIOMotorClient = Depends(get_db_instance)):
    token = request.headers.get('Authorization')
    if not token:
        raise HTTPException(status_code=401, detail="No token provided")
    
    if token.startswith('Bearer '):
        token = token[7:]
    
    payload = verify_jwt_token(token)
    user = await db.users.find_one({"user_id": payload['user_id']})
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    
    user['preferred_currency'] = user.get('preferred_currency', 'KES')
    
    # Convert string numbers from DB back to float for use in application logic
    user['wallet_balance'] = float(user.get('wallet_balance', '0.0'))
    user['activation_amount'] = float(user.get('activation_amount', '500.0'))
    user['total_earned'] = float(user.get('total_earned', '0.0'))
    user['total_withdrawn'] = float(user.get('total_withdrawn', '0.0'))
    user['referral_earnings'] = float(user.get('referral_earnings', '0.0'))
    user['task_earnings'] = float(user.get('task_earnings', '0.0'))
    user['binary_earnings'] = float(user.get('binary_earnings', '0.0'))
    user['left_leg_size'] = int(user.get('left_leg_size', 0))
    user['right_leg_size'] = int(user.get('right_leg_size', 0))
    user['parent_id'] = user.get('parent_id')
    user['position'] = user.get('position')
    user['has_spun_once'] = user.get('has_spun_once', False)
    user['left_child_id'] = user.get('left_child_id')
    user['right_child_id'] = user.get('right_child_id')
    user['team_earnings'] = float(user.get('team_earnings', '0.0'))
    user['activation_expense'] = float(user.get('activation_expense', '0.0'))
    user['activation_reward'] = float(user.get('activation_reward', '0.0'))
    user['team_reward_claimed'] = user.get('team_reward_claimed', False)

    return user

# Dependency to get current admin user
async def get_current_admin_user(current_user: dict = Depends(get_current_user)):
    if current_user.get('role') != 'admin':
        raise HTTPException(status_code=403, detail="Not authorized. Admin access required.")
    return current_user

# Auth routes
@app.post("/api/auth/register")
async def register(user_data: UserRegister):
    # Check if user already exists
    existing_user = await db.users.find_one({"email": user_data.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Check phone number
    existing_phone = await db.users.find_one({"phone": validate_and_format_phone(user_data.phone)})
    if existing_phone:
        raise HTTPException(status_code=400, detail="Phone number already registered")

    user_id = str(uuid.uuid4())
    referral_code = generate_referral_code()
    
    # Handle referral if provided
    referred_by = None
    if user_data.referral_code:
        referrer = await db.users.find_one({"referral_code": user_data.referral_code})
        if referrer:
            referred_by = referrer['user_id']
    
    # Create user document
    user_doc = {
        "user_id": user_id,
        "email": user_data.email.lower().strip(),
        "password": hash_password(user_data.password),
        "full_name": user_data.full_name.strip(),
        "phone": validate_and_format_phone(user_data.phone),
        "referral_code": referral_code,
        "referred_by": referred_by,
        "parent_id": referred_by,
        "position": None,
        "left_leg_size": 0,
        "right_leg_size": 0,
        "binary_earnings": "0.00",
        "wallet_balance": "0.00",
        "is_activated": False,
        "activation_amount": "500.00",
        "total_earned": "0.00",
        "total_withdrawn": "0.00",
        "referral_earnings": "0.00",
        "task_earnings": "0.00",
        "referral_count": 0,
        "has_spun_once": False,
        "payment_methods": {
            "mpesa": {"phone": None, "verified": False},
            "paypal": {"email": None, "verified": False},
            "pesapal": {"phone": None, "verified": False}
        },
        "security": {
            "two_factor_enabled": False,
            "last_password_change": datetime.utcnow()
        },
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow(),
        "last_login": datetime.utcnow(),
        "notifications_enabled": True,
        "communication_preferences": {
            "email": True,
            "sms": True,
            "push": True
        },
        "theme": "light",
        "role": user_data.role.lower() if user_data.role else "user",
        "preferred_currency": user_data.preferred_currency or "KES",
        "status": "active",
        "verification": {
            "email_verified": False,
            "phone_verified": False,
            "identity_verified": False
        },
        "left_child_id": None,
        "right_child_id": None,
        "team_earnings": "0.00",
        "activation_expense": "500.00",
        "activation_reward": "0.00",
        "team_reward_claimed": False
    }

    try:
        # Insert user document
        await db.users.insert_one(user_doc)

        # Handle referral
        if referred_by:
            referral_doc = {
                "referral_id": str(uuid.uuid4()),
                "referrer_id": referred_by,
                "referred_id": user_id,
                "status": "pending",
                "created_at": datetime.utcnow(),
                "activation_date": None,
                "reward_amount": "50.00",
                "currency": "KES"
            }
            await db.referrals.insert_one(referral_doc)

            # Increment referrer's referral count
            await db.users.update_one(
                {"user_id": referred_by},
                {"$inc": {"referral_count": 1}}
            )

            # Binary placement logic
            sponsor = await db.users.find_one({"user_id": referred_by})
            if sponsor:
                left_size = sponsor.get("left_leg_size", 0)
                right_size = sponsor.get("right_leg_size", 0)
                position = "left" if left_size <= right_size else "right"

                # Update new user's position
                await db.users.update_one(
                    {"user_id": user_id},
                    {"$set": {"position": position}}
                )

                # Set parent's child_id if first in leg
                child_update = {}
                if position == "left" and sponsor.get("left_child_id") is None:
                    child_update["left_child_id"] = user_id
                elif position == "right" and sponsor.get("right_child_id") is None:
                    child_update["right_child_id"] = user_id
                if child_update:
                    await db.users.update_one(
                        {"user_id": referred_by},
                        {"$set": child_update}
                    )

                # Update leg sizes up the tree
                await update_leg_sizes(referred_by, position, 1, db_instance=db)

        # Create initial wallet transaction record
        transaction_doc = {
            "transaction_id": str(uuid.uuid4()),
            "user_id": user_id,
            "type": "account_creation",
            "amount": "0.00",
            "currency": "KES",
            "status": "completed",
            "description": "Initial account creation",
            "created_at": datetime.utcnow(),
            "completed_at": datetime.utcnow()
        }
        await db.transactions.insert_one(transaction_doc)

        # Send welcome email
        welcome_email_body = f"""
        <h1>Welcome to EarnPlatform, {user_doc['full_name']}!</h1>
        <p>Thank you for registering. Your account has been created successfully.</p>
        <p>Please deposit KSH 500 to activate your account and unlock all features. You'll also receive a 30 KES reward!</p>
        """
        await send_email(
            subject="Welcome to EarnPlatform!",
            recipient=user_doc["email"],
            body=welcome_email_body
        )

    except Exception as e:
        logging.error(f"Registration failed for {user_data.email}: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Registration failed: {str(e)}"
        )

    # Generate JWT token
    token = create_jwt_token(
        user_id=user_id,
        email=user_data.email,
        role=user_doc["role"],
        is_activated=user_doc["is_activated"]
    )

    # Return response with sanitized user data
    return {
        "success": True,
        "message": "Registration successful! A welcome email has been sent. Please deposit KSH 500 to activate your account.",
        "token": token,
        "user": json_serializable_doc({
            "user_id": user_id,
            "email": user_data.email,
            "full_name": user_data.full_name,
            "referral_code": referral_code,
            "is_activated": False,
            "wallet_balance": user_doc["wallet_balance"],
            "preferred_currency": user_doc["preferred_currency"],
            "role": user_doc["role"],
            "has_spun_once": user_doc["has_spun_once"],
            "has_payment_methods": False,
            "verification_status": {
                "email": False,
                "phone": False
            }
        }),
        "next_steps": [
            "verify_email",
            "verify_phone",
            "add_payment_method",
            "make_activation_deposit"
        ]
    }
@app.post("/api/auth/login")
async def login(user_data: UserLogin):
    user = await db.users.find_one({"email": user_data.email})
    if not user or not verify_password(user_data.password, user['password']):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    # Update last login
    await db.users.update_one(
        {"user_id": user['user_id']},
        {"$set": {"last_login": datetime.utcnow()}}
    )
    
    token = create_jwt_token(user['user_id'], user['email'], user.get('role', 'user'), user.get('is_activated', False)) 
    
    # Return serializable user data
    return {
        "success": True,
        "message": "Login successful!",
        "token": token,
        "user": json_serializable_doc({
            "user_id": user['user_id'],
            "email": user['email'],
            "full_name": user['full_name'],
            "referral_code": user['referral_code'],
            "is_activated": user['is_activated'],
            "wallet_balance": user['wallet_balance'],
            "preferred_currency": user.get('preferred_currency', 'KES'),
            "theme": user.get('theme', 'light'),
            "role": user.get('role', 'user'),
            "has_spun_once": user.get('has_spun_once', False)
        })
    }

@app.post("/api/auth/request-password-reset")
async def request_password_reset(reset_request: PasswordResetRequest):
    user = await db.users.find_one({"email": reset_request.email})
    if not user:
        # Prevent user enumeration by sending a generic success message
        return JSONResponse(content={"success": True, "message": "If your email is in our system, you will receive a password reset link."})
    
    # Generate a unique, temporary token
    reset_token = secrets.token_urlsafe(32)
    token_expiration = datetime.utcnow() + timedelta(hours=1)
    
    # Store the token and expiration in the user document
    await db.users.update_one(
        {"_id": user["_id"]},
        {"$set": {"reset_token": reset_token, "reset_token_expires": token_expiration}}
    )
    
    # Construct the reset link and email body
    reset_link = f"{BASE_URL}/reset-password?token={reset_token}"
    email_body = f"""
    <h1>Password Reset Request for EarnPlatform</h1>
    <p>Hello {user['full_name']},</p>
    <p>We received a request to reset your password. If you did not make this request, please ignore this email or contact support.</p>
    <p>To reset your password, click the secure link below:</p>
    <a href="{reset_link}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Reset My Password</a>
    <p>This link expires in 1 hour for security.</p>
    <p>If the link doesn't work, copy and paste it into your browser: {reset_link}</p>
    <p>Best regards,<br>EarnPlatform Team</p>
    """
    
    await send_email(
        subject="Password Reset for Your EarnPlatform Account",
        recipient=user["email"],
        body=email_body
    )
    
    return JSONResponse(content={"success": True, "message": "If your email is in our system, you will receive a password reset link."})

@app.get("/api/auth/verify-reset-token")
async def verify_reset_token(token: str):
    """Verify if a reset token is valid before showing the form."""
    user = await db.users.find_one({
        "reset_token": token,
        "reset_token_expires": {"$gt": datetime.utcnow()}
    })
    
    if not user:
        raise HTTPException(status_code=400, detail="Invalid or expired token")
    
    return {
        "success": True,
        "valid": True,
        "expires_at": user["reset_token_expires"].isoformat(),
        "message": "Token is valid. Proceed to reset password."
    }

@app.post("/api/auth/reset-password")
async def reset_password(reset_data: PasswordReset):
    user = await db.users.find_one({
        "reset_token": reset_data.token,
        "reset_token_expires": {"$gt": datetime.utcnow()}
    })

    if not user:
        raise HTTPException(status_code=400, detail="Invalid or expired token")

    # Validate new password (basic: length, no reuse - extend as needed)
    if len(reset_data.new_password) < 8:
        raise HTTPException(status_code=400, detail="New password must be at least 8 characters")

    # Hash the new password and clear the reset token fields
    hashed_password = hash_password(reset_data.new_password)
    await db.users.update_one(
        {"_id": user["_id"]},
        {
            "$set": {
                "password": hashed_password,
                "last_password_change": datetime.utcnow()
            },
            "$unset": {"reset_token": "", "reset_token_expires": ""}
        }
    )

    # Send confirmation email
    confirm_email = f"""
    <h1>Password Reset Successful</h1>
    <p>Hello {user['full_name']},</p>
    <p>Your password has been successfully reset.</p>
    <p>You can now log in with your new password at {BASE_URL}/login.</p>
    <p>If you did not request this change, please contact support immediately.</p>
    <p>Best regards,<br>EarnPlatform Team</p>
    """
    await send_email(
        subject="Password Reset Confirmation",
        recipient=user["email"],
        body=confirm_email
    )

    return {
        "success": True,
        "message": "Password has been successfully reset. You can now log in with your new password.",
        "next_step": "login"
    }

@app.get("/api/auth/me")
async def get_current_user_info(current_user: dict = Depends(get_current_user)):
    """
    Get current user information.
    This endpoint returns the authenticated user's profile data.
    """
    try:
        # Convert user data to serializable format
        user_data = json_serializable_doc({
            "user_id": current_user['user_id'],
            "email": current_user['email'],
            "full_name": current_user['full_name'],
            "phone": current_user['phone'],
            "referral_code": current_user['referral_code'],
            "is_activated": current_user['is_activated'],
            "wallet_balance": current_user['wallet_balance'],
            "activation_amount": current_user.get('activation_amount', 500.0),
            "total_earned": current_user.get('total_earned', 0.0),
            "total_withdrawn": current_user.get('total_withdrawn', 0.0),
            "referral_earnings": current_user.get('referral_earnings', 0.0),
            "task_earnings": current_user.get('task_earnings', 0.0),
            "binary_earnings": current_user.get('binary_earnings', 0.0),
            "left_leg_size": current_user.get('left_leg_size', 0),
            "right_leg_size": current_user.get('right_leg_size', 0),
            "referral_count": current_user.get('referral_count', 0),
            "role": current_user.get('role', 'user'),
            "preferred_currency": current_user.get('preferred_currency', 'KES'),
            "theme": current_user.get('theme', 'light'),
            "has_spun_once": current_user.get('has_spun_once', False),
            "team_earnings": current_user.get('team_earnings', 0.0),
            "activation_expense": current_user.get('activation_expense', 0.0),
            "activation_reward": current_user.get('activation_reward', 0.0),
            "team_reward_claimed": current_user.get('team_reward_claimed', False),
            "created_at": current_user.get('created_at'),
            "last_login": current_user.get('last_login')
        })

        return {
            "success": True,
            "user": user_data
        }

    except Exception as e:
        logging.error(f"Error fetching current user info: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch user information: {str(e)}"
        )

# Dashboard routes
@app.get("/api/dashboard/stats")
async def get_dashboard_stats(current_user: dict = Depends(get_current_user)):
    user_id = current_user['user_id']
    preferred = current_user['preferred_currency']
    
    if preferred == "KES":
        rate = 1.0
    else:
        try:
            rate = await get_exchange_rate("KES", preferred)
        except Exception as e:
            logging.warning(f"Failed to fetch exchange rate for {preferred}: {e}. Using 1.0")
            rate = 1.0
    
    def convert_amount(amount: float) -> float:
        return round(amount * rate, 2)
    
    try:
        # Fetch all data in parallel for better performance
        transactions_task = db.transactions.find(
            {"user_id": user_id}
        ).sort("created_at", -1).limit(10).to_list(None)
        
        referrals_agg_pipeline = [
            {"$match": {"referrer_id": user_id}},
            {"$group": {
                "_id": "$status",
                "count": {"$sum": 1},
                "total_reward_for_status": {"$sum": {"$toDouble": "$reward_amount"}}
            }},
            {"$group": {
                "_id": None,
                "total_referrals": {"$sum": "$count"},
                "completed_rewards": {
                    "$sum": {
                        "$cond": [
                            {"$eq": ["$_id", "completed"]},
                            "$total_reward_for_status",
                            0
                        ]
                    }
                },
                "potential_rewards": {
                    "$sum": {
                        "$cond": [
                            {"$eq": ["$_id", "pending"]},
                            "$total_reward_for_status",
                            0
                        ]
                    }
                }
            }},
            {"$project": {
                "_id": 0,
                "total_referrals": 1,
                "total_earned": "$completed_rewards",
                "potential_earnings": "$potential_rewards",
            }}
        ]

        referrals_task = db.referrals.aggregate(referrals_agg_pipeline).to_list(None)
                # Calculate daily earnings for last 7 days (for bar graph)
        end_date = datetime.utcnow()
        start_date = end_date - timedelta(days=7)

        # Calculate weekly referral growth
        weekly_referrals_start = end_date - timedelta(days=7)
        weekly_referrals_count = await db.referrals.count_documents({
            "referrer_id": user_id,
            "created_at": {"$gte": weekly_referrals_start}
        })
        
        notifications_task = db.notifications.find(
            {"$or": [
                {"user_id": user_id},
                {"user_id": None}
            ]}
        ).sort("created_at", -1).limit(10).to_list(None)
        
        tasks_task = db.task_completions.aggregate([
            {"$match": {"user_id": user_id}},
            {"$group": {
                "_id": "$status",
                "count": {"$sum": 1},
                "total_earnings": {"$sum": {"$toDouble": "$reward_amount"}}
            }}
        ]).to_list(None)
        
        # Execute all queries concurrently
        transactions, referrals_result, notifications, tasks = await asyncio.gather(
            transactions_task,
            referrals_task,
            notifications_task,
            tasks_task
        )
        
        # Process referral result
        referral_stats = referrals_result[0] if referrals_result else {
            "total_referrals": 0,
            "total_earned": 0.0,
            "potential_earnings": 0.0,
        }
        referral_count = referral_stats.get('total_referrals', 0)
        tier = "gold" if referral_count >= 50 else \
               "silver" if referral_count >= 20 else "bronze"

        # Weekly growth percentage (referrals added this week vs total)
        weekly_growth_percentage = 0.0
        if referral_count > 0:
            growth = (referral_count - weekly_referrals_count) / referral_count * 100
            weekly_growth_percentage = round(max(growth, 0), 2)  # Positive or 0%
        elif weekly_referrals_count > 0:
            weekly_growth_percentage = 100.0  # New team growth

        referral_stats['tier'] = tier
        referral_stats['referral_code'] = current_user['referral_code']
        referral_stats['total_earned'] = convert_amount(referral_stats.get('total_earned', 0.0))
        referral_stats['potential_earnings'] = convert_amount(referral_stats.get('potential_earnings', 0.0))
        
        # Calculate weekly earnings breakdown
        weekly_breakdown_agg = await db.transactions.aggregate([
            {"$match": {
                "user_id": user_id,
                "type": {"$in": ["task", "referral_reward", "spin_and_win", "binary_commission"]},
                "status": "completed",
                "created_at": {
                    "$gte": datetime.utcnow() - timedelta(days=7)
                }
            }},
            {"$group": {
                "_id": "$type",
                "amount": {"$sum": {"$toDouble": "$amount"}}
            }},
            {"$group": {
                "_id": None,
                "breakdown": {"$push": {
                    "type": "$_id",
                    "earnings": "$amount"
                }},
                "total": {"$sum": "$amount"}
            }}
        ]).to_list(None)


        daily_agg = await db.transactions.aggregate([
            {"$match": {
                "user_id": user_id,
                "type": {"$in": ["task", "referral_reward", "spin_and_win", "binary_commission"]},
                "status": "completed",
                "created_at": {"$gte": start_date, "$lt": end_date}
            }},
            {"$group": {
                "_id": {
                    "$dateToString": {
                        "format": "%Y-%m-%d",
                        "date": "$created_at",
                        "timezone": "UTC"
                    }
                },
                "total": {"$sum": {"$toDouble": "$amount"}}
            }},
            {"$sort": {"_id": 1}},  # Oldest to newest
            {"$group": {
                "_id": None,
                "daily_totals": {"$push": "$total"},
                "dates": {"$push": "$_id"}
            }},
            {"$project": {
                "_id": 0,
                "daily_earnings": "$daily_totals"  # Array of 7 daily sums (pad with 0 if <7 days)
            }}
        ]).to_list(None)

        # Pad to 7 days if fewer (assume 0 for missing days)
        daily_result = daily_agg[0] if daily_agg else {"daily_earnings": [0.0] * 7}
        daily_earnings = daily_result.get("daily_earnings", [0.0] * 7)
        # Convert each to preferred currency
        daily_earnings_converted = [round(d * rate, 2) for d in daily_earnings]
        
        weekly_breakdown = {}
        if weekly_breakdown_agg:
            data = weekly_breakdown_agg[0]
            total = data['total']
            for item in data['breakdown']:
                weekly_breakdown[item['type']] = float(item['earnings'])
            weekly_earnings = total
        else:
            weekly_earnings = 0.0
            weekly_breakdown = {
                "task": 0.0,
                "referral_reward": 0.0,
                "spin_and_win": 0.0,
                "binary_commission": 0.0
            }
        
        # Prepare response
        response = {
            "success": True,
            "currency": preferred,
            "user": {
                "full_name": current_user['full_name'],
                "wallet_balance": convert_amount(current_user['wallet_balance']),
                "is_activated": current_user['is_activated'],
                "activation_amount": convert_amount(current_user.get('activation_amount', 500.0)),
                "activation_expense": convert_amount(current_user.get('activation_expense', 0.0)),
                "activation_reward": convert_amount(current_user.get('activation_reward', 0.0)),
                "net_activation": convert_amount(current_user.get('activation_reward', 0.0) - current_user.get('activation_expense', 0.0)),
                "total_earned": convert_amount(current_user.get('total_earned', 0.0)),
                "total_withdrawn": convert_amount(current_user.get('total_withdrawn', 0.0)),
                "referral_earnings": convert_amount(current_user.get('referral_earnings', 0.0)),
                "task_earnings": convert_amount(current_user.get('task_earnings', 0.0)),
                "binary_earnings": convert_amount(current_user.get('binary_earnings', 0.0)),
                "profit": convert_amount(current_user.get('total_earned', 0.0) - current_user.get('activation_expense', 0.0)),
                "left_leg_size": current_user.get('left_leg_size', 0),
                "right_leg_size": current_user.get('right_leg_size', 0),
                "referral_count": current_user.get('referral_count', 0),
                "referral_code": current_user['referral_code'],
                "referral_tier": tier,
                "role": current_user.get('role', 'user'),
                "has_spun_once": current_user.get('has_spun_once', False),
                "team_earnings": convert_amount(current_user.get('team_earnings', 0.0))
            },
            "analytics": {
                "weekly_earnings": weekly_earnings,
                "weekly_breakdown": weekly_breakdown,
                "daily_earnings": daily_earnings_converted,  # Array for bar graph: [day1, day2, ..., day7] in preferred_currency
                "referrals": json_serializable_doc(referral_stats),
                "tasks": {
                    "completed": next(
                        (t['count'] for t in tasks if t['_id'] == "completed"), 0),
                    "pending": next(
                        (t['count'] for t in tasks if t['_id'] == "pending"), 0),
                    "total_earnings": convert_amount(next(
                        (float(t['total_earnings']) for t in tasks if t['_id'] == "completed"), 0.0))
                },
                "weekly_growth_percentage": weekly_growth_percentage  # % growth in referrals over last week
            },
            "activity": {
                "transactions": json_serializable_doc(transactions),
                "notifications": json_serializable_doc(notifications)
            },
            "quick_actions": generate_quick_actions(current_user, rate, preferred)
        }
        
        # Add display fields to transactions
        for txn in response["activity"]["transactions"]:
            if 'amount' in txn:
                txn['display_amount'] = convert_amount(float(txn['amount']))
                txn['display_currency'] = preferred
        
        return response
        
    except Exception as e:
        logging.error(f"Failed to load dashboard for user {user_id}: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Failed to load dashboard: {str(e)}"
        )

@app.get("/api/transactions/history")
async def get_transaction_history(
    type_filter: str = Query("all", description="Filter by type: deposit, withdrawal, or all"),
    status_filter: Optional[str] = Query(None, description="Filter by status: pending, completed, failed"),
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(10, ge=1, le=50, description="Number of transactions per page"),
    current_user: dict = Depends(get_current_user)
):
    """
    Get paginated transaction history for the user.
    Supports filtering by type (deposit, withdrawal, all) and status.
    Returns transactions with date, status, method, amount, etc.
    """
    user_id = current_user['user_id']
    skip = (page - 1) * limit
    
    # Build query
    query = {"user_id": user_id}
    if type_filter != "all":
        query["type"] = type_filter
    if status_filter:
        query["status"] = status_filter
    
    # Count total for pagination
    total = await db.transactions.count_documents(query)
    
    # Fetch transactions, sorted by completed_at desc (or created_at if no completed_at)
    pipeline = [
        {"$match": query},
        {"$sort": {"completed_at": -1, "created_at": -1}},
        {"$skip": skip},
        {"$limit": limit},
        {
            "$project": {
                "_id": 0,
                "id": "$transaction_id",
                "date": {
                    "$ifNull": ["$completed_at", "$created_at"]
                },
                "status": 1,
                "method": 1,
                "amount": 1,
                "currency": 1,
                "type": 1,
                "description": 1,
                "phone": 1,
                "email": 1  # For PayPal
            }
        }
    ]
    transactions = await db.transactions.aggregate(pipeline).to_list(limit)
    
    # Serialize dates and IDs
    transactions = json_serializable_doc(transactions)
    
    return {
        "success": True,
        "transactions": transactions,
        "pagination": {
            "page": page,
            "limit": limit,
            "total": total,
            "pages": (total + limit - 1) // limit if total > 0 else 0
        },
        "filters": {
            "type": type_filter,
            "status": status_filter
        }
    }

def generate_quick_actions(user: dict, rate: float = 1.0, preferred: str = "KES") -> list:
    """Generate context-aware quick actions"""
    def convert(amount: float) -> float:
        return round(amount * rate, 2)
    
    actions = []
    
    if not user['is_activated']:
        actions.append({
            "title": "Activate Account",
            "description": f"Deposit {convert(user.get('activation_amount', 500.0)):.2f} {preferred} to activate",
            "action": "deposit",
            "priority": "high"
        })
    
    if user.get('referral_count', 0) < 5:
        actions.append({
            "title": "Earn More",
            "description": "Invite friends to earn bonuses",
            "action": "invite",
            "priority": "medium"
        })
    
    if user['wallet_balance'] >= 200.00:
        converted_balance = convert(user['wallet_balance'])
        actions.append({
            "title": "Withdraw Earnings",
            "description": f"Cash out your balance ({converted_balance:.2f} {preferred})",
            "action": "withdraw",
            "priority": "medium"
        })
    
    # Add default actions
    actions.extend([
        {
            "title": "Complete Tasks",
            "description": "Earn money by completing tasks",
            "action": "tasks",
            "priority": "low"
        },
        {
            "title": "View Tutorial",
            "description": "Learn how to maximize earnings",
            "action": "tutorial",
            "priority": "low"
        },
        {
            "title": "Transaction History",
            "description": "View your deposits and withdrawals",
            "action": "history",
            "priority": "low"
        }
    ])
    
    return actions

async def build_team_tree(user_id: str, db_instance=None, max_depth=5, current_depth=0):
    """Recursively build team tree structure up to max_depth"""
    if db_instance is None:
        db_instance = db
    if current_depth >= max_depth:
        return None

    user = await db_instance.users.find_one({"user_id": user_id}, {"password": 0, "payment_methods": 0, "security": 0, "verification": 0})
    if not user:
        return None

    # Recurse for children
    left_child = await build_team_tree(user.get("left_child_id"), db_instance, max_depth, current_depth + 1) if user.get("left_child_id") else None
    right_child = await build_team_tree(user.get("right_child_id"), db_instance, max_depth, current_depth + 1) if user.get("right_child_id") else None

    # Build node
    tree_node = json_serializable_doc({
        "user_id": user["user_id"],
        "full_name": user["full_name"],
        "email": user["email"],  # For tree view
        "left_leg_size": user.get("left_leg_size", 0),
        "right_leg_size": user.get("right_leg_size", 0),
        "position": user.get("position"),
        "is_activated": user.get("is_activated", False),
        "left_child": left_child,
        "right_child": right_child
    })

    return tree_node

# Payment routes

@app.post("/api/payments/deposit")
async def initiate_deposit(
    deposit_data: DepositRequest, 
    current_user: dict = Depends(get_current_user),
    request: Request = None
):
    """
    Initiates an M-Pesa STK Push deposit.
    """
    try:
        # Validate phone number format
        if not re.match(r'^254\d{9}$', deposit_data.phone):
            raise HTTPException(
                status_code=400,
                detail="Invalid phone format. Use 254 followed by 9 digits (e.g., 254712345678)"
            )

        # Validate amount
        amount_float = deposit_data.amount
        if not (10.00 <= amount_float <= 150000.00):
            raise HTTPException(
                status_code=400,
                detail="Amount must be between KSH 10 and KSH 150,000"
            )

        # Check for duplicate pending transactions
        existing_txn = await db.transactions.find_one({
            "user_id": current_user['user_id'],
            "phone": deposit_data.phone,
            "amount": str(amount_float),
            "status": "pending",
            "created_at": {"$gt": datetime.utcnow() - timedelta(minutes=15)}
        })

        if existing_txn:
            raise HTTPException(
                status_code=400,
                detail="Duplicate transaction detected. Please wait for previous request to complete."
            )

        # Rate limiting check
        txn_count = await db.transactions.count_documents({
            "user_id": current_user['user_id'],
            "created_at": {"$gt": datetime.utcnow() - timedelta(hours=1)}
        })

        if txn_count >= 5:
            raise HTTPException(
                status_code=429,
                detail="Too many requests. Please try again later."
            )

        # Prepare M-Pesa request
        transaction_id = str(uuid.uuid4())
        access_token = await get_mpesa_access_token()
        timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
        password = await generate_mpesa_password(timestamp)

        stk_payload = {
            "BusinessShortCode": MPESA_LIPA_NA_MPESA_SHORTCODE,
            "Password": password,
            "Timestamp": timestamp,
            "TransactionType": "CustomerPayBillOnline",
            "Amount": int(amount_float),
            "PartyA": deposit_data.phone,
            "PartyB": MPESA_LIPA_NA_MPESA_SHORTCODE,
            "PhoneNumber": deposit_data.phone,
            "CallBackURL": f"{BACKEND_URL}/api/payments/mpesa-callback", 
            "AccountReference": f"USER-{current_user['user_id']}",
            "TransactionDesc": f"Deposit for {current_user['email']}"
        }

        # Create transaction record first
        transaction_doc = {
            "transaction_id": transaction_id,
            "user_id": current_user['user_id'],
            "type": "deposit",
            "amount": str(amount_float),
            "currency": "KES",
            "phone": deposit_data.phone,
            "status": "pending",
            "method": "mpesa",
            "ip_address": request.client.host if request else None,
            "device_fingerprint": request.headers.get("User-Agent", ""),
            "payment_details": { 
                "mpesa": {
                    "checkout_request_id": None,
                    "receipt_number": None,
                    "request_payload": stk_payload
                }
            },
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }

        # Atomic operation
        async with await mongo_client.start_session() as session:
            try:
                async with session.start_transaction():
                    # Insert transaction first
                    await db.transactions.insert_one(
                        transaction_doc,
                        session=session
                    )

                    # Make M-Pesa API call
                    async with httpx.AsyncClient(timeout=30.0) as client:
                        headers = {
                            "Authorization": f"Bearer {access_token}",
                            "Content-Type": "application/json"
                        }
                        
                        response = await client.post(
                            "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest",
                            json=stk_payload,
                            headers=headers
                        )
                        response.raise_for_status()
                        mpesa_data = response.json()

                        if mpesa_data.get("ResponseCode") != "0":
                            # M-Pesa initiated failed, update transaction status
                            await db.transactions.update_one(
                                {"transaction_id": transaction_id},
                                {
                                    "$set": {
                                        "status": "failed",
                                        "completed_at": datetime.utcnow(),
                                        "error_message": mpesa_data.get("CustomerMessage", "M-Pesa request failed at initiation"),
                                        "payment_details.mpesa.raw_response": mpesa_data
                                    }
                                },
                                session=session
                            )
                            raise HTTPException(
                                status_code=400,
                                detail=mpesa_data.get("CustomerMessage", "M-Pesa request failed")
                            )

                        # Update transaction with checkout ID
                        await db.transactions.update_one(
                            {"transaction_id": transaction_id},
                            {
                                "$set": {
                                    "payment_details.mpesa.checkout_request_id": mpesa_data.get("CheckoutRequestID"),
                                    "payment_details.mpesa.raw_response": mpesa_data
                                }
                            },
                            session=session
                        )

                    await session.commit_transaction()

                    # Return success response
                    return {
                        "success": True,
                        "message": f"Payment request of KSH {deposit_data.amount} sent to {deposit_data.phone}",
                        "transaction_id": transaction_id,
                        "checkout_request_id": mpesa_data.get("CheckoutRequestID"),
                        "user_message": mpesa_data.get("CustomerMessage")
                    }

            except httpx.HTTPStatusError as e:
                await session.abort_transaction()
                error_detail = f"M-Pesa API Error: {e.response.status_code} - {e.response.text}"
                logging.error(error_detail)
                raise HTTPException(
                    status_code=502,
                    detail="Payment service temporarily unavailable"
                )

            except Exception as e:
                await session.abort_transaction()
                logging.error(f"Deposit processing error: {str(e)}", exc_info=True)
                raise HTTPException(
                    status_code=500,
                    detail="Failed to process payment request"
                )

    except HTTPException:
        raise  
    except Exception as e:
        logging.critical(f"Unexpected error in deposit: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail="An unexpected error occurred"
        )

# Paystack payment initialization endpoint
@app.post("/api/payments/paystack/deposit")
async def initiate_paystack_deposit(
    deposit_data: PaystackDepositRequest,
    current_user: dict = Depends(get_current_user),
    request: Request = None
):
    """
    Initiates a Paystack payment.
    """
    try:
        amount_kobo = int(deposit_data.amount * 100)  # Paystack expects amount in kobo
        email = deposit_data.email

        # Create unique transaction ID
        transaction_id = str(uuid.uuid4())

        # Prepare Paystack initialization payload
        paystack_payload = {
            "email": email,
            "amount": amount_kobo,
            "callback_url": f"{BASE_URL}/pages/success?payment=paystack&status=completed",
            "metadata": {
                "user_id": current_user['user_id'],
                "transaction_id": transaction_id
            }
        }

        headers = {
            "Authorization": f"Bearer {PAYSTACK_SECRET_KEY}",
            "Content-Type": "application/json"
        }

        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(
                "https://api.paystack.co/transaction/initialize",
                json=paystack_payload,
                headers=headers
            )
            response.raise_for_status()
            data = response.json()

        if not data.get("status") or not data.get("data"):
            raise HTTPException(status_code=500, detail="Failed to initialize Paystack transaction")

        authorization_url = data["data"].get("authorization_url")
        paystack_reference = data["data"].get("reference")

        if not authorization_url or not paystack_reference:
            raise HTTPException(status_code=500, detail="Invalid Paystack response")

        # Create transaction record
        transaction_doc = {
            "transaction_id": transaction_id,
            "user_id": current_user['user_id'],
            "type": "deposit",
            "amount": str(deposit_data.amount),
            "currency": "KES",  # Changed to KES for consistency with other endpoints
            "email": email,
            "status": "pending",
            "method": "paystack",
            "payment_details": {
                "paystack_reference": paystack_reference,
                "authorization_url": authorization_url,
                "raw_response": data
            },
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }

        await db.transactions.insert_one(transaction_doc)

        return {
            "success": True,
            "message": "Paystack payment initialized",
            "authorization_url": authorization_url,
            "transaction_id": transaction_id
        }

    except httpx.HTTPStatusError as e:
        logging.error(f"Paystack initialization HTTP error: {e.response.status_code} - {e.response.text}")
        raise HTTPException(status_code=502, detail="Payment service temporarily unavailable")
    except Exception as e:
        logging.error(f"Paystack initialization error: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to initialize Paystack payment")

# Paystack webhook endpoint

@app.post("/api/payments/paystack/webhook")
async def paystack_webhook(request: Request):
    """
    Handles Paystack webhook events.
    """
    try:
        # Verify Paystack signature
        paystack_signature = request.headers.get("x-paystack-signature")
        body = await request.body()

        import hmac
        import hashlib

        secret = PAYSTACK_SECRET_KEY.encode()
        computed_signature = hmac.new(secret, body, hashlib.sha512).hexdigest()

        if computed_signature != paystack_signature:
            logging.warning("Invalid Paystack webhook signature")
            return JSONResponse(status_code=400, content={"message": "Invalid signature"})

        payload = await request.json()
        event = payload.get("event")
        data = payload.get("data", {})

        if event == "charge.success":
            reference = data.get("reference")
            amount = data.get("amount")  # in kobo
            email = data.get("customer", {}).get("email")
            metadata = data.get("metadata", {})
            user_id = metadata.get("user_id")
            transaction_id = metadata.get("transaction_id")

            if not reference or not user_id or not transaction_id:
                logging.error("Missing reference or user_id or transaction_id in Paystack webhook")
                return JSONResponse(status_code=400, content={"message": "Missing data"})

            # Find transaction
            transaction = await db.transactions.find_one({"transaction_id": transaction_id, "status": "pending", "payment_details.paystack_reference": reference})

            if not transaction:
                logging.warning(f"Transaction not found or already processed for Paystack reference: {reference}")
                return JSONResponse(status_code=200, content={"message": "Transaction not found or already processed"})

            amount_float = amount / 100.0  # convert kobo to ksh

            # Update transaction status
            await db.transactions.update_one(
                {"_id": transaction["_id"]},
                {
                    "$set": {
                        "status": "completed",
                        "completed_at": datetime.utcnow(),
                        "amount": str(amount_float),
                        "email": email,
                        "payment_details.paystack_webhook": payload
                    }
                }
            )

            # Update user wallet balance and total earned
            user = await db.users.find_one({"user_id": user_id})
            if user:
                current_wallet_balance = float(user.get('wallet_balance', '0.0'))
                new_wallet_balance = current_wallet_balance + amount_float
                current_total_earned = float(user.get('total_earned', '0.0'))
                new_total_earned = current_total_earned + amount_float

                await db.users.update_one(
                    {"user_id": user_id},
                    {
                        "$set": {
                            "wallet_balance": str(new_wallet_balance),
                            "total_earned": str(new_total_earned),
                            "payment_methods.paystack.email": email,
                            "payment_methods.paystack.verified": True
                        }
                    }
                )

                # Check activation and process referrals
                if not user.get("is_activated", False) and new_wallet_balance >= float(user.get("activation_amount", 500.0)):
                    await db.users.update_one(
                        {"user_id": user_id},
                        {"$set": {"is_activated": True}}
                    )
                    logging.info(f"User {user_id} activated via Paystack deposit.")

                    # Trigger binary commissions
                    await trigger_binary_commissions(user_id)

                    if user.get("referred_by"):
                        await process_referral_reward(
                            referred_id=user_id,
                            referrer_id=user.get("referred_by")
                        )

                # Create notification
                await create_notification(
                    {
                        "title": "Deposit Received",
                        "message": f"KSH {amount_float:,.2f} deposited to your account via Paystack",
                        "user_id": user_id,
                        "type": "payment"
                    }
                )

            logging.info(f"✅ Successful Paystack deposit: {user_id} - NGN {amount_float}")

        return JSONResponse(status_code=200, content={"message": "Webhook received"})

    except Exception as e:
        logging.error(f"Paystack webhook error: {str(e)}", exc_info=True)
        return JSONResponse(status_code=500, content={"message": "Internal server error"})

@app.post("/api/payments/mpesa-callback")
async def mpesa_callback(request: Request):
    """
    M-Pesa Callback Handler
    """
    try:
        data = await request.json()
        logging.info(f"MPesa Callback Received: {json.dumps(data)}")

        if not data.get("Body", {}).get("stkCallback"):
            logging.error("Invalid M-Pesa callback format: Missing Body.stkCallback")
            return JSONResponse(
                {"ResultCode": 1, "ResultDesc": "Invalid callback format"},
                status_code=400
            )

        callback = data["Body"]["stkCallback"]
        
        checkout_id = callback.get("CheckoutRequestID")
        result_code = int(callback.get("ResultCode", 1))
        result_desc = callback.get("ResultDesc", "Unknown error")

        if not checkout_id:
            logging.error(f"Missing CheckoutRequestID in M-Pesa callback: {callback}")
            return JSONResponse(
                {"ResultCode": 1, "ResultDesc": "Missing CheckoutRequestID"},
                status_code=400
            )

        async with await mongo_client.start_session() as session:
            try:
                async with session.start_transaction():
                    # Find transaction
                    transaction = await db.transactions.find_one(
                        {
                            "payment_details.mpesa.checkout_request_id": checkout_id,
                            "status": "pending"
                        },
                        session=session
                    )

                    if not transaction:
                        logging.warning(f"Transaction not found or already processed for CheckoutRequestID: {checkout_id}")
                        await session.commit_transaction()
                        return JSONResponse(
                            {"ResultCode": 0, "ResultDesc": "Transaction not found or already processed"}
                        )

                    # Handle success/failure
                    if result_code == 0:  # Success
                        metadata_items = callback.get("CallbackMetadata", {}).get("Item", [])
                        metadata = {item["Name"]: item["Value"] for item in metadata_items if "Name" in item}
                        
                        callback_amount_raw = metadata.get("Amount")
                        mpesa_receipt_number = metadata.get("MpesaReceiptNumber")
                        phone_number = metadata.get("PhoneNumber")

                        if not callback_amount_raw or not mpesa_receipt_number or not phone_number:
                            logging.error(f"Missing essential metadata for successful M-Pesa callback: {callback}")
                            await db.transactions.update_one(
                                {"_id": transaction["_id"]},
                                {
                                    "$set": {
                                        "status": "failed",
                                        "completed_at": datetime.utcnow(),
                                        "metadata.error": "Missing essential callback metadata",
                                        "payment_details.mpesa.raw_callback": data 
                                    }
                                },
                                session=session
                            )
                            await create_notification(
                                {
                                    "title": "Deposit Failed (Data Missing)",
                                    "message": f"Your deposit of KES {transaction['amount']} failed due to missing transaction details. Contact support.",
                                    "user_id": transaction["user_id"],
                                    "type": "payment"
                                },
                                session=session,
                                db_instance=db
                            )
                            await session.commit_transaction()
                            return JSONResponse({"ResultCode": 1, "ResultDesc": "Missing callback metadata"})

                        callback_amount = float(callback_amount_raw)
                        
                        # Ensure the amounts match to prevent fraud
                        if not (float(transaction["amount"]) - 0.01 <= callback_amount <= float(transaction["amount"]) + 0.01):
                            logging.warning(f"Amount mismatch for {checkout_id}. Expected {transaction['amount']}, got {callback_amount}. Marking as failed.")
                            await db.transactions.update_one(
                                {"_id": transaction["_id"]},
                                {
                                    "$set": {
                                        "status": "failed",
                                        "completed_at": datetime.utcnow(),
                                        "metadata.error": "Amount mismatch",
                                        "payment_details.mpesa.raw_callback": data 
                                    }
                                },
                                session=session
                            )
                            await create_notification(
                                {
                                    "title": "Deposit Failed (Amount Mismatch)",
                                    "message": f"Your deposit of KES {transaction['amount']} failed due to amount mismatch.",
                                    "user_id": transaction["user_id"],
                                    "type": "payment"
                                },
                                session=session,
                                db_instance=db
                            )
                            await session.commit_transaction()
                            return JSONResponse({"ResultCode": 1, "ResultDesc": "Amount Mismatch"})


                        amount_to_credit = callback_amount

                        # Update transaction
                        await db.transactions.update_one(
                            {"_id": transaction["_id"]},
                            {
                                "$set": {
                                    "status": "completed",
                                    "completed_at": datetime.utcnow(),
                                    "payment_details.mpesa.receipt_number": mpesa_receipt_number,
                                    "amount": str(amount_to_credit),
                                    "phone": phone_number, 
                                    "payment_details.mpesa.raw_callback": data 
                                }
                            },
                            session=session
                        )

                        # Update user balance and total earned
                        user = await db.users.find_one({"user_id": transaction["user_id"]}, session=session)
                        if user:
                            current_wallet_balance = float(user.get('wallet_balance', '0.0'))
                            new_wallet_balance = current_wallet_balance + amount_to_credit
                            current_total_earned = float(user.get('total_earned', '0.0'))
                            new_total_earned = current_total_earned + amount_to_credit

                            await db.users.update_one(
                                {"user_id": transaction["user_id"]},
                                {
                                    "$set": {
                                        "wallet_balance": str(new_wallet_balance),
                                        "total_earned": str(new_total_earned),
                                        "payment_methods.mpesa.phone": phone_number,
                                        "payment_methods.mpesa.verified": True
                                    }
                                },
                                session=session
                            )
                        user = await db.users.find_one({"user_id": transaction["user_id"]}, session=session)

                        # Check activation and process referrals
                        if user and not user["is_activated"] and float(user["wallet_balance"]) >= float(user["activation_amount"]):
                            await db.users.update_one(
                                {"user_id": user["user_id"]},
                                {"$set": {"is_activated": True}},
                                session=session
                            )
                            logging.info(f"User {user['user_id']} activated via M-Pesa deposit.")
                            
                            # Trigger binary commissions
                            await trigger_binary_commissions(user["user_id"], session=session)
                            
                            if user.get("referred_by"):
                                await process_referral_reward(
                                    referred_id=user["user_id"],
                                    referrer_id=user["referred_by"],
                                    session=session
                                )

                        # Create notification
                        await create_notification(
                            {
                                "title": "Deposit Received",
                                "message": f"KES {amount_to_credit:,.2f} deposited to your account. Receipt: {mpesa_receipt_number}",
                                "user_id": transaction["user_id"],
                                "type": "payment"
                            },
                            session=session,
                            db_instance=db
                        )

                        logging.info(f"✅ Successful M-Pesa deposit: {transaction['user_id']} - KES {amount_to_credit}")

                    else:  # Failure or Cancellation
                        await db.transactions.update_one(
                            {"_id": transaction["_id"]},
                            {
                                "$set": {
                                    "status": "failed",
                                    "completed_at": datetime.utcnow(),
                                    "error_message": result_desc,
                                    "payment_details.mpesa.raw_callback": data 
                                }
                            },
                            session=session
                        )

                        await create_notification(
                            {
                                "title": "Deposit Failed",
                                "message": f"M-Pesa deposit of KES {transaction['amount']} failed: {result_desc}",
                                "user_id": transaction["user_id"],
                                "type": "payment"
                            },
                            session=session,
                            db_instance=db
                        )

                        logging.warning(f"❌ Failed M-Pesa deposit: {transaction['user_id']} - {result_desc}")

                    await session.commit_transaction()

            except Exception as e:
                await session.abort_transaction()
                logging.error(f"Error in M-Pesa callback transaction for CheckoutRequestID {checkout_id}: {str(e)}", exc_info=True)
                return JSONResponse(
                    {"ResultCode": 1, "ResultDesc": "Internal Server Error"},
                    status_code=500 
                )

        return JSONResponse({"ResultCode": 0, "ResultDesc": "Success"}) 

    except json.JSONDecodeError:
        logging.error("Invalid JSON received in M-Pesa callback")
        return JSONResponse(
            {"ResultCode": 1, "ResultDesc": "Invalid JSON"},
            status_code=400
        )
    except Exception as e:
        logging.critical(f"Critical error processing M-Pesa callback: {str(e)}", exc_info=True)
        return JSONResponse(
            {"ResultCode": 1, "ResultDesc": "Internal server error"},
            status_code=500
        )

async def process_referral_reward(referred_id: str, referrer_id: str, session=None):
    """Process referral reward with fraud checks"""
    try:
        # Get referral record
        referral = await db.referrals.find_one(
            {
                "referred_id": referred_id,
                "referrer_id": referrer_id,
                "status": "pending"
            },
            session=session
        )

        if not referral:
            logging.info(f"No pending referral found for referred_id: {referred_id}, referrer_id: {referrer_id}")
            return False

        reward_amount = float(referral["reward_amount"])

        # Reward referrer
        user = await db.users.find_one({"user_id": referrer_id}, session=session)
        if user:
            current_wallet_balance = float(user.get('wallet_balance', '0.0'))
            new_wallet_balance = current_wallet_balance + reward_amount
            current_referral_earnings = float(user.get('referral_earnings', '0.0'))
            new_referral_earnings = current_referral_earnings + reward_amount
            current_total_earned = float(user.get('total_earned', '0.0'))
            new_total_earned = current_total_earned + reward_amount

            await db.users.update_one(
                {"user_id": referrer_id},
                {
                    "$set": {
                        "wallet_balance": str(new_wallet_balance),
                        "referral_earnings": str(new_referral_earnings),
                        "total_earned": str(new_total_earned)
                    }
                },
                session=session
            )

        # Update referral status
        await db.referrals.update_one(
            {"_id": referral["_id"]},
            {
                "$set": {
                    "status": "completed",
                    "completed_at": datetime.utcnow()
                }
            },
            session=session
        )

        # Create reward transaction
        await db.transactions.insert_one(
            {
                "transaction_id": str(uuid.uuid4()),
                "user_id": referrer_id,
                "type": "referral_reward",
                "amount": str(reward_amount),
                "currency": "KES",
                "status": "completed",
                "metadata": {
                    "referred_user_id": referred_id,
                    "referral_id": referral["referral_id"]
                },
                "created_at": datetime.utcnow(),
                "completed_at": datetime.utcnow()
            },
            session=session
        )

        # Create notification for referrer
        await create_notification(
            {
                "title": "Referral Reward!",
                "message": f"You earned KES {reward_amount:,.2f} from a successful referral!",
                "user_id": referrer_id,
                "type": "reward"
            },
            session=session,
            db_instance=db
        )

        logging.info(f"🎉 Referral reward processed: {referrer_id} -> {referred_id} for KES {reward_amount}")
        return True

    except Exception as e:
        logging.error(f"Referral processing error for {referred_id} by {referrer_id}: {str(e)}", exc_info=True)
        return False

async def create_notification(
    notification_data: dict,
    session=None,
    db_instance: AsyncIOMotorClient = None
):
    """Enhanced notification system"""
    try:
        if db_instance is None:
            db_instance = db

        notification_doc = {
            "notification_id": str(uuid.uuid4()),
            "title": notification_data['title'],
            "message": notification_data['message'],
            "user_id": notification_data.get('user_id'), 
            "type": notification_data.get('type', 'system'),
            "priority": notification_data.get('priority', 'medium'),
            "is_read": False,
            "action_url": notification_data.get('action_url'),
            "expires_at": datetime.utcnow() + timedelta(days=30),
            "metadata": notification_data.get('metadata', {}),
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }

        if session:
            await db_instance.notifications.insert_one(notification_doc, session=session)
        else:
            await db_instance.notifications.insert_one(notification_doc)

        logging.info(f"Notification created for user {notification_data.get('user_id', 'All')}: {notification_data['title']}")
        return notification_doc

    except Exception as e:
        logging.error(f"Notification creation failed: {str(e)}", exc_info=True)
        raise

# Pesapal Payment Routes
@app.post("/api/payments/pesapal/deposit")
async def initiate_pesapal_deposit(
    deposit_data: PesapalDepositRequest,
    current_user: dict = Depends(get_current_user)
):
    """
    Initiates a Pesapal payment request.
    """
    try:
        # Validate amount
        amount_float = deposit_data.amount
        if amount_float < 10.00:
            raise HTTPException(
                status_code=400,
                detail="Minimum deposit amount is KSH 10.00"
            )

        # Get Pesapal access token
        access_token = await get_pesapal_access_token()
        if not access_token:
            raise HTTPException(
                status_code=500,
                detail="Failed to authenticate with Pesapal"
            )

        # Register IPN if not already registered
        ipn_id = await register_pesapal_ipn()
        if not ipn_id:
            logging.warning("Failed to register Pesapal IPN, proceeding without IPN")

        # Create unique transaction ID
        transaction_id = str(uuid.uuid4())
        description = f"Deposit for {current_user['full_name']}"

        # Prepare Pesapal order request
        order_payload = {
            "id": transaction_id,
            "currency": "KES",
            "amount": amount_float,
            "description": description,
            "callback_url": f"{BASE_URL}/pages/success?payment=pesapal&status=completed",
            "notification_id": ipn_id,
            "billing_address": {
                "email_address": deposit_data.email,
                "phone_number": deposit_data.phone,
                "country_code": "KE",
                "first_name": deposit_data.first_name,
                "last_name": deposit_data.last_name
            }
        }

        headers = {
            "Authorization": f"Bearer {access_token}",
            "Content-Type": "application/json",
            "Accept": "application/json"
        }

        # Submit order to Pesapal
        async with httpx.AsyncClient() as client:
            response = await client.post(
                PESAPAL_ORDER_URL,
                json=order_payload,
                headers=headers
            )

            if response.status_code != 200:
                logging.error(f"Pesapal order submission failed: {response.status_code} - {response.text}")
                raise HTTPException(
                    status_code=500,
                    detail="Failed to create Pesapal order"
                )

            order_response = response.json()
            redirect_url = order_response.get("redirect_url")
            order_tracking_id = order_response.get("order_tracking_id")

            if not redirect_url:
                raise HTTPException(
                    status_code=500,
                    detail="No redirect URL received from Pesapal"
                )

        # Create transaction record
        transaction_doc = {
            "transaction_id": transaction_id,
            "user_id": current_user['user_id'],
            "type": "deposit",
            "amount": str(amount_float),
            "currency": "KES",
            "phone": deposit_data.phone,
            "status": "pending",
            "method": "pesapal",
            "payment_details": {
                "pesapal": {
                    "order_tracking_id": order_tracking_id,
                    "redirect_url": redirect_url,
                    "ipn_id": ipn_id,
                    "order_payload": order_payload
                }
            },
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }

        await db.transactions.insert_one(transaction_doc)

        return {
            "success": True,
            "message": "Pesapal payment initiated",
            "transaction_id": transaction_id,
            "redirect_url": redirect_url,
            "order_tracking_id": order_tracking_id
        }

    except httpx.HTTPStatusError as e:
        logging.error(f"Pesapal HTTP error: {e.response.status_code} - {e.response.text}")
        raise HTTPException(
            status_code=500,
            detail="Payment service temporarily unavailable"
        )
    except Exception as e:
        logging.error(f"Pesapal deposit error: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail="An unexpected error occurred"
        )

@app.get("/api/payments/pesapal/status/{order_tracking_id}")
async def check_pesapal_status(
    order_tracking_id: str,
    current_user: dict = Depends(get_current_user)
):
    """
    Check the status of a Pesapal transaction.
    """
    try:
        # Find the transaction
        transaction = await db.transactions.find_one({
            "payment_details.pesapal.order_tracking_id": order_tracking_id,
            "user_id": current_user['user_id']
        })

        if not transaction:
            raise HTTPException(status_code=404, detail="Transaction not found")

        # Get Pesapal access token
        access_token = await get_pesapal_access_token()
        if not access_token:
            raise HTTPException(
                status_code=500,
                detail="Failed to authenticate with Pesapal"
            )

        # Check status with Pesapal
        headers = {
            "Authorization": f"Bearer {access_token}",
            "Content-Type": "application/json",
            "Accept": "application/json"
        }

        params = {
            "orderTrackingId": order_tracking_id
        }

        async with httpx.AsyncClient() as client:
            response = await client.get(
                PESAPAL_STATUS_URL,
                params=params,
                headers=headers
            )

            if response.status_code != 200:
                logging.error(f"Pesapal status check failed: {response.status_code} - {response.text}")
                raise HTTPException(
                    status_code=500,
                    detail="Failed to check payment status"
                )

            status_data = response.json()
            payment_status = status_data.get("status")
            payment_method = status_data.get("payment_method")

            # Update transaction status if it has changed
            if payment_status != transaction['status']:
                await db.transactions.update_one(
                    {"_id": transaction["_id"]},
                    {
                        "$set": {
                            "status": payment_status.lower(),
                            "updated_at": datetime.utcnow(),
                            "payment_details.pesapal.status_response": status_data
                        }
                    }
                )

                # If payment is completed, update user balance
                if payment_status.upper() == "COMPLETED":
                    amount_float = float(transaction['amount'])
                    
                    # Update user balance
                    await db.users.update_one(
                        {"user_id": current_user['user_id']},
                        {
                            "$inc": {
                                "wallet_balance": str(amount_float),
                                "total_earned": str(amount_float)
                            },
                            "$set": {
                                "payment_methods.pesapal.phone": transaction['phone'],
                                "payment_methods.pesapal.verified": True
                            }
                        }
                    )

                    # Check if this activates the user
                    user = await db.users.find_one({"user_id": current_user['user_id']})
                    if user and not user['is_activated'] and float(user['wallet_balance']) >= float(user['activation_amount']):
                        activation_kes = float(user["activation_amount"])
                        reward_kes = 30.0
                        net_balance = float(user["wallet_balance"]) - activation_kes + reward_kes

                        await db.users.update_one(
                            {"user_id": current_user['user_id']},
                            {
                                "$inc": {
                                    "wallet_balance": -activation_kes + reward_kes,
                                    "activation_expense": activation_kes,
                                    "activation_reward": reward_kes
                                },
                                "$set": {"is_activated": True}
                            }
                        )
                        logging.info(f"User {current_user['user_id']} activated via Pesapal. Expense: {activation_kes} KES, Reward: {reward_kes} KES")

                        # Trigger binary commissions
                        await trigger_binary_commissions(current_user['user_id'])
                        
                        # Process referral if exists
                        if user.get("referred_by"):
                            await process_referral_reward(
                                referred_id=user["user_id"],
                                referrer_id=user["referred_by"]
                            )

                        # Notification and email
                        await create_notification(
                            {
                                "title": "Account Activated!",
                                "message": f"Congratulations! Your account is activated. Activation expense: {activation_kes} KES deducted, reward: {reward_kes} KES added. Net: {reward_kes} KES.",
                                "user_id": current_user['user_id'],
                                "type": "reward"
                            },
                            db_instance=db
                        )

                        await send_email(
                            subject="Account Activated - Welcome Reward!",
                            recipient=user["email"],
                            body=f"""
                            <h1>Congratulations, {user['full_name']}!</h1>
                            <p>Your account has been successfully activated.</p>
                            <p>Activation expense of {activation_kes} KES was deducted from your deposit, and a {reward_kes} KES reward has been added to your wallet.</p>
                            <p>Net balance after activation: {reward_kes} KES.</p>
                            <p>You can now access all features, including tasks and commissions!</p>
                            """
                        )

                    # Create notification
                    await create_notification({
                        "title": "Deposit Received",
                        "message": f"KES {amount_float:,.2f} deposited to your account via Pesapal",
                        "user_id": current_user['user_id'],
                        "type": "payment"
                    })

        return {
            "success": True,
            "status": payment_status,
            "payment_method": payment_method,
            "transaction_id": transaction['transaction_id']
        }

    except Exception as e:
        logging.error(f"Pesapal status check error: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail="Failed to check payment status"
        )

@app.post("/api/payments/pesapal/ipn")
async def handle_pesapal_ipn(request: Request):
    """
    Handle Pesapal IPN (Instant Payment Notification) callbacks.
    Fixed to update balances as strings instead of using $inc.
    """
    try:
        # Parse JSON payload (Pesapal v3)
        body = await request.json()
        logging.info(f"Pesapal IPN received: {body}")

        order_tracking_id = body.get("OrderTrackingId")
        order_notification_type = body.get("OrderNotificationType")
        order_merchant_reference = body.get("OrderMerchantReference")

        if order_notification_type in ["CHANGE", "IPNCHANGE"]:
            transaction = await db.transactions.find_one({
                "payment_details.pesapal.order_tracking_id": order_tracking_id
            })

            if transaction:
                access_token = await get_pesapal_access_token()
                if access_token:
                    headers = {
                        "Authorization": f"Bearer {access_token}",
                        "Content-Type": "application/json",
                        "Accept": "application/json"
                    }
                    params = {"orderTrackingId": order_tracking_id}

                    async with httpx.AsyncClient() as client:
                        response = await client.get(
                            PESAPAL_STATUS_URL,
                            params=params,
                            headers=headers
                        )

                    if response.status_code == 200:
                        status_data = response.json()
                        logging.info(f"Pesapal status raw response: {status_data}")

                        payment_status = (
                            status_data.get("payment_status_description")
                            or status_data.get("payment_status_code")
                            or ""
                        ).lower()
                        logging.info(f"Parsed payment status: {payment_status}")

                        # Update transaction record
                        await db.transactions.update_one(
                            {"payment_details.pesapal.order_tracking_id": order_tracking_id},
                            {
                                "$set": {
                                    "status": payment_status,
                                    "updated_at": datetime.utcnow(),
                                    "payment_details.pesapal.ipn_data": body,
                                    "payment_details.pesapal.status_response": status_data
                                }
                            }
                        )

                        # If payment completed
                        if payment_status == "completed":
                            user_id = transaction["user_id"]
                            amount_float = float(transaction["amount"])

                            user = await db.users.find_one({"user_id": user_id})
                            if user:
                                # Update balances (string-safe like Paystack)
                                current_wallet_balance = float(user.get("wallet_balance", "0.0"))
                                new_wallet_balance = current_wallet_balance + amount_float

                                current_total_earned = float(user.get("total_earned", "0.0"))
                                new_total_earned = current_total_earned + amount_float

                                await db.users.update_one(
                                    {"user_id": user_id},
                                    {
                                        "$set": {
                                            "wallet_balance": str(new_wallet_balance),
                                            "total_earned": str(new_total_earned),
                                            "payment_methods.pesapal.email": status_data.get("payment_account"),
                                            "payment_methods.pesapal.verified": True
                                        }
                                    }
                                )

                                # Activation logic
                                if not user.get("is_activated", False) and new_wallet_balance >= float(user.get("activation_amount", 500.0)):
                                    activation_kes = float(user["activation_amount"])
                                    reward_kes = 30.0
                                    final_balance = new_wallet_balance - activation_kes + reward_kes

                                    await db.users.update_one(
                                        {"user_id": user_id},
                                        {
                                            "$set": {
                                                "wallet_balance": str(final_balance),
                                                "activation_expense": str(activation_kes),
                                                "activation_reward": str(reward_kes),
                                                "is_activated": True
                                            }
                                        }
                                    )

                                    logging.info(
                                        f"User {user_id} activated via Pesapal IPN. "
                                        f"Expense: {activation_kes} KES, Reward: {reward_kes} KES"
                                    )

                                    # Trigger commissions
                                    await trigger_binary_commissions(user_id)

                                    if user.get("referred_by"):
                                        await process_referral_reward(
                                            referred_id=user["user_id"],
                                            referrer_id=user["referred_by"]
                                        )

                                    await create_notification(
                                        {
                                            "title": "Account Activated!",
                                            "message": f"Congratulations! Your account is activated. "
                                                       f"Expense: {activation_kes} KES, Reward: {reward_kes} KES.",
                                            "user_id": user_id,
                                            "type": "reward"
                                        },
                                        db_instance=db
                                    )

                                    await send_email(
                                        subject="Account Activated - Welcome Reward!",
                                        recipient=user["email"],
                                        body=f"""
                                        <h1>Congratulations, {user['full_name']}!</h1>
                                        <p>Your account has been successfully activated.</p>
                                        <p>Activation expense of {activation_kes} KES was deducted, and a {reward_kes} KES reward has been added.</p>
                                        <p>Net balance: {final_balance} KES.</p>
                                        """
                                    )

                                # Deposit notification
                                await create_notification({
                                    "title": "Deposit Received",
                                    "message": f"KES {amount_float:,.2f} deposited to your account via Pesapal",
                                    "user_id": user_id,
                                    "type": "payment"
                                })

        # Always respond success to Pesapal
        return JSONResponse(content={"status": "success"})

    except Exception as e:
        logging.error(f"Pesapal IPN processing error: {str(e)}", exc_info=True)
        return JSONResponse(content={"status": "success"})


@app.get("/api/payments/pesapal/callback")
async def handle_pesapal_callback(
    order_tracking_id: str = Query(...),
    order_merchant_reference: str = Query(...),
    order_notification_type: str = Query(...)
):
    """
    Handle Pesapal payment callback (user redirect).
    """
    try:
        # Find the transaction
        transaction = await db.transactions.find_one({
            "payment_details.pesapal.order_tracking_id": order_tracking_id
        })

        if not transaction:
            logging.warning(f"Transaction not found for order_tracking_id: {order_tracking_id}")
            return RedirectResponse(url=f"{BASE_URL}/dashboard?payment=error")

        # Redirect user based on payment status
        if order_notification_type == "CHANGE":
            # Payment was successful
            return RedirectResponse(url=f"{BASE_URL}/dashboard?payment=success&amount={transaction['amount']}")
        else:
            # Payment failed or was cancelled
            return RedirectResponse(url=f"{BASE_URL}/dashboard?payment=cancelled")

    except Exception as e:
        logging.error(f"Pesapal callback error: {str(e)}", exc_info=True)
        return RedirectResponse(url=f"{BASE_URL}/dashboard?payment=error")

# ✅ Fixed Withdrawal Route (uses global_rates doc)
@app.post("/api/payments/withdraw")
async def request_withdrawal(
    withdrawal_data: WithdrawalRequest,
    current_user: dict = Depends(get_current_user)
):
    """
    Handles user withdrawal requests across multiple currencies.
    Converts everything to KES equivalent for consistency using global_rates doc.
    """
    user_id = current_user["user_id"]
    amount = float(withdrawal_data.amount)
    currency = withdrawal_data.currency.upper().strip()

    PESAPAL_SUPPORTED_CURRENCIES = ["UGX", "TZS"]
    WITHDRAWAL_CURRENCIES = ["KES", "USD"] + PESAPAL_SUPPORTED_CURRENCIES

    if currency not in WITHDRAWAL_CURRENCIES:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported currency {currency}. Supported: {', '.join(WITHDRAWAL_CURRENCIES)}"
        )

    # --- Convert amount to KES ---
    if currency == "KES":
        kes_amount = amount
    else:
        try:
            rate_doc = await db.rates.find_one({"_id": "global_rates"})
            if not rate_doc:
                raise ValueError("Rates document not found")

            usd_rates = rate_doc["rates"]

            if currency not in usd_rates or "KES" not in usd_rates:
                raise ValueError("Missing rate in DB")

            from_rate = usd_rates[currency]  # USD → currency
            to_rate = usd_rates["KES"]       # USD → KES

            # Convert: amount (currency) → USD → KES
            kes_amount = (amount / from_rate) * to_rate

        except Exception as e:
            logging.warning(f"Falling back for {currency} → KES conversion: {str(e)}")
            if currency == "USD":
                kes_amount = amount * 130.0
            elif currency == "UGX":
                kes_amount = amount / 37.0
            elif currency == "TZS":
                kes_amount = amount / 23.0
            else:
                raise HTTPException(500, "Conversion rate unavailable")

    # --- Validate minimum & balance ---
    if kes_amount < 100.0:
        raise HTTPException(
            status_code=400,
            detail=f"Minimum withdrawal amount is 100 KES equivalent ({kes_amount:.2f} KES)"
        )

    if kes_amount > float(current_user.get("wallet_balance", 0.0)):
        raise HTTPException(status_code=400, detail="Insufficient wallet balance.")

    # --- Choose method ---
    if currency == "KES":
        if not withdrawal_data.phone:
            raise HTTPException(400, "Phone number required for KES withdrawals (M-Pesa).")
        method = "mpesa"
        recipient_field = "phone"
        recipient_value = validate_and_format_phone(withdrawal_data.phone)

    elif currency == "USD":
        if not withdrawal_data.email:
            raise HTTPException(400, "Email required for USD withdrawals (PayPal).")
        method = "paypal"
        recipient_field = "email"
        recipient_value = withdrawal_data.email

    else:  # UGX / TZS → Pesapal
        if not withdrawal_data.phone:
            raise HTTPException(400, f"Phone number required for {currency} withdrawals (Pesapal).")
        method = "pesapal"
        recipient_field = "phone"
        recipient_value = validate_and_format_phone(withdrawal_data.phone)

    # --- Save transaction ---
    transaction_doc = {
        "transaction_id": str(uuid.uuid4()),
        "user_id": user_id,
        "type": "withdrawal",
        "original_amount": str(amount),
        "original_currency": currency,
        "kes_amount": str(round(kes_amount, 2)),
        "method": method,
        recipient_field: recipient_value,
        "status": "pending_admin_approval",
        "description": f"{method} withdrawal request pending approval (KES eq: {kes_amount:.2f})",
        "created_at": datetime.utcnow(),
    }

    await db.transactions.insert_one(transaction_doc)
    logging.info(
        f"Withdrawal request created: {user_id} {amount} {currency} → {kes_amount:.2f} KES [{method}]"
    )

    return {
        "success": True,
        "message": (
            f"{method} withdrawal request for {amount} {currency} "
            f"(KES eq: {kes_amount:.2f}) submitted for approval."
        ),
        "transaction_id": transaction_doc["transaction_id"],
    }


@app.get("/api/team/tree")
async def get_team_tree(current_user: dict = Depends(get_current_user)):
    """Get team tree structure with progress for 100-member reward"""
    total_team_size = current_user.get('left_leg_size', 0) + current_user.get('right_leg_size', 0)
    progress_percentage = min((total_team_size / 100.0) * 100, 100.0)
    eligible = total_team_size >= 100
    claimed = current_user.get('team_reward_claimed', False)

    # Build tree (limited depth for performance)
    tree = await build_team_tree(current_user['user_id'])

    # Reward amount in preferred currency
    rate = await get_exchange_rate("KES", current_user['preferred_currency'])
    reward_amount = round(50 * rate, 2)

    return {
        "success": True,
        "tree": tree or {},  # Empty dict if no tree
        "total_team_size": total_team_size,
        "progress_percentage": progress_percentage,
        "eligible_for_reward": eligible,
        "reward_claimed": claimed,
        "reward_amount": reward_amount,
        "currency": current_user['preferred_currency']
    }

@app.post("/api/team/claim-reward")
async def claim_team_reward(
    request: ClaimTeamReward,
    current_user: dict = Depends(get_current_user)
):
    total_team_size = current_user.get('left_leg_size', 0) + current_user.get('right_leg_size', 0)
    if total_team_size < 100:
        raise HTTPException(status_code=400, detail="Team size must reach 100 members to claim reward")
    if current_user.get('team_reward_claimed', False):
        raise HTTPException(status_code=400, detail="Team reward already claimed")

    reward_kes = 50.0

    async with await mongo_client.start_session() as session:
        async with session.start_transaction():
            # Update balance
            current_balance = float(current_user['wallet_balance'])
            new_balance = current_balance + reward_kes
            current_total_earned = float(current_user['total_earned'])
            new_total_earned = current_total_earned + reward_kes

            await db.users.update_one(
                {"user_id": current_user['user_id']},
                {
                    "$set": {
                        "wallet_balance": str(new_balance),
                        "total_earned": str(new_total_earned),
                        "team_reward_claimed": True,
                        "team_reward_claimed_at": datetime.utcnow()
                    }
                },
                session=session
            )

            # Transaction record
            txn_id = str(uuid.uuid4())
            await db.transactions.insert_one({
                "transaction_id": txn_id,
                "user_id": current_user['user_id'],
                "type": "team_reward",
                "amount": str(reward_kes),
                "currency": "KES",
                "status": "completed",
                "description": "Team milestone reward - 100 downline members",
                "created_at": datetime.utcnow(),
                "completed_at": datetime.utcnow()
            }, session=session)

            # Notification
            await create_notification({
                "title": "Team Milestone Reward Claimed!",
                "message": f"Congratulations! Your team reached 100 members. 50 KES added to your wallet.",
                "user_id": current_user['user_id'],
                "type": "reward"
            }, session=session, db_instance=db)

    # Converted response
    converted_reward = round(reward_kes * rate, 2)
    return {
        "success": True,
        "message": f"Team reward claimed! 50 KES ({converted_reward} {current_user['preferred_currency']}) added to wallet.",
        "reward_amount": converted_reward,
        "currency": current_user['preferred_currency']
    }

# PayPal routes (similar structure)
@app.post("/api/payments/paypal/create-order")
async def create_paypal_order_endpoint(
    deposit_data: PayPalDepositRequest,
    current_user: dict = Depends(get_current_user)
):
    """Create a PayPal order for deposit"""
    try:
        user_id = current_user['user_id']
        # Convert KES to USD
        KSH_TO_USD_RATE = 0.0077 
        amount_float = deposit_data.amount
        usd_amount = round(amount_float * KSH_TO_USD_RATE, 2)
        
        # Validate amount
        if usd_amount < 1.00: 
            raise HTTPException(status_code=400, detail="Minimum PayPal deposit is KSH 150 (approx. $1 USD)")
        
        headers = {
            "Authorization": f"Bearer {await get_paypal_access_token()}",
            "Content-Type": "application/json",
            "Prefer": "return=representation"
        }
        
        payload = {
            "intent": "CAPTURE",
            "purchase_units": [{
                "reference_id": user_id,
                "description": f"Deposit to EarnPlatform from {current_user['email']}",
                "amount": {
                    "currency_code": PAYPAL_CURRENCY,
                    "value": f"{usd_amount:.2f}"
                }
            }],
            "application_context": {
                "return_url": f"{BASE_URL}/pages/success/?paypal_return=success", 
                "cancel_url": f"{BASE_URL}/pages/failure/?paypal_return=cancel",
                "brand_name": "EarnPlatform",
                "user_action": "PAY_NOW",
                "shipping_preference": "NO_SHIPPING"
            }
        }
        
        async with httpx.AsyncClient() as client:
            paypal_url = "https://api-m.sandbox.paypal.com/v2/checkout/orders" if PAYPAL_MODE == "sandbox" else "https://api-m.paypal.com/v2/checkout/orders"
            response = await client.post(paypal_url, headers=headers, json=payload)
            response.raise_for_status()
            order = response.json()
        
        # Create transaction record
        transaction_id = str(uuid.uuid4())

        transaction_doc = {
            "transaction_id": transaction_id,
            "user_id": user_id,
            "type": "deposit",
            "amount": str(amount_float),
            "currency": "KES",
            "converted_amount": str(usd_amount),
            "converted_currency": PAYPAL_CURRENCY,
            "status": "pending",
            "method": "paypal",
            "payment_details": { 
                "paypal_order_id": order['id'],
                "raw_order_response": order
            },
            "created_at": datetime.utcnow(),
            "completed_at": None
        }
        await db.transactions.insert_one(transaction_doc)
        
        # Find the approval link
        approval_link = next(
            (link['href'] for link in order['links'] if link['rel'] == 'approve'),
            None
        )
        
        if not approval_link:
            raise HTTPException(status_code=500, detail="No approval link found in PayPal response")
        
        logging.info(f"PayPal order created for user {user_id}, amount KES {deposit_data.amount}. Order ID: {order['id']}")
        return {
            "success": True,
            "message": "PayPal order created",
            "order_id": order['id'],
            "approval_url": approval_link,
            "transaction_id": transaction_id
        }
    except httpx.HTTPStatusError as e:
        logging.error(f"PayPal create order HTTP error: {e.response.status_code} - {e.response.text}", exc_info=True)
        raise HTTPException(status_code=e.response.status_code, detail=f"PayPal order creation failed: {e.response.text}")
    except Exception as e:
        logging.error(f"PayPal order creation error for user {current_user['user_id']}: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Could not create PayPal order: {str(e)}")

# Spin & Win
@app.post("/api/spin-and-win")
async def spin_and_win(
    spin_data: SpinAndWinRequest,
    current_user: dict = Depends(get_current_user)
):
    """
    Handles the one-time spin and win feature.
    Awards a random amount to the user's wallet.
    """
    user_id = current_user['user_id']
    winning_amount = spin_data.winning_amount

    # Check if user has already spun
    if current_user.get('has_spun_once', False):
        raise HTTPException(
            status_code=400,
            detail="You have already used your spin and win bonus."
        )
    
    # Validate winning amount
    if not (10.00 <= winning_amount <= 100.00):
        raise HTTPException(
            status_code=400,
            detail="Invalid winning amount provided. Amount must be between KSH 10 and KSH 100."
        )

    async with await mongo_client.start_session() as session:
        try:
            async with session.start_transaction():
                # Update user's wallet and set has_spun_once
                user = await db.users.find_one({"user_id": user_id}, session=session)
                if user:
                    current_wallet_balance = float(user.get('wallet_balance', '0.0'))
                    new_wallet_balance = current_wallet_balance + winning_amount
                    current_total_earned = float(user.get('total_earned', '0.0'))
                    new_total_earned = current_total_earned + winning_amount

                    await db.users.update_one(
                        {"user_id": user_id},
                        {
                            "$set": {
                                "wallet_balance": str(new_wallet_balance),
                                "total_earned": str(new_total_earned),
                                "has_spun_once": True
                            }
                        },
                        session=session
                    )
                # Re-fetch the updated user document to return
                updated_user_result = await db.users.find_one({"user_id": user_id}, session=session)
                
                if not updated_user_result:
                    raise HTTPException(status_code=404, detail="User not found during spin update.")

                # Create a transaction record for the spin reward
                transaction_doc = {
                    "transaction_id": str(uuid.uuid4()),
                    "user_id": user_id,
                    "type": "spin_and_win",
                    "amount": str(winning_amount),
                    "currency": "KES",
                    "status": "completed",
                    "description": "One-time Spin & Win bonus",
                    "created_at": datetime.utcnow(),
                    "completed_at": datetime.utcnow()
                }
                await db.transactions.insert_one(transaction_doc, session=session)

                # Create notification for the user
                await create_notification({
                    "title": "Spin & Win Bonus!",
                    "message": f"Congratulations! You won KES {winning_amount:,.2f} from Spin & Win!",
                    "user_id": user_id,
                    "type": "reward"
                }, session=session, db_instance=db)
                
                await session.commit_transaction()

            logging.info(f"User {user_id} won KES {winning_amount} from spin and win.")
            return {
                "success": True,
                "message": f"Congratulations! You won KES {winning_amount}.",
                "winning_amount": winning_amount,
                "user": json_serializable_doc(updated_user_result)
            }

        except HTTPException:
            await session.abort_transaction()
            raise
        except Exception as e:
            await session.abort_transaction()
            logging.error(f"Error processing spin and win for user {user_id}: {str(e)}", exc_info=True)
            raise HTTPException(
                status_code=500,
                detail=f"Failed to process spin and win: {str(e)}"
            )

# Task system
@app.get("/api/tasks/available")
async def get_available_tasks(current_user: dict = Depends(get_current_user)):
    if not current_user['is_activated']:
        raise HTTPException(status_code=400, detail="Account must be activated to access tasks")
    
    # Get completed task IDs for this user
    completed_tasks = await db.task_completions.find(
        {"user_id": current_user['user_id']}
    ).distinct("task_id")
    
    # Get available tasks (not completed by user and active)
    tasks = await db.tasks.find(
        {"task_id": {"$nin": completed_tasks}, "is_active": True}
    ).to_list(20)
    
    return {
        "success": True,
        "tasks": json_serializable_doc(tasks) 
    }

@app.post("/api/tasks/complete")
async def complete_task(completion_data: TaskCompletion, current_user: dict = Depends(get_current_user)):
    if not current_user['is_activated']:
        raise HTTPException(status_code=400, detail="Account must be activated to complete tasks")
    
    # Check if task exists and is active
    task = await db.tasks.find_one({"task_id": completion_data.task_id, "is_active": True})
    if not task:
        raise HTTPException(status_code=404, detail="Task not found or inactive")
    
    # Check if user already completed this task
    existing_completion = await db.task_completions.find_one({
        "user_id": current_user['user_id'],
        "task_id": completion_data.task_id
    })
    if existing_completion:
        raise HTTPException(status_code=400, detail="Task already completed")
    
    # Validate completion data based on task type
    comp_data = completion_data.completion_data
    task_type = task.get('type', 'general')
    requirements = task.get('requirements', {})
    media = task.get('media', {})
    survey_questions = task.get('survey_questions') or []
    
    if task_type == 'survey':
        answers = comp_data.get('answers', [])
        if len(answers) != len(survey_questions):
            raise HTTPException(status_code=400, detail=f"Survey requires {len(survey_questions)} answers. Provided: {len(answers)}")
        if any(len(answer) < 5 for answer in answers):  # Basic validation: min length
            raise HTTPException(status_code=400, detail="Each survey answer must be at least 5 characters long")
    
    elif task_type == 'video' or task_type == 'ad':
        watched_duration = comp_data.get('watched_duration', 0)
        required_duration = requirements.get('duration', 30)
        if watched_duration < required_duration:
            raise HTTPException(status_code=400, detail=f"Must watch full {required_duration}s. Watched: {watched_duration}s")
        if media.get('youtube_id') and 'youtube_timestamp' not in comp_data:
            raise HTTPException(status_code=400, detail="Provide YouTube timestamp for verification")
        if media.get('video_url') and 'screenshot_url' not in comp_data:
            raise HTTPException(status_code=400, detail="Provide screenshot URL for video task")
    
    elif task_type == 'image' or task_type == 'upload':
        image_url = comp_data.get('image_url')
        if not image_url or not image_url.startswith(('http://', 'https://')):
            raise HTTPException(status_code=400, detail="Valid image URL required for upload tasks")
        # Basic URL check (extend with regex if needed)
    
    elif task_type == 'writing':
        content = comp_data.get('content', '')
        min_words = requirements.get('min_words', 100)
        word_count = len(content.split())
        if word_count < min_words:
            raise HTTPException(status_code=400, detail=f"Content must have at least {min_words} words. Provided: {word_count}")
    
    elif task_type == 'social':
        share_urls = comp_data.get('share_urls', [])
        required_platforms = requirements.get('platforms', [])
        if len(share_urls) < len(required_platforms):
            raise HTTPException(status_code=400, detail=f"Share on {len(required_platforms)} platforms required. Provided: {len(share_urls)} URLs")
        for url in share_urls:
            if not url.startswith(('http://', 'https://')):
                raise HTTPException(status_code=400, detail="All share URLs must be valid")
    
    # General media support: If task has media, ensure completion references it if required
    if media and requirements.get('verify_media', False):
        if 'media_proof' not in comp_data:
            raise HTTPException(status_code=400, detail="Proof of media interaction (e.g., screenshot) required")
    
    # Record task completion
    reward_amount = float(task['reward'])
    completion_doc = {
        "completion_id": str(uuid.uuid4()),
        "user_id": current_user['user_id'],
        "task_id": completion_data.task_id,
        "completion_data": completion_data.completion_data,
        "reward_amount": str(reward_amount),
        "status": "completed",
        "created_at": datetime.utcnow()
    }
    
    # Use session for atomic update
    async with await mongo_client.start_session() as session:
        try:
            async with session.start_transaction():
                await db.task_completions.insert_one(completion_doc, session=session)
                
                # Update user wallet and earnings
                user = await db.users.find_one({"user_id": current_user['user_id']}, session=session)
                if user:
                    current_wallet_balance = float(user.get('wallet_balance', '0.0'))
                    new_wallet_balance = current_wallet_balance + reward_amount
                    current_task_earnings = float(user.get('task_earnings', '0.0'))
                    new_task_earnings = current_task_earnings + reward_amount
                    current_total_earned = float(user.get('total_earned', '0.0'))
                    new_total_earned = current_total_earned + reward_amount

                    await db.users.update_one(
                        {"user_id": current_user['user_id']},
                        {
                            "$set": {
                                "wallet_balance": str(new_wallet_balance),
                                "task_earnings": str(new_task_earnings),
                                "total_earned": str(new_total_earned)
                            }
                        },
                        session=session
                    )
                await session.commit_transaction()
        except Exception as e:
            await session.abort_transaction()
            logging.error(f"Task completion transaction failed: {e}", exc_info=True)
            raise HTTPException(status_code=500, detail=f"Task completion failed: {str(e)}")

    # Create notification
    await create_notification({
        "title": "Task Completed!",
        "message": f"You earned KSH {reward_amount:,.2f} for completing '{task['title']}'",
        "user_id": current_user['user_id']
    }, db_instance=db)
    
    return {
        "success": True,
        "message": f"Task completed! You earned KSH {reward_amount}",
        "reward": reward_amount,
        "validated_type": task_type
    }

# Referral system
@app.get("/api/referrals/stats")
async def get_referral_stats(current_user: dict = Depends(get_current_user)):
    """
    Enhanced Referral Statistics
    """
    try:
        stats_pipeline = [
            {"$match": {"referrer_id": current_user['user_id']}},
            {"$group": {
                "_id": "$status",
                "count": {"$sum": 1},
                "total_reward_for_status": {"$sum": {"$toDouble": "$reward_amount"}}
            }},
            {"$group": {
                "_id": None,
                "total_referrals": {"$sum": "$count"},
                "completed_rewards": {
                    "$sum": {
                        "$cond": [
                            {"$eq": ["$_id", "completed"]},
                            "$total_reward_for_status",
                            0
                        ]
                    }
                },
                "potential_rewards": {
                    "$sum": {
                        "$cond": [
                            {"$eq": ["$_id", "pending"]},
                            "$total_reward_for_status",
                            0
                        ]
                    }
                }
            }},
            {"$project": {
                "_id": 0,
                "total_referrals": 1,
                "total_earned": "$completed_rewards",
                "potential_earnings": "$potential_rewards",
            }}
        ]
        
        stats = await db.referrals.aggregate(stats_pipeline).to_list(1)

        # Process referral result
        referral_stats = stats[0] if stats else {
            "total_referrals": 0,
            "total_earned": 0.0,
            "potential_earnings": 0.0,
        }
        
        referral_count = referral_stats.get('total_referrals', 0)
        tier = "gold" if referral_count >= 50 else \
               "silver" if referral_count >= 20 else "bronze"

        referral_stats['tier'] = tier
        referral_stats['referral_code'] = current_user['referral_code']

        # Get recent referrals with pagination
        recent_referrals = await db.referrals.find(
            {"referrer_id": current_user['user_id']},
            {"_id": 0, "referred_id": 1, "status": 1, "created_at": 1}
        ).sort("created_at", -1).limit(5).to_list(5)

        return {
            "success": True,
            "stats": json_serializable_doc(referral_stats),
            "recent_referrals": json_serializable_doc(recent_referrals)
        }

    except Exception as e:
        logging.error(f"Failed to fetch referral stats for user {current_user['user_id']}: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch referral stats: {str(e)}"
        )

@app.get("/api/referrals/binary-stats")
async def get_binary_stats(current_user: dict = Depends(get_current_user)):
    """
    Get binary referral tree statistics.
    """
    try:
        left_leg = current_user.get('left_leg_size', 0)
        right_leg = current_user.get('right_leg_size', 0)
        total_downline = left_leg + right_leg
        leg_balance = left_leg - right_leg  # Positive if left heavier
        
        return {
            "success": True,
            "binary": {
                "left_leg_size": left_leg,
                "right_leg_size": right_leg,
                "total_downline": total_downline,
                "binary_earnings": current_user.get('binary_earnings', 0.0),
                "leg_balance": leg_balance,
                "recommendation": "Balance your legs" if abs(leg_balance) > 5 else "Good balance"
            }
        }
    except Exception as e:
        logging.error(f"Failed to fetch binary stats: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch binary stats")

# Enhanced Notification System
@app.post("/api/notifications/create")
async def create_notification_endpoint(notification_data: NotificationCreate, current_user: dict = Depends(get_current_admin_user)): 
    """Admin endpoint to create notifications"""
    await create_notification(notification_data.dict(), db_instance=db)
    return {"success": True, "message": "Notification created"}

@app.get("/api/notifications")
async def get_notifications(current_user: dict = Depends(get_current_user)):
    # Fetch notifications for the specific user AND broadcast notifications
    notifications = await db.notifications.find(
        {"$or": [{"user_id": current_user['user_id']}, {"user_id": None}]}
    ).sort("created_at", -1).limit(20).to_list(20)
    
    return {"success": True, "notifications": json_serializable_doc(notifications)} 

@app.put("/api/notifications/{notification_id}/read")
async def mark_notification_read(notification_id: str, current_user: dict = Depends(get_current_user)):
    try:
        object_id_to_find = ObjectId(notification_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid notification ID format")

    notification = await db.notifications.find_one({"_id": object_id_to_find})
    if not notification:
        raise HTTPException(status_code=404, detail="Notification not found")

    # Ensure the user has access to mark this notification as read
    if notification.get('user_id') is not None and notification['user_id'] != current_user['user_id']:
        raise HTTPException(status_code=403, detail="Not authorized to mark this notification as read")

    await db.notifications.update_one(
        {"_id": object_id_to_find}, 
        {"$set": {"is_read": True}}
    )
    logging.info(f"Notification {notification_id} marked as read by user {current_user['user_id']}")
    return {"success": True, "message": "Notification marked as read"}

# Settings
@app.put("/api/settings/theme")
async def update_theme(theme: str, current_user: dict = Depends(get_current_user)):
    if theme not in ['light', 'dark']:
        raise HTTPException(status_code=400, detail="Invalid theme")
    
    await db.users.update_one(
        {"user_id": current_user['user_id']},
        {"$set": {"theme": theme}}
    )
    logging.info(f"User {current_user['user_id']} updated theme to {theme}")
    return {"success": True, "message": f"Theme updated to {theme}"}

# --- Admin Endpoints ---
@app.get("/api/admin/dashboard/stats", dependencies=[Depends(get_current_admin_user)])
async def get_admin_dashboard_stats():
    total_users = await db.users.count_documents({})
    activated_users = await db.users.count_documents({"is_activated": True})
    
    # Calculate total deposits
    total_deposits_agg = await db.transactions.aggregate([
        {"$match": {"type": "deposit", "status": "completed"}},
        {"$group": {"_id": None, "total_amount": {"$sum": {"$toDouble": "$amount"}}}}
    ]).to_list(1)
    total_deposits = total_deposits_agg[0]['total_amount'] if total_deposits_agg else 0.0

    # Calculate total withdrawals
    total_withdrawals_agg = await db.transactions.aggregate([
        {"$match": {"type": "withdrawal", "status": "completed"}},
        {"$group": {"_id": None, "total_amount": {"$sum": {"$toDouble": "$amount"}}}}
    ]).to_list(1)
    total_withdrawals = total_withdrawals_agg[0]['total_amount'] if total_withdrawals_agg else 0.0

    pending_withdrawals = await db.transactions.count_documents({"type": "withdrawal", "status": "pending_admin_approval"})
    
    return {
        "success": True,
        "stats": json_serializable_doc({
            "total_users": total_users,
            "activated_users": activated_users,
            "total_deposits": total_deposits, 
            "total_withdrawals": total_withdrawals, 
            "pending_withdrawals": pending_withdrawals
        })
    }

@app.get("/api/admin/users", dependencies=[Depends(get_current_admin_user)])
async def get_all_users():
    users = await db.users.find({}, {"password": 0}).to_list(1000) 
    return {"success": True, "users": json_serializable_doc(users)} 

@app.get("/api/admin/transactions/deposits", dependencies=[Depends(get_current_admin_user)])
async def get_all_deposits(status: Optional[str] = None):
    query = {"type": "deposit"}
    if status:
        query["status"] = status
    deposits = await db.transactions.find(query).sort("created_at", -1).to_list(1000)
    return {"success": True, "deposits": json_serializable_doc(deposits)} 

@app.get("/api/admin/transactions/withdrawals", dependencies=[Depends(get_current_admin_user)])
async def get_all_withdrawals(status: Optional[str] = None):
    query = {"type": "withdrawal"}
    if status:
        query["status"] = status
    withdrawals = await db.transactions.find(query).sort("created_at", -1).to_list(1000)
    return {"success": True, "withdrawals": json_serializable_doc(withdrawals)} 

# Admin manual completion endpoint
@app.post("/api/admin/manual-complete", dependencies=[Depends(get_current_admin_user)])
async def manual_complete_transaction(
    approval_data: WithdrawalApproval,
    db_instance: AsyncIOMotorClient = Depends(get_db_instance)
):
    """
    Admin manually completes a pending transaction (withdrawal or deposit).
    Uses 'kes_amount' from transaction. Updates balances, totals, notifications, and emails.
    """
    transaction_id = approval_data.transaction_id
    session = await db_instance.client.start_session()

    try:
        async with session.start_transaction():
            # 1. Find transaction
            transaction = await db_instance.transactions.find_one(
                {"transaction_id": transaction_id},
                session=session
            )
            if not transaction:
                raise HTTPException(status_code=404, detail="Transaction not found")

            if transaction['status'] not in ['pending_admin_approval', 'pending', 'failed']:
                raise HTTPException(
                    status_code=400,
                    detail=f"Cannot manually complete transaction with status: {transaction['status']}"
                )

            user_id = transaction['user_id']
            kes_amount = float(transaction.get('kes_amount', '0.0'))
            transaction_type = transaction['type']

            # 2. Update transaction status
            await db_instance.transactions.update_one(
                {"transaction_id": transaction_id},
                {
                    "$set": {
                        "status": "completed",
                        "completed_at": datetime.utcnow(),
                        "manually_completed_by": "admin",
                        "manual_completion_reason": "Admin manually completed transaction"
                    }
                },
                session=session
            )

            # 3. Fetch user
            user = await db_instance.users.find_one({"user_id": user_id}, session=session)
            if not user:
                raise HTTPException(status_code=404, detail="User not found")

            # 4. Process based on type
            if transaction_type == "withdrawal":
                # Deduct wallet balance
                current_wallet_balance = float(user.get('wallet_balance', '0.0'))
                new_wallet_balance = current_wallet_balance - kes_amount
                current_total_withdrawn = float(user.get('total_withdrawn', '0.0'))
                new_total_withdrawn = current_total_withdrawn + kes_amount

                await db_instance.users.update_one(
                    {"user_id": user_id},
                    {
                        "$set": {"wallet_balance": str(new_wallet_balance)},
                        "$set": {"total_withdrawn": str(new_total_withdrawn)}
                    },
                    session=session
                )

                notification_title = "Withdrawal Completed"
                notification_message = f"Your withdrawal of KES {kes_amount:,.2f} has been manually completed by admin."

            elif transaction_type == "deposit":
                # Add to wallet balance
                current_wallet_balance = float(user.get('wallet_balance', '0.0'))
                new_wallet_balance = current_wallet_balance + kes_amount
                current_total_earned = float(user.get('total_earned', '0.0'))
                new_total_earned = current_total_earned + kes_amount

                await db_instance.users.update_one(
                    {"user_id": user_id},
                    {
                        "$set": {"wallet_balance": str(new_wallet_balance)},
                        "$set": {"total_earned": str(new_total_earned)}
                    },
                    session=session
                )

                # Check activation
                if not user.get('is_activated') and new_wallet_balance >= float(user.get('activation_amount', '0.0')):
                    await db_instance.users.update_one(
                        {"user_id": user_id},
                        {"$set": {"is_activated": True}},
                        session=session
                    )
                    await trigger_binary_commissions(user_id, session=session)
                    if user.get('referred_by'):
                        await process_referral_reward(
                            referred_id=user_id,
                            referrer_id=user['referred_by'],
                            session=session
                        )
                    # Activation notification
                    await create_notification(
                        {
                            "title": "Account Activated!",
                            "message": f"Congratulations! Your account has been activated. Deposit of KES {kes_amount:,.2f} manually completed.",
                            "user_id": user_id,
                            "type": "reward"
                        },
                        session=session,
                        db_instance=db_instance
                    )

                notification_title = "Deposit Completed"
                notification_message = f"Your deposit of KES {kes_amount:,.2f} has been manually completed by admin."

            # 5. Send notification
            await create_notification(
                {
                    "title": notification_title,
                    "message": notification_message,
                    "user_id": user_id,
                    "type": "payment"
                },
                session=session,
                db_instance=db_instance
            )

            # 6. Send email
            await send_email(
                subject=notification_title,
                recipient=user['email'],
                body=f"""
                <h3>{notification_title}</h3>
                <p>{notification_message}</p>
                """
            )

            await session.commit_transaction()

            return {
                "success": True,
                "message": f"Transaction {transaction_id} manually completed successfully."
            }

    except HTTPException:
        raise
    except Exception as e:
        if session.in_transaction:
            await session.abort_transaction()
        logging.error(f"Error in manual completion for transaction {transaction_id}: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Failed to manually complete transaction: {str(e)}"
        )
    finally:
        if session and session.client:
            session.end_session()

@app.post("/api/admin/approve", dependencies=[Depends(get_current_admin_user)])
async def approve_transaction(approval_data: WithdrawalApproval, db_instance: AsyncIOMotorClient = Depends(get_db_instance)):
    """
    Admin approves a transaction (deposit or withdrawal).
    """
    transaction_id = approval_data.transaction_id
    session = await db_instance.client.start_session()

    try:
        async with session.start_transaction():
            # Find the transaction
            transaction = await db_instance.transactions.find_one(
                {"transaction_id": transaction_id},
                session=session
            )

            if not transaction:
                raise HTTPException(status_code=404, detail="Transaction not found")

            # Only allow approval for pending transactions
            if transaction['status'] != 'pending_admin_approval':
                raise HTTPException(
                    status_code=400,
                    detail=f"Cannot approve transaction with status: {transaction['status']}"
                )

            user_id = transaction['user_id']
            amount = float(transaction['amount'])
            transaction_type = transaction['type']

            # Update transaction status
            await db_instance.transactions.update_one(
                {"transaction_id": transaction_id},
                {
                    "$set": {
                        "status": "completed",
                        "completed_at": datetime.utcnow(),
                        "approved_by": "admin"
                    }
                },
                session=session
            )

            # Handle different transaction types
            if transaction_type == "deposit":
                user = await db_instance.users.find_one({"user_id": user_id}, session=session)
                if user:
                    current_wallet_balance = float(user.get('wallet_balance', '0.0'))
                    new_wallet_balance = current_wallet_balance + amount
                    current_total_earned = float(user.get('total_earned', '0.0'))
                    new_total_earned = current_total_earned + amount

                    await db_instance.users.update_one(
                        {"user_id": user_id},
                        {
                            "$set": {
                                "wallet_balance": str(new_wallet_balance),
                                "total_earned": str(new_total_earned)
                            }
                        },
                        session=session
                    )

                    # Check if this activates the user
                    if not user['is_activated'] and new_wallet_balance >= float(user['activation_amount']):
                        await db_instance.users.update_one(
                            {"user_id": user_id},
                            {"$set": {"is_activated": True}},
                            session=session
                        )
                        logging.info(f"User {user_id} activated via admin approval.")

                        # Trigger binary commissions
                        await trigger_binary_commissions(user_id, session=session)

                        # Process referral if exists
                        if user.get("referred_by"):
                            await process_referral_reward(
                                referred_id=user_id,
                                referrer_id=user["referred_by"],
                                session=session
                            )

                        # Create activation notification
                        await create_notification(
                            {
                                "title": "Account Activated!",
                                "message": f"Congratulations! Your account is activated. Deposit of {amount} KES approved.",
                                "user_id": user_id,
                                "type": "reward"
                            },
                            session=session,
                            db_instance=db_instance
                        )

                # Create notification for deposit approval
                await create_notification(
                    {
                        "title": "Deposit Approved",
                        "message": f"Your deposit of KES {amount:,.2f} has been approved by admin.",
                        "user_id": user_id,
                        "type": "payment"
                    },
                    session=session,
                    db_instance=db_instance
                )

            elif transaction_type == "withdrawal":
                # For withdrawals, we need to deduct from balance and process payout
                user = await db_instance.users.find_one({"user_id": user_id}, session=session)
                if user:
                    kes_amount = float(transaction.get('kes_amount', amount))
                    current_wallet_balance = float(user.get('wallet_balance', '0.0'))
                    new_wallet_balance = current_wallet_balance - kes_amount
                    current_total_withdrawn = float(user.get('total_withdrawn', '0.0'))
                    new_total_withdrawn = current_total_withdrawn + kes_amount

                    await db_instance.users.update_one(
                        {"user_id": user_id},
                        {
                            "$set": {
                                "wallet_balance": str(new_wallet_balance),
                                "total_withdrawn": str(new_total_withdrawn)
                            }
                        },
                        session=session
                    )

                # Create notification for withdrawal approval
                await create_notification(
                    {
                        "title": "Withdrawal Approved",
                        "message": f"Your withdrawal of {transaction.get('original_amount', amount)} {transaction.get('original_currency', 'KES')} has been approved and is being processed.",
                        "user_id": user_id,
                        "type": "payment"
                    },
                    session=session,
                    db_instance=db_instance
                )

            await session.commit_transaction()
            logging.info(f"Admin approved transaction {transaction_id} for user {user_id}")

            return {
                "success": True,
                "message": f"Transaction {transaction_id} approved successfully"
            }

    except HTTPException:
        raise
    except Exception as e:
        if session.in_transaction:
            await session.abort_transaction()
        logging.error(f"Error in transaction approval for {transaction_id}: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Failed to approve transaction: {str(e)}"
        )
    finally:
        if session and session.client:
            session.end_session()

@app.post("/api/admin/reject", dependencies=[Depends(get_current_admin_user)])
async def reject_transaction(approval_data: UpdateWithdrawalStatus, db_instance: AsyncIOMotorClient = Depends(get_db_instance)):
    """
    Admin rejects a transaction.
    """
    transaction_id = approval_data.status  # Using status field to pass transaction_id
    session = await db_instance.client.start_session()

    try:
        async with session.start_transaction():
            # Find the transaction
            transaction = await db_instance.transactions.find_one(
                {"transaction_id": transaction_id},
                session=session
            )

            if not transaction:
                raise HTTPException(status_code=404, detail="Transaction not found")

            # Only allow rejection for pending transactions
            if transaction['status'] not in ['pending', 'pending_admin_approval']:
                raise HTTPException(
                    status_code=400,
                    detail=f"Cannot reject transaction with status: {transaction['status']}"
                )

            user_id = transaction['user_id']
            amount = float(transaction['amount'])
            transaction_type = transaction['type']

            # Update transaction status
            await db_instance.transactions.update_one(
                {"transaction_id": transaction_id},
                {
                    "$set": {
                        "status": "rejected",
                        "completed_at": datetime.utcnow(),
                        "rejected_by": "admin",
                        "rejection_reason": approval_data.reason or "Rejected by admin"
                    }
                },
                session=session
            )

            # For deposits, no balance changes needed (funds weren't added)
            # For withdrawals, no balance changes needed (funds weren't deducted)

            # Create notification for rejection
            if transaction_type == "deposit":
                await create_notification(
                    {
                        "title": "Deposit Rejected",
                        "message": f"Your deposit of KES {amount:,.2f} has been rejected. Reason: {approval_data.reason or 'No reason provided'}",
                        "user_id": user_id,
                        "type": "payment"
                    },
                    session=session,
                    db_instance=db_instance
                )
            elif transaction_type == "withdrawal":
                await create_notification(
                    {
                        "title": "Withdrawal Rejected",
                        "message": f"Your withdrawal of {transaction.get('original_amount', amount)} {transaction.get('original_currency', 'KES')} has been rejected. Reason: {approval_data.reason or 'No reason provided'}",
                        "user_id": user_id,
                        "type": "payment"
                    },
                    session=session,
                    db_instance=db_instance
                )

            await session.commit_transaction()
            logging.info(f"Admin rejected transaction {transaction_id} for user {user_id}")

            return {
                "success": True,
                "message": f"Transaction {transaction_id} rejected successfully"
            }

    except HTTPException:
        raise
    except Exception as e:
        if session.in_transaction:
            await session.abort_transaction()
        logging.error(f"Error in transaction rejection for {transaction_id}: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Failed to reject transaction: {str(e)}"
        )
    finally:
        if session and session.client:
            session.end_session()

@app.post("/api/admin/approve-withdrawal", dependencies=[Depends(get_current_admin_user)])
async def approve_withdrawal(approval_data: WithdrawalApproval, db_instance: AsyncIOMotorClient = Depends(get_db_instance)):
    """
    Admin approves a pending withdrawal request.
    """
    transaction_id = approval_data.transaction_id
    session = await db_instance.client.start_session()
    try:
        async with session.start_transaction():
            # Find and attempt to transition transaction from pending_admin_approval to processing
            transaction = await db_instance.transactions.find_one_and_update(
                {"transaction_id": transaction_id, "status": "pending_admin_approval"},
                {"$set": {"status": "processing", "approved_at": datetime.utcnow()}},
                return_document=True,
                session=session
            )

            if not transaction:
                logging.warning(f"Attempted to approve non-pending or non-existent transaction: {transaction_id}")
                raise HTTPException(
                    status_code=404,
                    detail="Pending withdrawal request not found or already processed."
                )

            user_id = transaction['user_id']
            kes_deduct = float(transaction['kes_amount'])
            original_amount = transaction['original_amount']
            original_currency = transaction['original_currency']

            # Fetch user document to check current balance
            user = await db_instance.users.find_one({"user_id": user_id}, session=session)
            
            if not user:
                logging.error(f"User {user_id} not found for transaction {transaction_id}.")
                raise HTTPException(status_code=404, detail="User associated with withdrawal not found.")
            
            if float(user['wallet_balance']) < kes_deduct:
                # If balance is insufficient now, revert transaction status to failed.
                await db_instance.transactions.update_one(
                    {"_id": transaction["_id"]},
                    {"$set": {"status": "failed", "completed_at": datetime.utcnow(), "error_message": "Insufficient balance at time of approval."}},
                    session=session
                )
                await create_notification(
                    {
                        "title": "Withdrawal Failed",
                        "message": f"Your withdrawal of {original_amount} {original_currency} failed because your wallet balance was insufficient at the time of approval. Funds were not deducted.",
                        "user_id": user_id,
                        "type": "payment"
                    },
                    session=session,
                    db_instance=db_instance
                )
                await session.commit_transaction()
                raise HTTPException(
                    status_code=400,
                    detail="User's wallet balance is now insufficient. Withdrawal cancelled."
                )
            
            # Deduct from user's balance first and increment total_withdrawn
            current_balance = float(user['wallet_balance'])
            new_balance = current_balance - kes_deduct
            current_total_withdrawn = float(user['total_withdrawn'])
            new_total_withdrawn = current_total_withdrawn + kes_deduct

            await db_instance.users.update_one(
                {"user_id": user_id},
                {
                    "$set": {
                        "wallet_balance": str(new_balance),
                        "total_withdrawn": str(new_total_withdrawn)
                    }
                },
                session=session
            )

            # Now, initiate the actual payout based on method
            payout_success = False
            payout_message = "Payout initiated."
            withdrawal_method = transaction['method']

            if withdrawal_method == "mpesa":
                recipient_phone = transaction['phone']
                payout_amount = float(transaction['kes_amount'])
                payout_currency = "KES"
                try:
                    access_token = await get_mpesa_access_token()
                    
                    b2c_payload = {
                        "InitiatorName": MPESA_INITIATOR_NAME,
                        "SecurityCredential": MPESA_SECURITY_CREDENTIAL,
                        "CommandID": "BusinessPayment",
                        "Amount": int(payout_amount),
                        "PartyA": MPESA_B2C_SHORTCODE,
                        "PartyB": recipient_phone,
                        "Remarks": f"Withdrawal for {user['full_name']} (EarnPlatform)",
                        "QueueTimeOutURL": f"{BACKEND_URL}/api/payments/mpesa-b2c-timeout",
                        "ResultURL": f"{BACKEND_URL}/api/payments/mpesa-b2c-result",
                        "Occasion": "User Withdrawal"
                    }
                    logging.info(f"M-Pesa B2C Payload: {json.dumps(b2c_payload, indent=2)}")

                    async with httpx.AsyncClient(timeout=30.0) as client:
                        mpesa_b2c_response = await client.post(
                            "https://sandbox.safaricom.co.ke/mpesa/b2c/v1/paymentrequest",
                            json=b2c_payload,
                            headers={
                                "Authorization": f"Bearer {access_token}",
                                "Content-Type": "application/json"
                            }
                        )
                        mpesa_b2c_response.raise_for_status()
                        b2c_data = mpesa_b2c_response.json()

                    if b2c_data.get("ResponseCode") == "0":
                        await db_instance.transactions.update_one(
                            {"_id": transaction["_id"]},
                            {"$set": {
                                "payment_details.mpesa_conversation_id": b2c_data.get("ConversationID"),
                                "payment_details.mpesa_originator_conv_id": b2c_data.get("OriginatorConversationID"),
                                "payment_details.raw_b2c_request": b2c_payload,
                                "payment_details.raw_b2c_response": b2c_data
                            }},
                            session=session
                        )
                        payout_success = True
                        payout_message = "M-Pesa B2C initiated."
                        logging.info(f"M-Pesa B2C initiated for transaction {transaction_id}. ConvID: {b2c_data.get('ConversationID')}")
                    else:
                        raise Exception(f"M-Pesa B2C initiation failed: {b2c_data.get('errorMessage', 'Unknown M-Pesa error')}")

                except Exception as e:
                    logging.error(f"Failed to initiate M-Pesa B2C for {transaction_id}: {str(e)}", exc_info=True)
                    # Revert user balance if B2C initiation fails
                    user = await db_instance.users.find_one({"user_id": user_id}, session=session)
                    if user:
                        current_wallet_balance = float(user.get('wallet_balance', '0.0'))
                        new_wallet_balance = current_wallet_balance + kes_deduct
                        current_total_withdrawn = float(user.get('total_withdrawn', '0.0'))
                        new_total_withdrawn = current_total_withdrawn - kes_deduct

                        await db_instance.users.update_one(
                            {"user_id": user_id},
                            {
                                "$set": {
                                    "wallet_balance": str(new_wallet_balance),
                                    "total_withdrawn": str(new_total_withdrawn)
                                }
                            },
                            session=session
                        )
                    await db_instance.transactions.update_one(
                        {"_id": transaction["_id"]},
                        {"$set": {"status": "failed", "completed_at": datetime.utcnow(), "error_message": f"M-Pesa B2C initiation failed: {e}"}},
                        session=session
                    )
                    await create_notification(
                        {
                            "title": "Withdrawal Failed (M-Pesa)",
                            "message": f"Your M-Pesa withdrawal of {original_amount} {original_currency} failed during initiation. Funds returned to wallet. Reason: {e}",
                            "user_id": user_id,
                            "type": "payment"
                        },
                        session=session,
                        db_instance=db_instance
                    )
                    payout_success = False
                    payout_message = f"M-Pesa B2C initiation failed. Funds reverted. {e}"

            elif withdrawal_method == "paypal":
                recipient_email = transaction['email']
                payout_amount = float(transaction['original_amount'])
                payout_currency = original_currency
                try:
                    # PayPal payout implementation would go here
                    # This is a simplified version - actual implementation would use PayPal Payouts API
                    payout_success = True
                    payout_message = "PayPal payout initiated (simulated)."
                    logging.info(f"PayPal payout initiated for transaction {transaction_id}.")

                except Exception as e:
                    logging.error(f"Failed to initiate PayPal payout for {transaction_id}: {str(e)}", exc_info=True)
                    # Revert user balance if PayPal payout initiation fails
                    user = await db_instance.users.find_one({"user_id": user_id}, session=session)
                    if user:
                        current_wallet_balance = float(user.get('wallet_balance', '0.0'))
                        new_wallet_balance = current_wallet_balance + kes_deduct
                        current_total_withdrawn = float(user.get('total_withdrawn', '0.0'))
                        new_total_withdrawn = current_total_withdrawn - kes_deduct
                        await db_instance.users.update_one(
                            {"user_id": user_id},
                            {
                                "$set": {
                                    "wallet_balance": str(new_wallet_balance),
                                    "total_withdrawn": str(new_total_withdrawn)
                                }
                            },
                            session=session
                        )
                    await db_instance.transactions.update_one(
                        {"_id": transaction["_id"]},
                        {"$set": {"status": "failed", "completed_at": datetime.utcnow(), "error_message": f"PayPal payout initiation failed: {e}"}},
                        session=session
                    )
                    await create_notification(
                        {
                            "title": "Withdrawal Failed (PayPal)",
                            "message": f"Your PayPal withdrawal of {original_amount} {original_currency} failed during initiation. Funds returned to wallet. Reason: {e}",
                            "user_id": user_id,
                            "type": "payment"
                        },
                        session=session,
                        db_instance=db_instance
                    )
                    payout_success = False
                    payout_message = f"PayPal payout initiation failed. Funds reverted. {e}"
            else:
                logging.error(f"Unknown withdrawal method for transaction {transaction_id}: {withdrawal_method}")
                user = await db_instance.users.find_one({"user_id": user_id}, session=session)
                if user:
                    current_wallet_balance = float(user.get('wallet_balance', '0.0'))
                    new_wallet_balance = current_wallet_balance + kes_deduct
                    await db_instance.users.update_one(
                        {"user_id": user_id},
                        {"$set": {"wallet_balance": str(new_wallet_balance)}},
                        session=session
                    )
                await db_instance.transactions.update_one(
                    {"_id": transaction["_id"]},
                    {"$set": {"status": "failed", "completed_at": datetime.utcnow(), "error_message": "Unknown withdrawal method."}},
                    session=session
                )
                payout_success = False
                payout_message = "Unknown withdrawal method. Funds reverted."
            
            if payout_success:
                await create_notification({
                    "title": "Withdrawal Approved!",
                    "message": f"Your withdrawal of {original_amount} {original_currency} has been approved and is being processed.",
                    "user_id": user_id,
                    "type": "payment"
                }, session=session, db_instance=db_instance)
                await session.commit_transaction()
                return {
                    "success": True,
                    "message": f"Withdrawal {transaction_id} approved. {payout_message}"
                }
            else:
                await session.abort_transaction()
                raise HTTPException(status_code=500, detail=f"Withdrawal failed after approval: {payout_message}")

    except HTTPException:
        raise
    except Exception as e:
        if session.in_transaction:
            await session.abort_transaction()
        logging.critical(f"Critical error during withdrawal approval for transaction {transaction_id}: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"An unexpected error occurred during withdrawal approval: {str(e)}"
        )
    finally:
        if session and session.in_transaction:
             await session.abort_transaction()
        if session and session.client:
            session.end_session()

# Task management endpoints
@app.post("/api/admin/tasks", dependencies=[Depends(get_current_admin_user)])
async def create_task(task_data: Task):
    task_id = str(uuid.uuid4())
    task_doc = {
        "task_id": task_id,
        "title": task_data.title,
        "description": task_data.description,
        "reward": str(task_data.reward),
        "type": task_data.type,
        "requirements": task_data.requirements,
        "media": task_data.media,
        "survey_questions": task_data.survey_questions,
        "is_active": task_data.is_active,
        "created_at": datetime.utcnow()
    }
    await db.tasks.insert_one(task_doc)
    logging.info(f"Admin created task: {task_data.title}")
    return {"success": True, "message": "Task created successfully", "task": json_serializable_doc(task_doc)}

@app.get("/api/admin/tasks", dependencies=[Depends(get_current_admin_user)])
async def get_all_tasks(status: Optional[bool] = None, task_type: Optional[str] = None):
    query = {}
    if status is not None:
        query["is_active"] = status
    if task_type:
        query["type"] = task_type
    tasks = await db.tasks.find(query).sort("created_at", -1).to_list(100)
    return {"success": True, "tasks": json_serializable_doc(tasks)}

@app.put("/api/admin/tasks/{task_id}", dependencies=[Depends(get_current_admin_user)])
async def update_task(task_id: str, task_data: Task):
    task = await db.tasks.find_one({"task_id": task_id})
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    update_data = {
        "title": task_data.title,
        "description": task_data.description,
        "reward": str(task_data.reward),
        "type": task_data.type,
        "requirements": task_data.requirements,
        "media": task_data.media,
        "survey_questions": task_data.survey_questions,
        "is_active": task_data.is_active,
        "updated_at": datetime.utcnow()
    }
    await db.tasks.update_one(
        {"task_id": task_id},
        {"$set": update_data}
    )
    logging.info(f"Admin updated task {task_id}")
    return {"success": True, "message": "Task updated successfully"}

@app.delete("/api/admin/tasks/{task_id}", dependencies=[Depends(get_current_admin_user)])
async def delete_task(task_id: str):
    task = await db.tasks.find_one({"task_id": task_id})
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    await db.tasks.delete_one({"task_id": task_id})
    # Optionally, refund or invalidate related completions
    await db.task_completions.delete_many({"task_id": task_id})
    logging.info(f"Admin deleted task {task_id}")
    return {"success": True, "message": "Task deleted successfully"}

@app.put("/api/admin/tasks/{task_id}/status", dependencies=[Depends(get_current_admin_user)])
async def update_task_status(task_id: str, update_data: UpdateTaskStatus):
    task = await db.tasks.find_one({"task_id": task_id})
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    await db.tasks.update_one(
        {"_id": task["_id"]},
        {"$set": {"is_active": update_data.is_active}}
    )
    logging.info(f"Admin updated task {task_id} status to active: {update_data.is_active}")
    return {"success": True, "message": f"Task status updated to active: {update_data.is_active}"}

@app.get("/api/admin/task-completions", dependencies=[Depends(get_current_admin_user)])
async def get_all_task_completions(
    task_id: Optional[str] = None,
    user_id: Optional[str] = None,
    status: Optional[str] = None,
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100)
):
    query = {}
    if task_id:
        query["task_id"] = task_id
    if user_id:
        query["user_id"] = user_id
    if status:
        query["status"] = status
    
    skip = (page - 1) * limit
    total = await db.task_completions.count_documents(query)
    
    completions = await db.task_completions.find(query).sort("created_at", -1).skip(skip).limit(limit).to_list(None)
    
    # Optionally join with task details
    for comp in completions:
        task = await db.tasks.find_one({"task_id": comp["task_id"]})
        if task:
            comp["task_details"] = json_serializable_doc(task)
    
    return {
        "success": True,
        "completions": json_serializable_doc(completions),
        "pagination": {
            "page": page,
            "limit": limit,
            "total": total,
            "pages": (total + limit - 1) // limit if total > 0 else 0
        }
    }

@app.put("/api/admin/task-completions/{completion_id}/status", dependencies=[Depends(get_current_admin_user)])
async def update_completion_status(completion_id: str, update_data: UpdateWithdrawalStatus):
    completion = await db.task_completions.find_one({"completion_id": completion_id})
    if not completion:
        raise HTTPException(status_code=404, detail="Completion not found")
    
    update_fields = {"status": update_data.status}
    if update_data.reason:
        update_fields["admin_notes"] = update_data.reason
    update_fields["admin_updated_at"] = datetime.utcnow()
    
    await db.task_completions.update_one(
        {"completion_id": completion_id},
        {"$set": update_fields}
    )
    
    # If rejecting, optionally refund (reverse wallet update)
    if update_data.status == "rejected":
        user = await db.users.find_one({"user_id": completion["user_id"]})
        if user:
            reward = float(completion["reward_amount"])
            await db.users.update_one(
                {"user_id": completion["user_id"]},
                {
                    "$inc": {
                        "wallet_balance": str(reward),
                        "task_earnings": str(-reward),
                        "total_earned": str(-reward)
                    }
                }
            )
            # Create refund transaction
            await db.transactions.insert_one({
                "transaction_id": str(uuid.uuid4()),
                "user_id": completion["user_id"],
                "type": "task_refund",
                "amount": str(reward),
                "currency": "KES",
                "status": "completed",
                "description": f"Refund for rejected task completion {completion_id}: {update_data.reason}",
                "created_at": datetime.utcnow(),
                "completed_at": datetime.utcnow()
            })
    
    logging.info(f"Admin updated completion {completion_id} status to {update_data.status}")
    return {"success": True, "message": "Completion status updated"}

@app.get("/api/admin/tasks/stats", dependencies=[Depends(get_current_admin_user)])
async def get_task_stats():
    # Total tasks
    total_tasks = await db.tasks.count_documents({})
    active_tasks = await db.tasks.count_documents({"is_active": True})
    
    # Total completions
    total_completions = await db.task_completions.count_documents({})
    completed_completions = await db.task_completions.count_documents({"status": "completed"})
    
    # Total earnings distributed
    earnings_agg = await db.task_completions.aggregate([
        {"$match": {"status": "completed"}},
        {"$group": {"_id": None, "total_earnings": {"$sum": {"$toDouble": "$reward_amount"}}}}
    ]).to_list(1)
    total_earnings = earnings_agg[0]["total_earnings"] if earnings_agg else 0.0
    
    # Completions by type
    by_type = await db.task_completions.aggregate([
        {"$match": {"status": "completed"}},
        {
            "$lookup": {
                "from": "tasks",
                "localField": "task_id",
                "foreignField": "task_id",
                "as": "task"
            }
        },
        {"$unwind": "$task"},
        {"$group": {"_id": "$task.type", "count": {"$sum": 1}, "earnings": {"$sum": {"$toDouble": "$reward_amount"}}}}
    ]).to_list(None)
    
    return {
        "success": True,
        "stats": {
            "total_tasks": total_tasks,
            "active_tasks": active_tasks,
            "total_completions": total_completions,
            "completed_completions": completed_completions,
            "total_earnings_distributed": total_earnings,
            "completions_by_type": json_serializable_doc(by_type)
        }
    }

# Initialize default tasks and indexes
@app.on_event("startup")
async def startup_event():
    """Initialize default tasks and data, and create database indexes."""
    # Create indexes for frequently queried fields
    logging.info("Ensuring MongoDB indexes are in place...")

    # Users collection indexes
    await db.users.create_index("user_id", unique=True, name="user_id_unique_idx")
    await db.users.create_index("email", unique=True, name="email_unique_idx")
    await db.users.create_index("phone", unique=True, name="phone_unique_idx")
    await db.users.create_index("referral_code", unique=True, sparse=True, name="referral_code_unique_idx")
    await db.users.create_index("created_at", name="user_created_at_idx")
    logging.info("Users collection indexes ensured.")

    # Transactions collection indexes
    await db.transactions.create_index("user_id", name="transaction_user_id_idx")
    await db.transactions.create_index("transaction_id", unique=True, name="transaction_id_unique_idx")
    await db.transactions.create_index("payment_details.mpesa.checkout_request_id", unique=True, sparse=True, name="mpesa_checkout_id_unique_idx")
    await db.transactions.create_index("payment_details.pesapal.order_tracking_id", unique=True, sparse=True, name="pesapal_order_tracking_id_unique_idx")
    await db.transactions.create_index("payment_details.paypal_order_id", unique=True, sparse=True, name="paypal_order_id_unique_idx")
    await db.transactions.create_index("created_at", name="transaction_created_at_idx")
    await db.transactions.create_index("status", name="transaction_status_idx")
    await db.transactions.create_index("type", name="transaction_type_idx")
    logging.info("Transactions collection indexes ensured.")

    # Referrals collection indexes
    await db.referrals.create_index("referrer_id", name="referrer_id_idx")
    await db.referrals.create_index("referred_id", unique=True, name="referred_id_unique_idx")
    await db.referrals.create_index("status", name="referral_status_idx")
    await db.referrals.create_index("created_at", name="referral_created_at_idx")
    logging.info("Referrals collection indexes ensured.")

    # Tasks collection indexes
    await db.tasks.create_index("task_id", unique=True, name="task_id_unique_idx")
    await db.tasks.create_index("is_active", name="task_is_active_idx")
    logging.info("Tasks collection indexes ensured.")

    # Task Completions collection indexes
    await db.task_completions.create_index([("user_id", 1), ("task_id", 1)], unique=True, name="user_task_completion_unique_idx")
    await db.task_completions.create_index("created_at", name="task_completion_created_at_idx")
    logging.info("Task Completions collection indexes ensured.")

    # Notifications collection indexes
    await db.notifications.create_index("user_id", name="notification_user_id_idx", sparse=True)
    await db.notifications.create_index("created_at", name="notification_created_at_idx")
    await db.notifications.create_index("is_read", name="notification_is_read_idx")
    logging.info("Notifications collection indexes ensured.")

    # Check if tasks already exist
    task_count = await db.tasks.count_documents({})
    if task_count == 0:
        default_tasks = [
            {
                "task_id": str(uuid.uuid4()),
                "title": "Complete Daily Survey",
                "description": "Answer 10 questions about consumer preferences",
                "reward": "25.00",
                "type": "survey",
                "requirements": {"questions": 10, "time_limit": 300},
                "is_active": True,
                "created_at": datetime.utcnow()
            },
            {
                "task_id": str(uuid.uuid4()),
                "title": "Watch Advertisement",
                "description": "Watch a 30-second advertisement completely",
                "reward": "5.00",
                "type": "ad",
                "requirements": {"duration": 30, "interaction": True},
                "is_active": True,
                "created_at": datetime.utcnow()
            },
            {
                "task_id": str(uuid.uuid4()),
                "title": "Write Product Review",
                "description": "Write a 100-word review of a product",
                "reward": "50.00",
                "type": "writing",
                "requirements": {"min_words": 100, "topic": "product_review"},
                "is_active": True,
                "created_at": datetime.utcnow()
            },
            {
                "task_id": str(uuid.uuid4()),
                "title": "Share on Social Media",
                "description": "Share our platform on your social media",
                "reward": "15.00",
                "type": "social",
                "requirements": {"platforms": ["facebook", "twitter", "whatsapp"]},
                "is_active": True,
                "created_at": datetime.utcnow()
            }
        ]
        
        await db.tasks.insert_many(default_tasks)
        logging.info("Default tasks initialized")
    
    # Ensure at least one admin user exists for testing purposes
    admin_user_count = await db.users.count_documents({"role": "admin"})
    if admin_user_count == 0:
        logging.info("No admin user found. Creating a default admin user...")
        admin_email = os.environ.get('DEFAULT_ADMIN_EMAIL', 'admin@example.com')
        admin_password = os.environ.get('DEFAULT_ADMIN_PASSWORD', 'adminpassword')
        
        await db.users.insert_one({
            "user_id": str(uuid.uuid4()),
            "email": admin_email,
            "password": hash_password(admin_password),
            "full_name": "Admin User",
            "phone": "254700000000",
            "referral_code": generate_referral_code(),
            "referred_by": None,
            "wallet_balance": "0.00",
            "is_activated": True, 
            "activation_amount": "500.00",
            "total_earned": "0.00",
            "total_withdrawn": "0.00",
            "referral_earnings": "0.00",
            "task_earnings": "0.00",
            "referral_count": 0,
            "created_at": datetime.utcnow(),
            "last_login": datetime.utcnow(),
            "notifications_enabled": True,
            "theme": "light",
            "role": "admin",
            "has_spun_once": False
        })
        logging.info(f"Default admin user created: {admin_email}/{admin_password}")

    # Register Pesapal IPN on startup
    try:
        ipn_id = await register_pesapal_ipn()
        if ipn_id:
            logging.info(f"Pesapal IPN registered successfully: {ipn_id}")
        else:
            logging.warning("Failed to register Pesapal IPN")
    except Exception as e:
        logging.error(f"Failed to register Pesapal IPN: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)