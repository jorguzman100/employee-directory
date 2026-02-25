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
    src="./public/employee-directory.webp"
    alt="Employee Atlas directory dashboard with table and map"
    width="760"
    style="border-radius: 12px; box-shadow: 0 10px 28px rgba(16, 24, 40, 0.18); object-position: top;"
  />
</p>

---

## 🛠️ Tech Stack

![React](https://img.shields.io/badge/React-20232A?style=flat-square&logo=react&logoColor=61DAFB)
![Axios](https://img.shields.io/badge/Axios-5A29E4?style=flat-square&logo=axios&logoColor=white)
![Google Maps](https://img.shields.io/badge/Google%20Maps-4285F4?style=flat-square&logo=googlemaps&logoColor=white)
![Bootstrap](https://img.shields.io/badge/Bootstrap-7952B3?style=flat-square&logo=bootstrap&logoColor=white)
![Random User API](https://img.shields.io/badge/RandomUser%20API-External%20Data-2D3748?style=flat-square)

---

## 🧩 Project Snapshot

- Frontend-only React app (CRA) with component-based UI for header, search, map, table, and footer.
- Employee data is fetched from `randomuser.me` using Axios (`src/utils/API.js`).
- Google Maps + Places autocomplete powers location search, employee markers, and map panning.
- Table visibility tracking syncs the map with the rows currently in view (after search/sort/scroll).
- Deployment scripts (`build`, `gh-pages`) are already configured for later publishing.

---

## 🚀 Live Demo

![Deployment](https://img.shields.io/badge/Deployment-Not%20deployed%20yet-lightgrey?style=for-the-badge)
[![GitHub](https://img.shields.io/badge/GitHub-Repo-181717?style=for-the-badge&logo=github)](https://github.com/jorguzman100/employee-directory)

No public deployment yet. The project is set up to run locally now and is prepared for deployment later.

---

## 💻 Run it locally

```bash
git clone https://github.com/jorguzman100/employee-directory.git
cd employee-directory
npm install
cp .env_example .env
npm start
```

Optional production build check:

```bash
npm run build
```

Local URL:

- App: `http://localhost:3000`

<details>
<summary>🔑 Required environment variables</summary>

```env
# .env
REACT_APP_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
```

Google Maps note: enable both the **Maps JavaScript API** and **Places API** for the key.
</details>

---

## 🤝 Contributors

- **Jorge Guzman**  ·  [@jorguzman100](https://github.com/jorguzman100)

