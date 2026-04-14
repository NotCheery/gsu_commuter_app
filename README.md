# GSU Commuter App

## Table of Contents

- [Project Overview](#project-overview)
- [Features](#features)
- [Getting Started](#getting-started)
- [Deployment](#deployment)
- [Contributors](#contributors)
- [Future Implementation](#future-implementation)
- [Learn More](#learn-more)

## Project Overview

A web application for GSU students and faculty to help them with their daily commute. It provides real-time information about MARTA bus and train schedules, as well as information about parking availability on campus.

## Features

| Feature                      | Description                                                                                              |
| ---------------------------- | -------------------------------------------------------------------------------------------------------- |
| **Mapping**                  | Interactive map to display routing and stops. locations.                               |
| **Bus Stops Near Campus**         | Displays nearby bus stops on campus                              |
| **Bus Arrival Times**        | Provides estimated arrival times for buses at specific stops.                                            |
| **Real-time Train Tracking** | Shows the real-time location of MARTA trains.                                                            |
| **Train Arrival Times**      | Provides real-time arrival information for trains at various stations.                                   |
| **Campus Parking**           | Information about parking availability on the GSU campus.                       |

## Getting Started

To get a local copy up and running follow these simple steps.

### Prerequisites

This project uses Node.js and npm. Make sure you have them installed.

* npm
  ```sh
  npm install npm@latest -g
  ```

### Installation

1. Clone the repo
   ```sh
   git clone https://github.com/your_username_/Project-Name.git
   ```
2. Install NPM packages
   ```sh
   npm install
   ```

### Running the application

First, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

### Dependencies

All the dependencies are listed in the `package.json` file. To install the dependencies, run the following commands:

**For Windows, macOS, and Linux:**
```sh
npm install axios
npm install gtfs-realtime-bindings
npm install leaflet
npm install next
npm install react
npm install react-dom
npm install react-leaflet
```

## Deployment

This application is deployed on Vercel. You can view the live application at [gsu-commuter-app-mb6g-2eblp2zhi-notcheerys-projects.vercel.app](gsu-commuter-app-mb6g-2eblp2zhi-notcheerys-projects.vercel.app)

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://next.js.org/docs/app/building-your-application/deploying) for more details.

## Contributors

- [Tahia Islam](https://github.com/NotCheery)
- [Seoyoung Park](https://github.com/seoyoung161)
- [Mirtha Guereca](https://github.com/MGuerecaRoc)
- [Neha Kushnapali](https://github.com/nehakushnapalli)

## Future Implementation

- **Dynamic Location Data:** Currently, nearby bus and station data is hardcoded. Future work will involve implementing dynamic geolocation to find the closest stops and stations for the user.
- **Enhanced Alerts:** We are using real-time MARTA train arrival data. In the future, we can integrate alerts for delays, service changes, and elevator outages to provide more comprehensive information to users.
- **Advanced Routing:** While we show routing and travel times, we can scale this by integrating with Google Maps for more advanced routing options and turn-by-turn directions.
- **User Authentication:** Implement user authentication to allow for personalized experiences, such as saving preferred routes or favorite stops.
- **GSU Shuttle Integration:** Integrate real-time data for the GSU Panther Express shuttle service.
- **Push Notifications:** Add push notifications for real-time alerts about delays and other important updates.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

