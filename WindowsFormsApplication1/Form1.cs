using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Data;
using System.Drawing;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows.Forms;
using System.IO;
using SevenZip;
using System.Data.OleDb;
using System.Data.SqlClient;
using System.Collections;

namespace WindowsFormsApplication1
{
    public partial class Form1 : Form
    {
        private string connStrDestino = @"Server=.\sqlexpress;Database=MEDICO;Trusted_Connection=True;";
        private bool extraerArchivos = true;
        private bool procesarArchivos = true;

        public Form1()
        {
            InitializeComponent();
        }

        private void Form1_Shown(object sender, EventArgs e)
        {
            if ( MessageBox.Show("Se va iniciar el proceso de extracción y carga de datos de fichas del sistema MEDICO. Desea continuar?", "Proceso", MessageBoxButtons.YesNo) == DialogResult.Yes )
            { 
                backgroundWorker1.RunWorkerAsync();
            }
        }

        private void ProcesarSevenZipLib()
        {
            DateTime ini = DateTime.Now, act, fin;
            this.Invoke(new ActualizarStatusDelegate(ActualizarStatus),0, "Iniciando proceso.");
            int count = 0;
            SqlConnection connDest;

            using (connDest = this.GetConnectionDestino())
            {
                connDest.Open();
                SqlCommand cmdTruncarArchivos = new SqlCommand("truncate table ArchivosBackup", connDest);
                cmdTruncarArchivos.ExecuteNonQuery();
                cmdTruncarArchivos = new SqlCommand("truncate table Pacientes", connDest);
                cmdTruncarArchivos.ExecuteNonQuery();
                connDest.Close();
            }

            try
            {
                string pathBackups = @"C:\JPE\BACKUPS\Jorge\READONLY\MEDICO_BACKUPS_hasta_20160403";
                string pathDestinoBase = @"C:\JPE\BACKUPS\Jorge\ProcesoRecuperacion";
                SevenZipExtractor.SetLibraryPath(@"C:\Program Files\7-Zip\7z.dll");
                this.Invoke(new ClearOutputDelegate(ClearOutput));
                
                string[] listaArchivosRAR = Directory.GetFiles(pathBackups);
                int cantArchivosRAR = listaArchivosRAR.Length;
                this.Invoke(new ActualizarMaxAvanceDelegate(ActualizarMaxAvance),cantArchivosRAR);
                foreach (var RARfile in listaArchivosRAR)
                {
                    this.Invoke(new ActualizarStatusDelegate(ActualizarStatus),count, string.Format("Procesando archivo {0} de {1}...",count+1,cantArchivosRAR));
                    SevenZipExtractor ext = new SevenZipExtractor(RARfile);
                    string RARFileName = Path.GetFileName(RARfile);
                    string RARFileNameNoExt = Path.GetFileNameWithoutExtension(RARFileName);

                    string strFechaArchivo = RARFileNameNoExt.Substring(RARFileNameNoExt.Length - 8);
                    int intFechaArchivo;
                    DateTime fechaArchivo = DateTime.MinValue;
                    if (int.TryParse(strFechaArchivo, out intFechaArchivo))
                    {
                        fechaArchivo = new DateTime(int.Parse(strFechaArchivo.Substring(0, 4)), int.Parse(strFechaArchivo.Substring(4, 2)), int.Parse(strFechaArchivo.Substring(6, 2)));
                    }
                    int idArchivo = InsertArchivo(RARFileNameNoExt, fechaArchivo);

                    List<object[]> listaArchivos = new List<object[]>();
                    // Primero exporta los archivos
                    string pathDestinoRar = Path.Combine(pathDestinoBase, RARFileNameNoExt);
                    Directory.CreateDirectory(pathDestinoRar);
                    foreach (var contentFile in ext.ArchiveFileData)
                    {
                        if (contentFile.IsDirectory == false)
                        {
                            string contentFileName = Path.GetFileName(contentFile.FileName);

                            if (Path.GetExtension(contentFileName).Equals(".dbf", StringComparison.CurrentCultureIgnoreCase)
                                || Path.GetExtension(contentFileName).Equals(".dbt", StringComparison.CurrentCultureIgnoreCase)
                                )
                            {
                                this.Invoke(new AppendTextOutputDelegate(AppendTextOutput), string.Format("{0}\t{1}{2}", RARFileName, contentFileName, Environment.NewLine));

                                string fullNameDestino = Path.Combine(pathDestinoRar, contentFileName);
                                if (this.extraerArchivos)
                                {
                                    try
                                    {
                                        FileStream fs = File.OpenWrite(fullNameDestino);
                                        ext.ExtractFile(contentFile.FileName, fs);
                                        fs.Close();
                                    }
                                    catch (Exception ex)
                                    {
                                        Console.Out.WriteLine("Error al extraer archivo: " + ex.ToString());
                                    }
                                }

                                listaArchivos.Add(new object[] { contentFileName, fullNameDestino });
                            }
                        }
                    }
                    // Segundo levanta los archivos
                    if (procesarArchivos)
                    {
                        foreach (var par in listaArchivos)
                        {
                            string fileName = (string)par[0];
                            string fullFileName = (string)par[1];

                            if (fileName.Equals("medicin3.dbf", StringComparison.CurrentCultureIgnoreCase))
                            {
                                int a = 1;
                                DataTable dtDatos = ReadDBF(fullFileName);
                                this.SaveTablePacientes(dtDatos, (int)idArchivo);
                            }
                        }
                    }
                    count++;
                    act = DateTime.Now;
                    TimeSpan ts = act.Subtract(ini);
                    fin = ini.AddSeconds(ts.TotalSeconds / count * cantArchivosRAR);
                    this.Invoke(new ActualizarAvanceDelegate(ActualizarAvance), count);
                    this.Invoke(new ActualizarTiemposDelegate(ActualizarTiempos), ini, ts, fin);
                    if (count >= 1000)
                    {
                        break;
                    }
                }
                this.Invoke(new ActualizarStatusDelegate(ActualizarStatus),count, string.Format("Fin proceso. Procesados {0} archivos.",count));
            }
            catch (Exception ex)
            {
                MessageBox.Show("Error: " + Environment.NewLine + ex.ToString());
            }
        }

