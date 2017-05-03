// make these (0,0) for 1 suspension point
var carriageAnchorLeft = new Box2D.Common.Math.b2Vec2(-cm(5), -cm(5));
var carriageAnchorRight = new Box2D.Common.Math.b2Vec2(cm(5), -cm(5));

var distance_joint1;
var distance_joint2;
var nozzle;
 
 var b2Vec2 = Box2D.Common.Math.b2Vec2
    , b2AABB = Box2D.Collision.b2AABB
    , b2BodyDef = Box2D.Dynamics.b2BodyDef
    , b2Body = Box2D.Dynamics.b2Body
    , b2FixtureDef = Box2D.Dynamics.b2FixtureDef
    , b2Fixture = Box2D.Dynamics.b2Fixture
    , b2World = Box2D.Dynamics.b2World
    , b2MassData = Box2D.Collision.Shapes.b2MassData
    , b2PolygonShape = Box2D.Collision.Shapes.b2PolygonShape
    , b2CircleShape = Box2D.Collision.Shapes.b2CircleShape
    , b2DebugDraw = Box2D.Dynamics.b2DebugDraw
    , b2MouseJointDef =  Box2D.Dynamics.Joints.b2MouseJointDef
    , b2DistanceJointDef =  Box2D.Dynamics.Joints.b2DistanceJointDef
    , b2Shape = Box2D.Collision.Shapes.b2Shape
    , b2Joint = Box2D.Dynamics.Joints.b2Joint
    , b2Settings = Box2D.Common.b2Settings
    ;
  
//Create box2d world object
function createWorld(scale,homex,homey,il1,il2) 
{
    //Gravity vector x, y - 10 m/s2 - thats earth!!
    var gravity = new b2Vec2(0, 10);
     
    world = new b2World(gravity , false);
     
    //setup debug draw
    var debugDraw = new b2DebugDraw();
    debugDraw.SetSprite(document.getElementById("canvas").getContext("2d"));
    debugDraw.SetDrawScale(scale);
    debugDraw.SetFillAlpha(0.5);
    debugDraw.SetLineThickness(1.0);
    debugDraw.SetFlags(b2DebugDraw.e_shapeBit | b2DebugDraw.e_jointBit);
     
    world.SetDebugDraw(debugDraw);
     
    //create some objects
    ground = createBox(world, m(0.5), m(1), m(1), cm(3), {type : b2Body.b2_staticBody});
    var a = createBox(world, suspensionMargin, suspensionMargin, cm(3) , cm(3), {type : b2Body.b2_staticBody});
    var b = createBox(world, m(1)-suspensionMargin, suspensionMargin, cm(3), cm(3), {type : b2Body.b2_staticBody});
    // angularDamping makes the carriage less shaky
    nozzle = createBox(world, bbox.x, bbox.y, cm(10), cm(10), {angularDamping: 5});
    //nozzle = createBall(world, bbox.x, bbox.y, cm(3/2));
     
    //create distance joint between b and c
    distance_joint1 = new b2DistanceJointDef();
    distance_joint1.bodyA = a;
    distance_joint1.bodyB = nozzle;
    //connect the centers - center in local coordinate - relative to body is 0,0
    distance_joint1.localAnchorA = new b2Vec2(0, 0);
    distance_joint1.localAnchorB = carriageAnchorLeft;
    //length of joint
    distance_joint1.length = il1;
    distance_joint1.collideConnected = true;
    
    //create distance joint between b and c
    distance_joint2 = new b2DistanceJointDef();
    distance_joint2.bodyA = b;
    distance_joint2.bodyB = nozzle;
    //connect the centers - center in local coordinate - relative to body is 0,0
    distance_joint2.localAnchorA = new b2Vec2(0, 0);
    distance_joint2.localAnchorB = carriageAnchorRight;
    //length of joint
    distance_joint2.length = il2;
    distance_joint2.collideConnected = true;
    
    //add the joint to the world
    distance_joint1 = world.CreateJoint(distance_joint1);
    distance_joint2 = world.CreateJoint(distance_joint2);
    
    return world;
}       
 
//Function to create a round ball, sphere like object
function createBall(world, x, y, radius, options) 
{
     //default setting
    options = $.extend(true, {
        'density' : 1.0,
        'friction' : 1.0,
        'restitution' : 1.0,
        'type' : b2Body.b2_dynamicBody
    }, options);
     
    var body_def = new b2BodyDef();
    var fix_def = new b2FixtureDef();
     
    fix_def.density = options.density;
    fix_def.friction = options.friction;
    fix_def.restitution = options.restitution;
     
    var shape = new b2CircleShape(radius);
    fix_def.shape = shape;
     
    body_def.position.Set(x , y);     
    body_def.type = b2Body.b2_dynamicBody;
    body_def.userData = options.user_data;
     
    var b = world.CreateBody( body_def );
    b.CreateFixture(fix_def);
     
    return b;
}
 
//Create standard boxes of given height , width at x,y
function createBox(world, x, y, width, height, options) 
{
     //default setting
    options = $.extend(true, {
        'density' : 1.0,
        'friction' : 1.0,
        'restitution' : 1.0,
        'angularDamping' : 1.0,
        'linearDamping' : 1.0,
        'type' : b2Body.b2_dynamicBody
    }, options);
       
    var body_def = new b2BodyDef();
    var fix_def = new b2FixtureDef();
     
    fix_def.density = options.density;
    fix_def.friction = options.friction;
    fix_def.restitution = options.restitution;
    
    fix_def.shape = new b2PolygonShape();
         
    fix_def.shape.SetAsBox(width/2, height/2);
     
    body_def.position.Set(x , y);
    body_def.angularDamping = options.angularDamping; 
    body_def.linearDamping = options.linearDamping;    
    
    body_def.type = options.type;
    body_def.userData = options.user_data;
     
    var b = world.CreateBody( body_def );
    var f = b.CreateFixture(fix_def);
     
    return b;
}


 
