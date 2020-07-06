using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Data;
using System.Drawing;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows.Forms;
using Outlook = Microsoft.Office.Interop.Outlook;

namespace EmailSearcher
{
    public partial class Form1 : Form
    {
        Outlook.Application myApp;
        Outlook.NameSpace mapiNameSpace;
        List<Outlook.MAPIFolder> allFolders;

        public Form1()
        {
            InitializeComponent();
        }

        private void Form1_Load(object sender, EventArgs e)
        {
        }

        private void Form1_Shown(object sender, EventArgs e)
        {
            loadOutlook();
            loadFolders();
            this.comboBox1.DataSource = allFolders;
            this.comboBox1.DisplayMember = "Name";
        }

        private void button1_Click(object sender, EventArgs e)
        {
            this.textBox1.Text = DateTime.Now.ToString() + "\r\n";

            Outlook.MAPIFolder selectedFolder = (Outlook.MAPIFolder)this.comboBox1.SelectedValue;

            List<Outlook.MAPIFolder> processFolders = new List<Outlook.MAPIFolder>();
            processFolders.Add(selectedFolder);

            foreach (Outlook.MAPIFolder folder in selectedFolder.Folders)
            {
                processFolders.Add(folder);
                foreach (Outlook.MAPIFolder subFolder_1 in folder.Folders)
                {
                    processFolders.Add(subFolder_1);
                    foreach (Outlook.MAPIFolder subFolder_2 in subFolder_1.Folders)
                    {
                        processFolders.Add(subFolder_2);
                        foreach (Outlook.MAPIFolder subFolder_3 in subFolder_2.Folders)
                        {
                            processFolders.Add(subFolder_3);
                        }
                    }
                }
            }

            foreach (Outlook.MAPIFolder folder in processFolders)
            {
                this.textBox1.AppendText(string.Format("Carpeta: {0}\r\n", folder.Name));
            }

            int totalItems = processFolders.Select<Outlook.MAPIFolder, int>(fld => fld.Items.Count).Aggregate<int>((a,b) => a+b );

            this.textBox1.AppendText(string.Format("Cant Items: {0}\r\n", totalItems));

            Dictionary<string, int> dictCuenta = new Dictionary<string, int>() ;
            DataTable dtMails = new DataTable();

            dtMails.Columns.Add("Carpeta", typeof(string));
            dtMails.Columns.Add("Id", typeof(int));
            dtMails.Columns.Add("EntryID", typeof(string));
            dtMails.Columns.Add("Message-ID", typeof(string));
            dtMails.Columns.Add("MessageClass", typeof(string));
            dtMails.Columns.Add("Sender", typeof(string));
            dtMails.Columns.Add("ReceivedTime", typeof(DateTime));
            dtMails.Columns.Add("Subject", typeof(string));
            this.dataGridView1.DataSource = null;


            foreach (Outlook.MAPIFolder folder in processFolders)
            {
                this.textBox1.AppendText(string.Format("Procesando Carpeta: {0}...\r\n", folder.Name));
                totalItems = folder.Items.Count;
                this.textBox1.AppendText(string.Format("    Cant Items: {0}\r\n", totalItems));
                for (int i = 1; i <= totalItems; i++)
                {
                    dynamic item = folder.Items[i];

                    var row = dtMails.NewRow();
                    row["Carpeta"] = folder.Name;
                    row["Id"] = i;

                    if (item is Outlook.MailItem)
                    {
                        Outlook.MailItem mail = (Outlook.MailItem)folder.Items[i];
                        //this.textBox1.AppendText(i.ToString() + ": (MAIL)\r\n");
                        //this.textBox1.AppendText(i.ToString() + ": " + mail.EntryID + "\r\n");
                        int cant = 0;
                        if (dictCuenta.TryGetValue(mail.EntryID, out cant))
                        {
                            dictCuenta[mail.EntryID] = cant + 1;
                        }
                        else
                        {
                            dictCuenta.Add(mail.EntryID, 1);
                        }
                        Outlook.PropertyAccessor pa = (Outlook.PropertyAccessor)mail.PropertyAccessor;

                        string[] headers = mail.Headers("Message-ID");
                        string message_id = string.Empty;
                        if (headers.Length > 0)
                        {
                            message_id = mail.Headers("Message-ID")[0];
                        }
                        else
                        {
                            message_id = "*";

                            StringBuilder text_to_hash = new StringBuilder(100000);
                            text_to_hash.Append(mail.To); text_to_hash.Append("\r\n...\r\n");
                            text_to_hash.Append(mail.CC); text_to_hash.Append("\r\n...\r\n");
                            text_to_hash.Append(mail.Subject); text_to_hash.Append("\r\n...\r\n");
                            text_to_hash.Append(mail.HTMLBody); text_to_hash.Append("\r\n...\r\n");
                            text_to_hash.Append(mail.Body); text_to_hash.Append("\r\n...\r\n");
                            text_to_hash.Append(mail.RTFBody); text_to_hash.Append("\r\n...\r\n");


                            var sha1 = new System.Security.Cryptography.SHA1Managed();
                            var hash = sha1.ComputeHash(Encoding.UTF8.GetBytes(text_to_hash.ToString()));
                            var str_hash = string.Join("", hash.Select(b => b.ToString("x2")).ToArray());

                            message_id = "HASH-" + str_hash;
                        }

                        row["EntryID"] = mail.EntryID;
                        row["Message-ID"] = message_id;
                        row["MessageClass"] = mail.MessageClass;
                        if (mail.Sender != null)
                        {
                            row["Sender"] = mail.Sender.Name;
                        }
                        row["ReceivedTime"] = mail.ReceivedTime;
                        row["Subject"] = mail.Subject;

                    }
                    else if (item is Outlook.MeetingItem)
                    {
                        Outlook.MeetingItem meeting = (Outlook.MeetingItem)item;
                        row["EntryID"] = meeting.EntryID;
                        row["Sender"] = meeting.SenderName;
                        row["MessageClass"] = meeting.MessageClass;
                        row["ReceivedTime"] = meeting.ReceivedTime;
                        row["Subject"] = meeting.Subject;
                        //this.textBox1.AppendText(i.ToString() + ": (MEETING)" + "\r\n");
                    }
                    else
                    {
                        row["EntryID"] = item.EntryID;
                        row["MessageClass"] = item.MessageClass;
                        try
                        {
                            row["ReceivedTime"] = item.ReceivedTime;
                        }
                        catch
                        {
                            try
                            {
                                row["ReceivedTime"] = item.CreationTime;
                            }
                            catch { }
                        }
                        row["Subject"] = item.Subject;
                        //this.textBox1.AppendText(i.ToString() + ": (OTRO)\r\n");
                    }
                    dtMails.Rows.Add(row);

                    if ( i % 100 == 0)
                    {
                        this.textBox1.AppendText(i + "... ");

                    }
                }
                this.textBox1.AppendText(totalItems + ".\r\n");
            }

            this.dataGridView1.DataSource = dtMails;

        }

        private void loadOutlook()
        {
            myApp = new Outlook.Application();
            mapiNameSpace = myApp.GetNamespace("MAPI");
        }

        private void loadFolders()
        {
            allFolders = new List<Outlook.MAPIFolder>();
            foreach (Outlook.MAPIFolder folder in mapiNameSpace.Folders)
            {
                allFolders.Add(folder);
            }
        }

        private void Form1_FormClosed(object sender, FormClosedEventArgs e)
        {
            object ae = myApp.ActiveExplorer();
            object ai = myApp.ActiveInspector();
            object aw = myApp.ActiveInspector();

            if ( ae == null )
            {
                myApp.Quit();
            }
        }
    }
}
