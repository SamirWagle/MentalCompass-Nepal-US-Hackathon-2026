#!/usr/bin/env python3
"""
AegisSpeak — Full Mock Data Generator
Uses faker to generate 30 days of realistic mental health journal data.
Simulates both STABLE and DECLINING mental health trajectories.

Usage:
  pip install faker requests
  python3 scripts/seed_full.py [--sql] [--api] [--base-url http://localhost:4000]

Flags:
  --sql        Output INSERT statements to scripts/seed_full.sql
  --api        POST data directly to the AegisSpeak API (default)
  --base-url   API base URL (default: http://localhost:4000)
"""

import argparse
import json
import math
import random
import sys
import time
import uuid
from datetime import datetime, timedelta, timezone

try:
    from faker import Faker
    import requests
except ImportError:
    print("Missing dependencies. Run: pip install faker requests")
    sys.exit(1)

fake = Faker()
Faker.seed(2026)
random.seed(2026)

# ─────────────────────────────────────────────
# Config
# ─────────────────────────────────────────────
ADMIN_EMAIL = "admin@aegisspeak.com"
ADMIN_PASSWORD = "AegisAdmin@2026"

DOCTORS = [
    {"fullName": "Dr. Priya Sharma", "email": "dr.priya@aegisspeak.com", "password": "Doctor@2026!", "doctorType": "psychiatrist"},
    {"fullName": "Dr. Ramesh Adhikari", "email": "dr.ramesh@aegisspeak.com", "password": "Doctor@2026!", "doctorType": "psychologist"},
    {"fullName": "Dr. Sunita Khadka", "email": "dr.sunita@aegisspeak.com", "password": "Doctor@2026!", "doctorType": "general"},
]

CHVS = [
    {"fullName": "Kamala Devi (FCHV)", "email": "kamala.chv@aegisspeak.com", "password": "Chv@2026!", "phone": "9841234567"},
    {"fullName": "Sita Thapa (FCHV)", "email": "sita.chv@aegisspeak.com", "password": "Chv@2026!", "phone": "9851234567"},
]

# Two STABLE patients (mental health improving/steady over 30 days)
PATIENTS_STABLE = [
    {
        "fullName": "Arun Tamang",
        "email": "arun.stable@aegisspeak.com",
        "password": "Patient@2026!",
        "phone": "9861234567",
        "trajectory": "stable",
        "location": "Kathmandu",
    },
    {
        "fullName": "Meera Gurung",
        "email": "meera.stable@aegisspeak.com",
        "password": "Patient@2026!",
        "phone": "9871111111",
        "trajectory": "stable",
        "location": "Pokhara",
    },
]

# Two DECLINING patients (mental health worsening over 30 days)
PATIENTS_DECLINING = [
    {
        "fullName": "Bijay Karki",
        "email": "bijay.decline@aegisspeak.com",
        "password": "Patient@2026!",
        "phone": "9867654321",
        "trajectory": "declining",
        "location": "Lalitpur",
    },
    {
        "fullName": "Sunita Rai",
        "email": "sunita.decline@aegisspeak.com",
        "password": "Patient@2026!",
        "phone": "9875544332",
        "trajectory": "declining",
        "location": "Bhaktapur",
    },
]

ALL_PATIENTS = PATIENTS_STABLE + PATIENTS_DECLINING

# ─────────────────────────────────────────────
# Journal text corpus
# ─────────────────────────────────────────────
JOURNAL_POSITIVE = [
    "Had a productive day at work. Managed to complete two tasks I had been putting off. Felt accomplished and calm in the evening.",
    "Went for a walk in the park this morning. The fresh air really helped clear my mind. Grateful for small moments like these.",
    "Spoke with an old friend today. It was wonderful to reconnect. Feeling lighter and more hopeful.",
    "Cooked a healthy meal and slept well last night. Energy levels are good. Ready to take on tomorrow.",
    "Practiced breathing exercises for 10 minutes. My stress dropped noticeably. I think I'll make this a daily habit.",
    "Good day overall. Work was manageable, and I spent quality time with family in the evening. Feeling balanced.",
    "Started journaling every morning. It helps to get thoughts out of my head before the day begins.",
    "Completed my goal of drinking enough water today. Small wins matter. Proud of myself.",
    "Meditation session went well. I noticed I was ruminating less than usual. Progress feels real.",
    "Finished reading an article on sleep hygiene. Implemented some tips and actually slept better.",
]

