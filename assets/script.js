const output   = document.getElementById('output');
const input    = document.getElementById('input');
const tabLabel = document.getElementById('tab-label');

const views = {
  welcome:   document.getElementById('view-welcome'),
  about:     document.getElementById('view-about'),
  portfolio: document.getElementById('view-portfolio'),
  help:      document.getElementById('view-help'),
};

// ── MATRIX ──────────────────────────────────
const matrixEl     = document.getElementById('view-matrix');
const matrixCanvas = document.getElementById('matrix-canvas');
let   matrixRaf    = null;

function startMatrix() {
  matrixEl.style.display = 'block';
  tabLabel.textContent = 'pia';

  requestAnimationFrame(() => {
    const ctx = matrixCanvas.getContext('2d');
    const W   = matrixEl.offsetWidth  || matrixEl.parentElement.offsetWidth;
    const H   = matrixEl.offsetHeight || (window.innerHeight - 37);
    matrixCanvas.width  = W;
    matrixCanvas.height = H;

    const fontSize = 14;
    const cols     = Math.floor(W / fontSize);
    const drops    = Array.from({ length: cols }, () => Math.random() * -50);
    const chars    = 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン0123456789';

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
  matrixEl.style.display = 'none';
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
  Object.values(views).forEach(v => { v.style.display = 'none'; });
  const v = views[name];
  if (!v) return;
  v.style.display = '';
  v.style.animation = 'none';
  void v.offsetHeight;
  v.style.animation = '';
  tabLabel.textContent = name === 'welcome' ? '~' : name;
}

function run(raw) {
  const cmd = raw.trim().toLowerCase();
  print(`nopp@pia-server:~$ ${raw}`, 'ln ln-cmd');
  if (!cmd) return;

  cmdHistory.unshift(raw);
  histIdx = -1;

  switch (cmd) {
    case 'whoami':
    case 'about':
      showView('about');
      break;
    case 'portfolio':
    case 'work':
      showView('portfolio');
      break;
    case 'help':
      showView('help');
      break;
    case 'uname':
    case 'uname -a':
      print('Linux pia-server 6.8.0-1053-gcp #56~22.04.1-Ubuntu SMP Mon Mar 23 20:16:54 UTC 2026 x86_64 x86_64 x86_64 GNU/Linux', 'ln');
      break;
    case 'pia':
      print('// wake up, neo...', 'ln ln-dim');
      stopMatrix();
      Object.values(views).forEach(v => { v.style.display = 'none'; });
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
