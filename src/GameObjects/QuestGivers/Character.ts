import { Canvas } from "../../Context.js";
import { Tag } from "../../Enums.js";
import { Scene } from "../../Scene.js";
import { Rectangle, Sound, Sprite } from "../../Utilites.js";
import { Interactable } from "../GameObject.js";

export class Character extends Interactable {
	protected _completedQuests = 0;
	private _isTalked = false;
	private readonly _sprite: Sprite;

	constructor(x: number, y: number, sprite: Sprite) {
		super(50, 100);

		this.Tag = Tag.NPC;
		this._x = x;
		this._y = y;
		this._sprite = sprite;
	}

	override Render(): void {
		const ratio = this.Height / this._sprite.BoundingBox.Height;

		Canvas.DrawImage(this._sprite, new Rectangle(this._x  , this._y, this._sprite.BoundingBox.Width * ratio, this.Height));
	}

	public GetDialog(): Dialog {
		this._isTalked = true;

		return;
	}

	public IsTalked() {
		return this._isTalked;
	}

	public GetAvatar(): Sprite | null {
		return null;
	}

	GetInteractives(): string[] {
		return ["говорить"];
	}

	OnInteractSelected(id: number): void {
		switch (id) {
			case 0:
				Scene.Current.Player.SpeakWith(this);
				break;
		}
	}

	public GetCompletedQuestsCount() {
		return this._completedQuests;
	}

	public GetName() {
		return "НЕКТО";
	}
}

export type Dialog = {
	Messages: string[];
	Voices: Sound[];
	AfterAction?: () => void;
	Owner: Character;
	OwnerFirst: boolean;
};
