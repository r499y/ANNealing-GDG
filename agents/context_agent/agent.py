from google.adk.agents import Agent
def tab_monitor():
    """
    Simulated tool to return open tabs and their current activity.
    """
    return [
        {"title": "Main Editor", "activity": "User editing code"},
        {"title": "Documentation", "activity": "Reading docs on Python"},
        {"title": "Terminal", "activity": "Running tests"},
    ]

root_agent = Agent(
    model='gemini-2.0-flash-001',
    name='root_agent',
    description="You are an assistant helping a programmer get back on track after an interruption.",
    instruction=(
        "Provide a concise ContextSummary based on open tabs and their activity. "
        "You will also be provided a JSON object with a screenshot (base64-encoded PNG). "
        "Focus especially on what's happening in the active tab."
    ),
    tools=[tab_monitor]
)
