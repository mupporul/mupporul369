export const STORAGE_KEYS = {
  authToken: "mupporul369.authToken",
  theme: "mupporul369.theme",
  language: "mupporul369.language",
};

export const THEME_OPTIONS = [
  { id: "sunrise-sandal", label: "Sunrise Sandal" },
  { id: "silver-temple", label: "Silver Temple" },
  { id: "lotus-rose", label: "Lotus Rose" },
  { id: "copper-dusk", label: "Copper Dusk" },
  { id: "pearl-nightfall", label: "Pearl Nightfall" },
  { id: "aurora-light", label: "Aurora Light" },
  { id: "midnight-neon", label: "Midnight Neon" },
];

export const PAGE_OPTIONS = [
  { id: "temples", label: "Temples" },
  { id: "reviews", label: "Reviews" },
  { id: "users", label: "Users" },
];

export const HOUSE_OPTIONS = [
  "மேஷம்",
  "ரிஷபம்",
  "மிதுனம்",
  "கடகம்",
  "சிம்மம்",
  "கன்னி",
  "துலாம்",
  "விருச்சிகம்",
  "தனுசு",
  "மகரம்",
  "கும்பம்",
  "மீனம்",
];

export const PLANET_OPTIONS = [
  "சூரியன்",
  "சந்திரன்",
  "செவ்வாய்",
  "புதன்",
  "குரு",
  "சுக்கிரன்",
  "சனி",
  "ராகு",
  "கேது",
];

export const DEFAULT_TEMPLE_FORM = {
  temple: "",
  location: "",
  state: "",
  url: "",
  house: HOUSE_OPTIONS[0],
  planets: [],
};
