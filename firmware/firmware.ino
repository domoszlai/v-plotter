// https://github.com/bakercp/PacketSerial
#include <PacketSerial.h>
// https://github.com/PaulStoffregen/TimerOne
#include <TimerOne.h> 
#include <Servo.h> 

#include "config.h"
#include "command.h"

// For communicating using COBS
PacketSerial serial;

// Servo object for the pen
Servo pen_servo;

// The size of the queue in number of commands
#define QUEUE_SIZE  1000

// It is going to be a circular buffer
struct Command cmd_queue[QUEUE_SIZE];
// Pointer to the next free slot
volatile int queue_write_ptr = 0;
// Pointer to the first command to consume
volatile int queue_read_ptr = 0;
// The number of commands in the queue
volatile int nr_cmds = 0;

// The number of commands requested from the client and still pending
uint8_t cmds_requested = 0;

// The number of steps must be taken before the next command needs to be processed.
// Decreased in stepISR 
volatile uint8_t nr_steps_prepared = 0;
// Step interval must be set to this after the next execution of the step timer
// Step interval is set in the ISR, this way it can be ensured that intervals always have the full length 
unsigned long next_speed = 0;

// Used to avoid step ISR nesting of the "Stepper Driver Interrupt". Should never occur though.
volatile uint8_t stepper_isr_busy = false;   

unsigned long calc_step_period(uint8_t speed)
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
  pinMode(LEFT_STEP_PIN, OUTPUT);
  pinMode(LEFT_DIR_PIN, OUTPUT);
  pinMode(LEFT_ENABLE_PIN, OUTPUT); 

  pinMode(RIGHT_STEP_PIN, OUTPUT);
  pinMode(RIGHT_DIR_PIN, OUTPUT);
  pinMode(RIGHT_ENABLE_PIN, OUTPUT); 

  digitalWrite(LEFT_ENABLE_PIN, HIGH);
  digitalWrite(RIGHT_ENABLE_PIN, HIGH);
  
  // Set up step timer
  Timer1.initialize(calc_step_period(5)); // default: 5 mm/sec
  Timer1.attachInterrupt(stepper_isr);
  
  // We must specify a packet handler method so that
  serial.setPacketHandler(&onPacket);
  serial.begin(115200);
}

// Stepper Driver Interrupt
void stepper_isr(void)
{
  if (stepper_isr_busy) { return; } // The busy-flag is used to avoid reentering this interrupt
  stepper_isr_busy = true;

  stepper_isr_busy = false;
}

// One iteration of this loop is supposed to be quick, so steps can be prepared
// between two executions of the step timer 
void loop()
{
  /* 
   * The idea is that the step timer is not very busy, so we have plenty of time 
   * to consume commands / prepare steps for the ISR between executions
   */
  while(nr_steps_prepared == 0 && nr_cmds > 0)
  {
    switch(cmd_queue[queue_read_ptr].type)
    {
      case CMD_SET_SPEED:
        next_speed = calc_step_period(cmd_queue[queue_read_ptr].setSpeedCmd.speed);  
        break;
      case CMD_SELECT_TOOL:
        if(cmd_queue[queue_read_ptr].selectToolCmd.tool == 1)
        {
          pen_servo.write(PEN_ON_ANGLE);        
        }
        else
        {
          pen_servo.write(PEN_OFF_ANGLE);
        }
        // TODO: avoid busy wait
        delay(PEN_CHANGE_TIME);
        break;
      case CMD_MOVE:
        break;
      case CMD_DISABLE_MOTORS:
        digitalWrite(LEFT_ENABLE_PIN, LOW);
        digitalWrite(RIGHT_ENABLE_PIN, LOW);
        break;
    }
    
    queue_read_ptr = queue_read_ptr++ % QUEUE_SIZE;
    nr_cmds--;      
  }

  // Ask for new commands if needed
  if(cmds_requested == 0 && nr_cmds < QUEUE_SIZE)
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
  
    cmds_requested = tmp[0];  
    if(cmds_requested>0) serial.send(tmp, 1);
  }
  
  // The update() method should be called at the end of the loop().
  serial.update(); 
}

// This is our packet callback.
// The buffer is delivered already decoded.
void onPacket(const uint8_t* buffer, size_t size)
{
  // It should not happen, but if the client sends commands too fast, skip what cannot be stored
  if(nr_cmds >= QUEUE_SIZE)
    return;
  
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

  nr_cmds++;
  if(cmds_requested>0) cmds_requested--;
}


