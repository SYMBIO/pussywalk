export default class Chain {

  // Based on http://www.emanueleferonato.com/2009/10/05/basic-box2d-rope/

  constructor(world, base) {
    this.world = world;
    this.links = 10;
    this.bodies = {};

    var shapeDef;
    var fixtureDef;
    var bodyDef;
    var body;
    var link;

    var joint = new Box2D.b2RevoluteJointDef();

    var pos = {
      x: base.GetPosition().get_x(),
      y: base.GetPosition().get_y()
    }

    var distanceDivider = 3

    link = base
    // rope
    for (var i:int = 0; i <= 30; i++) {
      // rope segment
      body = this.createLink()
      body.SetTransform(new Box2D.b2Vec2(pos.x, pos.y - i / distanceDivider), 0)
      body.name = "decor_chain_" + i
      // joint
      joint.Initialize(link, body, new Box2D.b2Vec2(pos.x, pos.y - i / distanceDivider + 0.1));
      this.world.CreateJoint(joint);
      // saving the reference of the last placed link
      link = body;
      this.bodies[body.name] = body
    }
    // final body
    body = this.createLink()
    body.SetTransform(new Box2D.b2Vec2(pos.x, pos.y - i / distanceDivider), 0)
    body.name = "decor_chain_" + i
    this.bodies[body.name] = body

    joint.Initialize(link, body, new Box2D.b2Vec2(pos.x, pos.y - i / distanceDivider + 0.1));
    this.world.CreateJoint(joint);
  // body.SetMassFromShapes();
  }

  createLink() {
    var bd = new Box2D.b2BodyDef();
    bd.set_type(Box2D.b2_dynamicBody);
    bd.set_angle(0);
    bd.set_angularVelocity(0);
    bd.set_angularDamping(0);
    bd.set_awake(false);
    bd.set_bullet(false);
    bd.set_fixedRotation(false);
    bd.set_linearDamping(false);
    bd.set_linearVelocity(new Box2D.b2Vec2(0, 0));
    bd.set_position(new Box2D.b2Vec2(0, 0));
    bd.set_gravityScale(1);

    var body = this.world.CreateBody(bd);

    var md = new Box2D.b2MassData();
    md.set_mass(0);
    md.set_center(new Box2D.b2Vec2(0, 0));
    md.set_I(0);

    body.SetMassData(md);

    var fd = new Box2D.b2FixtureDef();
    fd.set_density(10);
    fd.set_friction(0.3);
    fd.set_restitution(0);
    fd.set_isSensor(0);

    var filter = new Box2D.b2Filter();

    filter.set_categoryBits(1);
    filter.set_maskBits(65535);
    filter.set_groupIndex(0);

    fd.set_filter(filter);

    var shape = new Box2D.b2CircleShape();

    shape.set_m_radius(0.1);
    shape.set_m_p(new Box2D.b2Vec2(0, 0));

    fd.set_shape(shape);

    var fixture = body.CreateFixture(fd);

    return body;
  }
}
