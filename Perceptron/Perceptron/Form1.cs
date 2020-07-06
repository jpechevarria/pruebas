using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Data;
using System.Drawing;
using System.Linq;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using System.Windows.Forms;

namespace Perceptron
{
    public partial class Form1 : Form
    {
        public Form1()
        {
            InitializeComponent();
        }

        private void button1_Click(object sender, EventArgs e)
        {
            this.button1.Enabled = false;
            Thread.CurrentThread.Priority = ThreadPriority.Lowest;
            backgroundWorker1.RunWorkerAsync();
        }

        RectangleF OrigRect;
        RectangleF DestRect;

        private void DrawPoint(PointF p, Graphics g, Brush bru)
        {
            var pScreen = ConvertCoordInt(p, OrigRect, DestRect);
            g.FillEllipse(bru, new Rectangle(pScreen.X - 2, pScreen.Y - 2, 4, 4));
        }

        private void DrawPointCircle(PointF p, Graphics g, Pen pen)
        {
            var pScreen = ConvertCoordInt(p, OrigRect, DestRect);
            g.DrawEllipse(pen, new Rectangle(pScreen.X - 3, pScreen.Y - 3, 6, 6));
        }

        private void DrawPointCircleFill(PointF p, Graphics g, Brush br)
        {
            var pScreen = ConvertCoordInt(p, OrigRect, DestRect);
            g.FillEllipse(br, new Rectangle(pScreen.X - 4, pScreen.Y - 4, 8, 8));
        }

        private void DrawPointCross(PointF p, Graphics g, Pen pen)
        {
            var pScreen = ConvertCoordInt(p, OrigRect, DestRect);
            g.DrawLine(pen,  pScreen.X - 3, pScreen.Y - 3, pScreen.X + 3, pScreen.Y + 3);
            g.DrawLine(pen, pScreen.X - 3, pScreen.Y + 3, pScreen.X + 3, pScreen.Y - 3);
        }

        private void DrawLine2D(Line2D lin, Graphics g, Pen pen)
        {
            float xini = OrigRect.Left, xfin = OrigRect.Right;
            float yini = (float)lin.YValue(xini), yfin = (float)lin.YValue(xfin);

            PointF pScreenIni = ConvertCoord(new PointF(xini, yini), OrigRect, DestRect);
            PointF pScreenFin = ConvertCoord(new PointF(xfin, yfin), OrigRect, DestRect);
            g.DrawLine(pen, pScreenIni, pScreenFin);
        }

        private void DrawCustomCurve(Line2D lin, Graphics g, Pen pen)
        {
            float xIni = DestRect.Left, xFin = DestRect.Right;
            float x = xIni + 1, y, xAnt = xIni, yAnt;
            int i = 0;

            PointF scrPoint = new PointF(xAnt, 0);
            PointF domPoint = ConvertCoord(scrPoint, DestRect, OrigRect);
            domPoint.Y = (float)lin.YValue((float)domPoint.X);
            scrPoint = ConvertCoord(domPoint, OrigRect, DestRect);
            yAnt = scrPoint.Y;

            g.FillEllipse(Brushes.Blue, scrPoint.X, scrPoint.Y, 5, 5);

            for (; x <= xFin; x++)
            {
                scrPoint = new PointF(x, 0);
                domPoint = ConvertCoord(scrPoint, DestRect, OrigRect);
                domPoint.Y = (float)lin.YValue((float)domPoint.X);
                scrPoint = ConvertCoord(domPoint, OrigRect, DestRect);

                g.DrawLine(pen, xAnt, yAnt, scrPoint.X, scrPoint.Y);

                xAnt = x;
                yAnt = scrPoint.Y;
            }


        }

        private PointF ConvertCoord(PointF p, RectangleF orig, RectangleF dest)
        {
            double origXScale = orig.Right - orig.Left;
            double origYScale = orig.Bottom - orig.Top;

            double u = (p.X-orig.Left) / origXScale;
            double v = (p.Y-orig.Top) / origYScale;

            double destXScale = dest.Right - dest.Left;
            double destYScale = dest.Bottom - dest.Top;

            double x2 = dest.X + u * destXScale;
            double y2 = dest.Y + v * destYScale;

            return new PointF((float)x2, (float)y2);
        }

        private Point ConvertCoordInt(PointF p, RectangleF orig, RectangleF dest)
        {
            var pConv = ConvertCoord(p, orig, dest);
            return new Point((int)Math.Round(pConv.X), (int)Math.Round(pConv.Y));
        }

        const int TOTAL_TRAINERS = 1000;
        const int TRAIN_PASSES = 10;
        Bitmap bmp;
        object bmp_lock = new object();
        StringBuilder sb = new StringBuilder();
        DateTime ini, fin;

