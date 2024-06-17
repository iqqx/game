import { Canvas, GUI } from "./Context.js";
import { Vector2, Color, Rectangle } from "./Utilites.js";
import { Platform } from "./GameObjects/Platform.js";
import { Wall } from "./GameObjects/Wall.js";
export class SceneEditor {
    _gameObjects;
    _background;
    _movingRight = false;
    _movingLeft = false;
    _shiftPressed = false;
    _controlPressed = false;
    _movingSpeed;
    _levelPosition = 0;
    _mousePosition = new Vector2(0, 0);
    _drawingRectangle = null;
    _selectedType = 0;
    _selectedRectangle = null;
    constructor(background) {
        this._background = background;
        this._gameObjects = [];
        addEventListener("keydown", (e) => {
            switch (e.code) {
                case "Digit1":
                    this._selectedType = 0;
                    break;
                case "Digit2":
                    this._selectedType = 1;
                    break;
                case "Digit3":
                    this._selectedType = 2;
                    break;
                case "KeyA":
                    this._movingLeft = true;
                    break;
                case "KeyD":
                    this._movingRight = true;
                    break;
                case "ShiftLeft":
                    this._shiftPressed = true;
                    break;
                case "ControlLeft":
                    this._controlPressed = true;
                    break;
                case "ArrowUp":
                    if (this._selectedRectangle !== null) {
                        if (this._shiftPressed)
                            this._gameObjects[this._selectedRectangle][0] = new Rectangle(this._gameObjects[this._selectedRectangle][0].X, this._gameObjects[this._selectedRectangle][0].Y, this._gameObjects[this._selectedRectangle][0].Width, this._gameObjects[this._selectedRectangle][0].Height + 1);
                        else
                            this._gameObjects[this._selectedRectangle][0] = new Rectangle(this._gameObjects[this._selectedRectangle][0].X, this._gameObjects[this._selectedRectangle][0].Y + 1, this._gameObjects[this._selectedRectangle][0].Width, this._gameObjects[this._selectedRectangle][0].Height);
                    }
                    break;
                case "ArrowDown":
                    if (this._selectedRectangle !== null) {
                        if (this._shiftPressed)
                            this._gameObjects[this._selectedRectangle][0] = new Rectangle(this._gameObjects[this._selectedRectangle][0].X, this._gameObjects[this._selectedRectangle][0].Y, this._gameObjects[this._selectedRectangle][0].Width, this._gameObjects[this._selectedRectangle][0].Height - 1);
                        else
                            this._gameObjects[this._selectedRectangle][0] = new Rectangle(this._gameObjects[this._selectedRectangle][0].X, this._gameObjects[this._selectedRectangle][0].Y - 1, this._gameObjects[this._selectedRectangle][0].Width, this._gameObjects[this._selectedRectangle][0].Height);
                    }
                    break;
                case "ArrowRight":
                    if (this._selectedRectangle !== null) {
                        if (this._shiftPressed)
                            this._gameObjects[this._selectedRectangle][0] = new Rectangle(this._gameObjects[this._selectedRectangle][0].X, this._gameObjects[this._selectedRectangle][0].Y, this._gameObjects[this._selectedRectangle][0].Width + 1, this._gameObjects[this._selectedRectangle][0].Height);
                        else
                            this._gameObjects[this._selectedRectangle][0] = new Rectangle(this._gameObjects[this._selectedRectangle][0].X + 1, this._gameObjects[this._selectedRectangle][0].Y, this._gameObjects[this._selectedRectangle][0].Width, this._gameObjects[this._selectedRectangle][0].Height);
                    }
                    break;
                case "ArrowLeft":
                    if (this._selectedRectangle !== null) {
                        if (this._shiftPressed)
                            this._gameObjects[this._selectedRectangle][0] = new Rectangle(this._gameObjects[this._selectedRectangle][0].X, this._gameObjects[this._selectedRectangle][0].Y, this._gameObjects[this._selectedRectangle][0].Width - 1, this._gameObjects[this._selectedRectangle][0].Height);
                        else
                            this._gameObjects[this._selectedRectangle][0] = new Rectangle(this._gameObjects[this._selectedRectangle][0].X - 1, this._gameObjects[this._selectedRectangle][0].Y, this._gameObjects[this._selectedRectangle][0].Width, this._gameObjects[this._selectedRectangle][0].Height);
                    }
                    break;
                case "KeyZ":
                    if (this._selectedRectangle !== null) {
                        this._gameObjects[this._selectedRectangle][1] = this._gameObjects[this._selectedRectangle][1] === Wall ? Platform : Wall;
                    }
                    break;
                case "KeyX":
                    if (this._selectedRectangle !== null) {
                        this._gameObjects.splice(this._selectedRectangle, 1);
                        this._selectedRectangle = null;
                    }
                    break;
                case "KeyC":
                    this.UpdateOutput();
                    break;
            }
        });
        addEventListener("keyup", (e) => {
            switch (e.code) {
                case "KeyA":
                    this._movingLeft = false;
                    break;
                case "KeyD":
                    this._movingRight = false;
                    break;
                case "ShiftLeft":
                    this._shiftPressed = false;
                    break;
                case "ControlLeft":
                    this._controlPressed = false;
                    break;
            }
        });
        addEventListener("mousedown", (e) => {
            this._mousePosition = new Vector2(e.x - Canvas.GetClientRectangle().left, Canvas.GetClientRectangle().height - e.y + Canvas.GetClientRectangle().top);
            this._selectedRectangle = null;
            if (this._selectedType === 0) {
                for (let i = 0; i < this._gameObjects.length; i++) {
                    if (this._mousePosition.X + this._levelPosition >= this._gameObjects[i][0].X &&
                        this._mousePosition.X + this._levelPosition < this._gameObjects[i][0].X + this._gameObjects[i][0].Width &&
                        this._mousePosition.Y >= this._gameObjects[i][0].Y &&
                        this._mousePosition.Y < this._gameObjects[i][0].Y + this._gameObjects[i][0].Height)
                        this._selectedRectangle = i;
                }
            }
            else {
                this._drawingRectangle = new Rectangle(this._mousePosition.X + this._levelPosition, this._mousePosition.Y, 0, 0);
            }
        });
        addEventListener("mouseup", (e) => {
            this._mousePosition = new Vector2(e.x - Canvas.GetClientRectangle().left, Canvas.GetClientRectangle().height - e.y + Canvas.GetClientRectangle().top);
            if (this._selectedType > 0 && this._drawingRectangle !== null) {
                if (this._drawingRectangle.Width < 0)
                    this._drawingRectangle = new Rectangle(this._drawingRectangle.X + this._drawingRectangle.Width, this._drawingRectangle.Y, -this._drawingRectangle.Width, this._drawingRectangle.Height);
                if (this._drawingRectangle.Height < 0)
                    this._drawingRectangle = new Rectangle(this._drawingRectangle.X, this._drawingRectangle.Y + this._drawingRectangle.Height, this._drawingRectangle.Width, -this._drawingRectangle.Height);
                this._selectedRectangle = this._gameObjects.push([this._drawingRectangle, this._selectedType === 1 ? Wall : Platform]) - 1;
                this._drawingRectangle = null;
            }
        });
        addEventListener("mousemove", (e) => {
            this._mousePosition = new Vector2(e.x - Canvas.GetClientRectangle().left, Canvas.GetClientRectangle().height - e.y + Canvas.GetClientRectangle().top);
            if (this._drawingRectangle !== null)
                this._drawingRectangle = new Rectangle(this._drawingRectangle.X, this._drawingRectangle.Y, this._mousePosition.X - this._drawingRectangle.X + this._levelPosition, this._mousePosition.Y - this._drawingRectangle.Y);
        });
    }
    GetLevelPosition() {
        return this._levelPosition;
    }
    Instantiate(object) {
        this._gameObjects.push([new Rectangle(object.GetPosition().X, object.GetPosition().Y, object.GetSize().X, object.GetSize().Y), object instanceof Platform ? Platform : Wall]);
    }
    UpdateOutput() {
        const output = document.getElementById("output");
        output.innerHTML = "";
        for (const object of this._gameObjects)
            output.innerHTML += `scene.Instantiate(new ${object[1] === Wall ? "Wall" : "Platform"}(${object[0].X}, ${object[0].Y}, ${object[0].Width}, ${object[0].Height}));\n`;
    }
    Update(time) {
        if (this._shiftPressed)
            this._movingSpeed = 50;
        else if (this._controlPressed)
            this._movingSpeed = 1;
        else
            this._movingSpeed = 10;
        if (this._movingLeft || this._movingRight)
            this._levelPosition += this._movingLeft ? -this._movingSpeed : this._movingSpeed;
    }
    Render() {
        Canvas.SetFillColor(new Color(200, 250, 100));
        Canvas.DrawRectangle(0, 0, Canvas.GetSize().X, Canvas.GetSize().Y);
        Canvas.DrawBackground(this._background, this._levelPosition);
        Canvas.SetFillColor(new Color(255, 0, 0, 100));
        if (this._drawingRectangle !== null)
            Canvas.DrawRectangle(this._drawingRectangle.X - this._levelPosition, this._drawingRectangle.Y, this._drawingRectangle.Width, this._drawingRectangle.Height);
        for (let i = 0; i < this._gameObjects.length; i++) {
            const object = this._gameObjects[i];
            if (object[1] === Wall) {
                Canvas.SetFillColor(new Color(0, 255, 0, this._selectedRectangle === i ? 150 : 50));
                Canvas.DrawRectangle(object[0].X - this._levelPosition, object[0].Y, object[0].Width, object[0].Height);
            }
            else if (object[1] === Platform) {
                Canvas.SetFillColor(new Color(0, 255, 255, this._selectedRectangle === i ? 150 : 50));
                Canvas.DrawRectangle(object[0].X - this._levelPosition, object[0].Y, object[0].Width, object[0].Height);
            }
        }
    }
    RenderOverlay() {
        GUI.SwitchOn();
        GUI.Clear();
        Canvas.SetFillColor(new Color(0, 0, 0));
        Canvas.DrawRectangle(0, Canvas.GetSize().Y, 500, -50);
        Canvas.SetFillColor(new Color(255, 255, 255));
        GUI.SetFont(24);
        GUI.DrawText(5, 25, (() => {
            switch (this._selectedType) {
                case 0:
                    return "Select";
                case 1:
                    return "Wall";
                case 2:
                    return "Platform";
            }
        })());
        if (this._selectedRectangle !== null) {
            GUI.SetFont(16);
            GUI.DrawText(100, 20, "z: Изменить тип.");
            GUI.DrawText(100, 35, "x: Удалить.");
            if (this._shiftPressed)
                GUI.DrawText(250, 20, "Стрелочки: Изменить размер.");
            else
                GUI.DrawText(250, 20, "Стрелочки: Изменить положение.");
        }
        else
            GUI.DrawText(100, 20, "c: Преобразовать.");
        Canvas.SetFillColor(Color.White);
        Canvas.DrawCircle(this._mousePosition.X - 1, this._mousePosition.Y - 1, 2);
        Canvas.SwitchOn();
    }
}