JOURNAL_NEUTRAL = [
    "Average day, nothing remarkable. Felt a little tired but pushed through. Tomorrow might be better.",
    "Work was okay. Had a minor disagreement with a colleague but resolved it. Feeling neutral.",
    "Mixed emotions today. Some things went well, some didn't. Trying to stay balanced.",
    "Distracted today — couldn't focus well. Took short breaks which helped a little.",
    "Tired from the week. Looking forward to the weekend. Nothing bad, just drained.",
    "Spent most of the day indoors. Felt a bit restless but managed to get some things done.",
    "Had a busy day. Not much time to breathe. Need to plan better tomorrow.",
    "Sleep wasn't great last night. Managed okay during the day but feeling slow.",
    "Normal day — work, home, sleep. Not bad, not great. Just existing for now.",
    "A quiet day. Did some light reading. Not very motivated but not stressed either.",
]

JOURNAL_STRESSED = [
    "Exhausted and overwhelmed today. Too many deadlines and not enough time. Struggling to keep up.",
    "Couldn't sleep last night. My mind kept racing with worries. Feeling drained this morning.",
    "Work pressure is getting to me. I feel like I'm falling behind no matter how hard I try.",
    "Lonely today. Didn't talk to anyone meaningful. Missing connection and feeling isolated.",
    "Worried about finances again. The uncertainty is constant and wearing me down.",
    "Had a difficult conversation with family. Feeling misunderstood and emotionally tired.",
    "Anxiety was high today. Simple tasks felt overwhelming. Had to take a break mid-afternoon.",
    "Struggling to find motivation. Everything feels like a burden. I know it will pass, but right now it's hard.",
    "Headache all day, couldn't concentrate. Stress is manifesting physically now.",
    "Feeling behind on everything — work, health, relationships. Hard to know where to start.",
]

JOURNAL_CRISIS = [
    "Feel completely hopeless today. Can't see a way forward. Everything feels like too much.",
    "Overwhelmed by sadness. Crying without knowing why. Reaching out tomorrow if this continues.",
    "Terrible night. Dark thoughts kept coming. I told a trusted friend, which helped a little, but I'm still struggling.",
    "Panic attack at work today. Had to step away. So embarrassed and exhausted.",
    "Three consecutive sleepless nights. I feel detached from everything. Something needs to change.",
]


def pick_journal(trajectory: str, day_index: int, total_days: int = 30) -> tuple[str, float]:
    """Pick journal text and return (text, sentiment_score 0-100)"""
    progress = day_index / max(total_days - 1, 1)  # 0 = day 1, 1 = day 30

    if trajectory == "stable":
        # Starts at 55-65, improves to 70-85 by end
        base_score = 55 + progress * 25 + random.uniform(-8, 8)
        base_score = max(40, min(92, base_score))
        if base_score >= 70:
            text = random.choice(JOURNAL_POSITIVE)
        elif base_score >= 50:
            text = random.choice(JOURNAL_NEUTRAL)
        else:
            text = random.choice(JOURNAL_STRESSED)
    else:
        # Starts at 70, declines to 25-35 by end
        base_score = 70 - progress * 45 + random.uniform(-8, 8)
        base_score = max(15, min(80, base_score))
        if base_score < 30:
            text = random.choice(JOURNAL_CRISIS)
        elif base_score < 45:
            text = random.choice(JOURNAL_STRESSED)
        elif base_score < 60:
            text = random.choice(JOURNAL_NEUTRAL)
        else:
            text = random.choice(JOURNAL_POSITIVE)

    return text, round(base_score, 1)


