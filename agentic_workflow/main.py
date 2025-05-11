import asyncio
import time
import cv2
import mediapipe as mp
import os
import json
import subprocess
from pydantic import BaseModel, Field
from typing import List

from smolagents import OpenAIServerModel

from smolagents import InferenceClientModel

from dotenv import load_dotenv

from smolagents import tool
from smolagents.agents import ToolCallingAgent

load_dotenv()

class PayloadFormat(BaseModel):
    general_description: str = Field(description="general description of what the user was doing before the interruption")
    suggested_current_task: str = Field(description="current task the user should start working on")

from smolagents._function_type_hints_utils import get_json_schema

def retun_payload(general_description: str , suggested_current_task: str) -> PayloadFormat:
    """
    This tool generates a structured payload based on the user's context and recommended task.

    Args:
        general_description (str): A general description of what the user was doing before the interruption.
        suggested_current_task (str): The task the user should start working on after the interruption.

    Returns:
        PayloadFormat: A structured object containing the general description and suggested current task.
    """
    return PayloadFormat(general_description = general_description, suggested_current_task = suggested_current_task)

print(get_json_schema(retun_payload))

@tool
def retun_payload(general_description: str, suggested_current_task: str) -> dict:
    """
    This tool generates a structured payload based on the user's context and recommended task.

    Args:
        general_description (str): A general description of what the user was doing before the interruption.
        suggested_current_task (str): The task the user should start working on after the interruption.

    Returns:
        str: a commang to end session
    """


    with open(f"payload.json", "w", encoding="utf-8") as out:
        out.write(json.dumps(PayloadFormat(general_description = general_description, suggested_current_task = suggested_current_task).dict(), indent=2))

    return "end your session"

model = OpenAIServerModel(
    model_id="gpt-4o",
    api_base="https://api.openai.com/v1",
    api_key=os.environ["OPENAI_API_KEY"],
)


output_agent = ToolCallingAgent(
    tools=[retun_payload],
    model = model,
    max_steps=1 
)


output_agent.prompt_templates['system_prompt'] = """
You are a focused coding assistant that helps developers resume work after a break.
Use the `retun_payload` tool to output exactly:
  - general_description: what they were doing,
  - suggested_current_task: what to work on next.
"""


def dump_all_json_to_string(folder_path: str) -> str:
    all_data = {}

    for filename in os.listdir(folder_path):
        if filename.endswith(".json"):
            filepath = os.path.join(folder_path, filename)
            with open(filepath, "r", encoding="utf-8") as f:
                try:
                    data = json.load(f)
                    all_data[filename] = data
                except json.JSONDecodeError as e:
                    print(f"Error decoding {filename}: {e}")
    
    # Combine into one string (pretty-printing optional)
    return json.dumps(all_data, indent=2)


def scan_folder(root_dir, extensions=None, exceptions = None):
    """
    Walk root_dir and build a nested dict:
    {
      "subfolder": { ... },
      "file.py": "file contents\n..."
    }
    Only files matching extensions (if given) are included.
    """
    tree = {}
    for name in sorted(os.listdir(root_dir)):
        path = os.path.join(root_dir, name)

        if exceptions is not None and name in exceptions:
            continue

        if os.path.isdir(path):
            tree[name] = scan_folder(path, extensions)
        else:
            if extensions is None or os.path.splitext(name)[1] in extensions:
                print(f"Reading {path}")
                with open(path, encoding="utf-8") as f:
                    tree[name] = f.read()
    return tree




idle = False
popup_active = False
context_idx = 1
cap = cv2.VideoCapture(0)

root_path = "/Users/d/Programming/gldr/google-adk-start/adk-streaming"
buffer_path = "/Users/d/Programming/gldr/google-adk-start/agentic_workflow/project_buffer"

#haar cascade model
face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')

idle_buffer = {
    "now":False,
    "prev":False
}  # Buffer to store the idle state

while True:

    idle_buffer["prev"] = idle_buffer["now"]  # Store the previous state

    if not cap.isOpened():
        print("Error: Could not open video.")
        break

    ret, frame = cap.read()

    print("picture taken")

    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)  # Convert to grayscale (required by detector)
    faces = face_cascade.detectMultiScale(gray, scaleFactor=1.1, minNeighbors=5)

    idle_buffer["now"] = len(faces) == 0  # True if no faces are detected 


    if not idle_buffer["now"]:
        #retrieve context and push it in the buffer
        project_tree = scan_folder(root_path, extensions=[".py", ".txt", ".json"], exceptions=["project_buffer",".DS_Store", ".git", ".idea", ".vscode", "venv", "node_modules", ".venv"])
        # Dump to JSON for your LLM context

        with open(f"{buffer_path}/project_snapshot_{context_idx}.json", "w", encoding="utf-8") as out:
            json.dump(project_tree, out, indent=2, ensure_ascii=False)
            print("I dumped bitch")
        context_idx += 1



    if not idle_buffer["now"] and idle_buffer["prev"]: #that is to say back = True
        #raise popup
        script = 'display dialog "You came back from a focused session, you want some help to get back on track?" buttons {"Cancel", "OK"} default button "OK"'
        result = subprocess.run(['osascript', '-e', script], capture_output=True, text=True)

        if result.returncode == 0:

            print("Accepted")

            payload = output_agent.run(dump_all_json_to_string(buffer_path))

            print("Payload generated")
            print(payload)

            break

        else:
            print("Refused")

    time.sleep(2)
