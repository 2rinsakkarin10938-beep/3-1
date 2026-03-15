export class LocalAdapter {
  constructor(room) {
    this.room = structuredClone(room);
  }

  init() {
    return this.room;
  }

  sync(players) {
    this.room.players = players.map((player) => ({
      id: player.id,
      name: player.name,
      className: player.className,
      hp: player.hp,
      maxHp: player.maxHp,
      ready: player.active,
    }));
  }

  onPlayerJoin() {}

  getRemoteState() {
    return this.room.players;
  }
}
