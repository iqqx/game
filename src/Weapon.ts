import { Canvas } from "./Context.js";
import { Tag } from "./Enums.js";
import { Bullet } from "./GameObjects/Bullet.js";
import { Enemy } from "./GameObjects/Enemies/Enemy.js";
import { Entity } from "./GameObjects/Entity.js";
import { Fireball } from "./GameObjects/Fireball.js";
import { Scene } from "./Scene.js";
import { Rectangle, Sound, Sprite, Vector2 } from "./Utilites.js";

export abstract class Weapon {
	public readonly Sprites: { readonly Icon: Sprite; readonly Image: Sprite };
	private readonly _sounds: { readonly Fire: Sound; readonly Shell?: Sound };

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
		images: { Icon: Sprite; Image: Sprite },
		sounds: { Fire: Sound; Shell?: Sound },
		fireCooldown: number,
		damage: number,
		spread: number,
		heavy: boolean,
		auto: boolean,
		handOffset: Vector2,
		muzzleOffset: Vector2
	) {
		this.Sprites = images;
		this._sounds = sounds;
		this._fireCooldown = fireCooldown;
		this._damage = damage;
		this._spread = spread;
		(this._handOffset = handOffset), (this._muzzleOffset = muzzleOffset);

		this.Heavy = heavy;
		this.Automatic = auto;

		this._width = 30 * (this.Sprites.Image.BoundingBox.Width / this.Sprites.Image.BoundingBox.Height);
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
					this.Sprites.Image,
					new Rectangle(this._position.X - Scene.Current.GetLevelPosition(), this._position.Y, this._width * this.Sprites.Image.Scale, 30 * this.Sprites.Image.Scale),
					this._angle,
					this._handOffset.X,
					this._handOffset.Y
				);
			else
				Canvas.DrawImageWithAngle(
					this.Sprites.Image,
					new Rectangle(this._position.X - Scene.Current.GetLevelPosition(), this._position.Y, this._width * this.Sprites.Image.Scale, 30 * this.Sprites.Image.Scale),
					this._angle,
					this._handOffset.X,
					this._handOffset.Y
				);
		} else {
			if (this._angle < Math.PI / -2 || this._angle > Math.PI / 2)
				Canvas.DrawImageWithAngleVFlipped(
					this.Sprites.Image,
					new Rectangle(this._position.X - Scene.Current.GetLevelPosition(), this._position.Y, this._width * this.Sprites.Image.Scale, 30 * this.Sprites.Image.Scale),
					this._angle,
					this._handOffset.X,
					this._handOffset.Y
				);
			else
				Canvas.DrawImageWithAngle(
					this.Sprites.Image,
					new Rectangle(this._position.X - Scene.Current.GetLevelPosition(), this._position.Y, this._width * this.Sprites.Image.Scale, 30 * this.Sprites.Image.Scale),
					this._angle,
					this._handOffset.X,
					this._handOffset.Y
				);
		}
	}

	public TryShoot(tag = Tag.Enemy): boolean {
		if (this._secondsToCooldown > 0) return false;
		this._secondsToCooldown = this._fireCooldown;

		const muzzlePosition = new Vector2(
			this._position.X + Math.cos(this._angle) * (this._width + this._muzzleOffset.X),
			this._position.Y - Math.sin(this._angle) * (this._width + this._muzzleOffset.Y)
		);
		const dir = this._angle - (Math.random() - 0.5) * this._spread;
		const hit = Scene.Current.Raycast(muzzlePosition, new Vector2(Math.cos(dir), -Math.sin(dir)), 1500, tag | Tag.Wall)[0];

		if (hit !== undefined && hit.instance instanceof Entity) hit.instance.TakeDamage(this._damage);

		Scene.Current.Instantiate(
			new Bullet(
				muzzlePosition.X + Math.cos(this._angle) * 100,
				muzzlePosition.Y - Math.sin(this._angle) * 100,
				hit === undefined
					? 2000
					: Math.sqrt((muzzlePosition.X + Math.cos(this._angle) * 100 - hit.position.X) ** 2 + (muzzlePosition.Y - Math.sin(this._angle) * 100 - hit.position.Y) ** 2),
				dir
			)
		);

		Scene.Current.Instantiate(new Fireball(muzzlePosition.X, muzzlePosition.Y, this._angle, this._muzzleOffset));

		this._sounds.Fire.Play(0.5);

		setTimeout(() => {
			this._sounds.Shell?.Play(0.1);
		}, 300);
		return true;
	}
}
