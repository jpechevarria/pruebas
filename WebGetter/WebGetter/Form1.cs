using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Data;
using System.Drawing;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows.Forms;
using System.Net;
using System.IO;
using System.Xml;

namespace WebGetter
{
    public partial class Form1 : Form
    {
        DataTable dtInversion;
        DataTable dtFondos;

        public Form1()
        {
            InitializeComponent();
        }

        private void btGet_Click(object sender, EventArgs e)
        {
            string url;
            //url = "https://www.bbvafrances.com.ar/personas/inversiones/cotizaciones/cotizacion-fondos-inversion.jsp";
            url = @"https://hb.bbv.com.ar/fnet/mod/inversiones/NL-FondosSC.jsp";

            string localIp = GetLocalIpAddress();

            // setear el proxy
            bool useProxy = true;
            if (localIp.StartsWith(".."))
                useProxy = false;
            if (localIp.StartsWith(".."))
                useProxy = false;

            if (useProxy)
            {
                WebProxy proxyObject = new WebProxy("http://:/");
                proxyObject.UseDefaultCredentials = true;
                WebRequest.DefaultWebProxy = proxyObject;
            }

            var webReq = (HttpWebRequest)WebRequest.Create(url);
            webReq.Credentials = System.Net.CredentialCache.DefaultCredentials;

            var webResp = webReq.GetResponse();

            var reader = new StreamReader(webResp.GetResponseStream());

            string respuesta = reader.ReadToEnd();

            txResultado.Text = respuesta;

            // CARGA EL DOCUMENTO Y LO SUBE A UN DATATABLE
            var xmlDoc = new XmlDocument();
            var docNode = xmlDoc.CreateXmlDeclaration("1.0", "UTF-8", null);
            xmlDoc.AppendChild(docNode);
            var rootNode = xmlDoc.CreateElement("root");
            xmlDoc.AppendChild(rootNode);

            rootNode.InnerXml = respuesta;

            XmlNodeList select = xmlDoc.SelectNodes("//table");

            DataTable dtSalida = new DataTable();

            foreach (XmlNode elemento in select)
            {
                XmlNodeList selectRows = elemento.SelectNodes(".//tr");
                foreach (XmlNode row in selectRows)
                {
                    XmlNodeList selectHeader = row.SelectNodes(".//th");

                    if (selectHeader.Count > 0)
                    {
                        foreach (XmlNode header in selectHeader)
                        {
                            Type tipoDatos = typeof(string);
                            string nombre = header.InnerText.Trim().ToLower();
                            if (nombre.Equals("fondo") ||
                                nombre.Equals("moneda")
                                )
                            {
                                tipoDatos = typeof(string);
                            }
                            else if (nombre.Equals("precio", StringComparison.CurrentCultureIgnoreCase) )
                            {
                                tipoDatos = typeof(Decimal);
                            }
                            else if (   nombre.StartsWith("variaci") && nombre.EndsWith("n diaria")
                                     )
                            {
                                nombre = "variacion_dia";
                                tipoDatos = typeof(Decimal);
                            }
                            else if (  nombre.StartsWith("Variaci", StringComparison.CurrentCultureIgnoreCase) 
                                    && nombre.EndsWith("as", StringComparison.CurrentCultureIgnoreCase)
                                    )
                            {
                                nombre = "variacion_30_dias";
                                tipoDatos = typeof(Decimal);
                            }

                            dtSalida.Columns.Add(nombre, tipoDatos);
                        }
                        dtSalida.Columns.Add("variacion_anual", typeof(Decimal));
                    }
                    else
                    {
                        XmlNodeList selectCeldas = row.SelectNodes(".//td");
                        if (selectCeldas.Count > 0)
                        {
                            var dtRow = dtSalida.NewRow();
                            int i = 0;
                            foreach (XmlNode celda in selectCeldas)
                            {
                                string sValor = celda.InnerText;
                                Decimal dValor;
                                Type tipoDatos = dtSalida.Columns[i].DataType;
                                if (tipoDatos == typeof(string))
                                {
                                    dtRow[i] = sValor;
                                }
                                else if (tipoDatos == typeof(Decimal))
                                {
                                    if (dtSalida.Columns[i].ColumnName.Equals("precio"))
                                    {
                                        sValor = sValor.Replace(',', '.');
                                    }
                                    dValor = Decimal.Parse(sValor);
                                    dtRow[i] = dValor;
                                }

                                i++;
                            }
                            dtRow["variacion_anual"] = Decimal.Multiply((decimal)dtRow["variacion_30_dias"],new decimal(12.0));
                            dtSalida.Rows.Add(dtRow);
                        }
                    }
                }
            }
            dtFondos = dtSalida;

            gvResultado.DataSource = dtFondos;

            CalcularInversiones();

            ActualizarPrecios();

            GuardarHistoria();
        }

