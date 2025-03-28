import { Canvas } from "../../Context.js";
import { Direction, Tag } from "../../Enums.js";
import { Blood } from "../../GameObjects/Blood.js";
import { Bullet } from "../../GameObjects/Bullet.js";
import { DroppedClip } from "../../GameObjects/DroppedClip.js";
import { Entity } from "../../GameObjects/Entity.js";
import { Fireball } from "../../GameObjects/Fireball.js";
import { Scene } from "../../Scenes/Scene.js";
import { Sprite, Sound, Vector2, Rectangle, IItem, GetMaxIdentityString } from "../../Utilites.js";
import { GetSound, GetSprite } from "../../AssetsLoader.js";

export class Weapon implements IItem {
	public declare readonly Icon: Sprite;
	public readonly Sprites: { readonly Image: Sprite; readonly Clip: Sprite };
	public declare readonly Name: string;
	public declare readonly Id: string;
	public readonly IsBig = true;
	public readonly MaxStack = 1;
	public readonly AmmoId: string;
	private readonly _sounds: { readonly Fire: Sound; readonly Shell?: Sound; readonly EmptyFire: Sound; readonly Reload: Sound; readonly Impact: Sound; readonly Hit: Sound };

	private readonly _fireCooldown: number;
	private readonly _reloadTime: number;
	private readonly _damage: number;
	private readonly _spread: number;
	private readonly _recoil: number;
	public readonly GripOffset: Vector2;
	public readonly MuzzleOffset: Vector2;
	public readonly ClipOffset: Vector2;
	public readonly MaxAmmoClip: number = 30;
	private readonly _automatic: boolean;

	public readonly Heavy: boolean;
	public Automatic: boolean;

	private _loadedAmmo: number = 0;
	private _position: Vector2 = Vector2.Zero;
	private _angle: number = 0;
	private _recoilCompensationAcceleration = 0;
	private _secondsToCooldown: number = 0;
	private _secondsToReload: number = 0;
	private _ammoToReload: number = 0;
	private _timeToRecoilStop = 0;
	private _hasClip;
	private _direction: Direction;

	private static readonly _weapons: Weapon[] = [];

	public static GetById(id: string) {
		const w = Weapon._weapons.find((x) => x.Id === id);

		if (w === undefined) {
			// console.error(`Оружие с идентификатором '${id}' не зарегистрировано.`);

			return undefined;
		}

		return w.Clone();
	}

	public static Register(rawJson: {
		Sprites: {
			Icon: string;
			Main: string;
			Clip: string;
		};
		Sounds: {
			Shoot: string;
			ShellImpact: string;
			Reload: string;
		};
		Id: string;
		Name: string;
		AmmoId: string;
		Damage: number;
		IsHeavy: boolean;
		IsAutomatic: boolean;
		ClipCapacity: number;
		Spread: number;
		Recoil: number;
		ReloadTime: number;
		ShootsPerSecond: number;
		PixelsOffsets: {
			Grip: { X: number; Y: number };
			Muzzle: { X: number; Y: number };
			Clip: { X: number; Y: number };
		};
	}) {
		if (rawJson.Name === undefined)
			throw new Error(
				`Название [Name] не определено (Ближайший ключ: [${GetMaxIdentityString("Name", Object.keys(rawJson)).replaceAll(" ", "_")}])\nat Parser: [Предмет: <${rawJson.Id}>]`
			);

		Weapon._weapons.push(
			new Weapon(
				rawJson.Id,
				rawJson.Name,
				{ Icon: GetSprite(rawJson.Sprites.Icon), Image: GetSprite(rawJson.Sprites.Main), Clip: GetSprite(rawJson.Sprites.Clip) },
				{
					Fire: GetSound(rawJson.Sounds.Shoot),
					Shell: rawJson.Sounds.ShellImpact === undefined ? undefined : GetSound(rawJson.Sounds.ShellImpact),
					Reload: GetSound(rawJson.Sounds.Reload),
				},
				1000 / rawJson.ShootsPerSecond,
				rawJson.AmmoId,
				rawJson.Damage,
				rawJson.Spread,
				rawJson.IsHeavy,
				rawJson.IsAutomatic,
				rawJson.ReloadTime,
				rawJson.ClipCapacity,
				rawJson.Recoil,
				new Vector2(rawJson.PixelsOffsets.Grip.X, rawJson.PixelsOffsets.Grip.Y),
				new Vector2(rawJson.PixelsOffsets.Muzzle.X, rawJson.PixelsOffsets.Muzzle.Y),
				new Vector2(rawJson.PixelsOffsets.Clip.X, rawJson.PixelsOffsets.Clip.Y)
			)
		);
	}