def make_wearable(trajectory: str, day_index: int, total_days: int = 30) -> dict:
    """Generate mock wearable data matching the trajectory."""
    progress = day_index / max(total_days - 1, 1)

    if trajectory == "stable":
        heart_rate = int(68 + random.uniform(-6, 6))
        sleep_hours = round(7.2 - progress * 0.3 + random.uniform(-0.5, 0.7), 1)
        steps = int(7500 + progress * 1500 + random.uniform(-1000, 1000))
        stress_level = round(4.0 - progress * 1.5 + random.uniform(-0.5, 0.5), 1)
    else:
        heart_rate = int(72 + progress * 15 + random.uniform(-5, 5))
        sleep_hours = round(7.0 - progress * 3.0 + random.uniform(-0.5, 0.5), 1)
        steps = int(8000 - progress * 5000 + random.uniform(-500, 500))
        stress_level = round(3.5 + progress * 5.5 + random.uniform(-0.5, 0.5), 1)

    return {
        "heartRate": max(55, min(120, heart_rate)),
        "sleepHours": max(3.0, min(9.5, sleep_hours)),
        "steps": max(500, min(15000, steps)),
        "stressLevel": max(1.0, min(10.0, stress_level)),
    }


# ─────────────────────────────────────────────
# SQL output helpers
# ─────────────────────────────────────────────
def to_sql_string(v) -> str:
    if v is None:
        return "NULL"
    if isinstance(v, bool):
        return "TRUE" if v else "FALSE"
    if isinstance(v, (int, float)):
        return str(v)
    escaped = str(v).replace("'", "''")
    return f"'{escaped}'"


# ─────────────────────────────────────────────
# API client
# ─────────────────────────────────────────────
class AegisClient:
    def __init__(self, base_url: str):
        self.base_url = base_url.rstrip("/")
        self.admin_token = None
        self.tokens = {}  # user_id → token

    def _post(self, path: str, data: dict, token: str = None) -> dict:
        headers = {"Content-Type": "application/json"}
        if token:
            headers["Authorization"] = f"Bearer {token}"
        resp = requests.post(f"{self.base_url}{path}", json=data, headers=headers, timeout=10)
        return resp.json()

    def _get(self, path: str, token: str = None) -> dict:
        headers = {}
        if token:
            headers["Authorization"] = f"Bearer {token}"
        resp = requests.get(f"{self.base_url}{path}", headers=headers, timeout=10)
        return resp.json()

    def login(self, email: str, password: str) -> str:
        result = self._post("/api/auth/login", {"email": email, "password": password})
        if result.get("ok") and result.get("token"):
            return result["token"]
        raise RuntimeError(f"Login failed for {email}: {result}")

    def create_user(self, payload: dict) -> dict:
        result = self._post("/api/iam/users", payload, self.admin_token)
        if result.get("ok"):
            return result.get("user") or result.get("data", {}).get("user") or {}
        raise RuntimeError(f"Create user failed: {result}")

    def create_patient_as_chv(self, payload: dict, chv_token: str) -> dict:
        result = self._post("/api/chv/create-patient", payload, chv_token)
        if result.get("ok"):
            return result.get("user") or result.get("data", {}).get("user") or {}
        raise RuntimeError(f"CHV create patient failed: {result}")

    def post_journal(self, payload: dict, token: str) -> dict:
        result = self._post("/api/journals", payload, token)
        if result.get("ok"):
            return result
        print(f"  ⚠ Journal post warning: {result.get('error', {}).get('message', result)}")
        return {}

    def post_assessment(self, entry_id: str, payload: dict, doctor_token: str) -> dict:
        result = self._post(f"/api/doctor/assess/{entry_id}", payload, doctor_token)
        return result

    def verify_doctor_payment(self, doctor_token: str) -> dict:
        result = self._post("/api/payments/mock-checkout", {}, doctor_token)
        return result


