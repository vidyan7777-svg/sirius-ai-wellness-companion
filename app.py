from flask import Flask, render_template, request, jsonify, redirect, session
from groq import Groq
import sqlite3
import uuid
import os
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
app.secret_key="mindmate_secret"

# ---------------- DATABASE ---------------- #

def init_db():
    conn = sqlite3.connect("mood.db")
    cursor = conn.cursor()

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS moods (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL,
        mood TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
""")

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE,
        password TEXT
    )
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS journals (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS chat_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL,
        chat_id TEXT NOT NULL,
        user_message TEXT NOT NULL,
        ai_reply TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """)

    # Add chat_id to old chat_history table if it does not exist
    try:
        cursor.execute(
            "ALTER TABLE chat_history ADD COLUMN chat_id TEXT"
        )
    except sqlite3.OperationalError:
        pass

    conn.commit()
    conn.close()

init_db()

# ---------------- GROQ CLIENT ---------------- #

client = Groq(
    api_key=os.getenv("GROQ_API_KEY")
)

# ---------------- HOME PAGE ---------------- #

@app.route("/", methods=["GET", "POST"])
def login():

    if request.method == "POST":

        username = request.form.get("username")
        password = request.form.get("password")

        conn = sqlite3.connect("mood.db")
        cursor = conn.cursor()

        cursor.execute(
            "SELECT * FROM users WHERE username=? AND password=?",
            (username, password)
        )

        user = cursor.fetchone()

        conn.close()

        if user:
            session["user"] = username

        # Create a new conversation
            session["chat_id"] = str(uuid.uuid4())

            return redirect("/home")

        return "Invalid Username or Password"

    return render_template("login.html")


@app.route("/register", methods=["GET", "POST"])
def register():

    if request.method == "POST":

        username = request.form.get("username")
        password = request.form.get("password")

        conn = sqlite3.connect("mood.db")
        cursor = conn.cursor()

        try:

            cursor.execute(
                "INSERT INTO users(username,password) VALUES (?,?)",
                (username, password)
            )

            conn.commit()

            return redirect("/")

        except:
            return "Username already exists"

        finally:
            conn.close()

    return render_template("register.html")


@app.route("/home")
def home():

    if "user" not in session:
        return redirect("/")

    return render_template(
        "index.html",
        username=session["user"]
    )



# ---------------- CHATBOT ---------------- #

