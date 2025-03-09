import { GetSound } from "../../AssetsLoader.js";
import { Canvas, GUI } from "../../Context.js";
import { Color, IsMobile } from "../../Utilites.js";
import { GUIBase } from "./GUIBase.js";
export class Button extends GUIBase {
    _hovered = false;
    _pressed = false;
    _onClicked;
    _hoverSound = GetSound("GUI_Hover");
    _clickSound = GetSound("Play");
    Enabled = true;
    _onMouseMove;
    _onMouseUp;
    _onTouchUp;
    constructor(width, height) {
        super();
        this.Width = width;
        this.Height = height;
        if (IsMobile()) {
            this._onTouchUp = (e) => {
                if (!this.Enabled)
                    return;
                const touch = e.changedTouches[0];
                if (touch.clientX >= this.X && touch.clientX < this.X + this.Width && touch.clientY >= this.Y && touch.clientY < this.Y + this.Height) {
                    this._onClicked();
                    this._clickSound.PlayOriginal();
                }
            };
            Canvas.HTML.addEventListener("touchend", this._onTouchUp);
        }
        else {
            this._onMouseMove = (e) => {
                if (!this.Enabled)
                    return;
                const isHovered = e.x >= this.X && e.x < this.X + this.Width && e.y >= this.Y && e.y < this.Y + this.Height;
                if (isHovered) {
                    if (this._hovered === false)
                        this._hoverSound.Play(0.1);
                    this._hovered = true;
                }
                else
                    this._hovered = false;
            };
            this._onMouseUp = (e) => {
                if (!this.Enabled)
                    return;
                if (e.x >= this.X && e.x < this.X + this.Width && e.y >= this.Y && e.y < this.Y + this.Height) {
                    this._onClicked();
                    this._clickSound.PlayOriginal();
                }
            };
            Canvas.HTML.addEventListener("mousemove", this._onMouseMove);
            Canvas.HTML.addEventListener("mouseup", this._onMouseUp);
        }
    }
    Update(dt) { }
    Render() {
        GUI.SetFillColor(!this.Enabled ? new Color(40, 40, 40) : this._hovered ? new Color(50, 50, 50) : new Color(70, 70, 70));
        GUI.SetStroke(this.Enabled ? new Color(155, 155, 155) : new Color(115, 115, 115), 1);
        GUI.DrawRectangle(this.X, this.Y, this.Width, this.Height);
    }
    SetOnClicked(callback) {
        this._onClicked = callback;
        return this;
    }
    OnDestroy() {
        if (IsMobile()) {
            Canvas.HTML.removeEventListener("touchend", this._onTouchUp);
        }
        else {
            Canvas.HTML.removeEventListener("mousemove", this._onMouseMove);
            Canvas.HTML.removeEventListener("mouseup", this._onMouseUp);
        }
    }
}
//# sourceMappingURL=Button.js.map