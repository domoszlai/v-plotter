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
int queue_ptr = 0;
// The number of elements (steps) in the queue
int nr_cmds = 0;

// For communicating using COBS
PacketSerial serial;

// The number of commands requested and still pending
uint8_t cmdsRequested;

void requestCmds()
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

unsigned long calcStepPeriod(uint8_t speed)
{
  return (unsigned long)((1.0/STEPS_PER_MM)*1000000);
}

void setup()
{
  // Set up step timer
  Timer1.initialize(calcStepPeriod(5)); // default: 5 mm/sec
  Timer1.attachInterrupt(step);
  
  // We must specify a packet handler method so that
  serial.setPacketHandler(&onPacket);
  serial.begin(115200);

  // Ask for commands
  requestCmds();
}

// Step interrupt
void step(void)
{
}

void loop()
{
  // The update() method should be called at the end of the loop().
  serial.update(); 
}

// This is our packet callback.
// The buffer is delivered already decoded.
void onPacket(const uint8_t* buffer, size_t size)
{
  // Make a temporary buffer.
  uint8_t tmp[size]; 
  
  // Copy the packet into our temporary buffer.
  memcpy(tmp, buffer, size); 
  
  addCmd(tmp, size);
}

// Add the step to the queue and request more steps if this was the last expected one.
void addCmd(uint8_t* buffer, size_t size)
{
  noInterrupts();

  switch(buffer[0])
  {
    // set speed
    case 1:
      cmd_queue[queue_ptr].type = 1;
      cmd_queue[queue_ptr].setSpeedCmd.speed = buffer[1];
      break;
    // select tool
    case 2:
      cmd_queue[queue_ptr].type = 2;
      cmd_queue[queue_ptr].selectToolCmd.tool = buffer[1];
      break;
    // move
    case 3:
      cmd_queue[queue_ptr].type = 3;
      cmd_queue[queue_ptr].moveCmd.left_motor_steps = buffer[1];
      cmd_queue[queue_ptr].moveCmd.right_motor_steps = buffer[2];
      break;
  }

  queue_ptr = queue_ptr++ % QUEUE_SIZE;
  nr_cmds++;

  if(--cmdsRequested == 0)
  {
    requestCmds();      
  }

  interrupts();
}

