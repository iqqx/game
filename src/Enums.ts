export enum EnemyType {
	Rat,
	Yellow,
	Red,
	Green,
}

export enum Tag {
	Player = 2 ** 0,
	Enemy = 2 ** 1,
	Wall = 2 ** 2,
	Platform = 2 ** 3,
	NPC = 2 ** 4,
	Pickable = 2 ** 5,
	Ladder = 2 ** 6,
	Clip = 2 ** 7,
}

export enum Direction {
	Right = 1,
	Left = -1,
}

export enum PointerActionState {
	Down,
	Move,
	Up,
}
