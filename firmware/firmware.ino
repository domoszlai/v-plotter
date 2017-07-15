// https://github.com/bakercp/PacketSerial
#include <PacketSerial.h>
// https://github.com/PaulStoffregen/TimerOne
#include <TimerOne.h> 

// The size of the queue in number of commands
#define QUEUE_SIZE  1000

// Command structure
union Flags
{
  struct
  {
    uint8_t speed : 7;  // * 0.1 mm / sec
    uint8_t pen_on : 1;
  };
  uint8_t whole;  
};

struct Command
{
  int8_t left_motor_steps;
  int8_t right_motor_steps;
  union Flags flags;
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

void setup()
{
  // Set up step timer
  Timer1.initialize(150000);  // 0.15 sec
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

  cmd_queue[queue_ptr].left_motor_steps = buffer[0];
  cmd_queue[queue_ptr].right_motor_steps = buffer[1];
  cmd_queue[queue_ptr].flags.whole = buffer[2];

  queue_ptr = queue_ptr++ % QUEUE_SIZE;
  nr_cmds++;

  if(--cmdsRequested == 0)
  {
    requestCmds();      
  }

  interrupts();
}

