import { useCallback, useEffect, useState } from "react";
import { useLocation } from "./hooks";
import { Dimmer, Loader } from "semantic-ui-react";
import Weather from "./Weather";

const WeatherDashboard = () => {
  const [lat, long] = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [weatherData, setWeatherData] = useState(undefined);
  const [forecastData, setForecastData] = useState(undefined);
  const [toggleForecast, setToggleForecast] = useState(false);

  //gets the weather data from api using fetch
  //this is wrapped in `useCallback` so as to not cause the `useEffect` to execute on each render
  const getWeather = useCallback(async (lat, long) => {
    const result = await fetch(
      `${process.env.REACT_APP_WEATHER_API_URL}/weather/?lat=${lat}&lon=${long}&units=metric&APPID=${process.env.REACT_APP_WEATHER_API_KEY}`
    );

    if (!result.ok) {
      return new Error("An error occurred");
    }

    const weatherData = await result.json();
    if (Object.entries(weatherData).length) {
      return weatherData;
    }
  }, []);

  // -----------------

  const getForecast = useCallback(async (lat, long) => {
    const result = await fetch(
      `${process.env.REACT_APP_WEATHER_API_URL}/forecast?lat=${lat}&lon=${long}&units=metric&APPID=${process.env.REACT_APP_WEATHER_API_KEY}`
    );

    if (!result.ok) {
      return new Error("An error occurred");
    }

    const forecastData = await result.json();
    if (Object.entries(forecastData).length) {
      return forecastData;
    }
  }, []);

  //------------------

  //calls our fetch function to get data & sets state
  useEffect(() => {
    if (lat && long && !isLoading && !weatherData) {
      setIsLoading(true);
      getWeather(lat, long)
        .then((data) => setWeatherData(data))
        .finally(() => setIsLoading(false));
    }
  }, [getWeather, isLoading, lat, long, weatherData]);

  useEffect(() => {
    if (lat && long && !isLoading && !weatherData) {
      setIsLoading(true);
      getForecast(lat, long)
        .then((data) => {
          setForecastData(
            data.list.filter((dataItem) => dataItem.dt_txt.match(/9:00:00/))
          );
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [getForecast, forecastData, isLoading, lat, long, weatherData]);

  useEffect(() => {
    if (forecastData) {
      console.log(forecastData);
    }
  }, [forecastData]);

  const content = toggleForecast ? (
    forecastData &&
    forecastData.map((item) => {
      return <Weather weatherData={item} key={crypto.randomUUID()} />;
    })
  ) : (
    <div>
      <Weather weatherData={weatherData} />
    </div>
  );

  //we conditionally render here using a ternary to show a loading screen or the actual data
  return (
    <div>
      <button
        style={{
          backgroundColor: "#00579B",
          color: "#f5f5f5",
          padding: "15px 30px",
          margin: "20px",
          border: "none",
          borderRadius: "50px",
          fontSize: "18px",
        }}
        onClick={() => setToggleForecast(!toggleForecast)}
      >
        {toggleForecast ? "Todays forecast" : "5 day forecast"}
      </button>
      {!isLoading && weatherData ? (
        content
      ) : (
        <div>
          <Dimmer active>
            <Loader>Loading..</Loader>
          </Dimmer>
        </div>
      )}
    </div>
  );
};

export default WeatherDashboard;

//5 DAY FORECAST
//api.openweathermap.org/data/2.5/
//forecast?lat=30.4916999&lon=-86.4456172&cnt=5&APPID=32bd3a7ef7d4b2e0a0205ceac62fa6ff
