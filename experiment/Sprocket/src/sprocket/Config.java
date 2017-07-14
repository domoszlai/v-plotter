package sprocket;

/**
 *
 * @author dlacko
 */
public class Config {
    
    public static double D = scale(100-6);
    public static double r = scale(2);
    
    public static double scale(double unit)
    {
        return unit * 10;
    }
}
