import { EnemyType } from "../Enums.js";
import { Player } from "../GameObjects/Player.js";
import { Canvas, GUI } from "../Context.js";
import { Vector2, Line, GetIntersectPoint, Color, IsString, IsNumber, IsMobile } from "../Utilites.js";
import { GameObject, Interactable } from "../GameObjects/GameObject.js";
import { Cursor } from "../GameObjects/GUI/Cursor.js";
import { TextButton } from "../GameObjects/GUI/TextButton.js";
import { Backpack } from "../Assets/Containers/Backpack.js";
import { Box } from "../Assets/Containers/Box.js";
import { AudioSource } from "../GameObjects/BoomBox.js";
import { Human } from "../GameObjects/Enemies/Human.js";
import { Rat } from "../GameObjects/Enemies/Rat.js";
import { Ladder } from "../GameObjects/Ladder.js";
import { Platform } from "../GameObjects/Platform.js";
import { Spikes } from "../GameObjects/Spikes.js";
import { Wall } from "../GameObjects/Wall.js";
import { Image } from "../GameObjects/GUI/Image.js";
import { LoadingIcon } from "../GameObjects/GUI/LoadingIcon.js";
import { Label } from "../GameObjects/GUI/Label.js";
import { IntroCutscene } from "../GameObjects/GUI/IntroCutscene.js";
import { HintLabel } from "../GameObjects/GUI/HintLabel.js";
import { GUISpotLight } from "../GameObjects/GUI/GUISpotLight.js";
import { PressedIndicator } from "../GameObjects/GUI/PressedIndicator.js";
import { Titles } from "../GameObjects/GUI/Titles.js";
import { Artem } from "../GameObjects/QuestGivers/Artem.js";
import { Elder } from "../GameObjects/QuestGivers/Elder.js";
import { Trader } from "../GameObjects/QuestGivers/Trader.js";
import { Corpse } from "../GameObjects/Corpse.js";
import { SceneEditor } from "./SceneEditor.js";
import { FPSCounter } from "../GameObjects/GUI/FPSCounter.js";
import { Weapon } from "../Assets/Weapons/Weapon.js";
import { Throwable } from "../Assets/Throwable.js";
import { GetSprite } from "../AssetsLoader.js";
import { Monster } from "../GameObjects/Enemies/Monster.js";
import { ItemRegistry } from "../Assets/Items/ItemRegistry.js";
import { FlexLayout } from "../GameObjects/GUI/FlexLayout.js";
import { GridLayout } from "../GameObjects/GUI/GridLayout.js";
import { FreeLayout } from "../GameObjects/GUI/FreeLayout.js";
import { SceneError } from "./SceneError.js";
export class Scene {
    static Current;
    _gameObjects = [];
    _interactableGameObjects = [];
    _GUIElements = [];
    _background;
    static _registeredEvents = [];
    Player = null;
    static Time = 0;
    static OnPointerStateChanged = undefined;
    constructor(background, ...objects) {
        this._background = background;
        if (Scene.Current !== undefined)
            Scene.Current.Unload();
        Scene.Current = this;
        for (const object of objects)
            if (object instanceof GameObject)
                this.Instantiate(object);
            else
                this.AddGUI(object);
        window.addEventListener("resize", () => {
            if (this._GUIElements.length > 0)
                this._GUIElements[0].Repack();
        });
    }
    Unload() {
        for (const go of this._gameObjects)
            go.OnDestroy();
        this._gameObjects.clear();
        this._interactableGameObjects.clear();
        this._GUIElements[0]?.OnDestroy();
        this._GUIElements.clear();
        this.Player = undefined;
        for (const event of Scene._registeredEvents)
            event.Target.removeEventListener(event.Name, event.Callback);
        Scene._registeredEvents.clear();
    }
    static async LoadFromFile(src) {
        const scene = await fetch(src);
        if (!scene.ok)
            return new SceneError("Сцена не найдена: " + src);
        const sceneData = await scene.json();
        const newScene = new Scene(sceneData.Background === undefined ? null : GetSprite(sceneData.Background));
        for (const obj of sceneData.GameObjects) {
            const parsedObj = this.ParseObject(obj);
            if (parsedObj instanceof GameObject)
                newScene.Instantiate(parsedObj);
            else
                newScene.AddGUI(parsedObj);
        }
        return newScene;
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    static ParseObject(x) {
        switch (x.Type) {
            case "Layout": {
                return this.ParseGUIObject(x);
            }
            case "Wall":
                return new Wall(...x.Arguments);
            case "Platform":
                return new Platform(...x.Arguments);
            case "Player":
                return new Player(x.Arguments[0], x.Arguments[1], x.Arguments[2], x.Arguments[3]);
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
            case "Artem":
                return new Artem(...x.Arguments);
            case "Elder":
                return new Elder(...x.Arguments);
            case "Trader":
                return new Trader(...x.Arguments);
            case "Backpack":
                x.Arguments.splice(2, x.Arguments.length - 2, ...x.Arguments.slice(2).map((x) => {
                    return Scene.ParseItem2(x);
                }));
                return new Backpack(...x.Arguments);
            case "HumanCorpse":
                x.Arguments.splice(2, x.Arguments.length - 2, ...x.Arguments.slice(2).map((x) => {
                    return Scene.ParseItem(x);
                }));
                return new Corpse(...x.Arguments);
            case "Human":
                x.Arguments[2] = x.Arguments[2] === "Green" ? EnemyType.Green : EnemyType.Red;
                x.Arguments[4] = x.Arguments[4] === undefined ? undefined : this.ParseItem(x.Arguments[4]);
                return new Human(...x.Arguments);
            case "Rat":
                return new Rat(...x.Arguments);
            case "Monster":
                return new Monster(...x.Arguments);
            default:
                throw new Error("Не удалось распарсить: " + x.Type);
        }
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    static ParseGUIObject(x) {
        switch (x.Type) {
            case "Layout": {
                switch (x.Arguments[0].toLowerCase()) {
                    case "flex": {
                        const l = new FlexLayout(x.Arguments[1], x.Arguments[2], x.Arguments[3], x.Arguments[4]);
                        for (const object of x.Childs)
                            l.AddChild(this.ParseGUIObject(object));
                        l.Repack();
                        return l;
                    }
                    case "horizontal flex": {
                        const l = new FlexLayout(x.Arguments[1], x.Arguments[2], x.Arguments[3], x.Arguments[4], true);
                        for (const object of x.Childs)
                            l.AddChild(this.ParseGUIObject(object));
                        l.Repack();
                        return l;
                    }
                    case "grid": {
                        const l = new GridLayout();
                        for (const object of x.Childs)
                            l.AddChild(this.ParseGUIObject(object));
                        l.Repack();
                        return l;
                    }
                    case "free": {
                        const l = new FreeLayout();
                        for (const object of x.Childs)
                            l.AddChild(this.ParseGUIObject(object));
                        return l;
                    }
                    default: {
                        throw new Error("Неизвестный тип разметки: " + x.Arguments[0]);
                    }
                }
            }
            case "LoadingIcon": {
                return new LoadingIcon(...x.Arguments, x.Actions.map(this.ParseAction));
            }
            case "Image":
                x.Arguments[2] = GetSprite(x.Arguments[2]);
                return new Image(...x.Arguments);
            case "HintLabel":
                return new HintLabel(...x.Arguments);
            case "Titles":
                return new Titles();
            case "FPSCounter":
                return new FPSCounter();
            case "Label":
                return new Label(...x.Arguments);
            case "Cursor":
                return new Cursor();
            case "IntroCutscene":
                return new IntroCutscene();
            case "TextButton": {
                const button = new TextButton(...x.Arguments);
                if (x.Action !== undefined)
                    button.SetOnClicked(this.ParseAction(x.Action));
                if (x.EnabledOn !== undefined)
                    this.ParseCondition(button, x.EnabledOn);
                return button;
            }
            case "PressedIndicator":
                return new PressedIndicator(...x.Arguments, x.Actions.map(this.ParseAction));
            case "SpotLightSpawner":
                return new GUISpotLight();
            default:
                throw new Error("Не удалось распарсить: " + x.Type);
        }
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    static ParseAction(x) {
        switch (x.Type) {
            case "LoadScene":
                switch (x.Source) {
                    case "{LOADING}": {
                        return () => Scene.LoadFromFile(IsMobile() ? "Assets/Scenes/MobileLoading.json" : "Assets/Scenes/Loading.json");
                    }
                    default:
                        return () => Scene.LoadFromFile(x.Source);
                }
            case "GotoUrl":
                return () => (window.location.href = x.Source);
            case "LoadSceneEditor":
                return () => SceneEditor.LoadFromFile(x.Source);
            case "Replace":
                return function () {
                    this.Parent.ReplaceChild(this, Scene.ParseGUIObject(x.With));
                };
            case "GotoFullscreen":
                return Canvas.ToFullscreen;
            case "RegisterEvent":
                switch (x.On) {
                    case "AnyKeyDown":
                        return () => {
                            if (IsMobile()) {
                                const call = Scene.ParseAction(x.Action);
                                Scene._registeredEvents.push({ Target: Canvas.HTML, Name: "touchend", Callback: call });
                                Canvas.HTML.addEventListener("touchend", call);
                            }
                            else {
                                const call = Scene.ParseAction(x.Action);
                                Scene._registeredEvents.push({ Target: Canvas.HTML, Name: "keydown", Callback: call });
                                Canvas.HTML.addEventListener("keydown", call);
                            }
                        };
                }
        }
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
    GetCollidesByRect(who, tag) {
        const result = [];
        if (tag === undefined)
            for (const object of Scene.Current._gameObjects) {
                const collide = GameObject.GetCollideByRect(who, object);
                if (collide !== false)
                    result.push(collide);
            }
        else
            for (const object of Scene.Current._gameObjects) {
                if ((object.Tag & tag) > 0) {
                    const collide = GameObject.GetCollideByRect(who, object);
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
    TryGetInteractive(x, y) {
        for (let i = Scene.Current._interactableGameObjects.length - 1; i >= 0; --i) {
            const playerCenter = Scene.Current.Player.GetCenter();
            const position = Scene.Current._interactableGameObjects[i].GetRectangle();
            if ((position.X + position.Width / 2 - playerCenter.X) ** 2 + (position.Y + position.Height / 2 - playerCenter.Y) ** 2 > 100 ** 2)
                continue;
            if (x + Canvas.CameraX >= position.X && x + Canvas.CameraX < position.X + position.Width && y + Canvas.CameraY >= position.Y && y + Canvas.CameraY < position.Y + position.Height)
                return Scene.Current._interactableGameObjects[i];
        }
        return null;
    }
    Update(time) {
        const dt = Math.min(200, time - Scene.Time);
        for (const object of Scene.Current._gameObjects)
            object.Update(dt);
        for (const element of Scene.Current._GUIElements)
            element.Update(dt);
        Scene.Time = time;
        this.Render();
        this.RenderOverlay();
    }
    Render() {
        GUI.ClearStroke();
        GUI.SetFillColor(Color.Black);
        GUI.DrawRectangle(0, 0, Canvas.Width, Canvas.Height);
        if (Scene.Current._background)
            Canvas.DrawBackground(Scene.Current._background);
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
        return Scene.Current._gameObjects.filter((x) => (x.Tag & tag) > 0);
    }
    GetByType(type) {
        return Scene.Current._gameObjects.filter((x) => x instanceof type);
    }
    Instantiate(object) {
        Scene.Current._gameObjects.push(object);
        if (object instanceof Player) {
            Scene.Current.Player = object;
            Canvas.CameraX = 20 - Canvas.Width / 2 + object.GetPosition().X;
            Canvas.CameraY = 50 - Canvas.Height / 2 + object.GetPosition().Y;
        }
        if (object instanceof Interactable) {
            Scene.Current._interactableGameObjects.push(object);
        }
    }
    AddGUI(element) {
        Scene.Current._GUIElements.push(element);
    }
    static Destroy(element) {
        element.OnDestroy();
        if (element instanceof GameObject) {
            Scene.Current._gameObjects.tryRemove((x) => x === element);
            if (element instanceof Interactable)
                Scene.Current._interactableGameObjects.tryRemove((x) => x === element);
        }
        else
            Scene.Current._GUIElements.tryRemove((x) => x === element);
    }
    static ParseCondition(object, raw) {
        switch (raw.Type) {
            case "Straight": {
                switch (raw.Name) {
                    case "IsFullscreen": {
                        const c = () => {
                            object.Enabled = !Canvas.IsFullscreen();
                        };
                        object.Enabled = !Canvas.IsFullscreen();
                        window.addEventListener("resize", c);
                        Scene._registeredEvents.push({ Target: window, Name: "resize", Callback: c });
                        break;
                    }
                    default: {
                        throw new Error("Переменная условия не распознана: " + raw.Name);
                    }
                }
                break;
            }
            default: {
                throw new Error("Тип условия не распознан: " + raw.Type);
            }
        }
    }
    static ParseItem(raw) {
        const item = ItemRegistry.GetById(raw);
        if (item !== undefined)
            return item;
        const weapon = Weapon.GetById(raw);
        if (weapon !== undefined)
            return weapon;
        const throwable = Throwable.GetById(raw);
        if (throwable !== undefined)
            return throwable;
        throw new Error("Объект не определен: " + raw);
    }
    static ParseItem2(raw) {
        let item;
        if (IsString(raw)) {
            item = ItemRegistry.GetById(raw);
        }
        else {
            if (raw.Count === undefined) {
                item = ItemRegistry.GetById(raw.Id);
            }
            else if (IsNumber(raw.Count)) {
                item = ItemRegistry.GetById(raw.Id, raw.Count);
            }
            else {
                item = ItemRegistry.GetById(raw.Id, raw.Count.Min + Math.round(Math.random() * (raw.Count.Max - raw.Count.Min)));
            }
        }
        if (item !== undefined)
            return item;
        throw new Error("Объект не определен: " + raw);
    }
}
//# sourceMappingURL=Scene.js.map