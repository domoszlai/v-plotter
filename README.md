## Synopsis

Step generator and simulator for a simple V plotter. The math is explained at [http://dlacko.org/blog/2017/06/04/v-plotter-math-coordinate-transformation-rotation-compensation/].

For an online demo of the simulator, visit [http://dlacko.org/v-plotter/simulator/sym_gcode.html].

## Usage

Type

`node gensteps.js gcodefile`

It will write the result to the standard output which can be used by the simulator, or by a real V plotter.

For a real V-plotter, you also want to configure the generator by editing `gensteps.js`, e.g. the resolution of the stepper motors and other stuff
visualized by `configuration.png`.

## Limitations

It is mainly designed to work with the gcode generated by [juicy-gcode](https://github.com/domoszlai/juicy-gcode).
It should work with every kind of gcode, but it is not well tested.
The plotter draws when the Z coordinate is 0.

## Bugs

Please file an issue if you run into a problem (or drop me an email to dlacko@gmail.com).
