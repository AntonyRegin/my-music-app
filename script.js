// Music Player Script
const songsFolder = 'songs/';
const defaultCover = 'cover.png'; // Place a default image in your repo
const playlistEl = document.getElementById('playlist');
const trackTitleEl = document.getElementById('track-title');
const coverEl = document.getElementById('cover');
const playBtn = document.getElementById('play');
const prevBtn = document.getElementById('prev');
const nextBtn = document.getElementById('next');
const shuffleBtn = document.getElementById('shuffle');
const progressBar = document.getElementById('progress');
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
      { title: 'Song 1', file: 'song1.mp3' },
      { title: 'Song 2', file: 'song2.mp3' },
      { title: 'Song 3', file: 'song3.mp3' }
    ];
  }
  renderPlaylist();
  loadTrack(0);
}

function renderPlaylist() {
  playlistEl.innerHTML = '';
  let order = isShuffling ? shuffledOrder : Array.from(playlist.keys());
  order.forEach((idx) => {
    const track = playlist[idx];
    const li = document.createElement('li');
    li.textContent = track.title;
    li.className = idx === currentTrack ? 'active' : '';
    li.onclick = () => {
      loadTrack(idx);
      playTrack();
    };
    playlistEl.appendChild(li);
  });
}

function loadTrack(idx) {
  currentTrack = idx;
  const track = playlist[idx];
  audio.src = songsFolder + track.file;
  trackTitleEl.textContent = track.title;
  coverEl.src = defaultCover;
  renderPlaylist();
  resetProgress();
}

function playTrack() {
  audio.play();
  isPlaying = true;
  playBtn.innerHTML = '&#10073;&#10073;'; // Pause icon
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
  playTrack();
};

nextBtn.onclick = () => {
  let order = isShuffling ? shuffledOrder : Array.from(playlist.keys());
  let idx = order.indexOf(currentTrack);
  idx = (idx + 1) % order.length;
  loadTrack(order[idx]);
  playTrack();
};

shuffleBtn.onclick = () => {
  isShuffling = !isShuffling;
  if (isShuffling) {
    shuffledOrder = Array.from(playlist.keys());
    for (let i = shuffledOrder.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffledOrder[i], shuffledOrder[j]] = [shuffledOrder[j], shuffledOrder[i]];
    }
    shuffleBtn.style.background = '#ff6e7f';
  } else {
    shuffleBtn.style.background = '';
  }
  renderPlaylist();
};

audio.addEventListener('ended', () => {
  nextBtn.click();
});

audio.addEventListener('timeupdate', () => {
  const percent = (audio.currentTime / audio.duration) * 100;
  progressBar.style.width = percent + '%';
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

// Responsive cover image fallback
coverEl.onerror = () => {
  coverEl.src = defaultCover;
};

// Start
fetchPlaylist();
