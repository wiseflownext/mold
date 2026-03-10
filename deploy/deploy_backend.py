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

def run(cmd, timeout=300):
    print(f'\n>>> {cmd}')
    stdin, stdout, stderr = ssh.exec_command(cmd, timeout=timeout)
    o = stdout.read().decode('utf-8', errors='replace')
    e = stderr.read().decode('utf-8', errors='replace')
    if o.strip(): print(o[-3000:])
    if e.strip(): print(e[-3000:])
    return o + e

# git already pulled, just rebuild
run(f'cd {proj} && docker compose -f deploy/docker-compose.prod.yml build --no-cache server', timeout=600)
run(f'cd {proj} && docker compose -f deploy/docker-compose.prod.yml up -d --force-recreate server', timeout=60)
run(f'sleep 3 && docker logs mold-server --tail 20', timeout=30)

ssh.close()
print('\nDone')
