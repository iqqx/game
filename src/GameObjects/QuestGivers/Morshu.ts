import { Canvas } from "../../Context.js";
import { EnemyType, Tag } from "../../Enums.js";
import { HasItemTask, KillTask, Quest } from "../../Quest.js";
import { Scene } from "../../Scene.js";
import { LoadImage, Rectangle } from "../../Utilites.js";
import { Character, Dialog } from "./Character.js";

export class Morshu extends Character {
	private static _completedQuests = 0;

	private static readonly _image = LoadImage("Images/Morshu.png");

	constructor(x: number, y: number) {
		super(200, 200);

		this.Tag = Tag.NPC;
		this._x = x;
		this._y = y;
	}

	override Render(): void {
		Canvas.DrawImage(Morshu._image, new Rectangle(this._x - Scene.Current.GetLevelPosition(), this._y, this._width, this._height));
	}

	public override GetDialog(): Dialog {
		if (Scene.Current.Player.Quests.some((x) => x.Giver === Morshu && !x.IsCompleted())) {
			return {
				State: 0,
				Messages: ["Привет.", "Задание выполнено?", "Никак нет.", "Ну так иди делай быстрее!", "Ладно."],
			};
		}

		if (Scene.Current.Player.Quests.some((x) => x.Giver === Morshu && x.IsCompleted())) {
			const quest = Scene.Current.Player.Quests.findIndex((x) => x.Giver === Morshu && x.IsCompleted());
			Morshu._completedQuests++;

			if (Scene.Current.Player.Quests[quest].Tasks[0] instanceof HasItemTask) Scene.Current.Player.HasBackpack = false;

			Scene.Current.Player.Quests.splice(quest, 1);

			switch (Morshu._completedQuests) {
				case 1:
					return {
						State: 0,
						Messages: ["Дело сделано.", "Хорошо. Заходи позже за новым заданием.\nПрощай.", "Пока."],
					};
				case 2:
					return {
						State: 0,
						Messages: ["Отлично, тот самый рюкзак. Давай его сюда", "Хорошо. Заходи позже за новым заданием.\nПрощай.", "Пока."],
					};
			}
		}

		switch (Morshu._completedQuests) {
			case 0:
				return {
					State: 0,
					Messages: [
						"Привет.",
						"Кароче, Меченый, я тебя спас и в благородство играть не буду.\nВыполнишь для меня пару заданий и мы в расчете.",
						"Говори.",
						"Убей этого челика.",
						"Ща.",
					],
					Quest: new Quest("Первая кровь", Morshu, new KillTask(EnemyType.Green, 1)),
				};
			case 1:
				if (Scene.Current.Player.HasBackpack) {
					Morshu._completedQuests++;
					Scene.Current.Player.HasBackpack = false;
					return {
						State: 0,
						Messages: ["Привет.", "Здарова, там был рюкзак?", "Сэр, да, сэр.", "Отлично. Ты его забрал?", "Сэр, да, сэр.", "Отлично, давай сюда. Прощай", "Пока."],
					};
				} else
					return {
						State: 0,
						Messages: ["Привет.", "Здарова, там был рюкзак?", "Сэр, да, сэр.", "Отлично. Ты его забрал?", "Сэр, нет, сэр.", "Паршиво! Иди быстрее за ним быстрее!", "Сейчас."],
						Quest: new Quest("Рюкзак", Morshu, new HasItemTask()),
					};
			default:
				return {
					State: 0,
					Messages: ["Привет.", "Здарова, пока новых заданий нет.\nЗаходи позже, прощай.", "Пока"],
				};
		}
	}
}
