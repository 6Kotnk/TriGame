SOURCE = 'city_names.csv'
DESTINATION = 'cities.json'

HEADER = '[\n'
FOOTER = ']'

cities_seen = set() # holds lines already seen
rows = [] # holds lines already seen

with open(SOURCE, encoding="utf8") as src, open(DESTINATION, 'w', encoding="utf8") as dst:

  dst.write(HEADER)

  for row in src:
    row_split = row.split(';')
    city_name = row_split[0]
    city_coords = row_split[1]

    if city_name not in cities_seen: # not a duplicate
      #dst.write('  <option value=\"' + row_split[0] + '\"></option>\n')
      dst.write('  {"name": "' + city_name + '", "coords": "' + city_coords[:-1] + '"},\n')

    cities_seen.add(city_name)

  dst.write(FOOTER)