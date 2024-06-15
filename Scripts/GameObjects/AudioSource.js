import { Scene } from "../Scene.js";
import { Canvas } from "../Context.js";
import { Color, LoadImage, Rectangle, Interactable } from "../Utilites.js";
export class AudioSource extends Interactable {
    _volume;
    _life = 0;
    _timeToNextFrame = 0;
    _frameIndex = 0;
    _enabled = false;
    _silent = false;
    _soundPack;
    _currentSound;
    static _frames = [LoadImage("Images/Boombox/0.png"), LoadImage("Images/Boombox/1.png")];
    constructor(x, y, volume, ...sounds) {
        super(100, 50);
        if (sounds.length === 0)
            throw new Error("Бумбокс без музыки.");
        this._x = x;
        this._y = y;
        this._soundPack = sounds;
        this._currentSound = 0;
        this._volume = volume;
    }
    Update(dt) {
        if (!this._enabled)
            return;
        this._life += dt;
        this._timeToNextFrame -= dt;
        if (this._timeToNextFrame <= 0) {
            this._frameIndex = (this._frameIndex + 1) % 2;
            this._timeToNextFrame = 100;
        }
        const c = Scene.Current.Player.GetCenter();
        const trueVolume = this._volume * (this._silent ? 0.75 : 1);
        this._soundPack[this._currentSound].Volume = (trueVolume - Math.clamp(Math.sqrt((this._x - c.X) ** 2 + (this._y - c.Y) ** 2), 0, trueVolume)) / trueVolume;
        if (this._silent)
            this._soundPack[this._currentSound].Volume /= 4;
        this._soundPack[this._currentSound].Apply();
        if (!this._soundPack[this._currentSound].IsPlayingOriginal())
            this._soundPack[this._currentSound].PlayOriginal();
    }
    Render() {
        Canvas.SetFillColor(Color.White);
        Canvas.DrawImageWithAngle(AudioSource._frames[this._frameIndex], new Rectangle(this._x - Scene.Current.GetLevelPosition() + this.Width / 2, this._y + Math.sin(this._life / 50) * 5 + this.Height / 2, this.Width, this.Height), this._enabled ? (Math.cos(this._life / 50) - 0.5) / 10 : 0, -this.Width / 2, this.Height / 2);
    }
    GetInteractives() {
        return [this._enabled ? "выключить" : "включить", this._silent ? "прибавить" : "убавить", "переключить"];
    }
    OnInteractSelected(id) {
        switch (id) {
            case 0:
                this._enabled = !this._enabled;
                if (!this._enabled) {
                    this._life = 0;
                    this._frameIndex = 0;
                    this._soundPack[this._currentSound].StopOriginal();
                }
                break;
            case 1:
                this._silent = !this._silent;
                break;
            case 2:
                this._soundPack[this._currentSound].StopOriginal();
                this._currentSound = (this._currentSound + 1) % this._soundPack.length;
                break;
        }
    }
}
