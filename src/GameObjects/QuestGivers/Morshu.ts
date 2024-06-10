import { Canvas } from "../../Context.js";
import { EnemyType, Tag } from "../../Enums.js";
import { KillTask, Quest } from "../../Quest.js";
import { Scene } from "../../Scene.js";
import { LoadImage, Rectangle } from "../../Utilites.js";
import { Character } from "./Character.js";

export class Morshu extends Character {
	private static _completedQuests = 0;
	// private static _quest = ;

	private static readonly _image = LoadImage("Images/Morshu.png");

	constructor(x: number, y: number) {
		super(200, 200);

		this._dialogLength = 4;
		this.Tag = Tag.NPC;
		this._x = x;
		this._y = y;
	}

	override Render(): void {
		Canvas.DrawImage(
			Morshu._image,
			new Rectangle(
				this._x - Scene.Current.GetLevelPosition(),
				this._y,
				this._width,
				this._height
			)
		);
	}

	public Talk() {
		if (this._dialogState === null) this._dialogState = 0;

		switch (Morshu._completedQuests) {
			case 0:
				return [
					"Привет.",
					"Кароче, Меченый, я тебя спас и в благородство играть не буду. Выполнишь для меня пару заданий и мы в расчете.",
					"Говори.",
					"Убей этого челика.",
					"Ща.",
				][this._dialogState];
		}
	}
}
