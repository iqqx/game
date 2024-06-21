import { Canvas } from "../../Context.js";
import { Tag } from "../../Enums.js";
import { GetSound, GetSprite } from "../../Game.js";
import { Blood } from "../../GameObjects/Blood.js";
import { Bullet } from "../../GameObjects/Bullet.js";
import { Entity } from "../../GameObjects/Entity.js";
import { Fireball } from "../../GameObjects/Fireball.js";
import { Scene } from "../../Scene.js";
import { Sprite, Sound, Vector2, Rectangle } from "../../Utilites.js";
import { Item } from "../Items/Item.js";

export abstract class Weapon extends Item {
	public declare readonly Icon: Sprite;
	public readonly Sprites: { readonly Image: Sprite };
	private readonly _sounds: { readonly Fire: Sound; readonly Shell?: Sound; readonly EmptyFire: Sound; readonly Reload: Sound; readonly Impact: Sound; readonly Hit: Sound };

	private readonly _fireCooldown: number;
	private readonly _reloadTime: number;
	private readonly _damage: number;
	private readonly _spread: number;
	private readonly _width: number;
	private readonly _handOffset: Vector2;
	private readonly _muzzleOffset: Vector2;
	private readonly _maxAmmoClip: number = 30;
	private readonly _automatic;

	public declare readonly Heavy: boolean;
	public Automatic: boolean;

	private _loadedAmmo: number = 5;
	private _position: Vector2 = Vector2.Zero;
	private _angle: number = 0;
	private _secondsToCooldown: number = 0;
	private _secondsToReload: number = 0;

	constructor(
		images: { Icon: Sprite; Image: Sprite },
		sounds: { Fire: Sound; Shell?: Sound },
		fireCooldown: number,
		damage: number,
		spread: number,
		heavy: boolean,
		auto: boolean,
		reloadTime: number,
		clip: number,
		handOffset: Vector2,
		muzzleOffset: Vector2
	) {
		super();

		this.Icon = images.Icon;
		this.Sprites = images;
		this._sounds = {
			...sounds,
			EmptyFire: GetSound("Shoot_Empty"),
			Reload: GetSound("Reload"),
			Impact: GetSound("Projectile_Impact"),
			Hit: GetSound("Hit"),
		};
		this._fireCooldown = fireCooldown;
		this._damage = damage;
		this._spread = spread;
		(this._handOffset = handOffset), (this._muzzleOffset = muzzleOffset);

		this._reloadTime = reloadTime;
		this._maxAmmoClip = clip;
		this._loadedAmmo = clip;
		this.Heavy = heavy;
		this._automatic = auto;
		this.Automatic = auto;

		this._width = 30 * (this.Sprites.Image.BoundingBox.Width / this.Sprites.Image.BoundingBox.Height);
	}

	public Update(dt: number, position: Vector2, angle: number) {
		this._position = position;
		this._angle = angle;

		if (this._secondsToReload > 0) {
			this._secondsToReload -= dt;

			if (this._secondsToReload <= 0) {
				this._loadedAmmo = this._maxAmmoClip + (this._loadedAmmo > 0 ? 1 : 0);
				this.Automatic = this._automatic;
			}
		}

		this._secondsToCooldown -= dt;
	}

	public Render() {
		if (this.Heavy) {
			if (this._angle < Math.PI / -2 || this._angle > Math.PI / 2)
				Canvas.DrawImageWithAngleVFlipped(
					this.Sprites.Image,
					new Rectangle(
						this._position.X - Scene.Current.GetLevelPosition(),
						this._position.Y,
						this._width,
						this.Sprites.Image.BoundingBox.Height * (this._width / this.Sprites.Image.BoundingBox.Width)
					),
					this._angle,
					this._handOffset.X,
					this._handOffset.Y
				);
			else
				Canvas.DrawImageWithAngle(
					this.Sprites.Image,
					new Rectangle(
						this._position.X - Scene.Current.GetLevelPosition(),
						this._position.Y,
						this._width,
						this.Sprites.Image.BoundingBox.Height * (this._width / this.Sprites.Image.BoundingBox.Width)
					),
					this._angle,
					this._handOffset.X,
					this._handOffset.Y
				);
		} else {
			if (this._angle < Math.PI / -2 || this._angle > Math.PI / 2)
				Canvas.DrawImageWithAngleVFlipped(
					this.Sprites.Image,
					new Rectangle(
						this._position.X - Scene.Current.GetLevelPosition(),
						this._position.Y,
						this._width,
						this.Sprites.Image.BoundingBox.Height * (this._width / this.Sprites.Image.BoundingBox.Width)
					),
					this._angle,
					this._handOffset.X,
					this._handOffset.Y
				);
			else
				Canvas.DrawImageWithAngle(
					this.Sprites.Image,
					new Rectangle(
						this._position.X - Scene.Current.GetLevelPosition(),
						this._position.Y,
						this._width,
						this.Sprites.Image.BoundingBox.Height * (this._width / this.Sprites.Image.BoundingBox.Width)
					),
					this._angle,
					this._handOffset.X,
					this._handOffset.Y
				);
		}
	}

