import paramiko, os

host = '121.40.172.33'
user = 'root'
pwd = 'Wiseflow0616!'
local_apk = r'e:\APP\mold\mobile\android\app\build\outputs\apk\release\app-release.apk'
remote_path = '/var/www/downloads/mold-keeper-v1.0.0.apk'

size_mb = os.path.getsize(local_apk) / 1024 / 1024
print(f'APK size: {size_mb:.1f} MB')

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect(host, username=user, password=pwd, timeout=10)

ssh.exec_command('mkdir -p /var/www/downloads')
import time; time.sleep(1)

sftp = ssh.open_sftp()
print('Uploading...')
sftp.put(local_apk, remote_path)
sftp.close()
print('Upload done')

ssh.exec_command('nginx -s reload')
ssh.close()
print(f'Download: http://{host}/downloads/mold-keeper-v1.0.0.apk')
