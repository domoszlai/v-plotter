#ifndef COMMAND_H
#define COMMAND_H

#define CMD_SET_SPEED       1
#define CMD_SELECT_TOOL     2
#define CMD_MOVE            3
#define CMD_DISABLE_MOTORS  4

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
	
#endif // COMMAND_H
