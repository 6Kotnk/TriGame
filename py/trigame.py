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

# Function to convert degrees to radians
def deg_to_rad(deg):
    return deg * math.pi / 180

# Haversine formula to calculate distance between two points on the Earth
def haversine(coord1, coord2):
    R = 6371  # Radius of the Earth in kilometers
    lat1, lon1 = coord1
    lat2, lon2 = coord2
    dLat = deg_to_rad(lat2 - lat1)
    dLon = deg_to_rad(lon2 - lon1)
    a = math.sin(dLat / 2) ** 2 + math.cos(deg_to_rad(lat1)) * math.cos(deg_to_rad(lat2)) * math.sin(dLon / 2) ** 2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    distance = R * c
    print(distance)
    return distance

# Function to calculate the spherical excess and area of the spherical triangle
def spherical_excess(coord1, coord2, coord3):
    # Calculate the sides of the triangle (arc distances on the sphere's surface)
    a = haversine(coord2, coord3)
    b = haversine(coord1, coord3)
    c = haversine(coord1, coord2)
    
    # Convert distances to angular distances in radians
    a /= R
    b /= R
    c /= R
    
    # Use the spherical law of cosines to calculate angles
    cosA = (math.cos(a) - math.cos(b) * math.cos(c)) / (math.sin(b) * math.sin(c))
    cosB = (math.cos(b) - math.cos(a) * math.cos(c)) / (math.sin(a) * math.sin(c))
    cosC = (math.cos(c) - math.cos(a) * math.cos(b)) / (math.sin(a) * math.sin(b))
    
    A = math.acos(cosA)
    print(A)
    B = math.acos(cosB)
    print(B)
    C = math.acos(cosC)
    print(C)
    
    # Calculate spherical excess
    E = A + B + C - math.pi
    
    # Calculate the area of the spherical triangle
    area = E * R**2
    return area

# Example usage
city1 = "Tokyo"
city2 = "Paris"
city3 = "Colombo"

filename = "geonames_all_cities_with_a_population_1000.csv"

# Get coordinates for each city
city1 = find_coordinates(city1, filename)
city2 = find_coordinates(city2, filename)
city3 = find_coordinates(city3, filename)

print(city1)
print(city2)
print(city3)

cities = [city1, city2, city3]

area = spherical_excess(city1, city2, city3)

print("The area is " + str(area) + " km²")