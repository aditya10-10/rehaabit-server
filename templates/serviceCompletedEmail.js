exports.serviceCompletedEmail = (serviceName, ratingLink) => {
  return `<!DOCTYPE html>
        <html lang="en">
        
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <meta http-equiv="X-UA-Compatible" content="IE=edge">
            <title>Service Completed - Rehaabit</title>
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
      
                .highlight {
                    background-color: #FFDA54;
                    padding: 20px;
                    border-radius: 8px;
                    text-align: left;
                    margin-bottom: 20px;
                }
      
                .highlight h3 {
                    font-size: 18px;
                    color: #6820B7;
                    margin-bottom: 10px;
                }
      
                .highlight ul {
                    list-style-type: none;
                    padding: 0;
                    margin: 0;
                    color: #333;
                }
      
                .highlight ul li {
                    font-size: 16px;
                    margin-bottom: 10px;
                }
      
                .cta-button {
                    display: inline-block;
                    padding: 15px 30px;
                    background-color: #00AF84;
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
                    color: #00AF84;
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
                    <div class="title">Service Completed</div>
                    <div class="subtext">We're pleased to inform you that your service has been successfully completed. We hope you're happy with the results!</div>
                </div>
      
                <!-- Main Content -->
                <div class="content">
                    <p>Hello,</p>
                    <p>We are delighted to let you know that your <strong>${serviceName}</strong> service has been completed.</p>
                    <p>Thank you for choosing Rehaabit! We trust that everything went smoothly, and we hope the service met your expectations.</p>
                </div>
      
                <!-- Feedback Section -->
                <div class="highlight">
                    <h3>We Value Your Feedback!</h3>
                    <p>We’d love to hear how your experience was. Please take a moment to rate the service and share your thoughts with us.</p>
                    <a href="${ratingLink}" class="cta-button">Rate the Service</a>
                </div>
      
                <!-- Footer Section -->
                <div class="footer">
                    <p>If you have any questions or need assistance, feel free to contact us at <a href="mailto:support@rehaabit.com">support@rehaabit.com</a>.</p>
                    <p>Thank you again for trusting Rehaabit for your home service needs.</p>
                </div>
            </div>
        </body>
        
        </html>`;
};
