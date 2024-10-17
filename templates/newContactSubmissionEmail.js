exports.newContactSubmissionEmail = (firstName, caseId, subject) => {
  return `<!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <meta http-equiv="X-UA-Compatible" content="IE=edge">
          <title>Contact Inquiry Received</title>
          <style>
              body { font-family: 'Arial', sans-serif; background-color: #f9f9f9; color: #333; margin: 0; padding: 0; }
              .container { max-width: 600px; margin: 0 auto; padding: 40px; background-color: #ffffff; border-radius: 12px; box-shadow: 0 2px 15px rgba(0, 0, 0, 0.1); }
              .header img { max-width: 120px; margin-bottom: 20px; }
              .title { font-size: 24px; color: #00AF84; margin-bottom: 20px; font-weight: bold; }
              .content { font-size: 16px; color: #555; margin-bottom: 30px; line-height: 1.7; }
              .footer { font-size: 14px; color: #888; margin-top: 30px; text-align: center; }
              .footer a { color: #00AF84; text-decoration: none; font-weight: bold; }
          </style>
      </head>
      <body>
          <div class="container" style="text-align: center;">
              <div class="header">
                  <img src="https://i.postimg.cc/26wycnzk/Frame-45-removebg-preview-1.png" alt="Rehaabit Logo"/>
              </div>
              <div class="title">We’ve Received Your Message, ${firstName}! 💬</div>
              <div class="content">
                  <p>Hello ${firstName},</p>
                  <p>Thank you for reaching out to us! Your inquiry (Case ID: <strong>${caseId}</strong>) regarding <strong>${subject}</strong> has been received, and we’re already reviewing it. 🙌</p>
                  <p>We understand how important this is to you, and our support team will get back to you as soon as possible. We’re always here to help and make sure you have a smooth experience with Rehaabit! 😊</p>
  
                  
              </div>
              <div class="footer">
                <p>In the meantime, if you have any urgent questions, feel free to reach out to us directly at <a href="mailto:support@rehaabit.com">support@rehaabit.com</a>.</p>
                  <p>Thank you for choosing Rehaabit! We’re excited to assist you! 🎉</p>
              </div>
          </div>
      </body>
      </html>`;
};
