import { E, registerShot, backdrop } from '/engine/core.js';
import { person, rake, flask, magnifier, cloud, bird, ground, grass, cornLine, tubes } from './people.js';
registerShot('t1', { draw(g, t) {
  g.fillStyle = '#fbfcfd'; g.fillRect(-E.W, -E.H, E.W * 3, E.H * 3);
  cloud(g, 260, 400, 0.9); cloud(g, 1460, 170, 0.8); cloud(g, 1720, 260, 1.1); bird(g, 330, 120, 1, t * 6); bird(g, 410, 200, 1.2, t * 6 + 1);
  const Y = 960; ground(g, Y, 300, 1700);
  cornLine(g, 470, Y, 300, { cob: 1, sway: 6 }); cornLine(g, 560, Y, 200, { sway: -4 }); grass(g, 440, Y); grass(g, 950, Y);
  person(g, { x: 760, y: Y - 2, s: 1.1, who: 'farmer', expr: 'smile', armL: [0.12, 0.06], armR: [0.22, 0.95], propR: rake, blink: (t % 3) > 2.9 });
  person(g, { x: 1260, y: Y - 2, s: 1.1, who: 'breeder', expr: 'neutral', armL: [0.4, 2.0], propL: flask, armR: [0.4, 2.15], propR: magnifier });
  tubes(g, 1560, Y);
} });
