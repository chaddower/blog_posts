# Weather App

This is a simple command-line weather application that fetches weather data for a given city using the OpenWeatherMap API.

## Setup

1. Clone this repository.
2. Install the required packages:
   ```
   pip install requests
   ```
3. Sign up for a free API key at [OpenWeatherMap](https://openweathermap.org/api).
4. Replace 'YOUR_API_KEY' in `config.py` with your actual API key.

## Usage

Run the application from the command line, providing a city name as an argument:

```
python main.py "New York"
```

The app will display the current temperature, weather description, and humidity for the specified city.

## Files

- `main.py`: The main script that handles user input and displays weather information.
- `weather_api.py`: Contains the function to make API calls to OpenWeatherMap.
- `config.py`: Stores the API key (make sure to keep this private and not share it publicly).

## Note

This is a basic implementation and can be extended with more features, such as forecasts, additional weather data, or a graphical user interface.