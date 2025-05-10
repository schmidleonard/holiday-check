# holiday-check

A slim monorepo project with multiple Node.js microservices and MongoDB integration.

---

## Requirements

- **Node.js** (Download: [nodejs.org](https://nodejs.org/))
- **MongoDB** (either local or cloud, e.g. [MongoDB Atlas](https://www.mongodb.com/cloud/atlas))

---

## Installation

1. **Clone the repository:**  
   ```
   git clone 
   cd holiday-check
   ```

2. **Install dependencies (in the root directory):**  
   ```
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
   cd services//src
   ```

2. Start the service:  
   ```
   nodemon .js
   ```
   *(Alternatively: `node .js`)*

---

**Note:**  
Each microservice runs separately. Use multiple terminals to run several services in parallel during development.

---

*For questions or adjustments, just reach out!*
