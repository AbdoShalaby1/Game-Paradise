async function fetchJSON(url, opts) {
  const res = await fetch(url, opts);
  if (!res.ok) throw new Error('Network error');
  return res.json();
}

function getImageSrc(item) {
  // prefer img_path from DB (relative to /static/) or fallback to image field
  if (item.img_path) {
    // some projects store 'images/xxx.jpg' or 'static/images/xxx.jpg'
    if (item.img_path.startsWith('/')) return item.img_path;
    return '/static/' + item.img_path;
  }
  if (item.image) {
    if (item.image.startsWith('/')) return item.image;
    return '/static/' + item.image;
  }
  return '/static/images/placeholder.png';
}

function buildCard(item) {
  const appid = item.appid || item.id || (item.name || '').toLowerCase().replace(/\s+/g, '-');
  const img = getImageSrc(item);
  return `<div class="card" data-appid="${appid}">
    <img src="${img}" alt="${(item.name || item.title || 'Game').replace(/"/g, '')}" loading="lazy">
    <div class="info">
      <h3 style="white-space: nowrap;   
          overflow: hidden;  
          text-overflow: ellipsis;">${item.name || item.title || 'Untitled'}</h3>
      <br>
      <div class="actions">
        <button class="btn primary play-btn" data-appid="${appid}">Install</button>
        <button class="btn ghost details-btn" data-appid="${appid}">Details</button>
      </div>
    </div>
  </div>`;
}

function installedKey(appid) { return 'installed_' + appid; }

function bindActions(container) {
  container.querySelectorAll('.play-btn').forEach(btn => {
    const appid = btn.dataset.appid;
    // set label from install state
    const installed = localStorage.getItem(installedKey(appid));
    btn.textContent = installed ? 'Play' : 'Install';
    btn.addEventListener('click', () => {
      const state = localStorage.getItem(installedKey(appid));
      if (state) {
        // simulate play
        alert('Launching ' + appid + ' — this is a demo.');
      } else {
        btn.textContent = 'Play';
        localStorage.setItem(installedKey(appid), '1');
        btn.classList.add('installed');
        // optional visual effect
        btn.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.04)' }, { transform: 'scale(1)' }], { duration: 300 });
      }
    });
  });

  container.querySelectorAll('.details-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const appid = btn.dataset.appid;
      window.location.href = '/info?appid=' + encodeURIComponent(appid);
    });
  });
}

async function loadLibrary() {
  const container = document.getElementById('library-list');
  container.innerHTML = '<div class="empty">Loading your library…</div>';
  try {
    const data = await fetchJSON('/api/library');
    if (!data || data.length === 0) {
      container.innerHTML = '<div class="empty">Your library is empty. Buy games to see them here.</div>';
      return;
    }
    // render cards
    container.innerHTML = data.map(buildCard).join('\n');
    bindActions(container);
  } catch (err) {
    console.error(err);
    container.innerHTML = '<div class="empty">Could not load your library — try refreshing.</div>';
  }

  if (activeUser == "") {
    document.querySelector("nav").insertAdjacentHTML(
      "beforeend",
      "<input type='button' id='loginBtn' value='Log In/Sign Up' onclick=\"location.href='/login'\">"
    );
  }
  else {
    document.querySelector("nav").insertAdjacentHTML("beforeend", `<span id="welcome">Welcome! ${activeUser} </span> <input type="button" id = "logoutBtn" onclick = "logout()" value="Log Out">`); // span is inline div
  }
}

function logout() {
    fetch("/logout")
        .then(() => {
            window.location.href = '/';
        });
}

document.addEventListener('DOMContentLoaded', loadLibrary);
