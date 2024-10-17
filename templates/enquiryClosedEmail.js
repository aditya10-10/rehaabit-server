exports.enquiryClosedEmail = (enquiryId, serviceName) => {
  return `<!DOCTYPE html>
      <html lang="en">
      
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <meta http-equiv="X-UA-Compatible" content="IE=edge">
          <title>Enquiry Closed - Rehaabit</title>
          <style>
              body {
                  margin: 0;
                  padding: 0;
                  background-color: #f4f4f4;
                  font-family: 'Arial', sans-serif;
                  color: #333;
                  line-height: 1.6;
              }
  
              .container {
                  max-width: 600px;
                  margin: 0 auto;
                  background-color: #ffffff;
                  padding: 40px;
                  border-radius: 8px;
                  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
                  text-align: center;
              }
  
              .header {
                  padding-bottom: 20px;
                  border-bottom: 1px solid #ececec;
                  margin-bottom: 20px;
              }
  
              .header img {
                  max-width: 180px;
                  width: 100%;
                  height: auto;
                  margin-bottom: 20px;
              }
  
              .title {
                  font-size: 24px;
                  color: #333;
                  font-weight: 700;
                  margin-bottom: 15px;
              }
  
              .subtext {
                  color: #555;
                  font-size: 16px;
                  margin-bottom: 30px;
                  line-height: 1.5;
              }
  
              .content {
                  font-size: 16px;
                  color: #555;
                  margin-bottom: 30px;
                  line-height: 1.5;
                  text-align: left;
              }
  
              .cta-button {
                  display: inline-block;
                  padding: 15px 30px;
                  background-color: #FF6F61;
                  color: #ffffff;
                  font-size: 16px;
                  font-weight: bold;
                  border-radius: 30px;
                  text-decoration: none;
                  text-transform: uppercase;
                  margin-top: 20px;
                  letter-spacing: 1px;
              }
  
              .footer {
                  font-size: 14px;
                  color: #888;
                  margin-top: 30px;
              }
  
              .footer a {
                  color: #FF6F61;
                  text-decoration: none;
              }
  
              @media screen and (max-width: 600px) {
                  .container {
                      padding: 20px;
                  }
  
                  .cta-button {
                      width: 100%;
                      font-size: 18px;
                      padding: 12px 0;
                  }
              }
          </style>
      </head>
  
      <body>
          <div class="container">
              <!-- Logo and Header -->
              <div class="header">
                  <img src='https://i.postimg.cc/26wycnzk/Frame-45-removebg-preview-1.png' border='0' alt='Rehaabit Logo'/>
                  <div class="title">Enquiry Closed</div>
                  <div class="subtext">We would like to inform you that your enquiry for the service "<strong>${serviceName}</strong>" has been successfully closed.</div>
              </div>
  
              <!-- Main Content -->
              <div class="content">
                  <p>Hi there,</p>
                  <p>Your enquiry with ID <strong>${enquiryId}</strong> for the service "<strong>${serviceName}</strong>" has been closed. We hope your enquiry has been resolved to your satisfaction.</p>
                  <p>If you have any further questions or need assistance, please don't hesitate to get in touch with our support team. We are always happy to help!</p>
                  <p>Thank you for reaching out to us, and we hope we were able to assist you satisfactorily.</p>
              </div>
  
              <!-- Contact Section -->
              <a href="mailto:support@rehaabit.com"class="cta-button">Contact Support</a>
  
              <!-- Footer Section -->
              <div class="footer">
                  <p>If you need further assistance, feel free to contact us at <a href="mailto:support@rehaabit.com">support@rehaabit.com</a>.</p>
                  <p>Thank you for choosing Rehaabit, and we look forward to serving you in the future.</p>
              </div>
          </div>
      </body>
      
      </html>`;
};
