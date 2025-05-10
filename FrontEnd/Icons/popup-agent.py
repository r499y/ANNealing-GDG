import subprocess

result = subprocess.run([
    "/mnt/c/Windows/System32/cmd.exe",
    "/c",
    "C:\\Users\\gpisa\\AppData\\Roaming\\npm\\electron.cmd",
    "C:\\Users\\gpisa\\Desktop\\Hackathon\\popup-agent"
])

clicked_apri_ora = (result.returncode == 0)
print(clicked_apri_ora)  # True se "Apri ora", False se "X"
