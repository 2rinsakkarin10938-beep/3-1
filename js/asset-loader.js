const IMAGE_MANIFEST = {
  warrior: "./assets/sprites/warrior.png",
  mage: "./assets/sprites/mage.png",
  rogue: "./assets/sprites/rogue.png",
  tileset: "./assets/tiles/tileset.png",
  skillIcons: "./assets/ui/skill-icons.png",
};

function loadImage(src) {
  return new Promise((resolve) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => resolve(null);
    image.src = src;
  });
}

export class AssetLoader {
  constructor() {
    this.cache = new Map();
  }

  async loadAll() {
    const entries = await Promise.all(
      Object.entries(IMAGE_MANIFEST).map(async ([key, path]) => [key, await loadImage(path)]),
    );

    entries.forEach(([key, image]) => this.cache.set(key, image));
    return this.cache;
  }

  get(key) {
    return this.cache.get(key) ?? null;
  }
}
