import $ from 'jquery';
import Rube2Box2D from './Rube2Box2D';
import Box2Debug from './Box2Debug';
import Constants from './Constants';

export default class Box2DWorld {

  constructor(canvas, json) {

    this.canvas = canvas;
    this.timeStep = 1 / 60;
    this.velocityIterations = 10;
    this.positionIterations = 8;
    this.lives = 5

    var gravity = new Box2D.b2Vec2(0.0, -10.0);
    this.world = new Box2D.b2World(gravity);

    this.step = this.step.bind(this)

    this.checkpoints = [{
      x: 20,
      y: -14.7
    }, {
      x: 80,
      y: -14.7
    }, {
      x: 30,
      y: -14.7
    }]
    this.progressPoints = [{
      x: 100,
      y: 0
    }, {
      x: 10,
      y: 0
    }]
    this.lastCheckpoint = this.checkpoints[0]
    this.startState = []

    this.debug();

    this.bodies = {};
    this.joints = {};

    let bodiesJson = json.body;
    let body
    let loadedBodies = [];
    var _floor = []


    bodiesJson.forEach((b) => {
      body = Rube2Box2D.loadBodyFromRUBE(b, this.world);
      this.bodies[body.name] = body;
      loadedBodies.push(body);

      if (body.name.indexOf('ground') == 0 || body.name.indexOf('lift') == 0) {
        _floor.push(body.name)
      }

      if (Constants.bodyparts.indexOf(body.name) != -1) {
        this.startState[body.name] = {
          x: body.GetPosition().get_x(),
          y: body.GetPosition().get_y(),
          angle: body.GetAngle()
        }
      }
    });

    // Normalize distances
    let bodyPosition = {
      x: this.bodies['body'].GetPosition().get_x(),
      y: this.bodies['body'].GetPosition().get_y()
    }

    for (var key in this.startState) {
      this.startState[key].x -= bodyPosition.x
      this.startState[key].y -= bodyPosition.y
    }

    this.progressPoints = this.progressPoints.concat(this.checkpoints).sort(function(c1, c2) {
      return c1.x - c2.x
    })

    let jointsJson = json.joint;
    let joint;
    jointsJson.forEach((j) => {
      joint = Rube2Box2D.loadJointFromRUBE(j, this.world, loadedBodies);
      this.joints[joint.name] = joint;
    });

    this.keymap = {};
    $('body').on('keydown keyup', (e) => {
      this.handleArrows(e.keyCode, e.type == 'keydown');
    });

    $('.game__key').on('touchstart mousedown', (e) => {
      e.preventDefault();
      this.handleArrows($(e.target).hasClass('game__key--right') ? 39 : 37, true);
    });

    $('.game__key').on('touchend touchcancel mouseup', (e) => {
      e.preventDefault();
      this.handleArrows($(e.target).hasClass('game__key--right') ? 39 : 37, false);
    });

    let that = this;
    var _end = ["hand_front_top", "hand_back_top", "leg_front_tie", "leg_back_tie", "body", "head"];
    let contactListener = new Box2D.JSContactListener();
    contactListener.PostSolve = function() {};
    contactListener.PreSolve = function() {};
    contactListener.EndContact = function(contactPtr, impulse) {
      let contact = Box2D.wrapPointer(contactPtr, Box2D.b2Contact),
        bA = contact.GetFixtureA().GetBody(),
        bB = contact.GetFixtureB().GetBody();

      // Check for decor collision

      var decor;

      if (Constants.bodyparts.indexOf(bA.name) >= 0 && bB.name.indexOf('decor_') == 0) {
        decor = bB
      }

      if (Constants.bodyparts.indexOf(bB.name) >= 0 && bA.name.indexOf('decor_') == 0) {
        decor = bA
      }

      if (decor) {
        setTimeout(() => {
          let fixture = decor.GetFixtureList()

          do {
            let filterData = fixture.GetFilterData()
            filterData.set_maskBits(65533)
            fixture.SetFilterData(filterData)
            fixture = fixture.GetNext()
          } while (fixture.e != 0)
        }, 100)
      }

    };
    contactListener.BeginContact = function(contactPtr) {

      if (that.finish) return;

      let contact = Box2D.wrapPointer(contactPtr, Box2D.b2Contact),
        bA = contact.GetFixtureA().GetBody(),
        bB = contact.GetFixtureB().GetBody();

      // Check for body to floor collision

      if ((_floor.indexOf(bA.name) != -1 && _end.indexOf(bB.name) >= 0) ||
        (_floor.indexOf(bB.name) != -1 && _end.indexOf(bA.name) >= 0)) {
        that.finish = true;

        setTimeout(() => {
          that.lives -= 1

          if (that.lives <= 0) {
            debugger
            that.death(false)
          } else {
            that.resetPlayer()
            that.finish = false
          }
        }, 1000);
      }
    }
    this.world.SetContactListener(contactListener);

    this.fps = {
      dt: 0,
      time: 0
    };

    this.resetPlayer()
  }

  addEndListener(callback) {
    this.EndListener = callback;
  }

