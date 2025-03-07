import { Canvas } from "../../Context.js";
import { Direction, Tag } from "../../Enums.js";
import { Blood } from "../../GameObjects/Blood.js";
import { Bullet } from "../../GameObjects/Bullet.js";
import { DroppedClip } from "../../GameObjects/DroppedClip.js";
import { Entity } from "../../GameObjects/Entity.js";
import { Fireball } from "../../GameObjects/Fireball.js";
import { Scene } from "../../Scene.js";
import { Vector2, Rectangle, GetMaxIdentityString } from "../../Utilites.js";
import { GetSound, GetSprite } from "../../AssetsLoader.js";
export class Weapon {
    Sprites;
    IsBig = true;
    MaxStack = 1;
    AmmoId;
    _sounds;
    _fireCooldown;
    _reloadTime;
    _damage;
    _spread;
    _recoil;
    GripOffset;
    MuzzleOffset;
    ClipOffset;
    MaxAmmoClip = 30;
    _automatic;
    Heavy;
    Automatic;
    _loadedAmmo = 0;
    _position = Vector2.Zero;
    _angle = 0;
    _recoilCompensationAcceleration = 0;
    _secondsToCooldown = 0;
    _secondsToReload = 0;
    _ammoToReload = 0;
    _timeToRecoilStop = 0;
    _hasClip;
    _direction;
    static _weapons = [];
    static GetById(id) {
        const w = Weapon._weapons.find((x) => x.Id === id);
        if (w === undefined) {
            // console.error(`Оружие с идентификатором '${id}' не зарегистрировано.`);
            return undefined;
        }
        return w.Clone();
    }
    static Register(rawJson) {
        if (rawJson.Name === undefined)
            throw new Error(`Название [Name] не определено (Ближайший ключ: [${GetMaxIdentityString("Name", Object.keys(rawJson)).replaceAll(" ", "_")}])\nat Parser: [Предмет: <${rawJson.Id}>]`);
        Weapon._weapons.push(new Weapon(rawJson.Id, rawJson.Name, { Icon: GetSprite(rawJson.Sprites.Icon), Image: GetSprite(rawJson.Sprites.Main), Clip: GetSprite(rawJson.Sprites.Clip) }, {
            Fire: GetSound(rawJson.Sounds.Shoot),
            Shell: rawJson.Sounds.ShellImpact === undefined ? undefined : GetSound(rawJson.Sounds.ShellImpact),
            Reload: GetSound(rawJson.Sounds.Reload),
        }, 1000 / rawJson.ShootsPerSecond, rawJson.AmmoId, rawJson.Damage, rawJson.Spread, rawJson.IsHeavy, rawJson.IsAutomatic, rawJson.ReloadTime, rawJson.ClipCapacity, rawJson.Recoil, new Vector2(rawJson.PixelsOffsets.Grip.X, rawJson.PixelsOffsets.Grip.Y), new Vector2(rawJson.PixelsOffsets.Muzzle.X, rawJson.PixelsOffsets.Muzzle.Y), new Vector2(rawJson.PixelsOffsets.Clip.X, rawJson.PixelsOffsets.Clip.Y)));
    }
    constructor(id, name, images, sounds, fireCooldown, ammoId, damage, spread, heavy, auto, reloadTime, clip, recoil, handOffset, muzzleOffset, clipOffset) {
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
    GetCount() {
        return 1;
    }
    Take(count) {
        throw new Error("Method not implemented.");
    }
    Add(count) {
        throw new Error("Method not implemented.");
    }
    Clone() {
        return new Weapon(this.Id, this.Name, { Icon: this.Icon, ...this.Sprites }, this._sounds, this._fireCooldown, this.AmmoId, this._damage, this._spread, this.Heavy, this.Automatic, this._reloadTime / 1000, this.MaxAmmoClip, this._recoil, Vector2.Div(this.GripOffset, this.Sprites.Image.Scale), Vector2.Div(this.MuzzleOffset, this.Sprites.Image.Scale), Vector2.Div(this.ClipOffset, this.Sprites.Image.Scale));
    }
    Is(other) {
        return this.Id == other.Id;
    }
    Update(dt, position, angle, direction) {
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
            if (this._timeToRecoilStop <= 0)
                this._timeToRecoilStop = 0;
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
    Render() {
        if (this._direction === Direction.Left) {
            if (this._hasClip)
                Canvas.DrawImageWithAngleVFlipped(this.Sprites.Clip, new Rectangle(this._position.X - Scene.Current.GetLevelPosition(), this._position.Y, this.Sprites.Clip.ScaledSize.X, this.Sprites.Clip.ScaledSize.Y), this._angle, -this.GripOffset.X + this.ClipOffset.X, this.GripOffset.Y - this.ClipOffset.Y + this.Sprites.Clip.ScaledSize.Y);
            Canvas.DrawImageWithAngleVFlipped(this.Sprites.Image, new Rectangle(this._position.X - Scene.Current.GetLevelPosition(), this._position.Y, this.Sprites.Image.ScaledSize.X, this.Sprites.Image.ScaledSize.Y), this._angle, -this.GripOffset.X, this.GripOffset.Y);
            // Canvas.SetFillColor(Color.Red);
            // Canvas.DrawCircle(this._position.X - Scene.Current.GetLevelPosition(), this._position.Y, 5);
        }
        else {
            if (this._hasClip)
                Canvas.DrawImageWithAngle(this.Sprites.Clip, new Rectangle(this._position.X - Scene.Current.GetLevelPosition(), this._position.Y, this.Sprites.Clip.ScaledSize.X, this.Sprites.Clip.ScaledSize.Y), this._angle, -this.GripOffset.X + this.ClipOffset.X, this.GripOffset.Y - this.ClipOffset.Y + this.Sprites.Clip.ScaledSize.Y);
            // Canvas.SetFillColor(Color.Red);
            // Canvas.DrawCircle(this._position.X - Scene.Current.GetLevelPosition(), this._position.Y, 15);
            Canvas.DrawImageWithAngle(this.Sprites.Image, new Rectangle(this._position.X - Scene.Current.GetLevelPosition(), this._position.Y, this.Sprites.Image.ScaledSize.X, this.Sprites.Image.ScaledSize.Y), this._angle, -this.GripOffset.X, this.GripOffset.Y);
            // const dir = this._angle >= 0 ? this._angle : 2 * Math.PI + this._angle;
            // const c = Math.cos(dir);
            // const s = Math.sin(dir);
            // const x = this.MuzzleOffset.X - this.GripOffset.X;
            // const preMuzzlePosition = new Vector2(this._position.X + c * x, this._position.Y - s * x);
            // const hit = Scene.Current.Raycast(preMuzzlePosition, new Vector2(c, -s), 1500, Tag.Wall)[0];
            // if (hit !== undefined) {
            // 	const l = Vector2.Length(this._position, hit.position);
            // 	this._viewOffset = Math.tan((this.MuzzleOffset.Y - this.GripOffset.Y) / l);
            // 	// this._angle += Math.tan((this.MuzzleOffset.Y - this.GripOffset.Y) / l);
            // 	Canvas.SetFillColor(Color.Red);
            // 	Canvas.SetStroke(Color.Red, 1);
            // 	Canvas.DrawLine(
            // 		new Vector2(preMuzzlePosition.X - Scene.Current.GetLevelPosition(), preMuzzlePosition.Y),
            // 		new Vector2(hit.position.X - Scene.Current.GetLevelPosition(), hit.position.Y)
            // 	);
            // 	// Canvas.SetStroke(Color.Green, 1);
            // 	// Canvas.DrawLine(
            // 	// 	new Vector2(this._position.X - Scene.Current.GetLevelPosition(), this._position.Y),
            // 	// 	new Vector2(hit.position.X - Scene.Current.GetLevelPosition(), hit.position.Y)
            // 	// );
            // 	Canvas.SetFillColor(Color.Red);
            // 	Canvas.DrawCircle(hit.position.X - Scene.Current.GetLevelPosition(), hit.position.Y, 2);
            // }
            // const c = Math.cos(this._angle);
            // const s = Math.sin(this._angle);
            // Canvas.SetFillColor(Color.Red);
            // Canvas.DrawCircle(
            // 	this._position.X - Scene.Current.GetLevelPosition() - this.GripOffset.X + this.ClipOffset.X,
            // 	this._position.Y + this.GripOffset.Y - this.ClipOffset.Y + this.Sprites.Clip.ScaledSize.Y,
            // 	2
            // );
            // Canvas.SetFillColor(Color.White);
            // Canvas.DrawCircle(
            // 	this._position.X - Scene.Current.GetLevelPosition() + c * (this.MuzzleOffset.X - this.GripOffset.X) + s * (this.MuzzleOffset.Y - this.GripOffset.Y),
            // 	this._position.Y + c * (this.MuzzleOffset.Y - this.GripOffset.Y) - s * (this.MuzzleOffset.X - this.GripOffset.X),
            // 	2
            // );
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
        Scene.Current.Instantiate(new DroppedClip(this._position.X + (this._direction === Direction.Left ? this.GripOffset.X - this.ClipOffset.X - this.Sprites.Clip.ScaledSize.X : this.ClipOffset.X - this.GripOffset.X), this._position.Y - (this.GripOffset.Y + this.ClipOffset.Y) - this.Sprites.Clip.ScaledSize.Y, this));
    }
    ConnectMag() {
        if (this._hasClip)
            return;
        this._hasClip = true;
    }
    GetRecoilOffset() {
        return (this._timeToRecoilStop / 1000) * this._recoil;
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
            }
            else {
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
//# sourceMappingURL=Weapon.js.map