import express from "express";
import uniqid from "uniqid";
import httpErrors from "http-errors";
import { getMovies, writeMovies } from "../../lib/fs-tools.js";

const netflixRouter = express.Router();
const { NotFound, Unauthorized, BadRequest } = httpErrors;

netflixRouter.post("/", async (req, res, next) => {
  try {
    const newMoive = { ...req.body, createdAt: new Date(), imdbID: uniqid() };
    const movieArray = await getMovies();
    movieArray.push(newMoive);
    await writeMovies(movieArray);
    res.status(201).send({ imdbID: newMoive.mdbID });
  } catch (error) {
    next(error);
  }
});

netflixRouter.get("/", async (req, res, next) => {
  try {
    const movieArray = await getMovies();
    if (req.query && req.query.category) {
      const filteredMovie = movieArray.filter(
        (movie) => movie.type === req.query.type
      );
      res.send(filteredMovie);
    } else {
      res.send(movieArray);
    }
  } catch (error) {
    next(error);
  }
});

netflixRouter.get("/:id", async (req, res, next) => {
  try {
    const movies = await getMovies();
    const movie = movies.find((movie) => movie.imdbID === req.params.id);
    if (movie) {
      res.send(movie);
    } else {
      next(NotFound(`movie with id ${req.params.id} not found!`));
    }
  } catch (error) {
    next(error);
  }
});

netflixRouter.put("/:id", async (req, res, next) => {
  try {
    const movies = await getMovies();

    const index = movies.findIndex((movie) => movie.imdbID === req.params.id);
    if (index !== -1) {
      const oldMovies = movies[index];

      const updateMovies = { ...oldMovies, ...req.body, updatedAt: new Date() };

      movies[index] = updateMovies;

      await writeMovies(movies);
      res.send(updateMovies);
    } else {
      next(NotFound(`movie with id ${req.params.id} not found!`));
    }
  } catch (error) {
    next(error);
  }
});

netflixRouter.delete("/:id", async (req, res, next) => {
  try {
    const movies = await getMovies();

    const remainingMovies = movies.filter(
      (movie) => movie.imdbID !== req.params.id
    );

    if (movies.length !== remainingMovies.length) {
      await writeMovies(remainingMovies);
      res.status(204).send();
    } else {
      next(NotFound(`movie with id ${req.params.id} not found!`));
    }
  } catch (error) {
    next(error);
  }
});

export default netflixRouter;
