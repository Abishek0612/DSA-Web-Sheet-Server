# DSA Web Sheet - Backend

This is the backend for the DSA Web Sheet application, a platform for tracking progress in learning data structures and algorithms.

## Features

- **Authentication:** Secure user authentication using JWT.
- **User Management:** Create, read, update, and delete user profiles and settings.
- **Topic and Problem Management:** Full CRUD functionality for DSA topics and problems.
- **Progress Tracking:** Track user progress on different topics and problems.
- **AI-Powered Assistance:** Generate research on DSA topics, create new problems, and get hints using the Google Gemini API.
- **Real-time Notifications:** Real-time updates on progress and new content using Socket.io.

## Tech Stack

- **Node.js:** JavaScript runtime environment.
- **Express:** Web framework for Node.js.
- **MongoDB:** NoSQL database for storing data.
- **Mongoose:** ODM for MongoDB.
- **JWT:** For secure user authentication.
- **Socket.io:** For real-time communication.
- **Google Gemini API:** For AI-powered features.

## Getting Started

### Prerequisites

- Node.js
- npm
- MongoDB

### Installation

1.  Clone the repository:
    ```bash
    git clone [  https://github.com/Abishek0612/DSA-Web-Sheet-Server.git  ]
    ```
2.  Install the dependencies:
    ```bash
    npm install
    ```
3.  Create a `.env` file in the root directory and add the following environment variables:

            ```env

        NODE_ENV=production

    PORT=5000
    MONGODB_URI=mongodb+srv://uabishek6:abi%40abi12@cluster0.xblmerd.mongodb.net/dsa
    JWT_SECRET=cdmcsdnkidosisdijsdci12122nsaxssa
    JWT_REFRESH_SECRET=dssjkscj213kncxxssceqa
    CLIENT_URL=https://dsa-web-app.netlify.app/login

CLOUDINARY_CLOUD_NAME=dsjgl0cbj
CLOUDINARY_API_KEY=859825451636775
CLOUDINARY_API_SECRET=JDk7hM26QzLpcBe_1KHsxE3sM28

EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=465
EMAIL_USER=uabishek6@gmail.com
EMAIL_PASS=ehnp zfvd hmuu aubs

GEMINI_API_KEY=AIzaSyBprm3ELe41fYwme4N8DKO0RCVdGjwbPyg,AIzaSyCtl1SUEJT7KunzfPS14CodlPAm9iJGxjU,AIzaSyB9PGhhGPmnBlfrSDJ5KwhgHYLwMaMnHfg

### Running the Application

# Seeding the Database

To populate the database with initial sample data (including an admin user, a demo user, and various DSA topics).

npm run seed

```bash
npm start

or
 npm run dev
```
