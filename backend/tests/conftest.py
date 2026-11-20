import os
import pytest

@pytest.fixture(autouse=True)
def setup_test_env(monkeypatch):
    monkeypatch.setenv("ENABLE_CACHE_FALLBACK", "true")
    import app.config
    import app.engine
    monkeypatch.setattr(app.config, "ENABLE_CACHE_FALLBACK", True)
    monkeypatch.setattr(app.engine, "ENABLE_CACHE_FALLBACK", True)