@app.route("/chat", methods=["POST"])
def chat():

    # -------------------------------------------------
    # CHECK LOGIN
    # -------------------------------------------------

    if "user" not in session:
        return jsonify({
            "error": "Please login first."
        }), 401

    username = session["user"]
    chat_id = session.get("chat_id")

    if not chat_id:
        chat_id = str(uuid.uuid4())
        session["chat_id"] = chat_id

    # -------------------------------------------------
    # GET USER MESSAGE
    # -------------------------------------------------

    data = request.get_json(silent=True) or {}

    msg = (data.get("message") or "").strip()

    if not msg:
        return jsonify({
            "error": "Message cannot be empty."
        }), 400

    try:

        # -------------------------------------------------
        # GET THIS USER'S PREVIOUS CHAT HISTORY
        # -------------------------------------------------

        conn = sqlite3.connect("mood.db")
        cursor = conn.cursor()

        cursor.execute("""
            SELECT user_message, ai_reply
            FROM chat_history
            WHERE username = ?
            AND chat_id = ?
            ORDER BY id ASC
            LIMIT 20
        """, (username, chat_id))

        previous_chats = cursor.fetchall()

        conn.close()

        # -------------------------------------------------
        # SYSTEM PROMPT
        # -------------------------------------------------

        messages = [

            {
                "role": "system",
                "content": """
You are Sirius AI, a friendly and intelligent wellness chatbot.

Your main purpose is to help users with:

- Stress and anxiety
- Emotional well-being
- Loneliness
- Motivation
- Relaxation
- Sleep and healthy routines
- Study or work-related stress
- Mood and self-reflection

Response style:

- Respond naturally like a helpful conversational AI.
- Give complete, useful answers rather than extremely short responses.
- Do not use bullet points for every response.
- Use paragraphs when explaining an idea or having a conversation.
- Use bullet points when listing advice or multiple ideas.
- Use numbered steps when explaining a process.
- Use short headings when they improve readability.
- Give examples when helpful.
- Use emojis naturally and occasionally. Do not overuse them.
- For simple questions, answer clearly and directly, but include enough explanation to fully answer the question.
- For emotional or wellness-related questions, provide a thoughtful, supportive, and complete response.
- For advice, provide 3–5 useful suggestions with a brief explanation of why each may help.
- Adapt the response length to the complexity of the user's question.
- Never sacrifice important information just to make the response shorter.
- If the question has multiple parts, answer every part.
- Continue the explanation until the answer is complete.
- Do not unnecessarily repeat the user's question.
- Always finish the response completely.

Answer quality:

- Prioritize completeness, clarity, and usefulness over extreme brevity.
- Explain important points instead of only naming them.
- When giving advice, briefly explain how the user can apply it.
- When appropriate, give a small example to make the explanation easier to understand.
- Use natural conversational language rather than sounding like a textbook.
- Avoid one-sentence answers when the user's question requires explanation.
- Do not abruptly end or truncate an answer.

Conversation scope:

Sirius AI is specifically designed for wellness and emotional well-being.
It is NOT a general-purpose educational, programming, technical, or knowledge chatbot.

Sirius AI should answer questions related to:

- Stress and anxiety
- Emotional difficulties
- Loneliness
- Motivation
- Relaxation
- Sleep
- Healthy routines and habits
- Mood and self-reflection
- Study stress
- Work stress
- Relationship-related emotional difficulties
- Personal development when it relates to well-being
- Everyday worries and emotional challenges

If the user's question is completely unrelated to wellness, do NOT provide a detailed answer to that unrelated topic.

Instead, politely explain that Sirius AI is a wellness-focused chatbot and redirect the conversation toward something it can help with.

For example:

User: "Tell me about Python."

Sirius AI:
"I'm Sirius AI, a wellness-focused chatbot, so I'm designed to support your emotional well-being rather than provide programming lessons. 🌿 If learning Python is causing you stress or you're feeling overwhelmed with your studies, though, I can definitely help you with that."

User: "Tell me about NLP."

Sirius AI:
"I'm Sirius AI, so my focus is wellness and emotional support rather than technical topics like NLP. 💚 If you're learning NLP and feeling stressed, overwhelmed, or unmotivated, I can help you manage that."

Important scope rules:

- Do not become a general-purpose programming assistant.
- Do not provide coding tutorials when the user asks unrelated programming questions.
- Do not provide detailed explanations of unrelated technical subjects.
- Do not provide unrelated academic lessons simply because the user asks for them.
- Do not answer unrelated general-knowledge questions in detail.
- Do not pretend that unrelated topics are wellness topics just to answer them.
- Politely redirect unrelated questions instead.
- Keep the redirection friendly and helpful rather than simply saying "I can't answer that."

However, context matters.

If an unrelated topic is connected to the user's wellness, you MAY discuss it only in the context of the user's well-being.

Examples:

User: "I'm stressed because I have to learn Python."

→ Help with study stress, feeling overwhelmed, motivation, or creating a healthy study routine.

User: "I can't concentrate while studying."

→ Help with concentration, stress management, breaks, sleep, and healthy study habits.

User: "I'm anxious about my programming exam."

→ Help with exam anxiety and preparation-related stress.

User: "I'm stressed because of my job."

→ Help with work-related stress and emotional well-being.

User: "I can't sleep because I'm worried about tomorrow."

→ Help with relaxation, anxiety, and sleep.

Safety:

- Do not claim to be a doctor or therapist.
- Do not diagnose medical or mental-health conditions.
- Do not present yourself as a replacement for professional care.
- For serious medical or mental-health concerns, encourage the user to seek appropriate professional help.
- Be especially careful when users describe severe emotional distress or potential danger.

Conversation behavior:

- Be supportive, empathetic, friendly, and encouraging.
- You can have normal friendly conversations with users as long as the conversation remains reasonably connected to the purpose of Sirius AI.
- Listen to what the user is actually saying instead of giving generic wellness advice.
- Ask a gentle follow-up question when it would help understand the user's situation.
- Do not force wellness advice into every casual conversation.
- If the user is simply greeting you or making casual conversation, respond naturally.
- If the user changes from an unrelated topic to a wellness topic, follow the wellness topic.
- Never judge, shame, or dismiss the user's feelings.

Identity:

- Your name is Sirius AI.
- Never call yourself MindMate AI or any other name.
- If the user asks your name, say that you are Sirius AI.
- Do not describe yourself as ChatGPT.
- Do not describe yourself as a general-purpose AI assistant.

Privacy:

- Treat the user's conversation as private.
- Only use the conversation history belonging to the currently logged-in user.
- Never mention or reveal another user's messages or information.
- Never claim to know private information about another user.

Always understand the user's question first and then choose the most natural way to answer it while staying within the purpose of Sirius AI.
"""
            }

        ]

        # -------------------------------------------------
        # ADD THIS USER'S PREVIOUS CONVERSATION
        # -------------------------------------------------

        for user_message, ai_reply in previous_chats:

            messages.append({
                "role": "user",
                "content": user_message
            })

            messages.append({
                "role": "assistant",
                "content": ai_reply
            })

        # -------------------------------------------------
        # ADD CURRENT MESSAGE
        # -------------------------------------------------

        messages.append({
            "role": "user",
            "content": msg
        })

        # -------------------------------------------------
        # SEND TO GROQ
        # -------------------------------------------------

        response = client.chat.completions.create(

            model="openai/gpt-oss-20b",

            messages=messages,

            temperature=0.7,

            max_tokens=1000
        )

        reply = response.choices[0].message.content

        # -------------------------------------------------
        # SAVE CHAT FOR CURRENT USER ONLY
        # -------------------------------------------------

        conn = sqlite3.connect("mood.db")
        cursor = conn.cursor()

        cursor.execute("""
            INSERT INTO chat_history
        (
            username,
            chat_id,
            user_message,
            ai_reply
        )
            VALUES (?, ?, ?, ?)
        """, (
            username,
            chat_id,
            msg,
            reply
        ))

        conn.commit()
        conn.close()

        # -------------------------------------------------
        # RETURN AI RESPONSE
        # -------------------------------------------------

        return jsonify({
            "success": True,
            "reply": reply
        })

    except Exception as e:

        print("Chat error:", e)

        return jsonify({
            "success": False,
            "error": "Something went wrong while connecting to Sirius AI."
        }), 500


