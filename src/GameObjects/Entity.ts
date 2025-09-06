import { GetSound } from "../AssetsLoader.js";
import { Direction, Tag } from "../Enums.js";
import { Scene } from "../Scenes/Scene.js";
import { Rectangle, Vector2 } from "../Utilites.js";
import { GameObject } from "./GameObject.js";
import { Ladder } from "./Ladder.js";
import { Platform } from "./Platform.js";
import { Spikes } from "./Spikes.js";
import { Wall } from "./Wall.js";

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
	protected _jumpForce = 22;
	protected _xTarget = 0;
	protected _yTarget = 0;
	protected _onLadder: Ladder | null = null;

	public Direction: Direction = 1;

	constructor(width: number, height: number, speed: number, maxHealth: number) {
		super(width, height);

		this._speed = Math.clamp(speed, 0, Number.MAX_VALUE);
		this._health = Math.clamp(maxHealth, 1, Number.MAX_VALUE);
		this._maxHealth = this._health;

		this._collider = new Rectangle(this._x, this._y, this.Width, this.Height);
	}

	public override Update(dt: number) {
		if (this._onLadder !== null) {
			if (this._movingUp) this.MoveUp(dt);
			else if (this._movingDown) this.MoveDown(dt);

			return;
		}

		this.ApplyVForce(dt);

		if (this._grounded) {
			if (this._movingLeft) this.MoveLeft(dt);
			else if (this._movingRight) this.MoveRight(dt);
		}

		this.Direction = this._xTarget > this._x + this.Width / 2 ? 1 : -1;
	}

	public IsAlive() {
		return this._health > 0;
	}

	public MoveRight(dt: number) {
		if (!this.IsAlive()) return;

		this._x += this._speed * (dt / 15);

		const collideOffsets = Scene.Current.GetCollide(this, Tag.Wall);
		if (collideOffsets !== false) {
			if (collideOffsets.instance instanceof Spikes) this.TakeDamage(100);

			// if (collideOffsets.start.Y > 0 && collideOffsets.start.Y < 20) this._y += collideOffsets.start.Y;
			// else
			this._x -= collideOffsets.start.X;
		}
	}

	public MoveLeft(dt: number) {
		if (!this.IsAlive()) return;

		this._x -= this._speed * (dt / 15);

		const collideOffsets = Scene.Current.GetCollide(this, Tag.Wall);
		if (collideOffsets !== false) {
			if (collideOffsets.instance instanceof Spikes) this.TakeDamage(100);

			// if (collideOffsets.start.Y > 0 && collideOffsets.start.Y < 20) this._y += collideOffsets.start.Y;
			// else
			this._x += collideOffsets.end.X;
		}
	}

	public MoveDown(dt: number) {
		if (!this.IsAlive()) return;

		this._y -= this._speed * (dt / 15 / 4);

		const collideOffsets = Scene.Current.GetCollide(this, Tag.Wall);
		if (collideOffsets !== false) {
			if (collideOffsets.instance instanceof Spikes) this.TakeDamage(100);

			this._y += collideOffsets.start.Y;
		}
	}

	public MoveUp(dt: number) {
		if (!this.IsAlive()) return;

		this._y += this._speed * (dt / 15 / 3);

		const collideOffsets = Scene.Current.GetCollide(this, Tag.Wall);
		if (collideOffsets !== false) {
			if (collideOffsets.instance instanceof Spikes) this.TakeDamage(100);

			this._y -= collideOffsets.end.Y;
		}
	}

	public Jump() {
		if (!this.IsAlive()) return;
		if (!this._grounded) return;

		GetSound("Jump").Play();
		this._grounded = false;
		this._onLadder = null;
		this._verticalAcceleration = this._jumpForce;
	}

	protected ApplyVForce(dt: number) {
		const physDt = dt / 15;
		const physDt2 = physDt / 20;

		if (this._verticalAcceleration === 0) {
			// Проверка на стойкость

			const offsets = Scene.Current.GetCollidesByRect(new Rectangle(this._x, this._y - 1, this._collider.Width, this._collider.Height), Tag.Wall | Tag.Platform);

			offsets.sort((a, b) => a.start.Y - b.start.Y);

			if (
				offsets.length === 0 ||
				(offsets[0].instance.Tag === Tag.Platform && (this._movingDown || this._y < offsets[0].instance.GetPosition().Y + offsets[0].instance.GetCollider().Height))
			) {
				this._grounded = false;
				this._verticalAcceleration -= physDt * 3;
			}
		} else if (this._verticalAcceleration < 0) {
			// падаем

			const offsets = Scene.Current.GetCollidesByRect(
				new Rectangle(this._x, this._y + this._verticalAcceleration * physDt, this._collider.Width, this._collider.Height - this._verticalAcceleration * physDt),
				Tag.Wall | Tag.Platform
			);

			offsets.sort((a, b) => b.start.Y - a.start.Y);

			for (let i = 0; i < offsets.length; ++i) {
				if (offsets[i].start.Y >= 0) {
					if (offsets[i].instance instanceof Spikes) this.TakeDamage(100);
					else if (offsets[i].instance instanceof Platform && (this._movingDown || this._y <= offsets[i].instance.GetPosition().Y + offsets[i].instance.GetCollider().Height)) {
						// что прямо говорит о том что никаких отношений между этим и платформой быть не может (низ Entity выше вверха Platform)

						continue;
					} //else if (offsets[i].instance instanceof Wall) break;

					this._verticalAcceleration = 0;

					this._grounded = true;
					this._y = offsets[i].instance.GetPosition().Y + offsets[i].instance.GetCollider().Height;

					return;
				}
			}

			{
				this._y += this._verticalAcceleration * physDt;
				this._verticalAcceleration -= physDt * 3;
			}
		} else if (this._verticalAcceleration > 0) {
			// взлетаем

			const offsets = Scene.Current.GetCollidesByRect(
				new Rectangle(this._x, this._y + this._verticalAcceleration * physDt, this._collider.Width, this._collider.Height + this._verticalAcceleration * physDt),
				Tag.Wall
			);

			if (offsets.length > 0) {
				this._verticalAcceleration = 0;

				const r = offsets.minBy((x) => x.instance.GetPosition().Y);
				this._y = r.instance.GetPosition().Y - this._collider.Height;
			} else {
				const mod = 1.65;

				this._y += this._verticalAcceleration * (physDt / mod);
				this._verticalAcceleration -= physDt * mod;
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
