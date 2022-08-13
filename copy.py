import os
os.system("quasar build")
os.system("scp -r dist/spa/* root@vps2305095.fastwebserver.de:/var/www/kurtn3x.xyz/kurtn3x.xyz/.")