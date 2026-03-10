import paramiko, sys, io, time

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')

host = '121.40.172.33'
user = 'root'
pwd = 'Wiseflow0616!'
proj = '/opt/mold-keeper'

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect(host, username=user, password=pwd, timeout=10)

def run(cmd, timeout=600):
    print(f'\n>>> {cmd}')
    stdin, stdout, stderr = ssh.exec_command(cmd, timeout=timeout)
    o = stdout.read().decode('utf-8', errors='replace')
    e = stderr.read().decode('utf-8', errors='replace')
    if o.strip(): print(o[-3000:])
    if e.strip(): print(e[-3000:])
    return o + e

for i in range(3):
    result = run(f'cd {proj} && git checkout -- . && git clean -fd && git pull origin main', timeout=180)
    if 'Already up to date' in result or 'files changed' in result or 'Fast-forward' in result:
        break
    print(f'Retry {i+1}...')
    time.sleep(5)

run(f'cd {proj} && docker compose -f deploy/docker-compose.prod.yml build --no-cache server web', timeout=600)
run(f'cd {proj} && docker compose -f deploy/docker-compose.prod.yml up -d --force-recreate server web', timeout=60)
time.sleep(5)
run('docker logs mold-server --tail 10', timeout=10)
run('docker logs mold-web --tail 10', timeout=10)
run(f'cd {proj} && docker compose -f deploy/docker-compose.prod.yml ps', timeout=10)

ssh.close()
print('\nDone')
