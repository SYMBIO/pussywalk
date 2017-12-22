import $ from 'jquery';
import Box2Debug from './Box2Debug';
import Chain from './Chain';
import Config from './Config';
import Constants from './Constants';
import Recorder from './Recorder';
import Rube2Box2D from './Rube2Box2D';
import Stats from 'stats.js'
import { TweenMax, Cubic } from 'gsap'

export default class Box2DWorld {

  constructor(canvas, json, hard) {

    this.canvas = canvas;
    this.hard = hard
    this.timeStep = 1 / 60;
    this.velocityIterations = 10;
    this.positionIterations = 6;
    this.lifes = hard ? 1 : 3
    this.record = false
    this.pausePhysics = false
    this.paused = false

    this.renderer = null
    this.audioPlayer = null
    this.jointsToDestroy = []
    this.bodyAngle = 0

    var gravity = new Box2D.b2Vec2(0.0, -10.0);
    this.world = new Box2D.b2World(gravity);

    this.step = this.step.bind(this)
    this.stepBack = this.stepBack.bind(this)
    this.onResetComplete = this.onResetComplete.bind(this)
    this.resetPlayer = this.resetPlayer.bind(this)
    this.prepareForReset = this.prepareForReset.bind(this)

    this.frontSlipperDropPoint = {
      x: 40,
      y: 0
    }
    this.backSlipperDropPoint = {
      x: 76,
      y: 0
    }
    this.startPoint = {
      x: 19,
      y: -16
    }
    this.endPoint = {
      x: 165,
      y: 0
    }
    this.sheepPickupPoint = {
      x: 75,
      y: -15
    }

    this.checkpoints = [
      this.startPoint,
      {
        x: 33,
        y: -15.7
      }, {
        x: 50,
        y: -15.7
      }, {
        x: 65,
        y: -15
      }, {
        x: 75,
        y: -15
      }, {
        x: 92,
        y: -15.7
      }, {
        x: 112,
        y: -23.7
      }, {
        x: 137,
        y: -23.7
      }]
    this.progressPoints = [
      this.frontSlipperDropPoint,
      this.backSlipperDropPoint,
      this.sheepPickupPoint,
    ]
    this.lifePickupPoints = hard ? [] : [{
      x: 42,
      y: -16
    }, {
      x: 68,
      y: -15
    }, {
      x: 91.6,
      y: -16.5
    }, {
      x: 127,
      y: 24.7
    }]

    this.visibleLifes = this.lifePickupPoints

    this.progressPoints = this.progressPoints.concat(this.lifePickupPoints)

    this.lastCheckpoint = this.checkpoints[0]
    this.startState = []
    this.gameHistory = []

    this.debug();

    this.bodies = {};
    this.joints = {};
    this.loadedBodies = [];

    let bodiesJson = json.body;
    let body
    var _floor = []
    this.frontSlipperJointDef = null
    this.backSlipperJointDef = null

    bodiesJson.forEach((b) => {
      body = Rube2Box2D.loadBodyFromRUBE(b, this.world);
      this.bodies[body.name] = body;
      this.loadedBodies.push(body);

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
      switch (j.name) {
        case "rjoint_flipflop_front":
          this.frontSlipperJointDef = j
          break
        case "rjoint_flipflop_back":
          this.backSlipperJointDef = j
          break
      }
      joint = Rube2Box2D.loadJointFromRUBE(j, this.world, this.loadedBodies);
      this.joints[joint.name] = joint;
    });

    this.keymap = {};
    $('body').on('keydown keyup', (e) => {
      this.handleArrows(e.keyCode, e.type == 'keydown');
    });

    $('.game__key').on('touchstart mousedown', (e) => {
      e.preventDefault();
      this.handleArrows($(e.target).hasClass('game__key--right') || $(e.target).parent().hasClass('game__key--right') ? 39 : 37, true);
    });

    $('.game__key').on('touchend touchcancel mouseup', (e) => {
      e.preventDefault();
      this.handleArrows($(e.target).hasClass('game__key--right') || $(e.target).parent().hasClass('game__key--right') ? 39 : 37, false);
    });

    let that = this;
    var _end = ["hand_front_top", "hand_back_top", "leg_front_tie", "leg_back_tie", "body", "head", "sheep_body"];
    let contactListener = new Box2D.JSContactListener();
    contactListener.PreSolve = function(contactPtr) {

      let contact = Box2D.wrapPointer(contactPtr, Box2D.b2Contact),
        bA = contact.GetFixtureA().GetBody(),
        bB = contact.GetFixtureB().GetBody();
      var bottle
      var otherObject

      // Cane
      if ((bA.name == "decor_stick" || bB.name == "decor_stick") && (bA.GetLinearVelocity().Length() - bB.GetLinearVelocity().Length()) > 3) {
        that.audioPlayer.playCane()
        return
      }

      if ((bA.name == "decor_bear" || bB.name == "decor_bear") && (bA.GetLinearVelocity().Length() - bB.GetLinearVelocity().Length()) > 3) {
        that.audioPlayer.playBear()
        return
      }

      if ((bA.name.indexOf("decor_chair") == 0 || bB.name.indexOf("decor_chair") == 0) && (bA.GetLinearVelocity().Length() - bB.GetLinearVelocity().Length()) > 3) {
        that.audioPlayer.playChair()
        return
      }

      if ((bA.name.indexOf("decor_tp_") == 0 || bB.name.indexOf("decor_tp_") == 0) && (bA.GetLinearVelocity().Length() - bB.GetLinearVelocity().Length()) > 3) {
        that.audioPlayer.playToiletpaper()
        return
      }

      if ((bA.name.indexOf("decor_cup") == 0 || bB.name.indexOf("decor_cup") == 0 || bA.name.indexOf("decor_pencil_holder") == 0 || bB.name.indexOf("decor_pencil_holder") == 0) && (bA.GetLinearVelocity().Length() - bB.GetLinearVelocity().Length()) > 3) {
        that.audioPlayer.playCup()
        return
      }

      if ((bA.name.indexOf("decor_ball") == 0 || bB.name.indexOf("decor_ball") == 0) && (bA.GetLinearVelocity().Length() - bB.GetLinearVelocity().Length()) > 3) {
        that.audioPlayer.playBallBounce()
        return
      }


      if ((bA.name.indexOf("decor_trashbin_top") == 0 || bB.name.indexOf("decor_trashbin_top") == 0 || bA.name.indexOf("decor_trashbin") == 0 || bB.name.indexOf("decor_trashbin") == 0) && (bA.GetLinearVelocity().Length() - bB.GetLinearVelocity().Length()) > 3) {
        that.audioPlayer.playBin()
        return
      }

      // Monitor
      if (bA.name == "decor_monitor" && Constants.bodyparts.indexOf(bB.name) != -1) {
        let impact = (bA.GetLinearVelocity().Length() - bB.GetLinearVelocity().Length())
        that.audioPlayer.playTV(impact / 5)

        that.audioPlayer.playTVOff()
        that.renderer.setState({
          renderPorn: false
        })
        return
      }

      if (bB.name == "decor_monitor" && Constants.bodyparts.indexOf(bA.name) != -1) {
        let impact = (bA.GetLinearVelocity().Length() - bB.GetLinearVelocity().Length())
        that.audioPlayer.playTV(impact / 5)

        that.audioPlayer.playTVOff()
        that.renderer.setState({
          renderPorn: false
        })
        return
      }

      // Bottles
      if (bA.name.indexOf("decor_becherovka_") == 0) {
        bottle = bA
        otherObject = bB
      }

      if (bB.name.indexOf("decor_becherovka_") == 0) {
        bottle = bB
        otherObject = bA
      }

      if (bottle) {
        let impact = (bottle.GetLinearVelocity().Length() - otherObject.GetLinearVelocity().Length())
        if (impact > 7) {
          let i = Math.floor(Math.random() * 8)
          let components = bA.name.split("_")
          components.pop()
          components.push("j" + i)
          let jointName = components.join("_")

          if (that.joints[jointName]) {
            // that.world.DestroyJoint(that.joints[jointName]);
            that.jointsToDestroy = [that.joints[jointName]]
            delete that.joints[jointName]
          }
          if (that.audioPlayer) {
            that.audioPlayer.playBottleBreak()
          }
        } else if (impact > 4) {
          if (that.audioPlayer) {
            that.audioPlayer.playBottleImpact()
          }
        }
        return
      }
    };
    contactListener.PostSolve = function() {};
    contactListener.EndContact = function() {};
    contactListener.BeginContact = function(contactPtr) {

      if (that.inactive) return;

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
        if (decor.name.indexOf("decor_table") == 0 || decor.name.indexOf("decor_chair") == 0) {
          that.audioPlayer.playThump()
        }
        setTimeout(() => {
          let fixture = decor.GetFixtureList()

          do {
            let filterData = fixture.GetFilterData()
            filterData.set_maskBits(65533)
            fixture.SetFilterData(filterData)
            fixture = fixture.GetNext()
          } while (fixture.e != 0)

          that.recorder.addDecor(decor.name)
        }, 100)
      }

      var impact = 0;

      if (_floor.indexOf(bA.name) != -1 && bB.name.indexOf("leg_shoe_") == 0) {
        impact = bB.GetLinearVelocity().Length()
      }

      if (_floor.indexOf(bB.name) != -1 && bA.name.indexOf("leg_shoe_") == 0) {
        impact = bA.GetLinearVelocity().Length()
      }

      if (impact > 3) {
        that.audioPlayer.playStep(impact / 20)
      }

      // Check for body to floor collision

      if ((_floor.indexOf(bA.name) != -1 && _end.indexOf(bB.name) >= 0) ||
        (_floor.indexOf(bB.name) != -1 && _end.indexOf(bA.name) >= 0)) {
        that.inactive = true;

        that.renderer.playDeath()

        setTimeout(() => {
          that.lifes -= 1
          that.callbacks.onLifesUpdate(that.lifes, -1)

          if (that.lifes <= 0) {
            that.death(false)
          } else {
            that.resetPlayer()
            that.audioPlayer.playLoseHealth()
          }
        }, 1000);
      }
    }
    this.world.SetContactListener(contactListener);

