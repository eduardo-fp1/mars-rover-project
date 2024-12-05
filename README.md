# Mars-rover

## Running the application locally.

1. Download the repository:
	
- First, do the download the zip repository and do the unzip.
- Navigate to the directory

	```sh
	cd mars-rover-project-main
	```

2. Build and run the project with Docker:

- Make sure Docker is installed and running on your machine.

- In the project directory, run:

	```sh
	docker-compose up --build
	```

- This will build the images and start the containers for your project.

- The backend will be accessible at http://localhost:3000, and the frontend will be accessible at http://localhost:8080.

3. Stop the project:

- To stop the project, press Ctrl + C and then run:

	```sh
	docker-compose down
	```

## Technologies Used

- None.js
- VueJS

## Automated tests with Jest

1. Runing the tests

- Navigate to the directory

	```sh
	cd backend
	``` 

- Run command

	```sh
	npm test
	```