	constructor(
		id: string,
		name: string,
		images: { Icon: Sprite; Image: Sprite; Clip: Sprite },
		sounds: { Fire: Sound; Shell?: Sound; Reload: Sound },
		fireCooldown: number,
		ammoId: string,
		damage: number,
		spread: number,
		heavy: boolean,
		auto: boolean,
		reloadTime: number,
		clip: number,
		recoil: number,
		handOffset: Vector2,
		muzzleOffset: Vector2,
		clipOffset: Vector2
	) {
		this.Id = id;
		this.Name = name;
		this.Icon = images.Icon;
		this.Sprites = images;
		this.AmmoId = ammoId;
		this._sounds = {
			...sounds,
			EmptyFire: GetSound("Shoot_Empty"),
			Impact: GetSound("Projectile_Impact"),
			Hit: GetSound("Hit"),
		};
		this._fireCooldown = fireCooldown;
		this._damage = damage;
		this._spread = spread;
		this._recoil = recoil;

		this.GripOffset = Vector2.Mul(handOffset, this.Sprites.Image.Scale);
		this.MuzzleOffset = Vector2.Mul(muzzleOffset, this.Sprites.Image.Scale);
		this.ClipOffset = Vector2.Mul(clipOffset, this.Sprites.Image.Scale);

		this._reloadTime = reloadTime * 1000;
		this.MaxAmmoClip = clip;
		this.Heavy = heavy;
		this._automatic = auto;
		this.Automatic = auto;
	}

	GetCount(): number {
		return 1;
	}
	Take(count: number): number {
		throw new Error("Method not implemented.");
	}
	Add(count: number): number {
		throw new Error("Method not implemented.");
	}
	AddItem(item: IItem): boolean {
		throw new Error("Method not implemented.");
	}

	public Clone(): Weapon {
		return new Weapon(
			this.Id,
			this.Name,
			{ Icon: this.Icon, ...this.Sprites },
			this._sounds,
			this._fireCooldown,
			this.AmmoId,
			this._damage,
			this._spread,
			this.Heavy,
			this.Automatic,
			this._reloadTime / 1000,
			this.MaxAmmoClip,
			this._recoil,
			Vector2.Div(this.GripOffset, this.Sprites.Image.Scale),
			Vector2.Div(this.MuzzleOffset, this.Sprites.Image.Scale),
			Vector2.Div(this.ClipOffset, this.Sprites.Image.Scale)
		);
	}

	public Is(other: Weapon): other is Weapon {
		return this.Id == other.Id;
	}

	public Update(dt: number, position: Vector2, angle: number, direction: Direction) {
		this._position = new Vector2(position.X - (this._recoilCompensationAcceleration < dt ? 2 : 0), position.Y);
		this._direction = direction;

		angle -= this.GetRecoilOffset() * this._direction;
		const dir = angle >= 0 ? angle : 2 * Math.PI + angle;
		const c = Math.cos(dir);
		const s = Math.sin(dir);
		const x = this.MuzzleOffset.X - this.GripOffset.X;
		const hit = Scene.Current.Raycast(new Vector2(this._position.X + c * x, this._position.Y - s * x), new Vector2(c, -s), 1500, Tag.Wall)[0];
		// this._viewOffset = hit === undefined ? 0 : Math.tan((this.MuzzleOffset.Y - this.GripOffset.Y) / Vector2.Length(this._position, hit.position));
		// console.log(hit === undefined ? 0 : Math.tan((this.MuzzleOffset.Y - this.GripOffset.Y) / Vector2.Length(this._position, hit.position)));

		this._angle = angle + (hit === undefined ? 0 : this._direction * Math.tan((this.MuzzleOffset.Y - this.GripOffset.Y) / Vector2.Length(this._position, hit.position)));

		if (this._timeToRecoilStop > 0) {
			this._timeToRecoilStop -= this._recoilCompensationAcceleration;
			this._recoilCompensationAcceleration += dt * 0.25;

			if (this._timeToRecoilStop <= 0) this._timeToRecoilStop = 0;
		}

		if (this._secondsToReload > 0) {
			this._secondsToReload -= dt;

			if (this._secondsToReload <= 0) {
				this._loadedAmmo = this._loadedAmmo + this._ammoToReload;
				this.Automatic = this._automatic;

				this._hasClip = true;
				this._ammoToReload = 0;
			}
		}

		this._secondsToCooldown -= dt;
	}

