# AE³GIS Frontend

**Agile Emulated Educational Environment for Guided Industrial Security Training**

A web-based platform for cybersecurity education in Industrial Control Systems (ICS) and IT/OT network environments. This frontend integrates with GNS3 for hands-on network simulation labs.

![Next.js](https://img.shields.io/badge/Next.js-15.5-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0-38B2AC?logo=tailwind-css)

---

## Features

- **Topology Builder** – Design network infrastructures with IT, DMZ, OT, and Field layers
- **Scenario Editor** – Create notebook-style lab exercises with markdown and executable scripts
- **Script Library** – Manage and deploy reusable scripts to network nodes
- **Student Logging** – Capture and submit command history for grading
- **AI Analysis** – OpenAI-powered log analysis for instructors

---

## Prerequisites

Before running the frontend, ensure you have:

- **Node.js 18+** installed
- **GNS3 VM** running with Docker templates loaded
- **AE³GIS Backend API** running ([ae3gis-gns3-api](https://github.com/TollanBerhanu/ae3gis-gns3-api))

---

## Installation

### 1. Clone the repository

```bash
git clone https://github.com/TollanBerhanu/ae3gis-frontend.git
cd ae3gis-frontend
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env.local` file in the project root:

```env
# GNS3 Server Configuration
GNS3_URL=http://<GNS3_IP>:<PORT>/v2
NEXT_PUBLIC_GNS3_IP=<GNS3_IP>

# Backend API Configuration
AE3GIS_URL=http://<BACKEND_IP>:<PORT>
```

**Example:**

```env
GNS3_URL=http://192.168.56.101:80/v2
NEXT_PUBLIC_GNS3_IP=192.168.56.101
AE3GIS_URL=http://localhost:8000
```

---

## Running the Application

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production

```bash
npm run build
npm start
```

---

## User Roles

| Role | Access | Description |
|------|--------|-------------|
| **Instructor** | `/instructor/*` | Create topologies, scenarios, manage scripts, review submissions |
| **Student** | `/student/*` | Execute labs, run scripts, submit work for grading |

---

## Project Structure

```
src/
├── app/
│   ├── api/            # Next.js API routes (proxy to backend)
│   ├── components/     # Reusable UI components
│   ├── contexts/       # React Context providers
│   ├── hooks/          # Custom React hooks
│   ├── instructor/     # Instructor pages
│   ├── student/        # Student pages
│   └── types/          # TypeScript type definitions
```

---

## Related Projects

- **Backend API**: [ae3gis-gns3-api](https://github.com/TollanBerhanu/ae3gis-gns3-api) – FastAPI backend for GNS3 integration

---

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
