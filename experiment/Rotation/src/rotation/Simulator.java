package rotation;
 
import javafx.application.Application;
import javafx.scene.Group;
import javafx.scene.Scene;
import javafx.scene.canvas.Canvas;
import javafx.scene.canvas.GraphicsContext;
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
    
    private void calcMaxAngles() {

     //   Carriage c2 = Carriage.createAtNewton(Config.A, Config.B, Config.C, Config.D, 0.01, 100, 100);
     //   drawCarriage(c2);
        
        
        
        for(int x = 0; x <= Config.D; x += Config.D/20)
        {
            // Global search with resolution: 0.1 degrees
            Carriage c = Carriage.createAtGlobal(Config.A, Config.B, Config.C, Config.D, 0.1, x, 200);
            drawCarriage(c);

            // Newton with max error 0.01
            Carriage c2 = Carriage.createAtNewton(Config.A, Config.B, Config.C, Config.D, 0.01, x, 200);
            drawCarriage(c2);
        }
        
        
        for(int x = 0; x <= Config.D; x += Config.D/20)
        {
            // Global search with resolution: 0.1 degrees            
            Carriage c = Carriage.createAtGlobal(Config.A, Config.B, Config.C, Config.D, 0.1, x, 500);
            drawCarriage(c);            
            
            // Newton with max error 0.01
            Carriage c2 = Carriage.createAtNewton(Config.A, Config.B, Config.C, Config.D, 0.01, x, 500);      
            drawCarriage(c2);
        }
        
    }
    
    @Override
    public void start(Stage primaryStage) {
        primaryStage.setTitle("V-plotter carriage rotation simulation");
        Group root = new Group();
        
        double w = Config.D+Config.suspensionMargin*2;
        
        canvas = new Canvas(w, w*2.0/3.0);
        root.getChildren().add(canvas);
        primaryStage.setScene(new Scene(root));
        primaryStage.show();
        
        calcMaxAngles();
    }

    public void drawTable(GraphicsContext gc) {

        gc.setFill(Color.RED);
        gc.fillOval(-5, -5, 10, 10);
        gc.fillOval(Config.D-5, -5, 10, 10);
    }        
        
    public void drawCarriage(Carriage c) {
        GraphicsContext gc = canvas.getGraphicsContext2D();
        gc.save();
        
        gc.translate(Config.suspensionMargin, Config.suspensionMargin);

        drawTable(gc);
        
        gc.setStroke(Color.BLACK);
        
        double[] xs = new double[]{
            c.getA().getX(), c.getB().getX(), c.getB1().getX(), c.getA1().getX(), c.getA().getX()};
        double[] ys = new double[]{
            c.getA().getY(), c.getB().getY(), c.getB1().getY(), c.getA1().getY(), c.getA().getY()};
        
        gc.strokePolyline(xs, ys, 5);
        gc.setFill(Color.GREEN);
        gc.fillOval(c.getA().getX()-5, c.getA().getY()-5, 10, 10);
        gc.setFill(Color.BLUE);
        gc.fillOval(c.getB().getX()-5, c.getB().getY()-5, 10, 10);
        gc.setFill(Color.BLACK);
        gc.fillOval(c.getC().getX()-5, c.getC().getY()-5, 10, 10);        
        
        gc.restore();
    }
        
}