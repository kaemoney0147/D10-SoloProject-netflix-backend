import { fileURLToPath } from "url";
import { dirname, join } from "path";
import fs from "fs-extra";

const { readJSON, writeJSON, writeFile } = fs;
const publicFolderPath = join(process.cwd(), "./public/img/netflix");
const dataFolderPath = join(dirname(fileURLToPath(import.meta.url)), "../data");

const netflixJSONPath = join(dataFolderPath, "netflix.json");
export const getMovies = () => readJSON(netflixJSONPath);
export const writeMovies = (movieArray) =>
  writeJSON(netflixJSONPath, movieArray);
