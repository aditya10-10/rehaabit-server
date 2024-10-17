exports.newEnquirySubmissionEmail = (firstName, enquiryId, serviceName) => {
  return `<!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <title>Enquiry Received</title>
        <style>
            body { font-family: 'Arial', sans-serif; background-color: #f9f9f9; color: #333; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 0 auto; padding: 40px; background-color: #ffffff; border-radius: 12px; box-shadow: 0 2px 15px rgba(0, 0, 0, 0.1); }
            .header img { max-width: 120px; margin-bottom: 20px; }
            .title { font-size: 24px; color: #00AF84; margin-bottom: 20px; font-weight: bold; }
            .content { font-size: 16px; color: #555; margin-bottom: 30px; line-height: 1.7; }
            .footer { font-size: 14px; color: #888; margin-top: 40px; }
            .footer a { color: #00AF84; text-decoration: none; }
        </style>
    </head>
    <body>
        <div class="container" style="text-align: center;">
            <div class="header">
                <img src="https://i.postimg.cc/26wycnzk/Frame-45-removebg-preview-1.png" alt="Rehaabit Logo"/>
            </div>
            <div class="title">Thank You for Your Enquiry, ${firstName}! ✨</div>
            <div class="content">
                <p>Hi ${firstName},</p>
                <p>We’re happy to let you know that we’ve received your enquiry (Enquiry ID: <strong>${enquiryId}</strong>) about <strong>${serviceName}</strong>. Our team is already on it, and we’ll get back to you as soon as possible! 🚀</p>
                <p>We truly appreciate your interest in our services, and we’re here to make the process as smooth as possible for you. Your satisfaction is our priority. 😄</p>
                
                
            </div>
            <div class="footer">
              <p>If there’s anything else you’d like to add or ask, feel free to reach out to us at <a href="mailto:support@rehaabit.com">support@rehaabit.com</a>.</p>
                <p>Thank you for choosing Rehaabit! We’re excited to assist you with your enquiry! 😊</p>
            </div>
        </div>
    </body>
    </html>`;
};
