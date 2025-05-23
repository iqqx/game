import { GetSprite, GetSound } from "../../AssetsLoader.js";
import { Canvas } from "../../Context.js";
import { Tag } from "../../Enums.js";
import { Scene } from "../../Scenes/Scene.js";
import { Rectangle } from "../../Utilites.js";
import { Container } from "./Containers.js";
export class Backpack extends Container {
    OnPickup;
    constructor(x, y, ...content) {
        super(50, 35, 4, 1);
        for (let i = 0; i < content.length; i++)
            this._items[0][i] = content[i];
        this.Tag = Tag.Pickable;
        this._x = x;
        this._y = y;
    }
    Render() {
        Canvas.DrawImage(GetSprite("Drop_Backpack"), new Rectangle(this._x, this._y, this.Width, this.Height));
    }
    Pickup() {
        if (this.OnPickup !== undefined)
            this.OnPickup();
        Scene.Current.Player.PutBackpack(this);
        GetSound("Backpack_Pickup").Play(0.5);
        Scene.Destroy(this);
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
                Scene.Current.Player.OpenContainer(this);
                break;
        }
    }
}
//# sourceMappingURL=Backpack.js.map