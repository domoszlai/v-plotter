package sprocket;
 
import javafx.application.Application;
import javafx.geometry.Point2D;
import javafx.scene.Group;
import javafx.scene.Scene;
import javafx.scene.canvas.Canvas;
import javafx.scene.canvas.GraphicsContext;
import javafx.scene.input.MouseEvent;
import javafx.scene.paint.Color;
import javafx.stage.Stage;
 
/**
 *
 * @author dlacko
 */
public class Simulator extends Application {
 
    private Canvas canvas;
    
    public static void main(String[] args) {
        launch(args);
    }

    public void drawCircle(GraphicsContext gc, double cx, double cy, double r, Color c)
    {
        gc.setFill(c);
        gc.fillOval(cx-r, cy-r, r*2, r*2);
    }
    
    @Override
    public void start(Stage primaryStage) {
        primaryStage.setTitle("V-plotter non-zero sized sprockets simulation");
        Group root = new Group();
        
        double w = Config.D+Config.r*2+10;
        
        canvas = new Canvas(w, w*2.0/3.0);
        root.getChildren().add(canvas);
        primaryStage.setScene(new Scene(root));
        primaryStage.show();

        canvas.setOnMouseMoved((MouseEvent event) -> {
            GraphicsContext gc = canvas.getGraphicsContext2D();
            gc.save();
            
            gc.clearRect(0, 0, canvas.getWidth(), canvas.getHeight());

            // A small margin
            gc.translate(10, 10);

            // Coordinates of the centers of the suspensions
            double s1x = Config.r;
            double s1y = Config.r;

            double s2x = Config.D;
            double s2y = Config.r;            
            
            // Draw suspension circles   
            drawCircle(gc, s1x, s1y, Config.r, Color.BLACK);
            drawCircle(gc, s2x, s2y, Config.r, Color.BLACK);
            
            // Get and draw current point
            double px = event.getSceneX();
            double py = event.getSceneY();

            drawCircle(gc, px, py, 5, Color.RED);
                        
            // Calculate tangent points            
            Point2D lp = calcTangent(s1x,s1y,px,py,false);
            Point2D rp = calcTangent(s2x,s2y,px,py,true);
            
            // Show tangent points and lines
            drawCircle(gc, lp.getX(), lp.getY(), 5, Color.RED);
            drawCircle(gc, rp.getX(), rp.getY(), 5, Color.RED);
            
            gc.setStroke(Color.BLUE);
            gc.strokeLine(lp.getX(), lp.getY(), px, py);
            gc.strokeLine(rp.getX(), rp.getY(), px, py);
            
            gc.restore();
        });
    }

    public Point2D calcTangent(double cx, double cy, double px, double py, boolean left)
    {
        double dx = cx - px;
        double dy = cy - py;
        // The distance between the center of the circle (C) and the external point (P)
        double distance = Math.sqrt(dx * dx + dy * dy);
        // The angle of the tangent line and the PC line
        double alpha = Math.asin(Config.r / distance);
        // The angle of the PC line with the horizontal
        double beta = Math.atan2(dy, dx);

        if(left)
        {
            // Angle fo the tangent line and the horizontal
            double theta = beta - alpha;
            double rx = Config.r * Math.sin(theta);
            double ry = Config.r * -Math.cos(theta);
            return new Point2D(cx + rx, cy + ry);
        }
        else
        {
            // Angle fo the tangent line and the horizontal
            double theta = beta + alpha;
            double rx = Config.r * -Math.sin(theta);
            double ry = Config.r * Math.cos(theta);
            return new Point2D(cx + rx, cy + ry);            
        }
    }
        
    public void drawSuspensions(GraphicsContext gc) {
        drawCircle(gc, Config.r, Config.r, Config.r, Color.BLACK);
        drawCircle(gc, Config.D, Config.r, Config.r, Color.BLACK);
    }                
}