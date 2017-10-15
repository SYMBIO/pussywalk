import $ from 'jquery';
import Rube2Box2D from './Rube2Box2D';
import Box2Debug from './Box2Debug';
import Constants from './Constants'

// class ContactListener extends Box2D.b2ContactListener {
// }

export default class Box2DWorld {

  constructor(canvas, json) {

    this.canvas = canvas;
    this.timeStep = 1 / 60;
    this.velocityIterations = 10;
    this.positionIterations = 8;
    this.camera = {
      x: 0,
      y: 0,
      ptm: 34,
      canvasCenter: this.canvas.width / 2 + 10,
      lineWidth: 1 / 34
    };


    var gravity = new Box2D.b2Vec2(0.0, -10.0);
    this.world = new Box2D.b2World(gravity);

    var gravity = new Box2D.b2Vec2(0.0, -10.0);
    this.world = new Box2D.b2World(gravity);


    this.debug();

    this.bodies = {};
    this.joints = {};
    this.textures = {};
    this.sortedTextures = [];

    let textureConfigNames = Constants.textureConfig.map(function(texture) {
      return texture.name
    })

    let bodiesJson = json.body;
    let body,
      loadedBodies = [];

    bodiesJson.forEach((b) => {
      body = Rube2Box2D.loadBodyFromRUBE(b, this.world);
      this.bodies[body.name] = body;
      let index = textureConfigNames.indexOf(body.name)
      if (index != -1) {
        let image = new Image()
        image.src = "images/figure/" + body.name + ".png"
        // image.src = "images/figure/square.png"
        this.textures[body.name] = {
          image: image,
          name: body.name,
          zIndex: Constants.textureConfig[index].zIndex,
          offset: {
            x: 0,
            y: 0
          },
          position: {
            x: 0,
            y: 0
          },
          rotation: 0
        }
      }
      loadedBodies.push(body);
    });

    // Sort textures by zIndex for faster rendering
    for (var key in this.textures) {
      this.sortedTextures.push(this.textures[key])
    }

    this.sortedTextures = this.sortedTextures.sort(function(t1, t2) {
      return t1.zIndex - t2.zIndex;
    });

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

    $('.game__key').on('touchstart', (e) => {
      e.preventDefault();
      this.handleArrows($(e.target).hasClass('game__key--right') ? 39 : 37, true);
    });

    $('.game__key').on('touchend touchcancel', (e) => {
      e.preventDefault();
      this.handleArrows($(e.target).hasClass('game__key--right') ? 39 : 37, false);
    });


    let that = this;
    var _end = ["hand_front_top", "hand_back_top", "leg_front_tie", "leg_back_tie", "body", "head"];
    let contactListener = new Box2D.JSContactListener();
    contactListener.EndContact = function() {};
    contactListener.PreSolve = function() {};
    contactListener.PostSolve = function() {};
    contactListener.BeginContact = function(contactPtr) {

      if (that.finish) return;

      let contact = Box2D.wrapPointer(contactPtr, Box2D.b2Contact),
        bA = contact.GetFixtureA().GetBody(),
        bB = contact.GetFixtureB().GetBody();

      if ((bA.name === 'ground' && _end.indexOf(bB.name) >= 0) || (bB.name === 'ground' && _end.indexOf(bA.name) >= 0)) {
        that.finish = true;
        setTimeout(() => {
          that.death();
        }, 10);
      }
    }
    this.world.SetContactListener(contactListener);


    this.fps = {
      dt: 0,
      time: 0
    };

  }

  addEndListener(callback) {
    this.EndListener = callback;
  }

  death() {

    let joints = ['tendon_rf', 'knee_r', 'ankle_r', 'tendon_lf', 'knee_l', 'ankle_l', 'joint26', 'joint8']
    joints.forEach((j) => {
      this.world.DestroyJoint(this.joints[j]);
      delete this.joints[j];
    });

    let that = this;
    setTimeout(() => {
      that.EndListener();
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

    // Store position and rotation for rendering cycle

    let PTM = 32;

    for (var body = this.world.GetBodyList(); body.e != 0; body = body.GetNext()) {
      if (this.textures[body.name]) {

        let offset = {
          x: -this.textures[body.name].image.naturalWidth / 2,
          y: -this.textures[body.name].image.naturalHeight / 2
        }

        if (Constants.offsets[body.name]) {
          offset.x += Constants.offsets[body.name].x
          offset.y += Constants.offsets[body.name].y
        }

        this.textures[body.name].offset = offset
        this.textures[body.name].position = {
          x: body.GetPosition().get_x() * PTM,
          y: -body.GetPosition().get_y() * PTM
        }
        this.textures[body.name].rotation = -body.GetAngle()
      }
    }

    // Graphics

    let context = this.canvas.getContext('2d')

    var canvasOffset = {
      x: -this.bodies['body'].GetPosition().get_x() * PTM + this.camera.canvasCenter,
      y: 0
    };

    context.setTransform(1, 0, 0, 1, 0, 0);
    context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    context.translate(canvasOffset.x, canvasOffset.y);

    for (var key in this.sortedTextures) {

      let texture = this.sortedTextures[key]
      context.translate(texture.position.x, texture.position.y);
      context.rotate(texture.rotation)
      context.drawImage(texture.image,
        0,
        0,
        texture.image.naturalWidth,
        texture.image.naturalHeight,
        texture.offset.x,
        texture.offset.y,
        texture.image.naturalWidth,
        texture.image.naturalHeight
      )

      context.rotate(-texture.rotation)
      context.translate(-texture.position.x, -texture.position.y);
    }

    // Debug draw

    // context.setTransform(1, 0, 0, 1, 0, 0);
    // context.translate(canvasOffset.x, canvasOffset.y);
    // context.scale(PTM, PTM);
    // context.lineWidth = 1 / PTM;
    //
    // context.scale(1, -1);
    // this.world.DrawDebugData();

  // context.restore();
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
    $('.game__key').off('touchstart touchend touchcancel');
  }
}
;
