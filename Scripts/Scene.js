import { Player } from "./GameObjects/Player.js";
import { Canvas } from "./Context.js";
import { Line, GetIntersectPoint, Lerp } from "./Utilites.js";
import { GameObject, Interactable } from "./GameObjects/GameObject.js";
export class Scene {
    static Current;
    _gameObjects = [];
    _interactableGameObjects = [];
    _background;
    static Player;
    Player;
    _levelPosition = 0;
    Time = 0;
    constructor(background) {
        this._background = background;
        Scene.Current = this;
    }
    GetLevelPosition() {
        return this._levelPosition;
    }
    GetCollide(who, tag) {
        for (const object of this._gameObjects) {
            if (tag !== undefined && (object.Tag & tag) === 0)
                continue;
            const collide = GameObject.GetCollide(who, object);
            if (collide !== false)
                return collide;
        }
        return false;
    }
    IsCollide(who, tag) {
        for (const object of this._gameObjects) {
            if (tag !== undefined && (object.Tag & tag) === 0)
                continue;
            const collide = GameObject.IsCollide(who, object);
            if (collide !== false)
                return collide;
        }
        return false;
    }
    Raycast(from, direction, distance, tag) {
        const result = [];
        const normalized = direction.Normalize();
        const line = new Line(from.X, from.Y, from.X + normalized.X * distance, from.Y + normalized.Y * distance);
        for (const object of this._gameObjects) {
            if (tag !== undefined && (object.Tag & tag) === 0)
                continue;
            const collider = object.GetCollider();
            if (collider === undefined)
                continue;
            const pos = object.GetPosition();
            const top = GetIntersectPoint(line, new Line(pos.X, pos.Y + collider.Height, pos.X + collider.Width, pos.Y + collider.Height));
            const right = GetIntersectPoint(line, new Line(pos.X + collider.Width, pos.Y, pos.X + collider.Width, pos.Y + collider.Height));
            const bottom = GetIntersectPoint(line, new Line(pos.X, pos.Y, pos.X + collider.Width, pos.Y));
            const left = GetIntersectPoint(line, new Line(pos.X, pos.Y, pos.X, pos.Y + collider.Height));
            if (top !== undefined)
                result.push({ position: top, instance: object });
            if (right !== undefined)
                result.push({ position: right, instance: object });
            if (bottom !== undefined)
                result.push({ position: bottom, instance: object });
            if (left !== undefined)
                result.push({ position: left, instance: object });
        }
        return result.sort((a, b) => (a.position.X - from.X) ** 2 + (a.position.Y - from.Y) ** 2 - ((b.position.X - from.X) ** 2 + (b.position.Y - from.Y) ** 2));
    }
    GetInteractiveAt(x, y) {
        for (const object of this._interactableGameObjects) {
            const playerCenter = this.Player.GetCenter();
            const position = object.GetRectangle();
            if ((position.X + position.Width / 2 - playerCenter.X) ** 2 + (position.Y + position.Height / 2 - playerCenter.Y) ** 2 > 100 * 100)
                continue;
            if (x > position.X && x < position.X + position.Width && y > position.Y && y < position.Y + position.Height)
                return object;
        }
        return null;
    }
    Update(time) {
        if (this.Player.CanTarget()) {
            const plrPos = this.Player.GetPosition();
            const plrTargetRaw = this.Player.GetTarget();
            this._levelPosition = Math.round(Lerp(this._levelPosition, Math.clamp(-750 + (plrTargetRaw.X + 50 / 2 - 750), 300 - 1500, -300) + plrPos.X, 0.1));
        }
        for (const object of this._gameObjects)
            object.Update(time - this.Time);
        this.Time = time;
    }
    Render() {
        Canvas.DrawBackground(this._background, this._levelPosition);
        for (const object of this._gameObjects)
            object.Render();
    }
    RenderOverlay() {
        Canvas.SwitchLayer(false);
        Canvas.EraseRectangle(0, 0, Canvas.GetSize().X, Canvas.GetSize().Y);
        this.Player.RenderOverlay();
        Canvas.SwitchLayer(true);
    }
    GetByTag(tag) {
        return this._gameObjects.filter((x) => x.Tag == tag);
    }
    GetByType(type) {
        return this._gameObjects.filter((x) => x instanceof type);
    }
    Instantiate(object) {
        this._gameObjects.push(object);
        if (object instanceof Player) {
            this.Player = object;
            Scene.Player = object;
        }
        if (object instanceof Interactable) {
            this._interactableGameObjects.push(object);
            object.OnDestroy = () => {
                this._gameObjects.splice(this._gameObjects.indexOf(object), 1);
                this._interactableGameObjects.splice(this._interactableGameObjects.indexOf(object), 1);
            };
        }
        else
            object.OnDestroy = () => this._gameObjects.splice(this._gameObjects.indexOf(object), 1);
    }
}
