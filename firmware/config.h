#ifndef CONFIG_H
#define CONFIG_H

#define SPROCKET_DIAMETER	12.73 	// Sprocket radius in mm. GT2 pulley 20 teeth

#define STEPS_PER_REVOLUTION 	180	// Stepper motor steps per revolution
#define MICROSTEPPING 		1	// Stepper driver microstepping (1 = disabled)

#define	STEPS_PER_MM		(STEPS_PER_REVOLUTION*MICROSTEPPING)/(3.14*SPROCKET_DIAMETER)
	

#endif // CONFIG_H