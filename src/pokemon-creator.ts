import i18next from './i18n';
import './style.css';
import { switchLanguage } from './utils/language';

// API URL from environment variable
const API_URL = import.meta.env.VITE_API_URL;

// Types
interface Pokemon {
  id: string;
  name: string;
  animalTypes: string[];
  abilities: string[];
  imageUrl?: string;
  createdAt: Date;
}

// Available options
const ANIMAL_TYPES = [
  'Dragon', 'Cat', 'Dog', 'Bird', 'Fish', 'Snake', 
  'Tiger', 'Bear', 'Wolf', 'Fox', 'Rabbit', 'Mouse'
];

const ABILITIES = [
  'Fire', 'Water', 'Electric', 'Grass', 'Ice', 'Flying',
  'Psychic', 'Dark', 'Steel', 'Ghost', 'Dragon', 'Fairy'
];

export class PokemonCreator {
  private container: HTMLElement;
  private selectedAnimals: Set<string> = new Set();
  private selectedAbilities: Set<string> = new Set();
  private generatedPokemons: Pokemon[] = [];
  private isGenerating: boolean = false;
  private backgroundElement: HTMLElement | null = null;

  constructor(container: HTMLElement) {
    this.container = container;
    this.render();
  }

  destroy() {
    // Clean up background when component is destroyed
    if (this.backgroundElement && this.backgroundElement.parentNode) {
      this.backgroundElement.parentNode.removeChild(this.backgroundElement);
    }
  }

  private render() {
    this.container.innerHTML = '';
    
    // Remove any existing background
    const existingBg = document.getElementById('pokeball-bg');
    if (existingBg) {
      existingBg.remove();
    }
    
    // Pokeball background (fixed position, applied to body)
    this.backgroundElement = document.createElement('div');
    this.backgroundElement.id = 'pokeball-bg';
    this.backgroundElement.className = 'fixed inset-0 -z-10 pointer-events-none';
    this.backgroundElement.style.cssText = 'background: linear-gradient(to bottom, #DC2626 0%, #DC2626 45%, #000000 45%, #000000 55%, #FFFFFF 55%, #FFFFFF 100%); opacity: 0.8;';
    document.body.appendChild(this.backgroundElement);
    
    // Skip link for keyboard navigation
    const skipLink = document.createElement('a');
    skipLink.href = '#main-content';
    skipLink.className = 'sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-white focus:text-gray-900 focus:rounded-lg focus:shadow-lg';
    skipLink.textContent = i18next.t('aria.skipLink');
    
    // Main container
    const main = document.createElement('main');
    main.id = 'main-content';
    main.className = 'min-h-screen relative p-4 sm:p-8';
    main.setAttribute('role', 'main');
    main.setAttribute('aria-label', i18next.t('aria.main'));

    // Header
    const header = this.createHeader();
    
    // Creator form
    const creatorSection = this.createCreatorSection();
    
    // Gallery
    const gallerySection = this.createGallerySection();

    this.container.appendChild(skipLink);
    main.appendChild(header);
    main.appendChild(creatorSection);
    main.appendChild(gallerySection);
    
    this.container.appendChild(main);
  }

