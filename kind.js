import Matter from "matter-js";
import KonamiCode from "konami-code";
import kind1 from "./images/1.png";
import kind2 from "./images/2.png";
import kind3 from "./images/3.png";
import kind4 from "./images/4.png";
import kind5 from "./images/5.png";

const barFlavors = [kind1, kind2, kind3, kind4, kind5];
const activeBars = [];

export default function start() {
  new KonamiCode().listen(() => {
    /**
     * Returns a random integer between min (inclusive) and max (inclusive)
     * Using Math.round() will give you a non-uniform distribution!
     * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random
     */
    function getRandomInt(min, max) {
      return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    var Engine = Matter.Engine,
      Render = Matter.Render,
      Runner = Matter.Runner,
      Composites = Matter.Composites,
      Common = Matter.Common,
      MouseConstraint = Matter.MouseConstraint,
      Mouse = Matter.Mouse,
      World = Matter.World,
      Body = Matter.Body,
      Bodies = Matter.Bodies,
      Vector = Matter.Vector;

    // create engine
    var engine = Engine.create(),
      world = engine.world;

    // create renderer
    var render = Render.create({
      element: document.body,
      engine: engine,
      options: {
        width: window.innerWidth,
        height: window.innerHeight,
        showAngleIndicator: false,
        wireframes: false
      }
    });

    Render.run(render);

    // create runner
    var runner = Runner.create();
    Runner.run(runner, engine);

    setInterval(() => {
      const dir = getRandomInt(0, 1) ? 1 : -1;
      const x = dir == 1 ? -10 : window.innerWidth + 10;

      //const body = Bodies.rectangle(-10, 200, 142, 60, {
      const body = Bodies.rectangle(x, 200, 142, 60, {
        chamfer: 5,
        render: {
          sprite: {
            texture: barFlavors[getRandomInt(0, 4)],
            xScale: 0.12,
            yScale: 0.18
            //Is there a 'width:' or 'height' property?
          }
        }
      });

      activeBars.push({ body, created: new Date() });

      Body.setVelocity(body, { x: 24 * dir, y: -10 });
      Body.setAngularVelocity(body, (Math.PI / 16) * dir);

      World.add(world, body);
    }, 100);

    World.add(world, [
      // Top wall
      Bodies.rectangle(window.innerWidth / 2, -25, window.innerWidth, 50, {
        isStatic: true
      }),

      // Right wall
      Bodies.rectangle(
        window.innerWidth + 25,
        window.innerHeight / 2 + 250,
        50,
        window.innerHeight,
        { isStatic: true }
      ),

      // Left wall
      Bodies.rectangle(
        0 - 25,
        window.innerHeight / 2 + 250,
        50,
        window.innerHeight,
        {
          isStatic: true
        }
      )
    ]);

    // Bottom wall
    const bottomWall = Bodies.rectangle(
      window.innerWidth / 2,
      window.innerHeight + 25,
      window.innerWidth,
      50,
      { isStatic: true }
    );

    World.add(world, bottomWall);

    // add mouse control
    var mouse = Mouse.create(render.canvas),
      mouseConstraint = MouseConstraint.create(engine, {
        mouse: mouse,
        constraint: {
          stiffness: 0.1,
          render: {
            visible: false
          }
        }
      });

    World.add(world, mouseConstraint);

    // keep the mouse in sync with rendering
    render.mouse = mouse;

    setInterval(() => {
      World.remove(world, bottomWall);
      setTimeout(() => {
        World.add(world, bottomWall);
      }, 2000);

      let i = 0;
      activeBars.forEach((bar, index, object) => {
        if (Math.floor((new Date() - bar.created) / 1000) > 30) {
          World.remove(world, bar);
          object.splice(index, 1);
        }
      });
    }, 10000);
  });
}
