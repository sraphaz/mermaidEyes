// MermaidEyes: init + render via mermaid.render (data-mermaid-src)
(function () {
  'use strict';
  if (window.mermaideyesInitialized) return;

  function getConfig() {
    const el = document.querySelector('[data-mermaideyes-config]');
    if (!el) return { startOnLoad: false, theme: 'base', themeVariables: {}, diagramOnHover: false };
    try {
      const raw = (el.getAttribute('data-mermaideyes-config') || '')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'");
      return raw ? JSON.parse(raw) : { startOnLoad: false, theme: 'base', themeVariables: {}, diagramOnHover: false };
    } catch (e) {
      return { startOnLoad: false, theme: 'base', themeVariables: {}, diagramOnHover: false };
    }
  }

  function loadMermaid() {
    return new Promise(function (resolve, reject) {
      if (window.mermaid) {
        resolve(window.mermaid);
        return;
      }
      var s = document.createElement('script');
      s.src = 'https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.min.js';
      s.onload = function () {
        resolve(window.mermaid || reject(new Error('Mermaid não carregou')));
      };
      s.onerror = function () { reject(new Error('Erro ao carregar Mermaid')); };
      document.head.appendChild(s);
    });
  }

  function escapeHtml(str) {
    var d = document.createElement('div');
    d.textContent = str;
    return d.innerHTML;
  }

  function friendlyMessage(msg) {
    if (/no diagram type detected/i.test(msg)) {
      return 'No diagram type detected. Start with graph, flowchart, sequenceDiagram, gantt, pie, etc.';
    }
    return msg;
  }

  var renderCounter = 0;
  function renderDiagrams(mermaid) {
    var nodes = document.querySelectorAll('.mermaideyes-render[data-mermaid-src]');
    nodes.forEach(function (node) {
      if (node.getAttribute('data-mermaideyes-processed') === 'true') return;
      node.setAttribute('data-mermaideyes-processed', 'true');
      var raw = node.getAttribute('data-mermaid-src');
      if (!raw) return;
      var code;
      try {
        var decoded = raw
          .replace(/&quot;/g, '"')
          .replace(/&amp;/g, '&')
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>');
        code = JSON.parse(decoded);
      } catch (e) {
        node.innerHTML = '<p class="mermaideyes-error">' + escapeHtml('Invalid diagram data.') + '</p>';
        return;
      }
      code = (code || '').trim();
      if (!code) {
        node.innerHTML = '<p class="mermaideyes-error">' + escapeHtml('Empty Mermaid block.') + '</p>';
        return;
      }
      var id = 'mermaideyes-' + (renderCounter++) + '-' + Date.now();
      mermaid.render(id, code)
        .then(function (res) {
          node.innerHTML = res.svg || '';
          if (typeof res.bindFunctions === 'function') res.bindFunctions(node);
        })
        .catch(function (err) {
          var msg = (err && err.message) ? err.message : String(err);
          node.innerHTML = '<p class="mermaideyes-error">' + escapeHtml(friendlyMessage(msg)) + '</p>';
        });
    });
  }

  function init() {
    var config = getConfig();
    loadMermaid()
      .then(function (m) {
        m.initialize({
          startOnLoad: false,
          theme: config.theme || 'base',
          themeVariables: config.themeVariables || {}
        });
        setTimeout(function () { renderDiagrams(m); }, 100);
        setTimeout(function () { renderDiagrams(m); }, 500);
        setTimeout(attachHoverClick, 200);
        setTimeout(attachHoverClick, 600);
      })
      .catch(function (e) {
        console.error('[MermaidEyes] Erro ao carregar Mermaid:', e);
      });
  }

  function attachHoverClick() {
    document.querySelectorAll('.mermaideyes-placeholder').forEach(function (ph) {
      if (ph.getAttribute('data-mermaideyes-click') === '1') return;
          ph.setAttribute('data-mermaideyes-click', '1');
          var wrap = ph.closest('.mermaideyes-wrap');
          if (!wrap) return;
          ph.addEventListener('click', function (e) {
            e.preventDefault();
            wrap.classList.toggle('mermaideyes-reveal');
          });
        });
  }

  var observer = new MutationObserver(function (mutations) {
    if (!window.mermaid) return;
    var hasNew = false;
    mutations.forEach(function (m) {
      if (!m.addedNodes || !m.addedNodes.length) return;
      for (var i = 0; i < m.addedNodes.length; i++) {
        var n = m.addedNodes[i];
        if (n.nodeType !== 1) continue;
        if (n.classList && n.classList.contains('mermaideyes-render') && n.getAttribute('data-mermaid-src') && n.getAttribute('data-mermaideyes-processed') !== 'true') {
          hasNew = true;
          break;
        }
        if (n.querySelectorAll) {
          var q = n.querySelectorAll('.mermaideyes-render[data-mermaid-src]');
          for (var j = 0; j < q.length; j++) {
            if (q[j].getAttribute('data-mermaideyes-processed') !== 'true') { hasNew = true; break; }
          }
        }
      }
    });
    if (hasNew) setTimeout(function () { renderDiagrams(window.mermaid); }, 150);
    attachHoverClick();
  });

  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    init();
    if (document.body) observer.observe(document.body, { childList: true, subtree: true });
  } else {
    document.addEventListener('DOMContentLoaded', function () {
      init();
      if (document.body) observer.observe(document.body, { childList: true, subtree: true });
    });
  }
  window.addEventListener('load', init);
  window.mermaideyesInitialized = true;
})();
