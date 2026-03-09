import paramiko
import io
import sys

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

HOST = "121.40.172.33"
USER = "root"
PASSWD = "Wiseflow0616!"

NGINX_BLOCK = """
    # 模具管家Web
    location /mold/ {
        proxy_pass http://127.0.0.1:8080/mold/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # 模具管家API
    location /api/mold/ {
        proxy_pass http://127.0.0.1:3000/api/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

"""

c = paramiko.SSHClient()
c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
c.connect(HOST, username=USER, password=PASSWD, timeout=10)

# read current config
sftp = c.open_sftp()
with sftp.open("/etc/nginx/conf.d/ip-direct.conf", "r") as f:
    content = f.read().decode()

# remove broken lines from previous attempt
lines = content.split('\n')
clean = []
skip = False
for line in lines:
    if 'System.Management.Automation' in line or 'proxy_set_header X-Real-IP \\;' in line or 'proxy_set_header X-Forwarded' in line and '\\;' in line:
        skip = True
        continue
    if skip and line.strip() == '}':
        skip = False
        continue
    if skip:
        continue
    clean.append(line)
content = '\n'.join(clean)

# remove any leftover broken blocks
while '# 模具管家' in content:
    start = content.index('# 模具管家')
    before = content.rfind('\n', 0, start)
    end = content.find('\n\n', start)
    if end == -1:
        end = len(content)
    content = content[:before] + content[end:]

# insert before "# 默认页面"
marker = "    # 默认页面"
if marker in content:
    content = content.replace(marker, NGINX_BLOCK + marker)

with sftp.open("/etc/nginx/conf.d/ip-direct.conf", "w") as f:
    f.write(content)
sftp.close()

# test and reload
_, o, e = c.exec_command("nginx -t 2>&1; systemctl reload nginx 2>&1")
print(o.read().decode())
print(e.read().decode())
c.close()
print("Done")
