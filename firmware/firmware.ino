// https://github.com/bakercp/PacketSerial
#include <PacketSerial.h>
// https://github.com/PaulStoffregen/TimerOne
#include <TimerOne.h> 

#include "config.h"

// The size of the queue in number of commands
#define QUEUE_SIZE  1000

// Command structure
struct SetSpeedCmd
{
  uint8_t speed;  
};

struct SelectToolCmd
{
  uint8_t tool;  
};

struct MoveCmd
{
  uint8_t left_motor_steps;  
  uint8_t right_motor_steps;
};

struct Command
{
  uint8_t type;
  union 
  {
    struct SetSpeedCmd setSpeedCmd;
    struct SelectToolCmd selectToolCmd;
    struct MoveCmd moveCmd;
  };  
};

// It is going to be a circular buffer
struct Command cmd_queue[QUEUE_SIZE];
// Pointer to the next free slot
volatile int queue_write_ptr = 0;
// Pointer to the first element to consume
volatile int queue_read_ptr = 0;
// The number of elements (steps) in the queue
volatile int nr_cmds = 0;

// For communicating using COBS
PacketSerial serial;

// The number of commands requested and still pending
uint8_t cmdsRequested = 0;

unsigned long calcStepPeriod(uint8_t speed)
{
  return (unsigned long)(1000000 / (STEPS_PER_MM * speed));
}

void setup()
{
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
    // set speed
    case 1:
      cmd_queue[queue_write_ptr].type = 1;
      cmd_queue[queue_write_ptr].setSpeedCmd.speed = buffer[1];
      break;
    // select tool
    case 2:
      cmd_queue[queue_write_ptr].type = 2;
      cmd_queue[queue_write_ptr].selectToolCmd.tool = buffer[1];
      break;
    // move
    case 3:
      cmd_queue[queue_write_ptr].type = 3;
      cmd_queue[queue_write_ptr].moveCmd.left_motor_steps = buffer[1];
      cmd_queue[queue_write_ptr].moveCmd.right_motor_steps = buffer[2];
      break;
  }

  queue_write_ptr = queue_write_ptr++ % QUEUE_SIZE;

  // This is the only shared variable. Interrupt uses queue_read_ptr, other code uses queue_write_ptr 
  noInterrupts(); 
  nr_cmds++;
  interrupts();

  if(cmdsRequested>0) cmdsRequested--;
}


