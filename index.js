const express = require('express');
const axios = require('axios');
const mongoose = require('mongoose');

// Create Express app
const app = express();
const PORT = 3000;

// MongoDB connection
mongoose.connect('mongodb://127.0.0.1:27017/weatherDB', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected!'))
.catch((err) => console.error('Failed to connect to MongoDB', err));

// Define a Mongoose schema for weather
const weatherSchema = new mongoose.Schema({
  id: Number,
  main: String,
  description: String,
  icon: String
});

// Create a Mongoose model
const Weather = mongoose.model('Weather', weatherSchema);

const weatherMainSchema = new mongoose.Schema({
  temp:	Number,
  feels_like:	Number,
  temp_min:	Number,
  temp_max:	Number,
  pressure:	Number,
  humidity:	Number,
  sea_level:	Number,
  grnd_level:	Number,
  visibility:	Number
});

const WeatherMain = mongoose.model('WeatherMain',weatherMainSchema);

// API route to get weather data and save it to MongoDB
app.get('/save-weather', async (req, res) => {
  try {
    const apiKey = '0bfac54a7391cf819cef2874e95710d8';  // Your OpenWeatherMap API key
    const city = req.query.city;  // Get the city from query parameter
    
    // Check if city is provided in the query
    if (!city) {
      return res.status(400).json({ error: 'Please provide a city name' });
    }

    const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}`;
    
    // Fetch weather data
    const response = await axios.get(weatherUrl);
    
    // Extract the 'weather' data from the response
    const weatherData = response.data.weather[0];  // Extract only the first weather object
    const weatherMainData = response.data.main;

    const newWeatherMain = new WeatherMain({
      temp:	weatherMainData.temp,
      feels_like:	weatherMainData.feels_like,
      temp_min:	weatherMainData.temp_min,
      temp_max:	weatherMainData.temp_max,
      pressure:	weatherMainData.pressure,
      humidity:	weatherMainData.humidity,
      sea_level:	weatherMainData.sea_level,
      grnd_level:	weatherMainData.grnd_level,
      visibility:	weatherMainData.visibility
    });
    
    

    // Create a new weather document from the fetched data
    const newWeather = new Weather({
      id: weatherData.id,
      main: weatherData.main,
      description: weatherData.description,
      icon: weatherData.icon
    });

    // Save the weather data to MongoDB
    await newWeatherMain.save();

    res.json({
      message: 'Weather Main data saved successfully!',
      weatherData: newWeatherMain
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch or save weather data' });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
