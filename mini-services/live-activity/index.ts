import { createServer } from "http";
import { Server } from "socket.io";

const httpServer = createServer();
const io = new Server(httpServer, {
  path: "/",
  cors: { origin: "*", methods: ["GET", "POST"] },
  pingTimeout: 60000,
  pingInterval: 25000,
});

interface Activity {
  id: string;
  name: string;
  role: string;
  company: string;
  site: string;
  color: string;
  time: string;
}

const NAMES = [
  "Hamza S.", "Sana K.", "Bilal A.", "Ayesha M.", "Usman R.",
  "Fatima N.", "Ahmed T.", "Zara H.", "Daniyal P.", "Mahnoor L.",
  "Hassan Q.", "Iqra B.", "Junaid F.", "Rabia G.", "Owais V.",
];
const ROLES = [
  "Software Engineer", "Full-Stack Developer", "Frontend Engineer", "Backend Developer",
  "Marketing Lead", "Product Designer", "Data Analyst", "Project Manager",
  "DevOps Engineer", "QA Engineer", "Content Writer", "Sales Executive",
];
const COMPANIES = [
  "Careem", "Foodpanda", "Bazaar", "Dastgyr", "Afiniti", "Bykea",
  "Systems Ltd", "Arbisoft", "Devsinc", "CureMD", "SadaPay", "Zameen.com",
  "Motiwala", "PakWheels", "Oladoc", "Tintash", "Motus",
];
const SITES = [
  { name: "LinkedIn", color: "#0A66C2" },
  { name: "Indeed", color: "#003A9B" },
  { name: "Rozee.pk", color: "#E84B3C" },
  { name: "Mustakbil", color: "#0077B6" },
  { name: "Bayt", color: "#0a3d62" },
  { name: "Glassdoor", color: "#0CAA41" },
];

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

let counter = 0;
function generateActivity(): Activity {
  counter++;
  const site = pick(SITES);
  return {
    id: `act-${Date.now()}-${counter}`,
    name: pick(NAMES),
    role: pick(ROLES),
    company: pick(COMPANIES),
    site: site.name,
    color: site.color,
    time: "just now",
  };
}

// Keep a rolling buffer of recent activities
const recentActivities: Activity[] = [];
const MAX_BUFFER = 20;

// Seed with some initial activities
for (let i = 0; i < 8; i++) {
  recentActivities.push(generateActivity());
}

io.on("connection", (socket) => {
  console.log(`Client connected: ${socket.id}, total: ${io.engine.clientsCount}`);

  // Send recent activities on connect
  socket.emit("recent-activities", recentActivities.slice(-8).reverse());

  socket.on("disconnect", () => {
    console.log(`Client disconnected: ${socket.id}`);
  });
});

// Broadcast a new activity every 4-7 seconds
function scheduleNext() {
  const delay = 4000 + Math.random() * 3000;
  setTimeout(() => {
    const activity = generateActivity();
    recentActivities.push(activity);
    if (recentActivities.length > MAX_BUFFER) recentActivities.shift();
    io.emit("new-activity", activity);
    scheduleNext();
  }, delay);
}
scheduleNext();

const PORT = 3004;
httpServer.listen(PORT, () => {
  console.log(`QuickApply Live Activity WebSocket server running on port ${PORT}`);
});

process.on("SIGTERM", () => {
  httpServer.close(() => process.exit(0));
});
process.on("SIGINT", () => {
  httpServer.close(() => process.exit(0));
});
