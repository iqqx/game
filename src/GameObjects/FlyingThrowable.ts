import { Throwable } from "../Assets/Throwable.js";
import { GetSound, GetSprite } from "../AssetsLoader.js";
import { Canvas } from "../Context.js";
import { Tag } from "../Enums.js";
import { Scene } from "../Scene.js";
import { Rectangle, Sprite, Vector2 } from "../Utilites.js";
import { Entity } from "./Entity.js";
import { GameObject } from "./GameObject.js";
import { ItemDrop } from "./ItemDrop.js";

export class FlyingThrowable extends GameObject {
	private readonly _explosive = GetSprite("Explosive") as Sprite[];
	private readonly _sprite: Sprite;
	private readonly _spawnedBy: Throwable;

	private _grounded = false;
	private _impacted = false;
	private _accelerationX: number;
	private _accelerationY: number;
	private _timeFromExplosive = 0;
	private _timeFromThrow = 0;

	constructor(x: number, y: number, angle: number, by: Throwable) {
		super(by.Sprite.ScaledSize.X, by.Sprite.ScaledSize.Y);

		this._spawnedBy = by;
		this._x = x;
		this._sprite = by.Sprite;
		this._collider = new Rectangle(0, 0, this.Width, this.Height);
		this._accelerationX = Math.cos(angle) * 35;
		this._accelerationY = Math.sin(-angle) * 25;

		this._y = y;
	}

	public override Update(dt: number): void {
		if (this._impacted) {
			if (this._timeFromThrow < 200) {
				if (!this._grounded) this.ApplyForce(dt);
				else {
					Scene.Current.Instantiate(new ItemDrop(this._x, this._y, this._spawnedBy));
					this.Destroy();
				}
			} else {
				this._timeFromExplosive += dt;

				if (this._timeFromExplosive >= 150) this.Destroy();
			}
		} else {
			this._timeFromThrow += dt;

			this.ApplyForce(dt);
		}
	}

	public override Render(): void {
		if (this._impacted && this._timeFromThrow >= 200) {
			const frame = this._explosive[Math.floor(this._timeFromExplosive / 50)];

			Canvas.DrawImage(
				frame,
				new Rectangle(this._x - Scene.Current.GetLevelPosition() - frame.ScaledSize.X / 2, this._y - frame.ScaledSize.Y / 2, frame.ScaledSize.X, frame.ScaledSize.Y)
			);
		} else Canvas.DrawImage(this._sprite, new Rectangle(this._x - Scene.Current.GetLevelPosition(), this._y, this._sprite.ScaledSize.X, this._sprite.ScaledSize.Y));
	}

	private ApplyForce(dt: number) {
		const physDt = dt / 15;
		const physDt2 = physDt / 20;

		if (this._accelerationY <= 0) {
			// падаем

			const offsets = Scene.Current.GetCollidesByRect(
				new Rectangle(this._x, this._y + this._accelerationY * physDt, this._collider.Width, this._collider.Height),
				Tag.Wall | Tag.Enemy
			);

			offsets.sort((a, b) => (a.instance.Tag !== b.instance.Tag ? b.instance.Tag - a.instance.Tag : b.start.Y - a.start.Y));

			if (offsets.length > 0 && offsets[0].start.Y >= 0) {
				this._y = offsets[0].instance.GetPosition().Y + offsets[0].instance.GetCollider().Height;

				this._grounded = true;
				this.Detonate();
				return;
			} else {
				this._y += this._accelerationY * physDt;
				this._accelerationY -= physDt;
			}
		} else if (this._accelerationY > 0) {
			// взлетаем

			const offsets = Scene.Current.GetCollidesByRect(
				new Rectangle(this._x, this._y + this._accelerationY * physDt, this._collider.Width, this._collider.Height),
				Tag.Wall | Tag.Enemy
			);

			if (offsets.length > 0) {
				const r = offsets.minBy((x) => x.instance.GetPosition().Y);
				this._y = r.instance.GetPosition().Y - this._collider.Height;

				this.Detonate();
				return;
			} else {
				this._y += this._accelerationY * physDt;
				this._accelerationY -= physDt;
			}
		}

		if (this._accelerationX < 0) {
			// летим влево

			const offsets = Scene.Current.GetCollidesByRect(
				new Rectangle(this._x + this._accelerationX * physDt, this._y, this._collider.Width, this._collider.Height),
				Tag.Wall | Tag.Enemy
			);

			offsets.sort((a, b) => (a.instance.Tag !== b.instance.Tag ? b.instance.Tag - a.instance.Tag : b.start.X - a.start.X));

			if (offsets.length > 0) {
				this._x = offsets[0].instance.GetPosition().X + offsets[0].instance.GetCollider().Width;

				if (!this._grounded) this._accelerationX = -this._accelerationX / 2;

				this.Detonate();
			} else {
				this._x += this._accelerationX * physDt;
				this._accelerationX = Math.min(this._accelerationX - physDt2, 0);
			}
		} else if (this._accelerationX > 0) {
			// летим вправо

			const offsets = Scene.Current.GetCollidesByRect(
				new Rectangle(this._x + this._accelerationX * physDt, this._y, this._collider.Width, this._collider.Height),
				Tag.Wall | Tag.Enemy
			);

			if (offsets.length > 0) {
				const r = offsets.minBy((x) => x.instance.GetPosition().X);
				this._x = r.instance.GetPosition().X - this._collider.Width;

				if (!this._grounded) this._accelerationX = -this._accelerationX / 2;

				this.Detonate();
			} else {
				this._x += this._accelerationX * physDt;
				this._accelerationX = Math.max(this._accelerationX - physDt2, 0);
			}
		}
	}

	private Detonate() {
		this._impacted = true;

		if (this._timeFromThrow < 200) {
			if (this._grounded) {
				Scene.Current.Instantiate(new ItemDrop(this._x, this._y, this._spawnedBy));
				this.Destroy();
			}
		} else {
			const explosiveDamage = 350;
			const explosiveRange = 300;

			GetSound("Explosive").PlayOriginal();

			for (const entity of Scene.Current.GetByTag(Tag.Enemy | Tag.Player)) {
				const distance = Vector2.Length(entity.GetCenter(), new Vector2(this._x, this._y));

				if (distance < explosiveRange) {
					(entity as Entity).TakeDamage(explosiveDamage * (1 - distance / explosiveRange));
				}
			}
		}
	}
}
