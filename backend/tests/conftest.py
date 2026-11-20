import os
import pytest

@pytest.fixture(autouse=True)
def setup_test_env(monkeypatch):
    monkeypatch.setenv("ENABLE_CACHE_FALLBACK", "true")
    import app.config
    import app.engine
    monkeypatch.setattr(app.config, "ENABLE_CACHE_FALLBACK", True)
    monkeypatch.setattr(app.engine, "ENABLE_CACHE_FALLBACK", True)


@pytest.fixture(autouse=True)
def isolated_audit_log(tmp_path, monkeypatch):
    """Each test writes to its own audit log, never the real one."""
    import app.governance
    monkeypatch.setattr(app.governance.audit, "path", tmp_path / "audit.jsonl")
    return app.governance.audit
