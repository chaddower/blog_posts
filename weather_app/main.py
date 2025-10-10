import sys
from weather_api import get_weather
from config import API_KEY

def main():
    if len(sys.argv) != 2:
        print("Usage: python main.py <city>")
        sys.exit(1)
    
    city = sys.argv[1]
    weather_data = get_weather(city, API_KEY)
    
    if weather_data:
        print(f"Weather in {city}:")
        print(f"Temperature: {weather_data['temperature']}°C")
        print(f"Description: {weather_data['description']}")
        print(f"Humidity: {weather_data['humidity']}%")
    else:
        print("Failed to retrieve weather data.")

if __name__ == "__main__":
    main()