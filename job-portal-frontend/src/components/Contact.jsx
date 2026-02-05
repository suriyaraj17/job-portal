import Navbar from "../components/Navbar";

export default function Contact() {
  return (
    <>
      <Navbar />
      <div className="container mt-5" style={{ maxWidth: "700px" }}>
        <div className="card shadow-sm p-4">
          <h3 className="mb-3">Contact Support</h3>
          <p className="text-muted">
            If you face any issues while using the Job Portal, feel free to contact us.
          </p>

          <hr />

          <h5>📧 Email Support</h5>
          <p>
            <a href="mailto:admin@jobportal.com">admin@jobportal.com</a>
          </p>

          <h5 className="mt-3">📞 Phone Support</h5>
          <p>+91 98765 43210</p>

          <h5 className="mt-3">⏰ Support Hours</h5>
          <p>Monday – Saturday, 9:00 AM – 6:00 PM</p>

          <div className="alert alert-info mt-3">
            Please include your account email and issue details when contacting support.
          </div>
        </div>
      </div>
    </>
  );
}