ORIGINAL = 'geonames_all_cities_with_a_population_1000.csv'
NEW = 'datalist.file'

HEADER = '<datalist id=\"City names\">\n'
FOOTER = '</datalist>'


with open(ORIGINAL, encoding="utf8") as original, open(NEW, 'w', encoding="utf8") as new:

    new.write(HEADER)

    for row in original:
        row_split = row.split(';')

        new.write('  <option value=\"' + row_split[2] + ', ' + row_split[6] + '\"></option>\n')

    new.write(FOOTER)
"""
<datalist id=\"ice-cream-flavors\">
  <option value="Chocolate"></option>
  <option value="Coconut"></option>
  <option value="Mint"></option>
  <option value="Strawberry"></option>
  <option value="Vanilla"></option>
</datalist>
"""

