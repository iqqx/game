import { EnemyType } from "./Enums.js";
import { Player } from "./GameObjects/Player.js";
import { Canvas, GUI } from "./Context.js";
import { Vector2, Line, GetIntersectPoint, Lerp, Color, Rectangle } from "./Utilites.js";
import { GameObject, Interactable } from "./GameObjects/GameObject.js";
import { BlinkingRectangle } from "./GameObjects/GUI/BlinkingRectangle.js";
import { GUIRectangle } from "./GameObjects/GUI/GUIRectangle.js";
import { BlinkingLabel } from "./GameObjects/GUI/BlinkingLabel.js";
import { GetSprite } from "./Game.js";
import { Cursor } from "./GameObjects/GUI/Cursor.js";
import { TextButton } from "./GameObjects/GUI/TextButton.js";
import { Backpack } from "./Assets/Containers/Backpack.js";
import { Box } from "./Assets/Containers/Box.js";
import { AidKit, Bread, Radio, Sausage, Vodka } from "./Assets/Items/Item.js";
import { AudioSource } from "./GameObjects/BoomBox.js";
import { Human } from "./GameObjects/Enemies/Human.js";
import { Rat } from "./GameObjects/Enemies/Rat.js";
import { Ladder } from "./GameObjects/Ladder.js";
import { Platform } from "./GameObjects/Platform.js";
import { Morshu } from "./GameObjects/QuestGivers/Morshu.js";
import { Spikes } from "./GameObjects/Spikes.js";
import { Wall } from "./GameObjects/Wall.js";
import { Image } from "./GameObjects/GUI/Image.js";
import { LoadingIcon } from "./GameObjects/GUI/LoadingIcon.js";
import { Label } from "./GameObjects/GUI/Label.js";
import { IntroCutscene } from "./GameObjects/IntroCutscene.js";
import { HintLabel } from "./GameObjects/GUI/HintLabel.js";
import { GUISpotLight } from "./GameObjects/GUI/GUISpotLight.js";
import { PressedIndicator } from "./GameObjects/GUI/PressedIndicator.js";
import { AK, Glock } from "./Assets/Weapons/Weapon.js";
import { Titles } from "./GameObjects/GUI/Titles.js";
export class Scene {
    static Current;
    _gameObjects = [];
    _interactableGameObjects = [];
    _GUIElements = [];
    _background;
    _keyDownEvents = [];
    _levelPosition = 0;
    _mouseX = 0;
    _mouseY = 0;
    _lmb = false;
    _rmb = false;
    static Player = null;
    Player = null;
    static Time = 0;
    constructor(background, objects) {
        this._background = background;
        if (Scene.Current !== undefined)
            Scene.Current.Unload();
        Scene.Current = this;
        Scene.Time = 0;
        for (const object of objects)
            if (object instanceof GameObject)
                this.Instantiate(object);
            else
                this.AddGUI(object);
        addEventListener("mousemove", (e) => {
            if (e.target.tagName !== "CANVAS")
                return;
            if (e.sourceCapabilities.firesTouchEvents === true)
                return;
            Scene.Current._mouseX = e.offsetX;
            Scene.Current._mouseY = Canvas.GetClientRectangle().height - e.offsetY;
        });
        addEventListener("mousedown", (e) => {
            if (e.target.tagName !== "CANVAS")
                return;
            Scene.Current._mouseX = e.offsetX;
            Scene.Current._mouseY = Canvas.GetClientRectangle().height - e.offsetY;
            if (e.button === 0)
                this._lmb = true;
            if (e.button === 2)
                this._rmb = true;
        });
        addEventListener("mouseup", (e) => {
            if (e.target.tagName !== "CANVAS")
                return;
            if (e.button === 0)
                this._lmb = false;
            if (e.button === 2)
                this._rmb = false;
        });
        addEventListener("keydown", (e) => {
            for (const event of this._keyDownEvents)
                if (event[0] === "any" || event[0] === e.code)
                    event[1]();
        });
    }
    Unload() {
        this._gameObjects.clear();
        this._interactableGameObjects.clear();
        this._GUIElements.clear();
        this._keyDownEvents.clear();
        this.Player = undefined;
    }
    static async LoadFromFile(src) {
        const scene = await fetch(src);
        if (!scene.ok)
            return Scene.GetErrorScene("Сцена не найдена: " + src);
        const sceneData = await scene.json();
        new Scene(sceneData.Background === undefined ? null : GetSprite(sceneData.Background), sceneData.GameObjects.map((x) => this.ParseObject(x)));
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    static ParseObject(x) {
        switch (x.Type) {
            case "PressedIndicator":
                return new PressedIndicator(...x.Arguments);
            case "Titles":
                return new Titles();
            case "SpotLightSpawner":
                return new GUISpotLight();
            case "HintLabel":
                return new HintLabel(...x.Arguments);
            case "IntroCutscene":
                return new IntroCutscene(x.Arguments[0]);
            case "Label":
                return new Label(...x.Arguments);
            case "Image":
                x.Arguments[4] = GetSprite(x.Arguments[4]);
                return new Image(...x.Arguments);
            case "LoadingIcon": {
                const actions = x.Actions.map((x) => this.ParseAction(x));
                return new LoadingIcon(...x.Arguments, () => {
                    for (const action of actions)
                        action();
                });
            }
            case "Cursor":
                return new Cursor();
            case "TextButton": {
                const button = new TextButton(...x.Arguments);
                if (x.Action !== undefined)
                    button.SetOnClicked(this.ParseAction(x.Action));
                return button;
            }
            case "Wall":
                return new Wall(...x.Arguments);
            case "Platform":
                return new Platform(...x.Arguments);
            case "Player":
                return new Player(...x.Arguments);
            case "Boombox":
                return new AudioSource(...x.Arguments);
            case "Box":
                x.Arguments.splice(2, x.Arguments.length - 2, ...x.Arguments.slice(2).map((x) => {
                    const value = x;
                    return { Item: Scene.ParseItem(value.Item), Chance: value.Chance };
                }));
                return new Box(...x.Arguments);
            case "Spikes":
                return new Spikes(...x.Arguments);
            case "Ladder":
                return new Ladder(...x.Arguments);
            case "Morshu":
                return new Morshu(...x.Arguments);
            case "Backpack":
                x.Arguments.splice(2, x.Arguments.length - 2, ...x.Arguments.slice(2).map((x) => {
                    return Scene.ParseItem(x);
                }));
                return new Backpack(...x.Arguments);
            case "Human":
                x.Arguments[2] = x.Arguments[2] === "Green" ? EnemyType.Green : EnemyType.Rat;
                return new Human(...x.Arguments);
            case "Rat":
                return new Rat(...x.Arguments);
            default:
                throw new Error("Не удалось распарсить: " + x.Type);
        }
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    static ParseAction(x) {
        switch (x.Type) {
            case "LoadScene":
                return () => Scene.LoadFromFile(x.Source);
            case "Replace":
                return function () {
                    Scene.Current.Destroy(this);
                    Scene.Current.AddGUI(Scene.ParseObject(x.With));
                };
            case "RegisterEvent":
                switch (x.On) {
                    case "AnyKeyDown":
                        return () => Scene.Current.RegisterKeyDown(this.ParseAction(x.Action));
                }
        }
    }
    RegisterKeyDown(action, key = "any") {
        this._keyDownEvents.push([key, action]);
    }
    static GetErrorScene(error) {
        return new Scene(null, [
            new GUIRectangle(new Rectangle(GUI.Width / 2, GUI.Height / 2, GUI.Width, GUI.Height), Color.Black),
            new BlinkingRectangle(new Rectangle(GUI.Width / 2, GUI.Height / 2, GUI.Width / 2, GUI.Height / 2), new Color(0, 0, 255), new Color(255, 0, 0), 1500),
            new BlinkingLabel(error, GUI.Width / 2, GUI.Height / 2, GUI.Width, GUI.Height, new Color(255, 0, 0), new Color(0, 0, 255), 1500),
        ]);
    }
    GetLevelPosition() {
        return Scene.Current._levelPosition;
    }
    GetMousePosition() {
        return new Vector2(Scene.Current._mouseX, Scene.Current._mouseY);
    }
    GetMouseButtons() {
        return {
            Left: this._lmb,
            Right: this._rmb,
        };
    }
    GetCollide(who, tag) {
        for (const object of Scene.Current._gameObjects) {
            if (tag !== undefined && (object.Tag & tag) === 0)
                continue;
            const collide = GameObject.GetCollide(who, object);
            if (collide !== false)
                return collide;
        }
        return false;
    }
    GetCollides(who, tag) {
        const result = [];
        if (tag === undefined)
            for (const object of Scene.Current._gameObjects) {
                const collide = GameObject.GetCollide(who, object);
                if (collide !== false)
                    result.push(collide);
            }
        else
            for (const object of Scene.Current._gameObjects) {
                if (object.Tag & tag) {
                    const collide = GameObject.GetCollide(who, object);
                    if (collide !== false)
                        result.push(collide);
                }
            }
        return result;
    }
    IsCollide(who, tag) {
        for (const object of Scene.Current._gameObjects) {
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
        for (const object of Scene.Current._gameObjects) {
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
                result.push({ position: top, instance: object, Normal: new Vector2(0, 1) });
            if (right !== undefined)
                result.push({ position: right, instance: object, Normal: new Vector2(1, 0) });
            if (bottom !== undefined)
                result.push({ position: bottom, instance: object, Normal: new Vector2(0, -1) });
            if (left !== undefined)
                result.push({ position: left, instance: object, Normal: new Vector2(-1, 0) });
        }
        return result.sort((a, b) => (a.position.X - from.X) ** 2 + (a.position.Y - from.Y) ** 2 - ((b.position.X - from.X) ** 2 + (b.position.Y - from.Y) ** 2));
    }
    GetInteractiveAt(x, y) {
        for (const object of Scene.Current._interactableGameObjects) {
            const playerCenter = Scene.Current.Player.GetCenter();
            const position = object.GetRectangle();
            if ((position.X + position.Width / 2 - playerCenter.X) ** 2 + (position.Y + position.Height / 2 - playerCenter.Y) ** 2 > 100 * 100)
                continue;
            if (x > position.X && x < position.X + position.Width && y > position.Y && y < position.Y + position.Height)
                return object;
        }
        return null;
    }
    Update(time) {
        if (Scene.Current.Player !== null && Scene.Current.Player.CanTarget()) {
            const plrPos = Scene.Current.Player.GetPosition();
            const plrTargetRaw = Scene.Current.Player.GetTarget();
            Scene.Current._levelPosition = Math.round(Lerp(Scene.Current._levelPosition, Math.clamp(-750 + (plrTargetRaw.X + 50 / 2 - 750), 300 - 1500, -300) + plrPos.X, 0.1));
        }
        for (const object of Scene.Current._gameObjects)
            object.Update(time - Scene.Time);
        for (const element of Scene.Current._GUIElements)
            element.Update(time - Scene.Time, time);
        Scene.Time = time;
    }
    Render() {
        if (Scene.Current._background == null) {
            Canvas.ClearStroke();
            Canvas.SetFillColor(Color.Black);
            Canvas.DrawRectangle(0, 0, GUI.Width, GUI.Height);
        }
        else
            Canvas.DrawBackground(Scene.Current._background, Scene.Current._levelPosition);
        for (const object of Scene.Current._gameObjects)
            object.Render();
    }
    RenderOverlay() {
        if (Scene.Current.Player !== null)
            Scene.Current.Player.RenderOverlay();
        for (const element of Scene.Current._GUIElements)
            element.Render();
    }
    GetByTag(tag) {
        return Scene.Current._gameObjects.filter((x) => x.Tag == tag);
    }
    GetByType(type) {
        return Scene.Current._gameObjects.filter((x) => x instanceof type);
    }
    Instantiate(object) {
        Scene.Current._gameObjects.push(object);
        if (object instanceof Player) {
            Scene.Current.Player = object;
            Scene.Player = object;
        }
        if (object instanceof Interactable) {
            Scene.Current._interactableGameObjects.push(object);
            object.OnDestroy = () => {
                Scene.Current._gameObjects.splice(Scene.Current._gameObjects.indexOf(object), 1);
                Scene.Current._interactableGameObjects.splice(Scene.Current._interactableGameObjects.indexOf(object), 1);
            };
        }
        else
            object.OnDestroy = () => Scene.Current._gameObjects.splice(Scene.Current._gameObjects.indexOf(object), 1);
    }
    AddGUI(element) {
        Scene.Current._GUIElements.push(element);
    }
    Destroy(element) {
        Scene.Current._GUIElements.splice(Scene.Current._GUIElements.indexOf(element), 1);
    }
    DestroyGameObject(element) {
        Scene.Current._gameObjects.splice(Scene.Current._gameObjects.indexOf(element), 1);
        if (element instanceof Interactable)
            Scene.Current._interactableGameObjects.splice(Scene.Current._interactableGameObjects.indexOf(element), 1);
    }
    static ParseItem(raw) {
        switch (raw) {
            case "Bread":
                return new Bread();
            case "Vodka":
                return new Vodka();
            case "Sausage":
                return new Sausage();
            case "AidKit":
                return new AidKit();
            case "AK":
                return new AK();
            case "Glock":
                return new Glock();
            case "Radio":
                return new Radio();
            default:
                throw new Error("Предмет не удалось распарсить: " + raw);
        }
    }
}
