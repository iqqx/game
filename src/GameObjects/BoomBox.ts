import { Scene } from "../Scenes/Scene.js";
import { Canvas } from "../Context.js";
import { Color, Sound, Rectangle, Sprite } from "../Utilites.js";
import { Interactable } from "./GameObject.js";
import { GetSound, GetSprite } from "../AssetsLoader.js";

export class AudioSource extends Interactable {
	private readonly _volume: number;
	private readonly _soundPack: Sound[];
	private readonly _frames: Sprite[] = GetSprite("Boombox");
	private _life = 0;
	private _timeToNextFrame = 0;
	private _frameIndex = 0;
	private _enabled = false;
	private _volumeModifier = 0.5;
	private _currentSound: number;

	constructor(x: number, y: number, volume: number, ...sounds: string[]) {
		super(100, 50);

		if (sounds.length === 0) throw new Error("Бумбокс без музыки.");

		this._x = x;
		this._y = y;
		this._soundPack = sounds.map((i) => GetSound(i));
		this._currentSound = 0;
		this._volume = volume;
	}

	override Update(dt: number) {
		if (!this._enabled) return;

		this._life += dt;
		this._timeToNextFrame -= dt;

		if (this._timeToNextFrame <= 0) {
			this._frameIndex = (this._frameIndex + 1) % 2;
			this._timeToNextFrame = 100;
		}

		const c = Scene.Current.Player.GetCenter();

		const trueVolume = this._volume;

		this._soundPack[this._currentSound].Volume = (trueVolume - Math.clamp(Math.sqrt((this._x - c.X) ** 2 + (this._y - c.Y) ** 2), 0, trueVolume)) / trueVolume;
		this._soundPack[this._currentSound].Volume *= this._volumeModifier;
		this._soundPack[this._currentSound].Apply();

		if (!this._soundPack[this._currentSound].IsPlayingOriginal()) this._soundPack[this._currentSound].PlayOriginal();
	}

	override Render(): void {
		Canvas.SetFillColor(Color.White);
		Canvas.DrawImageWithAngle(
			this._frames[this._frameIndex],
			new Rectangle(this._x + this.Width / 2, this._y + Math.sin(this._life / 50) * 5 + this.Height / 2, this.Width, this.Height),
			this._enabled ? Math.cos(this._life / 50) / 10 : 0,
			-this.Width / 2,
			this.Height / 2
		);
	}

	GetInteractives(): string[] {
		return [this._enabled ? "выключить" : "включить", "прибавить", "убавить", "переключить"];
	}

	OnInteractSelected(id: number): void {
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
				this._volumeModifier = Math.min(this._volumeModifier + 0.1, 1);
				break;
			case 2:
				this._volumeModifier = Math.max(this._volumeModifier - 0.1, 0);
				break;
			case 3:
				this._soundPack[this._currentSound].StopOriginal();
				this._currentSound = (this._currentSound + 1) % this._soundPack.length;

				break;
		}
	}

    public override OnDestroy(): void {
        for (const sound of this._soundPack) sound.StopOriginal();
    }
}
