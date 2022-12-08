import flag
from emojiflags.lookup import lookup

file = open('countriesmap.txt', 'r')
filew = open('countries.js', 'w')
for line in file.readlines():
  edited = line.replace('{', '').replace('}', '').replace('label:', '').replace('value:', '').replace("'", '').replace(",", '').split()
  countrycode = edited.pop()
  country = ''
  for word in edited:
    country += word + " "
  line = f"'{country} \xa0 \xa0 {lookup(countrycode)}',\n"
  filew.write(line)

