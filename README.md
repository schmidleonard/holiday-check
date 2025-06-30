# Holiday-Check 🌴
**Holiday-Check** is a microservice designed as part of the Distributed Systems course at DHBW Heilbronn. It provides information about available **hotels**, **flights**, and **rental cars**.

---
## 🧩 Module Overview

```bash
holiday-check/
│
├── 🖥️ frontend/               # Web interface
│
├── 🧩 services/               # Microservices backend
│   ├── 🌐 gateway/            # API Gateway – routes all incoming requests
│   │                         # to the appropriate microservice
│   │
│   ├── 🔐 user/               # User service – handles registration, login,
│   │                         # and authentication logic
│   │
│   ├── 🚗 cars/               # Car rental service – manages rental cars
│   │                         # and availability
│   │
│   ├── 🛫 flights/            # Flight service – manages flights, times, and routes
│   │
│   ├── 🏨 hotels/             # Hotel service – handles hotel data and availability
│   │
│   └── ⭐ ratings/            # Ratings service – handles reviews and star ratings
│
└── 📄 README.md               # Project documentation

```
---

## Requirements

- **Node.js** (Download: [nodejs.org](https://nodejs.org/))
- **MongoDB** (either local or cloud, e.g. [MongoDB Atlas](https://www.mongodb.com/cloud/atlas))

---

## Installation

1. **Clone the repository:**  
   ```
   git clone https://github.com/schmidleonard/holiday-check.git
   cd holiday-check
   ```

2. **Install dependencies: (for each service)**  
   ```
   cd "service"
   npm install
   ```

3. **For each service:**  
   - Rename the `.env.template` file to `.env`
   - Enter your environment variable values  
   *(Note: Each service has its own `.env` file!)*

---

## Starting a Service

1. Navigate to the service directory:  
   ```
   cd services/src
   ```

2. Start the service:  
   ```
   nodemon .js
   ```
   *(Alternatively: `node .js`)*

---

**Note:**  
Each microservice runs separately. Use multiple terminals to run several services in parallel during development.

The Hotel (🏨 hotels/) and Car (🚗 cars/) services support image uploads, such as hotel photos and car pictures. These images are currently stored locally on the server's file system.

    ⚠️ Important:
    When deploying these services to a remote environment or containerized infrastructure (e.g. Docker, Railway, or cloud servers), make sure to:

        Mount a persistent volume or bind a host directory for image storage

        Or update the service logic to use a cloud storage provider (e.g. AWS S3, Cloudinary, etc.)

Failing to configure image storage properly can result in lost files or broken image links after restarts or deployments.

---


## 📝 Credits

-   **Authors:** Richard Gietzelt; Leonard Schmid – DHBW Heilbronn (Distributed Systems course)
    
