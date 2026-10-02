import json
import random
from pathlib import Path
from flask import Flask, jsonify, render_template, request

app = Flask(__name__)

DATA_FILE = Path(__file__).parent / "data" / "quotes.json"

def load_quotes():
    if not DATA_FILE.exists():
        raise FileNotFoundError(f"Quotes data file not found at {DATA_FILE}")
    with open(DATA_FILE, "r", encoding="utf-8") as f:
        return json.load(f)

# In-memory store of quotes
QUOTES = load_quotes()


@app.route("/")
def index():
    """Serve the main web application."""
    return render_template("index.html")


@app.route("/api/quotes/random", methods=["GET"])
def get_random_quote():
    """
    Get a single random quote.
    Supports optional query parameters:
      - category: filter random quote by category
      - author: filter random quote by author
    """
    category = request.args.get("category", "").strip().lower()
    author = request.args.get("author", "").strip().lower()

    pool = QUOTES

    if category:
        pool = [q for q in pool if q.get("category", "").lower() == category]

    if author:
        pool = [q for q in pool if author in q.get("author", "").lower()]

    if not pool:
        return jsonify({
            "error": "No quotes found matching the specified criteria."
        }), 404

    return jsonify(random.choice(pool))


@app.route("/api/quotes", methods=["GET"])
def get_quotes():
    """
    Get quotes with optional search and filtering.
    Query parameters:
      - q: search term matching quote text or author
      - category: filter by specific category
      - author: filter by specific author
    """
    query = request.args.get("q", "").strip().lower()
    category = request.args.get("category", "").strip().lower()
    author = request.args.get("author", "").strip().lower()

    results = QUOTES

    if category and category != "all":
        results = [q for q in results if q.get("category", "").lower() == category]

    if author and author != "all":
        results = [q for q in results if author in q.get("author", "").lower()]

    if query:
        results = [
            q for q in results
            if query in q.get("quote", "").lower() or query in q.get("author", "").lower()
        ]

    return jsonify({
        "total": len(results),
        "quotes": results
    })


@app.route("/api/quotes/<int:quote_id>", methods=["GET"])
def get_quote_by_id(quote_id):
    """Get a quote by its unique ID."""
    quote = next((q for q in QUOTES if q.get("id") == quote_id), None)
    if not quote:
        return jsonify({"error": f"Quote with ID {quote_id} not found."}), 404
    return jsonify(quote)


@app.route("/api/categories", methods=["GET"])
def get_categories():
    """Get all unique categories and their quote counts."""
    counts = {}
    for q in QUOTES:
        cat = q.get("category", "General")
        counts[cat] = counts.get(cat, 0) + 1

    categories = [
        {"name": name, "count": count}
        for name, count in sorted(counts.items(), key=lambda x: x[0].lower())
    ]
    return jsonify(categories)


@app.route("/api/authors", methods=["GET"])
def get_authors():
    """Get all unique authors and their quote counts."""
    counts = {}
    for q in QUOTES:
        author = q.get("author", "Unknown")
        counts[author] = counts.get(author, 0) + 1

    authors = [
        {"name": name, "count": count}
        for name, count in sorted(counts.items(), key=lambda x: x[0].lower())
    ]
    return jsonify(authors)


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
