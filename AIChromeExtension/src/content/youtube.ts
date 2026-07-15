// YouTube Shield DOM Filter Logic (Unhook-style AI-free layout blocking)

export function applyYoutubeShield(focusGoal: string) {
  if (!window.location.hostname.includes('youtube.com')) return;

  console.log(`[Oji-San] YouTube Shield Active (Unhook Mode)! screening sections for goal: "${focusGoal}"`);

  // Inject custom styling in the main document to hide recommendations, home feeds, and comments permanently
  const styleId = 'oji-san-unhook-styles';
  let styleElement = document.getElementById(styleId) as HTMLStyleElement;
  
  if (!styleElement) {
    styleElement = document.createElement('style');
    styleElement.id = styleId;
    styleElement.textContent = `
      /* Hide YouTube home feed grid elements */
      ytd-browse[page-subtype="home"] ytd-rich-grid-renderer,
      ytd-browse[page-subtype="home"] #contents,
      ytd-browse[page-subtype="home"] #primary {
        display: none !important;
      }

      /* Hide specific watch page elements (sidebar recommendations & comments section) */
      ytd-watch-flexy #secondary,
      ytd-watch-flexy #related,
      #secondary.ytd-watch-flexy,
      ytd-watch-flexy #comments,
      #comments.ytd-watch-flexy {
        display: none !important;
      }
    `;
    document.head.appendChild(styleElement);
  }

  // Check and handle feed banner rendering
  const applyShield = () => {
    const path = window.location.pathname;

    // Homepage: Inject centered Dojo search banner
    if (path === '/' || path === '') {
      if (!document.getElementById('oji-san-home-banner')) {
        const banner = document.createElement('div');
        banner.id = 'oji-san-home-banner';
        banner.style.cssText = `
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 48px 32px;
          text-align: center;
          font-family: 'Outfit', sans-serif;
          background-color: #1e1e24;
          border: 3px solid #5b403f;
          border-radius: 12px;
          box-shadow: 8px 8px 0px 0px rgba(0,0,0,1);
          max-w-xl;
          margin: 120px auto;
          box-sizing: border-box;
        `;
        banner.innerHTML = `
          <div style="font-size: 48px; margin-bottom: 16px;">⚔️</div>
          <h1 style="font-family: 'Bricolage Grotesque', sans-serif; font-size: 24px; font-weight: 800; color: #fbb400; margin-bottom: 8px; text-transform: uppercase; letter-spacing: -0.01em;">Dojo Focus Mode Active</h1>
          <p style="font-size: 14px; color: #e5e1e4; line-height: 1.5; margin-bottom: 16px;">
            The YouTube home feed, recommendations, and comments are locked by Oji-San.<br>
            Use the search bar above to look for contents related to:<br>
            <strong style="color: #ffb3b1; font-size: 16px;">"${focusGoal}"</strong>
          </p>
          <div style="font-size: 12px; color: #8d99ae; font-style: italic;">"Seek knowledge only, do not wander the gardens of distraction."</div>
        `;
        
        // Append banner to ytd-browse wrapper
        const browseContainer = document.querySelector('ytd-browse[page-subtype="home"]');
        if (browseContainer) {
          browseContainer.appendChild(banner);
        }
      }
    } else {
      // If navigated away from home, remove banner
      const banner = document.getElementById('oji-san-home-banner');
      if (banner) banner.remove();
    }
  };

  // Run immediately
  applyShield();

  // Listen to YouTube's SPA transitions to re-apply the filter
  document.addEventListener('yt-navigate-finish', applyShield);
}
