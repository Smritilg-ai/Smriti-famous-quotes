# Famous Quotes Web Application

A full-stack web application built with **Python Flask**, **Plain Vanilla JavaScript (ES6+)**, and modern **HTML5/CSS3** to browse, search, and generate quotes from a curated collection of 100 well-known quotes.

---

## Features

- **100 Curated Well-Known Quotes**: Quotes from renowned thinkers, scientists, leaders, and artists (Albert Einstein, Winston Churchill, Maya Angelou, Confucius, Oscar Wilde, Steve Jobs, Socrates, Aristotle, etc.).
- **Dynamic Random Quote Generator**: Showcase an inspiring quote with smooth transitions, with one-click generation and Twitter/X sharing.
- **Search & Filter**:
  - Live full-text search across quotes and authors (debounced for smooth performance).
  - Filter by 10 distinct categories (*Inspiration, Wisdom, Philosophy, Science, Leadership, Life, Humor, Success, Courage, Friendship*).
  - Filter by specific authors via dropdown.
  - Interactive category pills with active state indicators.
- **One-Click Copy**: Copy formatted quotes directly to your clipboard with animated toast notification.
- **Interactive Showcase**: Click any quote in the explorer gallery to showcase it in the hero banner.
- **Responsive & Accessible Design**: Styled with CSS Grid and Flexbox, optimized for desktop, tablet, and mobile displays.

---

## Project Structure

```
famous-quotes/
├── app.py                  # Flask server and REST API endpoints
├── requirements.txt        # Python package dependencies
├── data/
│   └── quotes.json         # 100 curated quotes dataset
├── templates/
│   └── index.html          # Semantic HTML5 layout
├── static/
│   ├── css/
│   │   └── style.css       # Custom modern CSS styling
│   └── js/
│       └── app.js          # Pure vanilla JavaScript client logic
├── tests/
│   └── test_app.py         # Automated pytest test suite
└── README.md
```

---

## Getting Started

### 1. Requirements
- Python 3.10+
- Flask (`pip install -r requirements.txt`)
- pytest (`pip install pytest`)

### 2. Run the Application
Start the Flask development server:
```powershell
python app.py
```

Then open your browser and navigate to:
```
http://127.0.0.1:5000
```

---

## REST API Endpoints

| Endpoint | Method | Description |
|---|---|---|
| `/` | `GET` | Serves the web application HTML. |
| `/api/quotes/random` | `GET` | Returns a single random quote (supports optional `?category=...&author=...`). |
| `/api/quotes` | `GET` | Returns matching quotes (supports `?q=...`, `?category=...`, `?author=...`). |
| `/api/quotes/<id>` | `GET` | Returns quote with specific ID (1-100). |
| `/api/categories` | `GET` | Returns unique categories with quote counts. |
| `/api/authors` | `GET` | Returns unique authors with quote counts. |

---

## Running Tests

Run the full automated test suite using pytest:
```powershell
python -m pytest tests/ -v
```
