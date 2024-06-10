import { EnemyType, Tag } from "../../Enums.js";
import { Scene } from "../../Scene.js";
import { Vector2 } from "../../Utilites.js";
import { Entity } from "../Entity.js";
import { Player } from "../Player.js";

export abstract class Enemy extends Entity {
	protected readonly _type: EnemyType;

	constructor(
		width: number,
		height: number,
		speed: number,
		maxHealth: number,
		type: EnemyType
	) {
		super(width, height, speed, maxHealth);

		this._type = type;
		this.Tag = Tag.Enemy;
	}

	protected IsSpotPlayer(): boolean {
		const plrPos = Scene.Current.Player.GetPosition();

		const hits = Scene.Current.Raycast(
			new Vector2(this._x, this._y + 1),
			new Vector2(plrPos.X - this._x, plrPos.Y - this._y + 1),
			1000,
			Tag.Player | Tag.Wall
		);

		return hits !== undefined && hits[0].instance instanceof Player;
	}

	public Update(dt: number) {
		this.ApplyVForce();

		if (!this.IsSpotPlayer()) return;

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
