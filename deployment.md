# 🚀 DevOps Chatbot Deployment (Frontend + Docker + Domain)

## 📌 Project Overview

This project is a frontend chatbot application built using Vite + React and integrated with Gemini API.
The goal was to deploy it using Docker on an EC2 instance and expose it via a custom domain without a port.

---

# 🧱 Tech Stack

* Frontend: Vite + React
* Containerization: Docker
* Server: AWS EC2 (Ubuntu)
* Web Server: Nginx (Reverse Proxy)
* Domain: GoDaddy
* API: Gemini API

---

# 🔑 How to Generate Gemini API Key

1. Go to Google AI Studio
2. Sign in with your Google account
3. Click on **"Get API Key"**
4. Click **"Create API Key"**
5. Copy the generated key

⚠️ **Important:**

* Do NOT share your API key publicly
* Do NOT push `.env` to GitHub
* Regenerate key if exposed

---

# 🛠️ Step-by-Step Deployment

## 1️⃣ Run Locally

```bash
npm install
npm run dev
```

Access:

```
http://localhost:3000
```

---

## 2️⃣ Create `.env`

```env
GEMINI_API_KEY="your_api_key_here"
APP_URL="http://localhost:3000"
```

---

## 3️⃣ Dockerize Application

### Dockerfile

```Dockerfile
FROM node:20

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN npm run build

RUN npm install -g serve

EXPOSE 3000

CMD ["serve", "-s", "dist", "-l", "3000"]
```

---

### Build & Run

```bash
docker build -t chatbot .
docker run -d -p 3000:3000 chatbot
```

Access:

```
http://<EC2-IP>:3000
```

---

## 4️⃣ Setup Domain (GoDaddy)

* Add A record:

  * Name: `@`
  * Value: `<EC2 Public IP>`

* Add A record:

  * Name: `www`
  * Value: `<EC2 Public IP>`

---

## 5️⃣ Install & Configure Nginx

```bash
sudo apt install nginx -y
```
sudo nano /etc/nginx/sites-available/default
### Nginx Config

```nginx
server {
    listen 80;
    listen [::]:80;

    server_name siba.magneqdevops.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;

        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;

        proxy_cache_bypass $http_upgrade;
    }
}
```

---

## 6️⃣ Restart Nginx

```bash
sudo nginx -t
sudo systemctl restart nginx
```

---

## 🌐 Final Access

```
http://siba.magneqdevops.com
```

---

# ⚠️ Errors Faced & Solutions

## ❌ Error 1: Node Version Issue

```
Unsupported engine (node >=20 required)
```

### ✅ Solution:

```bash
nvm install 20
nvm use 20
```

---

## ❌ Error 2: Tailwind Native Binding Error

```
Cannot find native binding
```

### ✅ Solution:

```bash
rm -rf node_modules package-lock.json
npm install
```

---

## ❌ Error 3: Nginx Default Page Showing

Cause:

* `try_files` config blocking proxy

### ✅ Solution:

Removed:

```nginx
try_files $uri $uri/ =404;
```

Added:

```nginx
proxy_pass http://localhost:3000;
```

---

## ❌ Error 4: Nginx Syntax Error

```
unexpected "}"
```

### ✅ Solution:

* Removed extra `}`
* Replaced full config with clean version

---

## ❌ Error 5: Port visible in URL

```
http://domain.com:3000
```

### ✅ Solution:

* Configured Nginx reverse proxy
* Exposed app via port 80

---

# 🔐 Security Notes

* Never expose API keys publicly
* Use `.env` file
* Do not commit `.env` to GitHub

---

# 🎯 Final Architecture

```
User → Domain → Nginx → Docker Container → App
```

---

# 🚀 Future Improvements

* Add HTTPS (Certbot)
* CI/CD pipeline
* Backend for API security
* Kubernetes deployment

---

# 👨‍💻 Author

DevOps Deployment Practice Project

