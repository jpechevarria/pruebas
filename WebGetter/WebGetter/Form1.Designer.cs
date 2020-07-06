namespace WebGetter
{
    partial class Form1
    {
        /// <summary>
        /// Required designer variable.
        /// </summary>
        private System.ComponentModel.IContainer components = null;

        /// <summary>
        /// Clean up any resources being used.
        /// </summary>
        /// <param name="disposing">true if managed resources should be disposed; otherwise, false.</param>
        protected override void Dispose(bool disposing)
        {
            if (disposing && (components != null))
            {
                components.Dispose();
            }
            base.Dispose(disposing);
        }

        #region Windows Form Designer generated code

        /// <summary>
        /// Required method for Designer support - do not modify
        /// the contents of this method with the code editor.
        /// </summary>
        private void InitializeComponent()
        {
            this.btGet = new System.Windows.Forms.Button();
            this.txResultado = new System.Windows.Forms.TextBox();
            this.txURL = new System.Windows.Forms.TextBox();
            this.gvResultado = new System.Windows.Forms.DataGridView();
            this.gvInversion = new System.Windows.Forms.DataGridView();
            ((System.ComponentModel.ISupportInitialize)(this.gvResultado)).BeginInit();
            ((System.ComponentModel.ISupportInitialize)(this.gvInversion)).BeginInit();
            this.SuspendLayout();
            // 
            // btGet
            // 
            this.btGet.Location = new System.Drawing.Point(667, 12);
            this.btGet.Name = "btGet";
            this.btGet.Size = new System.Drawing.Size(75, 23);
            this.btGet.TabIndex = 0;
            this.btGet.Text = "Get";
            this.btGet.UseVisualStyleBackColor = true;
            this.btGet.Click += new System.EventHandler(this.btGet_Click);
            // 
            // txResultado
            // 
            this.txResultado.Anchor = ((System.Windows.Forms.AnchorStyles)((((System.Windows.Forms.AnchorStyles.Top | System.Windows.Forms.AnchorStyles.Bottom) 
            | System.Windows.Forms.AnchorStyles.Left) 
            | System.Windows.Forms.AnchorStyles.Right)));
            this.txResultado.Location = new System.Drawing.Point(13, 440);
            this.txResultado.Multiline = true;
            this.txResultado.Name = "txResultado";
            this.txResultado.Size = new System.Drawing.Size(985, 172);
            this.txResultado.TabIndex = 1;
            // 
            // txURL
            // 
            this.txURL.Location = new System.Drawing.Point(12, 12);
            this.txURL.Name = "txURL";
            this.txURL.Size = new System.Drawing.Size(649, 20);
            this.txURL.TabIndex = 2;
            // 
            // gvResultado
            // 
            this.gvResultado.AllowUserToAddRows = false;
            this.gvResultado.AllowUserToDeleteRows = false;
            this.gvResultado.Anchor = ((System.Windows.Forms.AnchorStyles)(((System.Windows.Forms.AnchorStyles.Top | System.Windows.Forms.AnchorStyles.Left) 
            | System.Windows.Forms.AnchorStyles.Right)));
            this.gvResultado.ColumnHeadersHeightSizeMode = System.Windows.Forms.DataGridViewColumnHeadersHeightSizeMode.AutoSize;
            this.gvResultado.Location = new System.Drawing.Point(12, 260);
            this.gvResultado.Name = "gvResultado";
            this.gvResultado.ReadOnly = true;
            this.gvResultado.Size = new System.Drawing.Size(984, 174);
            this.gvResultado.TabIndex = 3;
            // 
            // gvInversion
            // 
            this.gvInversion.AllowUserToAddRows = false;
            this.gvInversion.AllowUserToDeleteRows = false;
            this.gvInversion.Anchor = ((System.Windows.Forms.AnchorStyles)(((System.Windows.Forms.AnchorStyles.Top | System.Windows.Forms.AnchorStyles.Left) 
            | System.Windows.Forms.AnchorStyles.Right)));
            this.gvInversion.ColumnHeadersHeightSizeMode = System.Windows.Forms.DataGridViewColumnHeadersHeightSizeMode.AutoSize;
            this.gvInversion.Location = new System.Drawing.Point(11, 41);
            this.gvInversion.Name = "gvInversion";
            this.gvInversion.ReadOnly = true;
            this.gvInversion.Size = new System.Drawing.Size(984, 213);
            this.gvInversion.TabIndex = 4;
            // 
            // Form1
            // 
            this.AutoScaleDimensions = new System.Drawing.SizeF(6F, 13F);
            this.AutoScaleMode = System.Windows.Forms.AutoScaleMode.Font;
            this.ClientSize = new System.Drawing.Size(1009, 624);
            this.Controls.Add(this.gvInversion);
            this.Controls.Add(this.gvResultado);
            this.Controls.Add(this.txURL);
            this.Controls.Add(this.txResultado);
            this.Controls.Add(this.btGet);
            this.Name = "Form1";
            this.Text = "Form1";
            this.Shown += new System.EventHandler(this.Form1_Shown);
            ((System.ComponentModel.ISupportInitialize)(this.gvResultado)).EndInit();
            ((System.ComponentModel.ISupportInitialize)(this.gvInversion)).EndInit();
            this.ResumeLayout(false);
            this.PerformLayout();

        }

        #endregion

        private System.Windows.Forms.Button btGet;
        private System.Windows.Forms.TextBox txResultado;
        private System.Windows.Forms.TextBox txURL;
        private System.Windows.Forms.DataGridView gvResultado;
        private System.Windows.Forms.DataGridView gvInversion;
    }
}

