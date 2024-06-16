import { Tag } from "../Enums.js";
import { Scene } from "../Scene.js";
import { Rectangle, Vector2 } from "../Utilites.js";
import { GameObject } from "./GameObject.js";
import { Ladder } from "./Ladder.js";
import { Platform } from "./Platform.js";
import { Spikes } from "./Spikes.js";

export class Entity extends GameObject {
	protected readonly _maxHealth: number;
	protected _speed: number;
	protected _health: number;
	protected _movingUp = false;
	protected _movingDown = false;
	protected _movingLeft = false;
	protected _movingRight = false;
	protected _verticalAcceleration = 0;
	protected _grounded = true;
	protected _jumpForce = 20;
	protected _xTarget = 0;
	protected _yTarget = 0;
	protected _onLadder: Ladder | null = null;

	public Direction: -1 | 1 = 1;

	constructor(width: number, height: number, speed: number, maxHealth: number) {
		super(width, height);

		this._speed = Math.clamp(speed, 0, Number.MAX_VALUE);
		this._health = Math.clamp(maxHealth, 1, Number.MAX_VALUE);
		this._maxHealth = this._health;

		this._collider = new Rectangle(this._x, this._y, this.Width, this.Height);
	}

	public override Update(dt: number) {
		if (this._onLadder !== null) {
			if (this._movingUp) this._y += 5;
			else if (this._movingDown) this._y -= 5;

			return;
		}

		this.ApplyVForce();

		if (this._movingLeft) this.MoveLeft();
		else if (this._movingRight) this.MoveRight();

		this.Direction = this._xTarget > this._x + this.Width / 2 - Scene.Current.GetLevelPosition() ? 1 : -1;
	}

	public IsAlive() {
		return this._health > 0;
	}

	public MoveRight() {
		if (!this.IsAlive()) return;

		this._x += this._speed;

		const collideOffsets = Scene.Current.GetCollide(this, Tag.Wall);
		if (collideOffsets !== false) {
			if (collideOffsets.instance instanceof Spikes) this.TakeDamage(100);

			this._x -= collideOffsets.position.X;
		}
	}

	public MoveLeft() {
		if (!this.IsAlive()) return;

		this._x -= this._speed;

		const collideOffsets = Scene.Current.GetCollide(this, Tag.Wall);
		if (collideOffsets !== false) {
			if (collideOffsets.instance instanceof Spikes) this.TakeDamage(100);

			this._x -= collideOffsets.position.X;
		}
	}

	public Jump() {
		if (!this.IsAlive()) return;

		if (!this._grounded) return;

		this._verticalAcceleration = this._jumpForce;
	}

	protected ApplyVForce() {
		const prevY = this._y;
		this._verticalAcceleration -= this._verticalAcceleration > 0 ? 2 : 3;
		this._y += this._verticalAcceleration;

		if (this._verticalAcceleration <= 0) {
			// падаем
			const offsets = Scene.Current.GetCollide(this, Tag.Wall | Tag.Platform);

			if (offsets !== false && offsets.position.Y !== 0) {
				{
					if (offsets.instance instanceof Spikes) this.TakeDamage(100);
					else if (offsets.instance instanceof Platform && (offsets.position.Y < 0 || prevY < offsets.instance.GetPosition().Y + offsets.instance.GetCollider().Height)) return;

					this._verticalAcceleration = 0;

					this._grounded = true;
					this._y += offsets.position.Y;
				}
			}
		} else if (this._verticalAcceleration > 0) {
			// взлетаем
			this._grounded = false;
			const offsets = Scene.Current.GetCollide(this, Tag.Wall);

			if (offsets !== false) {
				this._verticalAcceleration = 0;

				this._y += offsets.position.Y;

				return;
			}
		}
	}

	public TakeDamage(damage: number) {
		this._health -= damage;
	}

	public GetTarget() {
		return new Vector2(this._xTarget, this._yTarget);
	}
}
