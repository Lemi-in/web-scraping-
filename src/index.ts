import express, { Request, Response } from 'express';
import axios from 'axios';
import * as cheerio from 'cheerio';
import * as fs from 'fs';

const url = 'https://www.imdb.com/chart/top/';

// Define the type for storing movies
interface Movies {
  [key: string]: string;
}

const app = express();
const PORT = 3000;
app.use(express.json());

// Function to fetch movies data
async function getMovies(): Promise<string> {
  try {
    const { data: html } = await axios.get(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36',
      },
    });
    return html;
  } catch (error) {
    console.error('Error fetching data:', error);
    throw error; // Propagate the error
  }
}

// Fetch and save movies data
async function fetchAndSaveMovies() {
  try {
    const html = await getMovies();
    const $ = cheerio.load(html);
    const newMovies: Movies = {};

    // Use the selector for the whole movie list
    const moviesList = $('#__next > main > div > div.ipc-page-content-container.ipc-page-content-container--center > section > div > div.ipc-page-grid.ipc-page-grid--bias-left > div > ul li');

    // Iterate through each movie item
    moviesList.each((i, movie) => {
      const title = $(movie).find('.ipc-metadata-list-summary-item__t').text().trim(); // Adjust the title selector as needed
      const rating = $(movie).find('.ipc-metadata-list-summary-item__c').text().trim(); // Adjust the rating selector as needed

      // Log the title and rating
      console.log(`Title: ${title}, Rating: ${rating}`);

      if (title && rating) {
        newMovies[title] = rating; // Only add if both title and rating exist
      }
    });
    // Write to movies.json
    fs.writeFile('movies.json', JSON.stringify(newMovies, null, 4), (err) => {
      if (err) {
        console.error('Error writing to file:', err);
      } else {
        console.log('File has been saved');
      }
    });
  } catch (error) {
    console.error('Error processing movies:', error);
  }
}

// Start fetching and saving movies data
fetchAndSaveMovies();

// Define the route to check if the server is running
app.get('/', (req: Request, res: Response) => {
  res.send('Server is running on port 3000');
  console.log('Server is running on port 3000');
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
