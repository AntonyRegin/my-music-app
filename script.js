window.onload = function () {
  // --- DOM Elements ---
  const themeToggleBtn = document.getElementById('theme-toggle');
  const playlistEl = document.getElementById('playlist');
  const trackTitleEl = document.getElementById('track-title');
  const playBtn = document.getElementById('play');
  const prevBtn = document.getElementById('prev');
  const nextBtn = document.getElementById('next');
  const shuffleBtn = document.getElementById('shuffle');
  const repeatBtn = document.getElementById('repeat');
  const searchBarEl = document.getElementById('search');
  const progressBar = document.getElementById('progress');
  const timestampEl = document.getElementById('timestamp');
  const audio = document.getElementById('audio');

  // --- State ---
  const songsFolder = 'songs/';
  let playlist = [];
  let playOrder = [];
  let currentOrderIdx = 0;
  let isPlaying = false;
  let isShuffling = false;
  let isRepeat = false;

  // --- Theme Toggle ---
  let isDarkMode = true;
  themeToggleBtn.onclick = function () {
    isDarkMode = !isDarkMode;
    document.body.classList.toggle('light-mode', !isDarkMode);
    themeToggleBtn.textContent = isDarkMode ? '🌙' : '☀️';
  };

  // --- Fetch Playlist ---
  async function fetchPlaylist() {
    try {
      const res = await fetch('./songs/playlist.json');
      if (res.ok) {
        playlist = await res.json();
      } else {
        throw new Error('No playlist.json');
      }
    } catch {
      playlist = [
        { title: 'JD entry', file: 'JD entry.mp3' },
        { title: 'Master Entry', file: 'Master Entry.mp3' }
      ];
    }
    playOrder = playlist.map((_, i) => i);
    currentOrderIdx = 0;
    if (playlist.length > 0) {
      loadTrack(playOrder[currentOrderIdx]);
    }
    renderPlaylist();
  }

  // --- Render Playlist ---
  function renderPlaylist() {
    playlistEl.innerHTML = '';
    playOrder.forEach((idx, i) => {
      const track = playlist[idx];
      const li = document.createElement('li');
      li.textContent = track.title;
      if (i === currentOrderIdx) li.className = 'active';
      li.onclick = () => {
        currentOrderIdx = i;
        loadTrack(idx);
        playTrack();
      };
      playlistEl.appendChild(li);
    });
  }

  // --- Load Track ---
  function loadTrack(idx) {
    const track = playlist[idx];
    if (!audio || !track) return;
    audio.src = songsFolder + track.file;
    audio.load();
    trackTitleEl.textContent = track.title;
    renderPlaylist();
    resetProgress();
  }

  // --- Play / Pause ---
  function playTrack() {
    if (audio) {
      audio.play();
      isPlaying = true;
      playBtn.innerHTML = '&#10073;&#10073;';
    }
  }
  function pauseTrack() {
    if (audio) {
      audio.pause();
      isPlaying = false;
      playBtn.innerHTML = '&#9654;';
    }
  }
  playBtn.onclick = () => (isPlaying ? pauseTrack() : playTrack());

  // --- Prev / Next ---
  prevBtn.onclick = () => {
    if (playOrder.length === 0) return;
    currentOrderIdx = (currentOrderIdx - 1 + playOrder.length) % playOrder.length;
    loadTrack(playOrder[currentOrderIdx]);
    playTrack();
  };
  nextBtn.onclick = () => {
    if (playOrder.length === 0) return;
    currentOrderIdx = (currentOrderIdx + 1) % playOrder.length;
    loadTrack(playOrder[currentOrderIdx]);
    playTrack();
  };

  // --- Shuffle ---
  shuffleBtn.onclick = () => {
    isShuffling = !isShuffling;
    if (isShuffling) {
      playOrder = playlist.map((_, i) => i);
      for (let i = playOrder.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [playOrder[i], playOrder[j]] = [playOrder[j], playOrder[i]];
      }
      currentOrderIdx = 0;
      shuffleBtn.classList.add('active');
    } else {
      playOrder = playlist.map((_, i) => i);
      currentOrderIdx = 0;
      shuffleBtn.classList.remove('active');
    }
    if (playOrder.length > 0) loadTrack(playOrder[currentOrderIdx]);
    renderPlaylist();
  };

  // --- Repeat ---
  repeatBtn.onclick = () => {
    isRepeat = !isRepeat;
    repeatBtn.classList.toggle('active', isRepeat);
  };

  // --- Search ---
  searchBarEl.addEventListener('input', function () {
    const query = this.value.toLowerCase();
    const filtered = playlist
      .map((track, i) => ({ track, i }))
      .filter(obj => obj.track.title.toLowerCase().includes(query));
    playOrder = filtered.map(obj => obj.i);
    currentOrderIdx = 0;
    if (playOrder.length > 0) loadTrack(playOrder[currentOrderIdx]);
    renderPlaylist();
  });

  // --- End of Song ---
  audio.addEventListener('ended', () => {
    if (isRepeat) {
      audio.currentTime = 0;
      playTrack();
    } else {
      currentOrderIdx = (currentOrderIdx + 1) % playOrder.length;
      loadTrack(playOrder[currentOrderIdx]);
      playTrack();
    }
  });

  // --- Progress Bar ---
  audio.addEventListener('timeupdate', () => {
    if (!audio.duration) return;
    const percent = (audio.currentTime / audio.duration) * 100;
    progressBar.style.width = percent + '%';
    updateTimestamp();
  });

  // --- Seek ---
  const progressBarContainer = document.getElementById('progress-bar');
  progressBarContainer.onclick = (e) => {
    if (!audio.duration) return;
    const rect = e.target.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percent = x / rect.width;
    audio.currentTime = percent * audio.duration;
  };

  // --- Helpers ---
  function resetProgress() {
    progressBar.style.width = '0%';
    timestampEl.textContent = '00:00 / 00:00';
  }
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

  // --- Start ---
  fetchPlaylist();
};