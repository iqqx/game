import { Canvas } from "../../Context.js";
import { Tag } from "../../Enums.js";
import { Scene } from "../../Scene.js";
import { Container, LoadImage, LoadSound, Rectangle } from "../../Utilites.js";
export class Backpack extends Container {
    static _image = LoadImage(`Images/Player/Drop_backpack.png`, new Rectangle(11, 13, 10, 6), 5);
    static _sound = LoadSound("Sounds/backpack_pickup.mp3");
    OnPickup;
    constructor(x, y, ...content) {
        super(4, 1);
        for (let i = 0; i < content.length; i++)
            this._items[0][i] = content[i];
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
        Scene.Player.HasBackpack = true;
        Backpack._sound.Play(0.5);
        this.Destroy();
        return this._items;
    }
    GetInteractives() {
        return ["открыть", "подобрать"];
    }
    OnInteractSelected(id) {
        switch (id) {
            case 0:
                break;
            case 1:
                this.Pickup();
                break;
        }
    }
}
