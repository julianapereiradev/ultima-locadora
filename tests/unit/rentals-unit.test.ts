import rentalsRepository from "repositories/rentals-repository";
import usersRepository from "repositories/users-repository";
import rentalsService, { RENTAL_LIMITATIONS, checkMoviesValidForRental, checkUserAbleToRental, getUserForRental } from "services/rentals-service";
import { faker } from "@faker-js/faker";
import moviesRepository from "repositories/movies-repository";


beforeEach(() => {
  jest.clearAllMocks();
});


describe("Rentals Service Unit Tests", () => {
  it("deveria retornar um erro quando user.id == undefined", () => {
    
    const usersMock = jest.spyOn(usersRepository, "getById").mockImplementation((): any => {
      return undefined;
    });

    const userInfractions = getUserForRental(5747656857876);
    expect(usersMock).toBeCalledTimes(1);
    expect(userInfractions).rejects.toEqual({
      name: "NotFoundError",
      message: "User not found."
    });
  })

  it("deveria retornar um erro quando o usuário já tem uma locação pendente", () => {
    
    const usersMock = jest.spyOn(rentalsRepository, "getRentalsByUserId").mockImplementation((): any => {
      return [{
          id: 1,
          date: Date.now(),
          endDate: Date.now(),
          userId: 1,
          closed: false,
      }];
    });

    const userInfractions = checkUserAbleToRental(1);
    expect(usersMock).toBeCalledTimes(1);
    expect(userInfractions).rejects.toEqual({
      name: "PendentRentalError",
      message: "The user already have a rental!"
    });
  })

  it("deveria retornar um erro quando movieId dá undefined", () => {

    const userMock = {
      id: 1,
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      email: faker.internet.email(),
      cpf: faker.lorem.text(),
      birthDate: new Date()
  }
    
    jest.spyOn(moviesRepository, "getById").mockImplementation((): any => {
      return undefined;
    });

    const userInfractions = checkMoviesValidForRental([5747656857871], userMock);;
    expect(userInfractions).rejects.toEqual({
      name: "NotFoundError",
      message: "Movie not found."
    });
  })

  it("deveria retornar um erro quando movieId.rentalId existir", () => {

    const userMock = {
      id: 1,
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      email: faker.internet.email(),
      cpf: faker.lorem.text(),
      birthDate: new Date()
  }
    
    jest.spyOn(moviesRepository, "getById").mockImplementation((): any => {
      return {
        id: 1,
        name: "Harry Potter",
        adultsOnly: 5,
        rentalId: 1,
    }
    });

    const userInfractions = checkMoviesValidForRental([1], userMock);;
    expect(userInfractions).rejects.toEqual({
      name: "MovieInRentalError",
      message: "Movie already in a rental."
    });
  })

  it("deveria retornar um erro quando filme é para maiores de 18 anos mas o user é menor de 18 anos", () => {

    const userMock = {
      id: 1,
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      email: faker.internet.email(),
      cpf: faker.lorem.text(),
      birthDate: new Date()
  }
    
    jest.spyOn(moviesRepository, "getById").mockImplementation((): any => {
      return {
        id: 1,
        name: "Harry Potter",
        adultsOnly: 21,
    }
    });

    const userInfractions = checkMoviesValidForRental([1], userMock);;
    expect(userInfractions).rejects.toEqual({
      name: "InsufficientAgeError",
      message: "Cannot see that movie."
    });
  })

  it("deveria retornar um erro quando rental.id == undefined (service de getRentalById)", () => {
    
    const usersMock = jest.spyOn(rentalsRepository, "getRentalById").mockImplementation((): any => {
      return undefined;
    });

    const userInfractions = rentalsService.getRentalById(5747656857876);
    expect(usersMock).toBeCalledTimes(1);
    expect(userInfractions).rejects.toEqual({
      name: "NotFoundError",
      message: "Rental not found."
    });
  })

  it("deveria retornar um erro quando rental.id == undefined (service de finishRental)", () => {
    
    const usersMock = jest.spyOn(rentalsRepository, "getRentalById").mockImplementation((): any => {
      return undefined;
    });

    const userInfractions = rentalsService.finishRental(5747656857876);
    expect(usersMock).toBeCalledTimes(1);
    expect(userInfractions).rejects.toEqual({
      name: "NotFoundError",
      message: "Rental not found."
    });
  })

})