// Script de inicialização do Mermaid para MermaidLens
// Este script é carregado automaticamente pelo VS Code no preview do Markdown

(function() {
  'use strict';
  
  // Evita múltiplas inicializações
  if (window.mermaidlensInitialized) {
    return;
  }
  
  // Função para obter configuração do tema
  function getMermaidConfig() {
    // Tenta obter do elemento data attribute ou usa padrão
    const configElement = document.querySelector('[data-mermaidlens-config]');
    if (configElement) {
      try {
        const configAttr = configElement.getAttribute('data-mermaidlens-config');
        if (configAttr) {
          // Decodifica entidades HTML
          const decoded = configAttr
            .replace(/&amp;/g, '&')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&quot;/g, '"')
            .replace(/&#39;/g, "'");
          return JSON.parse(decoded);
        }
      } catch (e) {
        console.warn('[MermaidLens] Erro ao parsear configuração:', e);
      }
    }
    
    // Configuração padrão
    return {
      startOnLoad: false,
      theme: 'base',
      themeVariables: {}
    };
  }
  
  // Função para carregar Mermaid do CDN
  function loadMermaid() {
    return new Promise((resolve, reject) => {
      if (window.mermaid) {
        resolve(window.mermaid);
        return;
      }
      
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.min.js';
      script.onload = () => {
        if (window.mermaid) {
          resolve(window.mermaid);
        } else {
          reject(new Error('Mermaid não foi carregado'));
        }
      };
      script.onerror = () => reject(new Error('Erro ao carregar Mermaid'));
      document.head.appendChild(script);
    });
  }
  
  // Função para inicializar e renderizar diagramas
  function initMermaid() {
    const config = getMermaidConfig();
    
    loadMermaid()
      .then((mermaid) => {
        try {
          mermaid.initialize(config);
          console.log('[MermaidLens] Mermaid inicializado com configuração:', config);
          
          // Função para renderizar diagramas
          const renderDiagrams = () => {
            const diagrams = document.querySelectorAll('.mermaidlens-diagram .mermaid');
            if (diagrams.length > 0) {
              console.log(`[MermaidLens] Encontrados ${diagrams.length} diagrama(s) para renderizar`);
              diagrams.forEach((diagram, index) => {
                try {
                  if (diagram.querySelector('svg')) {
                    console.log(`[MermaidLens] Diagrama ${index + 1} já renderizado, pulando...`);
                    return;
                  }
                  var code = (diagram.textContent || '').trim();
                  if (!code) {
                    console.warn(`[MermaidLens] Diagrama ${index + 1} vazio, pulando.`);
                    return;
                  }
                  mermaid.run({
                    nodes: [diagram],
                    suppressErrors: false
                  }).then(function () {
                    console.log(`[MermaidLens] Diagrama ${index + 1} renderizado com sucesso`);
                  }).catch(function (err) {
                    var msg = (err && err.message) ? err.message : String(err);
                    if (/no diagram type detected/i.test(msg)) {
                      msg = 'No diagram type detected. Start with graph, flowchart, sequenceDiagram, gantt, pie, etc.';
                    }
                    console.error(`[MermaidLens] Erro ao renderizar diagrama ${index + 1}:`, err);
                    diagram.innerHTML = '<p class="mermaidlens-error">' + escapeHtml(msg) + '</p>';
                  });
                } catch (error) {
                  console.error(`[MermaidLens] Erro ao renderizar diagrama ${index + 1}:`, error);
                  diagram.innerHTML = '<p class="mermaidlens-error">' + escapeHtml(String(error)) + '</p>';
                }
              });
            } else {
              console.log('[MermaidLens] Nenhum diagrama encontrado ainda');
            }
          };

          function escapeHtml(s) {
            var d = document.createElement('div');
            d.textContent = s;
            return d.innerHTML;
          }
          
          // Aguarda um pouco para garantir que o DOM está pronto
          setTimeout(renderDiagrams, 300);
          
          // Tenta novamente após mais tempo (caso o DOM ainda não esteja pronto)
          setTimeout(renderDiagrams, 1000);
        } catch (error) {
          console.error('[MermaidLens] Erro ao inicializar Mermaid:', error);
        }
      })
      .catch((error) => {
        console.error('[MermaidLens] Erro ao carregar biblioteca Mermaid:', error);
      });
  }
  
  // Observa mudanças no DOM para renderizar novos diagramas
  function observeMermaidDiagrams() {
    if (!window.mermaid) {
      console.warn('[MermaidLens] Mermaid não está disponível para observer');
      return;
    }
    
    const observer = new MutationObserver((mutations) => {
      const newDiagrams = [];
      
      mutations.forEach((mutation) => {
        if (mutation.addedNodes.length > 0) {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === 1) {
              // Verifica se o nó é um diagrama ou contém diagramas
              if (node.classList?.contains('mermaidlens-diagram')) {
                const mermaidEl = node.querySelector('.mermaid');
                if (mermaidEl && !mermaidEl.querySelector('svg')) {
                  newDiagrams.push(mermaidEl);
                }
              } else if (node.querySelector) {
                const diagrams = node.querySelectorAll('.mermaidlens-diagram .mermaid');
                diagrams.forEach((diagram) => {
                  if (!diagram.querySelector('svg')) {
                    newDiagrams.push(diagram);
                  }
                });
              }
            }
          });
        }
      });
      
      if (newDiagrams.length > 0) {
        console.log(`[MermaidLens] Observer detectou ${newDiagrams.length} novo(s) diagrama(s)`);
        setTimeout(function () {
          newDiagrams.forEach(function (diagram) {
            var code = (diagram.textContent || '').trim();
            if (!code) return;
            window.mermaid.run({ nodes: [diagram], suppressErrors: false })
              .catch(function (err) {
                var msg = (err && err.message) ? err.message : String(err);
                if (/no diagram type detected/i.test(msg)) {
                  msg = 'No diagram type detected. Start with graph, flowchart, sequenceDiagram, gantt, pie, etc.';
                }
                console.error('[MermaidLens] Erro ao renderizar diagrama via observer:', err);
                var d = document.createElement('div');
                d.textContent = msg;
                diagram.innerHTML = '<p class="mermaidlens-error">' + d.innerHTML + '</p>';
              });
          });
        }, 200);
      }
    });
    
    // Observa mudanças no body e em toda a árvore DOM
    if (document.body) {
      observer.observe(document.body, {
        childList: true,
        subtree: true
      });
      console.log('[MermaidLens] Observer de diagramas ativado');
    } else {
      // Se body ainda não existe, aguarda
      setTimeout(() => {
        if (document.body) {
          observer.observe(document.body, {
            childList: true,
            subtree: true
          });
        }
      }, 100);
    }
  }
  
  // Inicializa quando o DOM estiver pronto
  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    initMermaid();
    observeMermaidDiagrams();
  } else {
    document.addEventListener('DOMContentLoaded', () => {
      initMermaid();
      observeMermaidDiagrams();
    });
    window.addEventListener('load', () => {
      initMermaid();
    });
  }
  
  window.mermaidlensInitialized = true;
})();
