import paramiko
import io
import sys

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

c = paramiko.SSHClient()
c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
c.connect('121.40.172.33', username='root', password='Wiseflow0616!')

cmd = 'curl -s -X POST http://127.0.0.1:3000/api/auth/login -H "Content-Type: application/json" -d \'{"username":"admin","password":"admin123"}\''
_, o, e = c.exec_command(cmd)
print(o.read().decode())
c.close()