        private void backgroundWorker1_DoWork(object sender, DoWorkEventArgs e)
        {
            ini = DateTime.Now;
            sb.Clear();
            System.Threading.Thread.CurrentThread.Priority = System.Threading.ThreadPriority.Highest;
            iProgressChangedCount = 0;
            // ESTABLECE LOS RECTANGULOS
            var pic = this.pictureBox1;
            DestRect = new RectangleF(0f, 0f, (float)pic.Width, (float)pic.Height);
            OrigRect = new RectangleF(-(float)pic.Width / 2 / 10, (float)pic.Height / 2 / 10, (float)pic.Width / 10, -(float)pic.Height / 10);

            var ptron = new Perceptron(3);
            int salida;

            var rnd = new Random(DateTime.Now.Millisecond);

            var linea = new Line2D(rnd.NextDouble() * 10 - 5 , rnd.NextDouble() * 20 - 10);
            var trainers = new List<Trainer>();
            int i;
            for (i = 0; i < TOTAL_TRAINERS; i++)
            {
                var inputs = new double[] { rnd.NextDouble() * (Math.Abs(OrigRect.Width)) - (Math.Abs(OrigRect.Width) / 2), rnd.NextDouble() * (Math.Abs(OrigRect.Height)) - (Math.Abs(OrigRect.Height) / 2), 1 };
                int answer = linea.evaluatePoint(inputs[0], inputs[1]);
                trainers.Add(new Trainer(inputs, answer));
            }
            bmp = new Bitmap(pic.Width, pic.Height);

            Graphics g;
            Pen pen1, pen2;
            pen1 = new System.Drawing.Pen(Color.Black, 2F);
            g = Graphics.FromImage(bmp);

            g.Clear(Color.White);

            // DIBUJA LOS EJES
            g.DrawLine(pen1, pic.Width / 2, 0, pic.Width / 2, pic.Height);
            g.DrawLine(pen1, 0, pic.Height / 2, pic.Width, pic.Height / 2);

            // DIBUJA LA CURVA
            pen2 = new System.Drawing.Pen(Color.Blue, 2F);
            DrawCustomCurve(linea, g, pen2);

            // DIBUJA LOS TRAINERS ANTES DE ARRANCAR
            DrawTrainers(trainers, ptron, g);
            backgroundWorker1.ReportProgress(0);
            //Thread.Sleep(5000);

            i = 0;
            int j;
            for (j = 0; j < TRAIN_PASSES; j++)
            {

                foreach (var tr in trainers)
                {
                    i++;
                    ptron.entrenar(tr);
                    lock (bmp_lock)
                    {
                        DrawTrainer(tr, ptron, g);
                        //sb.Append("D");
                    }
                    System.Threading.Thread.Sleep(new TimeSpan(1));
                    /*if (i % 10 == 0)
                    {
                        System.Threading.Thread.Sleep(new TimeSpan(10000));
                    }*/
                    if (i % 100 == 0)
                    {
                        //System.Threading.Thread.Sleep(1);
                        //DrawTrainers(trainers, ptron, g);
                        backgroundWorker1.ReportProgress(i);
                        
                        //Application.DoEvents();
                        //System.Threading.Thread.Sleep(10);
                    }
                }
            }
            g.Dispose();
            fin = DateTime.Now;
        }

        private void DrawTrainers(List<Trainer> trainers, Perceptron ptron, Graphics g)
        {
            foreach (var tr in trainers)
            {
                DrawTrainer(tr, ptron, g);
            }
        }

        private void DrawTrainer(Trainer tr, Perceptron ptron, Graphics g)
        {
            float salida;
            var p = new PointF((float)tr.inputs[0], (float)tr.inputs[1]);
            salida = ptron.processInput(tr.inputs);

            float ratio = salida / tr.answer;

            Pen pen = Pens.ForestGreen;
            Brush br = Brushes.ForestGreen;

            Color color = Color.ForestGreen;
            int shape = 0; // 0 : punto - 1 : circulo - 2 : disco
            
            if ( salida == tr.answer )
            {
                color = Color.ForestGreen;
                shape = 2;
            }
            else
            {
                color = Color.ForestGreen;
                shape = 1;
            }

            ///*
            if (salida == 1) //Math.Sign(salida) == Math.Sign(tr.answer) )
            {
                color = Color.Green;
                //shape = shape;
                //DrawPointCircle(p, g, pen);
            }
            else
            {
                color = Color.Red;
                //shape = shape;
                //DrawPointCircleFill(p, g, br);
                //DrawPointCircle(p, g, pen);
                //DrawPointCross(p, g, pen);
                //DrawPoint(p, g, br);
            }
            //*/

            if ( shape == 0 )
            {
                br = new SolidBrush(color);
                DrawPoint(p, g, br);
            }
            else if (shape == 1)
            {
                pen = new System.Drawing.Pen(color);
                DrawPointCircleFill(p, g, Brushes.White);
                DrawPointCircle(p, g, pen);
            }
            else if (shape == 2)
            {
                br = new SolidBrush(color);
                DrawPointCircleFill(p, g, br);
            }
        }

        private void backgroundWorker1_RunWorkerCompleted(object sender, RunWorkerCompletedEventArgs e)
        {
            this.pictureBox1.Refresh();
            this.button1.Enabled = true;
            this.label2.Text = iProgressChangedCount.ToString();
            this.toolStripStatusLabel1.Text = "Duracion: " + fin.Subtract(ini).TotalSeconds.ToString("0.000") + " s";
            this.textBox1.Text = sb.ToString();
            sb.Clear();
        }