# ---------------- NEW CHAT ---------------- #

@app.route("/new_chat", methods=["POST"])
def new_chat():

    if "user" not in session:
        return jsonify({
            "success": False,
            "message": "Please login first."
        }), 401

    # Generate a new conversation ID
    new_chat_id = str(uuid.uuid4())

    session["chat_id"] = new_chat_id

    return jsonify({
        "success": True,
        "chat_id": new_chat_id
    })    


# ---------------- GET CHAT HISTORY ---------------- #

@app.route("/get_chat_history", methods=["GET"])
def get_chat_history():

    if "user" not in session:
        return jsonify({
            "success": False,
            "message": "Please login first."
        }), 401

    username = session["user"]

    try:

        conn = sqlite3.connect("mood.db")
        cursor = conn.cursor()

        cursor.execute("""
            SELECT
                chat_id,
                MIN(id) AS first_id,
                MIN(user_message) AS first_message,
                MAX(created_at) AS last_message
            FROM chat_history
            WHERE username = ?
              AND chat_id IS NOT NULL
            GROUP BY chat_id
            ORDER BY first_id DESC
        """, (username,))

        rows = cursor.fetchall()

        conn.close()

        chats = []

        for row in rows:

            chat_id = row[0]
            first_message = row[2] or "New conversation"

            # Create a readable title
            title = first_message.strip()

            if len(title) > 35:
                title = title[:35] + "..."

            chats.append({
                "chat_id": chat_id,
                "title": title,
                "created_at": row[3]
            })

        return jsonify({
            "success": True,
            "chats": chats
        })

    except Exception as e:

        print("Get chat history error:", e)

        return jsonify({
            "success": False,
            "message": "Could not load chat history."
        }), 500

# ---------------- OPEN CHAT ---------------- #

