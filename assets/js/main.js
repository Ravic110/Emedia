/* Utility functions for the learning site */

function safeHtml(html) {
  // Minimal sanitization: escape </script> sequences to avoid breaking the editor.
  return html.replace(/<\/script>/gi, "<\\/script>");
}

function updateLivePreview(iframe, options) {
  const config = options || {};
  const html = config.html || "";
  const css = config.css || "";
  const js = config.js || "";
  if (!iframe) return false;
  const fullHtml = `
    <!DOCTYPE html>
    <html lang="fr">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <style>
          html, body {
            background: #ffffff;
            color: #111827;
          }
          body {
            margin: 0;
            padding: 12px;
            font-family: system-ui, -apple-system, "Segoe UI", sans-serif;
          }
        </style>
        <style>${css}</style>
      </head>
      <body>
        ${safeHtml(html)}
        <script>
          try {
            ${js}
          } catch (err) {
            const pre = document.createElement("pre");
            pre.textContent = "Erreur JS : " + err;
            document.body.appendChild(pre);
          }
        <\/script>
      </body>
    </html>
  `;

  try {
    iframe.srcdoc = fullHtml;
    return true;
  } catch (err) {
    try {
      const doc = iframe.contentDocument || iframe.contentWindow.document;
      doc.open();
      doc.write(fullHtml);
      doc.close();
      return true;
    } catch (fallbackErr) {
      console.error("Preview render failed:", fallbackErr);
      return false;
    }
  }
}

function connectEditor({ htmlEl, cssEl, jsEl, previewBtn }) {
  const editorRoot = htmlEl ? htmlEl.closest(".editor") : null;
  const iframe = editorRoot ? editorRoot.querySelector(".preview iframe") : null;

  const update = () => {
    return updateLivePreview(iframe, {
      html: htmlEl ? htmlEl.value : "",
      css: cssEl ? cssEl.value : "",
      js: jsEl ? jsEl.value : "",
    });
  };

  if (previewBtn) {
    previewBtn.addEventListener("click", (event) => {
      event.preventDefault();
      const ok = update();
      const previous = previewBtn.textContent;
      previewBtn.textContent = ok ? "Aperçu mis à jour" : "Erreur d'aperçu";
      setTimeout(() => {
        previewBtn.textContent = previous;
      }, 900);
    });
  }

  // Update on input with debounce
  let timeout;
  const schedule = () => {
    clearTimeout(timeout);
    timeout = setTimeout(update, 350);
  };

  if (htmlEl) htmlEl.addEventListener("input", schedule);
  if (cssEl) cssEl.addEventListener("input", schedule);
  if (jsEl) jsEl.addEventListener("input", schedule);

  // Initial render
  update();
}

function setActiveNav() {
  const path = window.location.pathname;
  const links = document.querySelectorAll(".nav-links a");
  links.forEach((link) => {
    const href = link.getAttribute("href");
    if (!href) return;
    try {
      const linkUrl = new URL(href, window.location.href);
      const linkPath = linkUrl.pathname;

      if (linkPath === path || (path === "/" && linkPath === "/index.html")) {
        link.classList.add("active");
      }
    } catch (err) {
      console.warn("Invalid nav link:", href, err);
    }
  });
}

function initLessonEditors() {
  const editorRoot = document.querySelector(".editor");
  if (!editorRoot) return;

  const htmlArea = editorRoot.querySelector("#editor-html");
  const cssArea = editorRoot.querySelector("#editor-css");
  const jsArea = editorRoot.querySelector("#editor-js");
  const previewBtn = editorRoot.querySelector("#run-preview");

  if (htmlArea || cssArea || jsArea) {
    connectEditor({ htmlEl: htmlArea, cssEl: cssArea, jsEl: jsArea, previewBtn });
  }
}

