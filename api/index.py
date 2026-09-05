import json
from pathlib import Path

from http.server import BaseHTTPRequestHandler

from backend.analyzer import RejectionPatternAnalyzer


DATASET_PATH = Path(__file__).resolve().parent.parent / "backend" / "data" / "rejection_pattern_demo_dataset.csv"
analyzer = RejectionPatternAnalyzer(str(DATASET_PATH))


class handler(BaseHTTPRequestHandler):
    def do_POST(self):
        if self.path.rstrip("/") != "/api/analyze":
            self._send_json({"error": "Not found"}, 404)
            return

        try:
            content_length = int(self.headers.get("content-length", "0"))
            payload = json.loads(self.rfile.read(content_length) or b"{}")
            result = analyzer.analyze(payload)
            self._send_json(result, 200)
        except (ValueError, TypeError, KeyError, json.JSONDecodeError) as error:
            self._send_json({"error": f"Invalid analysis payload: {error}"}, 400)
        except Exception as error:
            self._send_json({"error": f"Analysis failed: {error}"}, 500)

    def do_OPTIONS(self):
        self._send_json({}, 204)

    def _send_json(self, payload, status):
        body = json.dumps(payload).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.send_header("Access-Control-Allow-Methods", "POST, OPTIONS")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        if status != 204:
            self.wfile.write(body)
