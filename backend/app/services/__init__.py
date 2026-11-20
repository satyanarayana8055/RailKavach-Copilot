"""
Cloud services integration for RailKavach Copilot.
Includes:
- GCSEvidenceVault: Immutable evidence vault for CVVRS, Radio, and Gantry files.
- AlloyDBManager: PostgreSQL transactional ledger for incident and reviewer records.
"""

from .cloud_services import gcs_vault, alloydb_manager

__all__ = ["gcs_vault", "alloydb_manager"]
