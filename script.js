// Visualizer setup
const visualizerCanvas = document.getElementById('visualizer');
const vCtx = visualizerCanvas.getContext('2d');
let audioCtx, analyser, source;

function setupVisualizer() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    analyser = audioCtx.createAnalyser();
    analyser.fftSize = 64;
    source = audioCtx.createMediaElementSource(audio);
    source.connect(analyser);
    analyser.connect(audioCtx.destination);
  }
  drawVisualizer();
}

function drawVisualizer() {
  requestAnimationFrame(drawVisualizer);
  const bufferLength = analyser.frequencyBinCount;
  const dataArray = new Uint8Array(bufferLength);
  analyser.getByteFrequencyData(dataArray);
  vCtx.clearRect(0, 0, visualizerCanvas.width, visualizerCanvas.height);
  const barWidth = (visualizerCanvas.width / bufferLength) - 2;
  for (let i = 0; i < bufferLength; i++) {
    const barHeight = dataArray[i] * 0.6;
    const x = i * (barWidth + 2);
    vCtx.fillStyle = `linear-gradient(90deg, #ff6e7f, #43cea2, #bfe9ff)`;
    vCtx.fillStyle = `rgba(${67 + i*2},206,162,0.8)`;
    vCtx.fillRect(x, visualizerCanvas.height - barHeight, barWidth, barHeight);
    vCtx.shadowColor = '#43cea2';
    vCtx.shadowBlur = 8;
  }
}
const themeToggleBtn = document.getElementById('theme-toggle');
let isDarkMode = true;

themeToggleBtn.onclick = function() {
  isDarkMode = !isDarkMode;
  document.body.classList.toggle('light-mode', !isDarkMode);
  themeToggleBtn.textContent = isDarkMode ? '🌙' : '☀️';
};
const searchBarEl = document.getElementById('search-bar');
let filteredPlaylist = [];
// Timestamp display
const timestampEl = document.getElementById('timestamp');

function updateTimestamp() {
  if (!audio.duration) {
    timestampEl.textContent = '00:00 / 00:00';
    return;
  }
  const current = formatTime(audio.currentTime);
  const total = formatTime(audio.duration);
  timestampEl.textContent = `${current} / ${total}`;
}

function formatTime(sec) {
  sec = Math.floor(sec);
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}
// Music Player Script
const songsFolder = 'songs/';
const defaultCover = 'cover.png'; // Place a default image in your repo
const playlistEl = document.getElementById('playlist');
const trackTitleEl = document.getElementById('track-title');
const albumArtEl = document.getElementById('album-art');
const trackArtistEl = document.getElementById('track-artist');
const playBtn = document.getElementById('play');
const prevBtn = document.getElementById('prev');
const nextBtn = document.getElementById('next');
const shuffleBtn = document.getElementById('shuffle');
const progressBar = document.getElementById('progress');
const repeatBtn = document.getElementById('repeat');
let isRepeat = false;
let audio = new Audio();
let playlist = [];
let currentTrack = 0;
let isPlaying = false;
let isShuffling = false;
let shuffledOrder = [];

// Try to fetch all .mp3 files from the songs folder
async function fetchPlaylist() {
  // GitHub Pages doesn't allow directory listing, so you must hardcode or generate this list
  // For demo, let's try to fetch a playlist.json, fallback to hardcoded
  try {
    const res = await fetch(songsFolder + 'playlist.json');
    if (res.ok) {
      playlist = await res.json();
    } else {
      throw new Error('No playlist.json');
    }
  } catch {
    // Fallback: hardcoded list (update with your actual files)
    playlist = [
      { "title": "JD entry", "file": "JD entry.mp3" },
      { "title": "Big bad beast", "file": "Big bad beast.mp3" },
  { "title": "Master Entry", "file": "Master Entry.mp3" },
  { "title": "JD badass", "file": "JD badass.mp3" },
  { "title": "Rolex Theme", "file": "Rolex Theme.mp3" }
    ];
  }
  filteredPlaylist = playlist;
  renderPlaylist();
  loadTrack(0);
  // Wait for user interaction to start playback
}

