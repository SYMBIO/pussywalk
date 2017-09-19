import $ from 'jquery';
import Rube2Box2D from './Rube2Box2D';
import Box2Debug from './Box2Debug';


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
            lineWidth: 1/34 
        };


        var gravity = new Box2D.b2Vec2(0.0, -10.0);
        this.world = new Box2D.b2World(gravity);

        var gravity = new Box2D.b2Vec2(0.0, -10.0);
        this.world = new Box2D.b2World(gravity);

        
        this.debug();
        
        this.bodies = {};
        this.joints = {};

        let bodiesJson = json.body;
        let body, loadedBodies = [];
        bodiesJson.forEach((b)=>{
            body = Rube2Box2D.loadBodyFromRUBE(b, this.world);
            this.bodies[body.name] = body;
            loadedBodies.push(body);
        });

        let jointsJson = json.joint;
        let joint;
        jointsJson.forEach((j)=>{
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
        var _end = [ "hand_front_top",  "hand_back_top", "leg_front_tie", "leg_back_tie", "body", "head"];
        let contactListener = new Box2D.JSContactListener();
        contactListener.EndContact = function() {};
        contactListener.PreSolve = function() {};
        contactListener.PostSolve = function() {};
        contactListener.BeginContact = function (contactPtr) {

            if(that.finish) return;

            let contact = Box2D.wrapPointer( contactPtr, Box2D.b2Contact ),
                bA = contact.GetFixtureA().GetBody(),
                bB = contact.GetFixtureB().GetBody();

            if((bA.name === 'ground' && _end.indexOf(bB.name) >= 0) || (bB.name === 'ground' && _end.indexOf(bA.name) >= 0)){
                that.finish = true;
                setTimeout(() => { that.death(); }, 10);
            }
        }
        this.world.SetContactListener(contactListener);


        this.fps = {
            dt: 0,
            time: 0
        };

    }

    addEndListener(callback){
        this.EndListener = callback;
    }

    death(){

        let joints = [ 'tendon_rf', 'knee_r', 'ankle_r', 'tendon_lf', 'knee_l', 'ankle_l', 'joint26', 'joint8']
        joints.forEach((j)=>{
            this.world.DestroyJoint(this.joints[j]);
            delete this.joints[j];
        });

        let that = this;
        setTimeout(() => {
            that.EndListener();
        }, 1000);
    }

    handleArrows(keyCode, state){
        this.keymap[keyCode] = state;

        if(keyCode === 39){
            $('.game__controls').toggleClass('game--arrow--right', state);
        }else{
            $('.game__controls').toggleClass('game--arrow--left', state);
        }
    }

    debug(){
        let deb = Box2Debug.getCanvasDebugDraw(this.canvas);

        var e_shapeBit = 0x0001;
        var e_jointBit = 0x0002;
        deb.SetFlags(e_shapeBit | e_jointBit);

        this.world.SetDebugDraw(deb);
    }

   
    step(){

        let now = new Date().getTime();
        this.fps.dt = (now - this.fps.time) / 1000;

        this.fps.time = now;

        if(this.fps.dt > this.timeStep) this.fps.dt = this.timeStep;

        this.update();

        this.world.Step(this.fps.dt, this.velocityIterations, this.positionIterations);
        //this.world.Step(this.timeStep, this.velocityIterations, this.positionIterations);
        //this.world.Step(0.01, this.velocityIterations, this.positionIterations);
        this.world.ClearForces();
 
        this.drawDebug();
    }


    update(){

        if(this.finish) return;

        let bend = this.bodies['body'].GetAngle();
        if(bend < -0.3) bend = -1;
        if(bend > 0.3) bend = 1;

        
        let j, k, a;

        // right
        j = this.joints["tendon_rf"];
        k = this.joints["knee_r"];
        a = this.joints["ankle_r"];
        if(this.keymap[39]){
            
            //let bend = 2;

            if(k.data.bend != bend){
                

                if(bend == -1){
                    this.joints[j.name] = j.SetLength(0.1);
                    this.joints[k.name] = k.SetLength(0.8);
                }else if(bend == 1){
                    this.joints[k.name] = k.SetLength(0.65);
                }else{
                    this.joints[j.name] = j.SetLength(0.1);
                    this.joints[k.name] = k.SetLength(0.1);
                }

                k.data.bend = bend;
            }
        }else{
            if(k.data.bend !== null){
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
        if(this.keymap[37]){
            let bend = 2;

            if(k.data.bend != bend){
                

                if(bend == -1){
                    this.joints[j.name] = j.SetLength(0.1);
                    this.joints[k.name] = k.SetLength(0.8);
                }else if(bend == 1){
                    this.joints[k.name] = k.SetLength(0.65);
                }else{
                    this.joints[j.name] = j.SetLength(0.1);
                    this.joints[k.name] = k.SetLength(0.1);
                }

                k.data.bend = bend;
            }
        }else{
            if(k.data.bend !== null){
                k.data.bend = null;
                this.joints[j.name] = j.SetLength(j.data.length);
                this.joints[k.name] = k.SetLength(k.data.length);
                this.joints[a.name] = a.SetLength(a.data.length);
            }
        }
    }

    drawDebug(){
        let context = this.canvas.getContext('2d');

        var PTM = 32;

        var canvasOffset = {
            x: - this.bodies['body'].GetPosition().get_x() * PTM + this.camera.canvasCenter,
            y: 0
        };


        context.clearRect( 0, 0, this.canvas.width, this.canvas.height );
        context.save();            
            context.translate(canvasOffset.x, canvasOffset.y);
            context.scale(1, -1);                
            context.scale(PTM, PTM);
            //context.lineWidth /= PTM;
            context.lineWidth = this.camera.lineWidth;

            this.world.DrawDebugData();
        context.restore();
    }

    dispose(){

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



};