        private DataTable ReadDBF(string fileName)
        {
            try
            { 
                string path = Path.GetDirectoryName(fileName);
                string file = Path.GetFileName(fileName);
                OleDbConnection conn = new OleDbConnection();
                conn.ConnectionString = string.Format(@"Provider=Microsoft.ACE.OLEDB.12.0;Data Source={0};Extended Properties=dBASE IV;User ID=Admin;Password=;", path);
                conn.Open();
                DataTable dt = new DataTable();
                OleDbCommand cmd = new OleDbCommand(string.Format("SELECT * FROM medicin3.dbf",file), conn);
                OleDbDataAdapter da = new OleDbDataAdapter(cmd);
                da.Fill(dt);
                conn.Close();
                return dt;
            }
            catch(Exception ex)
            {
                Console.WriteLine(ex.ToString());
            }
            return null;
        }

        private int InsertArchivo(string fileName, DateTime fechaArchivo)
        {
            int idArchivo=0;
            using (SqlConnection connDest = this.GetConnectionDestino())
            {
                connDest.Open();
                SqlCommand cmdInsertArchivo = new SqlCommand("insert into ArchivosBackup (fileName, fecha) values ( @fileName, @fecha); select scope_identity()", connDest);
                cmdInsertArchivo.Parameters.AddWithValue("@fileName", fileName);
                cmdInsertArchivo.Parameters.AddWithValue("@fecha", fechaArchivo);
                if (fechaArchivo == DateTime.MinValue) cmdInsertArchivo.Parameters["@fecha"].Value = System.DBNull.Value;
                object result = cmdInsertArchivo.ExecuteScalar();
                if (result != null)
                {
                    if (result is int)
                    {
                        idArchivo = (int)result;
                    }
                    else if (result is decimal)
                    {
                        idArchivo = decimal.ToInt32((decimal)result);
                    }
                }
                connDest.Close();
            }
            return idArchivo;
        }

        private void SaveTablePacientes(DataTable dtDatos, int idArchivo)
        {
            dtDatos.Columns.Add("idArchivo", typeof(int));
            foreach (DataRow dr in dtDatos.Rows)
            {
                dr["idArchivo"] = idArchivo;
            }
            using (SqlConnection connDest = this.GetConnectionDestino())
            {
                connDest.Open();
                SqlBulkCopy blkCpy = new SqlBulkCopy(connDest);
                blkCpy.DestinationTableName = "Pacientes";
                blkCpy.ColumnMappings.Add("idArchivo", "idArchivo");
                blkCpy.ColumnMappings.Add("CODPAC", "CODPAC");
                blkCpy.ColumnMappings.Add("NOMBRE", "NOMBRE");
                blkCpy.ColumnMappings.Add("DIRECCION", "DIRECCION");
                blkCpy.ColumnMappings.Add("LOCALIDAD", "LOCALIDAD");
                blkCpy.ColumnMappings.Add("TELEFONO", "TELEFONO");
                blkCpy.ColumnMappings.Add("FICHA", "FICHA");
                blkCpy.ColumnMappings.Add("ULT_CONSUL", "ULT_CONSUL");
                blkCpy.WriteToServer(dtDatos);
                connDest.Close();
            }
        }

        private SqlConnection GetConnectionDestino()
        {
            return new SqlConnection(connStrDestino);
        }

        private void backgroundWorker1_DoWork(object sender, DoWorkEventArgs e)
        {
            ProcesarSevenZipLib();
        }


        public delegate void ClearOutputDelegate();
        public delegate void AppendTextOutputDelegate(string s);
        public delegate void ActualizarMaxAvanceDelegate(int i);
        public delegate void ActualizarStatusDelegate(int i, string s);
        public delegate void ActualizarAvanceDelegate(int i);
        public delegate void ActualizarTiemposDelegate(DateTime ini, TimeSpan ts, DateTime fin);

        public void ClearOutput()
        {
            txtOutput.Clear();
        }

        public void AppendTextOutput(string mensaje)
        {
            txtOutput.AppendText(mensaje);
        }

        public void ActualizarMaxAvance(int maxAvance)
        {
            pgAvance.Maximum = maxAvance;
        }

        public void ActualizarStatus(int avance, string mensaje)
        {
            this.pgAvance.Value = avance;
            this.lblStatus.Text = mensaje;
        }

        public void ActualizarAvance(int avance)
        {
            this.pgAvance.Value = avance;
        }

        public void ActualizarTiempos(DateTime ini, TimeSpan ts, DateTime fin)
        {
            this.lblTiempos.Text = string.Format("Inicio: {0} - Transcurrido: {1} - Fin Estimado: {2}", ini.ToLongTimeString(), ts.ToString(@"hh\:mm\:ss"), fin.ToLongTimeString());
        }
    }
}
