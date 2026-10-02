import json
import pytest
from app import app, QUOTES


@pytest.fixture
def client():
    app.config["TESTING"] = True
    with app.test_client() as client:
        yield client


def test_index_page(client):
    response = client.get("/")
    assert response.status_code == 200
    assert b"Famous Quotes" in response.data
    assert b"hero-card" in response.data
    assert b"app.js" in response.data


def test_static_assets(client):
    css_res = client.get("/static/css/style.css")
    assert css_res.status_code == 200
    assert len(css_res.data) > 0

    js_res = client.get("/static/js/app.js")
    assert js_res.status_code == 200
    assert len(js_res.data) > 0




def test_quote_count_is_exactly_100():
    assert len(QUOTES) == 100, f"Expected 100 quotes, found {len(QUOTES)}"


def test_quote_schema_and_types():
    ids = set()
    for q in QUOTES:
        assert "id" in q and isinstance(q["id"], int)
        assert "quote" in q and isinstance(q["quote"], str) and len(q["quote"].strip()) > 0
        assert "author" in q and isinstance(q["author"], str) and len(q["author"].strip()) > 0
        assert "category" in q and isinstance(q["category"], str) and len(q["category"].strip()) > 0
        ids.add(q["id"])

    assert len(ids) == 100
    assert sorted(list(ids)) == list(range(1, 101))


def test_get_random_quote(client):
    response = client.get("/api/quotes/random")
    assert response.status_code == 200
    data = response.get_json()
    assert "id" in data
    assert "quote" in data
    assert "author" in data
    assert "category" in data


def test_get_random_quote_by_category(client):
    response = client.get("/api/quotes/random?category=Wisdom")
    assert response.status_code == 200
    data = response.get_json()
    assert data["category"].lower() == "wisdom"


def test_get_random_quote_by_author(client):
    response = client.get("/api/quotes/random?author=Einstein")
    assert response.status_code == 200
    data = response.get_json()
    assert "einstein" in data["author"].lower()


def test_get_random_quote_not_found(client):
    response = client.get("/api/quotes/random?category=NonExistentCategory12345")
    assert response.status_code == 404
    data = response.get_json()
    assert "error" in data


def test_get_all_quotes(client):
    response = client.get("/api/quotes")
    assert response.status_code == 200
    data = response.get_json()
    assert data["total"] == 100
    assert len(data["quotes"]) == 100


def test_search_quotes_by_query(client):
    response = client.get("/api/quotes?q=imagination")
    assert response.status_code == 200
    data = response.get_json()
    assert data["total"] >= 1
    for q in data["quotes"]:
        assert "imagination" in q["quote"].lower() or "imagination" in q["author"].lower()


def test_search_quotes_by_category(client):
    response = client.get("/api/quotes?category=Philosophy")
    assert response.status_code == 200
    data = response.get_json()
    assert data["total"] > 0
    for q in data["quotes"]:
        assert q["category"].lower() == "philosophy"


def test_search_quotes_by_author(client):
    response = client.get("/api/quotes?author=Mandela")
    assert response.status_code == 200
    data = response.get_json()
    assert data["total"] > 0
    for q in data["quotes"]:
        assert "mandela" in q["author"].lower()


def test_get_quote_by_id(client):
    response = client.get("/api/quotes/1")
    assert response.status_code == 200
    data = response.get_json()
    assert data["id"] == 1

    # Non-existent ID
    response404 = client.get("/api/quotes/9999")
    assert response404.status_code == 404


def test_get_categories(client):
    response = client.get("/api/categories")
    assert response.status_code == 200
    data = response.get_json()
    assert isinstance(data, list)
    assert len(data) > 0
    total_count = sum(item["count"] for item in data)
    assert total_count == 100
    categories = [item["name"] for item in data]
    assert "Wisdom" in categories
    assert "Inspiration" in categories
    assert "Science" in categories


def test_get_authors(client):
    response = client.get("/api/authors")
    assert response.status_code == 200
    data = response.get_json()
    assert isinstance(data, list)
    assert len(data) > 0
    author_names = [a["name"] for a in data]
    assert "Albert Einstein" in author_names
    assert "Steve Jobs" in author_names
