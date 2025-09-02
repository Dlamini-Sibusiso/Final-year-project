namespace ifm3bAPI.Models
{
    public class EmailSettings
    {
        public required string SmtpServer { get; set; }
        public int SmtpPort { get; set; }
        public required string SenderName { get; set; }
        public required string SenderEmail { get; set; }
        public required string SenderPassword { get; set; }
    }
}
