# Library Management System

This Library Management System is a web application designed to manage book issue and returns in a library. It uses a React frontend and a Node.js backend, with JWT for authentication,Chakra UI for styling and Multer for images upload.
## Features
- **Authentication**:
Secure login and registration using JWT.
- **Book Management**: Admin can add, edit, and delete books.
- **Issue Books**: Admin can issue books to students, and the details are saved in the database and new student will register.
- **Student Login**: students can login with their email that they give while issuing book and the password will be their name+123
- **Return Books**: Admin can return books using a modal that requires a secret key.
- **Book Holders**: View all the students who have issued books, along with their details.
  
### Installation

1. **Clone the repository**:
    ```sh
    git clone https://github.com/farhanex/lms-backend.git
    ```

2. **Install backend dependencies**:
    ```sh
    cd lms-backend
    npm install
    ```
    ### Running the Application

1. **Start  backend server**:
    ```sh
    cd lms-backend
    npm start
    ```
