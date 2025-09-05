window.onload = function() {
  // --- DOM Elements ---
  const themeToggleBtn = document.getElementById('theme-toggle');
  let isDarkMode = true;

  themeToggleBtn.onclick = function() {
    isDarkMode = !isDarkMode;
    document.body.classList.toggle('light-mode', !isDarkMode);
    themeToggleBtn.textContent = isDarkMode ? '🌙' : '☀️';
  };
  const songsFolder = 'songs/';
  const defaultCover = 'cover.png';
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
  const searchBarEl = document.getElementById('search-bar');
  const audio = document.getElementById('audio');
  const timestampEl = document.querySelector('.controls #timestamp');

  window.onload = function() {
    // DOM references
    const themeToggleBtn = document.getElementById('theme-toggle');
    const playBtn = document.getElementById('play');
    const playlistEl = document.getElementById('playlist');
    const prevBtn = document.getElementById('prev');
    const nextBtn = document.getElementById('next');
    const shuffleBtn = document.getElementById('shuffle');
    const repeatBtn = document.getElementById('repeat');
    const progressBar = document.getElementById('progress');
    const searchBarEl = document.getElementById('search-bar');
    const audio = document.getElementById('audio');
    const timestampEl = document.getElementById('timestamp');
    const trackTitleEl = document.getElementById('track-title');

    // State variables
    let playlist = [];
    let playOrder = [];
    let currentOrderIdx = 0;
    let isPlaying = false;
    let isShuffling = false;
    let isRepeat = false;
    let isDarkMode = true;

    // Theme toggle
    themeToggleBtn.onclick = function() {
      isDarkMode = !isDarkMode;
      document.body.classList.toggle('light-mode', !isDarkMode);
      themeToggleBtn.textContent = isDarkMode ? '🌙' : '☀️';
    };

    // Fetch playlist
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
          { "title": "JD entry", "file": "JD entry.mp3" },
          { "title": "Big bad beast", "file": "Big bad beast.mp3" },
          { "title": "Master Entry", "file": "Master Entry.mp3" },
          { "title": "JD badass", "file": "JD badass.mp3" },
          { "title": "Rolex Theme", "file": "Rolex Theme.mp3" }
        ];
      }
      playOrder = playlist.map((_, i) => i);
      renderPlaylist();
      if (playOrder.length > 0) loadTrack(playOrder[0]);
    }

    // Render playlist
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

    // Load track
    function loadTrack(idx) {
      const track = playlist[idx];
      if (!audio || !track) return;
      audio.src = './songs/' + track.file;
      audio.load();
      trackTitleEl.textContent = track.title;
      renderPlaylist();
      resetProgress();
    }

    // Playback controls
    function playTrack() {
      if (audio) {
        audio.play();
        isPlaying = true;
        playBtn.innerHTML = '&#10073;&#10073;';
      }
    }
    function pauseTrack() {
      audio.pause();
      isPlaying = false;
      playBtn.innerHTML = '&#9654;';
    }
    playBtn.onclick = () => isPlaying ? pauseTrack() : playTrack();
    prevBtn.onclick = () => {
      currentOrderIdx = (currentOrderIdx - 1 + playOrder.length) % playOrder.length;
      loadTrack(playOrder[currentOrderIdx]);
      playTrack();
    };
    nextBtn.onclick = () => {
      currentOrderIdx = (currentOrderIdx + 1) % playOrder.length;
      loadTrack(playOrder[currentOrderIdx]);
      playTrack();
    };
    shuffleBtn.onclick = () => {
      isShuffling = !isShuffling;
      if (isShuffling) {
        playOrder = playlist.map((_, i) => i);
        for (let i = playOrder.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [playOrder[i], playOrder[j]] = [playOrder[j], playOrder[i]];
        }
        currentOrderIdx = 0;
        shuffleBtn.style.boxShadow = '0 0 32px #ff6e7f, 0 0 64px #43cea2';
        shuffleBtn.style.background = '#43cea2';
        shuffleBtn.style.color = '#232526';
      } else {
        playOrder = playlist.map((_, i) => i);
        currentOrderIdx = 0;
        shuffleBtn.style.boxShadow = '';
        shuffleBtn.style.background = '';
        shuffleBtn.style.color = '';
      }
      loadTrack(playOrder[currentOrderIdx]);
      renderPlaylist();
    };
    repeatBtn.onclick = () => {
      isRepeat = !isRepeat;
      repeatBtn.style.boxShadow = isRepeat ? '0 0 32px #ff6e7f, 0 0 64px #43cea2' : '';
      repeatBtn.style.background = isRepeat ? '#43cea2' : '';
      repeatBtn.style.color = isRepeat ? '#232526' : '';
    };
    searchBarEl.addEventListener('input', function() {
      const query = this.value.toLowerCase();
      const filtered = playlist.map((track, i) => ({track, i}))
        .filter(obj => obj.track.title.toLowerCase().includes(query));
      playOrder = filtered.map(obj => obj.i);
      currentOrderIdx = 0;
      if (playOrder.length > 0) loadTrack(playOrder[currentOrderIdx]);
      renderPlaylist();
    });
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
    // Start
    fetchPlaylist();
  }
    fetchPlaylist();
  }
  let isRepeat = false;

  // --- Playlist Fetch ---
  async function fetchPlaylist() {
    try {
      const res = await fetch(songsFolder + 'playlist.json');
      if (res.ok) {
        playlist = await res.json();
      } else {
        throw new Error('No playlist.json');
      }
    } catch {
      playlist = [
        { "title": "JD entry", "file": "JD entry.mp3" },
        { "title": "Big bad beast", "file": "Big bad beast.mp3" },
        { "title": "Master Entry", "file": "Master Entry.mp3" },
        { "title": "JD badass", "file": "JD badass.mp3" },
        { "title": "Rolex Theme", "file": "Rolex Theme.mp3" }
      ];
    }
    playOrder = playlist.map((_, i) => i);
    renderPlaylist();
    if (playOrder.length > 0 && playlist[playOrder[0]]) {
      loadTrack(playOrder[0]);
    }
  }

  // --- Playlist Rendering ---
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

  // --- Track Loading ---
  function loadTrack(idx) {
    const track = playlist[idx];
    if (!audio) {
      alert('Audio element not found!');
      return;
    }
    if (!track) {
      console.error('Track not found for idx:', idx);
      return;
    }
    audio.src = songsFolder + track.file;
    audio.load();
    trackTitleEl.textContent = track.title;
    trackArtistEl.textContent = track.artist || '';
    albumArtEl.src = track.cover ? songsFolder + track.cover : defaultCover;
    albumArtEl.onerror = () => { albumArtEl.src = defaultCover; };
    renderPlaylist();
    resetProgress();
  }

  // --- Playback Controls ---
  function playTrack() {
    if (audio) {
      audio.play();
      isPlaying = true;
      playBtn.innerHTML = '&#10073;&#10073;';
    }
  }

  function pauseTrack() {
    audio.pause();
    isPlaying = false;
    playBtn.innerHTML = '&#9654;';
  }

  playBtn.onclick = () => isPlaying ? pauseTrack() : playTrack();

  prevBtn.onclick = () => {
    currentOrderIdx = (currentOrderIdx - 1 + playOrder.length) % playOrder.length;
    loadTrack(playOrder[currentOrderIdx]);
    playTrack();
  };

  nextBtn.onclick = () => {
    currentOrderIdx = (currentOrderIdx + 1) % playOrder.length;
    loadTrack(playOrder[currentOrderIdx]);
    playTrack();
  };

  shuffleBtn.onclick = () => {
    isShuffling = !isShuffling;
    if (isShuffling) {
      playOrder = playlist.map((_, i) => i);
      for (let i = playOrder.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [playOrder[i], playOrder[j]] = [playOrder[j], playOrder[i]];
      }
      currentOrderIdx = 0;
      shuffleBtn.style.boxShadow = '0 0 32px #ff6e7f, 0 0 64px #43cea2';
      shuffleBtn.style.background = '#43cea2';
      shuffleBtn.style.color = '#232526';
    } else {
      playOrder = playlist.map((_, i) => i);
      currentOrderIdx = 0;
      shuffleBtn.style.boxShadow = '';
      shuffleBtn.style.background = '';
      shuffleBtn.style.color = '';
    }
    loadTrack(playOrder[currentOrderIdx]);
    renderPlaylist();
  };

  repeatBtn.onclick = () => {
    isRepeat = !isRepeat;
    repeatBtn.style.boxShadow = isRepeat ? '0 0 32px #ff6e7f, 0 0 64px #43cea2' : '';
    repeatBtn.style.background = isRepeat ? '#43cea2' : '';
    repeatBtn.style.color = isRepeat ? '#232526' : '';
  };

  // --- Search ---
  searchBarEl.addEventListener('input', function() {
    const query = this.value.toLowerCase();
    const filtered = playlist.map((track, i) => ({track, i}))
      .filter(obj => obj.track.title.toLowerCase().includes(query) || (obj.track.artist && obj.track.artist.toLowerCase().includes(query)));
    playOrder = filtered.map(obj => obj.i);
    currentOrderIdx = 0;
    if (playOrder.length > 0) loadTrack(playOrder[currentOrderIdx]);
    renderPlaylist();
  });

  // --- Next Song on End ---
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
// End of window.onload