import { Canvas, GUI } from "./Context.js";
import { Vector2, Color, Rectangle } from "./Utilites.js";
export class SceneSpriteEditor {
    _sprite;
    _fillColors = [Color.Pink, Color.Black, Color.White, Color.Red];
    _curFillColor = 0;
    _scale = 8;
    _mousePosition = new Vector2(0, 0);
    constructor(sprite) {
        this._sprite = sprite;
        addEventListener("keydown", (e) => {
            switch (e.code) {
                case "Digit1":
                    this._curFillColor = (this._curFillColor + 1) % this._fillColors.length;
                    break;
                case "Digit2":
                    this._curFillColor = this._curFillColor === 0 ? this._fillColors.length - 1 : this._curFillColor - 1;
                    break;
                case "KeyA":
                    break;
                case "KeyD":
                    break;
                case "ShiftLeft":
                    break;
                case "ArrowUp":
                    break;
                case "ArrowDown":
                    break;
                case "ArrowRight":
                    break;
                case "ArrowLeft":
                    break;
                case "KeyX":
                    break;
                case "KeyC":
                    break;
            }
        });
        addEventListener("keyup", (e) => {
            switch (e.code) {
                case "KeyA":
                    break;
                case "KeyD":
                    break;
                case "ShiftLeft":
                    break;
            }
        });
        addEventListener("mousedown", (e) => {
            this._mousePosition = new Vector2(e.x - Canvas.GetClientRectangle().left, Canvas.GetClientRectangle().height - e.y + Canvas.GetClientRectangle().top);
            if (e.button !== 0)
                return;
        });
        addEventListener("mouseup", (e) => {
            this._mousePosition = new Vector2(e.offsetX, Canvas.GetClientRectangle().height - e.offsetY);
            if (e.button !== 0)
                return;
        });
        addEventListener("mousemove", (e) => {
            this._mousePosition = new Vector2(Math.round(e.offsetX), Math.round(Canvas.GetClientRectangle().height - e.offsetY));
        });
        addEventListener("wheel", (e) => {
            this._scale = Math.clamp(this._scale - Math.sign(e.deltaY), 1, 100);
        });
    }
    static async LoadFromFile(sprite) {
        return new SceneSpriteEditor(sprite);
    }
    Update(time) { }
    Render() {
        Canvas.ClearStroke();
        Canvas.SetFillColor(this._fillColors[this._curFillColor]);
        Canvas.DrawRectangle(0, 0, GUI.Width, GUI.Height);
        Canvas.DrawImage(this._sprite, new Rectangle(GUI.Width / 2 - (this._sprite.BoundingBox.Width * this._scale) / 2, GUI.Height / 2 - (this._sprite.BoundingBox.Height * this._scale) / 2, this._sprite.BoundingBox.Width * this._scale, this._sprite.BoundingBox.Height * this._scale));
    }
    RenderOverlay() {
        GUI.ClearStroke();
        Canvas.SetFillColor(new Color(0, 0, 0, 100));
        GUI.DrawRectangle(0, 0, GUI.Width, 50);
        Canvas.SetFillColor(Color.White);
        // GUI.SetFont(16);
        // GUI.DrawText(5, 20, this._selectedType === -1 ? "Режим выбора" : ObjectType[this._selectedType]);
        // if (this._selectedRectangle !== null) {
        //     GUI.DrawText(5, 35, `Выбран: ${ObjectType[this._gameObjects[this._selectedRectangle][0]]}`);
        //     GUI.DrawText(250, 35, "x: удалить");
        //     if (this._shiftPressed) GUI.DrawText(250, 20, "Стрелочки: изменить размер");
        //     else GUI.DrawText(250, 20, "Стрелочки: изменить положение");
        // }
        // GUI.DrawText(750, 20, "AD: движение");
        // GUI.DrawText(750, 35, "C: сохранить");
        // GUI.DrawText(950, 20, "Shift: альтернативный режим");
        Canvas.SetFillColor(Color.White);
        Canvas.DrawCircle(this._mousePosition.X - 1, this._mousePosition.Y - 1, 2);
    }
}
//# sourceMappingURL=SceneSpriteEditor.js.map