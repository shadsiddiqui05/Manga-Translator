# 🎌 Neuro Manga Translator

> **Automated Translation System**
> A distributed full-stack system that leverages Deep Learning to automate the translation and typesetting of manga and graphic novels.

![Project Status](https://img.shields.io/badge/Status-Active-success)
![Docker](https://img.shields.io/badge/Docker-Enabled-blue?logo=docker)
![Stack](https://img.shields.io/badge/Tech-React%20%7C%20FastAPI%20%7C%20PyTorch-orange)
![License](https://img.shields.io/badge/License-MIT-green)

## 📖 Executive Summary

The **Manga Translator Platform** is an automated pipeline designed to break down linguistic barriers in graphic media. Traditional machine translation often fails with vertical text and context-specific onomatopoeia found in Japanese Manga.

This project implements a hybrid architecture:
1.  **AI Engine:** A Python-based service utilizing **MangaOCR** and **EasyOCR** for precise character recognition and context-aware translation.
2.  **Frontend:** A responsive **React.js** interface for uploading panels and viewing side-by-side translations.
3.  **Deployment:** Fully containerized using **Docker** to ensure consistent performance across any computing environment.

---

## 🚀 Key Features

* **🕵️‍♂️ Smart Text Detection:** Utilizes computer vision (OpenCV) to automatically detect and crop text bubbles.
* **🧠 Context-Aware OCR:** Specialized model (MangaOCR) trained to recognize vertical Japanese text and stylized fonts.
* **⚡ Real-Time Processing:** Asynchronous architecture allows for fast upload-to-translation workflows.
* **🐳 Containerized Deployment:** "Write Once, Run Anywhere" capability using Docker and Docker Compose.
* **🌙 Modern UI:** Dark-themed, accessible user interface built with React.

---

## 🛠️ Technology Stack

| Domain | Technologies Used |
| :--- | :--- |
| **Frontend** | React.js, CSS Modules, Axios |
| **Backend** | Python 3.9, FastAPI, Uvicorn |
| **Deep Learning** | PyTorch, MangaOCR, EasyOCR, Transformers |
| **Image Processing** | OpenCV, Pillow (PIL) |
| **DevOps** | Docker, Docker Compose, Git |

---

## ⚙️ Installation & Setup

You can run this project locally in minutes using Docker.

### Prerequisites
* [Docker Desktop](https://www.docker.com/products/docker-desktop/) (Installed & Running)
* Git

### Step 1: Clone the Repository
```bash
git clone [https://github.com/shadsiddiqui05/Manga-Translator.git](https://github.com/shadsiddiqui05/Manga-Translator.git)
cd Manga-Translator
```
### Step 2: Launch the System

Run the orchestration command to build the containers and download AI models:
```bash
docker-compose up --build
```
**☕ Note:** The first run may take 5-10 minutes as it downloads necessary PyTorch models and system dependencies.

### Step 3: Access the Platform

**User Interface:** Open http://localhost:3000
**API Documentation:** Open http://localhost:8000/docs (Swagger UI)

---

## 📂 Project Architecture

The system follows a microservices-style structure managed by Docker Compose:
```bash
Manga-Translator/
├── docker-compose.yml       # Orchestrator (Manages Network & Volumes)
├── ai_service/              # 🐍 Python Backend Container
│   ├── app.py               # API Gateway (FastAPI)
│   ├── pipeline.py          # AI Logic (OCR + Translate)
│   ├── Dockerfile           # Backend Environment Config
│   └── requirements.txt     # AI Dependencies
│
└── ai_service/client/       # ⚛️ React Frontend Container
    ├── src/                 # UI Components
    ├── public/              # Static Assets
    └── Dockerfile           # Frontend Environment Config
```

---

## 📝 Author

**Shad Siddiqui**
* **GitHub:** [@shadsiddiqui05](https://github.com/shadsiddiqui05)