        int iProgressChangedCount = 0;

        private void backgroundWorker1_ProgressChanged(object sender, ProgressChangedEventArgs e)
        {
            //sb.AppendLine("P");
            iProgressChangedCount++;
            this.label2.Text = iProgressChangedCount.ToString();
            lock (bmp_lock)
            {
                this.pictureBox1.Image = (Image)(bmp.Clone());
            }
            this.label1.Text = e.ProgressPercentage.ToString();
        }

        private void button3_Click(object sender, EventArgs e)
        {
            if (this.textBox1.Text.Length > 0)
            {
                Clipboard.SetText(this.textBox1.Text);
            }
            else
            {
                Clipboard.Clear();
            }
        }

        private void backgroundWorker2_DoWork(object sender, DoWorkEventArgs e)
        {
            // ESTABLECE LOS RECTANGULOS
            var pic = this.pictureBox1;
            DestRect = new RectangleF(0f, 0f, (float)pic.Width, (float)pic.Height);
            OrigRect = new RectangleF(-(float)pic.Width / 2 / 10, (float)pic.Height / 2 / 10, (float)pic.Width / 10, -(float)pic.Height / 10);

            var ptron = new Perceptron(3);
            int salida;

            var linea = new Line2D(-3, -7);
            var trainers = new List<Trainer>();
            var rnd = new Random(DateTime.Now.Millisecond);
            int i;
            for (i = 0; i < TOTAL_TRAINERS; i++)
            {
                var inputs = new double[] { rnd.NextDouble() * (Math.Abs(OrigRect.Width)) - (Math.Abs(OrigRect.Width) / 2), rnd.NextDouble() * (Math.Abs(OrigRect.Height)) - (Math.Abs(OrigRect.Height) / 2), 1 };
                int answer = linea.evaluatePoint(inputs[0], inputs[1]);
                trainers.Add(new Trainer(inputs, answer));
            }
            bmp = new Bitmap(pic.Width, pic.Height);

            Graphics g;
            Pen pen1 = new System.Drawing.Pen(Color.Black, 2F);
            g = Graphics.FromImage(bmp);

            // DIBUJA LOS EJES
            g.DrawLine(pen1, pic.Width / 2, 0, pic.Width / 2, pic.Height);
            g.DrawLine(pen1, 0, pic.Height / 2, pic.Width, pic.Height / 2);

            // DIBUJA LA RECTA
            Pen pen2 = new System.Drawing.Pen(Color.Blue, 2F);
            DrawLine2D(linea, g, pen2);

            DrawTrainers(trainers, ptron, g);
            backgroundWorker1.ReportProgress(0);
            System.Threading.Thread.Sleep(100);

            i = 0;
            int j;
            for (j = 0; j < TRAIN_PASSES; j++)
            {
                foreach (var tr in trainers)
                {
                    i++;
                    ptron.entrenar(tr);
                    if (i % 10 == 0)
                    {
                        DrawTrainers(trainers, ptron, g);
                        backgroundWorker1.ReportProgress(i);
                    }

                }
            }
            g.Dispose();    
        }
    }

    public class Perceptron
    {
        int inputSize;
        double[] ws;
        const float LearningConstant = 0.01f;


        public Perceptron(int inputs)
        {
            inputSize = inputs;
            ws = new double[inputSize];

            Random r = new Random(DateTime.Now.Millisecond);
            for( var i = 0; i < inputSize; i++ )
            {
                ws[i] = r.NextDouble() * 2 - 1;
            }

        }

        public float processInput(double[] inputs)
        {
            double sum = 0;
            for (var i = 0; i < inputSize; i++)
            {
                sum += inputs[i] * ws[i];
            }
            return funcionSalida(sum);
        }

        private float funcionSalida(double valor)
        {
            // FUNCION RAMPA 
            /*
            float tope = 1;
            if (valor >= tope)
                return tope;
            else if (valor <= -tope)
                return -tope;
            else
                return (float)valor;
            //*/

            // FUNCION ESCALON
            ///*
            if (valor >= 0)
                return 1;
            else
                return -1;
            //*/
        }

        public void entrenar(Trainer tr)
        {
            float salida = this.processInput(tr.inputs);
            float error = tr.answer - salida;

            for ( int i =  0; i < inputSize; i++ )
            {
                ws[i] += error * tr.inputs[i] * LearningConstant;
            }
        }
    }

    public class Trainer
    {
        public double[] inputs;
        public int answer;

        public Trainer(double[] ins, int ans)
        {
            this.inputs = ins;
            this.answer = ans;
        }
    }

    public class Line2D
    {
        // SE REPRESENTA UNA LINEA COMO Y = A * X + B
        public double a, b;

        public Line2D(double a, double b)
        {
            this.a = a;
            this.b = b;
        }

        public int evaluatePoint(double x, double y)
        {
            double yline = YValue(x);
            if (y >= yline )
                return 1;
            else
                return -1;
        }

        public double YValue(double x)
        {
            return a * x + b; //(Linea)
            //return 40 * Math.Sin(0.25 * x); // Seno
        }
    }

}
