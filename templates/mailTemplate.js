exports.welcomeEmail = () => {
  return `<!DOCTYPE html>
    <html>
    
    <head>
        <meta charset="UTF-8">
        <title>Welcome to Rahaabit!</title>
        <style>
            body {
                background-color: #ffffff;
                font-family: Arial, sans-serif;
                font-size: 16px;
                line-height: 1.4;
                color: #333333;
                margin: 0;
                padding: 0;
            }
    
    
            .container {
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
                text-align: center;
            }
    
            .logo {
                max-width: 200px;
                margin-bottom: 20px;
            }
    
            .message {
                font-size: 18px;
                font-weight: bold;
                margin-bottom: 20px;
            }
    
            .body {
                font-size: 16px;
                margin-bottom: 20px;
            }
    
            .cta {
                display: inline-block;
                padding: 10px 20px;
                background-color: #FFD60A;
                color: #000000;
                text-decoration: none;
                border-radius: 5px;
                font-size: 16px;
                font-weight: bold;
                margin-top: 20px;
            }
    
            .support {
                font-size: 14px;
                color: #999999;
                margin-top: 20px;
            }
    
            .highlight {
                font-weight: bold;
            }
        </style>
    
    </head>
    
    <body>
        <div class="container">
            <a href="https://rahaabit.com/"><img class="logo" src="https://i.ibb.co/MGf9Ghg/Untitled-design.png"
                    alt="StudyNotion Logo"></a>
            <div class="message">Welcome to Rahaabit!</div>
            <div class="body">
                <p>Dear Sir/Madam,</p>
                <p>We're thrilled to announce that something incredible is on the horizon! Our team at Rehaabit has been working tirelessly behind the scenes to bring you something truly special, and we can't wait to share it with you.</p>
                <p>As we put the finishing touches on our project, we want to ensure you're among the first to know when we officially launch. Be the first to experience the excitement by signing up below to receive exclusive updates and notifications.</p>
                <p>Stay tuned for more details and sneak peeks as we get closer to the big day. We're beyond excited to unveil what we've been working on and to have you join us on this journey.</p>
                <p>Thank you for your continued support!</p>
            </div>
            <div class="support">Explore, connect, and make the most out of your experience. If you need any help, just give us a shout.<a
                    href="mailto:admin@rehaabit.com"> admin@rehaabit.com</a>. We are here to help!</div>
        </div>
    </body>
    
    </html>`;
};
