<h1 align="center">
  <img href="https://youtu.be/P-I77T8SokE"><img src="/src/epboticon.png" alt="ep bot logo" width="250"></img>
  </br>
  Education Perfected
</h1>
<h4 align="center">A powerful tool to automatically complete Education Perfect tasks – save time and focus on real learning.</h4>
<p align="center">
  <img src="https://img.shields.io/github/last-commit/Nardo021/EducationPerfected?logo=GitHub">
  <img src="https://img.shields.io/npm/v/puppeteer?label=puppeteer">
  <img src="https://img.shields.io/github/downloads/Nardo021/EducationPerfected/total?color=0logo=GitHub">
  <img src="https://img.shields.io/github/license/Nardo021/EducationPerfected">
</p>


<p align="center">
  <a href="#getting-started">getting started</a> •
  <a href="#documentation">documentation</a> •
  <a href="#installation-guide">installation guide</a> •
  <a href="#expected-behavior">expected behavior</a> •
  <a href="#hotkeys">hotkeys</a>
</p>

---

## 📦 getting started

EducationPerfect Bot is a cross-platform desktop app that uses Puppeteer and Electron to automate question answering in Education Perfect list tasks.

> ⚠️ This tool is for **educational research and testing** purposes only. Do not use it to violate academic integrity or school policies.

### ✅ Features

- Fully automated answer generation and submission
- Works on most EP list activities
- Easy to run: just download and open!
- Cross-platform: Windows, macOS, Linux
- No need to install browser extensions

---

## 📚 documentation

```bash
EducationPerfected/
├── main.js                 # Electron main process
├── preload.js              # Bridge between renderer and EP site
├── renderer/               # GUI frontend (HTML/CSS/JS)
├── auto-answer/            # Question answering logic (DOM scripts)
├── package.json
└── README.md
```

---

## 💻 installation guide

### Option 1: Run Prebuilt App (Recommended)

1. Go to [Releases](https://github.com/keyp0s/epbot/releases)
2. Download the latest version for your OS (`.exe`, `.dmg`, `.AppImage`)
3. Run it – no setup required

### Option 2: Build from Source

```bash
git clone https://github.com/keyp0s/epbot.git
cd epbot
npm install
npm start
```

### Option 3: Package as Executable

```bash
npm run build  # Uses electron-builder to generate .exe / .app / .AppImage
```

---

## 🧠 expected behavior

- The app will launch a browser window and auto-navigate to [educationperfect.com](https://www.educationperfect.com/).
- Once logged in, it will begin answering list tasks automatically.
- GUI allows you to pause/resume, change speed, and view logs.

---

## ⌨️ hotkeys

| Key        | Function            |
|------------|---------------------|
| `Ctrl + Shift + P` | Pause/Resume auto answering |
| `Ctrl + Shift + S` | Skip current question       |
| `Ctrl + Shift + L` | Open log panel              |

---

## 📜 disclaimer

This project is intended for **learning, testing, and automation research only**.  
The author is **not responsible** for any misuse or policy violations.

---

## 📄 license

MIT License © 2025 [your name or GitHub username]

---

## 🤝 contributing

Pull requests and feedback are welcome! Open an issue or PR to improve the project.
