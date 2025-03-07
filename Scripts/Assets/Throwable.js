import { GetSprite } from "../AssetsLoader.js";
import { Canvas } from "../Context.js";
import { Direction } from "../Enums.js";
import { FlyingThrowable } from "../GameObjects/FlyingThrowable.js";
import { Scene } from "../Scene.js";
import { Vector2, Rectangle, GetMaxIdentityString } from "../Utilites.js";
export class Throwable {
    Name;
    Id;
    Icon;
    IsBig = false;
    MaxStack = 1;
    Sprite;
    _position = Vector2.Zero;
    _angle = 0;
    _direction;
    static _throwables = [];
    static GetById(id) {
        const t = Throwable._throwables.find((x) => x.Id === id);
        if (t === undefined) {
            // console.error(`Кидательное с идентификатором '${id}' не зарегистрировано.`);
            return undefined;
        }
        return t.Clone();
    }
    static Register(rawJson) {
        if (rawJson.Name === undefined)
            throw new Error(`Название [Name] не определено (Ближайший ключ: [${GetMaxIdentityString("Name", Object.keys(rawJson)).replaceAll(" ", "_")}])\nat Parser: [Предмет: <${rawJson.Id}>]`);
        Throwable._throwables.push(new Throwable(rawJson.Id, rawJson.Name, { Icon: GetSprite(rawJson.Sprites.Icon), View: GetSprite(rawJson.Sprites.Main) }));
    }
    constructor(id, name, images) {
        this.Id = id;
        this.Name = name;
        this.Icon = images.Icon;
        this.Sprite = images.View;
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
    Is(item) {
        return item.Id === this.Id;
    }
    Clone() {
        return new Throwable(this.Id, this.Name, { View: this.Sprite, Icon: this.Icon });
    }
    Update(dt, position, angle, direction) {
        this._position = position;
        this._direction = direction;
        this._angle = angle;
    }
    Render() {
        const gripOffset = new Vector2(this.Sprite.ScaledSize.X * -0.5, this.Sprite.ScaledSize.Y * 0.5);
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