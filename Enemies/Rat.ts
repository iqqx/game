import { images, player } from "../Level.js";
import { PLAYER_WIDTH } from "../constants.js";
import { DrawImage, DrawImageFlipped } from "../context.js";
import { Attack } from "../player.js";
import { Rectangle, SquareMagnitude } from "../utilites.js";
import { Enemy } from "./Enemy.js";

export class Rat extends Enemy {
	public static readonly Damage = 10;
	public static readonly AttackCooldown = 500;
	private static readonly _attackSound = new Audio("Sounds/rat_attack.mp3");
	private static readonly _deathSound = new Audio("Sounds/rat_death.mp3");

	private _lastAttackTimeStamp = 0;

	constructor() {
		super(50, 25, 2, 5);

		this._x = 1000;
	}

	override Update(timeStamp: number): void {
		if(this.IsDead())
			return;

		super.Update(timeStamp);

		if (
			timeStamp - this._lastAttackTimeStamp >= Rat.AttackCooldown &&
			Math.abs(
				this._x +
					(this._direction === 1 ? this._width : 0) -
					(player.x + (this._direction === 1 ? PLAYER_WIDTH : 0))
			) <= this._width
			&& this._y == player.y
		) {
			this._lastAttackTimeStamp = timeStamp;

			Attack(Rat.Damage);

			const s = Rat._attackSound.cloneNode() as HTMLAudioElement;
			s.volume = 0.5;
			s.play();
		}
	}

	override Draw(): void {
		if(this.IsDead())
			return;

		if (this._direction === 1) {
			DrawImage(
				images.Rat,
				new Rectangle(this._x, this._y, this._width, this._height)
			);
		} else {
			DrawImageFlipped(
				images.Rat,
				new Rectangle(this._x, this._y, this._width, this._height)
			);
		}
	}

	override TakeDamage(damage: number): void {
		if(this.IsDead())
			return;

		super.TakeDamage(damage);

		if (this._health <= 0) {
			const s = Rat._deathSound.cloneNode() as HTMLAudioElement;
			s.volume = 0.25;
			s.play();
		}
	}
}
