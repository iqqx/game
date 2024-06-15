import { Quest } from "../../Quest.js";
import { Scene } from "../../Scene.js";
import { Interactable } from "../../Utilites.js";

export class Character extends Interactable {
	public GetDialog(): Dialog {
		return;
	}

	public static IsTalked() {
		return false;
	}

	GetInteractives(): string[] {
		return ["говорить"];
	}

	OnInteractSelected(id: number): void {
		switch (id) {
			case 0:
				Scene.Player.SpeakWith(this);
				break;
		}
	}
}

export type Dialog = {
	Messages: string[];
	Quest?: Quest;
};
