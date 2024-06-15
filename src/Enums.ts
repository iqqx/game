export enum EnemyType {
	Rat,
	Yellow,
	Red,
	Green,
}

export enum Tag {
	Player = 2 ** 0,
	Enemy = 2 ** 1,
	Platform = 2 ** 2,
	Wall = 2 ** 3,
	NPC = 2 ** 4,
	Pickable = 2 ** 5,
	Ladder = 2 ** 6,
}