function initGuessNumberGame() {
  const gameRoot = document.querySelector("#guess-game");
  if (!gameRoot) return;

  const startBtn = gameRoot.querySelector("button[data-action='start']");
  const checkBtn = gameRoot.querySelector("button[data-action='check']");
  const difficultyEl = gameRoot.querySelector("select[data-role='difficulty']");
  const input = gameRoot.querySelector("input[data-role='guess']");
  const output = gameRoot.querySelector(".result");
  const hint = gameRoot.querySelector(".hint");
  const attempts = gameRoot.querySelector(".attempts");
  const score = gameRoot.querySelector(".score");
  const historyEl = gameRoot.querySelector("ul[data-role='history']");
  const progressBar = gameRoot.querySelector(".guess-progress-bar");
  if (
    !startBtn ||
    !checkBtn ||
    !difficultyEl ||
    !input ||
    !output ||
    !hint ||
    !attempts ||
    !score ||
    !historyEl ||
    !progressBar
  ) {
    return;
  }

  const levels = {
    easy: { min: 0, max: 50, tries: 12 },
    normal: { min: 0, max: 100, tries: 10 },
    hard: { min: 0, max: 200, tries: 8 },
  };

  let target = 0;
  let remaining = 0;
  let totalTries = 0;
  let min = 0;
  let max = 100;
  let wins = 0;
  let losses = 0;
  let streak = 0;
  let history = [];

  const setHintState = (text, stateClass) => {
    hint.textContent = text;
    hint.classList.remove("guess-good", "guess-warn", "guess-bad");
    if (stateClass) {
      hint.classList.add(stateClass);
    }
  };

  const renderHistory = () => {
    historyEl.innerHTML = "";
    if (!history.length) {
      const empty = document.createElement("li");
      empty.textContent = "Aucune tentative pour l'instant.";
      historyEl.appendChild(empty);
      return;
    }

    history.forEach((entry) => {
      const li = document.createElement("li");
      li.textContent = entry;
      historyEl.appendChild(li);
    });
  };

  const updateScore = () => {
    score.textContent = `Score: ${wins} victoire(s), ${losses} défaite(s), série: ${streak}`;
  };

  const updateProgress = () => {
    const ratio = totalTries > 0 ? (remaining / totalTries) * 100 : 0;
    progressBar.style.width = `${Math.max(0, ratio)}%`;
  };

  const lockInput = () => {
    input.disabled = true;
    checkBtn.disabled = true;
  };

  const unlockInput = () => {
    input.disabled = false;
    checkBtn.disabled = false;
    input.focus();
  };

  const reset = () => {
    const level = levels[difficultyEl.value] || levels.normal;
    min = level.min;
    max = level.max;
    totalTries = level.tries;
    target = Math.floor(Math.random() * (max - min + 1)) + min;
    remaining = totalTries;
    history = [];
    output.textContent = `Devinez un nombre entre ${min} et ${max}.`;
    setHintState("Indice: plus vous êtes proche, plus la couleur devient chaude.", "");
    attempts.textContent = `Tentatives restantes: ${remaining}`;
    input.value = "";
    input.min = String(min);
    input.max = String(max);
    input.placeholder = `Entrez un nombre (${min}-${max})`;
    renderHistory();
    updateScore();
    updateProgress();
    unlockInput();
  };

  const check = () => {
    if (input.disabled) return;

    const value = parseInt(input.value, 10);
    if (Number.isNaN(value)) {
      output.textContent = "Entrez un nombre valide.";
      setHintState("Indice: saisissez un nombre entier.", "guess-warn");
      return;
    }
    if (value < min || value > max) {
      output.textContent = `Le nombre doit être entre ${min} et ${max}.`;
      setHintState("Hors limite pour ce niveau.", "guess-warn");
      return;
    }

    remaining -= 1;
    const distance = Math.abs(value - target);

    if (value === target) {
      wins += 1;
      streak += 1;
      output.textContent = `🎉 Bravo ! Le nombre était ${target}.`;
      setHintState("Parfait, vous avez trouvé le nombre exact.", "guess-good");
      history.unshift(`✅ ${value} trouvé avec ${remaining} tentative(s) restante(s).`);
      renderHistory();
      attempts.textContent = `Tentatives restantes: ${remaining}`;
      updateScore();
      updateProgress();
      lockInput();
      return;
    }

    if (distance <= 3) {
      setHintState("Brûlant ! Vous êtes tout proche.", "guess-good");
    } else if (distance <= 10) {
      setHintState("Chaud, continuez comme ça.", "guess-warn");
    } else if (distance <= 25) {
      setHintState("Tiède, vous vous rapprochez.", "guess-warn");
    } else {
      setHintState("Froid, changez plus fortement votre valeur.", "guess-bad");
    }

    history.unshift(
      value > target
        ? `${value} : votre proposition est trop grande, essayez un nombre plus petit.`
        : `${value} : votre proposition est trop petite, essayez un nombre plus grand.`
    );
    if (history.length > 8) history.pop();
    renderHistory();

    if (remaining <= 0) {
      losses += 1;
      streak = 0;
      output.textContent = `😞 Vous avez épuisé vos tentatives. Le nombre était ${target}.`;
      attempts.textContent = "Tentatives restantes: 0";
      updateScore();
      updateProgress();
      lockInput();
      return;
    }

    output.textContent = value > target ? "C'est plus petit." : "C'est plus grand.";
    attempts.textContent = `Tentatives restantes: ${remaining}`;
    updateProgress();
    input.select();
  };

  checkBtn.addEventListener("click", check);
  startBtn.addEventListener("click", reset);
  difficultyEl.addEventListener("change", reset);
  input.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      check();
    }
  });

  reset();
}

function init() {
  const steps = [setActiveNav, initLessonEditors, initGuessNumberGame];
  steps.forEach((step) => {
    try {
      step();
    } catch (err) {
      console.error("Initialization error:", err);
    }
  });
}

window.addEventListener("DOMContentLoaded", init);
