import os
os.system("quasar build")
os.system("scp -r dist/spa/* root@193.218.118.184:/var/www/kurtn3x.xyz/www/.")
