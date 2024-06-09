import { Tag } from "../Enums.js";
import { Player } from "../Player.js";
import { Entity, Scene, Vector2 } from "../utilites.js";

export abstract class Enemy extends Entity {
	constructor(
		width: number,
		height: number,
		speed: number,
		maxHealth: number
	) {
		super(width, height, speed, maxHealth);
		this.Tag = Tag.Enemy;
	}

	protected IsSpotPlayer(): boolean {
		const plrPos = Scene.Current.Player.GetPosition();

		const hits = Scene.Current.Raycast(
			new Vector2(this._x, this._y),
			new Vector2(plrPos.X - this._x, plrPos.Y - this._y),
			1000,
			Tag.Player | Tag.Platform
		);

		return hits !== undefined && hits[0].instance instanceof Player;
	}

	public Update(dt: number) {
		const plrPos = Scene.Current.Player.GetPosition();
		const plrSize = Scene.Current.Player.GetCollider();

		this._direction = Math.sign(
			plrPos.X + plrSize.Width / 2 - (this._x + this._width / 2)
		) as -1 | 1;

		if (Math.abs(this._x - (plrPos.X + plrSize.Width / 2)) < 5) return;

		if (this._direction == 1) this.MoveRight();
		else this.MoveLeft();
	}
}
