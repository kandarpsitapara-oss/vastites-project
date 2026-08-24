export default {
  async afterCreate(event: any) {
    const { result } = event;

    try {
      await strapi.plugin('email').service('email').send({
        to: process.env.SMTP_TO,
        from: process.env.SMTP_FROM,
        replyTo: result.email,
        subject: `New Contact Form Submission – ${result.interested_in || 'General Inquiry'}`,
        html: `
          <h2>New Contact Form Submission</h2>
          <p><strong>Name:</strong> ${result.name}</p>
          <p><strong>Email:</strong> ${result.email}</p>
          <p><strong>Interested In:</strong> ${result.interested_in || 'N/A'}</p>
          <p><strong>Project Details:</strong></p>
          <p>${result.project_details || 'N/A'}</p>
        `,
      });
    } catch (err) {
      strapi.log.error('Failed to send contact form email:', err);
    }
  },
};
