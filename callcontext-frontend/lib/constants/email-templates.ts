export const EMAIL_TEMPLATES = {
  holiday_promo: {
    name: 'Holiday Promotion',
    subject: '🎁 Special Holiday Offer from {{shop_name}}',
    html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Holiday Promotion</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f9fafb;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 0;">
        <table role="presentation" style="width: 600px; max-width: 100%; border-collapse: collapse; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%); padding: 40px 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: 700;">🎁 Holiday Special</h1>
            </td>
          </tr>
          <!-- Hero Image Placeholder -->
          <tr>
            <td style="padding: 0;">
              <div style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); height: 200px; display: flex; align-items: center; justify-content: center;">
                <span style="font-size: 80px;">🎄</span>
              </div>
            </td>
          </tr>
          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <h2 style="margin: 0 0 20px; color: #1f2937; font-size: 24px; font-weight: 600;">Hi {{first_name}},</h2>
              <p style="margin: 0 0 16px; color: #4b5563; font-size: 16px; line-height: 1.6;">
                This holiday season, we're spreading joy with an exclusive offer just for you!
              </p>
              <p style="margin: 0 0 24px; color: #4b5563; font-size: 16px; line-height: 1.6;">
                Enjoy <strong style="color: #dc2626;">special discounts</strong> on your favorite products and services.
              </p>
              <!-- CTA Button -->
              <table role="presentation" style="margin: 0 auto;">
                <tr>
                  <td style="border-radius: 6px; background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);">
                    <a href="#" style="display: inline-block; padding: 16px 32px; color: #ffffff; text-decoration: none; font-size: 16px; font-weight: 600;">
                      Shop Now
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0 0 8px; color: #6b7280; font-size: 14px;">
                Thanks for being a valued customer!
              </p>
              <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                {{shop_name}} | <a href="#" style="color: #9ca3af; text-decoration: underline;">Unsubscribe</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
  },
  birthday: {
    name: 'Birthday Greeting',
    subject: '🎂 Happy Birthday from {{shop_name}}!',
    html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Happy Birthday</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f9fafb;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 0;">
        <table role="presentation" style="width: 600px; max-width: 100%; border-collapse: collapse; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #ec4899 0%, #db2777 100%); padding: 50px 30px; text-align: center;">
              <div style="font-size: 60px; margin-bottom: 16px;">🎂</div>
              <h1 style="margin: 0; color: #ffffff; font-size: 36px; font-weight: 700;">Happy Birthday!</h1>
            </td>
          </tr>
          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px; text-align: center;">
              <h2 style="margin: 0 0 20px; color: #1f2937; font-size: 24px; font-weight: 600;">Dear {{first_name}},</h2>
              <p style="margin: 0 0 16px; color: #4b5563; font-size: 16px; line-height: 1.6;">
                Wishing you a fantastic birthday filled with joy, laughter, and wonderful moments!
              </p>
              <p style="margin: 0 0 24px; color: #4b5563; font-size: 16px; line-height: 1.6;">
                As a special gift, we'd like to offer you <strong style="color: #ec4899;">20% off</strong> your next purchase.
              </p>
              <!-- Gift Box -->
              <div style="background: linear-gradient(135deg, #fce7f3 0%, #fbcfe8 100%); padding: 30px; border-radius: 8px; margin: 24px 0;">
                <div style="font-size: 48px; margin-bottom: 12px;">🎁</div>
                <p style="margin: 0; color: #831843; font-size: 20px; font-weight: 600;">YOUR BIRTHDAY GIFT</p>
                <p style="margin: 8px 0 0; color: #be185d; font-size: 14px;">Use code: <strong>BIRTHDAY20</strong></p>
              </div>
              <!-- CTA Button -->
              <table role="presentation" style="margin: 24px auto 0;">
                <tr>
                  <td style="border-radius: 6px; background: linear-gradient(135deg, #ec4899 0%, #db2777 100%);">
                    <a href="#" style="display: inline-block; padding: 16px 32px; color: #ffffff; text-decoration: none; font-size: 16px; font-weight: 600;">
                      Redeem Your Gift
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0 0 8px; color: #6b7280; font-size: 14px;">
                Have a wonderful birthday!
              </p>
              <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                {{shop_name}} | <a href="#" style="color: #9ca3af; text-decoration: underline;">Unsubscribe</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
  },
  thank_you: {
    name: 'Thank You',
    subject: 'Thank you, {{first_name}}!',
    html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Thank You</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f9fafb;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 0;">
        <table role="presentation" style="width: 600px; max-width: 100%; border-collapse: collapse; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 50px 30px; text-align: center;">
              <div style="font-size: 60px; margin-bottom: 16px;">💚</div>
              <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: 700;">Thank You!</h1>
            </td>
          </tr>
          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <h2 style="margin: 0 0 20px; color: #1f2937; font-size: 24px; font-weight: 600;">Hi {{first_name}},</h2>
              <p style="margin: 0 0 16px; color: #4b5563; font-size: 16px; line-height: 1.6;">
                We wanted to take a moment to say <strong style="color: #10b981;">thank you</strong> for being an amazing customer.
              </p>
              <p style="margin: 0 0 16px; color: #4b5563; font-size: 16px; line-height: 1.6;">
                Your support means the world to us, and we're grateful to have you as part of our community.
              </p>
              <p style="margin: 0 0 24px; color: #4b5563; font-size: 16px; line-height: 1.6;">
                We're always here if you need anything. Don't hesitate to reach out!
              </p>
              <!-- Appreciation Box -->
              <div style="background-color: #d1fae5; padding: 24px; border-radius: 8px; border-left: 4px solid #10b981;">
                <p style="margin: 0; color: #065f46; font-size: 16px; font-style: italic; line-height: 1.6;">
                  "Your trust and loyalty inspire us to do better every day."
                </p>
              </div>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0 0 8px; color: #6b7280; font-size: 14px;">
                With gratitude,
              </p>
              <p style="margin: 0 0 8px; color: #374151; font-size: 14px; font-weight: 600;">
                The {{shop_name}} Team
              </p>
              <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                <a href="#" style="color: #9ca3af; text-decoration: underline;">Unsubscribe</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
  },
  win_back: {
    name: 'Win-Back',
    subject: 'We miss you, {{first_name}}',
    html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>We Miss You</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f9fafb;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 0;">
        <table role="presentation" style="width: 600px; max-width: 100%; border-collapse: collapse; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%); padding: 50px 30px; text-align: center;">
              <div style="font-size: 60px; margin-bottom: 16px;">💜</div>
              <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: 700;">We Miss You!</h1>
            </td>
          </tr>
          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <h2 style="margin: 0 0 20px; color: #1f2937; font-size: 24px; font-weight: 600;">Hi {{first_name}},</h2>
              <p style="margin: 0 0 16px; color: #4b5563; font-size: 16px; line-height: 1.6;">
                It's been a while since we last saw you, and we wanted to reach out.
              </p>
              <p style="margin: 0 0 16px; color: #4b5563; font-size: 16px; line-height: 1.6;">
                We'd love to have you back! As a special welcome-back gift, we're offering you an <strong style="color: #8b5cf6;">exclusive discount</strong>.
              </p>
              <!-- Offer Box -->
              <div style="background: linear-gradient(135deg, #ede9fe 0%, #ddd6fe 100%); padding: 30px; border-radius: 8px; text-align: center; margin: 24px 0;">
                <p style="margin: 0 0 8px; color: #5b21b6; font-size: 24px; font-weight: 700;">15% OFF</p>
                <p style="margin: 0; color: #6d28d9; font-size: 14px;">Your next purchase</p>
              </div>
              <p style="margin: 0 0 24px; color: #4b5563; font-size: 16px; line-height: 1.6;">
                We've also added new products and services that we think you'll love. Come check them out!
              </p>
              <!-- CTA Button -->
              <table role="presentation" style="margin: 0 auto;">
                <tr>
                  <td style="border-radius: 6px; background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);">
                    <a href="#" style="display: inline-block; padding: 16px 32px; color: #ffffff; text-decoration: none; font-size: 16px; font-weight: 600;">
                      Come Back
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0 0 8px; color: #6b7280; font-size: 14px;">
                We hope to see you soon!
              </p>
              <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                {{shop_name}} | <a href="#" style="color: #9ca3af; text-decoration: underline;">Unsubscribe</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
  },
  newsletter: {
    name: 'Newsletter',
    subject: '📰 {{shop_name}} Newsletter - {{month}} {{year}}',
    html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Newsletter</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f9fafb;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 0;">
        <table role="presentation" style="width: 600px; max-width: 100%; border-collapse: collapse; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #0891b2 0%, #0e7490 100%); padding: 40px 30px;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">📰 {{shop_name}} Newsletter</h1>
              <p style="margin: 8px 0 0; color: #cffafe; font-size: 14px;">{{month}} {{year}}</p>
            </td>
          </tr>
          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <h2 style="margin: 0 0 20px; color: #1f2937; font-size: 24px; font-weight: 600;">Hi {{first_name}},</h2>
              <p style="margin: 0 0 24px; color: #4b5563; font-size: 16px; line-height: 1.6;">
                Welcome to this month's newsletter! Here's what's new and exciting.
              </p>
              
              <!-- Section 1: Updates -->
              <div style="margin-bottom: 32px;">
                <h3 style="margin: 0 0 12px; color: #0891b2; font-size: 20px; font-weight: 600;">
                  🎯 Latest Updates
                </h3>
                <p style="margin: 0; color: #4b5563; font-size: 16px; line-height: 1.6;">
                  We've been working hard to bring you the best experience. Check out our latest improvements and new features!
                </p>
              </div>
              
              <!-- Section 2: Tips -->
              <div style="margin-bottom: 32px; background-color: #ecfeff; padding: 20px; border-radius: 8px; border-left: 4px solid #0891b2;">
                <h3 style="margin: 0 0 12px; color: #0e7490; font-size: 20px; font-weight: 600;">
                  💡 Helpful Tips
                </h3>
                <ul style="margin: 0; padding-left: 20px; color: #155e75;">
                  <li style="margin-bottom: 8px;">Tip 1: Make the most of our services</li>
                  <li style="margin-bottom: 8px;">Tip 2: Stay connected with us</li>
                  <li>Tip 3: Share your feedback</li>
                </ul>
              </div>
              
              <!-- Section 3: Offers -->
              <div style="margin-bottom: 24px;">
                <h3 style="margin: 0 0 12px; color: #0891b2; font-size: 20px; font-weight: 600;">
                  🎁 Special Offers
                </h3>
                <p style="margin: 0 0 16px; color: #4b5563; font-size: 16px; line-height: 1.6;">
                  Don't miss out on our exclusive deals this month!
                </p>
                <!-- CTA Button -->
                <table role="presentation">
                  <tr>
                    <td style="border-radius: 6px; background: linear-gradient(135deg, #0891b2 0%, #0e7490 100%);">
                      <a href="#" style="display: inline-block; padding: 14px 28px; color: #ffffff; text-decoration: none; font-size: 16px; font-weight: 600;">
                        View Offers
                      </a>
                    </td>
                  </tr>
                </table>
              </div>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0 0 8px; color: #6b7280; font-size: 14px;">
                Thanks for being part of our community!
              </p>
              <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                {{shop_name}} | <a href="#" style="color: #9ca3af; text-decoration: underline;">Unsubscribe</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
  }
};
