"""
AegisSpeak — Dummy Data Generator
Generates realistic journal entries, doctor assessments, and AI suggestions
for demo and hackathon presentation purposes.

Usage:
    python3 scripts/seed_demo.py

Requires: requests (pip install requests)
"""

import requests
import random
import time
import json
from datetime import datetime, timedelta

API = "http://localhost:4000"

# ── Demo Users ──
DEMO_PATIENTS = [
    {"email": "ram@demo.com", "password": "Demo1234", "fullName": "Ram Bahadur Tamang", "phone": "+977-9801000001"},
    {"email": "sita@demo.com", "password": "Demo1234", "fullName": "Sita Kumari Shrestha", "phone": "+977-9801000002"},
    {"email": "bikash@demo.com", "password": "Demo1234", "fullName": "Bikash Thapa Magar", "phone": "+977-9801000003"},
    {"email": "anita@demo.com", "password": "Demo1234", "fullName": "Anita Gurung", "phone": "+977-9801000004"},
    {"email": "suresh@demo.com", "password": "Demo1234", "fullName": "Suresh Adhikari", "phone": "+977-9801000005"},
]

DEMO_DOCTORS = [
    {"email": "dr.priya@demo.com", "password": "Doc12345", "fullName": "Dr. Priya Adhikari", "doctorType": "psychiatrist"},
    {"email": "dr.sarah@demo.com", "password": "Doc12345", "fullName": "Dr. Sarah Thompson", "doctorType": "psychologist"},
]

DEMO_CHVS = [
    {"email": "sunita.chv@demo.com", "password": "Chv12345", "fullName": "Sunita Didi (FCHV)", "phone": "+977-9801000010"},
]

# ── Journal Content Templates ──
JOURNAL_ENTRIES = [
    # Stress / Concern entries
    "Today was really tough. Exam pressure is mounting and I couldn't focus on anything. Kept worrying about results.",
    "I couldn't sleep again last night. My mind just wouldn't stop racing. Thought about calling a friend but it was too late.",
    "Feeling overwhelmed with deadlines. I skipped lunch because I was so anxious about the presentation tomorrow.",
    "Had an argument with my roommate. Now I feel lonely and angry at the same time. Don't want to talk to anyone.",
    "Job rejection again. Starting to question my abilities. My confidence is at an all-time low.",
    "Woke up feeling exhausted even though I slept 8 hours. Everything feels like a struggle today.",
    "Family pressure about marriage is getting to me. I feel like nobody understands what I'm going through.",
    "Panic attack during class. Had to leave the room. Embarrassed and scared it will happen again.",
    "Financial stress is crippling. Can't afford books for next semester. Feeling helpless.",
    "Comparing myself to my classmates who seem to have everything figured out. I feel behind in life.",

    # Neutral entries
    "Regular day. Went to classes, ate lunch with friends. Nothing special but nothing bad either.",
    "Studied for 4 hours. Feeling okay about the upcoming test. Had tea with my neighbor.",
    "Met my cousin for dinner. It was nice to catch up. Weather was pleasant today.",
    "Cooked dal bhat for the first time alone. It turned out okay. Watched a movie before bed.",
    "Attended a workshop on coding. It was interesting but I felt tired afterward.",

    # Positive entries
    "Great day! Finished my assignment early and went for a walk by the river. Feeling accomplished.",
    "Had a wonderful conversation with my mentor. She really believes in me. Feeling motivated!",
    "Morning yoga session was amazing. I feel so calm and centered. Grateful for this practice.",
    "Got a compliment from my professor on my research paper. Small win but it made my whole day!",
    "Practiced breathing exercises from the app. Actually helped me feel less stressed before the exam.",
    "Reconnected with an old school friend. We laughed so much. I forgot my worries for a while.",
    "Volunteered at the local community center. Helping others made me feel purposeful.",
    "Started reading a new book on mindfulness. Only 10 pages but I already feel different.",
    "Walked 5000 steps today! Setting small goals and achieving them feels great.",
    "Journaling is actually helping me organize my thoughts. I can see patterns now.",
]

