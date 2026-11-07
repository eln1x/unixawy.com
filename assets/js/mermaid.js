import mermaid from 'https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.esm.min.mjs';

const diagrams = Array.from(document.querySelectorAll('.mermaid-container'), (container) => ({
  container,
  element: container.querySelector('pre.mermaid'),
  controls: container.querySelector('.mermaid-toolbar'),
  source: container.querySelector('pre.mermaid').textContent,
  zoom: 1
}));
let pending = Promise.resolve();

function updateZoom(diagram) {
  const svg = diagram.element.querySelector('svg');
  if (svg) {
    svg.style.width = `${diagram.zoom * 100}%`;
    svg.style.maxWidth = 'none';
    svg.style.height = 'auto';
  }
  diagram.controls.querySelector('.mermaid-zoom-level').textContent = `${Math.round(diagram.zoom * 100)}%`;
}

for (const diagram of diagrams) {
  diagram.controls.querySelectorAll('button[data-mermaid-action]').forEach((button) => {
    button.addEventListener('click', async () => {
      switch (button.dataset.mermaidAction) {
        case 'zoom-out':
          diagram.zoom = Math.max(0.5, diagram.zoom - 0.25);
          updateZoom(diagram);
          break;
        case 'zoom-in':
          diagram.zoom = Math.min(4, diagram.zoom + 0.25);
          updateZoom(diagram);
          break;
        case 'reset':
          diagram.zoom = 1;
          updateZoom(diagram);
          break;
        case 'fullscreen':
          try {
            if (document.fullscreenElement === diagram.container) {
              await document.exitFullscreen();
            } else {
              await diagram.container.requestFullscreen();
            }
          } catch (error) {
            diagram.controls.querySelector('.mermaid-status').textContent = 'Full screen is unavailable.';
            console.error('Failed to toggle Mermaid diagram fullscreen:', error);
          }
          break;
      }
    });
  });

  document.addEventListener('fullscreenchange', () => {
    const fullscreenButton = diagram.controls.querySelector('[data-mermaid-action="fullscreen"]');
    const isFullscreen = document.fullscreenElement === diagram.container;
    fullscreenButton.textContent = isFullscreen ? 'Exit full screen' : 'Full screen';
    fullscreenButton.setAttribute('aria-label', isFullscreen ? 'Exit full screen' : 'View diagram full screen');
    diagram.controls.querySelector('.mermaid-status').textContent = '';
  });
}

function renderDiagrams() {
  pending = pending.then(async () => {
    mermaid.initialize({
      startOnLoad: false,
      theme: document.documentElement.dataset.theme === 'dark' ? 'dark' : 'neutral',
      flowchart: { useMaxWidth: true },
      sequence: { useMaxWidth: true }
    });
    for (const [index, diagram] of diagrams.entries()) {
      try {
        const { svg, bindFunctions } = await mermaid.render(`mermaid-diagram-${index}`, diagram.source);
        diagram.element.innerHTML = svg;
        updateZoom(diagram);
        if (bindFunctions) bindFunctions(diagram.element);
      } catch (error) {
        diagram.element.textContent = diagram.source;
        console.error('Failed to render Mermaid diagram:', error);
      }
    }
  });
}

renderDiagrams();
new MutationObserver(renderDiagrams).observe(document.documentElement, {
  attributes: true,
  attributeFilter: ['data-theme']
});
