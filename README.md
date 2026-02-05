# 🚀 Hey Buddy - Real-Time Productivity Partner Finder

**Hey Buddy** is a full-stack web application designed to help people find accountability partners instantly. Users can register, choose a goal category (e.g., Python, Fitness, DSA), and get matched in real-time with another user looking for the same thing.

🔴 **Live Demo:** hey-buddy-fullstack.vercel.app

## ✨ Features
- **Real-Time Matching:** Instant pairing using Socket.io.
- **Live Chat/Status:** Users are notified immediately when a match is found.
- **User Authentication:** Secure login and registration using JWT.
- **Responsive Design:** Works on mobile and desktop.

## 🛠️ Tech Stack
- **Frontend:** React + Vite, Tailwind CSS
- **Backend:** Node.js, Express.js
- **Database:** MongoDB Atlas
- **Real-Time:** Socket.io
- **Deployment:** Render



## 💿 Installation & Run Locally

1. Clone the repository:
   ```bash
   git clone [https://github.com/Shivani2173/hey-buddy-fullstack.git](https://github.com/Shivani2173/hey-buddy-fullstack.git)
2.Install dependencies (Root, Frontend, and Backend):
   npm install
    cd frontend && npm install
    cd ../backend && npm install
3. Create a .env file in the backend folder and add:
    MONGO_URI=your_mongodb_connection_string
    JWT_SECRET=your_secret_key
    PORT=5000
4.Run the app:
  # From the root folder
npm run dev
