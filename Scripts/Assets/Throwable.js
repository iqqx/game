import { GetSprite } from "../AssetsLoader.js";
import { Canvas } from "../Context.js";
import { Direction } from "../Enums.js";
import { FlyingThrowable } from "../GameObjects/FlyingThrowable.js";
import { Scene } from "../Scene.js";
import { Vector2, Rectangle } from "../Utilites.js";
import { Item } from "./Items/Item.js";
export class Throwable extends Item {
    Sprite;
    // private readonly _sounds: { readonly Fire: Sound; readonly Shell?: Sound; readonly EmptyFire: Sound; readonly Reload: Sound; readonly Impact: Sound; readonly Hit: Sound };
    Id;
    _position = Vector2.Zero;
    _angle = 0;
    _direction;
    static _throwables = [];
    static GetById(id) {
        const w = Throwable._throwables.find((x) => x.Id === id);
        if (w === undefined) {
            // console.error(`Кидательное с идентификатором '${id}' не зарегистрировано.`);
            return undefined;
        }
        return new Throwable(w.Id, { View: w.Sprite, Icon: w.Icon });
    }
    static Register(rawJson) {
        Throwable._throwables.push(new Throwable(rawJson.Id, { Icon: GetSprite(rawJson.Sprites.Icon), View: GetSprite(rawJson.Sprites.Main) }));
    }
    constructor(id, images) {
        super(1);
        this.Id = id;
        this.Icon = images.Icon;
        this.Sprite = images.View;
    }
    Update(dt, position, angle) {
        this._position = new Vector2(position.X, position.Y);
        this._direction = angle < Math.PI * -0.5 || angle > Math.PI * 0.5 ? Direction.Left : Direction.Right;
        this._angle = angle;
    }
    Render() {
        const gripOffset = new Vector2(-7 * this.Sprite.Scale, 10 * this.Sprite.Scale);
        if (this._direction === Direction.Left) {
            Canvas.DrawImageWithAngleVFlipped(this.Sprite, new Rectangle(this._position.X - Scene.Current.GetLevelPosition(), this._position.Y, this.Sprite.ScaledSize.X, this.Sprite.ScaledSize.Y), this._angle, gripOffset.X, gripOffset.Y);
        }
        else {
            Canvas.DrawImageWithAngle(this.Sprite, new Rectangle(this._position.X - Scene.Current.GetLevelPosition(), this._position.Y, this.Sprite.ScaledSize.X, this.Sprite.ScaledSize.Y), this._angle, gripOffset.X, gripOffset.Y);
        }
    }
    Throw() {
        Scene.Current.Instantiate(new FlyingThrowable(this._position.X, this._position.Y, this._angle, this));
    }
}
//# sourceMappingURL=Throwable.js.map