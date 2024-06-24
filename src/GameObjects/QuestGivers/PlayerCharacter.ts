import { Tag } from "../../Enums.js";
import { Quest } from "../../Quest.js";
import { Scene } from "../../Scene.js";
import { Character, Dialog } from "./Character.js";
import { Elder } from "./Elder.js";

export class PlayerCharacter extends Character {
	constructor() {
		super(50, 100);

		this.Tag = Tag.NPC;
	}

	public override GetDialog(): Dialog {
		super.GetDialog();

		switch (this._completedQuests) {
			case 0:
				return {
					Messages: ["Где это я?", "Нужно побыстрее выбираться."],
					Owner: this,
					AfterAction: () => {
						Scene.Player.PushQuest(
							new Quest("Свет в конце тоннеля", this, () => {
								this._completedQuests++;
								Scene.Player.SpeakWith(this);
							})
								.AddCompletedQuestsTask("Найти выход из метро", Scene.Current.GetByType(Elder)[0] as Character, 1)
								.AddMoveTask(34200, "Выход")
						);
					},
					OwnerFirst: true,
				};
			case 1:
				return {
					Messages: ["Ну вот и все я его нашел, осталось только\nподняться.", "А точно, Артем хотел чтобы я сообщил по\nрации, что нашел выход."],
					Owner: this,
					OwnerFirst: false,
				};
		}
	}

	public GetName(): string {
		return "Мысли Макса";
	}
}
