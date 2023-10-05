import { User } from "@prisma/client";

import { notFoundError } from "../errors/notfound-error";
import { RentalInput } from "../protocols";
import { movieAlreadyInRental } from "../errors/movie-inretal-error";
import { insufficientAgeError } from "../errors/insufficientage-error";
import usersRepository from "../repositories/users-repository";
import rentalsRepository from "../repositories/rentals-repository";
import moviesRepository from "../repositories/movies-repository";
import { pendentRentalError } from "../errors/pendent-rental-error";

export const RENTAL_LIMITATIONS = {
  MIN: 1,
  MAX: 4,
  ADULTS_REQUIRED_AGE: 18,
  RENTAL_DAYS_LIMIT: 3
}

async function getRentals() {
  const rentals = await rentalsRepository.getRentals();
  return rentals;
}

async function getRentalById(rentalId: number) {
  const rental = await rentalsRepository.getRentalById(rentalId);
  if (!rental) throw notFoundError("Rental not found."); //ok!

  return rental;
}


async function createRental(rentalInput: RentalInput) {
  const { userId, moviesId } = rentalInput;

  const user = await getUserForRental(userId); //ok!
  await checkUserAbleToRental(userId); //ok!
  await checkMoviesValidForRental(moviesId, user); //ok!

  const rental = await rentalsRepository.createRental(rentalInput);
  return rental;
}


async function finishRental(rentalId: number) {
  const rental = await rentalsRepository.getRentalById(rentalId);
  if (!rental) throw notFoundError("Rental not found."); //ok!

  await rentalsRepository.finishRental(rentalId);
}


//Funcoes que foram usadas antes de fazer o post/get/update

export async function getUserForRental(userId: number) { //ok!
  const user = await usersRepository.getById(userId);
  if (!user) throw notFoundError("User not found.");

  return user;
}

export async function checkUserAbleToRental(userId: number) { //ok!
  const rentals = await rentalsRepository.getRentalsByUserId(userId, false);
  if (rentals.length > 0) throw pendentRentalError("The user already have a rental!");
}

export async function checkMoviesValidForRental(moviesId: number[], user: User) {
  for (let i = 0; i < moviesId.length; i++) {
    const movieId = moviesId[i];
    const movie = await moviesRepository.getById(movieId); 

    if (!movie) throw notFoundError("Movie not found."); //ok!
    if (movie.rentalId) {
      throw movieAlreadyInRental("Movie already in a rental."); //ok!
    }

    if (movie.adultsOnly && userIsUnderAge(user)) {
      throw insufficientAgeError("Cannot see that movie."); //ok!
    }
  }
}

function userIsUnderAge(user: User) {
  const age = new Date().getFullYear() - new Date(user.birthDate).getFullYear();
  return age < RENTAL_LIMITATIONS.ADULTS_REQUIRED_AGE;
}

export default {
  getRentals,
  getRentalById,
  createRental,
  finishRental
};