const DEFAULT_BINDINGS = {
  player1: {
    up: "KeyW",
    down: "KeyS",
    left: "KeyA",
    right: "KeyD",
    run: "ShiftLeft",
    skill1: "Digit1",
    skill2: "Digit2",
    skill3: "Digit3",
    skill4: "Digit4",
  },
  player2: {
    up: "ArrowUp",
    down: "ArrowDown",
    left: "ArrowLeft",
    right: "ArrowRight",
    run: "Enter",
    skill1: "KeyU",
    skill2: "KeyI",
    skill3: "KeyO",
    skill4: "KeyP",
  },
};

export function getDefaultBindings() {
  return JSON.parse(JSON.stringify(DEFAULT_BINDINGS));
}

export class InputManager {
  constructor(bindings) {
    this.bindings = bindings;
    this.keys = new Set();
    this.pressed = new Set();
    this.onKeyDown = this.onKeyDown.bind(this);
    this.onKeyUp = this.onKeyUp.bind(this);
  }

  attach() {
    window.addEventListener("keydown", this.onKeyDown);
    window.addEventListener("keyup", this.onKeyUp);
  }

  detach() {
    window.removeEventListener("keydown", this.onKeyDown);
    window.removeEventListener("keyup", this.onKeyUp);
    this.keys.clear();
    this.pressed.clear();
  }

  onKeyDown(event) {
    if (!this.keys.has(event.code)) {
      this.pressed.add(event.code);
    }

    this.keys.add(event.code);

    const trackedCodes = new Set(Object.values(this.bindings.player1).concat(Object.values(this.bindings.player2)));
    if (trackedCodes.has(event.code)) {
      event.preventDefault();
    }
  }

  onKeyUp(event) {
    this.keys.delete(event.code);
  }

  isDown(profile, action) {
    const code = this.bindings[profile]?.[action];
    return code ? this.keys.has(code) : false;
  }

  consumePress(profile, action) {
    const code = this.bindings[profile]?.[action];
    if (!code || !this.pressed.has(code)) {
      return false;
    }

    this.pressed.delete(code);
    return true;
  }

  getMovementVector(profile) {
    let x = 0;
    let y = 0;

    if (this.isDown(profile, "left")) x -= 1;
    if (this.isDown(profile, "right")) x += 1;
    if (this.isDown(profile, "up")) y -= 1;
    if (this.isDown(profile, "down")) y += 1;

    if (x !== 0 && y !== 0) {
      const normalized = 1 / Math.sqrt(2);
      x *= normalized;
      y *= normalized;
    }

    return { x, y, running: this.isDown(profile, "run") };
  }
}
