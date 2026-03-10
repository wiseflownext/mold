import paramiko
import sys
import io

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')

HOST = "121.40.172.33"
USER = "root"
PASSWD = "Wiseflow0616!"

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(HOST, username=USER, password=PASSWD, timeout=10)

script = """import urllib.request, json
data = json.dumps({"username":"admin","password":"admin123"}).encode()
req = urllib.request.Request("http://127.0.0.1:3000/api/auth/login", data=data, headers={"Content-Type":"application/json"})
resp = urllib.request.urlopen(req)
result = json.loads(resp.read())
token = result["token"]
print("LOGIN OK")
req2 = urllib.request.Request("http://127.0.0.1:3000/api/molds/stats", headers={"Authorization":"Bearer "+token})
resp2 = urllib.request.urlopen(req2)
stats = json.loads(resp2.read())
print("STATS:", json.dumps(stats, indent=2))
req3 = urllib.request.Request("http://127.0.0.1:3000/api/molds?page=1&pageSize=5", headers={"Authorization":"Bearer "+token})
resp3 = urllib.request.urlopen(req3)
molds = json.loads(resp3.read())
print("MOLDS total:", molds.get("total"), "list len:", len(molds.get("list",[])))
"""

sftp = client.open_sftp()
with sftp.open('/tmp/test_api_remote.py', 'w') as f:
    f.write(script)
sftp.close()

stdin, stdout, stderr = client.exec_command('python3 /tmp/test_api_remote.py', timeout=30)
out = stdout.read().decode('utf-8', errors='replace')
err = stderr.read().decode('utf-8', errors='replace')
if out:
    print(out.rstrip())
if err:
    print("STDERR:", err.rstrip())
client.close()
