import { Scene } from "../../Scene.js";
import { Canvas } from "../../Context.js";
import { Rectangle, Sprite } from "../../Utilites.js";
import { Enemy } from "./Enemy.js";
import { EnemyType } from "../../Enums.js";
import { GetSound, GetSprite } from "../../Game.js";
import { RatCorpse } from "../RatCorpse.js";
import { RatTail } from "../../Assets/Items/Item.js";

export class Rat extends Enemy {
	public static readonly Damage = 20;
	public static readonly AttackCooldown = 500;
	private static readonly _deathSound = new Audio("Sounds/rat_death.mp3");
	private readonly _image = GetSprite("Rat") as Sprite;
	private readonly _attackSound = GetSound("Rat_Attack");

	private _attackCooldown = 0;

	constructor(x: number, y: number) {
		super(100, 50, 4, 5, EnemyType.Rat);

		this._x = x;
		this._y = y;
	}

	override Update(dt: number): void {
		super.Update(dt);

		const plrPos = Scene.Current.Player.GetPosition();
		const distance = this.GetDistanceToPlayer();

		if (this._attackCooldown <= 0) {
			if (Math.abs(distance) > 50 && Math.abs(distance) < 150 && this._grounded) {
				this._verticalAcceleration = 20;
				this._grounded = false;

				this._attackCooldown = Rat.AttackCooldown;
			}

			if (Math.abs(this.GetDistanceToPlayer()) <= 100 && Math.abs(this._y - plrPos.Y) < 20) {
				this._attackCooldown = Rat.AttackCooldown;

				Scene.Current.Player.TakeDamage(Rat.Damage);

				this._attackSound.Play(0.5);
			}
		} else this._attackCooldown -= dt;
	}

	override Render(): void {
		if (this.Direction === 1) Canvas.DrawImage(this._image, new Rectangle(this._x - Scene.Current.GetLevelPosition(), this._y, this.Width, this.Height));
		else Canvas.DrawImageFlipped(this._image, new Rectangle(this._x - Scene.Current.GetLevelPosition(), this._y, this.Width, this.Height));
	}

	override TakeDamage(damage: number): void {
		super.TakeDamage(damage);

		if (this._health <= 0) {
			this.Destroy();

			Scene.Current.Instantiate(new RatCorpse(this._x, this._y, new RatTail()));

			const s = Rat._deathSound.cloneNode() as HTMLAudioElement;
			s.volume = 0.25;
			s.play();
		}
	}
}
