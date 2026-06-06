# Ecommerce Django API

REST API for the React storefront: products, featured filtering, session cart, and media.

## Setup

```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
```

Copy `.env` (or create one) with PostgreSQL settings:

```
DB_NAME=ecommerce_db
DB_USER=postgres
DB_PASSWORD=admin
DB_HOST=localhost
DB_PORT=5432
```

If PostgreSQL is not available, remove `DB_NAME` from `.env` to use SQLite (`db.sqlite3`).

## Run

```bash
python manage.py migrate
python manage.py seed_products
python manage.py runserver
```

API base: `http://localhost:8000/api/`

## Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/products/` | All products (list shape for grid) |
| GET | `/api/products/?id=1` | Single product (detail shape with `image[]`) |
| GET | `/api/products/?featured=true` | Featured products only |
| GET | `/api/products/1/` | Single product by PK |
| GET | `/api/categories/` | Categories |
| GET | `/api/cart/` | Session cart |
| POST | `/api/cart/add/` | `{ product_id, quantity?, color? }` |
| POST | `/api/cart/update/` | `{ product_id \| item_id, quantity }` |
| POST | `/api/cart/remove/` | `{ product_id \| item_id, color? }` |
| POST | `/api/cart/clear/` | Clear cart |

Prices are in **paise** (INR × 100), matching the frontend `FormatPrice` helper.
