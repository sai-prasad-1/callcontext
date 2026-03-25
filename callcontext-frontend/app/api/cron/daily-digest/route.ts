import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/service';
import { resend } from '@/lib/resend/client';
import { generateDailyDigestHTML, DailyDigestData } from '@/lib/email/daily-digest';
import { format, startOfDay, endOfDay, subDays } from 'date-fns';
import { toZonedTime, fromZonedTime } from 'date-fns-tz';

interface ProcessResult {
  processed: number;
  sent: number;
  errors: Array<{ shop_id: string; error: string }>;
}

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret) {
      console.error('CRON_SECRET not configured');
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    if (authHeader !== `Bearer ${cronSecret}`) {
      console.error('Unauthorized cron request');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = createServiceClient();
    const result: ProcessResult = {
      processed: 0,
      sent: 0,
      errors: [],
    };

    const { data: shops, error: shopsError } = await supabase
      .from('shops')
      .select('id, name, timezone, owner_id');

    if (shopsError) {
      console.error('Failed to fetch shops:', shopsError);
      return NextResponse.json({ error: 'Failed to fetch shops' }, { status: 500 });
    }

    if (!shops || shops.length === 0) {
      return NextResponse.json(result);
    }

    const now = new Date();

    for (const shop of shops) {
      result.processed++;

      try {
        const timezone = shop.timezone || 'UTC';
        const shopLocalTime = toZonedTime(now, timezone);
        const shopHour = shopLocalTime.getHours();

        if (shopHour !== 8) {
          continue;
        }

        const yesterday = subDays(shopLocalTime, 1);
        const yesterdayStart = startOfDay(yesterday);
        const yesterdayEnd = endOfDay(yesterday);
        const todayStart = startOfDay(shopLocalTime);
        const todayEnd = endOfDay(shopLocalTime);

        const yesterdayStartUTC = fromZonedTime(yesterdayStart, timezone).toISOString();
        const yesterdayEndUTC = fromZonedTime(yesterdayEnd, timezone).toISOString();
        const todayStartUTC = fromZonedTime(todayStart, timezone).toISOString();
        const todayEndUTC = fromZonedTime(todayEnd, timezone).toISOString();

        const [
          callsYesterday,
          callsLastWeek,
          newCustomers,
          missedCalls,
          revenue,
          reminders,
          orders,
          tasks,
          ownerData,
        ] = await Promise.all([
          supabase
            .from('calls')
            .select('id', { count: 'exact', head: true })
            .eq('shop_id', shop.id)
            .gte('started_at', yesterdayStartUTC)
            .lte('started_at', yesterdayEndUTC),

          supabase
            .from('calls')
            .select('id', { count: 'exact', head: true })
            .eq('shop_id', shop.id)
            .gte('started_at', fromZonedTime(startOfDay(subDays(shopLocalTime, 8)), timezone).toISOString())
            .lte('started_at', fromZonedTime(endOfDay(subDays(shopLocalTime, 8)), timezone).toISOString()),

          supabase
            .from('customers')
            .select('id', { count: 'exact', head: true })
            .eq('shop_id', shop.id)
            .gte('created_at', yesterdayStartUTC)
            .lte('created_at', yesterdayEndUTC),

          supabase
            .from('calls')
            .select('id', { count: 'exact', head: true })
            .eq('shop_id', shop.id)
            .eq('status', 'missed')
            .gte('started_at', yesterdayStartUTC)
            .lte('started_at', yesterdayEndUTC),

          supabase
            .from('orders')
            .select('total_amount')
            .eq('shop_id', shop.id)
            .gte('created_at', yesterdayStartUTC)
            .lte('created_at', yesterdayEndUTC),

          supabase
            .from('reminders')
            .select('id, title, reminder_date, customer:customers!customer_id(first_name, last_name)')
            .eq('shop_id', shop.id)
            .eq('status', 'pending')
            .gte('reminder_date', todayStartUTC)
            .lte('reminder_date', todayEndUTC)
            .order('reminder_date', { ascending: true })
            .limit(5),

          supabase
            .from('orders')
            .select('id, products, delivery_date, total_amount, customer:customers!customer_id(first_name, last_name)')
            .eq('shop_id', shop.id)
            .in('status', ['pending', 'confirmed'])
            .gte('delivery_date', todayStartUTC)
            .order('delivery_date', { ascending: true })
            .limit(5),

          supabase
            .from('tasks')
            .select('id, title, due_date, customer:customers!customer_id(first_name, last_name)')
            .eq('shop_id', shop.id)
            .neq('status', 'done')
            .lt('due_date', todayStartUTC)
            .order('due_date', { ascending: true })
            .limit(5),

          supabase.auth.admin.getUserById(shop.owner_id),
        ]);

        if (!ownerData.data?.user?.email) {
          result.errors.push({
            shop_id: shop.id,
            error: 'Owner email not found',
          });
          continue;
        }

        const callsYesterdayCount = callsYesterday.count || 0;
        const callsLastWeekCount = callsLastWeek.count || 0;
        const callsChange =
          callsLastWeekCount > 0
            ? Math.round(((callsYesterdayCount - callsLastWeekCount) / callsLastWeekCount) * 100)
            : 0;

        const totalRevenue = (revenue.data || []).reduce(
          (sum, order) => sum + (order.total_amount || 0),
          0
        );

        const ownerFirstName = ownerData.data.user.user_metadata?.first_name || 
                               ownerData.data.user.email?.split('@')[0] || 
                               'there';

        const digestData: DailyDigestData = {
          shop_name: shop.name,
          date: format(shopLocalTime, 'EEEE, MMMM d, yyyy'),
          owner_first_name: ownerFirstName,
          stats: {
            calls_yesterday: callsYesterdayCount,
            calls_change: callsChange,
            new_customers: newCustomers.count || 0,
            missed_calls: missedCalls.count || 0,
            revenue: totalRevenue,
          },
          reminders_today: (reminders.data || []).map((r: any) => ({
            customer_name: r.customer
              ? `${r.customer.first_name || ''} ${r.customer.last_name || ''}`.trim()
              : 'Unknown',
            title: r.title,
            time: format(toZonedTime(new Date(r.reminder_date), timezone), 'h:mm a'),
          })),
          pending_orders: (orders.data || []).map((o: any) => {
            const products = Array.isArray(o.products)
              ? o.products.map((p: any) => p.name || p.type || 'Unknown').join(', ')
              : 'Order items';
            
            return {
              customer_name: o.customer
                ? `${o.customer.first_name || ''} ${o.customer.last_name || ''}`.trim()
                : 'Unknown',
              products,
              delivery_date: o.delivery_date
                ? format(toZonedTime(new Date(o.delivery_date), timezone), 'MMM d')
                : 'TBD',
              amount: o.total_amount || 0,
            };
          }),
          overdue_tasks: (tasks.data || []).map((t: any) => ({
            title: t.title,
            customer_name: t.customer
              ? `${t.customer.first_name || ''} ${t.customer.last_name || ''}`.trim()
              : undefined,
            due_date: t.due_date
              ? format(toZonedTime(new Date(t.due_date), timezone), 'MMM d')
              : 'No date',
          })),
        };

        const html = generateDailyDigestHTML(digestData);

        const emailResult = await resend.emails.send({
          from: 'CallContext <digest@callcontext.ai>',
          to: ownerData.data.user.email,
          subject: `Daily Digest for ${shop.name} - ${format(shopLocalTime, 'MMM d, yyyy')}`,
          html,
        });

        if (emailResult.error) {
          result.errors.push({
            shop_id: shop.id,
            error: emailResult.error.message,
          });
        } else {
          result.sent++;
          console.log(`Sent daily digest to ${ownerData.data.user.email} for shop ${shop.name}`);
        }
      } catch (error) {
        console.error(`Error processing shop ${shop.id}:`, error);
        result.errors.push({
          shop_id: shop.id,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Daily digest cron error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