	public Render() {
		if (this._direction === Direction.Left) {
			if (this._hasClip)
				Canvas.DrawImageWithAngleVFlipped(
					this.Sprites.Clip,
					new Rectangle(this._position.X, this._position.Y, this.Sprites.Clip.ScaledSize.X, this.Sprites.Clip.ScaledSize.Y),
					this._angle,
					-this.GripOffset.X + this.ClipOffset.X,
					this.GripOffset.Y - this.ClipOffset.Y + this.Sprites.Clip.ScaledSize.Y
				);

			Canvas.DrawImageWithAngleVFlipped(
				this.Sprites.Image,
				new Rectangle(this._position.X, this._position.Y, this.Sprites.Image.ScaledSize.X, this.Sprites.Image.ScaledSize.Y),
				this._angle,
				-this.GripOffset.X,
				this.GripOffset.Y
			);

			// Canvas.SetFillColor(Color.Red);
			// Canvas.DrawCircle(this._position.X  , this._position.Y, 5);
		} else {
			if (this._hasClip)
				Canvas.DrawImageWithAngle(
					this.Sprites.Clip,
					new Rectangle(this._position.X, this._position.Y, this.Sprites.Clip.ScaledSize.X, this.Sprites.Clip.ScaledSize.Y),
					this._angle,
					-this.GripOffset.X + this.ClipOffset.X,
					this.GripOffset.Y - this.ClipOffset.Y + this.Sprites.Clip.ScaledSize.Y
				);

			// Canvas.SetFillColor(Color.Red);
			// Canvas.DrawCircle(this._position.X  , this._position.Y, 15);

			Canvas.DrawImageWithAngle(
				this.Sprites.Image,
				new Rectangle(this._position.X, this._position.Y, this.Sprites.Image.ScaledSize.X, this.Sprites.Image.ScaledSize.Y),
				this._angle,
				-this.GripOffset.X,
				this.GripOffset.Y
			);
		}
	}

	public Reload(toReload = this.MaxAmmoClip) {
		if (this._secondsToReload > 0) return;
		if (toReload <= 0) return;

		this._ammoToReload = toReload;
		this._secondsToReload = this._reloadTime;
		this._sounds.Reload.Play(0.5, (this._sounds.Reload.Length * 1000) / this._reloadTime);
	}

	public Load() {
		this._hasClip = true;
		this._loadedAmmo = this.MaxAmmoClip;
	}

	public GetReloadProgress() {
		return 1 - this._secondsToReload / this._reloadTime;
	}

	public GetLoadedAmmo() {
		return this._loadedAmmo;
	}

	public IsReloading(): boolean {
		return this._secondsToReload > 0;
	}

	public GetFillClipRatio() {
		return this._loadedAmmo / (this.MaxAmmoClip - 1);
	}

	public DropMag() {
		if (!this._hasClip) return;

		this._hasClip = false;

		Scene.Current.Instantiate(
			new DroppedClip(
				this._position.X + (this._direction === Direction.Left ? this.GripOffset.X - this.ClipOffset.X - this.Sprites.Clip.ScaledSize.X : this.ClipOffset.X - this.GripOffset.X),
				this._position.Y - (this.GripOffset.Y + this.ClipOffset.Y) - this.Sprites.Clip.ScaledSize.Y,
				this
			)
		);
	}

	public ConnectMag() {
		if (this._hasClip) return;

		this._hasClip = true;
	}

	public GetRecoilOffset() {
		return (this._timeToRecoilStop / 1000) * this._recoil;
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
		this._timeToRecoilStop = Math.min(this._timeToRecoilStop + 200, 1000);
		this._recoilCompensationAcceleration = 0;

		const dir = this._angle + (Math.random() - 0.5) * this._spread;
		const c = Math.cos(dir);
		const s = Math.sin(dir);
		const x = this.MuzzleOffset.X - this.GripOffset.X;
		const y = (this.MuzzleOffset.Y - this.GripOffset.Y) * Math.sign(c);
		const muzzlePosition = new Vector2(this._position.X + c * x + s * y, this._position.Y + c * y - s * x);

		const hit = Scene.Current.Raycast(muzzlePosition, new Vector2(Math.cos(dir), -Math.sin(dir)), 1500, tag | Tag.Wall)[0];
		if (hit !== undefined) {
			if (hit.instance instanceof Entity) {
				hit.instance.TakeDamage(this._damage);
				this._sounds.Hit.Play(0.15);

				const bloodCount = Math.round((Math.random() + 1) * 2);
				for (let i = 0; i < bloodCount; i++) {
					const bloodOffset = (Math.random() - 0.5) / 2;
					const bloodDir = new Vector2(Math.cos(this._angle + bloodOffset), -Math.sin(this._angle + bloodOffset));

					Scene.Current.Instantiate(new Blood(new Vector2(hit.position.X, hit.position.Y), new Vector2(bloodDir.X * 50, bloodDir.Y * 30)));
				}
			} else {
				this._sounds.Impact.Play((1 - Vector2.Length(muzzlePosition, hit.position) / 1500) * 0.5);
			}
		}

		Scene.Current.Instantiate(new Bullet(muzzlePosition.X, muzzlePosition.Y, hit === undefined ? 2000 : Vector2.Length(muzzlePosition, hit.position), dir));
		Scene.Current.Instantiate(new Fireball(muzzlePosition, this._angle));

		this._loadedAmmo--;
		this._sounds.Fire.Play(0.5);

		setTimeout(() => {
			this._sounds.Shell?.Play(0.1);
		}, 300);

		return true;
	}
}
