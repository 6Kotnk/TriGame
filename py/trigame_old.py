import csv
import math

R = 6371  # Earth's radius in kilometers
dist = []
angles = []

def find_coordinates(city_name, filename):
  """
  Searches for the coordinates of a given city in the specified CSV file.

  Args:
      city_name: The name of the city to search for.
      filename: The path to the CSV file containing city data.

  Returns:
      A list containing the latitude and longitude if found, otherwise None.
  """

  # Open the CSV file in read mode
  with open(filename, 'r', encoding="utf-8") as csvfile:
    reader = csv.reader(csvfile, delimiter=';')

    # Skip the header row
    next(reader)
    
    cities = []
    
    # Iterate through each row of data
    for city_data in reader:
      # Check if the city name (case-insensitive) matches the current row's name
      if city_name.lower() == city_data[1].lower():
        # Extract and return the coordinates (assuming they are in the last column) and population
        cities.append(city_data)
        
    cities.sort(key=lambda x: int(x[13]))
    largest_city = cities[-1] 
    coordinates = largest_city[-1].split(",")
    return (float(coordinates[0]), float(coordinates[1]))

def rotate(l, n):
    return l[n:] + l[:n]

def haversine(coord1, coord2):
  """
  Calculate the great circle distance between two points on Earth in kilometers.

  Args:
    lon1: Longitude of the first point in degrees.
    lat1: Latitude of the first point in degrees.
    lon2: Longitude of the second point in degrees.
    lat2: Latitude of the second point in degrees.

  Returns:
    The distance between the two points in kilometers.
  """
  
  lat1, lon1 = coord1
  lat2, lon2 = coord2

  R = 6371  # Earth's radius in kilometers

  dlon = math.radians(lon2 - lon1)
  dlat = math.radians(lat2 - lat1)

  a = math.sin(dlat / 2) * math.sin(dlat / 2) + math.cos(math.radians(lat1)) \
      * math.cos(math.radians(lat2)) * math.sin(dlon / 2) * math.sin(dlon / 2)

  c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))

  distance = R * c

  return distance

def dist2angle(opposite, side1, side2):
    R = 6371  # Earth's radius in kilometers

    cosAngle = (math.cos(opposite/R) - math.cos(side1/R) * math.cos(side2/R))\
            / (math.sin(side1/R) * math.sin(side2/R))
        
    angle = math.acos(cosAngle)
    print(angle)
    return angle


# Example usage
city1 = "Tokyo"
city2 = "Paris"
city3 = "Long island city"
city4 = "Peru"
city5 = "Madagascar"

filename = "geonames_all_cities_with_a_population_1000.csv"

# Get coordinates for each city
city1 = find_coordinates(city1, filename)
city2 = find_coordinates(city2, filename)
city3 = find_coordinates(city3, filename)
#city4 = find_coordinates(city4, filename)
#city5 = find_coordinates(city5, filename)

"""
# Get coordinates for each city
city1 = find_coordinates(city1, filename)
city2 = find_coordinates(city2, filename)
city3 = find_coordinates(city3, filename)
#city4 = find_coordinates(city4, filename)
#city5 = find_coordinates(city5, filename)
"""
city1 = (0, 0)  # Point 1
city2 = (0, 90)  # Point 2
city3 = (90, 0)  # Point 3

cities = [city1, city2, city3]

for city1, city2 in zip(cities, rotate(cities, 1)):
    dist.append(haversine(city1, city2))

print(dist)
print(sum(dist))

for side1, opposite, side2 in zip(rotate(dist, -1), dist, rotate(dist, 1)):
    angles.append(dist2angle(opposite, side1, side2))

area = (sum(angles) - math.pi) * R**2

print("The area is " + str(area) + " km²")