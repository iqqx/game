import { EnemyType } from "../../Enums.js";
import { KillTask, Quest } from "../../Quest.js";
import { GameObject } from "../../Utilites.js";
import { Morshu } from "./Morshu.js";

export class Character extends GameObject {
	protected _dialogLength = -1;
	protected _dialogState: number | null = 0;

	public GetDialog(): Dialog {
		return;
	}
}

export type Dialog = {
	State: number;
	Messages: string[];
	Quest?: Quest;
};