        private void Form1_Shown(object sender, EventArgs e)
        {
            CargaInicial();
            CalcularInversiones();
            btGet_Click(this, null);
        }

        private void CargaInicial()
        {
            dtInversion = new DataTable();
            dtInversion.Columns.Add("fondo", typeof(string));
            dtInversion.Columns.Add("comentario", typeof(string));
            dtInversion.Columns.Add("fecha_inicio", typeof(DateTime));
            dtInversion.Columns.Add("cuotas", typeof(decimal));
            dtInversion.Columns.Add("precio_inicial", typeof(decimal));
            dtInversion.Columns.Add("monto_inicial", typeof(decimal));
            dtInversion.Columns.Add("precio_actual", typeof(decimal));
            dtInversion.Columns.Add("monto_actual", typeof(decimal));

            dtInversion.Columns.Add("variacion", typeof(decimal));
            dtInversion.Columns.Add("var_porcent", typeof(decimal));
            dtInversion.Columns.Add("dias", typeof(decimal));
            dtInversion.Columns.Add("rendimiento", typeof(decimal));

            DataRow row;

            // FONDOS COMUN
            row = dtInversion.NewRow();
            row["fondo"] = "FBA BonAA";
            row["comentario"] = "Fondo Comun";
            row["fecha_inicio"] = new DateTime(2018, 11, 26);
            row["cuotas"] = 10939.7079;
            row["precio_inicial"] = 9.232422;
            dtInversion.Rows.Add(row);

            // FONDOS COMUN
            row = dtInversion.NewRow();
            row["fondo"] = "FBA BonAA";
            row["comentario"] = "Fondo Comun";
            row["fecha_inicio"] = new DateTime(2018, 12, 21);
            row["cuotas"] = 1775.2921;
            row["precio_inicial"] = 9.63;
            dtInversion.Rows.Add(row);


            row = dtInversion.NewRow();
            row["fondo"] = "TOTALES";
            dtInversion.Rows.Add(row);

            gvInversion.DataSource = dtInversion;
            gvInversion.Columns[0].Width = 80;
            gvInversion.Columns[1].Width = 80;
            gvInversion.Columns[2].Width = 80;

            gvInversion.Columns[3].Width = 75;
            gvInversion.Columns[3].DefaultCellStyle.Format = "#,##0.00";

            gvInversion.Columns[4].Width = 75;
            gvInversion.Columns[4].DefaultCellStyle.Format = "#,##0.0000";

            gvInversion.Columns[5].Width = 80;
            gvInversion.Columns[5].DefaultCellStyle.Format = "#,##0.00";

            gvInversion.Columns[6].Width = 75;
            gvInversion.Columns[6].DefaultCellStyle.Format = "#,##0.0000";

            gvInversion.Columns[7].Width = 80;
            gvInversion.Columns[7].DefaultCellStyle.Format = "#,##0.00";

            gvInversion.Columns[8].Width = 60;
            gvInversion.Columns[8].DefaultCellStyle.Format = "#,##0.00";

            gvInversion.Columns[9].Width = 60;
            gvInversion.Columns[9].DefaultCellStyle.Format = "0.00\\%";

            gvInversion.Columns[10].Width = 60;
            gvInversion.Columns[10].DefaultCellStyle.Format = "0";

            gvInversion.Columns[11].Width = 70;
            gvInversion.Columns[11].DefaultCellStyle.Format = "0.00\\%";
        }

        private void CalcularInversiones()
        {
            decimal TotalInicial=0;
            foreach (DataRow rowInv in dtInversion.Rows)
            {
                string fondo = (string)rowInv["fondo"];
                if (!fondo.ToLower().Equals("totales"))
                {
                    decimal cuotas = (decimal)rowInv["cuotas"];
                    decimal precio_inicial = (decimal)rowInv["precio_inicial"];
                    decimal monto_inicial = cuotas * precio_inicial;
                    rowInv["monto_inicial"] = monto_inicial;
                    TotalInicial += monto_inicial;
                }
                else
                {
                    rowInv["monto_inicial"] = TotalInicial;
                }
            }
        }

