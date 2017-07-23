#ifndef CONFIG_H
#define CONFIG_H

#define LEFT_STEP_PIN         46  // Ramps Z
#define LEFT_DIR_PIN          48
#define LEFT_ENABLE_PIN       62 

#define RIGHT_STEP_PIN        60  // Ramps Y
#define RIGHT_DIR_PIN         61
#define RIGHT_ENABLE_PIN      56 

#define PEN_PIN               4     // 5, 6, 11
#define PEN_CHANGE_TIME       20    // ms
#define PEN_ON_ANGLE          0     
#define PEN_OFF_ANGLE         20

// Sprocket radius in mm. GT2 pulley 20 teeth
#define SPROCKET_DIAMETER	    12.73 	

// Stepper motor steps per revolution
#define STEPS_PER_REVOLUTION 	180	
// Stepper driver microstepping (1 = disabled)
#define MICROSTEPPING 		    1	

#define	STEPS_PER_MM		(STEPS_PER_REVOLUTION*MICROSTEPPING)/(3.14*SPROCKET_DIAMETER)
	
#endif // CONFIG_H
