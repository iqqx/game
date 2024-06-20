import { Canvas } from "../../Context.js";
import { Tag } from "../../Enums.js";
import { Blood } from "../../GameObjects/Blood.js";
import { Bullet } from "../../GameObjects/Bullet.js";
import { Entity } from "../../GameObjects/Entity.js";
import { Fireball } from "../../GameObjects/Fireball.js";
import { Scene } from "../../Scene.js";
import { Vector2, Rectangle, LoadSound, LoadImage } from "../../Utilites.js";
import { Item } from "../Items/Item.js";
export class Weapon extends Item {
    Sprites;
    _sounds;
    _fireCooldown;
    _reloadTime;
    _damage;
    _spread;
    _width;
    _handOffset;
    _muzzleOffset;
    _maxAmmoClip = 30;
    _automatic;
    Automatic;
    _loadedAmmo = 5;
    _position = Vector2.Zero;
    _angle = 0;
    _secondsToCooldown = 0;
    _secondsToReload = 0;
    constructor(images, sounds, fireCooldown, damage, spread, heavy, auto, reloadTime, clip, handOffset, muzzleOffset) {
        super();
        this.Icon = images.Icon;
        this.Sprites = images;
        this._sounds = {
            ...sounds,
            EmptyFire: LoadSound("Sounds/shoot_without.mp3"),
            Reload: LoadSound("Sounds/reload.wav"),
            Impact: LoadSound("Sounds/impact.mp3"),
            Hit: LoadSound("Sounds/hitmarker.mp3"),
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
    Update(dt, position, angle) {
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
    Render() {
        if (this.Heavy) {
            if (this._angle < Math.PI / -2 || this._angle > Math.PI / 2)
                Canvas.DrawImageWithAngleVFlipped(this.Sprites.Image, new Rectangle(this._position.X - Scene.Current.GetLevelPosition(), this._position.Y, this._width * this.Sprites.Image.Scale, 30 * this.Sprites.Image.Scale), this._angle, this._handOffset.X, this._handOffset.Y);
            else
                Canvas.DrawImageWithAngle(this.Sprites.Image, new Rectangle(this._position.X - Scene.Current.GetLevelPosition(), this._position.Y, this._width * this.Sprites.Image.Scale, 30 * this.Sprites.Image.Scale), this._angle, this._handOffset.X, this._handOffset.Y);
        }
        else {
            if (this._angle < Math.PI / -2 || this._angle > Math.PI / 2)
                Canvas.DrawImageWithAngleVFlipped(this.Sprites.Image, new Rectangle(this._position.X - Scene.Current.GetLevelPosition(), this._position.Y, this._width * this.Sprites.Image.Scale, 30 * this.Sprites.Image.Scale), this._angle, this._handOffset.X, this._handOffset.Y);
            else
                Canvas.DrawImageWithAngle(this.Sprites.Image, new Rectangle(this._position.X - Scene.Current.GetLevelPosition(), this._position.Y, this._width * this.Sprites.Image.Scale, 30 * this.Sprites.Image.Scale), this._angle, this._handOffset.X, this._handOffset.Y);
        }
    }
    Reload() {
        if (this._secondsToReload > 0)
            return;
        this._secondsToReload = this._reloadTime;
        this._sounds.Reload.Play(0.5);
    }
    GetLoadedAmmo() {
        return this._loadedAmmo;
    }
    IsReloading() {
        return this._secondsToReload > 0;
    }
    GetFillClipRatio() {
        return this._loadedAmmo / (this._maxAmmoClip - 1);
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
        const muzzlePosition = new Vector2(this._position.X + Math.cos(this._angle) * (this._width + this._muzzleOffset.X), this._position.Y - Math.sin(this._angle) * (this._width + this._muzzleOffset.Y));
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
        }
        else if (hit !== undefined) {
            this._sounds.Impact.Play((1 - Math.sqrt((muzzlePosition.X + Math.cos(this._angle) * 100 - hit.position.X) ** 2 + (muzzlePosition.Y - Math.sin(this._angle) * 100 - hit.position.Y) ** 2) / 1500) * 0.25);
        }
        Scene.Current.Instantiate(new Bullet(muzzlePosition.X + Math.cos(this._angle) * 100, muzzlePosition.Y - Math.sin(this._angle) * 100, hit === undefined
            ? 2000
            : Math.sqrt((muzzlePosition.X + Math.cos(this._angle) * 100 - hit.position.X) ** 2 + (muzzlePosition.Y - Math.sin(this._angle) * 100 - hit.position.Y) ** 2), dir));
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
    static _sprites = {
        Icon: LoadImage("Images/Glock-icon.png"),
        Image: LoadImage("Images/Pistol.png", new Rectangle(0, 3, 32, 28), 0.75),
    };
    static _sounds = {
        Fire: LoadSound("Sounds/shoot-3.mp3"),
        Shell: LoadSound("Sounds/shell.mp3"),
    };
    constructor() {
        super(Glock._sprites, Glock._sounds, 200, 20, 0.1, false, false, 2500, 7, new Vector2(40, 10), new Vector2(30, 10));
    }
    static toString() {
        return "Пистолет";
    }
}
export class AK extends Weapon {
    static _sprites = {
        Icon: LoadImage("Images/AK-icon.png"),
        Image: LoadImage("Images/Rifle.png", new Rectangle(16, 6, 43, 15)),
    };
    static _sounds = {
        Fire: LoadSound("Sounds/shoot-1.wav"),
    };
    static _fireCooldown = 150;
    static _damage = 40;
    static _spread = 0.01;
    constructor() {
        super(AK._sprites, AK._sounds, AK._fireCooldown, AK._damage, AK._spread, true, true, 2500, 30, new Vector2(0, 18), new Vector2(0, 0));
    }
    static toString() {
        return "Калак 12";
    }
}
//# sourceMappingURL=Weapon.js.map