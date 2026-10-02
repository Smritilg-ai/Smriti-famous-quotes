# 🌟 Famous Quotes Web Application

An elegant, modern full-stack web application built with **Python Flask**, **Plain Vanilla JavaScript (ES6+)**, and **HTML5/CSS3** to browse, search, filter, and display quotes from a curated collection of 100 well-known quotes by renowned thinkers, leaders, scientists, and artists.

---

## ✨ Features

- **📖 100 Curated Historical Quotes**: Handcrafted dataset featuring influential figures like Albert Einstein, Maya Angelou, Winston Churchill, Confucius, Oscar Wilde, Steve Jobs, Socrates, Aristotle, and more.
- **🎲 Dynamic Random Quote Generator**: Showcase featured quotes with smooth fade transitions, one-click random generation, and direct Twitter/X sharing.
- **🔍 Instant Live Search**: Debounced real-time full-text search across quote content and author names.
- **🏷️ Multi-Facet Filtering**: Filter quotes seamlessly by 10 distinct categories (*Inspiration, Wisdom, Philosophy, Science, Leadership, Life, Humor, Success, Courage, Friendship*) using interactive category pills or dropdowns.
- **📋 One-Click Copy to Clipboard**: Fast formatted copying (`"Quote" — Author`) with toast feedback.
- **🌟 Interactive Showcase**: Click any quote in the explorer grid to showcase it directly in the top hero banner.
- **📱 Fully Responsive Design**: Built with CSS Grid and Flexbox for seamless browsing on desktop, tablet, and mobile devices.
- **⚡ Zero Frontend Build Tools**: Pure Vanilla JavaScript without React, Vue, jQuery, or npm bundlers.

---

## 🛠️ Tech Stack

- **Backend**: Python 3.10+, Flask 3.x
- **Frontend**: Plain Vanilla JavaScript (ES6+), HTML5, CSS3
- **Data Store**: JSON in-memory store (`data/quotes.json`)
- **Testing**: `pytest`

---

## 📂 Project Structure

```
famous-quotes/
├── app.py                  # Flask application & REST API routes
├── requirements.txt        # Python package dependencies
├── data/
│   └── quotes.json         # Curated 100 quotes dataset
├── templates/
│   └── index.html          # Semantic HTML5 layout
├── static/
│   ├── css/
│   │   └── style.css       # Custom modern CSS styling
│   └── js/
│       └── app.js          # Pure vanilla JavaScript client logic
├── tests/
│   └── test_app.py         # Automated test suite (15 tests)
├── .gitignore              # Git ignore rules for Python & IDEs
└── README.md               # Project documentation
```

---

## 🚀 Getting Started

### Prerequisites

Ensure you have Python 3.10+ installed on your system.

### 1. Clone the Repository

```bash
git clone https://github.com/Smritilg-ai/Smriti-famous-quotes.git
cd Smriti-famous-quotes
```

### 2. Install Dependencies

```bash
pip install -r requirements.txt
```

### 3. Run the Application

```bash
python app.py
```

Open your browser and navigate to:
```
http://127.0.0.1:5000
```

---

## 📡 REST API Reference

The Flask backend exposes clean JSON API endpoints:

| Endpoint | Method | Parameters | Description |
|---|---|---|---|
| `/` | `GET` | — | Serves the frontend web page. |
| `/api/quotes/random` | `GET` | `category` (optional), `author` (optional) | Returns a single random quote matching the criteria. |
| `/api/quotes` | `GET` | `q` (optional), `category` (optional), `author` (optional) | Returns quotes matching the search query or filters. |
| `/api/quotes/<id>` | `GET` | `id` (integer) | Returns a specific quote by its ID (1–100). |
| `/api/categories` | `GET` | — | Returns all categories with their quote counts. |
| `/api/authors` | `GET` | — | Returns all unique authors with their quote counts. |

### API Examples

#### 1. Fetch a Random Quote
```bash
curl http://127.0.0.1:5000/api/quotes/random
```
**Response (200 OK):**
```json
{
  "id": 1,
  "quote": "The only way to do great work is to love what you do.",
  "author": "Steve Jobs",
  "category": "Inspiration"
}
```

#### 2. Search Quotes by Keyword
```bash
curl "http://127.0.0.1:5000/api/quotes?q=imagination"
```
**Response (200 OK):**
```json
{
  "total": 2,
  "quotes": [
    {
      "id": 23,
      "quote": "We suffer more often in imagination than in reality.",
      "author": "Seneca",
      "category": "Philosophy"
    },
    {
      "id": 31,
      "quote": "Imagination is more important than knowledge. Knowledge is limited. Imagination encircles the world.",
      "author": "Albert Einstein",
      "category": "Science"
    }
  ]
}
```

---

## 🧪 Running Automated Tests

Run the comprehensive test suite using `pytest`:

```bash
python -m pytest tests/ -v
```

All 15 automated tests verify:
- Data integrity (100 quotes, valid schema, unique IDs 1..100)
- Random quote endpoint with and without filters
- Full-text search and category/author query logic
- HTML and static asset delivery (CSS/JS)

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).
