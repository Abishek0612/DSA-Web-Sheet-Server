export const emailTemplates = {
  welcome: (name: string) => `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to DSA Sheet</title>
        <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f5f5f5; }
            .container { max-width: 600px; margin: 0 auto; background-color: white; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center; }
            .logo { color: white; font-size: 28px; font-weight: bold; margin-bottom: 10px; }
            .header-text { color: white; font-size: 18px; margin: 0; }
            .content { padding: 40px 20px; }
            .welcome-title { color: #333; font-size: 24px; margin-bottom: 20px; text-align: center; }
            .welcome-text { color: #666; font-size: 16px; line-height: 1.6; margin-bottom: 30px; }
            .cta-button { display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; padding: 15px 30px; border-radius: 8px; font-weight: bold; margin: 20px 0; }
            .features { margin: 30px 0; }
            .feature { margin: 15px 0; padding: 15px; background-color: #f8f9fa; border-radius: 8px; }
            .feature-title { color: #333; font-weight: bold; margin-bottom: 5px; }
            .feature-desc { color: #666; font-size: 14px; }
            .footer { background-color: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 14px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="logo">DSA Sheet</div>
                <p class="header-text">Your Journey to Master Data Structures & Algorithms</p>
            </div>
            <div class="content">
                <h1 class="welcome-title">Welcome, ${name}! 🎉</h1>
                <p class="welcome-text">
                    Thank you for joining DSA Sheet! We're excited to help you master Data Structures and Algorithms 
                    through our comprehensive learning platform.
                </p>
                
                <div style="text-align: center;">
                    <a href="${process.env.CLIENT_URL}/dashboard" class="cta-button">Start Learning Now</a>
                </div>
                
                <div class="features">
                    <div class="feature">
                        <div class="feature-title">📚 Structured Learning Path</div>
                        <div class="feature-desc">Follow our carefully curated topics from basic to advanced levels</div>
                    </div>
                    <div class="feature">
                        <div class="feature-title">🤖 AI-Powered Assistance</div>
                        <div class="feature-desc">Get instant help with our AI research assistant and problem generator</div>
                    </div>
                    <div class="feature">
                        <div class="feature-title">📊 Progress Tracking</div>
                        <div class="feature-desc">Monitor your learning journey with detailed analytics and streak tracking</div>
                    </div>
                    <div class="feature">
                        <div class="feature-title">💡 Smart Hints & Solutions</div>
                        <div class="feature-desc">Get contextual hints and explanations for every problem</div>
                    </div>
                </div>
                
                <p class="welcome-text">
                    Ready to start your coding journey? Head over to your dashboard and begin with your first topic!
                </p>
            </div>
            <div class="footer">
                <p>Happy Coding! 🚀<br>The DSA Sheet Team</p>
                <p style="margin-top: 15px; font-size: 12px;">
                    If you have any questions, feel free to reach out to our support team.
                </p>
            </div>
        </div>
    </body>
    </html>
  `,

  passwordReset: (resetUrl: string) => `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reset Your Password - DSA Sheet</title>
        <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f5f5f5; }
            .container { max-width: 600px; margin: 0 auto; background-color: white; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center; }
            .logo { color: white; font-size: 28px; font-weight: bold; margin-bottom: 10px; }
            .content { padding: 40px 20px; }
            .title { color: #333; font-size: 24px; margin-bottom: 20px; text-align: center; }
            .text { color: #666; font-size: 16px; line-height: 1.6; margin-bottom: 30px; }
            .cta-button { display: inline-block; background: #dc3545; color: white; text-decoration: none; padding: 15px 30px; border-radius: 8px; font-weight: bold; margin: 20px 0; }
            .warning { background-color: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 8px; margin: 20px 0; }
            .footer { background-color: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 14px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="logo">DSA Sheet</div>
            </div>
            <div class="content">
                <h1 class="title">Reset Your Password 🔐</h1>
                <p class="text">
                    We received a request to reset your password. Click the button below to create a new password:
                </p>
                
                <div style="text-align: center;">
                    <a href="${resetUrl}" class="cta-button">Reset Password</a>
                </div>
                
                <div class="warning">
                    <strong>⚠️ Security Notice:</strong><br>
                    This link will expire in 1 hour for security reasons. If you didn't request this password reset, 
                    please ignore this email or contact our support team.
                </div>
                
                <p class="text">
                    If the button doesn't work, copy and paste this link into your browser:<br>
                    <a href="${resetUrl}">${resetUrl}</a>
                </p>
            </div>
            <div class="footer">
                <p>Stay secure! 🛡️<br>The DSA Sheet Team</p>
            </div>
        </div>
    </body>
    </html>
  `,

  streakReminder: (name: string, currentStreak: number) => `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Don't Break Your Streak! - DSA Sheet</title>
        <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f5f5f5; }
            .container { max-width: 600px; margin: 0 auto; background-color: white; }
            .header { background: linear-gradient(135deg, #ff9a9e 0%, #fecfef 50%, #fecfef 100%); padding: 40px 20px; text-align: center; }
            .logo { color: #333; font-size: 28px; font-weight: bold; margin-bottom: 10px; }
            .content { padding: 40px 20px; }
            .title { color: #333; font-size: 24px; margin-bottom: 20px; text-align: center; }
            .streak-number { font-size: 48px; font-weight: bold; color: #ff6b6b; text-align: center; margin: 20px 0; }
            .text { color: #666; font-size: 16px; line-height: 1.6; margin-bottom: 30px; }
            .cta-button { display: inline-block; background: linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%); color: #333; text-decoration: none; padding: 15px 30px; border-radius: 8px; font-weight: bold; margin: 20px 0; }
            .footer { background-color: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 14px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="logo">DSA Sheet</div>
            </div>
            <div class="content">
                <h1 class="title">Don't Break Your Streak! 🔥</h1>
                <div class="streak-number">${currentStreak} Days</div>
                <p class="text">
                    Hey ${name}! You're on an amazing ${currentStreak}-day solving streak. Don't let it end today!
                </p>
                <p class="text">
                    Just solve one problem to keep your momentum going. Every day counts towards building your 
                    coding skills and achieving your goals.
                </p>
                
                <div style="text-align: center;">
                    <a href="${process.env.CLIENT_URL}/topics" class="cta-button">Solve a Problem Now</a>
                </div>
                
                <p class="text">
                    Remember: Consistency is key to mastering Data Structures and Algorithms. 
                    Keep up the great work! 💪
                </p>
            </div>
            <div class="footer">
                <p>Keep the streak alive! 🚀<br>The DSA Sheet Team</p>
            </div>
        </div>
    </body>
    </html>
  `,

  achievement: (name: string, achievement: string) => `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Achievement Unlocked! - DSA Sheet</title>
        <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f5f5f5; }
            .container { max-width: 600px; margin: 0 auto; background-color: white; }
            .header { background: linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%); padding: 40px 20px; text-align: center; }
            .logo { color: #333; font-size: 28px; font-weight: bold; margin-bottom: 10px; }
            .content { padding: 40px 20px; }
            .title { color: #333; font-size: 24px; margin-bottom: 20px; text-align: center; }
            .achievement-badge { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 15px; text-align: center; margin: 30px 0; font-size: 18px; font-weight: bold; }
            .text { color: #666; font-size: 16px; line-height: 1.6; margin-bottom: 30px; }
            .cta-button { display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; padding: 15px 30px; border-radius: 8px; font-weight: bold; margin: 20px 0; }
            .footer { background-color: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 14px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="logo">DSA Sheet</div>
            </div>
            <div class="content">
                <h1 class="title">🎉 Achievement Unlocked!</h1>
                <p class="text">
                    Congratulations, ${name}! You've just earned a new achievement:
                </p>
                
                <div class="achievement-badge">
                    🏆 ${achievement}
                </div>
                
                <p class="text">
                    This is a testament to your dedication and hard work. Keep pushing forward and you'll 
                    continue to achieve great things in your coding journey!
                </p>
                
                <div style="text-align: center;">
                    <a href="${process.env.CLIENT_URL}/profile" class="cta-button">View Your Progress</a>
                </div>
                
                <p class="text">
                    Share your achievement with friends and inspire others to start their own coding journey!
                </p>
            </div>
            <div class="footer">
                <p>Well done! 🌟<br>The DSA Sheet Team</p>
            </div>
        </div>
    </body>
    </html>
  `,

  weeklyProgress: (name: string, stats: any) => `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Your Weekly Progress Report - DSA Sheet</title>
        <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f5f5f5; }
            .container { max-width: 600px; margin: 0 auto; background-color: white; }
            .header { background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%); padding: 40px 20px; text-align: center; }
            .logo { color: #333; font-size: 28px; font-weight: bold; margin-bottom: 10px; }
            .content { padding: 40px 20px; }
            .title { color: #333; font-size: 24px; margin-bottom: 20px; text-align: center; }
            .stats-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 30px 0; }
            .stat-card { background-color: #f8f9fa; padding: 20px; border-radius: 10px; text-align: center; }
            .stat-number { font-size: 32px; font-weight: bold; color: #667eea; }
            .stat-label { color: #666; font-size: 14px; margin-top: 5px; }
            .text { color: #666; font-size: 16px; line-height: 1.6; margin-bottom: 30px; }
            .cta-button { display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; padding: 15px 30px; border-radius: 8px; font-weight: bold; margin: 20px 0; }
            .footer { background-color: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 14px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="logo">DSA Sheet</div>
            </div>
            <div class="content">
                <h1 class="title">📊 Your Weekly Progress Report</h1>
                <p class="text">
                    Hey ${name}! Here's a summary of your coding activity this week:
                </p>
                
                <div class="stats-grid">
                    <div class="stat-card">
                        <div class="stat-number">${stats.problemsSolved}</div>
                        <div class="stat-label">Problems Solved</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-number">${Math.floor(
                          stats.timeSpent / 60
                        )}h</div>
                        <div class="stat-label">Time Spent</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-number">${stats.topicsStudied}</div>
                        <div class="stat-label">Topics Studied</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-number">${stats.streakDays}</div>
                        <div class="stat-label">Streak Days</div>
                    </div>
                </div>
                
                <p class="text">
                    ${
                      stats.problemsSolved > 10
                        ? "Fantastic work! You're making excellent progress."
                        : "Keep going! Every problem solved is a step forward."
                    }
                </p>
                
                <div style="text-align: center;">
                    <a href="${
                      process.env.CLIENT_URL
                    }/progress" class="cta-button">View Detailed Analytics</a>
                </div>
                
                <p class="text">
                    Remember: Consistency beats intensity. Keep up the great work and maintain your momentum!
                </p>
            </div>
            <div class="footer">
                <p>Keep coding! 💻<br>The DSA Sheet Team</p>
            </div>
        </div>
    </body>
    </html>
  `,
};
