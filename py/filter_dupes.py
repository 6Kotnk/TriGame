FILE = 'city_names.csv'

cities_seen = set() # holds lines already seen
rows = [] # holds lines already seen


with open(FILE, "r", encoding="utf8") as file:
    for row in file:
        row_split = row.split(';')
        rows.append(row_split)
  
  
  
with open(FILE, "w", encoding="utf8") as file:
  for row in rows:
    if row[0] not in cities_seen: # not a duplicate
      cities_seen.add(row[0])
      file.write(";".join(row))




