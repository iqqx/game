import { Tag } from "../../Enums.js";
import { Scene } from "../../Scene.js";
import { Character, Dialog } from "./Character.js";
import { Elder } from "./Elder.js";

export class FakeEndGuard extends Character {
	constructor() {
		super(50, 100);

		this.Tag = Tag.NPC;
	}

	public override GetDialog(): Dialog {
		super.GetDialog();

		switch ((Scene.Current.GetByType(Elder)[0] as Character).GetCompletedQuestsCount()) {
			case 0:
				return {
					Messages: ["Стой, кто идет? Проход закрыт.\nПриблизишься на шаг - стреляем."],
					Owner: this,
					OwnerFirst: true,
				};
			case 1:
				return {
					Messages: [
						"Стой, кто идет? Проход закрыт.\nПриблизишься на шаг - стреляем.",
						"Я от Старосты, он должен был передать.",
						"А ну проходи, только быстро, чтобы никто не\nвидел.",
					],
					Owner: this,
					OwnerFirst: true,
				};
		}
	}

	public GetName(): string {
		return "Охранник";
	}
}
