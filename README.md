# timer-project

git clone https://github.com/Aditi0128/mytimerapp.git
cd mytimerapp
2. Install dependencies
bash
Copy code
npm install
3. Run locally
bash
Copy code
npm run dev
Now open http://localhost:5173 in your browser.

🛠️ Build for Production
bash
Copy code
npm run build
Builds the app into the /dist folder.



Firebase Hosting:

bash
Copy code
npm install -g firebase-tools
firebase login
firebase init hosting
npm run build
firebase deploy


📂 Project Structure

mytimerapp/
├── public/             # Static files (favicon, etc.)
├── src/
│   ├── App.jsx         # Main app with theme + timers
│   ├── Timer.jsx       # Timer component with controls
│   ├── App.css         # Styling & themes
│   └── main.jsx        # Vite entry
├── bell.mp3            # Local sound file
├── chime.mp3           # Local sound file
├── sparkle.mp3         # Local sound file
├── index.html          # App entry HTML
├── package.json
└── README.md



📦 Dependencies
react, react-dom
vite
flatpickr


