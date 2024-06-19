import { Scene } from "../../Scene.js";
import { Interactable } from "../GameObject.js";

export class Character extends Interactable {
	protected _completedQuests = 0;
	private _isTalked = false;

	public GetDialog(): Dialog {
		this._isTalked = true;

		return;
	}

	public IsTalked() {
		return this._isTalked;
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

	public GetCompletedQuestsCount() {
		return this._completedQuests;
	}

	public GetName() {
		return "НЕКТО";
	}
}

export type Dialog = {
	Messages: string[];
	AfterAction?: () => void;
	Owner: Character;
	OwnerFirst: boolean;
};
