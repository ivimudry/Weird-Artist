import urllib.request
import re

req = urllib.request.Request('https://raycast.com', headers={'User-Agent': 'Mozilla/5.0'})
html = urllib.request.urlopen(req).read().decode('utf-8')
matches = re.findall(r'/_next/static/css/[\w.-]+\.css', html)
print(f"Found {len(matches)} CSS files")
for m in set(matches):
    print(f"https://raycast.com{m}")