@app.route("/get_chat/<chat_id>", methods=["GET"])
def get_chat(chat_id):

    if "user" not in session:
        return jsonify({
            "success": False,
            "message": "Please login first."
        }), 401

    username = session["user"]

    try:

        conn = sqlite3.connect("mood.db")
        cursor = conn.cursor()

        cursor.execute("""
            SELECT
                user_message,
                ai_reply,
                created_at
            FROM chat_history
            WHERE username = ?
              AND chat_id = ?
            ORDER BY id ASC
        """, (username, chat_id))

        rows = cursor.fetchall()

        conn.close()

        messages = []

        for row in rows:

            messages.append({
                "user_message": row[0],
                "ai_reply": row[1],
                "created_at": row[2]
            })

        # Make this the active conversation
        session["chat_id"] = chat_id

        return jsonify({
            "success": True,
            "chat_id": chat_id,
            "messages": messages
        })

    except Exception as e:

        print("Open chat error:", e)

        return jsonify({
            "success": False,
            "message": "Could not open conversation."
        }), 500

# ---------------- DELETE ONE CHAT ---------------- #

@app.route("/delete_chat/<chat_id>", methods=["DELETE"])
def delete_chat(chat_id):

    if "user" not in session:
        return jsonify({
            "success": False,
            "message": "Please login first."
        }), 401

    username = session["user"]

    try:
        conn = sqlite3.connect("mood.db")
        cursor = conn.cursor()

        cursor.execute("""
            DELETE FROM chat_history
            WHERE chat_id = ?
              AND username = ?
        """, (chat_id, username))

        deleted = cursor.rowcount

        conn.commit()
        conn.close()

        if deleted == 0:
            return jsonify({
                "success": False,
                "message": "Conversation not found."
            }), 404

        # If the deleted chat was currently open,
        # create a new conversation
        if session.get("chat_id") == chat_id:
            session["chat_id"] = str(uuid.uuid4())

        return jsonify({
            "success": True,
            "message": "Conversation deleted successfully."
        })

    except Exception as e:

        print("Delete chat error:", e)

        return jsonify({
            "success": False,
            "message": "Could not delete conversation."
        }), 500       


# ---------------- CLEAR CHAT HISTORY ---------------- #

@app.route("/clear_chat_history", methods=["DELETE"])
def clear_chat_history():

    # -------------------------------------------------
    # CHECK LOGIN
    # -------------------------------------------------

    if "user" not in session:

        return jsonify({

            "success": False,

            "message": "Please login first."

        }), 401

    username = session["user"]

    try:

        conn = sqlite3.connect("mood.db")
        cursor = conn.cursor()

        # IMPORTANT:
        # Delete ONLY the current user's chats

        cursor.execute("""
            DELETE FROM chat_history
            WHERE username = ?
        """, (username,))

        conn.commit()

        deleted_count = cursor.rowcount

        conn.close()

        return jsonify({

            "success": True,

            "message": "Your chat history has been cleared.",

            "deleted": deleted_count

        })

    except Exception as e:

        print("Clear chat history error:", e)

        return jsonify({

            "success": False,

            "message": "Could not clear chat history."

        }), 500



# ---------------- SAVE MOOD ---------------- #

@app.route("/save_mood", methods=["POST"])
def save_mood():

    # Make sure user is logged in
    if "user" not in session:
        return jsonify({
            "success": False,
            "error": "Please login first."
        }), 401

    data = request.get_json(silent=True) or {}

    mood = (data.get("mood") or "").strip().lower()

    if not mood:
        return jsonify({
            "success": False,
            "error": "Mood is required."
        }), 400

    username = session["user"]

    conn = sqlite3.connect("mood.db")
    cursor = conn.cursor()

    cursor.execute(
        """
        INSERT INTO moods (username, mood)
        VALUES (?, ?)
        """,
        (username, mood)
    )

    conn.commit()
    conn.close()

    return jsonify({
        "success": True,
        "message": "Mood saved successfully."
    })

# ---------------- GET MOODS ---------------- #

# ---------------- GET MOODS ---------------- #