# ── Doctor Assessment Templates ──
def generate_assessment(sentiment_score):
    """Generate realistic doctor assessment based on patient sentiment."""
    if sentiment_score < 30:
        return {
            "depressionScore": random.randint(6, 9),
            "stressLevel": random.randint(7, 10),
            "anxietyLevel": random.randint(6, 9),
            "clinicalNotes": random.choice([
                "Patient shows significant stress indicators. Recommend increased monitoring and CBT exercises.",
                "Elevated anxiety patterns observed across multiple entries. Consider guided intervention.",
                "Sleep disruption and social withdrawal noted. Suggest structured activity schedule.",
            ]),
            "recommendsConsultation": True,
        }
    elif sentiment_score < 60:
        return {
            "depressionScore": random.randint(3, 5),
            "stressLevel": random.randint(4, 6),
            "anxietyLevel": random.randint(3, 6),
            "clinicalNotes": random.choice([
                "Moderate stress levels. Patient appears to be coping but could benefit from relaxation techniques.",
                "Some fluctuation in mood patterns. Ongoing journaling and breathing exercises recommended.",
                "Patient showing mixed signals. Continue monitoring with current intervention plan.",
            ]),
            "recommendsConsultation": random.choice([True, False]),
        }
    else:
        return {
            "depressionScore": random.randint(1, 3),
            "stressLevel": random.randint(1, 4),
            "anxietyLevel": random.randint(1, 3),
            "clinicalNotes": random.choice([
                "Patient showing strong improvement. Positive coping mechanisms in place.",
                "Good progress. Patient is engaged with therapeutic activities and maintaining social connections.",
                "Stable and improving. Recommend transitioning to maintenance-level monitoring.",
            ]),
            "recommendsConsultation": False,
        }