        private void ActualizarPrecios()
        {
            decimal TotalActual = 0;

            DateTime ult_cierre = DateTime.Now;

            if ( ult_cierre.TimeOfDay.Hours < 20 )
            {
                ult_cierre = ult_cierre.AddDays(-1);
            }
            ult_cierre = ult_cierre.Date;

            // Carga Precio y calcula valor actual
            foreach (DataRow rowInv in dtInversion.Rows)
            {
                string fondo = (string)rowInv["fondo"];
                if (!fondo.ToLower().Equals("totales"))
                {
                    DataRow[] rowsFondo = dtFondos.Select(string.Format("fondo='{0}'", fondo));
                    if (rowsFondo.Length > 0)
                    {
                        decimal cuotas = (decimal)rowInv["cuotas"];
                        decimal precio_actual = (decimal)rowsFondo[0]["precio"];
                        precio_actual /= 1000;
                        decimal monto_actual = cuotas * precio_actual;
                        rowInv["precio_actual"] = precio_actual;
                        rowInv["monto_actual"] = monto_actual;
                        TotalActual += monto_actual;
                    }
                }
                else
                {
                    rowInv["monto_actual"] = TotalActual;
                }
            }

            // Calcula variacion
            foreach (DataRow rowInv in dtInversion.Rows)
            {
                string fondo = (string)rowInv["fondo"];
                if (!fondo.ToLower().Equals("totales"))
                {
                    decimal monto_inicial, monto_actual;
                    monto_inicial = (decimal)rowInv["monto_inicial"];
                    monto_actual = (decimal)rowInv["monto_actual"];

                    decimal variacion = monto_actual - monto_inicial;
                    rowInv["variacion"] = variacion;

                    rowInv["var_porcent"] = variacion / monto_inicial * 100;

                    DateTime fecha_inicio = (DateTime)rowInv["fecha_inicio"];
                    int dias = ult_cierre.Subtract(fecha_inicio).Days;
                    rowInv["dias"] = dias;
                    if (dias != 0)
                    {
                        decimal rendimiento = ((variacion / monto_inicial) / dias) * 365 * 100;
                        rowInv["rendimiento"] = rendimiento;
                    }
                    else
                    {
                        rowInv["rendimiento"] = System.DBNull.Value;
                    }
                }
            }
        }

        private static string GetLocalIpAddress()
        {
            string hostName = Dns.GetHostName();
            IPHostEntry ip = Dns.GetHostEntry(hostName);
            List<String> lstIPLocal = new List<string>();
            List<String> lstIPOtras = new List<string>();
            foreach (var i in ip.AddressList) {
                if (i.AddressFamily == System.Net.Sockets.AddressFamily.InterNetwork )
                {
                    String sIP = i.ToString();

                    if (sIP.StartsWith("192.168."))
                    {
                        lstIPLocal.Add(sIP);
                    }
                    else
                    {
                        lstIPOtras.Add(sIP);
                    }
                }
            }

            if (lstIPOtras.Count > 0)
            {
                return lstIPOtras[0];
            }
            else if ( lstIPLocal.Count > 0)
            {
                return lstIPLocal[0];
            }

            //string IpAddress = Convert.ToString(ip.AddressList[2]);
            //return IpAddress.ToString();
            return null;
        }

        private void GuardarHistoria()
        {
            StreamWriter f = File.AppendText(@".\Fondo\histo.txt");

            DateTime dateTimeStat = DateTime.Now;
            DateTime dateStat = dateTimeStat.Date;

            if ( dateTimeStat.Hour < 20 )
            {
                dateStat = dateStat.AddDays(-1);
            }
            if ( dateStat.DayOfWeek == DayOfWeek.Sunday )
            {
                dateStat = dateStat.AddDays(-2);
            }
            else if ( dateStat.DayOfWeek == DayOfWeek.Saturday )
            {
                dateStat = dateStat.AddDays(-1);
            }

            string sDateTimeStat = dateTimeStat.ToString("yyy-MM-dd hh:mm:ss");
            string sDateStat = dateStat.ToString("yyy-MM-dd");

            foreach(DataRow dr in dtFondos.Rows)
            {
                string fondoId = (string)dr["fondo"];
                string moneda = (string)dr["moneda"];
                Decimal precio = (Decimal)dr["precio"];
                Decimal variacion_diaria = (Decimal)dr["variacion_dia"];
                Decimal variacion_30_dias = (Decimal)dr["variacion_30_dias"];
                Decimal variacion_anual = (Decimal)dr["variacion_anual"];

                f.WriteLine(string.Format("{0}\t{1}\t{2}\t{3}\t{4}\t{5}\t{6}\t{7}", sDateTimeStat, sDateStat, fondoId, moneda, precio, variacion_diaria, variacion_30_dias, variacion_anual ));

            }

            f.Close();
        }
    }

}
