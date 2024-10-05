# CampMate

CampMate is a full-stack web application where users can create, review, and manage campgrounds. This project allows users to browse all campgrounds and read reviews without signing up. However, in order to review or create a campground, users need to create an account and log in.

The project is built using Node.js, Express, MongoDB, and Bootstrap. Authentication and user management are handled using Passport.js.

## Functionalities

- **View Camps and Reviews**: All users (including non-registered users) can view the list of campgrounds and read the reviews.
- **Authentication**: Users can sign up and log in using their credentials.
- **Create/Edit/Delete Campgrounds**: Logged-in users can create their own campgrounds. They can also edit or delete only the campgrounds that they have created.
- **Leave Reviews**: Logged-in users can leave reviews for campgrounds, edit or delete their own reviews.
- **Persistent Data**: All campground and user information is stored persistently in the MongoDB database hosted on a cloud provider.

## Technologies Used

### Front-End
- **HTML5**: For the structure and content of the website.
- **CSS3**: For styling and layout of web pages.
- **Bootstrap**: A popular front-end framework used for responsive design.
- **JavaScript (jQuery)**: For dynamic content and DOM manipulation.

### Back-End
- **Node.js**: JavaScript runtime used for building the server-side functionality.
- **Express.js**: Framework for building web applications and APIs.
- **MongoDB**: NoSQL database used for storing campground, user, and review data.
- **Passport.js**: Middleware for user authentication and authorization.

### API & Other Technologies
- **REST**: Representational State Transfer architecture used for building APIs.
- **Mapbox API**: Provides interactive maps to display campground locations.
- **Cloudinary**: Cloud-based image storage service for storing campground images.
- **AWS**: Used to host MongoDB on Amazon EC2 instances (optional for cloud-based deployment).

## Project Structure

- **Views**: All user interfaces (e.g., campground listings, forms) are rendered using EJS templates.
- **Routes**: The app uses RESTful routes for CRUD operations on campgrounds and reviews.
- **Controllers**: Logic for handling requests and performing database operations is organized into controllers.
- **Models**: MongoDB models are used to define the structure of campground, user, and review data.
