import { Scene } from "../../Scene.js";
import { Canvas } from "../../Context.js";
import {  Rectangle } from "../../Utilites.js";
import { Enemy } from "./Enemy.js";

export class Rat extends Enemy {
	public static readonly Damage = 10;
	public static readonly AttackCooldown = 500;
	private static readonly _attackSound = new Audio("Sounds/rat_attack.mp3");
	private static readonly _deathSound = new Audio("Sounds/rat_death.mp3");
	private static readonly _frames = {
		Idle: (function () {
			const img = new Image();

			img.src = `Images/Rat.png`;

			return img;
		})(),
	};

	private _attackCooldown = 0;

	constructor(x: number, y: number) {
		super(50, 25, 2, 5);

		this._x = x;
		this._y = y;
	}

	override Update(dt: number): void {
		super.Update(dt);

		const plrPos = Scene.Current.Player.GetPosition();
		const plrSize = Scene.Current.Player.GetCollider();

		if (this._attackCooldown <= 0) {
			if (
				Math.abs(
					this._x +
						(this._direction === 1 ? this._width : 0) -
						(plrPos.X + (this._direction === 1 ? plrSize.Width : 0))
				) <= this._width &&
				this._y == plrPos.Y
			) {
				this._attackCooldown = Rat.AttackCooldown;

				Scene.Current.Player.TakeDamage(Rat.Damage);

				const s = Rat._attackSound.cloneNode() as HTMLAudioElement;
				s.volume = 0.5;
				s.play();
			}
		} else this._attackCooldown -= dt;
	}

	override Render(): void {
		if (this._direction === 1) {
			Canvas.DrawImage(
				Rat._frames.Idle,
				new Rectangle(this._x - Scene.Current.GetLevelPosition(), this._y, this._width, this._height)
			);
		} else {
			Canvas.DrawImageFlipped(
				Rat._frames.Idle,
				new Rectangle(this._x - Scene.Current.GetLevelPosition(), this._y, this._width, this._height)
			);
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
