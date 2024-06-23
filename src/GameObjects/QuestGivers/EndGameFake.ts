import { Tag } from "../../Enums.js";
import { GetSound } from "../../Game.js";
import { Scene } from "../../Scene.js";
import { Artem } from "./Artem.js";
import { Character, Dialog } from "./Character.js";
import { Elder } from "./Elder.js";

export class EndGameFake extends Character {
	constructor() {
		super(50, 100);

		this.Tag = Tag.NPC;
	}

	public override GetDialog(): Dialog {
		super.GetDialog();

		if (this._completedQuests === 0 && (Scene.Current.GetByType(Elder)[0] as Character).GetCompletedQuestsCount() === 1) this._completedQuests++;

		switch (this._completedQuests) {
			case 0:
				return {
					Messages: ["Артем, приём.", "Ну что там с выходом?", "Ещё не нашел.", "Ну так ищи быстрее."],
					Owner: this,
					OwnerFirst: false,
				};
			case 1:
				this._completedQuests++;

				return {
					Messages: ["Ну вот и все я его нашел, осталось только\nподняться.", "А точно, Артем хотел чтобы я сообщил по\nрации что нашел выход."],
					Owner: this,
					OwnerFirst: false,
				};
			case 2:
				this._completedQuests++;

				return {
					Messages: ["Артем, прием, я его нашел, нашел выход,\nон находится, не доходя до центральной\nветки.", "Принял, не мог бы ты подождать меня у него?", "Хорошо."],
					Owner: this,
					AfterAction: () => {
						(Scene.Current.GetByType(Artem)[0] as Artem).StartEnd();
					},
					OwnerFirst: false,
				};
			case 3:
				this._completedQuests++;

				return {
					Messages: ["Вот спасибо тебе большое, услужил."],
					Owner: this,
					AfterAction: () => {
						(Scene.Current.GetByType(Artem)[0] as Artem).Shoot();
					},
					OwnerFirst: true,
				};
			case 4:
				return {
					Messages: ["Эх, Максим, Максим, как так то, ведь это я\nтот выход завалил. Что бы никто не покинул\nэто метро."],
					Owner: this,
					OwnerFirst: true,
				};
		}
	}

	public GetName(): string {
		return this._completedQuests === 2 ? "Мысли Макса" : "Артём";
	}
}
