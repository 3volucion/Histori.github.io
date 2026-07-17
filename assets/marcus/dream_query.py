import sqlite3
import json
import sys
import io

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

DB = r"C:\Users\sotoi\.local\share\mimocode\mimocode.db"
conn = sqlite3.connect(DB)
conn.row_factory = sqlite3.Row
cur = conn.cursor()

PROJECT_ID = 'f8b319d3-25df-4f2e-a560-7f8af965c620'

# Get assistant text parts that describe decisions or knowledge
cur.execute("""
    SELECT p.id, p.message_id, p.session_id, p.time_created,
           json_extract(p.data, '$.text') as text
    FROM part p
    JOIN session s ON s.id = p.session_id
    JOIN message m ON m.id = p.message_id
    WHERE s.project_id = ?
      AND json_extract(m.data, '$.role') = 'assistant'
      AND json_extract(p.data, '$.type') = 'text'
    ORDER BY p.time_created ASC
""", (PROJECT_ID,))

print("=== ASSISTANT TEXT PARTS ===")
for part in cur.fetchall():
    text = part['text'] or ''
    if not text.strip() or text.strip().startswith('<system-reminder>'):
        continue
    # Only show substantive responses
    if len(text) > 50:
        print(f"[{part['session_id']}] time={part['time_created']}:")
        print(text[:600])
        print("---")

conn.close()
