import mermaid from 'https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.esm.min.mjs';

const diagrams = Array.from(document.querySelectorAll('pre.mermaid'), (element) => ({
  element,
  source: element.textContent
}));
let pending = Promise.resolve();

function renderDiagrams() {
  pending = pending.then(async () => {
    mermaid.initialize({
      startOnLoad: false,
      theme: document.documentElement.dataset.theme === 'dark' ? 'dark' : 'neutral',
      flowchart: { useMaxWidth: false },
      sequence: { useMaxWidth: false }
    });
    for (const [index, diagram] of diagrams.entries()) {
      try {
        const { svg, bindFunctions } = await mermaid.render(`mermaid-diagram-${index}`, diagram.source);
        diagram.element.innerHTML = svg;
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
