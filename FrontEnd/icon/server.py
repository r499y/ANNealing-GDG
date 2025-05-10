from flask import Flask, request
import subprocess

app = Flask(__name__)

@app.route("/toast", methods=["POST"])
def toast():
    data = request.json
    title = data.get("title", "Notifica")
    body = data.get("body", "Contenuto mancante")

    cmd = f"""
    /mnt/c/Windows/System32/WindowsPowerShell/v1.0/powershell.exe \
    -Command 'Add-Type -AssemblyName PresentationFramework;[System.Windows.MessageBox]::Show("{body}", "{title}")'
    """
    subprocess.run(cmd, shell=True)
    return "Toast inviato!"

if __name__ == "__main__":
    app.run(port=5000)
