import { Tag } from "../Enums.js";
import { Scene } from "../Scene.js";
import { GameObject, Rectangle } from "../Utilites.js";

export class Entity extends GameObject {
	protected readonly _maxHealth: number;
	protected _speed: number;
	protected _direction: -1 | 1 = 1;
	protected _health: number;
	protected _movingLeft = false;
	protected _movingRight = false;
	protected _verticalAcceleration = 0;
	protected _grounded = true;
	protected _jumpForce = 25;
	protected _xTarget = 0;
	protected _yTarget = 0;

	constructor(
		width: number,
		height: number,
		speed: number,
		maxHealth: number
	) {
		super(width, height);

		this._speed = Math.clamp(speed, 0, Number.MAX_VALUE);
		this._health = Math.clamp(maxHealth, 1, Number.MAX_VALUE);
		this._maxHealth = this._health;

		this._collider = new Rectangle(
			this._x,
			this._y,
			this._width,
			this._height
		);
	}

	public override Update(dt: number) {
		this.ApplyVForce();

		if (this._movingLeft) this.MoveLeft();
		else if (this._movingRight) this.MoveRight();
		this._direction = this._xTarget > this._x + this._width / 2 ? 1 : -1;
	}

	public MoveRight() {
		this._x += this._speed;

		const collideOffsets = Scene.Current.GetCollide(this, Tag.Platform);
		if (collideOffsets !== false && collideOffsets.X != 0)
			this._x -= collideOffsets.X;
	}

	public MoveLeft() {
		this._x -= this._speed;

		const collideOffsets = Scene.Current.GetCollide(this, Tag.Platform);
		if (collideOffsets !== false && collideOffsets.X != 0)
			this._x -= collideOffsets.X;
	}

	public Jump() {
		if (!this._grounded) return;

		this._verticalAcceleration = this._jumpForce;
	}

	private ApplyVForce() {
		this._verticalAcceleration -= this._verticalAcceleration > 0 ? 2 : 3;
		this._y += this._verticalAcceleration;

		if (this._verticalAcceleration <= 0) {
			const offsets = Scene.Current.GetCollide(this, Tag.Platform);

			if (offsets !== false && offsets.Y !== 0) {
				this._verticalAcceleration = 0;

				this._grounded = true;
				this._y += offsets.Y;
			}
		} else if (this._verticalAcceleration > 0) {
			this._grounded = false;
			const offsets = Scene.Current.GetCollide(this, Tag.Platform);

			if (offsets !== false) {
				this._verticalAcceleration = 0;

				this._y += offsets.Y;

				return;
			}
		}
	}

	public TakeDamage(damage: number) {
		this._health -= damage;
	}
}
