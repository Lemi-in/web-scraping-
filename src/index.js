const fs = require('fs');
const axios = require('axios');
const cheerio = require('cheerio');

const url = 'https://www.imdb.com/chart/top/';

async function getMovies() {
  try {
    const { data: html } = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36',
      },
    });
    return html;
  } catch (error) {
    console.error('Error fetching data:', error);
    throw error;
  }
}

async function fetchAndSaveMovies() {
  try {
    const html = await getMovies();
    const $ = cheerio.load(html);
    const newMovies = {};

    const moviesList = $('#__next > main > div > div.ipc-page-content-container.ipc-page-content-container--center > section > div > div.ipc-page-grid.ipc-page-grid--bias-left > div > ul li');

    moviesList.each((i, movie) => {
      const title = $(movie).find('.ipc-metadata-list-summary-item__t').text().trim();
      const rating = $(movie).find('.ipc-metadata-list-summary-item__c').text().trim();

      console.log(`Title: ${title}, Rating: ${rating}`);

      if (title && rating) {
        newMovies[title] = rating;
      }
    });

    if (Object.keys(newMovies).length === 0) {
      console.log('No movies found. Check your selectors.');
      return;
    }

    // Write to movies.json
    const filePath = `${__dirname}/movies.json`;
    fs.writeFile(filePath, JSON.stringify(newMovies, null, 4), (err) => {
      if (err) {
        console.error('Error writing to file:', err);
      } else {
        console.log('File has been saved successfully at:', filePath);
      }
    });
  } catch (error) {
    console.error('Error processing movies:', error);
  }
}

fetchAndSaveMovies();
