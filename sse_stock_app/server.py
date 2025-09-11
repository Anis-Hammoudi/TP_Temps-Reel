from flask import Flask, request, jsonify, render_template
import threading

app = Flask(__name__, static_folder='static', template_folder='templates')

ALLOWED_STATUSES = ["En attente", "En cours", "Terminée", "Échec"]

current_status = "En attente"
status_version = 0
status_lock = threading.Condition()


@app.route("/")
def index():
    return render_template("index.html")


@app.post("/update-status")
def update_status():
    global current_status, status_version
    data = request.get_json(silent=True) or request.form
    new_status = (data.get("status") or "").strip()

    if new_status not in ALLOWED_STATUSES:
        return jsonify({"error": f"Statut invalide. Autorisés: {ALLOWED_STATUSES}"}), 400

    with status_lock:
        if new_status != current_status:
            current_status = new_status
            status_version += 1
            status_lock.notify_all()

        resp = jsonify({"status": current_status, "version": status_version})
        resp.headers["Cache-Control"] = "no-cache, no-store, must-revalidate"
        resp.headers["Pragma"] = "no-cache"
        resp.headers["Expires"] = "0"
        return resp


@app.get("/poll-status")
def poll_status():
    global current_status, status_version
    try:
        last_version = int(request.args.get("last_version", -1))
    except ValueError:
        last_version = -1

    timeout_seconds = 25

    with status_lock:
        if last_version < status_version:
            resp = jsonify({"status": current_status, "version": status_version})
            resp.headers["Cache-Control"] = "no-cache, no-store, must-revalidate"
            resp.headers["Pragma"] = "no-cache"
            resp.headers["Expires"] = "0"
            return resp

        status_lock.wait(timeout_seconds)

        if last_version < status_version:
            resp = jsonify({"status": current_status, "version": status_version})
            resp.headers["Cache-Control"] = "no-cache, no-store, must-revalidate"
            resp.headers["Pragma"] = "no-cache"
            resp.headers["Expires"] = "0"
            return resp

    return ("", 204)


if __name__ == "__main__":
    app.run(debug=True, threaded=True, port=5000)