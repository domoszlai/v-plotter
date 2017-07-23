// https://github.com/bakercp/PacketSerial
#include <PacketSerial.h>
// https://github.com/PaulStoffregen/TimerOne
#include <TimerOne.h> 
#include <Servo.h> 

#include "config.h"
#include "command.h"

// For communicating using COBS
PacketSerial serial;

// The size of the queue in number of commands
#define QUEUE_SIZE  1000

// It is going to be a circular buffer
struct Command cmd_queue[QUEUE_SIZE];
// Pointer to the next free slot
volatile int queue_write_ptr = 0;
// Pointer to the first element to consume
volatile int queue_read_ptr = 0;
// The number of elements (steps) in the queue
volatile int nr_cmds = 0;

// The number of commands requested and still pending
uint8_t cmdsRequested = 0;

Servo pen_servo;

unsigned long calcStepPeriod(uint8_t speed)
{
  return (unsigned long)(1000000 / (STEPS_PER_MM * speed));
}

void setup()
{
  // Initialize pen
  pen_servo.attach(PEN_PIN);   
  pen_servo.write(PEN_OFF_ANGLE);  
  delay(PEN_CHANGE_TIME);

  // Initialize stepper motors
  pinMode(LEFT_STEP_PIN,    OUTPUT);
  pinMode(LEFT_DIR_PIN,     OUTPUT);
  pinMode(LEFT_ENABLE_PIN,  OUTPUT); 

  pinMode(RIGHT_STEP_PIN,    OUTPUT);
  pinMode(RIGHT_DIR_PIN,     OUTPUT);
  pinMode(RIGHT_ENABLE_PIN,  OUTPUT); 

  digitalWrite(LEFT_ENABLE_PIN, HIGH);
  digitalWrite(RIGHT_ENABLE_PIN, HIGH);
  
  // Set up step timer
  Timer1.initialize(calcStepPeriod(5)); // default: 5 mm/sec
  Timer1.attachInterrupt(step);
  
  // We must specify a packet handler method so that
  serial.setPacketHandler(&onPacket);
  serial.begin(115200);
}

// Step interrupt
void step(void)
{
  if(nr_cmds>0)
  {
    queue_read_ptr = queue_read_ptr++ % QUEUE_SIZE;
    nr_cmds--;  
  }
}

void loop()
{
  if(cmdsRequested == 0 && nr_cmds < QUEUE_SIZE)
  {
    uint8_t tmp[1]; 
  
    if(QUEUE_SIZE - nr_cmds > 255)
    {
      tmp[0] = 255;
    }
    else
    {
      tmp[0] = QUEUE_SIZE - nr_cmds;
    }
  
    cmdsRequested = tmp[0];  
    if(cmdsRequested>0) serial.send(tmp, 1);
  }
  
  // The update() method should be called at the end of the loop().
  serial.update(); 
}

// This is our packet callback.
// The buffer is delivered already decoded.
void onPacket(const uint8_t* buffer, size_t size)
{
  // TODO: check if there is enough space left in the queue
  
  // Add the received command to the queue
  switch(buffer[0])
  {
    case CMD_SET_SPEED:
      cmd_queue[queue_write_ptr].type = CMD_SET_SPEED;
      cmd_queue[queue_write_ptr].setSpeedCmd.speed = buffer[1];
      break;
    case CMD_SELECT_TOOL:
      cmd_queue[queue_write_ptr].type = CMD_SELECT_TOOL;
      cmd_queue[queue_write_ptr].selectToolCmd.tool = buffer[1];
      break;
    case CMD_MOVE:
      cmd_queue[queue_write_ptr].type = CMD_MOVE;
      cmd_queue[queue_write_ptr].moveCmd.left_motor_steps = buffer[1];
      cmd_queue[queue_write_ptr].moveCmd.right_motor_steps = buffer[2];
      break;
    case CMD_DISABLE_MOTORS:
      cmd_queue[queue_write_ptr].type = CMD_DISABLE_MOTORS;
      break;
  }

  queue_write_ptr = queue_write_ptr++ % QUEUE_SIZE;

  // This is the only shared variable. Interrupt uses queue_read_ptr, other code uses queue_write_ptr 
  noInterrupts(); 
  nr_cmds++;
  interrupts();

  if(cmdsRequested>0) cmdsRequested--;
}


