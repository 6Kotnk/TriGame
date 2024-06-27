SOURCE = 'city_names.csv'
DESTINATION = 'datalist.file'

HEADER = '<datalist id=\"City_names\">\n'
FOOTER = '</datalist>'


with open(SOURCE, encoding="utf8") as src, open(DESTINATION, 'w', encoding="utf8") as dst:

    dst.write(HEADER)

    for row in src:
        row_split = row.split(';')

        dst.write('  <option value=\"' + row_split[0] + '\"></option>\n')

    dst.write(FOOTER)
"""
<datalist id=\"ice-cream-flavors\">
  <option value="Chocolate"></option>
  <option value="Coconut"></option>
  <option value="Mint"></option>
  <option value="Strawberry"></option>
  <option value="Vanilla"></option>
</datalist>
"""