@app.route("/get_moods", methods=["GET"])
def get_moods():

    # Make sure user is logged in
    if "user" not in session:
        return jsonify({
            "success": False,
            "error": "Please login first."
        }), 401

    username = session["user"]

    conn = sqlite3.connect("mood.db")
    cursor = conn.cursor()

    cursor.execute(
        """
        SELECT mood
        FROM moods
        WHERE username = ?
        ORDER BY created_at ASC
        """,
        (username,)
    )

    data = cursor.fetchall()

    conn.close()

    moods = [row[0] for row in data]

    return jsonify({
        "success": True,
        "moods": moods
    })

# ---------------- JOURNAL ---------------- #

@app.route("/save_journal", methods=["POST"])
def save_journal():
    if "user" not in session:
        return jsonify({"success": False, "message": "Please login first."}), 401

    data = request.get_json(silent=True) or {}
    title = (data.get("title") or "My Journal Entry").strip()
    content = (data.get("content") or "").strip()

    if not content:
        return jsonify({"success": False, "message": "Journal content cannot be empty."}), 400

    conn = sqlite3.connect("mood.db")
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO journals (username, title, content) VALUES (?, ?, ?)",
        (session["user"], title, content)
    )
    journal_id = cursor.lastrowid
    conn.commit()
    conn.close()

    return jsonify({"success": True, "message": "Journal saved.", "id": journal_id})


@app.route("/get_journals", methods=["GET"])
def get_journals():
    if "user" not in session:
        return jsonify({"success": False, "message": "Please login first."}), 401

    conn = sqlite3.connect("mood.db")
    cursor = conn.cursor()
    cursor.execute(
        "SELECT id, title, content, created_at FROM journals WHERE username=? ORDER BY id DESC",
        (session["user"],)
    )
    rows = cursor.fetchall()
    conn.close()

    journals = [
        {"id": r[0], "title": r[1], "content": r[2], "created_at": r[3]}
        for r in rows
    ]
    return jsonify({"success": True, "journals": journals})


@app.route("/delete_journal/<int:journal_id>", methods=["DELETE"])
def delete_journal(journal_id):
    if "user" not in session:
        return jsonify({"success": False, "message": "Please login first."}), 401

    conn = sqlite3.connect("mood.db")
    cursor = conn.cursor()
    cursor.execute(
        "DELETE FROM journals WHERE id=? AND username=?",
        (journal_id, session["user"])
    )
    conn.commit()
    deleted = cursor.rowcount
    conn.close()

    return jsonify({"success": deleted > 0})

@app.route("/edit_journal/<int:journal_id>", methods=["PUT"])
def edit_journal(journal_id):

    print("EDIT JOURNAL API CALLED")
    print("Journal ID:", journal_id)

    if "user" not in session:
        return jsonify({
            "success": False,
            "message": "Please login first."
        }), 401

    data = request.get_json(silent=True) or {}

    print("Received data:", data)

    title = (data.get("title") or "My Journal Entry").strip()
    content = (data.get("content") or "").strip()

    if not content:
        return jsonify({
            "success": False,
            "message": "Journal content cannot be empty."
        }), 400

    conn = sqlite3.connect("mood.db")
    cursor = conn.cursor()

    cursor.execute(
        """
        UPDATE journals
        SET title=?, content=?
        WHERE id=? AND username=?
        """,
        (title, content, journal_id, session["user"])
    )

    updated = cursor.rowcount

    conn.commit()
    conn.close()

    print("Rows updated:", updated)

    if updated == 0:
        return jsonify({
            "success": False,
            "message": "Journal not found."
        }), 404

    return jsonify({
        "success": True,
        "message": "Journal updated successfully."
    })

@app.route("/clear_journals", methods=["DELETE"])
def clear_journals():
    if "user" not in session:
        return jsonify({"success": False, "message": "Please login first."}), 401

    conn = sqlite3.connect("mood.db")
    cursor = conn.cursor()
    cursor.execute("DELETE FROM journals WHERE username=?", (session["user"],))
    conn.commit()
    conn.close()

    return jsonify({"success": True})

# ---------------- LOGOUT ---------------- #

@app.route("/logout")
def logout():
    session.pop("user", None)
    return redirect("/")

# ---------------- RUN APP ---------------- #

if __name__ == "__main__":
    app.run(debug=True)