function renderPlaylist() {
  playlistEl.innerHTML = '';
  let order = isShuffling ? shuffledOrder : Array.from(filteredPlaylist.keys());
  order.forEach((idx) => {
    const track = filteredPlaylist[idx];
    const li = document.createElement('li');
    li.textContent = track.title;
    li.className = playlist.indexOf(track) === currentTrack ? 'active' : '';
    li.onclick = () => {
      loadTrack(playlist.indexOf(track));
      playTrack();
    };
    playlistEl.appendChild(li);
  });
}
searchBarEl.addEventListener('input', function() {
  const query = this.value.toLowerCase();
  filteredPlaylist = playlist.filter(track => track.title.toLowerCase().includes(query) || (track.artist && track.artist.toLowerCase().includes(query)));
  renderPlaylist();
});

function loadTrack(idx) {
  currentTrack = idx;
  const track = playlist[idx];
  audio.src = songsFolder + track.file;
  trackTitleEl.textContent = track.title;
  trackArtistEl.textContent = track.artist || '';
  albumArtEl.src = track.cover ? songsFolder + track.cover : 'cover.png';
  albumArtEl.onerror = () => { albumArtEl.src = 'cover.png'; };
  renderPlaylist();
  resetProgress();
}

function playTrack() {
  audio.play();
  isPlaying = true;
  playBtn.innerHTML = '&#10073;&#10073;'; // Pause icon
  setupVisualizer();
}

function pauseTrack() {
  audio.pause();
  isPlaying = false;
  playBtn.innerHTML = '&#9654;'; // Play icon
}

playBtn.onclick = () => {
  if (isPlaying) {
    pauseTrack();
  } else {
    playTrack();
  }
};

prevBtn.onclick = () => {
  let order = isShuffling ? shuffledOrder : Array.from(playlist.keys());
  let idx = order.indexOf(currentTrack);
  idx = (idx - 1 + order.length) % order.length;
  loadTrack(order[idx]);
  playTrack(); // Autoplay on prev
};

nextBtn.onclick = () => {
  let order = isShuffling ? shuffledOrder : Array.from(playlist.keys());
  let idx = order.indexOf(currentTrack);
  idx = (idx + 1) % order.length;
  loadTrack(order[idx]);
  playTrack(); // Autoplay on next
};

shuffleBtn.onclick = () => {
  isShuffling = !isShuffling;
  if (isShuffling) {
    shuffledOrder = Array.from(playlist.keys());
    for (let i = shuffledOrder.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffledOrder[i], shuffledOrder[j]] = [shuffledOrder[j], shuffledOrder[i]];
    }
    shuffleBtn.style.boxShadow = '0 0 32px #ff6e7f, 0 0 64px #43cea2';
    shuffleBtn.style.background = '#43cea2';
    shuffleBtn.style.color = '#232526';
  } else {
    shuffleBtn.style.boxShadow = '';
    shuffleBtn.style.background = '';
    shuffleBtn.style.color = '';
  }
  renderPlaylist();
};

repeatBtn.onclick = () => {
  isRepeat = !isRepeat;
  if (isRepeat) {
    repeatBtn.style.boxShadow = '0 0 32px #ff6e7f, 0 0 64px #43cea2';
    repeatBtn.style.background = '#43cea2';
    repeatBtn.style.color = '#232526';
  } else {
    repeatBtn.style.boxShadow = '';
    repeatBtn.style.background = '';
    repeatBtn.style.color = '';
  }
};

audio.addEventListener('ended', () => {
  if (isRepeat) {
    playTrack();
  } else {
    nextBtn.click();
  }
});

audio.addEventListener('timeupdate', () => {
  const percent = (audio.currentTime / audio.duration) * 100;
  progressBar.style.width = percent + '%';
  updateTimestamp();
});

document.getElementById('progress-bar').onclick = (e) => {
  const rect = e.target.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const percent = x / rect.width;
  audio.currentTime = percent * audio.duration;
};

function resetProgress() {
  progressBar.style.width = '0%';
}

// Cover image removed from HTML, so no error handler needed

// Start
fetchPlaylist();
