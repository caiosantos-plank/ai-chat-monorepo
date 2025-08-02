type WeatherResponse = {
	weather: string;
	temperature: number;
	wind_speed: number;
};

interface OpenWeatherApiClientInterface {
	getWeather(location: string): Promise<WeatherResponse>;
}

export class OpenWeatherApiClient implements OpenWeatherApiClientInterface {
	private apiKey: string = process.env.NEXT_PUBLIC_OPEN_WEATHER_API_KEY || "";
	private baseUrl: string = process.env.NEXT_PUBLIC_OPEN_WEATHER_URL || "";

	async getWeather(location: string): Promise<WeatherResponse> {
		try {
			const response = await fetch(
				`${this.baseUrl}/data/2.5/weather?q=${location}&units=metric&appid=${this.apiKey}`,
			);
			const data = await response.json();

			if (!data.weather || data.weather.length === 0) {
				throw new Error();
			}

			return {
				weather:
					data.weather?.length > 0 ? data.weather[0].description : "Unknown",
				temperature: data.main.temp,
				wind_speed: data.wind.speed,
			};
		} catch (error) {
			console.error(error);
			throw new Error("Failed to fetch weather data");
		}
	}
}