# ─────────────────────────────────────────────
# Main seed logic
# ─────────────────────────────────────────────
def seed_via_api(base_url: str):
    print(f"\n🌱 AegisSpeak Full Seed — targeting {base_url}\n")
    client = AegisClient(base_url)

    # 1. Login as SuperAdmin
    print("1/5 Logging in as SuperAdmin...")
    client.admin_token = client.login(ADMIN_EMAIL, ADMIN_PASSWORD)
    print(f"   ✅ Admin token acquired")

    # 2. Create Doctors
    print("\n2/5 Creating doctors...")
    doctor_tokens = []
    for doc in DOCTORS:
        try:
            user = client.create_user({
                "email": doc["email"],
                "password": doc["password"],
                "fullName": doc["fullName"],
                "role": "doctor",
                "doctorType": doc["doctorType"],
            })
            token = client.login(doc["email"], doc["password"])
            doctor_tokens.append(token)
            # Verify payment for all doctors
            client.verify_doctor_payment(token)
            print(f"   ✅ Doctor created: {doc['fullName']} ({doc['doctorType']}) — payment verified")
        except Exception as e:
            print(f"   ⚠ Doctor {doc['fullName']}: {e} (may already exist)")
            try:
                token = client.login(doc["email"], doc["password"])
                doctor_tokens.append(token)
                client.verify_doctor_payment(token)
            except Exception:
                pass

    # 3. Create CHVs
    print("\n3/5 Creating CHVs (Mini Admins)...")
    chv_tokens = []
    for chv in CHVS:
        try:
            user = client.create_user({
                "email": chv["email"],
                "password": chv["password"],
                "fullName": chv["fullName"],
                "role": "chv",
                "phone": chv["phone"],
            })
            token = client.login(chv["email"], chv["password"])
            chv_tokens.append(token)
            print(f"   ✅ CHV created: {chv['fullName']}")
        except Exception as e:
            print(f"   ⚠ CHV {chv['fullName']}: {e} (may already exist)")
            try:
                token = client.login(chv["email"], chv["password"])
                chv_tokens.append(token)
            except Exception:
                pass

    # 4. Create Patients (first two via admin, last two via CHV)
    print("\n4/5 Creating patients and generating 30 days of journals...")
    patient_data = []

    for i, patient in enumerate(ALL_PATIENTS):
        trajectory = patient["trajectory"]
        try:
            if i < 2:
                # Created by super admin
                user = client.create_user({
                    "email": patient["email"],
                    "password": patient["password"],
                    "fullName": patient["fullName"],
                    "role": "patient",
                    "phone": patient["phone"],
                })
            else:
                # Created by CHV
                chv_token = chv_tokens[i % len(chv_tokens)] if chv_tokens else client.admin_token
                user = client.create_patient_as_chv({
                    "email": patient["email"],
                    "password": patient["password"],
                    "fullName": patient["fullName"],
                    "phone": patient["phone"],
                }, chv_token)

            token = client.login(patient["email"], patient["password"])
            anon_id = user.get("anonymousId", "JRN-????")
            print(f"\n   ✅ Patient: {patient['fullName']} ({trajectory.upper()}) — {anon_id}")
            patient_data.append({"user": user, "token": token, "trajectory": trajectory, "anon_id": anon_id})
        except Exception as e:
            print(f"   ⚠ Patient {patient['fullName']}: {e} (may already exist)")
            try:
                token = client.login(patient["email"], patient["password"])
                patient_data.append({"user": {}, "token": token, "trajectory": trajectory, "anon_id": "JRN-????"})
            except Exception:
                pass
            continue

    print()
    # 5. Generate 30 days of journal entries per patient
    all_created_entries = []
    base_date = datetime.now(timezone.utc) - timedelta(days=30)

    for pd in patient_data:
        token = pd["token"]
        trajectory = pd["trajectory"]
        anon_id = pd["anon_id"]
        entries_for_patient = []
        print(f"   📔 Generating 30 days for {anon_id} ({trajectory})...")

        for day in range(30):
            entry_date = base_date + timedelta(days=day)
            journal_text, sentiment_score = pick_journal(trajectory, day)
            wearable = make_wearable(trajectory, day)
            entry_type = random.choices(["text", "text", "voice", "wearable"], weights=[5, 5, 2, 2])[0]

            payload = {
                "type": entry_type,
                "content": journal_text if entry_type != "wearable" else "",
                "wearableData": wearable,
                "voiceMetrics": {
                    "jitter": round(0.02 + random.uniform(-0.01, 0.02), 3),
                    "pitch": round(180 + random.uniform(-30, 30), 1),
                    "energy": round(0.6 + random.uniform(-0.2, 0.2), 2),
                    "speechRate": int(120 + random.uniform(-30, 30)),
                } if entry_type in ("voice", "call") else None,
            }

            result = client.post_journal(payload, token)
            if result.get("journal"):
                entry_id = result["journal"].get("id")
                entries_for_patient.append({"id": entry_id, "day": day, "anon_id": anon_id})
                all_created_entries.append({"id": entry_id, "anon_id": anon_id})
            time.sleep(0.05)  # be gentle with the server

        pd["entries"] = entries_for_patient
        print(f"      ✅ {len(entries_for_patient)} entries created")

    # 6. Doctor assessments on ~30% of entries
    print("\n5/5 Adding doctor assessments to ~30% of entries...")
    if doctor_tokens and all_created_entries:
        assessed = 0
        for entry_info in all_created_entries:
            if random.random() > 0.30:
                continue
            doctor_token = random.choice(doctor_tokens)
            dep_score = random.randint(2, 8)
            stress_score = random.randint(2, 9)
            anx_score = random.randint(1, 8)
            payload = {
                "depressionScore": dep_score,
                "stressLevel": stress_score,
                "anxietyLevel": anx_score,
                "clinicalNotes": random.choice([
                    "Patient shows resilience. Encourage continuation of current habits.",
                    "Some indicators of elevated stress. Recommend breathing exercises.",
                    "Patterns consistent with manageable wellness strain. Monitor closely.",
                    "Positive trajectory noted. Reinforce existing support structures.",
                    "Concerning patterns in recent entries. Consider follow-up.",
                ]),
                "recommendsConsultation": dep_score >= 7 and stress_score >= 7,
            }
            result = client.post_assessment(entry_info["id"], payload, doctor_token)
            if result.get("ok"):
                assessed += 1
            time.sleep(0.05)
        print(f"   ✅ {assessed} assessments added")

    print("\n✨ Seed complete!")
    print(f"   {len(patient_data)} patients | {len(DOCTORS)} doctors | {len(CHVS)} CHVs")
    print(f"   {len(all_created_entries)} journal entries total")
    print("\nTest credentials:")
    print(f"  SuperAdmin : {ADMIN_EMAIL} / {ADMIN_PASSWORD}")
    for p in ALL_PATIENTS:
        print(f"  Patient    : {p['email']} / {p['password']} ({p['trajectory']})")
    for d in DOCTORS:
        print(f"  Doctor     : {d['email']} / {d['password']}")
    for c in CHVS:
        print(f"  CHV        : {c['email']} / {c['password']}")


