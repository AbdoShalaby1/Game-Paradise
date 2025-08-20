async function fetchJSON(url, opts) {
  const res = await fetch(url, opts);
  if (!res.ok) throw new Error('Network error');
  return res.json();
}

function getImageSrc(item) {
  // prefer img_path from DB (relative to /static/) or fallback to image field
  if (item.img_path) {
    // some projects store 'images/xxx.jpg' or 'static/images/xxx.jpg'
    return '/static/' + item.img_path;
  }
  if (item.image) {
    return '/static' + item.image;
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
        <button class="btn primary play-btn" data-appid="${appid}" data-name = "${item.name}">Install</button>
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
        fetch("/gameplay", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: btn.dataset.name })
        })
          .then(res => res.text())
          .then(data => {
            window.location.href = "https://www.youtube.com/watch?v=" + data + "?autoplay=1?fullscreen=1";
          })
      } else {
        let timerInterval;
        Swal.fire({
          title: 'Installing...',
          html: '<b></b>',
          timer: 5000, // total install time in ms
          timerProgressBar: true,
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
            const b = Swal.getHtmlContainer().querySelector('b');
            timerInterval = setInterval(() => {
              b.textContent = Math.round((5000 - Swal.getTimerLeft()) / 50) + '%';
            }, 100);
          },
          willClose: () => {
            clearInterval(timerInterval);
          }
        }).then((result) => {
          if (result.dismiss === Swal.DismissReason.timer) {
            Swal.fire(
              'Installed!',
              'The game has been successfully installed.',
              'success'
            );
          }
        });

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
    const data = await fetchJSON(`/api/library?q=${encodeURIComponent(q)}`);
    if (!data || data.length === 0) {
      container.innerHTML = '<div class="empty">No Matching Games.</div>';
      return;
    }
    // render cards
    container.innerHTML = data.map(buildCard).join('\n');
    bindActions(container);
  } catch (err) {
    console.error(err);
    container.innerHTML = '<div class="empty">Could not load your library — try refreshing.</div>';
  }
}


document.addEventListener('DOMContentLoaded', loadLibrary);
