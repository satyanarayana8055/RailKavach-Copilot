import pytest
from app.services.gcs_pipeline import GCSLowLatencyPipeline


def test_gcs_pipeline_tier_caching(tmp_path):
    pipeline = GCSLowLatencyPipeline(bucket_name="railkavach", l1_max_items=10)
    
    # 1. Fetch JSON (should hit local fallback or GCS and warm L1/L2)
    data, sha256, tier1 = pipeline.fetch_json("telemetry/railcomm_transcripts.json")
    assert isinstance(data, list)
    assert len(data) >= 84
    assert len(sha256) == 64
    
    # 2. Second fetch must hit Tier 1 In-Memory LRU Cache
    data2, sha256_2, tier2 = pipeline.fetch_json("telemetry/railcomm_transcripts.json")
    assert tier2 == "L1_RAM_CACHE"
    assert sha256_2 == sha256
    
    # 3. Check stats
    assert pipeline.stats["l1_hits"] >= 1
    assert pipeline.stats["avg_latency_ms"] < 15.0  # sub-15ms guaranteed
