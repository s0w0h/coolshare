#!/bin/sh

if [ ! -f "/app/db/coolshare.db" ]; then
  echo "coolshare.db not found, creating a new one..."
  touch /app/db/coolshare.db
  echo "Initializing database..."
  python /app/init_db.py
  echo "Initializing finish"
  
else
  echo "coolshare.db found, skipping creation."
fi

exec gunicorn --bind 0.0.0.0:5000 --workers 4 app:app
