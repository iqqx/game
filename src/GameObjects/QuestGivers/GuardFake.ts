import { GetSound, GetSprite } from "../../AssetsLoader.js";
import { Quest } from "../../Quest.js";
import { Scene } from "../../Scene.js";
import { Character, Dialog } from "./Character.js";
import { Elder } from "./Elder.js";

export class GuardFake extends Character {
	constructor() {
		super(0, 0, GetSprite("Elder"));
	}

	public override GetDialog(): Dialog {
		super.GetDialog();

		return {
			Messages: ["Стой!\nКто идёт?\nПокажи руки!\nОружие есть?", "Тихо, тихо, убираю.", "Пойдём к нашему Старосте, он задаст тебе пару\nвопросов."],
			Voices: [GetSound("Dialog_3_0"), GetSound("Dialog_3_1"), GetSound("Dialog_3_2")],
			AfterAction: () => {
				Scene.Current.Player.PushQuest(new Quest("Разговор", this).WithoutCompletionSound().AddTalkTask("Поговорить со старостой", Scene.Current.GetByType(Elder)[0] as Character));
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
