/* Utility functions for the learning site */

function safeHtml(html) {
  // Minimal sanitization: escape </script> sequences to avoid breaking the editor.
  return html.replace(/<\/script>/gi, "<\\/script>");
}

function updateLivePreview({ html = "", css = "", js = "" } = {}) {
  const iframe = document.querySelector(".preview iframe");
  if (!iframe) return;
  const doc = iframe.contentDocument || iframe.contentWindow.document;
  const fullHtml = `
    <!DOCTYPE html>
    <html lang="fr">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
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

  doc.open();
  doc.write(fullHtml);
  doc.close();
}

function connectEditor({ htmlEl, cssEl, jsEl, previewBtn }) {
  const update = () => {
    updateLivePreview({
      html: htmlEl?.value || "",
      css: cssEl?.value || "",
      js: jsEl?.value || "",
    });
  };

  if (previewBtn) {
    previewBtn.addEventListener("click", update);
  }

  // Update on input with debounce
  let timeout;
  const schedule = () => {
    clearTimeout(timeout);
    timeout = setTimeout(update, 350);
  };

  htmlEl?.addEventListener("input", schedule);
  cssEl?.addEventListener("input", schedule);
  jsEl?.addEventListener("input", schedule);

  // Initial render
  update();
}

function setActiveNav() {
  const path = window.location.pathname;
  const links = document.querySelectorAll(".nav-links a");
  links.forEach((link) => {
    const href = link.getAttribute("href");
    if (!href) return;
    const linkUrl = new URL(href, window.location.href);
    const linkPath = linkUrl.pathname;

    if (linkPath === path || (path === "/" && linkPath === "/index.html")) {
      link.classList.add("active");
    }
  });
}

function initLessonEditors() {
  const htmlArea = document.querySelector("#editor-html");
  const cssArea = document.querySelector("#editor-css");
  const jsArea = document.querySelector("#editor-js");
  const previewBtn = document.querySelector("#run-preview");
  if (htmlArea || cssArea || jsArea) {
    connectEditor({ htmlEl: htmlArea, cssEl: cssArea, jsEl: jsArea, previewBtn });
  }
}

function initGuessNumberGame() {
  const gameRoot = document.querySelector("#guess-game");
  if (!gameRoot) return;

  const startBtn = gameRoot.querySelector("button[data-action='start']");
  const input = gameRoot.querySelector("input[data-role='guess']");
  const output = gameRoot.querySelector(".result");
  const attempts = gameRoot.querySelector(".attempts");

  let target = 0;
  let remaining = 0;

  const reset = () => {
    target = Math.floor(Math.random() * 100);
    remaining = 10;
    output.textContent = "Devinez un nombre entre 0 et 100.";
    attempts.textContent = `Tentatives restantes: ${remaining}`;
    input.value = "";
    input.disabled = false;
  };

  const check = () => {
    const value = parseInt(input.value, 10);
    if (Number.isNaN(value)) {
      output.textContent = "Entrez un nombre valide.";
      return;
    }
    remaining -= 1;
    if (value === target) {
      output.textContent = `🎉 Bravo ! Le nombre était ${target}.`; 
      input.disabled = true;
      return;
    }
    if (remaining <= 0) {
      output.textContent = `😞 Vous avez épuisé vos tentatives. Le nombre était ${target}.`;
      input.disabled = true;
      attempts.textContent = "";
      return;
    }
    output.textContent = value > target ? "C'est plus petit." : "C'est plus grand.";
    attempts.textContent = `Tentatives restantes: ${remaining}`;
  };

  startBtn.addEventListener("click", reset);
  input.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      check();
    }
  });

  reset();
}

function init() {
  setActiveNav();
  initLessonEditors();
  initGuessNumberGame();
}

window.addEventListener("DOMContentLoaded", init);
