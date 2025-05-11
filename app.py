import threading
import time
import json
import base64
import io
from PIL import ImageGrab
import cv2
import requests
from flask import Flask, jsonify, abort
from agents.context_agent.agent import root_agent as context_agent
from agents.summary_agent.agent import root_agent as summary_agent
from agents.schemas import PayloadFormat
# ADK API server configuration\NAMESPACE_DEMO
ADK_SERVER = "http://localhost:8000"  # change if your ADK API runs elsewhere
CONTEXT_AGENT = "context_agent"       # your context-agent name
SUMMARY_AGENT = "summary_agent"       # your summary-agent name
USER_ID = "dev_user"
SESSION_ID_CTX = "sess_ctx"
SESSION_ID_SUM = "sess_sum"

# Global state for the latest recommendation
latest_payload = None

# Ensure sessions exist in ADK API server
def ensure_session(agent: str, session_id: str):
    url = f"{ADK_SERVER}/apps/{agent}/users/{USER_ID}/sessions/{session_id}"
    resp = requests.post(url, json={})
    resp.raise_for_status()

# Send a message (string) to an ADK agent via API server
def post_message(agent: str, session_id: str, message: str) -> list:
    url = f"{ADK_SERVER}/run"     #apps/{agent}/users/{USER_ID}/sessions/{session_id}/messages"
    data= {"app_name": agent,
"user_id": USER_ID,
"session_id": session_id,
"new_message": {
    "role": "user",
    "parts": [{
    "text": message
    }]
}}
    resp = requests.post(url, json=data)
    resp.raise_for_status()
    result = resp.json()
    # ADK API may return a list of events directly or wrap under 'events'
    if isinstance(result, list):
        return result
    if isinstance(result, dict) and 'events' in result:
        return result['events']
    # unexpected format
    return []
    #return resp.json().get("events", [])
# import list e optional
from typing import List, Optional
def extract_final_text(events: List[dict]) -> Optional[str]:
    for ev in events:
        # ADK events should have an 'event_type'
        if ev.get('event_type') != 'final_response':
            continue
        # content.parts is a list of parts; take first non-empty text
        content = ev.get('content', {})
        parts = content.get('parts', [])
        for part in parts:
            text = part.get('text')
            if text:
                return text
    return None

# Background thread: monitor camera, detect return, capture screenshot, call agents
def monitor_camera():
    global latest_payload
    # load face detector
    face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
    cap = cv2.VideoCapture(0)
    if not cap.isOpened():
        raise RuntimeError("Could not open camera")

    # prepare ADK sessions
    ensure_session(CONTEXT_AGENT, SESSION_ID_CTX)
    ensure_session(SUMMARY_AGENT, SESSION_ID_SUM)

    idle_prev = False
    while True:
        ret, frame = cap.read()
        if not ret:
            time.sleep(1)
            continue
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        faces = face_cascade.detectMultiScale(gray, scaleFactor=1.1, minNeighbors=5)
        idle_now = len(faces) == 0

        # on transition from idle to active
        if not idle_now and idle_prev:
            # capture screen
            screenshot = ImageGrab.grab()
            buf = io.BytesIO()
            screenshot.save(buf, format="PNG")
            img_b64 = base64.b64encode(buf.getvalue()).decode('utf-8')
            # build JSON for context agent
            context_input = json.dumps({"screenshot": img_b64})

            # 1) get context summary
            events1 = post_message(CONTEXT_AGENT, SESSION_ID_CTX, context_input)
            summary_text = extract_final_text(events1)
            # for ev in events1:
            #     if ev.get('event_type') == 'final_response':
            #         summary_text = ev['content']['parts'][0]['text']
            #         break
            if not summary_text:
                idle_prev = idle_now
                continue

            # 2) pass summary to summary agent
            events2 = post_message(SUMMARY_AGENT, SESSION_ID_SUM, summary_text)
            final_text = extract_final_text(events2)
            # for ev in events2:
            #     if ev.get('event_type') == 'final_response':
            #         final_text = ev['content']['parts'][0]['text']
            #         break
            if final_text:
                try:
                    raw = json.loads(final_text)
                    # Validate against Pydantic schema
                    latest_payload = PayloadFormat(**raw)
                except json.JSONDecodeError:
                    latest_payload = {"error": "Invalid JSON from summary agent"}

        idle_prev = idle_now
        time.sleep(2)

# Start monitoring in a daemon thread
thread = threading.Thread(target=monitor_camera, daemon=True)
thread.start()

# Flask app to serve the latest payload
app = Flask(__name__)

@app.route('/recommendation', methods=['GET'])
def get_recommendation():
    if latest_payload is None:
        return jsonify({"message": "No recommendation available yet"}), 204
    return jsonify(latest_payload)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