def main():
    print("=" * 60)
    print("  AegisSpeak — Demo Data Seeder")
    print("=" * 60)

    # Step 1: Login as admin
    print("\n🔐 Logging in as admin...")
    res = requests.post(f"{API}/api/auth/login", json={
        "email": "admin@aegisspeak.com",
        "password": "AegisAdmin@2026"
    })
    admin_data = res.json()
    if not admin_data.get("ok"):
        print(f"❌ Admin login failed: {admin_data}")
        return
    admin_token = admin_data["data"]["token"]
    headers = {"Authorization": f"Bearer {admin_token}", "Content-Type": "application/json"}
    print(f"✅ Admin authenticated")

    # Step 2: Create patients
    print("\n👤 Creating patients...")
    patient_tokens = {}
    patient_anon_ids = {}
    for p in DEMO_PATIENTS:
        res = requests.post(f"{API}/api/iam/users", headers=headers, json={**p, "role": "patient"})
        data = res.json()
        if data.get("ok"):
            user = data["data"]["user"]
            print(f"   ✅ {user['fullName']} → Anonymous ID: {user['anonymousId']}")
            patient_anon_ids[p["email"]] = user["anonymousId"]
            # Login as patient to get token
            login_res = requests.post(f"{API}/api/auth/login", json={"email": p["email"], "password": p["password"]})
            patient_tokens[p["email"]] = login_res.json()["data"]["token"]
        else:
            print(f"   ⚠️ {p['fullName']}: {data.get('error', {}).get('message', 'exists')}")
            # Try login anyway
            login_res = requests.post(f"{API}/api/auth/login", json={"email": p["email"], "password": p["password"]})
            ld = login_res.json()
            if ld.get("ok"):
                patient_tokens[p["email"]] = ld["data"]["token"]
                patient_anon_ids[p["email"]] = ld["data"]["user"].get("anonymousId")

    # Step 3: Create doctors
    print("\n🩺 Creating doctors...")
    doctor_tokens = {}
    for d in DEMO_DOCTORS:
        res = requests.post(f"{API}/api/iam/users", headers=headers, json={**d, "role": "doctor"})
        data = res.json()
        if data.get("ok"):
            print(f"   ✅ {data['data']['user']['fullName']}")
        else:
            print(f"   ⚠️ {d['fullName']}: exists")
        login_res = requests.post(f"{API}/api/auth/login", json={"email": d["email"], "password": d["password"]})
        ld = login_res.json()
        if ld.get("ok"):
            doctor_tokens[d["email"]] = ld["data"]["token"]

    # Step 4: Create CHVs
    print("\n👩‍⚕️ Creating CHVs...")
    for c in DEMO_CHVS:
        res = requests.post(f"{API}/api/iam/users", headers=headers, json={**c, "role": "chv"})
        data = res.json()
        if data.get("ok"):
            print(f"   ✅ {data['data']['user']['fullName']}")
        else:
            print(f"   ⚠️ {c['fullName']}: exists")

    # Step 5: Create journal entries for each patient
    print("\n📝 Creating journal entries...")
    total_entries = 0
    entry_ids = []

    for email, token in patient_tokens.items():
        pt_headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}
        num_entries = random.randint(8, 15)
        name = next((p["fullName"] for p in DEMO_PATIENTS if p["email"] == email), email)
        anon_id = patient_anon_ids.get(email, "?")

        for i in range(num_entries):
            content = random.choice(JOURNAL_ENTRIES)
            entry_type = random.choices(["text", "voice", "wearable"], weights=[70, 20, 10])[0]

            body = {"type": entry_type, "content": content}

            # Add wearable data sometimes
            if entry_type == "wearable":
                body["wearableData"] = {
                    "heartRate": random.randint(60, 100),
                    "sleepHours": round(random.uniform(4, 9), 1),
                    "steps": random.randint(1000, 12000),
                    "stressLevel": random.randint(1, 10),
                }

            # Add voice metrics sometimes
            if entry_type == "voice":
                body["voiceMetrics"] = {
                    "jitter": round(random.uniform(0.01, 0.05), 3),
                    "pitch": round(random.uniform(100, 250), 1),
                    "energy": round(random.uniform(0.3, 0.9), 2),
                    "speechRate": random.randint(80, 160),
                }

            res = requests.post(f"{API}/api/journals", headers=pt_headers, json=body)
            data = res.json()
            if data.get("ok"):
                journal = data["data"]["journal"]
                entry_ids.append(journal["id"])
                total_entries += 1

        print(f"   📝 {name} ({anon_id}): {num_entries} entries created")

    print(f"\n   Total entries: {total_entries}")

    # Step 6: Doctor assessments on random entries
    print("\n🩺 Doctor assessments...")
    assessed = 0
    if entry_ids and doctor_tokens:
        doctor_email = list(doctor_tokens.keys())[0]
        dr_headers = {"Authorization": f"Bearer {doctor_tokens[doctor_email]}", "Content-Type": "application/json"}

        # Get doctor queue
        queue_res = requests.get(f"{API}/api/doctor/queue", headers=dr_headers)
        queue_data = queue_res.json()

        if queue_data.get("ok"):
            patients_in_queue = queue_data["data"]["patients"]
            print(f"   Patients in queue: {len(patients_in_queue)}")

            for patient in patients_in_queue:
                # Read their journals
                journals_res = requests.get(f"{API}/api/doctor/journals/{patient['anonymousId']}", headers=dr_headers)
                journals = journals_res.json()["data"]["journals"]

                # Assess 2-4 random entries per patient
                to_assess = random.sample(journals, min(random.randint(2, 4), len(journals)))
                for entry in to_assess:
                    sentiment_score = entry.get("sentiment", {}).get("score", 50) if entry.get("sentiment") else 50
                    assessment = generate_assessment(sentiment_score)
                    assess_res = requests.post(
                        f"{API}/api/doctor/assess/{entry['id']}",
                        headers=dr_headers,
                        json=assessment
                    )
                    if assess_res.json().get("ok"):
                        assessed += 1

                print(f"   🩺 Assessed {patient['anonymousId']}: {len(to_assess)} entries")

    print(f"\n   Total assessments: {assessed}")

    # Summary
    print("\n" + "=" * 60)
    print("  ✅ Demo data seeding complete!")
    print("=" * 60)
    print(f"\n  📊 Summary:")
    print(f"     Patients: {len(patient_tokens)}")
    print(f"     Doctors: {len(doctor_tokens)}")
    print(f"     CHVs: {len(DEMO_CHVS)}")
    print(f"     Journal Entries: {total_entries}")
    print(f"     Doctor Assessments: {assessed}")
    print(f"\n  🔑 Demo Credentials:")
    print(f"     Admin: admin@aegisspeak.com / AegisAdmin@2026")
    print(f"     Patient: ram@demo.com / Demo1234")
    print(f"     Doctor: dr.priya@demo.com / Doc12345")
    print(f"     CHV: sunita.chv@demo.com / Chv12345")
    print()


if __name__ == "__main__":
    main()