    this.fps = {
      dt: 0,
      time: 0
    };

    this.chain = new Chain(this.world, this.bodies.chain_base)
    this.bodies = Object.assign({}, this.bodies, this.chain.bodies)

    this.recorder = new Recorder(this.world, {
      removedFrontSlipper: false,
      removedBackSlipper: false,
      progressPoints: this.progressPoints.slice(),
      progress: 0
    })

    this.resetPlayer()
  }

  sync() {
    this.renderer.setState({
      visibleLifes: this.visibleLifes
    })

    this.callbacks.onLifesUpdate(this.lifes, 0)
  }

  death(didWin) {

    let joints = ['tendon_rf', 'knee_r', 'ankle_r', 'tendon_lf', 'knee_l', 'ankle_l', 'joint26', 'joint8']
    joints.forEach((j) => {
      this.world.DestroyJoint(this.joints[j]);
      delete this.joints[j];
    });

    if (didWin) {
      this.world.DestroyBody(this.bodies["ball_blocker"])
      delete this.bodies["ball_blocker"]
      setTimeout(this.audioPlayer.playBallPop, 600)
      this.audioPlayer.silenceMusic()
      this.renderer.didFinish()
      this.audioPlayer.playEnd()
    }

    setTimeout(() => {
      this.callbacks.onGameEnd(didWin, this.progress, this.hard);
    }, 3000)
  }

  handleArrows(keyCode, state) {

    if (!this.audioPlayer.isInitialized) {
      this.audioPlayer.init()
    }

    this.keymap[keyCode] = state;

    if (Config.isDebug) {
      if (keyCode == 78 && state) {
        this.renderer.setState({
          naked: !this.renderer.isNaked()
        })
      }

      if (keyCode == 79 && state) {
        this.renderer.setState({
          drawDebug: !this.renderer.drawDebug
        })
      }

      if (keyCode == 80 && state) {
        this.cheatReset()
      }
    }

    if (keyCode === 39) {
      $('.game__controls').toggleClass('game--arrow--right', state);
    } else {
      $('.game__controls').toggleClass('game--arrow--left', state);
    }
  }

  debug() {
    let deb = Box2Debug.getCanvasDebugDraw(this.canvas);

    deb.SetFlags(0b11);

    this.world.SetDebugDraw(deb);
  }

  step() {

    if (this.paused) {
      return
    }

    // Phyics
    if (!this.pausePhysics) {

      if (this.jointsToDestroy) {
        for (var i = 0; i < this.jointsToDestroy.length; i++) {
          this.world.DestroyJoint(this.jointsToDestroy[i])
        }

        this.jointsToDestroy = null
      }

      let now = new Date().getTime();
      this.fps.dt = (now - this.fps.time) / 1000;

      this.fps.time = now;

      if (this.fps.dt > this.timeStep) {
        this.fps.dt = this.timeStep;
      }

      this.update();

      this.world.Step(this.fps.dt * 1.3, this.velocityIterations, this.positionIterations);
      this.world.ClearForces();

      this.progress = this.bodies["body"].GetPosition().get_x()

      // Level end
      if (this.progress >= this.endPoint.x) {
        if (!this.inactive) {
          this.inactive = true
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
    }

    if (this.renderer) {
      this.renderer.render(this.bodies)
    }

    if (this.record) {
      this.recorder.snap()
    }
  }

  onProgress(value) {
    if (value == this.frontSlipperDropPoint) {
      var j
      j = this.joints["rjoint_flipflop_front"]
      this.world.DestroyJoint(j);

      this.joints["rjoint_flipflop_front"] = null

      this.recorder.removedFrontSlipper = true
    }
    if (value == this.backSlipperDropPoint) {
      var j
      j = this.joints["rjoint_flipflop_back"]
      this.world.DestroyJoint(j);

      this.joints["rjoint_flipflop_back"] = null

      this.recorder.removedBackSlipper = true
    }

    if (value == this.sheepPickupPoint) {
      this.renderer.setState({
        sheep: true
      })
      this.audioPlayer.playSheep()
      this.callbacks.onSheepPickup()
    }

    if (this.visibleLifes.indexOf(value) != -1) {
      let idx = this.visibleLifes.indexOf(value)
      this.visibleLifes.splice(idx, 1)

      this.lifes += 1
      this.callbacks.onLifesUpdate(this.lifes, 1)

      this.renderer.setState({
        visibleLifes: this.visibleLifes
      })

      this.audioPlayer.playHealth()
    }

    if (this.checkpoints.indexOf(value) != -1) {
      this.lastCheckpoint = value
      // this.gameHistory.push(this.recorder)
      this.recorder = new Recorder(this.world, {
        removedFrontSlipper: this.recorder.removedFrontSlipper || this.recorder.initialState.removedFrontSlipper,
        removedBackSlipper: this.recorder.removedBackSlipper || this.recorder.initialState.removedBackSlipper,
        progressPoints: this.progressPoints.slice(),
        progress: this.progress
      })
    }
  }

  update() {

    if (this.inactive) return;

    let thighAngle;

    let j,
      k,
      a,
      foot;

    let backBall = this.bodies['back_weight']
    let frontBall = this.bodies['front_weight']
    let bend = this.bodies['body'].GetAngle();

    if ((bend < -0.3 && this.bodyAngle > -0.3) || (bend > 0.3 && this.bodyAngle < 0.3)) {
      if (Math.random() < 0.5) {
        this.renderer.playScare(0)
        this.audioPlayer.playTilt(0, this.progress > this.sheepPickupPoint.x)
      }
    } else if ((bend < -0.9 && this.bodyAngle > -0.9) || ((bend > 0.9 && this.bodyAngle < 0.9))) {
      this.renderer.playScare(1)
      this.audioPlayer.playTilt(1, this.progress > this.sheepPickupPoint.x)
    } else if ((bend > -0.3 && this.bodyAngle < -0.3) || (bend < 0.3 && this.bodyAngle > 0.3)) {
      this.renderer.removeScare()
    }
    this.bodyAngle = bend

    if (bend > 0) {
      // Leaning back
      backBall.GetFixtureList().SetDensity(1)
      frontBall.GetFixtureList().SetDensity(10)
    } else {
      // Leaning fwd
      backBall.GetFixtureList().SetDensity(10)
      frontBall.GetFixtureList().SetDensity(1)
    }

    backBall.ResetMassData()
    frontBall.ResetMassData()

    thighAngle = this.bodies['leg_front_tie'].GetAngle()

    // right
    j = this.joints["tendon_rf"];
    k = this.joints["knee_r"];
    a = this.joints["ankle_r"];
    foot = this.bodies["leg_shoe_front"]
    if (this.keymap[39]) {

      let bend = this.bodies['body'].GetAngle();
      if (bend < -0.3)
        bend = -1;
      if (bend > 0.3)
        bend = 1;


      if (k.data.bend != bend) {

        if (bend == -1) {
          // Leaning fwd
          if (thighAngle > 0) {
            // Thigh pointing fwd -> Leg in the air -> Needs landing pos
            this.joints[j.name] = j.SetLength(0.1);
            this.joints[k.name] = k.SetLength(0.8);
          } else {
            // Thigh pointing back
            this.joints[j.name] = j.SetLength(0.1);
            this.joints[k.name] = k.SetLength(0.1);
          }
        } else if (bend == 1) {
          // Leaning back
          if (thighAngle > 0) {
            // Thigh pointing fwd -> Leg in the air -> Needs balancing
            var fixture = foot.GetFixtureList()
            fixture.SetDensity(30)
            foot.ResetMassData()

            this.joints[k.name] = k.SetLength(0.65);
          } else {
            // Thigh pointing back -> ?
          }
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

        var fixture = foot.GetFixtureList()
        fixture.SetDensity(12)
        foot.ResetMassData()
      }
    }

    // left

    thighAngle = this.bodies['leg_back_tie'].GetAngle()

    j = this.joints["tendon_lf"];
    k = this.joints["knee_l"];
    a = this.joints["ankle_l"];
    foot = this.bodies["leg_shoe_back"]
    if (this.keymap[37]) {

      let bend = this.bodies['body'].GetAngle();
      if (bend < -0.35)
        bend = -1;
      if (bend > 0.4)
        bend = 1;


      if (k.data.bend != bend) {

        if (bend == -1) {
          // Leaning fwd
          if (thighAngle > 0) {
            // Thigh pointing fwd -> Leg in the air -> Needs landing pos
            this.joints[j.name] = j.SetLength(0.1);
            this.joints[k.name] = k.SetLength(0.8);
          } else {
            // Thigh pointing back
            this.joints[j.name] = j.SetLength(0.1);
            this.joints[k.name] = k.SetLength(0.1);
          }
        } else if (bend == 1) {
          // Leaning back
          if (thighAngle > 0) {
            // Thigh pointing fwd -> Leg in the air -> Needs balancing
            var fixture = foot.GetFixtureList()
            fixture.SetDensity(30)
            foot.ResetMassData()

            this.joints[k.name] = k.SetLength(0.65);
          } else {
            // Thigh pointing back -> ?
          }
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

        var fixture = foot.GetFixtureList()
        fixture.SetDensity(12)
        foot.ResetMassData()
      }
    }
  }

  dispose() {

    $.each(this.joints, (key, joint) => {
      if (joint == null) {
        return
      }
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

    TweenMax.killTweensOf(this.recorder)
  }

  stepBack() {

    let percent = Math.min(1, this.recorder.currentFrame / 100)
    let moment = this.recorder.frames[Math.floor(this.recorder.currentFrame)]
    var x
    var y
    var angle;

    for (var bodyName in moment) {

      if (this.recorder.initialState.removedFrontSlipper && bodyName == "flipflop_front") {
        continue
      }

      if (this.recorder.initialState.removedBackSlipper && bodyName == "flipflop_back") {
        continue
      }

      if (this.startState[bodyName]) {
        x = moment[bodyName].x * percent + (this.lastCheckpoint.x + this.startState[bodyName].x) * (1 - percent)
        y = moment[bodyName].y * percent + (this.lastCheckpoint.y + this.startState[bodyName].y) * (1 - percent)
        angle = moment[bodyName].angle * percent + this.startState[bodyName].angle * (1 - percent)
      } else {
        x = moment[bodyName].x
        y = moment[bodyName].y
        angle = moment[bodyName].angle
      }
      this.bodies[bodyName].SetTransform(new Box2D.b2Vec2(x, y), angle)
    }
  }

  onResetComplete() {

    this.keymap = {};

    this.record = true
    this.inactive = false
    this.pausePhysics = false

    if (this.recorder.removedFrontSlipper) {
      var joint

      joint = Rube2Box2D.loadJointFromRUBE(this.frontSlipperJointDef, this.world, this.loadedBodies);
      this.joints[joint.name] = joint;
    }

    if (this.recorder.removedBackSlipper) {
      var joint

      joint = Rube2Box2D.loadJointFromRUBE(this.backSlipperJointDef, this.world, this.loadedBodies);
      this.joints[joint.name] = joint;
    }

    for (var index in this.recorder.touchedDecor) {
      let bodyName = this.recorder.touchedDecor[index]
      let fixture = this.bodies[bodyName].GetFixtureList()

      do {
        let filterData = fixture.GetFilterData()
        filterData.set_maskBits(65535)
        fixture.SetFilterData(filterData)
        fixture = fixture.GetNext()
      } while (fixture.e != 0)
    }

    this.chain.reset()

    this.progressPoints = this.recorder.initialState.progressPoints
    this.progress = this.recorder.initialState.progress

    // this.gameHistory.push(this.recorder)
    this.recorder = new Recorder(this.world, {
      removedFrontSlipper: this.recorder.initialState.removedFrontSlipper,
      removedBackSlipper: this.recorder.initialState.removedBackSlipper,
      progressPoints: this.progressPoints.slice(),
      progress: this.progress
    })

    for (var bodyName in this.startState) {
      this.bodies[bodyName].SetType(Box2D.b2_dynamicBody)
    }
  }

  prepareForReset() {
    if (this.recorder.currentFrame == 0) {
      this.record = true
      this.inactive = false
      this.pausePhysics = false
      return
    }

    this.record = false
    this.inactive = true
    this.pausePhysics = true

    for (var bodyName in this.bodies) {
      let type = this.bodies[bodyName].GetType()
      this.bodies[bodyName].SetLinearVelocity(new Box2D.b2Vec2(0, 0))
      this.bodies[bodyName].SetAngularVelocity(0)
      this.bodies[bodyName].SetType(type)
    }

    for (var bodyName in this.startState) {
      this.bodies[bodyName].SetType(Box2D.b2_kineticBody)
    }
  }

  resetPlayer() {

    if (this.renderer) {
      this.renderer.playRewind()
    }

    if (this.audioPlayer) {
      this.audioPlayer.playRewind()
    }

    this.prepareForReset()

    this.rewindTween = TweenMax.to(this.recorder, 1, {
      ease: Cubic.easeInOut,
      currentFrame: 0,
      onUpdate: this.stepBack,
      onComplete: this.onResetComplete
    })
  }

  // Debug use:
  resetPlayerToCheckpoint() {
    var x
    var y
    var angle;

    for (var bodyName in this.startState) {
      x = this.startState[bodyName].x + this.lastCheckpoint.x
      y = this.startState[bodyName].y + this.lastCheckpoint.y
      angle = this.startState[bodyName].angle
      this.bodies[bodyName].SetTransform(new Box2D.b2Vec2(x, y), angle)
    }
  }

  softReset() {
    let resetPoint = this.sheepPickupPoint.x < this.progress ? this.sheepPickupPoint : this.startPoint
    this.prepareForReset()
    this.lastCheckpoint = resetPoint
    this.resetPlayerToCheckpoint()
    this.onResetComplete()
  }

  cheatReset() {
    let resetPoint = {
      x: 150,
      y: -20
    }
    this.prepareForReset()
    this.lastCheckpoint = resetPoint
    this.resetPlayerToCheckpoint()
    this.onResetComplete()
  }

  pause() {
    this.paused = true
  }

  resume() {
    this.paused = false
  }
}
;
