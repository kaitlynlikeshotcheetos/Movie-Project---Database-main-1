// mainController.js

import Movie from '../models/Movie.js';
import fetch from 'node-fetch';

let savedMovies, totalMovies, totalTimesWatched, sortCriteria;

export const showMovies = async (req, res) => {
  await aggregateMoviesData();
  savedMovies = await Movie.find().sort(sortCriteria);
  res.render('index', { savedMovies, totalMovies, totalTimesWatched, sortCriteria });
}

export const searchMovies = async (req, res) => {
  const movieTitle = req.body.movieTitle;
  try {
    const response = await fetch(`http://www.omdbapi.com/?t=${movieTitle}&apikey=${process.env.MOVIE_KEY}`);
    const movie = await response.json();
    console.log(movie);
    res.render('results', { movie });
  } catch (error) {
    res.status(500).send('Error fetching data');
  }
};
/*
export const saveTierMovies = async (req, res) => {
  const { sMovies, aMovies, bMovies, cMovies, dMovies } = req.body;

  try {
    await Promise.all([
      saveMoviesToTier(sMovies, 'S'),
      saveMoviesToTier(aMovies, 'A'),
      saveMoviesToTier(bMovies, 'B'),
      saveMoviesToTier(cMovies, 'C'),
      saveMoviesToTier(dMovies, 'D'),
    ]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error saving movies to tiers' });
  }
};

export const getTierMovies = async (req, res) => {
  try {
    const sMovies = await Movie.find({ tier: 'S' });
    const aMovies = await Movie.find({ tier: 'A' });
    const bMovies = await Movie.find({ tier: 'B' });
    const cMovies = await Movie.find({ tier: 'C' });
    const dMovies = await Movie.find({ tier: 'D' });
    res.render('tier', { sMovies, aMovies, bMovies, cMovies, dMovies });
    //res.status(200).json({ sMovies, aMovies, bMovies, cMovies, dMovies });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching tier movies' });
  }
};
*/

export const showTier = async (req, res) => {
  try {
    const sMovies = await Movie.find({ tier: 'S' });
    const aMovies = await Movie.find({ tier: 'A' });
    const bMovies = await Movie.find({ tier: 'B' });
    const cMovies = await Movie.find({ tier: 'C' });
    const dMovies = await Movie.find({ tier: 'D' });
    const savedMovies = await Movie.find() || []; // Default to an empty array if no movies are found

    res.render('tier', { sMovies, aMovies, bMovies, cMovies, dMovies, savedMovies });
  } catch (error) {
    console.error(error);
    req.flash('error', 'Error fetching saved movies');
    res.status(500).send('Error processing request');
  }
};



export const saveMovie = async (req, res) => {
  const { title, poster, director, year, boxOffice } = req.body;

  try {
    let movie = await Movie.findOne({ title: title });

    if (movie) {
      movie.timesWatched += 1;
      await movie.save();
    } else {
      movie = new Movie({
        title,
        poster,
        director,
        year,
        boxOffice,
        timesWatched: 1
      });
      await movie.save();
      req.flash('success', `${title} saved`);
    }
    res.redirect('/');
  } catch (error) {
    console.error(error);
    req.flash('error', 'Error saving movie');
    res.status(500).send('Error processing request');
  }
};

export const watchMovie = async (req, res) => {
  const movieId = req.params.id;

  try {
    const movie = await Movie.findById(movieId);
    if (movie) {
      movie.timesWatched += 1;
      await movie.save();
    }
    res.redirect('/');
  } catch (error) {
    console.error(error);
    req.flash('error', 'Error watching movie');
    res.status(500).send('Error processing request');
  }
};

export const deleteMovie = async (req, res) => {
  const movieId = req.params.id;

  try {
    const movie = await Movie.findByIdAndDelete(movieId);
    req.flash('success', `${movie.title} successfully deleted`);
    res.redirect('/');
  } catch (error) {
    console.error(error);
    req.flash('error', 'Error deleting movie');
    res.status(500).send('Error processing request');
  }
};

export const sortMovies = async (req, res) => {
  try {
    if (sortCriteria && sortCriteria.title === 1) {
      sortCriteria = { timesWatched: 1 };
    } else {
      sortCriteria = { title: 1 };
    }
    res.redirect('/');
  } catch (error) {
    console.error(error);
    req.flash('error', 'Error sorting movies');
    res.status(500).send('Error processing request');
  }
};

const aggregateMoviesData = async () => {
  try {
    const result = await Movie.aggregate([
      {
        $group: {
          _id: null,
          totalMovies: { $sum: 1 },
          totalTimesWatched: { $sum: "$timesWatched" }
        }
      }
    ]);

    if (result.length > 0) {
      totalMovies = result[0].totalMovies;
      totalTimesWatched = result[0].totalTimesWatched;
      console.log(`Total Movies: ${totalMovies}, Total Times Watched: ${totalTimesWatched}`);
    } else {
      console.log("No data found.");
    }
  } catch (error) {
    console.error("Error aggregating movie data:", error);
  }
};
