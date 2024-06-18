import { EnemyType, Tag } from "../../Enums.js";
import { Scene } from "../../Scene.js";
import { Vector2 } from "../../Utilites.js";
import { Entity } from "../Entity.js";
import { Player } from "../Player.js";

export abstract class Enemy extends Entity {
	protected readonly _type: EnemyType;

	constructor(width: number, height: number, speed: number, maxHealth: number, type: EnemyType) {
		super(width, height, speed, maxHealth);

		this._type = type;
		this.Tag = Tag.Enemy;
	}

	protected IsSpotPlayer(): boolean {
		const plrPos = Scene.Current.Player.GetCenter();

		const hit = Scene.Current.Raycast(new Vector2(this._x, this._y + this.Height), new Vector2(plrPos.X - this._x, plrPos.Y - this._y), 1000, Tag.Player | Tag.Wall)[0];

		return hit !== undefined && hit.instance instanceof Player && hit.instance.IsAlive();
	}

	public Update(dt: number) {
		this.ApplyVForce();

		if (!this.IsSpotPlayer()) return;

		const plrPos = Scene.Current.Player.GetCenter();
		this.Direction = Math.sign(plrPos.X - (this._x + this.Width / 2)) as -1 | 1;

		if (this.GetDistanceToPlayer() < 50) {
			if (Scene.Player.GetPosition().Y > this._y) this.Jump();

			return;
		}

		if (this.Direction == 1) this.MoveRight();
		else this.MoveLeft();
	}

	public GetDistanceToPlayer() {
		const plr = Scene.Player.GetCenter();

		return Math.abs(plr.X - (this._x + this.Width / 2));
	}

	public GetDirectionToPlayer(): -1 | 1 {
		return Math.sign(Scene.Player.GetCenter().X - (this._x + this.Width / 2)) as -1 | 1;
	}
}
