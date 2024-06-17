import { Scene } from "../../Scene.js";
import { Canvas } from "../../Context.js";
import { LoadImage, Rectangle } from "../../Utilites.js";
import { Enemy } from "./Enemy.js";
import { EnemyType } from "../../Enums.js";

export class Rat extends Enemy {
	public static readonly Damage = 10;
	public static readonly AttackCooldown = 500;
	private static readonly _attackSound = new Audio("Sounds/rat_attack.mp3");
	private static readonly _deathSound = new Audio("Sounds/rat_death.mp3");
	private static readonly _frames = {
		Idle: LoadImage(`Images/Rat.png`),
	};

	private _attackCooldown = 0;

	constructor(x: number, y: number) {
		super(100, 50, 5, 5, EnemyType.Rat);

		this._x = x;
		this._y = y;
	}

	override Update(dt: number): void {
		super.Update(dt);

		const plrPos = Scene.Current.Player.GetPosition();

		const distance = this.GetDistanceToPlayer();

		if (this._attackCooldown <= 0) {
			if (Math.abs(distance) > 50 && Math.abs(distance) < 150) {
				this._verticalAcceleration = 25;

				this._attackCooldown = Rat.AttackCooldown;
			}

			if (Math.abs(this.GetDistanceToPlayer()) <= 50 && this._y == plrPos.Y) {
				this._attackCooldown = Rat.AttackCooldown;

				Scene.Current.Player.TakeDamage(Rat.Damage);

				const s = Rat._attackSound.cloneNode() as HTMLAudioElement;
				s.volume = 0.5;
				s.play();
			}
		} else this._attackCooldown -= dt;
	}

	override Render(): void {
		if (this.Direction === 1) {
			Canvas.DrawImage(Rat._frames.Idle, new Rectangle(this._x - Scene.Current.GetLevelPosition(), this._y, this.Width, this.Height));
		} else {
			Canvas.DrawImageFlipped(Rat._frames.Idle, new Rectangle(this._x - Scene.Current.GetLevelPosition(), this._y, this.Width, this.Height));
		}
	}

	override TakeDamage(damage: number): void {
		super.TakeDamage(damage);

		if (this._health <= 0) {
			this.Destroy();

			const s = Rat._deathSound.cloneNode() as HTMLAudioElement;
			s.volume = 0.25;
			s.play();
		}
	}
}
