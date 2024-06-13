import { Quest } from "../../Quest.js";
import { GameObject } from "../../Utilites.js";

export class Character extends GameObject {
	protected _dialogLength = -1;
	protected _dialogState: number | null = 0;

	public GetDialog(): Dialog {
		return;
	}

	public static IsTalked() {
		return false;
	}
}

export type Dialog = {
	State: number;
	Messages: string[];
	Quest?: Quest;
};
