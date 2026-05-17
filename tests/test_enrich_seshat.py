import pytest
import os
import json
from unittest.mock import patch, MagicMock

# Import the module to be tested
import sys
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from scripts.enrich_from_seshat import enrich_events

@pytest.fixture
def mock_events_dir(tmpdir):
    # Create a temporary directory for events
    vol1_dir = tmpdir.mkdir('.scratch').mkdir('religion-map').mkdir('vol1')
    
    # Create a test event file
    test_event = {
        "events": [
            {
                "id": "test-event-1",
                "territory": "Месопотамия",
                "seshat": {
                    "year_from": -3000,
                    "year_to": -2000,
                    "enriched": False
                }
            },
            {
                "id": "test-event-2",
                "territory": "Египет",
                "seshat": {
                    "year_from": -1500,
                    "year_to": -1000,
                    "enriched": True,
                    "nga_id": "99",
                    "nga_name": "Old Egypt NGA"
                }
            }
        ]
    }
    
    file_path = vol1_dir.join('ch01-events.json')
    with open(file_path, 'w', encoding='utf-8') as f:
        json.dump(test_event, f)
        
    return tmpdir

@patch("scripts.enrich_from_seshat.requests.get")
def test_enrich_events(mock_get, mock_events_dir):
    # Setup mocks
    vol1_path = os.path.join(str(mock_events_dir), '.scratch', 'religion-map', 'vol1')
    
    # Mock API responses (requests passes query params via kwargs, not always in URL string)
    def mock_requests_get(url, *args, **kwargs):
        mock_resp = MagicMock()
        mock_resp.status_code = 200
        params = kwargs.get("params") or {}

        if "ngas" in url and params.get("search") == "Mesopotamia":
            mock_resp.json.return_value = {
                "results": [{"id": 1, "name": "Mesopotamia NGA"}]
            }
        elif "nga-polity-relations/" in url:
            mock_resp.json.return_value = {
                "results": [
                    {"nga_party": 1, "polity_party": 101, "year_from": -3500, "year_to": -1500}
                ]
            }
        elif "polities/101/" in url:
            mock_resp.json.return_value = {
                "name": "Sumerian City States"
            }
        else:
            mock_resp.status_code = 404
            
        return mock_resp
        
    mock_get.side_effect = mock_requests_get
    
    # Run the function
    enrich_events(base_dirs=[vol1_path])
    
    # Check results
    file_path = os.path.join(vol1_path, 'ch01-events.json')
    with open(file_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
            
        events = data['events']
        assert len(events) == 2
        
        # Event 1 should be enriched
        assert events[0]['seshat']['enriched'] is True
        assert events[0]['seshat']['nga_id'] == "1"
        assert events[0]['seshat']['nga_name'] == "Mesopotamia NGA"
        assert events[0]['seshat']['polity_id'] == "101"
        assert events[0]['seshat']['polity_name'] == "Sumerian City States"
        
        # Event 2 should be skipped (already enriched)
        assert events[1]['seshat']['enriched'] is True
        assert events[1]['seshat']['nga_id'] == "99"
        assert 'polity_id' not in events[1]['seshat'] # Because it was skipped
