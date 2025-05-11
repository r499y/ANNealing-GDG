from google.adk.agents import Agent
from pydantic import BaseModel, Field
from typing import Dict
#from agents.schemas import ContextSummary, PayloadFormat
class ContextSummary(BaseModel):
    title: str = Field(description="A human-readable name or label for this item.")
    path_or_link: str = Field(description="The filesystem path or URL where the item can be opened.")
    description: str = Field(description="A short summary of the item's contents or why it matters now.")
    relevance_score: float = Field(description="A number (0.0-1.0) indicating how pertinent this item is to the user's recent context.")

class PayloadFormat(BaseModel):
    general_overview: str = Field(
        
        description="A brief, high-level summary of what all the returned items represent."
    )
    treshold: float = Field(
        
        description="A cutoff score (0.0-1.0) that each item's relevance_score must meet or exceed to be shown."
    )
    items: Dict[str, ContextSummary] = Field(
        
        description="Mapping of unique item IDs (e.g. 'item1') to their detail objects."
    )

root_agent = Agent(
    model='gemini-2.0-flash-001',
    name='root_agent',
    description='A helpful assistant for user questions.',
    instruction="You are an assistant helping a programmer get back on track after an interruption. you will be provided by some Context from context_agent. Return JSON matching the PayloadFormat output_schema.",
    output_schema=PayloadFormat
)
