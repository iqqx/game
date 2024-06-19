import { Tag } from "../../Enums.js";
import { Quest } from "../../Quest.js";
import { Scene } from "../../Scene.js";
import { Character, Dialog } from "./Character.js";

export class GuardFake extends Character {
	constructor(x: number, y: number) {
		super(50, 100);

		this.Tag = Tag.NPC;
		this._x = x;
		this._y = y;
	}

	public override GetDialog(): Dialog {
		super.GetDialog();

		return {
			Messages: ["Стой кто идет покажи руки есть оружие?", "Тихо, тихо, убираю.", "Пойдем к нашему старосте он задаст тебе пару\nвопросов."],
			AfterAction: () => {
				Scene.Player.PushQuest(new Quest("Разговор", this).AddPlaceholderTask("Поговорить со старостой"));
				this._completedQuests++;
			},
			Owner: this,
			OwnerFirst: true,
		};
	}

	public GetName(): string {
		return "Охранник";
	}
}