  private createHeader(): HTMLElement {
    const header = document.createElement('header');
    header.className = 'text-center py-8 px-4 text-white relative';
    
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
      
      btn.addEventListener('click', () => switchLanguage(lang.code, () => {
        this.container.innerHTML = '';
        this.render();
      }));
      langSwitcher.appendChild(btn);
    });
    
    // Logout button (top right)
    const logoutBtn = document.createElement('button');
    logoutBtn.type = 'button';
    logoutBtn.className = 'absolute top-4 right-4 px-4 py-2 bg-white/20 hover:bg-white/30 text-white border border-white/40 rounded-lg text-sm font-medium cursor-pointer transition-all backdrop-blur-sm focus-visible:outline focus-visible:outline-3 focus-visible:outline-white focus-visible:outline-offset-2';
    logoutBtn.textContent = i18next.t('header.logout');
    logoutBtn.setAttribute('aria-label', i18next.t('aria.logoutButton'));
    logoutBtn.addEventListener('click', () => this.handleLogout());
    
    const title = document.createElement('h1');
    title.className = 'text-3xl sm:text-4xl font-bold mb-2';
    title.textContent = i18next.t('header.title');
    
    const subtitle = document.createElement('p');
    subtitle.className = 'text-base opacity-90';
    subtitle.textContent = i18next.t('header.subtitle');
    
    header.appendChild(langSwitcher);
    header.appendChild(logoutBtn);
    header.appendChild(title);
    header.appendChild(subtitle);
    
    return header;
  }

  private createCreatorSection(): HTMLElement {
    const section = document.createElement('section');
    section.className = 'bg-white rounded-xl p-4 sm:p-6 mb-6 shadow-md max-w-2xl mx-auto';
    section.setAttribute('aria-labelledby', 'creator-heading');
    
    const heading = document.createElement('h2');
    heading.id = 'creator-heading';
    heading.className = 'text-xl font-bold mb-4 text-gray-800';
    heading.textContent = i18next.t('form.heading');
    
    // Name input
    const nameGroup = this.createNameInput();
    
    // Description input
    const descriptionGroup = this.createDescriptionInput();
    
    // Animal types selector
    const animalGroup = this.createAnimalTypeSelector();
    
    // Abilities selector
    const abilityGroup = this.createAbilitySelector();
    
    // Generate button
    const generateBtn = this.createGenerateButton();
    
    section.appendChild(heading);
    section.appendChild(nameGroup);
    section.appendChild(descriptionGroup);
    section.appendChild(animalGroup);
    section.appendChild(abilityGroup);
    section.appendChild(generateBtn);
    
    return section;
  }

  private createNameInput(): HTMLElement {
    const group = document.createElement('div');
    group.className = 'mb-4';
    
    const label = document.createElement('label');
    label.htmlFor = 'pokemon-name';
    label.className = 'block font-semibold mb-2 text-gray-700 text-sm';
    label.textContent = i18next.t('form.name');
    
    const input = document.createElement('input');
    input.type = 'text';
    input.id = 'pokemon-name';
    input.className = 'w-full px-3 py-2.5 border-2 border-gray-300 rounded-lg text-base transition-colors focus:outline-none focus:border-red-600 focus:ring-4 focus:ring-red-600/10';
    input.placeholder = i18next.t('form.namePlaceholder');
    input.setAttribute('aria-required', 'true');
    input.maxLength = 20;
    
    group.appendChild(label);
    group.appendChild(input);
    
    return group;
  }

  private createDescriptionInput(): HTMLElement {
    const group = document.createElement('div');
    group.className = 'mb-4';
    
    const label = document.createElement('label');
    label.htmlFor = 'pokemon-description';
    label.className = 'block font-semibold mb-2 text-gray-700 text-sm';
    label.textContent = i18next.t('form.description');
    
    const textarea = document.createElement('textarea');
    textarea.id = 'pokemon-description';
    textarea.className = 'w-full px-3 py-2.5 border-2 border-gray-300 rounded-lg text-base transition-colors focus:outline-none focus:border-red-600 focus:ring-4 focus:ring-red-600/10 resize-y min-h-[80px]';
    textarea.placeholder = i18next.t('form.descriptionPlaceholder');
    textarea.maxLength = 200;
    textarea.rows = 3;
    
    group.appendChild(label);
    group.appendChild(textarea);
    
    return group;
  }

  private createAnimalTypeSelector(): HTMLElement {
    return this.createMultiSelect({
      id: 'animal-types',
      label: i18next.t('form.animalTypes', { max: 2 }),
      options: ANIMAL_TYPES,
      maxSelections: 2,
      onSelectionChange: (selected) => {
        this.selectedAnimals.clear();
        selected.forEach(animal => this.selectedAnimals.add(animal));
      }
    });
  }

  private createAbilitySelector(): HTMLElement {
    return this.createMultiSelect({
      id: 'abilities',
      label: i18next.t('form.abilities', { max: 3 }),
      options: ABILITIES,
      maxSelections: 3,
      onSelectionChange: (selected) => {
        this.selectedAbilities.clear();
        selected.forEach(ability => this.selectedAbilities.add(ability));
      }
    });
  }

  private createMultiSelect(config: {
    id: string;
    label: string;
    options: string[];
    maxSelections: number;
    onSelectionChange: (selected: string[]) => void;
  }): HTMLElement {
    const group = document.createElement('div');
    group.className = 'mb-4';
    
    const label = document.createElement('label');
    label.htmlFor = config.id;
    label.className = 'block font-semibold mb-2 text-gray-700 text-sm';
    label.textContent = config.label;
    
    const select = document.createElement('select');
    select.id = config.id;
    select.className = 'w-full px-3 py-2.5 border-2 border-gray-300 rounded-lg text-base transition-colors focus:outline-none focus:border-red-600 focus:ring-4 focus:ring-red-600/10 bg-white';
    select.multiple = true;
    select.size = 4;
    select.setAttribute('aria-label', `${config.label} selection`);
    
    config.options.forEach(option => {
      const optionEl = document.createElement('option');
      optionEl.value = option;
      optionEl.textContent = option;
      select.appendChild(optionEl);
    });
    
    select.addEventListener('change', () => {
      const selectedOptions = Array.from(select.selectedOptions).map(opt => opt.value);
      
      if (selectedOptions.length > config.maxSelections) {
        select.options[select.selectedIndex].selected = false;
        const messageKey = config.id === 'animal-types' ? 'validation.maxAnimals' : 'validation.maxAbilities';
        this.showToast(i18next.t(messageKey, { max: config.maxSelections }));
      }
      
      config.onSelectionChange(selectedOptions.slice(0, config.maxSelections));
    });
    
    group.appendChild(label);
    group.appendChild(select);
    
    return group;
  }

  private createGenerateButton(): HTMLElement {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'w-full px-4 py-3 bg-red-600 text-white border-none rounded-lg text-base font-semibold cursor-pointer transition-all shadow-md hover:bg-red-700 hover:-translate-y-0.5 hover:shadow-lg focus-visible:outline focus-visible:outline-3 focus-visible:outline-red-600 focus-visible:outline-offset-2 active:translate-y-0 disabled:opacity-60 disabled:cursor-not-allowed';
    button.id = 'generate-btn';
    button.textContent = i18next.t('form.generate');
    button.setAttribute('aria-label', i18next.t('aria.generateButton'));
    
    button.addEventListener('click', () => this.generatePokemon());
    
    return button;
  }

  private createGallerySection(): HTMLElement {
    const section = document.createElement('section');
    section.className = 'bg-white rounded-xl p-4 sm:p-6 mb-6 shadow-md max-w-6xl mx-auto';
    section.id = 'pokemon-gallery';
    section.setAttribute('aria-labelledby', 'gallery-heading');
    section.setAttribute('aria-live', 'polite');
    
    const heading = document.createElement('h2');
    heading.id = 'gallery-heading';
    heading.className = 'text-xl font-bold mb-4 text-gray-800';
    heading.textContent = i18next.t('gallery.heading');
    
    const gallery = document.createElement('div');
    gallery.className = 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4';
    gallery.id = 'gallery-content';
    
    section.appendChild(heading);
    section.appendChild(gallery);
    
    return section;
  }

  private async generatePokemon() {
    if (this.isGenerating) return;
    
    const nameInput = document.getElementById('pokemon-name') as HTMLInputElement;
    const descriptionInput = document.getElementById('pokemon-description') as HTMLTextAreaElement;
    const name = nameInput?.value.trim();
    const description = descriptionInput?.value.trim();
    
    // Validation
    if (!name) {
      this.showToast(i18next.t('validation.nameRequired'));
      nameInput?.focus();
      return;
    }
    
    if (this.selectedAnimals.size === 0) {
      this.showToast(i18next.t('validation.selectAnimalType'));
      return;
    }
    
    if (this.selectedAbilities.size === 0) {
      this.showToast(i18next.t('validation.selectAbility'));
      return;
    }
    
    this.isGenerating = true;
    const generateBtn = document.getElementById('generate-btn') as HTMLButtonElement;
    generateBtn.disabled = true;
    generateBtn.textContent = i18next.t('form.generating');
    generateBtn.setAttribute('aria-busy', 'true');
    
    try {
      // Create Pokemon object
      const pokemon: Pokemon = {
        id: Date.now().toString(),
        name,
        animalTypes: Array.from(this.selectedAnimals),
        abilities: Array.from(this.selectedAbilities),
        createdAt: new Date()
      };
      
      // Generate image via API
      const response = await fetch(`${API_URL}/generate-pokemon`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          name: pokemon.name,
          description: description,
          animalTypes: pokemon.animalTypes,
          abilities: pokemon.abilities
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to generate Pokemon image');
      }
      
      const data = await response.json();
      pokemon.imageUrl = data.imageUrl;
      
      // Add to gallery
      this.generatedPokemons.unshift(pokemon);
      this.updateGallery();
      
      // Reset form
      this.resetForm();
      
      // Announce success
      this.showToast(i18next.t('messages.created', { name }));
      
      // Scroll to gallery
      document.getElementById('pokemon-gallery')?.scrollIntoView({ behavior: 'smooth' });
      
    } catch (error) {
      console.error('Error generating Pokemon:', error);
      this.showToast(i18next.t('messages.generationFailed'));
    } finally {
      this.isGenerating = false;
      generateBtn.disabled = false;
      generateBtn.textContent = i18next.t('form.generate');
      generateBtn.setAttribute('aria-busy', 'false');
    }
  }

  private updateGallery() {
    const gallery = document.getElementById('gallery-content');
    if (!gallery) return;
    
    gallery.innerHTML = '';
    
    if (this.generatedPokemons.length === 0) {
      const emptyState = document.createElement('p');
      emptyState.className = 'text-center text-gray-600 py-8 italic col-span-full';
      emptyState.textContent = i18next.t('gallery.empty');
      gallery.appendChild(emptyState);
      return;
    }
    
    this.generatedPokemons.forEach(pokemon => {
      const card = this.createPokemonCard(pokemon);
      gallery.appendChild(card);
    });
  }

  private createPokemonCard(pokemon: Pokemon): HTMLElement {
    const card = document.createElement('article');
    card.className = 'bg-gray-50 rounded-xl overflow-hidden shadow-sm transition-transform hover:-translate-y-1 hover:shadow-md';
    card.setAttribute('aria-label', i18next.t('aria.pokemonCard', { name: pokemon.name }));
    
    // Image container
    const imageContainer = document.createElement('div');
    imageContainer.className = 'w-full aspect-square bg-gradient-to-br from-red-600 to-red-700 flex items-center justify-center overflow-hidden';
    
    if (pokemon.imageUrl) {
      const img = document.createElement('img');
      img.src = pokemon.imageUrl;
      img.alt = i18next.t('gallery.imageAlt', { name: pokemon.name, types: pokemon.animalTypes.join(' and ') });
      img.className = 'w-full h-full object-cover';
      imageContainer.appendChild(img);
    } else {
      const placeholder = document.createElement('div');
      placeholder.className = 'text-6xl';
      placeholder.textContent = '🎨';
      imageContainer.appendChild(placeholder);
    }
    
    // Info
    const info = document.createElement('div');
    info.className = 'p-4';
    
    const name = document.createElement('h3');
    name.className = 'text-xl font-bold mb-2 text-gray-800';
    name.textContent = pokemon.name;
    
    const types = document.createElement('p');
    types.className = 'text-sm text-gray-600 mb-1';
    types.textContent = `${i18next.t('gallery.types')}: ${pokemon.animalTypes.join(', ')}`;
    
    const abilities = document.createElement('p');
    abilities.className = 'text-sm text-gray-600 mb-1';
    abilities.textContent = `${i18next.t('gallery.abilities')}: ${pokemon.abilities.join(', ')}`;
    
    // Button container
    const buttonContainer = document.createElement('div');
    buttonContainer.className = 'flex gap-2 mt-3';
    
    // Download button
    const downloadBtn = document.createElement('button');
    downloadBtn.type = 'button';
    downloadBtn.className = 'flex-1 px-2.5 py-2.5 bg-red-600 text-white border-none rounded-md text-sm font-medium cursor-pointer transition-all hover:bg-red-700 focus-visible:outline focus-visible:outline-3 focus-visible:outline-red-600 focus-visible:outline-offset-2';
    downloadBtn.textContent = i18next.t('gallery.download');
    downloadBtn.setAttribute('aria-label', i18next.t('aria.downloadButton', { name: pokemon.name }));
    downloadBtn.addEventListener('click', () => this.downloadPokemon(pokemon));
    
    // Share button
    const shareBtn = document.createElement('button');
    shareBtn.type = 'button';
    shareBtn.className = 'flex-1 px-2.5 py-2.5 bg-blue-600 text-white border-none rounded-md text-sm font-medium cursor-pointer transition-all hover:bg-blue-700 focus-visible:outline focus-visible:outline-3 focus-visible:outline-blue-600 focus-visible:outline-offset-2';
    shareBtn.textContent = i18next.t('gallery.copyLink');
    shareBtn.setAttribute('aria-label', i18next.t('aria.copyButton', { name: pokemon.name }));
    shareBtn.addEventListener('click', () => this.copyImageLink(pokemon));
    
    buttonContainer.appendChild(downloadBtn);
    buttonContainer.appendChild(shareBtn);
    
    info.appendChild(name);
    info.appendChild(types);
    info.appendChild(abilities);
    info.appendChild(buttonContainer);
    
    card.appendChild(imageContainer);
    card.appendChild(info);
    
    return card;
  }

  private async downloadPokemon(pokemon: Pokemon) {
    if (!pokemon.imageUrl) return;
    
    try {
      // Download image
      const response = await fetch(pokemon.imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `${pokemon.name.toLowerCase().replace(/\s+/g, '-')}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      this.showToast(i18next.t('messages.downloaded', { name: pokemon.name }));
    } catch (error) {
      console.error('Error downloading image:', error);
      this.showToast(i18next.t('messages.downloadFailed'));
    }
  }

  private async copyImageLink(pokemon: Pokemon) {
    if (!pokemon.imageUrl) return;
    
    try {
      await navigator.clipboard.writeText(pokemon.imageUrl);
      this.showToast(i18next.t('messages.linkCopied'));
    } catch (error) {
      console.error('Error copying to clipboard:', error);
      this.showToast(i18next.t('messages.copyFailed'));
    }
  }

  private resetForm() {
    const nameInput = document.getElementById('pokemon-name') as HTMLInputElement;
    const descriptionInput = document.getElementById('pokemon-description') as HTMLTextAreaElement;
    const animalSelect = document.getElementById('animal-types') as HTMLSelectElement;
    const abilitySelect = document.getElementById('abilities') as HTMLSelectElement;
    
    if (nameInput) nameInput.value = '';
    if (descriptionInput) descriptionInput.value = '';
    if (animalSelect) animalSelect.selectedIndex = -1;
    if (abilitySelect) abilitySelect.selectedIndex = -1;
    
    this.selectedAnimals.clear();
    this.selectedAbilities.clear();
  }

  private async handleLogout() {
    try {
      const response = await fetch(`${API_URL}/logout`, {
        method: 'POST',
        credentials: 'include'
      });
      
      if (response.ok) {
        // Clean up the component
        this.destroy();
        // Reload the page to show landing page
        window.location.reload();
      } else {
        this.showToast(i18next.t('messages.logoutFailed'));
      }
    } catch (error) {
      console.error('Logout error:', error);
      this.showToast(i18next.t('messages.logoutFailed'));
    }
  }

  private showToast(message: string) {
    // Remove existing toast
    const existingToast = document.getElementById('toast');
    if (existingToast) {
      existingToast.remove();
    }
    
    const toast = document.createElement('div');
    toast.id = 'toast';
    toast.className = 'fixed bottom-8 left-1/2 -translate-x-1/2 translate-y-24 bg-gray-800 text-white px-6 py-4 rounded-lg shadow-lg z-[1000] opacity-0 transition-all duration-300 max-w-[90%] text-center';
    toast.textContent = message;
    toast.setAttribute('role', 'status');
    toast.setAttribute('aria-live', 'polite');
    
    document.body.appendChild(toast);
    
    // Trigger animation
    setTimeout(() => {
      toast.className = 'fixed bottom-8 left-1/2 -translate-x-1/2 translate-y-0 bg-gray-800 text-white px-6 py-4 rounded-lg shadow-lg z-[1000] opacity-100 transition-all duration-300 max-w-[90%] text-center';
    }, 100);
    
    // Remove after 3 seconds
    setTimeout(() => {
      toast.className = 'fixed bottom-8 left-1/2 -translate-x-1/2 translate-y-24 bg-gray-800 text-white px-6 py-4 rounded-lg shadow-lg z-[1000] opacity-0 transition-all duration-300 max-w-[90%] text-center';
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }
}