def seed_to_sql():
    """Generate SQL INSERT statements for direct DB use."""
    print("\n📄 Generating SQL seed file...\n")
    lines = [
        "-- AegisSpeak Full Seed SQL",
        f"-- Generated: {datetime.now().isoformat()}",
        "",
        "-- NOTE: This is a flat-file JSON store backend. SQL output is for reference only.",
        "-- Run seed_full.py --api to populate the live server.",
        "",
        "/* Users */",
    ]
    for p in ALL_PATIENTS:
        uid = str(uuid.uuid4())
        lines.append(
            f"INSERT INTO users (id, email, fullName, role, trajectory) VALUES "
            f"({to_sql_string(uid)}, {to_sql_string(p['email'])}, {to_sql_string(p['fullName'])}, 'patient', {to_sql_string(p['trajectory'])});"
        )
    for d in DOCTORS:
        uid = str(uuid.uuid4())
        lines.append(
            f"INSERT INTO users (id, email, fullName, role, doctorType) VALUES "
            f"({to_sql_string(uid)}, {to_sql_string(d['email'])}, {to_sql_string(d['fullName'])}, 'doctor', {to_sql_string(d['doctorType'])});"
        )
    sql_path = "scripts/seed_full.sql"
    with open(sql_path, "w") as f:
        f.write("\n".join(lines) + "\n")
    print(f"✅ SQL written to {sql_path}")


# ─────────────────────────────────────────────
# Entry point
# ─────────────────────────────────────────────
if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="AegisSpeak full seed script")
    parser.add_argument("--sql", action="store_true", help="Output SQL seed file")
    parser.add_argument("--api", action="store_true", help="Seed via API (default)")
    parser.add_argument("--base-url", default="http://localhost:4000", help="API base URL")
    args = parser.parse_args()

    if args.sql:
        seed_to_sql()

    if args.api or not args.sql:
        seed_via_api(args.base_url)
