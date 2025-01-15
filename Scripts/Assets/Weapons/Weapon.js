import { Canvas } from "../../Context.js";
import { Tag } from "../../Enums.js";
import { GetSound, GetSprite } from "../../Game.js";
import { Blood } from "../../GameObjects/Blood.js";
import { Bullet } from "../../GameObjects/Bullet.js";
import { Entity } from "../../GameObjects/Entity.js";
import { Fireball } from "../../GameObjects/Fireball.js";
import { Scene } from "../../Scene.js";
import { Vector2, Rectangle } from "../../Utilites.js";
import { Item } from "../Items/Item.js";
export class Weapon extends Item {
    Sprites;
    _sounds;
    Id;
    _fireCooldown;
    _reloadTime;
    _damage;
    _spread;
    _width;
    HandOffset;
    MuzzleOffset;
    ClipOffset;
    MaxAmmoClip = 30;
    _automatic;
    _droppedClips = [];
    Heavy;
    Automatic;
    _loadedAmmo = 0;
    _position = Vector2.Zero;
    _angle = 0;
    _secondsToCooldown = 0;
    _secondsToReload = 0;
    _ammoToReload = 0;
    _timeToRecoilStop = 0;
    _hasClip = false;
    static _weapons = [];
    constructor(id, images, sounds, fireCooldown, damage, spread, heavy, auto, reloadTime, clip, handOffset, muzzleOffset, clipOffset) {
        super(1);
        this.Id = id;
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
        this.HandOffset = handOffset;
        this.MuzzleOffset = muzzleOffset;
        this.ClipOffset = clipOffset;
        this._reloadTime = reloadTime * 1000;
        this.MaxAmmoClip = clip;
        this.Heavy = heavy;
        this._automatic = auto;
        this.Automatic = auto;
        this._width = 30 * (this.Sprites.Image.BoundingBox.Width / this.Sprites.Image.BoundingBox.Height);
    }
    static GetById(id) {
        const w = Weapon._weapons.find((x) => x.Id === id);
        if (w === undefined)
            console.error(`Оружие с идентификатором '${id}' не зарегистрировано.`);
        return w;
    }
    static Register(rawJson) {
        Weapon._weapons.push(new Weapon(rawJson.Id, { Icon: GetSprite(rawJson.Sprites.Icon), Image: GetSprite(rawJson.Sprites.Main) }, { Fire: GetSound(rawJson.Sounds.Shoot), Shell: rawJson.Sounds.ShellImpact === undefined ? undefined : GetSound(rawJson.Sounds.ShellImpact) }, 1000 / rawJson.ShootsPerSecond, rawJson.Damage, rawJson.Spread, rawJson.IsHeavy, rawJson.IsAutomatic, rawJson.ReloadTime, rawJson.ClipCapacity, new Vector2(rawJson.PixelsOffsets.Grip.X, rawJson.PixelsOffsets.Grip.Y), new Vector2(rawJson.PixelsOffsets.Muzzle.X, rawJson.PixelsOffsets.Muzzle.Y), new Vector2(rawJson.PixelsOffsets.Clip.X, rawJson.PixelsOffsets.Clip.Y)));
    }
    Update(dt, position, angle) {
        this._position = position;
        this._angle = angle;
        if (this._timeToRecoilStop > 0)
            this._timeToRecoilStop -= dt;
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
    Render() {
        const ratio = this._width / this.Sprites.Image.BoundingBox.Width;
        const clip = GetSprite("Rifle_Clip");
        for (const clipPos of this._droppedClips)
            Canvas.DrawImage(clip, new Rectangle(clipPos.X - Scene.Current.GetLevelPosition(), clipPos.Y, clip.BoundingBox.Width * ratio, clip.BoundingBox.Height * ratio));
        if (this._angle < Math.PI / -2 || this._angle > Math.PI / 2) {
            if (this._hasClip)
                Canvas.DrawImageWithAngleVFlipped(clip, new Rectangle(this._position.X - Scene.Current.GetLevelPosition(), this._position.Y, clip.BoundingBox.Width * ratio, clip.BoundingBox.Height * ratio), this._angle, this.HandOffset.X + this.ClipOffset.X, this.HandOffset.Y + this.ClipOffset.Y);
            Canvas.DrawImageWithAngleVFlipped(this.Sprites.Image, new Rectangle(this._position.X - Scene.Current.GetLevelPosition(), this._position.Y, this._width, this.Sprites.Image.BoundingBox.Height * ratio), this._angle, this.HandOffset.X, this.HandOffset.Y);
        }
        else {
            if (this._hasClip)
                Canvas.DrawImageWithAngle(clip, new Rectangle(this._position.X - Scene.Current.GetLevelPosition(), this._position.Y, clip.BoundingBox.Width * ratio, clip.BoundingBox.Height * ratio), this._angle, this.HandOffset.X + this.ClipOffset.X, this.HandOffset.Y + this.ClipOffset.Y);
            Canvas.DrawImageWithAngle(this.Sprites.Image, new Rectangle(this._position.X - Scene.Current.GetLevelPosition(), this._position.Y, this._width, this.Sprites.Image.BoundingBox.Height * ratio), this._angle, this.HandOffset.X, this.HandOffset.Y);
        }
    }
    Reload(toReload = this.MaxAmmoClip) {
        if (this._secondsToReload > 0)
            return;
        if (toReload <= 0)
            return;
        this._ammoToReload = toReload;
        this._secondsToReload = this._reloadTime;
        this._sounds.Reload.Play(0.5, (this._sounds.Reload.Length * 1000) / this._reloadTime);
    }
    Load() {
        this._hasClip = true;
        this._loadedAmmo = this.MaxAmmoClip;
    }
    GetReloadProgress() {
        return 1 - this._secondsToReload / this._reloadTime;
    }
    GetLoadedAmmo() {
        return this._loadedAmmo;
    }
    IsReloading() {
        return this._secondsToReload > 0;
    }
    GetFillClipRatio() {
        return this._loadedAmmo / (this.MaxAmmoClip - 1);
    }
    DropMag() {
        if (!this._hasClip)
            return;
        this._hasClip = false;
        const hits = Scene.Current.Raycast(Vector2.Add(this._position, this.ClipOffset), Vector2.Down, 1000, Tag.Wall);
        this._droppedClips.push(new Vector2(this._position.X + this.ClipOffset.X, hits === undefined ? this._position.Y : hits[0].position.Y));
    }
    ConnectMag() {
        if (this._hasClip)
            return;
        this._hasClip = true;
    }
    TryShoot(tag = Tag.Enemy) {
        if (this._secondsToCooldown > 0 || this._secondsToReload > 0) {
            return false;
        }
        else if (this._loadedAmmo <= 0) {
            this._sounds.EmptyFire.Play(0.5);
            this._secondsToCooldown = this._fireCooldown;
            this.Automatic = false;
            return false;
        }
        this._secondsToCooldown = this._fireCooldown;
        this._timeToRecoilStop += 20;
        const muzzlePosition = new Vector2(this._position.X + Math.cos(this._angle) * (this._width + this.MuzzleOffset.X), this._position.Y - Math.sin(this._angle) * (this._width + this.MuzzleOffset.Y));
        const offset = (Math.random() - 0.5) * this._spread * (this._timeToRecoilStop * 0.02);
        const dir = this._angle - offset;
        const hit = Scene.Current.Raycast(muzzlePosition, new Vector2(Math.cos(dir), -Math.sin(dir)), 1500, tag | Tag.Wall)[0];
        if (hit !== undefined && hit.instance instanceof Entity) {
            hit.instance.TakeDamage(this._damage);
            this._sounds.Hit.Play(0.15);
            const bloodCount = Math.round((Math.random() + 1) * 2);
            for (let i = 0; i < bloodCount; i++) {
                const offset = (Math.random() - 0.5) / 2;
                const bloodDir = new Vector2(Math.cos(this._angle + offset), -Math.sin(this._angle + offset));
                Scene.Current.Instantiate(new Blood(new Vector2(hit.position.X, hit.position.Y), new Vector2(bloodDir.X * 50, bloodDir.Y * 30)));
            }
        }
        else if (hit !== undefined) {
            this._sounds.Impact.Play((1 - Math.sqrt((muzzlePosition.X + Math.cos(this._angle) * 100 - hit.position.X) ** 2 + (muzzlePosition.Y - Math.sin(this._angle) * 100 - hit.position.Y) ** 2) / 1500) * 0.25);
        }
        Scene.Current.Instantiate(new Bullet(muzzlePosition.X + Math.cos(this._angle) * 100, muzzlePosition.Y - Math.sin(this._angle) * 100, hit === undefined
            ? 2000
            : Math.sqrt((muzzlePosition.X + Math.cos(this._angle) * 100 - hit.position.X) ** 2 + (muzzlePosition.Y - Math.sin(this._angle) * 100 - hit.position.Y) ** 2), dir));
        Scene.Current.Instantiate(new Fireball(muzzlePosition.X, muzzlePosition.Y, this._angle, this.MuzzleOffset));
        this._loadedAmmo--;
        this._sounds.Fire.Play(0.5);
        setTimeout(() => {
            this._sounds.Shell?.Play(0.1);
        }, 300);
        return true;
    }
}
// export class Glock extends Weapon {
// 	constructor() {
// 		super(
// 			{
// 				Icon: GetSprite("Glock_Icon"),
// 				Image: GetSprite("Glock"),
// 			},
// 			{
// 				Fire: GetSound("Shoot_3"),
// 				Shell: GetSound("Shell"),
// 			},
// 			200,
// 			20,
// 			0.05,
// 			false,
// 			false,
// 			2500,
// 			7,
// 			new Vector2(40, 10),
// 			new Vector2(30, 10),
// 			new Vector2(0, 0)
// 		);
// 	}
// 	static toString(): string {
// 		return "Пистолет";
// 	}
// }
// export class AK extends Weapon {
// 	private static readonly _fireCooldown = 120;
// 	private static readonly _damage = 60;
// 	private static readonly _spread = 0.2;
// 	constructor() {
// 		super(
// 			{
// 				Icon: GetSprite("AK_Icon"),
// 				Image: GetSprite("AK"),
// 			},
// 			{
// 				Fire: GetSound("Shoot_1"),
// 				Shell: GetSound("Shell"),
// 			},
// 			AK._fireCooldown,
// 			AK._damage,
// 			AK._spread,
// 			true,
// 			true,
// 			2500,
// 			30,
// 			new Vector2(5, 18),
// 			new Vector2(0, 0),
// 			new Vector2(25, 0)
// 		);
// 	}
// 	static toString(): string {
// 		return "Калак 12";
// 	}
// }
//# sourceMappingURL=Weapon.js.map