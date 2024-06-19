import { GUI } from "../../Context.js";
import { Scene } from "../../Scene.js";
import { Color } from "../../Utilites.js";
import { GameObject } from "../GameObject.js";

export class Titles extends GameObject {
	private static readonly _texts = [
		"РУКОВОДИТЕЛИ ПРОЕКТА",
		"Арсений",
		"Вероника",
		"",
		"АРХИТЕКТОРЫ",
		"Аня",
		"Арсений",
		"",
		"СЦЕНАРИСТЫ",
		"Аня",
		"Арсений",
		"",
		"СТАРШИЕ ПРОГРАММИСТЫ",
		"Михаил",
		"",
		"МЛАДШИЕ ПРОГРАММИСТЫ",
		"Михаил",
		"Андрей",
		"",
		"ТЕХНИЧЕСКИЕ КОНСУЛЬТАНТЫ",
		"Михаил",
		"",
		"СТАРШИЕ ВЕРСТАЛЬЩИКИ",
		"Иван",
		"",
		"МЛАДШИЕ ВЕРСТАЛЬЩИКИ",
		"Иван",
		"",
		"СТАРШИЕ ДИЗАЙНЕРЫ",
		"Вова",
		"",
		"МЛАДШИЕ ДИЗАЙНЕРЫ",
		"Вова",
		"Иван",
		"Кирилл",
		"Михаил",
		"Владислав",
		"",
		"ПРОЕКТИРОВЩИКИ УРОВНЕЙ",
		"Даниил",
		"",
		"РАЗРАБОТЧИКИ АНИМАЦИЙ",
		"Михаил",
		"",
		"",
		"",
		"Subway Inferno",
		"© 2024 PENTAGON. Все права защищены.",
	];

	constructor() {
		super(GUI.Width, GUI.Height);

		this._y = 450;
	}

	public Update(dt: number): void {
		this._y -= 1;

		if (this._y < -3000) Scene.LoadFromFile("Assets/Scenes/Menu.json");
	}

	public Render(): void {
		GUI.SetFillColor(Color.White);
		GUI.ClearStroke();

		GUI.SetFont(72);
		GUI.DrawTextCenter("СПАСИБО ЗА ИГРУ", 0, this._y, this.Width, this.Height);
		GUI.SetFont(32);

		for (let i = 0; i < Titles._texts.length; i++) GUI.DrawTextCenter(Titles._texts[i], 0, this._y + 300 + i * 32 * 1.5, this.Width, this.Height);
	}
}
