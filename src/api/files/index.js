import express from "express";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { getPDFReadableStream } from "../../lib/pdf-tools.js";
import { pipeline } from "stream";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import { getMovies, writeMovies } from "../../lib/fs-tools.js";

const filesRouter = express.Router();

const cloudinaryUploader = multer({
  storage: new CloudinaryStorage({
    cloudinary, // cloudinary is going to search in .env vars for smt called process.env.CLOUDINARY_URL
    params: {
      folder: "fs0422/netflix",
    },
  }),
}).single("poster");

filesRouter.post("/:id/poster", cloudinaryUploader, async (req, res, next) => {
  try {
    const url = req.file.path;

    const movies = await getMovies();
    console.log("list of moives", movies);

    const index = movies.findIndex((movie) => movie.imdbID === req.params.id); // 1. Find user (by userID)
    if (index !== -1) {
      const oldMoives = movies[index];

      const updatedMovie = { ...oldMoives, poster: url, updatedAt: new Date() };

      movies[index] = updatedMovie;

      await writeMovies(movies);
    }

    // In FE <img src="http://localhost:3001/img/users/magic.gif" />

    res.send("MoviePicture uploaded");
  } catch (error) {
    next(error);
  }
});

filesRouter.get("/:id/pdf", async (req, res, next) => {
  res.setHeader("Content-Disposition", "attachment; filename=moive.pdf");

  const { id } = req.params;
  const movies = await getMovies();

  const selectedMovies = movies.find((movie) => movie.imdbID === id);
  console.log("selectedPost", selectedMovies);
  if (selectedMovies !== null) {
    res.setHeader("Content-Disposition", "attachment; blog.pdf");
    const source = getPDFReadableStream(selectedMovies);
    // console.log("source", source);
    const destination = res;

    pipeline(source, destination, (err) => {
      if (err) console.log(err);
    });
  } else {
    console.log(`There is no movie with this id: ${id}`);
  }
});

export default filesRouter;
