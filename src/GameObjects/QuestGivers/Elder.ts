import { DogTag } from "../../Assets/Items/Item.js";
import { Canvas } from "../../Context.js";
import { Tag } from "../../Enums.js";
import { GetSprite } from "../../Game.js";
import { Quest } from "../../Quest.js";
import { Scene } from "../../Scene.js";
import { Rectangle } from "../../Utilites.js";
import { Character, Dialog } from "./Character.js";

export class Elder extends Character {
	constructor(x: number, y: number) {
		super(50, 100);

		this.Tag = Tag.NPC;
		this._x = x;
		this._y = y;
	}

	override Render(): void {
		Canvas.DrawImage(GetSprite("Elder"), new Rectangle(this._x - Scene.Current.GetLevelPosition(), this._y, this.Width, this.Height));
	}

	public override GetDialog(): Dialog {
		super.GetDialog();

		const active = Scene.Player.GetQuestsBy(this);
		if (active.length > 0) {
			if (active[0].IsCompleted()) {
				this._completedQuests++;

				Scene.Player.RemoveItem(DogTag);
				Scene.Player.RemoveItem(DogTag);

				Scene.Player.RemoveQuest(active[0]);

				return {
					Messages: ["Они все мертвы. Вот жетоны.", "Ладно."],
					Owner: this,
					OwnerFirst: false,
					AfterAction: () => {
						Scene.Player.GetQuestsBy(Scene.Player)[0].AddMoveTask(50000, "Выход");
					},
				};
			}

			return {
				Messages: ["Арсюша не придумал мне диалог который я буду\nговорить когда мой квест еще не выполнен.\nСкажите Арсюше чтобы он сделал это."],
				Owner: this,
				OwnerFirst: true,
			};
		}

		switch (this._completedQuests) {
			case 0:
				return {
					Messages: [
						"Так и кто это к нам пожаловал?\nДокументы есть?",
						"Я Артем, вот документы.",
						"Ого военный, оставайся у нас, нам такие\nнужны в довольствие не обидим.",
						"Нет, спасибо, у меня другая цель.",
						"Ну ладно так уж и быть тогда не хочешь\nуслужить нам за вознаграждение?",
						"Ну слушаю, что надо?",
						"Мы хотели узнать, что там на другой станции.\nСлышали, что там есть люди, и отправили туда\nлюдей, но потеряли с ними связь. Не мог бы\nты сходить туда и узнать, что случилось?",
						"Ладно договорилась.",
					],
					AfterAction: () => {
						Scene.Player.PushQuest(
							new Quest("Соседи", this)
								.AddFakeMoveTask(3400, "Станция", 3400)
								.AddHasItemsTask("Собрать жетоны с трупов", [DogTag, 2])
								.AddPlaceholderTask("Вернуться к Старосте")
						);
					},
					Owner: this,
					OwnerFirst: true,
				};
			default:
				return {
					Messages: ["Арсюша не придумал мне диалог который я буду\nговорить когда мой квест выполнен. Скажите\nАрсюше чтобы он сделал это."],
					Owner: this,
					OwnerFirst: true,
				};
		}
	}

	public GetName(): string {
		return "Староста";
	}
}
