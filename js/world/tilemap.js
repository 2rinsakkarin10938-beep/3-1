const fallbackMap = (() => {
  const width = 30;
  const height = 20;
  const collision = [];
  const ground = [];

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const border = x === 0 || y === 0 || x === width - 1 || y === height - 1;
      const pillar = (x > 10 && x < 14 && (y === 5 || y === 15)) || (x > 18 && x < 22 && (y === 5 || y === 15));
      collision.push(border || pillar ? 1 : 0);
      ground.push(0);
    }
  }

  return {
    tileSize: 32,
    width,
    height,
    spawnPoints: [
      { x: 96, y: 96 },
      { x: 800, y: 480 },
      { x: 800, y: 128 },
      { x: 160, y: 480 },
    ],
    layers: { ground, collision },
  };
})();

export class TileMap {
  static async load(path = "./maps/arena.json") {
    try {
      const response = await fetch(path);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const json = await response.json();
      return new TileMap(json);
    } catch (error) {
      console.warn("Falling back to embedded arena map.", error);
      return new TileMap(fallbackMap);
    }
  }

  constructor(data) {
    this.tileSize = data.tileSize;
    this.width = data.width;
    this.height = data.height;
    this.layers = data.layers;
    this.spawnPoints = data.spawnPoints;
    this.pixelWidth = this.width * this.tileSize;
    this.pixelHeight = this.height * this.tileSize;
  }

  getCollisionIndex(tileX, tileY) {
    if (tileX < 0 || tileY < 0 || tileX >= this.width || tileY >= this.height) {
      return 1;
    }

    return this.layers.collision[tileY * this.width + tileX];
  }

  collidesRect(x, y, width, height) {
    const startX = Math.floor(x / this.tileSize);
    const endX = Math.floor((x + width - 1) / this.tileSize);
    const startY = Math.floor(y / this.tileSize);
    const endY = Math.floor((y + height - 1) / this.tileSize);

    for (let tileY = startY; tileY <= endY; tileY += 1) {
      for (let tileX = startX; tileX <= endX; tileX += 1) {
        if (this.getCollisionIndex(tileX, tileY)) {
          return true;
        }
      }
    }

    return false;
  }

  resolveMovement(entity, deltaX, deltaY) {
    let nextX = entity.x + deltaX;
    let nextY = entity.y;
    if (!this.collidesRect(nextX, nextY, entity.width, entity.height)) {
      entity.x = nextX;
    }

    nextX = entity.x;
    nextY = entity.y + deltaY;
    if (!this.collidesRect(nextX, nextY, entity.width, entity.height)) {
      entity.y = nextY;
    }
  }

  getSpawnPoint(index) {
    return this.spawnPoints[index % this.spawnPoints.length];
  }

  drawBackground(ctx, camera) {
    const startX = Math.floor(camera.x / this.tileSize);
    const endX = Math.ceil((camera.x + ctx.canvas.width) / this.tileSize);
    const startY = Math.floor(camera.y / this.tileSize);
    const endY = Math.ceil((camera.y + ctx.canvas.height) / this.tileSize);

    for (let y = startY; y <= endY; y += 1) {
      for (let x = startX; x <= endX; x += 1) {
        if (x < 0 || y < 0 || x >= this.width || y >= this.height) {
          continue;
        }

        const px = x * this.tileSize - camera.x;
        const py = y * this.tileSize - camera.y;
        const isWall = this.getCollisionIndex(x, y) === 1;

        ctx.fillStyle = isWall ? "#384963" : (x + y) % 2 === 0 ? "#202938" : "#253043";
        ctx.fillRect(Math.round(px), Math.round(py), this.tileSize, this.tileSize);

        if (!isWall) {
          ctx.fillStyle = "rgba(255,255,255,0.04)";
          ctx.fillRect(Math.round(px + 6), Math.round(py + 6), 4, 4);
        }
      }
    }
  }

  drawForeground(ctx, camera) {
    const startX = Math.floor(camera.x / this.tileSize);
    const endX = Math.ceil((camera.x + ctx.canvas.width) / this.tileSize);
    const startY = Math.floor(camera.y / this.tileSize);
    const endY = Math.ceil((camera.y + ctx.canvas.height) / this.tileSize);

    ctx.strokeStyle = "rgba(0,0,0,0.18)";
    for (let y = startY; y <= endY; y += 1) {
      for (let x = startX; x <= endX; x += 1) {
        if (x < 0 || y < 0 || x >= this.width || y >= this.height) {
          continue;
        }

        const px = x * this.tileSize - camera.x;
        const py = y * this.tileSize - camera.y;
        ctx.strokeRect(Math.round(px), Math.round(py), this.tileSize, this.tileSize);
      }
    }
  }
}
