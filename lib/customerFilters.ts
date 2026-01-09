import { createClient } from '@supabase/supabase-js';
import { CustomerFilter } from '@/types/mailings';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export const customerFilters: CustomerFilter[] = [
  {
    value: 'all',
    label: 'Alle Kunden',
    description: 'Alle registrierten Kunden erhalten diese E-Mail',
  },
  {
    value: 'regular',
    label: 'Nur reguläre Accounts',
    description: 'Nur Kunden mit vollständigen Accounts',
  },
  {
    value: 'guest',
    label: 'Nur Gast-Accounts',
    description: 'Nur Kunden mit Gast-Accounts',
  },
  {
    value: 'active_30d',
    label: 'Aktive Kunden (30 Tage)',
    description: 'Kunden die in den letzten 30 Tagen Tickets gekauft haben',
  },
  {
    value: 'inactive_90d',
    label: 'Inaktive Kunden (90 Tage)',
    description: 'Kunden ohne Ticketkauf in den letzten 90 Tagen',
  },
  {
    value: 'high_value',
    label: 'Top-Kunden',
    description: 'Kunden mit mehr als 10 Ticketkäufen in den letzten 6 Monaten',
  },
];

export async function getRecipientCount(filterValue: string): Promise<number> {
  try {
    switch (filterValue) {
      case 'all': {
        const { count } = await supabase
          .from('customers')
          .select('*', { count: 'exact', head: true });
        return count || 0;
      }

      case 'regular': {
        const { count } = await supabase
          .from('customers')
          .select('*', { count: 'exact', head: true })
          .eq('account_type', 'regular');
        return count || 0;
      }

      case 'guest': {
        const { count } = await supabase
          .from('customers')
          .select('*', { count: 'exact', head: true })
          .eq('account_type', 'guest');
        return count || 0;
      }

      case 'active_30d': {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const { data: tickets } = await supabase
          .from('tickets')
          .select('customer_id')
          .gte('purchase_date', thirtyDaysAgo.toISOString());

        const uniqueCustomers = tickets
          ? new Set(tickets.map((t) => t.customer_id)).size
          : 0;

        return uniqueCustomers;
      }

      case 'inactive_90d': {
        const ninetyDaysAgo = new Date();
        ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

        const { data: tickets } = await supabase
          .from('tickets')
          .select('customer_id')
          .gte('purchase_date', ninetyDaysAgo.toISOString());

        const activeCustomerIds = new Set(tickets?.map((t) => t.customer_id) || []);

        const { data: allCustomers } = await supabase
          .from('customers')
          .select('id');

        const inactiveCount = allCustomers
          ? allCustomers.filter((c) => !activeCustomerIds.has(c.id)).length
          : 0;

        return inactiveCount;
      }

      case 'high_value': {
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

        const { data: tickets } = await supabase
          .from('tickets')
          .select('customer_id')
          .gte('purchase_date', sixMonthsAgo.toISOString());

        if (!tickets) return 0;

        const customerTicketCounts = new Map<string, number>();
        tickets.forEach((ticket) => {
          const count = customerTicketCounts.get(ticket.customer_id) || 0;
          customerTicketCounts.set(ticket.customer_id, count + 1);
        });

        const highValueCustomers = Array.from(customerTicketCounts.values()).filter(
          (count) => count > 10
        );

        return highValueCustomers.length;
      }

      default:
        return 0;
    }
  } catch (error) {
    console.error('Fehler beim Berechnen der Empfängeranzahl:', error);
    return 0;
  }
}
