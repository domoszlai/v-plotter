package rotation;

import java.awt.geom.Line2D;
import java.awt.geom.Point2D;

/**
 *
 * @author dlacko
 */
public class VectorUtil {
    
    /**
     * Rotates a point around another by a given angle
     * @param point The point to rotate
     * @param origin The center of the rotation
     * @param radian The angle of the rotation in radians
     * @return The rotated point
     */
    public static Point2D rotatePoint(Point2D point, Point2D origin, double radian) 
    {
        double x = Math.cos(radian) * (point.getX()-origin.getX()) - Math.sin(radian) * (point.getY()-origin.getY()) + origin.getX();
        double y = Math.sin(radian) * (point.getX()-origin.getX()) + Math.cos(radian) * (point.getY()-origin.getY()) + origin.getY();
        return new Point2D.Double(x,y);
    }    

    /**
     * Calculates the angle between two lines 
     * @param line1 Line1
     * @param line2 Line2
     * @return The angle in radians 
     */
    public static double angleBetween2Lines(Line2D line1, Line2D line2)
    {
        double angle1 = Math.atan2(line1.getY2() - line1.getY1(),
                                   line1.getX2() - line1.getX1());
        double angle2 = Math.atan2(line2.getY2() - line2.getY1(),
                                   line2.getX2() - line2.getX1());
        return angle1 - angle2;
    }   
    
    /**
     * 2D cross product of two vectors
     * @param u Vector1
     * @param v Vector2
     * @return 2D cross product is a scalar 
     */
    public static double crossProduct(Point2D u, Point2D v) {
        return u.getX()*v.getY()-u.getY()*v.getX();
    }
    
    /**
     * Distance between two points
     * @param p1 Point1
     * @param p2 Point2
     * @return The distance
     */
    public static double distance(Point2D p1, Point2D p2)
    {
        return Math.sqrt(Math.pow(p2.getX()-p1.getX(), 2)+Math.pow(p2.getY()-p1.getY(), 2));
    }

    /**
     * Calculate the length of a vector
     * @param p The vector
     * @return The length of the p1 vector
     */
    public static double length(Point2D p)
    {
        return distance(p, new Point2D.Double(0,0));
    }

    /**
     * Creates a vector from two points (for direction) and length
     * @param p1 Point1
     * @param p2 Point2
     * @param length length of the vector
     * @return The vector
     */
    public static Point2D createVector(Point2D p1, Point2D p2, double length)
    {
        double d = distance(p1, p2);
        double x = p1.getX() - p2.getX();
        double y = p1.getY() - p2.getY();
        return new Point2D.Double(x * length / d, y * length / d);
    } 
}
