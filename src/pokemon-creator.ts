import './style.css';

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
    
    // Main container
    const main = document.createElement('main');
    main.className = 'min-h-screen relative p-4 sm:p-8';
    main.setAttribute('role', 'main');
    main.setAttribute('aria-label', 'Pokemon Creator Application');

    // Header
    const header = this.createHeader();
    
    // Creator form
    const creatorSection = this.createCreatorSection();
    
    // Gallery
    const gallerySection = this.createGallerySection();

    main.appendChild(header);
    main.appendChild(creatorSection);
    main.appendChild(gallerySection);
    
    this.container.appendChild(main);
  }

  private createHeader(): HTMLElement {
    const header = document.createElement('header');
    header.className = 'text-center py-8 px-4 text-white';
    
    const title = document.createElement('h1');
    title.className = 'text-3xl sm:text-4xl font-bold mb-2';
    title.textContent = 'Create Your Pokémon';
    
    const subtitle = document.createElement('p');
    subtitle.className = 'text-base opacity-90';
    subtitle.textContent = 'Mix animals and abilities to generate unique creatures!';
    
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
    heading.textContent = 'Design Your Pokémon';
    
    // Name input
    const nameGroup = this.createNameInput();
    
    // Animal types selector
    const animalGroup = this.createAnimalTypeSelector();
    
    // Abilities selector
    const abilityGroup = this.createAbilitySelector();
    
    // Generate button
    const generateBtn = this.createGenerateButton();
    
    section.appendChild(heading);
    section.appendChild(nameGroup);
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
    label.textContent = 'Pokémon Name';
    
    const input = document.createElement('input');
    input.type = 'text';
    input.id = 'pokemon-name';
    input.className = 'w-full px-3 py-2.5 border-2 border-gray-300 rounded-lg text-base transition-colors focus:outline-none focus:border-red-600 focus:ring-4 focus:ring-red-600/10';
    input.placeholder = 'Enter a cool name...';
    input.setAttribute('aria-required', 'true');
    input.maxLength = 20;
    
    group.appendChild(label);
    group.appendChild(input);
    
    return group;
  }

  private createAnimalTypeSelector(): HTMLElement {
    return this.createMultiSelect({
      id: 'animal-types',
      label: 'Animal Types (select up to 2)',
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
      label: 'Abilities (select up to 3)',
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
        this.showToast(`Maximum ${config.maxSelections} ${config.id === 'animal-types' ? 'animal types' : 'abilities'} allowed`);
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
    button.textContent = 'Generate Pokémon';
    button.setAttribute('aria-label', 'Generate your custom Pokémon');
    
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
    heading.textContent = 'Your Pokémon';
    
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
    const name = nameInput?.value.trim();
    
    // Validation
    if (!name) {
      this.showToast('Please enter a name for your Pokémon');
      nameInput?.focus();
      return;
    }
    
    if (this.selectedAnimals.size === 0) {
      this.showToast('Please select at least one animal type');
      return;
    }
    
    if (this.selectedAbilities.size === 0) {
      this.showToast('Please select at least one ability');
      return;
    }
    
    this.isGenerating = true;
    const generateBtn = document.getElementById('generate-btn') as HTMLButtonElement;
    generateBtn.disabled = true;
    generateBtn.textContent = 'Generating...';
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
      const response = await fetch('http://localhost:3000/api/generate-pokemon', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          name: pokemon.name,
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
      this.showToast(`${name} has been created!`);
      
      // Scroll to gallery
      document.getElementById('pokemon-gallery')?.scrollIntoView({ behavior: 'smooth' });
      
    } catch (error) {
      console.error('Error generating Pokemon:', error);
      this.showToast('Failed to generate Pokémon. Please try again.');
    } finally {
      this.isGenerating = false;
      generateBtn.disabled = false;
      generateBtn.textContent = 'Generate Pokémon';
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
      emptyState.textContent = 'No Pokémon created yet. Start designing above!';
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
    card.setAttribute('aria-label', `${pokemon.name} Pokémon card`);
    
    // Image container
    const imageContainer = document.createElement('div');
    imageContainer.className = 'w-full aspect-square bg-gradient-to-br from-red-600 to-red-700 flex items-center justify-center overflow-hidden';
    
    if (pokemon.imageUrl) {
      const img = document.createElement('img');
      img.src = pokemon.imageUrl;
      img.alt = `Generated image of ${pokemon.name}, a Pokémon combining ${pokemon.animalTypes.join(' and ')}`;
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
    types.textContent = `Types: ${pokemon.animalTypes.join(', ')}`;
    
    const abilities = document.createElement('p');
    abilities.className = 'text-sm text-gray-600 mb-1';
    abilities.textContent = `Abilities: ${pokemon.abilities.join(', ')}`;
    
    // Share button
    const shareBtn = document.createElement('button');
    shareBtn.type = 'button';
    shareBtn.className = 'w-full mt-3 px-2.5 py-2.5 bg-red-600 text-white border-none rounded-md text-sm font-medium cursor-pointer transition-all hover:bg-red-700 focus-visible:outline focus-visible:outline-3 focus-visible:outline-red-600 focus-visible:outline-offset-2';
    shareBtn.textContent = 'Download Image';
    shareBtn.setAttribute('aria-label', `Download image of ${pokemon.name}`);
    shareBtn.addEventListener('click', () => this.sharePokemon(pokemon));
    
    info.appendChild(name);
    info.appendChild(types);
    info.appendChild(abilities);
    info.appendChild(shareBtn);
    
    card.appendChild(imageContainer);
    card.appendChild(info);
    
    return card;
  }

  private async sharePokemon(pokemon: Pokemon) {
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
      
      this.showToast(`${pokemon.name} image downloaded!`);
    } catch (error) {
      console.error('Error downloading image:', error);
      this.showToast('Failed to download image');
    }
  }

  private resetForm() {
    const nameInput = document.getElementById('pokemon-name') as HTMLInputElement;
    const animalSelect = document.getElementById('animal-types') as HTMLSelectElement;
    const abilitySelect = document.getElementById('abilities') as HTMLSelectElement;
    
    if (nameInput) nameInput.value = '';
    if (animalSelect) animalSelect.selectedIndex = -1;
    if (abilitySelect) abilitySelect.selectedIndex = -1;
    
    this.selectedAnimals.clear();
    this.selectedAbilities.clear();
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
