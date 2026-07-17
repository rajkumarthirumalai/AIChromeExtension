// Shadow DOM configuration and mounting targets isolation

export interface ShadowDOMContainer {
  rootContainer: HTMLDivElement;
  appContainer: HTMLDivElement;
  cleanup: () => void;
}

export function createShadowContainer(styleText: string): ShadowDOMContainer {
  // Create overlay host container
  const rootContainer = document.createElement('div');
  rootContainer.id = 'oji-san-intervention-root';
  rootContainer.style.position = 'fixed';
  rootContainer.style.top = '0';
  rootContainer.style.left = '0';
  rootContainer.style.width = '100vw';
  rootContainer.style.height = '100vh';
  rootContainer.style.zIndex = '99999999';
  rootContainer.style.pointerEvents = 'none';
  document.body.appendChild(rootContainer);

  // Attach Shadow DOM for style isolation
  const shadowRoot = rootContainer.attachShadow({ mode: 'open' });

  // Load Bricolage & Outfit fonts inside the Shadow DOM (if browser CSP allows it)
  const fontLink = document.createElement('link');
  fontLink.rel = 'stylesheet';
  fontLink.href = 'https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,700;12..96,800&family=Outfit:wght@400&display=swap';
  shadowRoot.appendChild(fontLink);

  // Inject Tailwind CSS compiles inline
  const style = document.createElement('style');
  style.id = 'oji-san-tailwind-styles';
  style.textContent = `
    ${styleText}
    
    /* Reset styles to guard against page overrides */
    .oji-san-wrapper, .oji-san-wrapper * {
      box-sizing: border-box !important;
      margin: 0;
      padding: 0;
      font-family: 'Outfit', sans-serif;
    }
    .oji-san-wrapper button {
      cursor: pointer;
      outline: none;
    }
  `;
  shadowRoot.appendChild(style);

  // Create React mount target inside Shadow DOM
  const appContainer = document.createElement('div');
  appContainer.className = 'oji-san-wrapper w-full h-full';
  appContainer.style.pointerEvents = 'auto'; // Re-enable clicks inside the card
  shadowRoot.appendChild(appContainer);

  const cleanup = () => {
    rootContainer.remove();
  };

  return {
    rootContainer,
    appContainer,
    cleanup
  };
}
