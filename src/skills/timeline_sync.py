from typing import List, Dict, Any
from src.connectors.registry import ConnectorRegistry

def build_incident_timeline(registry: ConnectorRegistry, train_no: str, loco_id: str = None) -> List[Dict[str, Any]]:
    """
    Multimodal Timeline Synchronizer:
    Fuses Audio (Railcomm) + Video (Locate) + Wayside Sensors (WDD) + New Dynamic Products (e.g. WILD)
    into a unified chronological sequence.
    """
    all_events: List[Dict[str, Any]] = []

    # Query all active product connectors in parallel/sequence
    for connector in registry.connectors.values():
        try:
            filters = {}
            if train_no:
                filters["train_no"] = train_no
            if loco_id:
                filters["loco_id"] = loco_id
            events = connector.query(**filters)
            for e in events:
                all_events.append(e.model_dump())
        except Exception as err:
            print(f"[Timeline Sync Warning] Error querying {connector.product_id}: {err}")

    # Sort strictly by ISO-8601 timestamp
    all_events.sort(key=lambda x: x.get("timestamp", ""))
    return all_events
