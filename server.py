from flask import Flask, request, jsonify
from flask_cors import CORS
import logging

app = Flask(__name__)
CORS(app)  # Enable CORS for development

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@app.route('/summarize/', methods=['POST'])
def summarize():
    try:
        data = request.json
        text = data.get('text', '')

        if not text.strip():
            logger.warning("Received empty text.")
            return jsonify({"error": "Empty text provided"}), 400

        logger.info("Received text for summarization.")
        logger.debug(f"Received text: {text[:500]}...")  # Log the first 500 characters of the text for debugging

        summary = parse_text(text)
        logger.debug(f"Parsed summary: {summary}")

        filtered_summary = filter_summary(summary)
        logger.debug(f"Filtered summary: {filtered_summary}")

        return jsonify({"summary": filtered_summary})

    except Exception as e:
        logger.error(f"Error: {e}")
        return jsonify({"error": str(e)}), 500

def parse_text(text: str):
    lines = text.split('\n')
    summary = []
    current_heading = None
    current_details = []

    def is_heading(line: str) -> bool:
        # Heuristic to detect headings, adjust if necessary
        return len(line.split()) > 2 and (line[0].isupper() or ':' in line)

    for line in lines:
        line = line.strip()
        if line:
            if is_heading(line):
                if current_heading:
                    # Save the previous heading and details
                    summary.append({
                        "heading": current_heading,
                        "details": ' '.join(current_details).strip()
                    })
                # Start a new heading
                current_heading = line
                current_details = []
            else:
                # Accumulate details under the current heading
                if current_heading:
                    current_details.append(line)
    
    # Append the last accumulated heading and details
    if current_heading:
        summary.append({
            "heading": current_heading,
            "details": ' '.join(current_details).strip()
        })
    
    return summary

def filter_summary(summary):
    return [item for item in summary if len(item["details"]) > 100]

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=3000)