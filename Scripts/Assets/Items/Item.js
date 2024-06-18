import { Canvas } from "../../Context.js";
import { GetSound, GetSprite } from "../../Game.js";
import { Scene } from "../../Scene.js";
import { LoadImage, Rectangle, Vector2 } from "../../Utilites.js";
export class Item {
    _usingSound;
    Icon;
    UseTime;
    Big = false;
    _isUsing = false;
    _usingTime = -1;
    _usingCallback;
    Update(dt, position, angle) {
        if (this._usingTime >= 0) {
            this._usingTime += dt;
            if (this._usingTime >= this.UseTime) {
                this._usingTime = -1;
                this._usingCallback();
                this.OnUsed();
            }
        }
    }
    Use(callback) {
        if (this._isUsing)
            return;
        this._isUsing = true;
        this._usingSound?.Play();
        this._usingCallback = callback;
        this._usingTime = 0;
    }
    Render(at, angle) { }
    IsUsing() {
        return this._isUsing;
    }
    OnUsed() { }
}
export class Vodka extends Item {
    UseTime = 2500;
    Icon = LoadImage("Images/Items/Vodka.png");
    _usingSound = GetSound("Drink");
    static toString() {
        return "Водка";
    }
    Render(at, angle) {
        const ratio = this.Icon.BoundingBox.Width / this.Icon.BoundingBox.Height;
        Canvas.DrawImageWithAngle(this.Icon, new Rectangle(at.X, at.Y, 35 * ratio, 35), angle, -(35 * ratio) / 2, 35);
    }
}
export class Radio extends Item {
    UseTime = 1000;
    Icon = GetSprite("Radio");
    static toString() {
        return "Радио";
    }
    Render(at, angle) {
        const ratio = this.Icon.BoundingBox.Width / this.Icon.BoundingBox.Height;
        Canvas.DrawImageWithAngle(this.Icon, new Rectangle(at.X, at.Y, 25 * ratio, 25), angle, -10, 10);
    }
    OnUsed() {
        Scene.Player.Heal(10);
    }
}
export class AidKit extends Item {
    UseTime = 5500;
    Icon = LoadImage("Images/Items/FirstAid.png");
    Big = true;
    _usingSound = GetSound("AidKit");
    static toString() {
        return "Аптека";
    }
    Render(at) {
        const ratio = this.Icon.BoundingBox.Height / this.Icon.BoundingBox.Width;
        const offset = new Vector2(-28, -40);
        Canvas.DrawImage(this.Icon, new Rectangle(at.X + offset.X, at.Y + offset.Y, 50, 50 * ratio));
    }
    OnUsed() {
        Scene.Player.Heal(50);
    }
}
export class Sausage extends Item {
    UseTime = 1500;
    Icon = LoadImage("Images/Items/MeatStick.png");
    _usingSound = GetSound("Eat");
    static toString() {
        return "Колбаса";
    }
    Render(at, angle) {
        const ratio = this.Icon.BoundingBox.Width / this.Icon.BoundingBox.Height;
        Canvas.DrawImageWithAngle(this.Icon, new Rectangle(at.X, at.Y, 15 * ratio, 15), angle + Math.PI / 2, -15, 7);
    }
    OnUsed() {
        Scene.Player.Heal(10);
    }
}
export class Adrenalin extends Item {
    UseTime = 1000;
    Icon = LoadImage("Images/Items/Syringe.png");
    _usingSound = GetSound("Syringe");
    static toString() {
        return "Адреналин";
    }
    Render(at, angle) {
        const ratio = this.Icon.BoundingBox.Width / this.Icon.BoundingBox.Height;
        Canvas.DrawImageWithAngle(this.Icon, new Rectangle(at.X, at.Y, 25 * ratio, 25), angle, -3, 3);
    }
    OnUsed() {
        Scene.Player.Heal(10);
    }
}
export class Bread extends Item {
    UseTime = 1500;
    Icon = LoadImage("Images/Items/Bread.png");
    _usingSound = GetSound("Eat");
    static toString() {
        return "Хлеб";
    }
    Render(at, angle) {
        const ratio = this.Icon.BoundingBox.Width / this.Icon.BoundingBox.Height;
        Canvas.DrawImageWithAngle(this.Icon, new Rectangle(at.X, at.Y, 25 * ratio, 25), angle, -10, 10);
    }
    OnUsed() {
        Scene.Player.Heal(15);
    }
}
