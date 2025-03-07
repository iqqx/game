import { GetSound, GetSprite } from "../../AssetsLoader.js";
import { Quest } from "../../Quest.js";
import { Scene } from "../../Scene.js";
import { Sprite } from "../../Utilites.js";
import { Character, Dialog } from "./Character.js";

export class Elder extends Character {
	constructor(x: number, y: number) {
		super(x, y, GetSprite("Elder"));
	}

	public override GetDialog(): Dialog {
		super.GetDialog();

		const active = Scene.Player.GetQuestsBy(this);
		if (active.length > 0) {
			if (active[0].IsCompleted()) {
				this._completedQuests++;

				Scene.Player.TakeItem("DogTag", 2);
				Scene.Player.RemoveQuest(active[0]);

				return {
					Messages: [
						"Ну, я нашёл ваших пропавших людей, но они не\nмного мёртвые.",
						"Что случилось?\nКак так произошло?",
						"На них напали крысы, но я с ними разобрался.",
						"Очень жаль наших людей, но ничего не\nподелаешь. Это жизнь. Вот тебе награда и\nспасибо за помощь. Может быть, останешься\nс нами на станции?",
						"Спасибо, но нет. У меня свои цели.",
						"Слушай, может быть, это поможет. Но я слышал,\nчто после станции, в конце туннеля, есть\nвыход на верх, но там стоит охрана.",
						"Очень интересно. Как раз его-то я и искал.\nНо как быть с охраной?",
						"Ладно, я помогу тебе. Один из охранников -\nмой друг. Подойди к нему и скажи, что от\nменя, он тебя пропустит.",
						"Ладно, хорошо. Спасибо большое.",
						"Удачи.",
					],
					Voices: [
						GetSound("Dialog_10_0"),
						GetSound("Dialog_10_1"),
						GetSound("Dialog_10_2"),
						GetSound("Dialog_10_3"),
						GetSound("Dialog_10_4"),
						GetSound("Dialog_10_5"),
						GetSound("Dialog_10_6"),
						GetSound("Dialog_10_7"),
						GetSound("Dialog_10_8"),
						GetSound("Dialog_10_9"),
					],
					Owner: this,
					OwnerFirst: false,
				};
			}

			return {
				Messages: ["Ну что?\nТы ещё здесь?", "Да, вот станцию осматриваю.", "Давай, уже иди за моими людьми, надо их найти.", "Сейчас, сейчас."],
				Voices: [GetSound("Dialog_9_0"), GetSound("Dialog_9_1"), GetSound("Dialog_9_2"), GetSound("Dialog_9_3")],
				Owner: this,
				OwnerFirst: true,
			};
		}

		switch (this._completedQuests) {
			case 0:
				return {
					Messages: [
						"Так и кто это к нам пожаловал?\nДокументы есть?",
						"Я - Артём, вот документы.",
						"Ого, военный! Оставайся у нас, нам такие\nнужны. В довольствие не обидим.",
						"Нет, спасибо. У меня другая цель.",
						"Ну, ладно. Так уж и быть, тогда не хочешь\nуслужить нам за вознаграждение?",
						"Ну, слушаю. Что надо?",
						"Мы хотели узнать, что там на другой станции.\nСлышали, что там есть люди и отправили туда\nлюдей, но потеряли с ними связь. Не мог бы\nты сходить туда и узнать, что случилось?",
						"Ладно, договорились.",
					],
					Voices: [
						GetSound("Dialog_4_0"),
						GetSound("Dialog_4_1"),
						GetSound("Dialog_4_2"),
						GetSound("Dialog_4_3"),
						GetSound("Dialog_4_4"),
						GetSound("Dialog_4_5"),
						GetSound("Dialog_4_6"),
						GetSound("Dialog_4_7"),
					],
					AfterAction: () => {
						Scene.Player.PushQuest(
							new Quest("Соседи", this)
								.AddFakeMoveTask(27500, "Станция", 30500)
								.AddHasItemsTask("Собрать жетоны с трупов", { Id: "DogTag", Count: 2 })
								.AddTalkTask("Вернуться к Старосте", this)
						);
					},
					Owner: this,
					OwnerFirst: true,
				};
			default:
				return {
					Messages: ["Cпасибо."],
					Voices: [GetSound("Dialog_12")],
					Owner: this,
					OwnerFirst: true,
				};
		}
	}

	public GetAvatar() {
		return GetSprite("Elder_Avatar") as Sprite;
	}

	public GetName(): string {
		return "Староста";
	}
}
