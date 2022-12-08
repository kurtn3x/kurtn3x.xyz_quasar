file = open('countries.js', 'r')
for line in file.readlines():
  edited = line.replace('{', '').replace('}', '').replace('label:', '').replace('value:', '')
  print(edited)
