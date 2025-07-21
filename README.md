## Project info

# 📊 Data Visualization Dashboard (WebSocket + React + Service Worker)

A real-time data streaming dashboard built with **React**, **TypeScript**, **WebSockets**, and **Service Workers**. It simulates and streams `11,000` time-series data points, each with 8
dynamic `e[]` values over time `t`, and visualizes them as 8 separate lines on a graph.

## 🚀 Features

- Real-time WebSocket simulation server
- Displays 8 dynamic time-series lines using `e[]` values
- Streams 11,000 data points spaced over time
- `startSimulation` and `stopSimulation` control buttons
- Service Worker receives every new point
- Fully interactive and responsive frontend

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <GIT_URL>

# Step 2: Navigate to the project directory.
cd <PROJECT_NAME>

# Step 3: Install the necessary dependencies.
# execute following command in root folder, client and server folder also.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
#execute following command in root folder only.
npm run start

```

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS
- Node.js
