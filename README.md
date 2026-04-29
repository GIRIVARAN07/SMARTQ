# 🚀 SmartQ - Smart Queue Management System

SmartQ is a premium, multi-tenant SaaS application designed to streamline queue management for hospitals, banks, colleges, and government offices. It features real-time updates, analytics, and a seamless user experience.

## ✨ Features
- **Real-time Queue Status**: Live updates using Socket.io.
- **Multi-tenant Architecture**: Separate dashboards for Admins and Users.
- **Smart Token Booking**: Automated token generation with estimated wait times.
- **Advanced Analytics**: Visual insights for admins to monitor queue performance.
- **Premium UI/UX**: Built with React, Tailwind CSS, and Lucide icons.

## 🛠️ Technology Stack
- **Frontend**: React.js, Vite, Tailwind CSS, Recharts, Socket.io-client.
- **Backend**: Node.js, Express.js, MongoDB (Mongoose), Socket.io.
- **Authentication**: JWT (JSON Web Tokens).

## 🚀 Deployment Guide (Render)

To deploy this application on [Render](https://render.com):

1. **Create a New Web Service** and connect this GitHub repository.
2. **Settings**:
   - **Build Command**: `npm run install-all && npm run build`
   - **Start Command**: `npm start`
3. **Environment Variables**:
   - `NODE_ENV`: `production`
   - `MONGODB_URI`: *Your MongoDB Atlas connection string*
   - `JWT_SECRET`: *A secure random string*
   - `PORT`: `5000`

## 💻 Local Development

1. **Install Dependencies**:
   ```bash
   npm run install-all
   ```

2. **Configure Environment**:
   Create a `server/.env` file based on `server/.env.example`.

3. **Run the App**:
   ```bash
   npm run dev
   ```

---
Built with ❤️ by [GIRIVARAN07](https://github.com/GIRIVARAN07)