	public Reload() {
		if (this._secondsToReload > 0) return;

		this._secondsToReload = this._reloadTime;
		this._sounds.Reload.Play(0.5);
	}

	public GetLoadedAmmo() {
		return this._loadedAmmo;
	}

	public IsReloading(): boolean {
		return this._secondsToReload > 0;
	}

	public GetFillClipRatio() {
		return this._loadedAmmo / (this._maxAmmoClip - 1);
	}

	public TryShoot(tag = Tag.Enemy): boolean {
		if (this._secondsToCooldown > 0 || this._secondsToReload > 0) {
			return false;
		} else if (this._loadedAmmo <= 0) {
			this._sounds.EmptyFire.Play(0.5);

			this._secondsToCooldown = this._fireCooldown;
			this.Automatic = false;

			return false;
		}

		this._secondsToCooldown = this._fireCooldown;

		const muzzlePosition = new Vector2(
			this._position.X + Math.cos(this._angle) * (this._width + this._muzzleOffset.X),
			this._position.Y - Math.sin(this._angle) * (this._width + this._muzzleOffset.Y)
		);
		const dir = this._angle - (Math.random() - 0.5) * this._spread;
		const hit = Scene.Current.Raycast(muzzlePosition, new Vector2(Math.cos(dir), -Math.sin(dir)), 1500, tag | Tag.Wall)[0];

		if (hit !== undefined && hit.instance instanceof Entity) {
			hit.instance.TakeDamage(this._damage);
			this._sounds.Hit.Play(0.15);

			const bloodCount = Math.round((Math.random() + 1) * 2);
			for (let i = 0; i < bloodCount; i++) {
				const offset = (Math.random() - 0.5) / 2;
				const bloodDir = new Vector2(Math.cos(this._angle + offset), -Math.sin(this._angle + offset));

				Scene.Current.Instantiate(new Blood(new Vector2(hit.position.X + bloodDir.X * 100, hit.position.Y + bloodDir.Y * 100), new Vector2(bloodDir.X * 50, bloodDir.Y * 30)));
			}
		} else if (hit !== undefined) {
			this._sounds.Impact.Play(
				(1 - Math.sqrt((muzzlePosition.X + Math.cos(this._angle) * 100 - hit.position.X) ** 2 + (muzzlePosition.Y - Math.sin(this._angle) * 100 - hit.position.Y) ** 2) / 1500) * 0.25
			);
		}

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

		this._loadedAmmo--;
		this._sounds.Fire.Play(0.5);

		setTimeout(() => {
			this._sounds.Shell?.Play(0.1);
		}, 300);
		return true;
	}
}

export class Glock extends Weapon {
	constructor() {
		super(
			{
				Icon: GetSprite("Glock_Icon"),
				Image: GetSprite("Glock"),
			},
			{
				Fire: GetSound("Shoot_3"),
				Shell: GetSound("Shell"),
			},
			200,
			20,
			0.1,
			false,
			false,
			2500,
			7,
			new Vector2(40, 10),
			new Vector2(30, 10)
		);
	}

	static toString(): string {
		return "Пистолет";
	}
}

export class AK extends Weapon {
	private static readonly _fireCooldown = 150;
	private static readonly _damage = 40;
	private static readonly _spread = 0.01;

	constructor() {
		super(
			{
				Icon: GetSprite("AK_Icon"),
				Image: GetSprite("AK"),
			},
			{
				Fire: GetSound("Shoot_1"),
				Shell: GetSound("Shell"),
			},
			AK._fireCooldown,
			AK._damage,
			AK._spread,
			true,
			true,
			2500,
			30,
			new Vector2(0, 18),
			new Vector2(0, 0)
		);
	}

	static toString(): string {
		return "Калак 12";
	}
}
