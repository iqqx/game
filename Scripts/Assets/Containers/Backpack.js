import { Canvas } from "../../Context.js";
import { Tag } from "../../Enums.js";
import { Scene } from "../../Scene.js";
import { LoadImage, LoadSound, Rectangle } from "../../Utilites.js";
import { Container } from "./Containers.js";
export class Backpack extends Container {
    static _image = LoadImage(`Images/Player/Drop_backpack.png`, new Rectangle(11, 13, 10, 6), 5);
    static _sound = LoadSound("Sounds/backpack_pickup.mp3");
    OnPickup;
    constructor(x, y, ...content) {
        super(50, 25, 4, 1);
        for (let i = 0; i < content.length; i++)
            this._items[0][i] = content[i];
        this.Tag = Tag.Pickable;
        this._x = x;
        this._y = y;
    }
    Render() {
        Canvas.DrawImage(Backpack._image, new Rectangle(this._x - Scene.Current.GetLevelPosition(), this._y, this.Width, this.Height));
    }
    Pickup() {
        if (this.OnPickup !== undefined)
            this.OnPickup();
        Scene.Player.PutBackpack(this);
        Backpack._sound.Play(0.5);
        this.Destroy();
        return this._items;
    }
    GetInteractives() {
        return ["подобрать", "открыть"];
    }
    OnInteractSelected(id) {
        switch (id) {
            case 0:
                this.Pickup();
                break;
            case 1:
                Scene.Player.OpenContainer(this);
                break;
        }
    }
}
