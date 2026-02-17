from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)

def test_read_main():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"status": "ok", "message": "Emperor Analytics Backend Running"}

def test_upload_csv():
    # Create a dummy CSV file
    csv_content = b"id,name,value\n1,A,10.5\n2,B,20.0\n3,C,NaN"
    files = {"file": ("test.csv", csv_content, "text/csv")}
    
    # We must provide user-agent to generate consistent hash in tests
    headers = {"User-Agent": "test-client"}
    
    response = client.post("/upload", files=files, headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert "session_id" in data
    assert data["message"] == "File uploaded successfully"
    assert data["columns"] == ["id", "name", "value"]
    
    return data["session_id"]

def test_stats_flow():
    # Upload first
    test_upload_csv()
    
    # Get Stats - NOW USING /session/current/stats
    headers = {"User-Agent": "test-client"}
    response = client.get("/session/current/stats", headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert "mean" in data
    assert data["mean"]["value"] == 15.25

def test_clean_flow():
    # Upload first
    test_upload_csv()
    
    # Clean - NOW USING /session/current/clean
    headers = {"User-Agent": "test-client"}
    response = client.post("/session/current/clean", headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert "final_rows" in data
