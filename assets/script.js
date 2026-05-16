// Wrap initialization to avoid errors if script loads before DOM
(() => {
  const output = document.getElementById('output');
  const input = document.getElementById('input');
  const tabLabel = document.getElementById('tab-label');

  if (!output || !input || !tabLabel) {
    console.error('Terminal elements missing:', { output: !!output, input: !!input, tabLabel: !!tabLabel });
    return;
  }

  const views = {
    welcome: document.getElementById('view-welcome'),
    about: document.getElementById('view-about'),
    portfolio: document.getElementById('view-portfolio'),
    help: document.getElementById('view-help'),
  };

  const matrixEl = document.getElementById('view-matrix');
  const matrixCanvas = document.getElementById('matrix-canvas');
  let matrixRaf = null;
  const layoutEl = document.querySelector('.layout');

  function startMatrix() {
    if (!matrixEl || !matrixCanvas) return;
    matrixEl.style.display = 'block';
    tabLabel.textContent = 'pia';

    requestAnimationFrame(() => {
      const ctx = matrixCanvas.getContext('2d');
      const W = matrixEl.offsetWidth || matrixEl.parentElement.offsetWidth;
      const H = matrixEl.offsetHeight || (window.innerHeight - 37);
      matrixCanvas.width = W;
      matrixCanvas.height = H;

      const fontSize = 14;
      const cols = Math.floor(W / fontSize);
      const drops = Array.from({ length: cols }, () => Math.random() * -50);
      const chars = 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン0123456789';

      function draw() {
        ctx.fillStyle = 'rgba(0,0,0,0.05)';
        ctx.fillRect(0, 0, W, H);

        for (let i = 0; i < drops.length; i++) {
          const y = drops[i] * fontSize;
          if (y < 0) { drops[i]++; continue; }

          ctx.fillStyle = '#ccffcc';
          ctx.font = `bold ${fontSize}px monospace`;
          ctx.fillText(chars[Math.floor(Math.random() * chars.length)], i * fontSize, y);

          ctx.fillStyle = '#00ff41';
          ctx.font = `${fontSize}px monospace`;
          ctx.fillText(chars[Math.floor(Math.random() * chars.length)], i * fontSize, y + fontSize);

          if (y > H && Math.random() > 0.975) drops[i] = Math.random() * -30;
          drops[i]++;
        }
        matrixRaf = requestAnimationFrame(draw);
      }

      draw();
      setTimeout(() => { stopMatrix(); showView('welcome'); }, 3000);
    });
  }

  function stopMatrix() {
    if (matrixRaf) { cancelAnimationFrame(matrixRaf); matrixRaf = null; }
    if (matrixEl) matrixEl.style.display = 'none';
  }

  let cmdHistory = [];
  let histIdx = -1;

  function print(text, cls = 'ln') {
    const el = document.createElement('div');
    el.className = cls;
    el.textContent = text;
    output.appendChild(el);
    output.scrollTop = output.scrollHeight;
  }

  function printSep() {
    const el = document.createElement('hr');
    el.className = 'ln-sep';
    output.appendChild(el);
    output.scrollTop = output.scrollHeight;
  }

  function showView(name) {
    stopMatrix();
    Object.values(views).forEach(v => { if (v) v.style.display = 'none'; });
    // mark layout with active view for view-specific styling
    if (layoutEl) {
      layoutEl.classList.remove('view-open-welcome','view-open-about','view-open-portfolio','view-open-help');
      layoutEl.classList.add(`view-open-${name}`);
    }
    const v = views[name];
    if (!v) return;
    v.style.display = '';
    v.style.animation = 'none';
    void v.offsetHeight;
    v.style.animation = '';
    tabLabel.textContent = name === 'welcome' ? '~' : name;
    // hide terminal overlay so view is fully interactive/clickable, but keep it visible for welcome
    if (output) output.style.display = (name === 'welcome') ? '' : 'none';
  }

  function hideAllViews() {
    Object.values(views).forEach(v => { if (v) v.style.display = 'none'; });
    if (layoutEl) {
      layoutEl.classList.remove('view-open-welcome','view-open-about','view-open-portfolio','view-open-help');
    }
    // show terminal overlay again
    if (output) output.style.display = '';
  }

  // Home button (top bar) — returns to welcome view and shows terminal
  const homeBtn = document.getElementById('home-btn');
  if (homeBtn) {
    homeBtn.addEventListener('click', () => {
      hideAllViews();
      showView('welcome');
      if (output) output.style.display = '';
    });
  }

  // ESC key returns to home (welcome)
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      hideAllViews();
      showView('welcome');
      if (output) output.style.display = '';
      input.focus();
    }
  });

  function run(raw) {
    const cmd = raw.trim().toLowerCase();
    if (!cmd) return;

    cmdHistory.unshift(raw);
    histIdx = -1;

    // if the command opens a view, hide terminal and show view
    if (cmd === 'whoami' || cmd === 'about') {
      output.style.display = 'none';
      showView('about');
      return;
    }
    if (cmd === 'portfolio' || cmd === 'work') {
      output.style.display = 'none';
      showView('portfolio');
      return;
    }
    if (cmd === 'help') {
      output.style.display = 'none';
      showView('help');
      return;
    }

    // for other commands, keep history: ensure views are hidden and terminal shows
    hideAllViews();

    // commands that open views: show view (and keep output cleared)
    if (cmd === 'whoami' || cmd === 'about') {
      showView('about');
      return;
    }
    if (cmd === 'portfolio' || cmd === 'work') {
      showView('portfolio');
      return;
    }
    if (cmd === 'help') {
      showView('help');
      return;
    }

    // For non-view commands, print the prompt + entered command first
    print(`nopp@pia-server:~$ ${raw}`, 'ln ln-cmd');

    // other commands that print to terminal
    switch (cmd) {
      case 'uname':
      case 'uname -a':
        print('Linux pia-server 6.8.0-slackware SMP Mon Mar 23 20:16:54 UTC 2026 x86_64 x86_64 x86_64 GNU/Linux', 'ln');
        break;
      case 'pia':
        print('// wake up, neo...', 'ln ln-dim');
        stopMatrix();
        Object.values(views).forEach(v => { if (v) v.style.display = 'none'; });
        startMatrix();
        break;
      case 'clear':
        output.innerHTML = '';
        showView('welcome');
        return;
      case 'exit':
      case 'quit':
        print('// você está preso aqui para sempre :)', 'ln ln-dim');
        break;
      default:
        print(`bash: ${raw}: command not found`, 'ln ln-err');
        print('// try "help"', 'ln ln-dim');
    }
  }

  input.addEventListener('keydown', e => {
    if (e.key === 'Enter') {
      const val = input.value;
      input.value = '';
      run(val);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (histIdx < cmdHistory.length - 1) {
        histIdx++;
        input.value = cmdHistory[histIdx];
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (histIdx > 0) {
        histIdx--;
        input.value = cmdHistory[histIdx];
      } else {
        histIdx = -1;
        input.value = '';
      }
    }
  });

  document.addEventListener('click', () => input.focus());
  document.addEventListener('keydown', e => {
    if (document.activeElement !== input && e.key.length === 1 && !e.metaKey && !e.ctrlKey) {
      input.focus();
    }
  });

  // focus input on load
  input.focus();
})();
