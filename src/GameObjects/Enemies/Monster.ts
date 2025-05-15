import { Scene } from "../../Scenes/Scene.js";
import { Canvas } from "../../Context.js";
import { Rectangle, Sprite } from "../../Utilites.js";
import { Enemy } from "./Enemy.js";
import { Direction, EnemyType, Tag } from "../../Enums.js";
import { GetSound, GetSprite } from "../../AssetsLoader.js";
import { Platform } from "../Platform.js";
import { Spikes } from "../Spikes.js";

export class Monster extends Enemy {
	public static readonly Damage = 100;
	public static readonly AttackCooldown = 500;
	private readonly _sprites = {
		Idle: GetSprite("Monster_Idle") as Sprite[],
		Dead: GetSprite("Monster_Dead") as Sprite,
		Jump: GetSprite("Monster_Jump") as Sprite,
	};
	public Direction = Direction.Left;

	private _accelerationX: number;
	private _attackCooldown = 0;
	private _toIdleSound = 0;
	private readonly _idleSound = GetSound("MonsterIdle");

	constructor(x: number, y: number) {
		super(0, 0, 4, 150, EnemyType.Rat);

		this._movingDown = true;

		this._x = x;
		this._y = y;
		this.Width = this._sprites.Idle[0].ScaledSize.X;
		this.Height = this._sprites.Idle[0].ScaledSize.Y;
		this._collider = new Rectangle(0, 0, this.Width, this.Height);
	}

	override Update(dt: number): void {
		if (!this.IsAlive()) return;

		this.ApplyForce(dt);
		this._attackCooldown -= dt;

		if (this._toIdleSound <= 0) {
			if (this.GetDistanceToPlayer() < 1500) {
				this._toIdleSound = this._idleSound.Length * 1000 * 1.1;
				this._idleSound.PlayOriginal();
			}
		} else this._toIdleSound -= dt;

		if (!this.IsSpotPlayer()) return;

		const plrPos = Scene.Current.Player.GetCenter();
		this.Direction = Math.sign(plrPos.X - (this._x + this.Width / 2)) as -1 | 1;

		if (this.GetDistanceToPlayer() < 50) {
			Scene.Current.Player.TakeDamage(Monster.Damage);
			this._accelerationX = 0;
		} else if (this.GetDistanceToPlayer() < 600 && this._attackCooldown <= 0 && this._grounded) {
			this._accelerationX = 150 * this.Direction;
			this._verticalAcceleration = 15;
			this._attackCooldown = Monster.AttackCooldown;
			this._grounded = false;
			GetSound("MonsterAttack").PlayOriginal();
			this._idleSound.StopOriginal();

			return;
		}
	}

	override Render(): void {
		if (!this.IsAlive()) {
			Canvas.DrawImage(this._sprites.Dead, new Rectangle(this._x, this._y, this.Width * 0.5, this.Height * 0.5));

			return;
		}

		if (!this._grounded) {
			if (this.Direction === Direction.Right) Canvas.DrawImage(this._sprites.Jump, new Rectangle(this._x, this._y, this.Width, this.Height));
			else Canvas.DrawImageFlipped(this._sprites.Jump, new Rectangle(this._x, this._y, this.Width, this.Height));

			return;
		}

		const ddiv = Scene.Time % 3000;
		let frame: Sprite;
		if (ddiv < 800) frame = this._sprites.Idle[0]; // Стоит
		else if (ddiv < 1200) frame = this._sprites.Idle[1]; // моргнул Стоит
		else if (ddiv < 2000) frame = this._sprites.Idle[0]; // Стоит
		else frame = this._sprites.Idle[2]; // Сел

		if (this.Direction === Direction.Right) Canvas.DrawImage(frame, new Rectangle(this._x, this._y, this.Width, this.Height));
		else Canvas.DrawImageFlipped(frame, new Rectangle(this._x, this._y, this.Width, this.Height));
	}

	override TakeDamage(damage: number): void {
		super.TakeDamage(damage);

		if (this._health <= 0) {
			GetSound("MonsterDie").PlayOriginal();
			this._idleSound.StopOriginal();
			this.Tag = Tag.Clip;
		}
	}

	protected ApplyForce(dt: number) {
		const physDt = dt / 15;
		const physDt2 = physDt / 5;

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
					}

					this._verticalAcceleration = 0;

					this._grounded = true;
					this._y = offsets[i].instance.GetPosition().Y + offsets[i].instance.GetCollider().Height;

					return;
				}
			}

			{
				this._y += this._verticalAcceleration * physDt;
				this._verticalAcceleration -= physDt;
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
				this._y += this._verticalAcceleration * physDt;
				this._verticalAcceleration -= physDt;
			}
		}

		if (this._accelerationX < 0) {
			// летим влево

			const offsets = Scene.Current.GetCollidesByRect(new Rectangle(this._x + this._accelerationX * physDt, this._y, this._collider.Width, this._collider.Height), Tag.Wall);

			offsets.sort((a, b) => (a.instance.Tag !== b.instance.Tag ? b.instance.Tag - a.instance.Tag : b.start.X - a.start.X));

			if (offsets.length > 0) {
				this._x = offsets[0].instance.GetPosition().X + offsets[0].instance.GetCollider().Width;

				this._accelerationX = 0;
				this._grounded = true;
			} else {
				this._x += this._accelerationX * physDt2;
				this._accelerationX = Math.min(this._accelerationX, 0);
			}
		} else if (this._accelerationX > 0) {
			// летим вправо

			const offsets = Scene.Current.GetCollidesByRect(new Rectangle(this._x + this._accelerationX * physDt, this._y, this._collider.Width, this._collider.Height), Tag.Wall);

			if (offsets.length > 0) {
				const r = offsets.minBy((x) => x.instance.GetPosition().X);
				this._x = r.instance.GetPosition().X - this._collider.Width;

				this._accelerationX = 0;
				this._grounded = true;
			} else {
				this._x += this._accelerationX * physDt2;
				this._accelerationX = Math.max(this._accelerationX, 0);
			}
		}
	}
}
