import { Rectangle } from "./utilites.js";

export const player = {
	x: 0,
	y: 0,
	xMouse: 0,
	yMouse: 0,
	direction: 1,
	sit: false,
	movingLeft: false,
	movingRight: false,
	verticalAcceleration: 0,
	lastShootTick: 0,
	LMBPressed: false,
};

export const platforms = [
	new Rectangle(300, 0, 300, 25),
	new Rectangle(500, 0, 25, 100),
	new Rectangle(900, 220, 200, 25),
	new Rectangle(1500, 200, 80, 30),
	new Rectangle(2000 - 25, 350, 25, 100),
];

export const bullets = [
	{
		x: 0,
		y: 0,
		length: 0,
		angle: 0,
		shootTimeStamp: 0,
	},
];

export const sounds = {
	Shoot: (function () {
		const s = new Audio("shoot-1.wav");
		s.preload = "auto";
		s.load();
		return {
			Play: (volume: number) => {
				const c = s.cloneNode() as HTMLAudioElement;
				c.volume = volume;
				c.play();
			},
		};
	})(),
};