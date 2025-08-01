// client/src/pages/contact.js

export const renderContactPage = (container) => {
  container.innerHTML = `
    <section class="page-section">
      <div class="container">
        <h2>Contact Us</h2>
        <form id="contact-form" class="auth-form">
          <div class="form-group">
            <label for="name">Name:</label>
            <input type="text" id="name" name="name" required>
          </div>
          <div class="form-group">
            <label for="email">Email:</label>
            <input type="email" id="email" name="email" required>
          </div>
          <div class="form-group">
            <label for="message">Message:</label>
            <textarea id="message" name="message" rows="5" required></textarea>
          </div>
          <button type="submit" class="btn primary-btn">Send Message</button>
        </form>
      </div>
    </section>
  `;
};
