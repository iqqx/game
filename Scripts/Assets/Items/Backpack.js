import { Canvas } from "../../Context.js";
import { Tag } from "../../Enums.js";
import { Scene } from "../../Scene.js";
import { GameObject, LoadImage, LoadSound, Rectangle } from "../../Utilites.js";
export class Backpack extends GameObject {
    static _image = LoadImage(`Images/Player/Drop_backpack.png`, new Rectangle(11, 13, 10, 6), 5);
    static _sound = LoadSound("Sounds/backpack_pickup.mp3");
    _content;
    OnPickup;
    constructor(x, y, content) {
        super(50, 50);
        this._content = content;
        this.Tag = Tag.Pickable;
        this._x = x;
        this._y = y;
    }
    Render() {
        Canvas.DrawImage(Backpack._image, new Rectangle(this._x - Scene.Current.GetLevelPosition(), this._y, Backpack._image.ScaledSize.X, Backpack._image.ScaledSize.Y));
    }
    Pickup() {
        if (this.OnPickup !== undefined)
            this.OnPickup();
        Backpack._sound.Play(0.5);
        this.Destroy();
        return this._content;
    }
}
