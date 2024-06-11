import { Canvas } from "./Context.js";
import { Tag } from "./Enums.js";
import { Bullet } from "./GameObjects/Bullet.js";
import { Enemy } from "./GameObjects/Enemies/Enemy.js";
import { Fireball } from "./GameObjects/Fireball.js";
import { Scene } from "./Scene.js";
import { Rectangle, Sound, Sprite, Vector2 } from "./Utilites.js";

export abstract class Weapon {
	public readonly Icon: Sprite;
	private readonly _image: Sprite;

	private readonly _fireSound: Sound;
	private readonly _fireCooldown: number;
	private readonly _damage: number;
	private readonly _spread: number;
	private readonly _width: number;
	private readonly _handOffset: Vector2;
	private readonly _muzzleOffset: Vector2;

	public readonly Heavy: boolean;
	public readonly Automatic: boolean;

	private _position: Vector2 = Vector2.Zero;
	private _angle: number = 0;
	private _secondsToCooldown: number = 0;

	constructor(
		icon: Sprite,
		image: Sprite,
		fireSound: Sound,
		fireCooldown: number,
		damage: number,
		spread: number,
		heavy: boolean,
		auto: boolean,
		handOffset: Vector2,
		muzzleOffset: Vector2
	) {
		this.Icon = icon;
		this._image = image;
		this._fireSound = fireSound;
		this._fireCooldown = fireCooldown;
		this._damage = damage;
		this._spread = spread;
		(this._handOffset = handOffset), (this._muzzleOffset = muzzleOffset);

		this.Heavy = heavy;
		this.Automatic = auto;

		this._width = 30 * (this._image.BoundingBox.Width / this._image.BoundingBox.Height);
	}

	public Update(dt: number, position: Vector2, angle: number) {
		this._position = position;
		this._angle = angle;

		this._secondsToCooldown -= dt;
	}

	public Render() {
		if (this.Heavy) {
			if (this._angle < Math.PI / -2 || this._angle > Math.PI / 2)
				Canvas.DrawImageWithAngleVFlipped(
					this._image,
					new Rectangle(this._position.X - Scene.Current.GetLevelPosition(), this._position.Y, this._width * this._image.Scale, 30 * this._image.Scale),
					this._angle,
					this._handOffset.X,
					this._handOffset.Y
				);
			else
				Canvas.DrawImageWithAngle(
					this._image,
					new Rectangle(this._position.X - Scene.Current.GetLevelPosition(), this._position.Y, this._width * this._image.Scale, 30 * this._image.Scale),
					this._angle,
					this._handOffset.X,
					this._handOffset.Y
				);
		} else {
			if (this._angle < Math.PI / -2 || this._angle > Math.PI / 2)
				Canvas.DrawImageWithAngleVFlipped(
					this._image,
					new Rectangle(this._position.X - Scene.Current.GetLevelPosition(), this._position.Y, this._width * this._image.Scale, 30 * this._image.Scale),
					this._angle,
					this._handOffset.X,
					this._handOffset.Y
				);
			else
				Canvas.DrawImageWithAngle(
					this._image,
					new Rectangle(this._position.X - Scene.Current.GetLevelPosition(), this._position.Y, this._width * this._image.Scale, 30 * this._image.Scale),
					this._angle,
					this._handOffset.X,
					this._handOffset.Y
				);
		}
	}

	public TryShoot(): boolean {
		if (this._secondsToCooldown > 0) return false;
		this._secondsToCooldown = this._fireCooldown;

		const dir = this._angle - (Math.random() - 0.5) * this._spread;
		const hit = Scene.Current.Raycast(this._position, new Vector2(Math.cos(dir), -Math.sin(dir)), 1500, Tag.Enemy | Tag.Wall)[0];

		if (hit !== undefined && hit.instance instanceof Enemy) hit.instance.TakeDamage(this._damage);

		Scene.Current.Instantiate(
			new Bullet(
				this._position.X + Math.cos(dir) * this._width,
				this._position.Y - Math.sin(dir) * this._width,
				hit === undefined
					? 2000
					: Math.sqrt((this._position.X - hit.position.X + Math.cos(dir) * this._width) ** 2 + (this._position.Y - hit.position.Y - Math.sin(dir) * this._width) ** 2),
				dir
			)
		);

		Scene.Current.Instantiate(
			new Fireball(
				this._position.X + Math.cos(this._angle) * (this._width + this._muzzleOffset.X),
				this._position.Y - Math.sin(this._angle) * (this._width + this._muzzleOffset.X),
				this._angle,
				this._muzzleOffset
			)
		);

		this._fireSound.Play(0.5);
		return true;
	}
}
