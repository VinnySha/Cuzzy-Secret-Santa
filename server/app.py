from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from dotenv import load_dotenv
import os
from pymongo import MongoClient
from routes.auth import auth_bp
from routes.assignments import assignments_bp
from routes.admin import admin_bp

load_dotenv()

app = Flask(__name__, static_folder="../dist", static_url_path="")
app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET", "secret-santa-key")
app.config["JWT_ACCESS_TOKEN_EXPIRES"] = False  # 7 days handled in token creation

CORS(app)
jwt = JWTManager(app)

# MongoDB connection
mongodb_uri = os.getenv("MONGODB_URI", "mongodb://localhost:27017/secret-santa")
try:
    client = MongoClient(mongodb_uri)
    db = client.get_database()
    print("✅ Connected to MongoDB")
except Exception as error:
    print(f"❌ MongoDB connection error: {error}")

# Make db available to routes
app.config["MONGO_DB"] = db

# Register blueprints
app.register_blueprint(auth_bp, url_prefix="/api/auth")
app.register_blueprint(assignments_bp, url_prefix="/api/assignments")
app.register_blueprint(admin_bp, url_prefix="/api/admin")


@app.route("/api/health")
def health():
    return jsonify({"status": "ok", "message": "Server is running"})


# Serve React app in production
@app.route("/", defaults={"path": ""})
@app.route("/<path:path>")
def serve(path):
    if path != "" and os.path.exists(app.static_folder + "/" + path):
        return send_from_directory(app.static_folder, path)
    else:
        return send_from_directory(app.static_folder, "index.html")


if __name__ == "__main__":
    port = int(os.getenv("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=True)

