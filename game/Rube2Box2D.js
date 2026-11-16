export default class Rube2Box2D {

    constructor() {
  
    }

    getVectorValue(val) {
        if ( val instanceof Object )
            return val;
        else
            return { x:0, y:0 };
    }

    static parseVec(obj) {
        if (obj instanceof Object)
          return new Box2D.b2Vec2(obj.x || 0, obj.y || 0);
        else
          return new Box2D.b2Vec2(0,0);
    }

    static loadBodyFromRUBE(bodyJso, world) {
        if ( ! bodyJso.hasOwnProperty('type') ) {
            console.log("Body does not have a 'type' property");
            return null;
        }    

        var bd = new Box2D.b2BodyDef();
        if ( bodyJso.type == 2 )
            bd.set_type(Box2D.b2_dynamicBody);
        else if ( bodyJso.type == 1 )
            bd.set_type(Box2D.b2_kinematicBody);
        else
            bd.set_type(Box2D.b2_staticBody);

        bd.set_angle(bodyJso.angle || 0);
        bd.set_angularVelocity(bodyJso.angularVelocity || 0);
        bd.set_angularDamping(bodyJso.angularDamping || 0);
        bd.set_awake(bodyJso.awake || false);
        bd.set_bullet(bodyJso.bullet || false);
        bd.set_fixedRotation(bodyJso.fixedRotation || false);
        bd.set_linearDamping(bodyJso.linearDamping || false);

        if ( bodyJso.hasOwnProperty('linearVelocity') && bodyJso.linearVelocity instanceof Object )
            bd.set_linearVelocity(Rube2Box2D.parseVec( bodyJso.linearVelocity ));
        else
            bd.set_linearVelocity(new Box2D.b2Vec2(0,0));

        if ( bodyJso.hasOwnProperty('position') && bodyJso.position instanceof Object )
            bd.set_position(Rube2Box2D.parseVec(bodyJso.position ));
        else
            bd.set_position(new Box2D.b2Vec2(0,0));

        if (bodyJso.hasOwnProperty('gravityScale') && !isNaN(parseFloat(bodyJso.gravityScale)) && isFinite(bodyJso.gravityScale)) {
            bd.set_gravityScale(bodyJso.gravityScale);
        } else {
            bd.set_gravityScale(1);
        }

        var body = world.CreateBody(bd);


        var md = new Box2D.b2MassData();
        md.set_mass(bodyJso['massData-mass'] || 0);
        if ( bodyJso.hasOwnProperty('massData-center') && bodyJso['massData-center'] instanceof Object )
            md.set_center(Rube2Box2D.parseVec(bodyJso['massData-center']));
        else
            md.set_center(new Box2D.b2Vec2(0,0));

        md.set_I(bodyJso['massData-I'] || 0);

        body.SetMassData(md);
        
        
        if ( bodyJso.hasOwnProperty('fixture') ) {
            for (var k = 0; k < bodyJso['fixture'].length; k++) {
                var fixtureJso = bodyJso['fixture'][k];
                this.loadFixtureFromRUBE(body, fixtureJso);
            }
        }
        if ( bodyJso.hasOwnProperty('name') )
            body.name = bodyJso.name;
        if ( bodyJso.hasOwnProperty('customProperties') )
            body.customProperties = bodyJso.customProperties;
        return body;
    }

    static loadFixtureFromRUBE(body, fixtureJso) {    
        var fd = new Box2D.b2FixtureDef();
        fd.set_density(fixtureJso.density || 0);
        fd.set_friction(fixtureJso.friction || 0);
        fd.set_restitution(fixtureJso.restitution || 0);
        fd.set_isSensor(fixtureJso.sensor || 0);
        
        var filter = new Box2D.b2Filter();

        filter.set_categoryBits(fixtureJso['filter-categoryBits'] || 1);
        filter.set_maskBits(fixtureJso['filter-maskBits'] || 65535);
        filter.set_groupIndex(fixtureJso['filter-groupIndex'] || 0);

        fd.set_filter(filter);

        if (fixtureJso.hasOwnProperty('circle')) {
            
            var shape = new Box2D.b2CircleShape();

            shape.set_m_radius(fixtureJso.circle.radius || 0);
            if ( fixtureJso.circle.center )
                shape.set_m_p(Rube2Box2D.parseVec(fixtureJso.circle.center)); 
            else 
                shape.set_m_p(new Box2D.b2Vec2(0, 0));

            fd.set_shape(shape);
          
            var fixture = body.CreateFixture(fd);        
            if ( fixtureJso.name )
                fixture.name = fixtureJso.name;
        }
        else if (fixtureJso.hasOwnProperty('polygon')) {
           
            var verts = [];
            for (var v = 0; v < fixtureJso.polygon.vertices.x.length; v++) {
               verts.push( new Box2D.b2Vec2( fixtureJso.polygon.vertices.x[v], fixtureJso.polygon.vertices.y[v] ) );
           }

             
            var shape = Rube2Box2D.createPolygonShape(verts);

            fd.set_shape(shape);
            

            var fixture = body.CreateFixture(fd);   
                 
            if ( fixture && fixtureJso.name )
                fixture.name = fixtureJso.name;
        }else if (fixtureJso.hasOwnProperty('chain')) {
            
            var verts = [];
            for (var v = 0; v < fixtureJso.chain.vertices.x.length; v++) 
                verts.push(new Box2D.b2Vec2(fixtureJso.chain.vertices.x[v], fixtureJso.chain.vertices.y[v]));


            shape = this.createChainShape(verts);
            fd.set_shape(shape);
           
            var fixture = body.CreateFixture(fd);        
            if ( fixtureJso.name )
               fixture.name = fixtureJso.name;

        }else {
            console.log("Could not find shape type for fixture");
        }
    }

    static loadJointFromRUBE(jointJso, world, loadedBodies){
        if ( ! jointJso.hasOwnProperty('type') ) {
            console.log("Joint does not have a 'type' property");
            return null;
        }    
        if ( jointJso.bodyA >= loadedBodies.length ) {
            console.log("Index for bodyA is invalid: " + jointJso.bodyA );
            return null;
        }    
        if ( jointJso.bodyB >= loadedBodies.length ) {
            console.log("Index for bodyB is invalid: " + jointJso.bodyB );
            return null;
        }
        
        var joint = null;

        // if(!isNaN(parseInt(jointJso.type))){
        //     console.log("TYPE NR", jointJso)
        //     switch(jointJso.type){
        //         case 0 :
        //             jointJso.type = "ELOO"
        //         break;
        //     }
        // }
        
        if ( jointJso.type == "revolute" ) {
            var jd = new Box2D.b2RevoluteJointDef();
            jd.set_bodyA(loadedBodies[jointJso.bodyA]);
            jd.set_bodyB(loadedBodies[jointJso.bodyB]);
            jd.set_collideConnected(jointJso.collideConnected || false);
            jd.set_localAnchorA(Rube2Box2D.parseVec(jointJso.anchorA));
            jd.set_localAnchorB(Rube2Box2D.parseVec(jointJso.anchorB));
            jd.set_enableLimit(jointJso.enableLimit || false);
            jd.set_enableMotor(jointJso.enableMotor || false);
            jd.set_lowerAngle(jointJso.lowerLimit || 0);
            jd.set_maxMotorTorque(jointJso.maxMotorTorque || 0);
            jd.set_motorSpeed(jointJso.motorSpeed || 0);
            jd.set_referenceAngle(jointJso.refAngle || 0);
            jd.set_upperAngle(jointJso.upperLimit || 0);

            joint = world.CreateJoint(jd);
        }
        else if ( jointJso.type == "distance") {
            var jd = new Box2D.b2DistanceJointDef();
            jd.set_bodyA(loadedBodies[jointJso.bodyA]);
            jd.set_bodyB(loadedBodies[jointJso.bodyB]);
            jd.set_collideConnected(jointJso.collideConnected || false);
            jd.set_localAnchorA(Rube2Box2D.parseVec(jointJso.anchorA));
            jd.set_localAnchorB(Rube2Box2D.parseVec(jointJso.anchorB));
            jd.set_dampingRatio(jointJso.dampingRatio || 0);
            jd.set_frequencyHz(jointJso.frequency || 0);
            jd.set_length(jointJso.length || 0);
            jd.set_userData({ length: jointJso.length || 0, definition: jd });

            //console.log("SETT", jd, jointJso.length, Box2D)

            
            joint = world.CreateJoint(jd);

            joint.definition = jd;
            joint.data = { length: jointJso.length || 0, bend: null};
            joint.SetLength = function(len){

                this.definition.set_length(len);
                
                let j = world.CreateJoint(jd);
                j.name = this.name;
                j.SetLength = this.SetLength;
                j.definition = this.definition;
                j.data = this.data;

                world.DestroyJoint(this);

                return j;
            }

            joint.SetUserData("ABCD")
        } 
        else if ( jointJso.type == "rope") {
            var jd = new Box2D.b2RopeJointDef();

            jd.set_bodyA(loadedBodies[jointJso.bodyA]);
            jd.set_bodyB(loadedBodies[jointJso.bodyB]);
            jd.set_collideConnected(jointJso.collideConnected || false);
            jd.set_localAnchorA(Rube2Box2D.parseVec(jointJso.anchorA));
            jd.set_localAnchorB(Rube2Box2D.parseVec(jointJso.anchorB));
            jd.set_maxLength(jointJso.maxLength || 0);
            joint = world.CreateJoint(jd);
        }
        else if ( jointJso.type == "motor") {
            if (Box2D.b2MotorJointDef){
                var jd = new Box2D.b2MotorJointDef();

                jd.set_bodyA(loadedBodies[jointJso.bodyA]);
                jd.set_bodyB(loadedBodies[jointJso.bodyB]);
                jd.set_collideConnected(jointJso.collideConnected || false);

                jd.set_linearOffset(Rube2Box2D.parseVec(jointJso.anchorA));
                jd.set_angularOffset(jointJso.refAngle || 0);
                jd.set_maxForce(jointJso.maxForce || 0);
                jd.set_maxTorque(jointJso.maxTorque || 0);
                jd.set_correctionFactor(jointJso.correctionFactor || 0);    

                joint = world.CreateJoint(jd);
            } else {
                console.log("This version of box2d doesn't support motor joints");
            }
        }
        else if ( jointJso.type == "prismatic" ) {
            var jd = new Box2D.b2PrismaticJointDef();
            jd.set_bodyA(loadedBodies[jointJso.bodyA]);
            jd.set_bodyB(loadedBodies[jointJso.bodyB]);
            jd.set_collideConnected(jointJso.collideConnected || false);
            jd.set_localAnchorA(Rube2Box2D.parseVec(jointJso.anchorA));
            jd.set_localAnchorB(Rube2Box2D.parseVec(jointJso.anchorB));
            jd.set_enableLimit(jointJso.enableLimit || false);
            jd.set_enableMotor(jointJso.enableMotor || false);
            jd.set_localAxisA(Rube2Box2D.parseVec(jointJso.localAxisA));
            jd.set_lowerTranslation(jointJso.lowerLimit || 0);
            jd.set_maxMotorForce(jointJso.maxMotorForce || 0);
            jd.set_motorSpeed(jointJso.motorSpeed || 0);
            jd.set_referenceAngle(jointJso.refAngle || 0);
            jd.set_upperTranslation(jointJso.upperLimit || 0);        
            joint = world.CreateJoint(jd);
        }
        else if ( jointJso.type == "wheel" ) {

            var jd = new Box2D.b2WheelJointDef();
            jd.set_bodyA(loadedBodies[jointJso.bodyA]);
            jd.set_bodyB(loadedBodies[jointJso.bodyB]);
            jd.set_collideConnected(jointJso.collideConnected || false);
            jd.set_localAnchorA(Rube2Box2D.parseVec(jointJso.anchorA));
            jd.set_localAnchorB(Rube2Box2D.parseVec(jointJso.anchorB));
            jd.set_enableMotor(jointJso.enableMotor || false);
            jd.set_localAxisA(Rube2Box2D.parseVec(jointJso.localAxisA));
            jd.set_maxMotorTorque(jointJso.maxMotorTorque || 0);
            jd.set_motorSpeed(jointJso.motorSpeed || 0);
            jd.set_dampingRatio(jointJso.springDampingRatio || 0);
            jd.set_frequencyHz(jointJso.springFrequency || 0);
            joint = world.CreateJoint(jd);

        }
        else if ( jointJso.type == "friction" ) {
            var jd = new Box2D.b2FrictionJointDef();
            
            jd.set_bodyA(loadedBodies[jointJso.bodyA]);
            jd.set_bodyB(loadedBodies[jointJso.bodyB]);
            jd.set_collideConnected(jointJso.collideConnected || false);
            jd.set_localAnchorA(Rube2Box2D.parseVec(jointJso.anchorA));
            jd.set_localAnchorB(Rube2Box2D.parseVec(jointJso.anchorB));
            jd.set_maxForce(jointJso.maxForce || 0);
            jd.set_maxTorque(jointJso.maxTorque || 0);
            joint = world.CreateJoint(jd);
        }
        else if ( jointJso.type == "weld" ) {
            var jd = new Box2D.b2WeldJointDef();
            
            jd.set_bodyA(loadedBodies[jointJso.bodyA]);
            jd.set_bodyB(loadedBodies[jointJso.bodyB]);
            jd.set_collideConnected(jointJso.collideConnected || false);
            jd.set_localAnchorA(Rube2Box2D.parseVec(jointJso.anchorA));
            jd.set_localAnchorB(Rube2Box2D.parseVec(jointJso.anchorB));
            jd.set_referenceAngle(jointJso.refAngle || 0);
            jd.set_dampingRatio(jointJso.dampingRatio || 0);
            jd.set_frequencyHz(jointJso.frequency || 0);
            joint = world.CreateJoint(jd);
        }
        else {
            console.log("Unsupported joint type: " + jointJso.type);
            console.log(jointJso);
        }
        if ( joint && jointJso.name )
            joint.name = jointJso.name;
        return joint;
    }


    static createPolygonShape(vertices) {
        var shape = new Box2D.b2PolygonShape();            
        var buffer = Box2D.allocate(vertices.length * 8, 'float', Box2D.ALLOC_STACK);
        var offset = 0;
        for (var i=0;i<vertices.length;i++) {
            Box2D.setValue(buffer+(offset), vertices[i].get_x(), 'float'); // x
            Box2D.setValue(buffer+(offset+4), vertices[i].get_y(), 'float'); // y
            offset += 8;
        }            
        var ptr_wrapped = Box2D.wrapPointer(buffer, Box2D.b2Vec2);
        shape.Set(ptr_wrapped, vertices.length);
        return shape;
    }

};
