import sys
import os

# Add root project directory to sys.path so we can import src.connectors and src.skills
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))

from config import settings
from src.engine import RailKavachCopilotEngine
from src.connectors.registry import ConnectorRegistry

class GeminiCopilotService:
    def __init__(self):
        self.engine = RailKavachCopilotEngine(api_key=settings.GEMINI_API_KEY)
        connectors_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "connectors"))
        self.engine.registry = ConnectorRegistry(connectors_path)

    def query(self, prompt: str, language: str = "en"):
        return self.engine.query(prompt, language=language)

gemini_service = GeminiCopilotService()
