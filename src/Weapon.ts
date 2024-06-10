import { Canvas } from "./Context.js";
import { Tag } from "./Enums.js";
import { Bullet } from "./GameObjects/Bullet.js";
import { Enemy } from "./GameObjects/Enemies/Enemy.js";
import { Fireball } from "./GameObjects/Fireball.js";
import { Scene } from "./Scene.js";
import { Rectangle, Sound, Vector2 } from "./Utilites.js";

export abstract class Weapon {
	public readonly Icon: HTMLImageElement;
	private readonly _image: HTMLImageElement;

	private readonly _fireSound: Sound;
	private readonly _fireCooldown: number;
	private readonly _damage: number;
	private readonly _spread: number;

	private _position: Vector2 = Vector2.Zero;
	private _angle: number = 0;
	private _secondsToCooldown: number = 0;

	constructor(
		icon: HTMLImageElement,
		image: HTMLImageElement,
		fireSound: Sound,
		fireCooldown: number,
		damage: number,
		spread: number
	) {
		this.Icon = icon;
		this._image = image;
		this._fireSound = fireSound;
		this._fireCooldown = fireCooldown;
		this._damage = damage;
		this._spread = spread;
	}

	public Update(dt: number, position: Vector2, angle: number) {
		this._position = position;
		this._angle = angle;

		this._secondsToCooldown -= dt;
	}

	public Render() {
		if (this._angle < Math.PI / -2 || this._angle > Math.PI / 2)
			Canvas.DrawImageWithAngleVFlipped(
				this._image,
				new Rectangle(
					this._position.X - Scene.Current.GetLevelPosition(),
					this._position.Y,
					52 * 3.125,
					16 * 3.125
				),
				this._angle,
				-12,
				16 * 2.4
			);
		else
			Canvas.DrawImageWithAngle(
				this._image,
				new Rectangle(
					this._position.X - Scene.Current.GetLevelPosition(),
					this._position.Y,
					52 * 3.125,
					16 * 3.125
				),
				this._angle,
				-12,
				16 * 2.4
			);
	}

	public TryShoot(): boolean {
		if (this._secondsToCooldown > 0) return false;
		this._secondsToCooldown = this._fireCooldown;

		const dir = this._angle - (Math.random() - 0.5) * this._spread;

		const hits = Scene.Current.Raycast(
			this._position,
			new Vector2(Math.cos(dir), -Math.sin(dir)),
			1500,
			Tag.Enemy | Tag.Wall
		);

		const hit = hits === undefined ? undefined : hits[0];

		if (hit !== undefined && hit.instance instanceof Enemy)
			hit.instance.TakeDamage(this._damage);

		Scene.Current.Instantiate(
			new Bullet(
				this._position.X + Math.cos(dir) * 200,
				this._position.Y - Math.sin(dir) * 200,
				hit === undefined
					? 2000
					: Math.min(
							Math.sqrt(
								(this._position.X -
									hit.position.X +
									Math.cos(dir) * 200) **
									2 +
									(this._position.Y -
										hit.position.Y -
										Math.sin(dir) * 200) **
										2
							),
							2000
					  ),
				dir
			)
		);

		Scene.Current.Instantiate(
			new Fireball(
				this._position.X + Math.cos(this._angle) * 150,
				this._position.Y - Math.sin(this._angle) * 150,
				this._angle
			)
		);

		this._fireSound.Play(0.5);
		return true;
	}
}
