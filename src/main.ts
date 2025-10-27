import i18next from './i18n';
import './style.css';
import { PokemonCreator } from './pokemon-creator';
import { switchLanguage } from './utils/language';

// API URL from environment variable
const API_URL = import.meta.env.VITE_API_URL;

// Create Google OAuth SVG icon
function createGoogleIcon(): SVGSVGElement {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.classList.add('google-icon');
  
  const paths = [
    { d: "M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z", fill: "#4285F4" },
    { d: "M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z", fill: "#34A853" },
    { d: "M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z", fill: "#FBBC05" },
    { d: "M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z", fill: "#EA4335" }
  ];
  
  paths.forEach(({ d, fill }) => {
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', d);
    path.setAttribute('fill', fill);
    svg.appendChild(path);
  });
  
  return svg;
}

// Render the landing page with Google OAuth
function renderLandingPage() {
  const app = document.querySelector<HTMLDivElement>('#app')!;
  app.innerHTML = '';
  
  // Create main container
  const container = document.createElement('div');
  container.className = 'min-h-screen flex flex-col';
  
  // Create top section (red)
  const topSection = document.createElement('div');
  topSection.className = 'flex-1 bg-red-600 flex flex-col items-center justify-center p-8 relative';
  
  // Language switcher (top left)
  const langSwitcher = document.createElement('div');
  langSwitcher.className = 'absolute top-4 left-4 flex gap-2';
  langSwitcher.setAttribute('role', 'group');
  langSwitcher.setAttribute('aria-label', 'Language selector');
  
  const languages = [
    { code: 'en', label: 'EN' },
    { code: 'es', label: 'ES' }
  ];
  
  languages.forEach(lang => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'px-3 py-1 text-white border border-white/40 rounded-lg text-sm font-medium cursor-pointer transition-all backdrop-blur-sm focus-visible:outline focus-visible:outline-3 focus-visible:outline-white focus-visible:outline-offset-2';
    btn.textContent = lang.label;
    btn.setAttribute('aria-label', `Switch to ${lang.label === 'EN' ? 'English' : 'Spanish'}`);
    
    // Highlight current language
    if (i18next.language.startsWith(lang.code)) {
      btn.className += ' bg-white/30';
    } else {
      btn.className += ' bg-white/10 hover:bg-white/20';
    }
    
    btn.addEventListener('click', () => switchLanguage(lang.code, renderLandingPage));
    langSwitcher.appendChild(btn);
  });
  
  topSection.appendChild(langSwitcher);
  
  const title = document.createElement('h1');
  title.className = 'text-5xl font-bold text-center mb-4 bg-gradient-to-r from-yellow-400 via-orange-500 to-yellow-400 bg-clip-text text-transparent drop-shadow-[0_2px_8px_rgba(255,215,0,0.4)]';
  title.textContent = i18next.t('landing.title');
  
  const subtitle = document.createElement('p');
  subtitle.className = 'text-xl text-white text-center';
  subtitle.textContent = i18next.t('landing.subtitle');
  
  topSection.appendChild(title);
  topSection.appendChild(subtitle);
  
  // Create middle section (black strip)
  const middleSection = document.createElement('div');
  middleSection.className = 'bg-black flex items-center justify-center py-8 px-4';
  
  const googleButton = document.createElement('a');
  googleButton.href = `${API_URL}/google`;
  googleButton.className = 'inline-flex items-center justify-center gap-3 bg-white text-gray-700 border-2 border-gray-300 px-6 py-3.5 rounded-lg font-medium transition-all duration-200 hover:border-blue-500 hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(66,133,244,0.2)] active:translate-y-0 focus-visible:outline focus-visible:outline-3 focus-visible:outline-blue-500 focus-visible:outline-offset-2 no-underline cursor-pointer';
  
  const googleIcon = createGoogleIcon();
  const buttonText = document.createElement('span');
  buttonText.textContent = i18next.t('landing.googleButton');
  
  googleButton.appendChild(googleIcon);
  googleButton.appendChild(buttonText);
  
  middleSection.appendChild(googleButton);
  
  // Create bottom section (white)
  const bottomSection = document.createElement('div');
  bottomSection.className = 'flex-1 bg-white flex items-center justify-center p-8';
  
  const footerText = document.createElement('p');
  footerText.className = 'text-sm text-gray-400 text-center';
  footerText.textContent = i18next.t('landing.footer');
  
  bottomSection.appendChild(footerText);
  
  // Assemble the page
  container.appendChild(topSection);
  container.appendChild(middleSection);
  container.appendChild(bottomSection);
  
  app.appendChild(container);
}

// Render Pokemon Creator App
function renderPokemonCreator() {
  const app = document.querySelector<HTMLDivElement>('#app')!;
  app.innerHTML = '';
  new PokemonCreator(app);
}

// Check if user is authenticated
async function checkAuth(): Promise<boolean> {
  try {
    const response = await fetch(`${API_URL}/user-profile`, {
      credentials: 'include'
    });
    return response.ok;
  } catch {
    return false;
  }
}

// Initialize the app
async function init() {
  const isAuthenticated = await checkAuth();
  
  if (isAuthenticated) {
    renderPokemonCreator();
  } else {
    renderLandingPage();
  }
}

// Start the app
init();
