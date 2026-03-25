export interface DailyDigestData {
  shop_name: string;
  date: string;
  owner_first_name: string;
  stats: {
    calls_yesterday: number;
    calls_change: number;
    new_customers: number;
    missed_calls: number;
    revenue: number;
  };
  reminders_today: Array<{
    customer_name: string;
    title: string;
    time: string;
  }>;
  pending_orders: Array<{
    customer_name: string;
    products: string;
    delivery_date: string;
    amount: number;
  }>;
  overdue_tasks: Array<{
    title: string;
    customer_name?: string;
    due_date: string;
  }>;
}

export function generateDailyDigestHTML(data: DailyDigestData): string {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatChangePercent = (change: number) => {
    const sign = change >= 0 ? '+' : '';
    return `${sign}${change}%`;
  };

  const getChangeColor = (change: number) => {
    if (change > 0) return '#10b981';
    if (change < 0) return '#ef4444';
    return '#6b7280';
  };

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Daily Digest - ${data.shop_name}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f9fafb;">
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #f9fafb;">
    <tr>
      <td style="padding: 40px 20px;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
          
          <!-- Header -->
          <tr>
            <td style="padding: 32px 32px 24px 32px; border-bottom: 1px solid #e5e7eb;">
              <h1 style="margin: 0 0 8px 0; font-size: 24px; font-weight: 700; color: #111827;">
                Daily Digest
              </h1>
              <p style="margin: 0; font-size: 14px; color: #6b7280;">
                ${data.shop_name} • ${data.date}
              </p>
            </td>
          </tr>

          <!-- Greeting -->
          <tr>
            <td style="padding: 24px 32px 8px 32px;">
              <p style="margin: 0; font-size: 16px; color: #374151;">
                Good morning, ${data.owner_first_name}! Here's your daily summary.
              </p>
            </td>
          </tr>

          <!-- Stats Grid -->
          <tr>
            <td style="padding: 16px 32px;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                <tr>
                  <td style="width: 50%; padding: 0 8px 16px 0;">
                    <div style="background-color: #fef3c7; border-radius: 8px; padding: 16px; border-left: 4px solid #f59e0b;">
                      <p style="margin: 0 0 4px 0; font-size: 12px; color: #92400e; text-transform: uppercase; font-weight: 600; letter-spacing: 0.5px;">
                        Calls Yesterday
                      </p>
                      <p style="margin: 0 0 4px 0; font-size: 28px; font-weight: 700; color: #78350f;">
                        ${data.stats.calls_yesterday}
                      </p>
                      <p style="margin: 0; font-size: 13px; color: ${getChangeColor(data.stats.calls_change)}; font-weight: 600;">
                        ${formatChangePercent(data.stats.calls_change)} from last week
                      </p>
                    </div>
                  </td>
                  <td style="width: 50%; padding: 0 0 16px 8px;">
                    <div style="background-color: #dbeafe; border-radius: 8px; padding: 16px; border-left: 4px solid #3b82f6;">
                      <p style="margin: 0 0 4px 0; font-size: 12px; color: #1e3a8a; text-transform: uppercase; font-weight: 600; letter-spacing: 0.5px;">
                        New Customers
                      </p>
                      <p style="margin: 0; font-size: 28px; font-weight: 700; color: #1e40af;">
                        ${data.stats.new_customers}
                      </p>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td style="width: 50%; padding: 0 8px 0 0;">
                    <div style="background-color: #fee2e2; border-radius: 8px; padding: 16px; border-left: 4px solid #ef4444;">
                      <p style="margin: 0 0 4px 0; font-size: 12px; color: #7f1d1d; text-transform: uppercase; font-weight: 600; letter-spacing: 0.5px;">
                        Missed Calls
                      </p>
                      <p style="margin: 0; font-size: 28px; font-weight: 700; color: #991b1b;">
                        ${data.stats.missed_calls}
                      </p>
                    </div>
                  </td>
                  <td style="width: 50%; padding: 0 0 0 8px;">
                    <div style="background-color: #d1fae5; border-radius: 8px; padding: 16px; border-left: 4px solid #10b981;">
                      <p style="margin: 0 0 4px 0; font-size: 12px; color: #064e3b; text-transform: uppercase; font-weight: 600; letter-spacing: 0.5px;">
                        Revenue
                      </p>
                      <p style="margin: 0; font-size: 28px; font-weight: 700; color: #065f46;">
                        ${formatCurrency(data.stats.revenue)}
                      </p>
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          ${data.reminders_today.length > 0 ? `
          <!-- Today's Reminders -->
          <tr>
            <td style="padding: 24px 32px 8px 32px;">
              <h2 style="margin: 0; font-size: 18px; font-weight: 600; color: #111827;">
                Today's Reminders
              </h2>
            </td>
          </tr>
          <tr>
            <td style="padding: 8px 32px 16px 32px;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                ${data.reminders_today.slice(0, 5).map((reminder, index) => `
                  <tr>
                    <td style="padding: 12px 0; ${index < Math.min(data.reminders_today.length, 5) - 1 ? 'border-bottom: 1px solid #e5e7eb;' : ''}">
                      <p style="margin: 0 0 4px 0; font-size: 14px; font-weight: 600; color: #111827;">
                        ${reminder.title}
                      </p>
                      <p style="margin: 0; font-size: 13px; color: #6b7280;">
                        ${reminder.customer_name} • ${reminder.time}
                      </p>
                    </td>
                  </tr>
                `).join('')}
              </table>
            </td>
          </tr>
          ` : ''}

          ${data.pending_orders.length > 0 ? `
          <!-- Pending Orders -->
          <tr>
            <td style="padding: 24px 32px 8px 32px;">
              <h2 style="margin: 0; font-size: 18px; font-weight: 600; color: #111827;">
                Pending Orders
              </h2>
            </td>
          </tr>
          <tr>
            <td style="padding: 8px 32px 16px 32px;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                ${data.pending_orders.slice(0, 5).map((order, index) => `
                  <tr>
                    <td style="padding: 12px 0; ${index < Math.min(data.pending_orders.length, 5) - 1 ? 'border-bottom: 1px solid #e5e7eb;' : ''}">
                      <p style="margin: 0 0 4px 0; font-size: 14px; font-weight: 600; color: #111827;">
                        ${order.customer_name} - ${formatCurrency(order.amount)}
                      </p>
                      <p style="margin: 0; font-size: 13px; color: #6b7280;">
                        ${order.products} • Delivery: ${order.delivery_date}
                      </p>
                    </td>
                  </tr>
                `).join('')}
              </table>
            </td>
          </tr>
          ` : ''}

          ${data.overdue_tasks.length > 0 ? `
          <!-- Overdue Tasks -->
          <tr>
            <td style="padding: 24px 32px 8px 32px;">
              <h2 style="margin: 0; font-size: 18px; font-weight: 600; color: #111827;">
                Overdue Tasks
              </h2>
            </td>
          </tr>
          <tr>
            <td style="padding: 8px 32px 16px 32px;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                ${data.overdue_tasks.slice(0, 5).map((task, index) => `
                  <tr>
                    <td style="padding: 12px 0; ${index < Math.min(data.overdue_tasks.length, 5) - 1 ? 'border-bottom: 1px solid #e5e7eb;' : ''}">
                      <div style="display: flex; align-items: center;">
                        <span style="display: inline-block; padding: 2px 8px; background-color: #fee2e2; color: #991b1b; border-radius: 4px; font-size: 11px; font-weight: 600; text-transform: uppercase; margin-right: 8px;">
                          OVERDUE
                        </span>
                      </div>
                      <p style="margin: 8px 0 4px 0; font-size: 14px; font-weight: 600; color: #111827;">
                        ${task.title}
                      </p>
                      <p style="margin: 0; font-size: 13px; color: #6b7280;">
                        ${task.customer_name ? `${task.customer_name} • ` : ''}Due: ${task.due_date}
                      </p>
                    </td>
                  </tr>
                `).join('')}
              </table>
            </td>
          </tr>
          ` : ''}

          <!-- CTA Button -->
          <tr>
            <td style="padding: 24px 32px 32px 32px; text-align: center;">
              <a href="https://callcontext.ai/dashboard" style="display: inline-block; padding: 12px 32px; background-color: #f59e0b; color: #ffffff; text-decoration: none; border-radius: 6px; font-size: 14px; font-weight: 600;">
                View Dashboard
              </a>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 24px 32px; background-color: #f9fafb; border-top: 1px solid #e5e7eb; border-radius: 0 0 8px 8px;">
              <p style="margin: 0; font-size: 12px; color: #6b7280; text-align: center;">
                You're receiving this email because you're the owner of ${data.shop_name} on CallContext.
              </p>
              <p style="margin: 8px 0 0 0; font-size: 12px; color: #9ca3af; text-align: center;">
                © ${new Date().getFullYear()} CallContext. All rights reserved.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}