  addRenderListener(callback) {
    this.RenderListener = callback;
  }

  death(didWin) {

    let joints = ['tendon_rf', 'knee_r', 'ankle_r', 'tendon_lf', 'knee_l', 'ankle_l', 'joint26', 'joint8']
    joints.forEach((j) => {
      this.world.DestroyJoint(this.joints[j]);
      delete this.joints[j];
    });

    let that = this;
    setTimeout(() => {
      that.EndListener(didWin);
    }, 1000);
  }

  handleArrows(keyCode, state) {
    this.keymap[keyCode] = state;

    if (keyCode === 39) {
      $('.game__controls').toggleClass('game--arrow--right', state);
    } else {
      $('.game__controls').toggleClass('game--arrow--left', state);
    }
  }

  debug() {
    let deb = Box2Debug.getCanvasDebugDraw(this.canvas);

    var e_shapeBit = 0x0001;
    var e_jointBit = 0x0002;
    deb.SetFlags(e_shapeBit | e_jointBit);

    this.world.SetDebugDraw(deb);
  }


  step() {

    // Phyics

    let now = new Date().getTime();
    this.fps.dt = (now - this.fps.time) / 1000;

    this.fps.time = now;

    if (this.fps.dt > this.timeStep)
      this.fps.dt = this.timeStep;

    this.update();

    this.world.Step(this.fps.dt, this.velocityIterations, this.positionIterations);
    this.world.ClearForces();

    this.progress = this.bodies["body"].GetPosition().get_x()

    if (this.progress >= 100) {
      if (!this.finish) {
        this.finish = true
        this.keymap = {}
        this.death(true)
      }
    }

    let numProgressPoints = this.progressPoints.length
    for (var i = 0; i < numProgressPoints; i++) {
      if (this.progressPoints[i].x < this.progress) {
        numProgressPoints--;
        this.onProgress(this.progressPoints.shift())
      } else {
        i = numProgressPoints
      }
    }

    if (this.RenderListener != null) {
      this.RenderListener(this.bodies)
    }
  }

  onProgress(value) {
    if (this.checkpoints.indexOf(value) != -1) {
      this.lastCheckpoint = value
    }
  }

  update() {

    if (this.finish) return;

    let bend = this.bodies['body'].GetAngle();
    if (bend < -0.3)
      bend = -1;
    if (bend > 0.3)
      bend = 1;


    let j,
      k,
      a;

    // right
    j = this.joints["tendon_rf"];
    k = this.joints["knee_r"];
    a = this.joints["ankle_r"];
    if (this.keymap[39]) {

      //let bend = 2;

      if (k.data.bend != bend) {


        if (bend == -1) {
          this.joints[j.name] = j.SetLength(0.1);
          this.joints[k.name] = k.SetLength(0.8);
        } else if (bend == 1) {
          this.joints[k.name] = k.SetLength(0.65);
        } else {
          this.joints[j.name] = j.SetLength(0.1);
          this.joints[k.name] = k.SetLength(0.1);
        }

        k.data.bend = bend;
      }
    } else {
      if (k.data.bend !== null) {
        k.data.bend = null;
        this.joints[j.name] = j.SetLength(j.data.length);
        this.joints[k.name] = k.SetLength(k.data.length);
        this.joints[a.name] = a.SetLength(a.data.length);
      }
    }

    // left
    j = this.joints["tendon_lf"];
    k = this.joints["knee_l"];
    a = this.joints["ankle_l"];
    if (this.keymap[37]) {
      let bend = 2;

      if (k.data.bend != bend) {


        if (bend == -1) {
          this.joints[j.name] = j.SetLength(0.1);
          this.joints[k.name] = k.SetLength(0.8);
        } else if (bend == 1) {
          this.joints[k.name] = k.SetLength(0.65);
        } else {
          this.joints[j.name] = j.SetLength(0.1);
          this.joints[k.name] = k.SetLength(0.1);
        }

        k.data.bend = bend;
      }
    } else {
      if (k.data.bend !== null) {
        k.data.bend = null;
        this.joints[j.name] = j.SetLength(j.data.length);
        this.joints[k.name] = k.SetLength(k.data.length);
        this.joints[a.name] = a.SetLength(a.data.length);
      }
    }
  }

  dispose() {

    $.each(this.joints, (key, joint) => {
      this.world.DestroyJoint(joint);
    });

    $.each(this.bodies, (key, body) => {
      this.world.DestroyBody(body);
    });

    this.world.__destroy__();

    this.bodies = null;
    this.joints = null;
    this.world = null;

    $('body').off('keydown keyup');
    $('.game__key').off('touchstart touchend touchcancel mousedown mouseup');
  }

  resetPlayer() {
    for (var bodyName in this.startState) {
      let state = this.startState[bodyName]
      this.bodies[bodyName].SetType(Box2D.b2_staticBody)
      this.bodies[bodyName].SetTransform(new Box2D.b2Vec2(state.x + this.lastCheckpoint.x, state.y + this.lastCheckpoint.y), state.angle)
      this.bodies[bodyName].SetType(Box2D.b2_dynamicBody)
    }
  }
}
;
