package rotation;

/**
 *
 * @author dlacko
 */
public class Config {
    
    // https://github.com/domoszlai/v-plotter/blob/master/configuration.png

    public static double suspensionMargin = scale(10);
    
    public static double A = scale(5);
    public static double B = scale(5);
    public static double C = scale(5);

    public static double D = scale(100-6);
    
    public static double scale(double unit)
    {
        return unit * 10;
    }
}
