import { player } from "../Level.js";
import { Attack } from "../player.js";
import { SquareMagnitude } from "../utilites.js";
import { Enemy } from "./Enemy.js";

export class Rat extends Enemy {
	public static readonly Damage = 10;
	public static readonly AttackCooldown = 500;
	private _lastAttackTimeStamp = 0;

	constructor() {
		super(50, 25, 2, 5);

		this._x = 1000;
	}

	override Update(timeStamp: number): void {
		super.Update(timeStamp);

		if (
			timeStamp - this._lastAttackTimeStamp >= Rat.AttackCooldown &&
			SquareMagnitude(
				this._x + (this._direction === 1 ? this._width : 0),
				this._y,
				player.x + 50,
				player.y
			) < 20
		) {
			this._lastAttackTimeStamp = timeStamp;

            Attack(Rat.Damage)
		}
	}
}
