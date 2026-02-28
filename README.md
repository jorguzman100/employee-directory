# 🗺️ Employee Atlas

### A visual employee directory that makes searching your team a bit more interesting 😉.

Employee Atlas is a React app that pulls employee data from Random User and turns it into a searchable, sortable directory with a live Google Map view. It is built for quick lookup workflows: scan the table, filter results, click a row, and instantly see where that person is located.

---

## ✨ Features

| | Feature | What It Does |
|---|---|---|
| 🔎 | Smart search | Filters employees by name, email, DOB, address, city, and phone in real time. |
| ↕️ | Sort controls | Sorts the directory by employee name or city with one click. |
| 🗺️ | Live map sync | Keeps the map focused on the employees currently visible in the table. |
| 📍 | Location tools | Includes geolocation and Places autocomplete to jump around the map quickly. |
| 🎯 | Row selection focus | Clicking a table row highlights it and centers the map on that employee. |
| 🌗 | Theme toggle | Light/dark theme switch with localStorage persistence. |

---

<p align="center">
  <img
    src="./client/public/employee-directory.webp"
    alt="Employee Atlas directory dashboard with table and map"
    width="760"
    style="border-radius: 12px; box-shadow: 0 10px 28px rgba(16, 24, 40, 0.18); object-position: top;"
  />
</p>

---

## 🛠️ Tech Stack

![React](https://img.shields.io/badge/React-20232A?style=flat-square&logo=react&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat-square&logo=vite&logoColor=white)
![Express](https://img.shields.io/badge/Express-111827?style=flat-square&logo=express&logoColor=white)
![Google Maps](https://img.shields.io/badge/Google%20Maps-4285F4?style=flat-square&logo=googlemaps&logoColor=white)
![Bootstrap](https://img.shields.io/badge/Bootstrap-7952B3?style=flat-square&logo=bootstrap&logoColor=white)
![Random User API](https://img.shields.io/badge/RandomUser%20API-External%20Data-2D3748?style=flat-square)

---

## 🧩 Project Snapshot

- Modern React + Vite frontend with component-based UI for header, search, map, table, and footer.
- Node/Express server proxies employee requests through `/api/employees` to avoid production CORS issues.
- Data source order is `randomuser.me` first, then local mock fallback when Random User is unavailable.
- Google Maps JavaScript API (weekly channel) powers geocoding, markers, and autocomplete suggestions.
- Table visibility tracking syncs the map with the rows currently in view (after search/sort/scroll).
- Render deployment is configured as a Node web service (`render.yaml`) serving API + frontend build.

Project layout:
- `client/`: React + Vite app (`src`, `public`, `index.html`, Vite config).
- `server/`: Express API and production static serving.

---

## 🚀 Live Demo

<p align="center">
  <a href="https://employee-directory-7hk1.onrender.com/" target="_blank" rel="noopener noreferrer">
    <img src="https://img.shields.io/badge/Live%20Demo-Employee%20Atlas-22c55e?style=for-the-badge&logo=render&logoColor=white" alt="Live Demo - Employee Atlas" />
  </a>
</p>

<p align="center">
  <a href="https://employee-directory-7hk1.onrender.com/"><strong>https://employee-directory-7hk1.onrender.com/</strong></a>
</p>

---

## 💻 Run it locally

```bash
git clone https://github.com/jorguzman100/employee-directory.git
cd employee-directory
npm install
cp .env_example .env
npm run dev
```

Optional production build check:

```bash
npm run build
```

Local URL:

- Frontend (Vite): `http://localhost:5173`
- Backend (Express): `http://localhost:4000`

<details>
<summary>🔑 Required environment variables</summary>

```env
# .env
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
```

Google Maps note: enable both the **Maps JavaScript API** and **Places API** for the key.
</details>

---

## 🤝 Contributors

- **Jorge Guzman**  ·  [@jorguzman100](https://github.com/jorguzman100)
