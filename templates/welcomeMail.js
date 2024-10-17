exports.welcomeEmail = () => {
  return `<!DOCTYPE html>
    <html lang="en">
    
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <title>Welcome to Rehaabit</title>
        <style>
            body {
                margin: 0;
                padding: 0;
                background-color: #f9f9f9;
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
  
            .banner {
                width: 100%;
                border-radius: 8px;
                margin-bottom: 20px;
            }
  
            .content {
                font-size: 16px;
                color: #555;
                margin-bottom: 30px;
                line-height: 1.5;
                text-align: left;
            }
  
            .content strong {
                color: #00AF84;
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
  
            .highlight ul li span {
                color: #FF6F61;
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
  
                .highlight h3 {
                    font-size: 16px;
                }
  
                .highlight ul li {
                    font-size: 14px;
                }
  
                .header img {
                    max-width: 150px;
                }
            }
        </style>
    </head>
    
    <body>
        <div class="container">
            <!-- Logo and Header -->
            <div class="header">
                <img src='https://i.postimg.cc/26wycnzk/Frame-45-removebg-preview-1.png' border='0' alt='Rehaabit Logo'/>
                <div class="title">Welcome to Rehaabit!</div>
                <div class="subtext">We’re delighted to have you onboard. Let’s get started on making your home shine with expert service professionals.</div>
            </div>
  
            <!-- Main Content -->
            <div class="content">
                <p>Hi there,</p>
                <p>Welcome to <strong>Rehaabit</strong>, your trusted platform for connecting with skilled home service professionals.</p>
                <p>Whether you're in need of cleaning, plumbing, electrical repairs, or a handyman, we've got the right experts to take care of it all. Our goal is to simplify the process of finding reliable home services so that you can focus on what matters most.</p>
                <p>At Rehaabit, we ensure every professional is vetted, certified, and ready to deliver top-quality service, giving you peace of mind with every booking.</p>
                <p>We’re excited to support you in making your home the best it can be, with fast, efficient, and professional services tailored to your needs.</p>
            </div>
  
            <!-- Why Rehaabit Section -->
            <div class="highlight">
                <h3>Why Choose Rehaabit?</h3>
                <ul>
                    <li><span>✔</span> Trusted, Vetted Professionals</li>
                    <li><span>✔</span> Seamless, Quick Bookings</li>
                    <li><span>✔</span> Transparent and Fair Pricing</li>
                    <li><span>✔</span> 24/7 Customer Support</li>
                </ul>
            </div>
  
            <!-- Call to Action -->
            <a href="https://www.rehaabit.com/" class="cta-button">Explore Our Services</a>
  
            <!-- Footer Section -->
            <div class="footer">
                <p>Need assistance? Reach out to us at <a href="mailto:support@rehaabit.com">support@rehaabit.com</a>.</p>
                <p>We’re here to ensure your experience with Rehaabit is smooth and hassle-free.</p>
            </div>
        </div>
    </body>
    
    </html>`;
};
