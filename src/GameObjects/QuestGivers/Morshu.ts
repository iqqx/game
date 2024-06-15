import { Vodka } from "../../Assets/Items/Item.js";
import { Canvas } from "../../Context.js";
import { EnemyType, Tag } from "../../Enums.js";
import { PickupBackpackTask, HasItemTask, KillTask, Quest, MoveTask } from "../../Quest.js";
import { Scene } from "../../Scene.js";
import { LoadImage, Rectangle } from "../../Utilites.js";
import { Character, Dialog } from "./Character.js";

export class Morshu extends Character {
	private static _completedQuests = 0;
	private static _isTalked = false;

	private static readonly _image = LoadImage("Images/Morshu.png");

	constructor(x: number, y: number) {
		super(200, 200);

		this.Tag = Tag.NPC;
		this._x = x;
		this._y = y;
	}

	override Render(): void {
		Canvas.DrawImage(Morshu._image, new Rectangle(this._x - Scene.Current.GetLevelPosition(), this._y, this.Width, this.Height));
	}

	public static override IsTalked() {
		return Morshu._isTalked;
	}

	public override GetDialog(): Dialog {
		Morshu._isTalked = true;

		if (Scene.Current.Player.Quests.some((x) => x.Giver === Morshu && !x.IsCompleted())) {
			return {
				Messages: ["Привет.", "Задание выполнено?", "Никак нет.", "Ну так иди делай быстрее!", "Ладно."],
			};
		}

		if (Scene.Current.Player.Quests.some((x) => x.Giver === Morshu && x.IsCompleted())) {
			const quest = Scene.Current.Player.Quests.findIndex((x) => x.Giver === Morshu && x.IsCompleted());
			Morshu._completedQuests++;

			// if (Scene.Current.Player.Quests[quest].Tasks.some((x) => x instanceof PickupBackpackTask)) Scene.Current.Player.HasBackpack = false;
			if (Scene.Current.Player.Quests[quest].Tasks.some((x) => x instanceof HasItemTask)) {
				const task = Scene.Current.Player.Quests[quest].Tasks.find((x) => x instanceof HasItemTask) as HasItemTask;

				for (const item of task.NeededItems) Scene.Current.Player.RemoveItem(item);
			}

			Scene.Current.Player.Quests.splice(quest, 1);

			switch (Morshu._completedQuests) {
				case 1:
					return {
						Messages: ["Дело сделано.", "Хорошо. Заходи позже за новым заданием.\nПрощай.", "Пока."],
					};
				case 2:
					return {
						Messages: ["Отлично, тот самый рюкзак. Давай его сюда", "Хорошо. Заходи позже за новым заданием.\nПрощай.", "Пока."],
					};
				case 3: {
					// Scene.Current.Player.HasBackpack() = true;

					return {
						Messages: ["СЮДА", "Отдай рюкзак", "Держи"],
					};
				}
			}
		}

		switch (Morshu._completedQuests) {
			case 0:
				return {
					Messages: [
						"Стой ты кто, что произошло",
						"Я Артем, искал выход из этого чертового\nметро",
						"Ну и как успехи?",
						"Все завалено не пройти",
						"Эх жаль я тоже ищу выход. Не знаешь, что с\nдругими станциями? ",
						"Cлышал, что на соседней станции Люди\nпостроили себе убежище, а про другие знать\nне знаю. Слушай давай ты поможешь мне, а я\nтебе если вдруг найдешь выход, то свяжись со\nмной и расскажи, где он, а я тебе если вдруг\nнайду тоже тебе сообщу. Вот возим рацию\nчастота 102.75",
						"Хорошо договорились",
					],
					Quest: new Quest("Поиск людей", Morshu, new MoveTask("Лагерь", 18400)),
				};
			case 1:
				if (Scene.Current.Player.HasBackpack) {
					Morshu._completedQuests++;
					// Scene.Current.Player.HasBackpack = false;

					return {
						Messages: ["Привет.", "Здарова, там был рюкзак?", "Сэр, да, сэр.", "Отлично. Ты его забрал?", "Сэр, да, сэр.", "Отлично, давай сюда. Прощай", "Пока."],
					};
				} else
					return {
						Messages: ["Привет.", "Здарова, там был рюкзак?", "Сэр, да, сэр.", "Отлично. Ты его забрал?", "Сэр, нет, сэр.", "Паршиво! Иди быстрее за ним быстрее!", "Сейчас."],
						Quest: new Quest("Рюкзак", Morshu, new PickupBackpackTask()),
					};
			case 2:
				return {
					Messages: ["Привет.", "Здарова, хочешь вернуть свой рюкзак?", "Сэр, да, сэр.", "Тогда принеси мне водки, и побыстрее.", "Сейчас"],
					Quest: new Quest("Опохмелится", Morshu, new HasItemTask(Vodka)),
				};
			default:
				return {
					Messages: ["Привет.", "Здарова, пока новых заданий нет.\nЗаходи позже, прощай.", "Пока"],
				};
		}
	}
}
