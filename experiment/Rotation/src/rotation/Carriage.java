package rotation;

import java.awt.geom.Line2D;
import java.awt.geom.Point2D;

/**
 *
 * @author dlacko
 */
public class Carriage {

    // Parameters. See Config.java
    public final double A;
    public final double B;
    public final double C;

    public final double angleAt0;
    public final double angleAtD;
    
    //  A +-------+ B
    //    |       |
    //    | C *   |
    //    |       |
    // A1 +-------+ B1

    private Point2D pA;
    private Point2D pB;
    private Point2D pC;
    private Point2D pA1;
    private Point2D pB1;
    
    public Carriage(double A, double B, double C)
    {
        this.A = A;
        this.B = B;
        this.C = C;
        
        pA = new Point2D.Double(-A, -C);
        pB = new Point2D.Double(B, -C);
        pC = new Point2D.Double(0, 0);
        pA1 = new Point2D.Double(-A, C);
        pB1 = new Point2D.Double(B, C);
        
        // Calculate max angles (at 0, and D) 
        // using law of cosines
        
        double b = Math.sqrt(A*A+C*C);
        double a = Math.sqrt(B*B+C*C);
        double c = Math.sqrt((-A-B)*(-A-B));

        double cosA = (-a*a+c*c+b*b)/(2*c*b);
        double cosB = (a*a+c*c-b*b)/(2*a*c);
//        Just to check if it adds up to PI
//        double cosC = (a*a-c*c+b*b)/(2*a*b);
        
        angleAt0 = Math.PI/2-Math.acos(cosA); 
        angleAtD = Math.PI*2 - (Math.PI/2-Math.acos(cosB));
    }
    
    public Point2D getA()
    {
        return pA;
    }

    public Point2D getB()
    {
        return pB;
    }

    public Point2D getA1()
    {
        return pA1;
    }

    public Point2D getB1()
    {
        return pB1;
    }
    
    public Point2D getC()
    {
        return pC;
    }
    
    public void rotate(double radian)
    {
        pA = VectorUtil.rotatePoint(pA, pC, radian);
        pB = VectorUtil.rotatePoint(pB, pC, radian);
        pA1 = VectorUtil.rotatePoint(pA1, pC, radian);
        pB1 = VectorUtil.rotatePoint(pB1, pC, radian);        
    }
    
    public void shift(double x, double y)
    {
        pA = new Point2D.Double(pA.getX()+x, pA.getY()+y);
        pB = new Point2D.Double(pB.getX()+x, pB.getY()+y);
        pC = new Point2D.Double(pC.getX()+x, pC.getY()+y);
        pA1 = new Point2D.Double(pA1.getX()+x, pA1.getY()+y);
        pB1 = new Point2D.Double(pB1.getX()+x, pB1.getY()+y);
    }

    public double[] calcTorque(double D)
    {       
        // ------------------------------------------------------------
        // Calculate initial string angles
                
        double alpha = VectorUtil.angleBetween2Lines(
                new Line2D.Double(new Point2D.Double(0,0), this.getA()),
                new Line2D.Double(new Point2D.Double(0,0), new Point2D.Double(this.getA().getX(),0)));

        double beta = -VectorUtil.angleBetween2Lines(
                new Line2D.Double(new Point2D.Double(D,0), this.getB()),
                new Line2D.Double(new Point2D.Double(D,0), new Point2D.Double(this.getB().getX(),0)));

        // ------------------------------------------------------------
        // Calculate tension in strings
     
        //double Fg = 1; // Newton                
        //double T1 = Fg / (Math.cos(alpha)*Math.tan(beta)+Math.sin(alpha));
        //double T2 = T1 * Math.cos(alpha)/Math.cos(beta);
        
        // Assuming that Fg = 1
        double T1 = Math.cos(beta)/Math.sin(alpha + beta);
        double T2 = Math.cos(alpha)/Math.sin(alpha + beta);
        
        // ------------------------------------------------------------
        // Calculate torque

        Point2D vLevelArmA = new Point2D.Double(getA().getX()-getC().getX(), getA().getY()-getC().getY());
        Point2D vLevelArmB = new Point2D.Double(getB().getX()-getC().getX(), getB().getY()-getC().getY());

        Point2D vT1 = VectorUtil.createVector(new Point2D.Double(0,0), getA(), T1);
        Point2D vT2 = VectorUtil.createVector(new Point2D.Double(D,0), getB(), T2);
                
        double t1 = VectorUtil.crossProduct(vLevelArmA, vT1);
        double t2 = VectorUtil.crossProduct(vLevelArmB, vT2);
        
        return new double[]{t1, t2};
    }

    /**
     * Newton iteration to find the angle where torque is zero
     * @param A see Config.java
     * @param B see Config.java
     * @param C see Config.java
     * @param D see Config.java
     * @param maxError Maximum deviation of torque from zero
     * @param penX X position of center of mass of the carriage
     * @param penY y position of center of mass of the carriage
     * @return Rotated and shifted Carriage
     */
    public static Carriage createAtNewton(double A, double B, double C, double D, double maxError, double penX, double penY)
    {
        Carriage c = null;
        
        double torque = Double.MAX_VALUE;
        double angle = 0;
        final double eps = Math.toRadians(0.01);
        
        while(Math.abs(torque) > maxError)
        {
            c = new Carriage(A,B,C);
            c.rotate(angle);
            c.shift(penX, penY);

            double[] ts = c.calcTorque(D);
            torque = ts[0] + ts[1]; 
            
            c.rotate(eps);
            ts = c.calcTorque(D);
            double torqueEps = ts[0] + ts[1]; 
            
            double deriv = (torqueEps - torque) / eps;            
            angle = angle - (torque/deriv);
        }
                
        return c;
    }

    /**
     * Global search to find the angle where torque is zero
     * @param A see Config.java
     * @param B see Config.java
     * @param C see Config.java
     * @param D see Config.java 
     * @param resolution Resolution of angle in degrees
     * @param penX X position of center of mass of the carriage
     * @param penY y position of center of mass of the carriage
     * @return Rotated and shifted Carriage
     */
    public static Carriage createAtGlobal(double A, double B, double C, double D, double resolution, double penX, double penY)
    {
        Carriage c = new Carriage(A, B, C);
        c.shift(penX, penY);
        
        if(penX == 0)
        {
            c.rotate(c.angleAt0);
            return c;
        }
        else if(penX == D)
        {
            c.rotate(c.angleAtD);
            return c;
        }        
        
        double lAngle = Math.toDegrees(c.angleAt0);
        double rAngle = Math.toDegrees(c.angleAtD);
        if(rAngle > 0) rAngle -= 360;
                        
        Carriage minCarriage = c;
        double minTorque = Integer.MAX_VALUE;        
        
        for(double angle = lAngle; angle > rAngle; angle -= resolution)
        {
            c = new Carriage(A,B,C);
            c.rotate(Math.toRadians(angle));
            c.shift(penX, penY);
           
            double[] ts = c.calcTorque(D);
            double sumTorque = Math.abs(ts[0]+ts[1]);
            if(Math.signum(ts[0]) != Math.signum(ts[1]) && sumTorque<minTorque)
            {
                minCarriage = c;
                minTorque = sumTorque;
            }            
        }
        
        return minCarriage;
    }
}
