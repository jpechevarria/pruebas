using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Data;
using System.Drawing;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows.Forms;

namespace WindowsFormsApplication1
{
    public partial class FrmMain : Form
    {
        public FrmMain()
        {
            InitializeComponent();
        }

        private void FrmMain_Load(object sender, EventArgs e)
        {
            try
            {
                this.Width = 1000;
                this.Height = 800;

                TranslucentPanel pnl = new TranslucentPanel();
                pnl.Width = this.ClientRectangle.Width - 40;
                pnl.Height = this.ClientRectangle.Height - 40;
                pnl.Top = 20;
                pnl.Left = 20;

                CustomControl1 trt = new CustomControl1();
                trt.Width = pnl.Width - 20;
                trt.Height = pnl.Height - 20;
                trt.Top = 10;
                trt.Left = 10;
                trt.Font = new Font("Courier New", 12, FontStyle.Bold );

                pnl.Controls.Add(trt);

                Image img = Image.FromFile(@"C:\Users\yapjpe\Desktop\tmp\imagenes\FondoPapel.jpg");

                pnl.BackgroundImage = img;
                pnl.BackgroundImageLayout = ImageLayout.Stretch;

                /*
                this.BackgroundImage = img;
                this.BackgroundImageLayout = ImageLayout.Stretch;
                */

                this.Controls.Add(pnl);

                trt.Click += Trt_Click;

                trt.KeyUp += Trt_KeyUp;
            }
            catch(Exception ex)
            {
                MessageBox.Show("Error al cargar el formulario principal. Se va a cerrar la aplicación.", "Error", MessageBoxButtons.OK, MessageBoxIcon.Error);
                this.Close();
            }
        }

        private void Trt_KeyUp(object sender, KeyEventArgs e)
        {
            if ( e.KeyCode == Keys.F && e.Alt == true  && e.Shift == false)
            {
                CustomControl1 txt = (CustomControl1)sender;
                var insertText = DateTime.Now.ToLongDateString() + Environment.NewLine;
                var selectionIndex = txt.SelectionStart;
                txt.Text = txt.Text.Insert(selectionIndex, insertText);
                txt.SelectionStart = selectionIndex + insertText.Length;
            }

            //throw new NotImplementedException();
        }

        private void Trt_Click(object sender, EventArgs e)
        {
            
        }
        
    }
}
