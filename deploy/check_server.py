import paramiko, sys, io

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')

host = '121.40.172.33'
user = 'root'
pwd = 'Wiseflow0616!'

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect(host, username=user, password=pwd, timeout=10)

def run(cmd, timeout=30):
    print(f'\n>>> {cmd}')
    stdin, stdout, stderr = ssh.exec_command(cmd, timeout=timeout)
    o = stdout.read().decode('utf-8', errors='replace')
    e = stderr.read().decode('utf-8', errors='replace')
    if o.strip(): print(o[-5000:])
    if e.strip(): print(e[-5000:])
    return o + e

run('docker logs mold-server --tail 60')
run('cat /etc/nginx/conf.d/ip-direct.conf | head -80')

ssh.close()
