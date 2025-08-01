# Flashcard Study Application

This is a full-stack flashcard application built with a Node.js/Express backend and a vanilla JavaScript frontend.

## Prerequisites

*   [Node.js](https://nodejs.org/) (v16 or later recommended)
*   [MongoDB](https://www.mongodb.com/try/download/community) (a local instance or a cloud-hosted instance like MongoDB Atlas)

## Backend Setup

1.  **Navigate to the server directory:**
    ```bash
    cd server
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Create a `.env` file:**
    Create a file named `.env` in the `server` directory and add the following environment variables:

    ```
    MONGO_URI=<your_mongodb_connection_string>
    JWT_SECRET=<your_jwt_secret>
    PORT=5000
    ```

    *   `MONGO_URI`: Your MongoDB connection string. For a local instance, this is typically `mongodb://localhost:27017/flashcards`.
    *   `JWT_SECRET`: A long, random, and secret string used for signing authentication tokens. You can generate one online or with a password manager.
    *   `PORT`: The port on which the backend server will run. Defaults to 5000.

4.  **Run the backend server:**
    ```bash
    npm start
    ```
    The server will be running at `http://localhost:5000`.

## Frontend Setup

1.  **Navigate to the client directory (from the root):**
    ```bash
    cd client
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Run the frontend development server:**
    ```bash
    npm run dev
    ```
    The frontend will be accessible at `http://localhost:5173` (or another port if 5173 is busy).

## Testing the Application

To test the application, you need to create a user account.

1.  **Open the application in your browser** (e.g., `http://localhost:5173`).
2.  **Click on the "Register" button.**
3.  **Fill out the registration form** with a name, email, and password of your choice.
4.  **Click "Register".**
5.  You will be redirected to the login page. **Log in with the credentials you just created.**

You can now use the application as an authenticated user.
