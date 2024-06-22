import { RatTail, RifleBullet } from "../../Assets/Items/Item.js";
import { AK } from "../../Assets/Weapons/Weapon.js";
import { Canvas } from "../../Context.js";
import { Tag } from "../../Enums.js";
import { GetSprite } from "../../Game.js";
import { Quest } from "../../Quest.js";
import { Scene } from "../../Scene.js";
import { Rectangle } from "../../Utilites.js";
import { Character, Dialog } from "./Character.js";

export class Trader extends Character {
	constructor(x: number, y: number) {
		super(50, 100);

		this.Tag = Tag.NPC;
		this._x = x;
		this._y = y;
	}

	override Render(): void {
		Canvas.DrawImage(GetSprite("Trader"), new Rectangle(this._x - Scene.Current.GetLevelPosition(), this._y, this.Width, this.Height));
	}

	public override GetDialog(): Dialog {
		super.GetDialog();

		const active = Scene.Player.GetQuestsBy(this);
		if (active.length > 0) {
			if (active[0].IsCompleted()) {
				this._completedQuests++;

				Scene.Player.RemoveItem(RatTail);
				Scene.Player.RemoveItem(RatTail);
				Scene.Player.RemoveItem(RatTail);
				Scene.Player.RemoveQuest(active[0]);

				return {
					Messages: ["Они все мертвы. Вот хвосты.", "Держи награду."],
					Owner: this,
					OwnerFirst: false,
					AfterAction: () => {
						Scene.Player.GiveQuestItem(new AK());
						Scene.Player.GiveQuestItem(new RifleBullet(20));
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
						"Короче, Меченый, у меня к тебе есть одно\nпредложение: выполнишь для меня задание — за\nне большой приз в виде двух батонов и пяти\nпуль. Заодно посмотрим, как быстро у тебя\nбашка соображает",
						"Да что собственно вообще нужно?",
						"Надо убить трех рад крыс ну и принести их\nмне, ну там для дел, тебе не нужно знать.\nНу что как ты в деле?",
						"Хорошо договорились.",
					],
					AfterAction: () => {
						Scene.Player.PushQuest(
							new Quest("Сенячка не смог придумать название для этого квеста", this)
								.AddHasItemsTask("Добыть 6 хвостов крыс", [RatTail, 6])
								.AddTalkTask("Вернуться к Торгашу", this)
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
		return "Торгаш";
	}
}
