import sqlite3
import json
import os
from datetime import datetime
from typing import List, Dict, Any, Optional
from config import settings

class DatabaseService:
    """
    Database Service (PostgreSQL with SQLite fallback).
    Stores incident audits, human reviewer verifications, and Section 63 BSA evidence records.
    """
    
    def __init__(self):
        self.db_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "railkavach.db"))
        self._init_db()

    def _get_connection(self):
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        return conn

    def _init_db(self):
        conn = self._get_connection()
        cursor = conn.cursor()
        
        # 1. Incidents Table
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS incidents (
            incident_id TEXT PRIMARY KEY,
            train_no TEXT NOT NULL,
            loco_id TEXT,
            section TEXT,
            timestamp TEXT,
            severity TEXT,
            status TEXT,
            primary_cause TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        """)

        # 2. Evidence Audit Trail (Cryptographic Chain of Custody)
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS evidence_audit_logs (
            event_id TEXT PRIMARY KEY,
            incident_id TEXT,
            source_product TEXT,
            modality TEXT,
            timestamp TEXT,
            summary TEXT,
            sha256_hash TEXT,
            verification_status TEXT,
            reviewer_id TEXT,
            reviewer_name TEXT,
            reviewer_remarks TEXT,
            reviewed_at TEXT
        );
        """)

        # 3. Statutory Reports Archive
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS statutory_reports (
            report_id TEXT PRIMARY KEY,
            incident_id TEXT,
            master_sha256 TEXT,
            report_markdown TEXT,
            crew_briefing_hindi TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        """)
        
        conn.commit()
        conn.close()
        self._seed_initial_data()

    def _seed_initial_data(self):
        conn = self._get_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT COUNT(*) FROM incidents WHERE incident_id = 'INC-12414-20261118'")
        if cursor.fetchone()[0] == 0:
            cursor.execute("""
            INSERT INTO incidents (incident_id, train_no, loco_id, section, timestamp, severity, status, primary_cause)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                "INC-12414-20261118",
                "12414",
                "WAP-7 30452",
                "Suratgarh - Bikaner",
                "2026-11-18T03:14:45.000Z",
                "CRITICAL",
                "UNDER_INVESTIGATION",
                "Signal Passed at Danger (SPAD) caused by Loco Pilot mobile phone distraction."
            ))
            conn.commit()
        conn.close()

    def log_reviewer_decision(self, event_id: str, status: str, reviewer_id: str, reviewer_name: str, remarks: str):
        conn = self._get_connection()
        cursor = conn.cursor()
        cursor.execute("""
        UPDATE evidence_audit_logs
        SET verification_status = ?, reviewer_id = ?, reviewer_name = ?, reviewer_remarks = ?, reviewed_at = ?
        WHERE event_id = ?
        """, (status, reviewer_id, reviewer_name, remarks, datetime.utcnow().isoformat(), event_id))
        conn.commit()
        conn.close()

    def get_incident(self, incident_id: str) -> Optional[Dict[str, Any]]:
        conn = self._get_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM incidents WHERE incident_id = ?", (incident_id,))
        row = cursor.fetchone()
        conn.close()
        return dict(row) if row else None

db_service = DatabaseService()
