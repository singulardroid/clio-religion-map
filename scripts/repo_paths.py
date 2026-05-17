"""Repository root — scripts resolve paths here so `cd scripts && python …` works."""
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent
