'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { FiUsers, FiUserCheck, FiUserX, FiShoppingBag } from 'react-icons/fi';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { CustomerStats, NewRegistration, TopCustomer } from '@/types/customers';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function KundenStatistikenPage() {
  const [stats, setStats] = useState<CustomerStats>({
    totalCustomers: 0,
    regularAccounts: 0,
    guestAccounts: 0,
    activeCustomersLast30Days: 0,
  });
  const [registrations, setRegistrations] = useState<NewRegistration[]>([]);
  const [topCustomers, setTopCustomers] = useState<TopCustomer[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStatistics();
  }, []);

  const loadStatistics = async () => {
    setIsLoading(true);
    try {
      await Promise.all([
        loadCustomerStats(),
        loadRegistrationData(),
        loadTopCustomers(),
      ]);
    } catch (error) {
      console.error('Fehler beim Laden der Statistiken:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadCustomerStats = async () => {
    const { data: customers } = await supabase.from('customers').select('account_type');

    if (customers) {
      const regularCount = customers.filter(c => c.account_type === 'regular').length;
      const guestCount = customers.filter(c => c.account_type === 'guest').length;

      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data: ticketData } = await supabase
        .from('tickets')
        .select('customer_id')
        .gte('purchase_date', thirtyDaysAgo.toISOString());

      const uniqueCustomers = ticketData
        ? new Set(ticketData.map(t => t.customer_id)).size
        : 0;

      setStats({
        totalCustomers: customers.length,
        regularAccounts: regularCount,
        guestAccounts: guestCount,
        activeCustomersLast30Days: uniqueCustomers,
      });
    }
  };

  const loadRegistrationData = async () => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data: customers } = await supabase
      .from('customers')
      .select('created_at')
      .gte('created_at', thirtyDaysAgo.toISOString())
      .order('created_at', { ascending: true });

    if (customers) {
      const registrationMap = new Map<string, number>();

      for (let i = 0; i < 30; i++) {
        const date = new Date();
        date.setDate(date.getDate() - (29 - i));
        const dateStr = date.toISOString().split('T')[0];
        registrationMap.set(dateStr, 0);
      }

      customers.forEach(customer => {
        const dateStr = customer.created_at.split('T')[0];
        registrationMap.set(dateStr, (registrationMap.get(dateStr) || 0) + 1);
      });

      const registrationData = Array.from(registrationMap.entries()).map(([date, count]) => ({
        date: new Date(date).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' }),
        count,
      }));

      setRegistrations(registrationData);
    }
  };

  const loadTopCustomers = async () => {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const { data: ticketData } = await supabase
      .from('tickets')
      .select('customer_id, price')
      .gte('purchase_date', sixMonthsAgo.toISOString());

    if (ticketData) {
      const customerTickets = new Map<string, { count: number; total: number }>();

      ticketData.forEach(ticket => {
        const existing = customerTickets.get(ticket.customer_id) || { count: 0, total: 0 };
        customerTickets.set(ticket.customer_id, {
          count: existing.count + 1,
          total: existing.total + parseFloat(ticket.price.toString()),
        });
      });

      const sortedCustomers = Array.from(customerTickets.entries())
        .sort((a, b) => b[1].count - a[1].count)
        .slice(0, 10);

      const customerIds = sortedCustomers.map(([id]) => id);

      if (customerIds.length > 0) {
        const { data: customers } = await supabase
          .from('customers')
          .select('id, customer_number, first_name, last_name, email')
          .in('id', customerIds);

        if (customers) {
          const topCustomersData = sortedCustomers
            .map(([customerId, stats]) => {
              const customer = customers.find(c => c.id === customerId);
              if (!customer) return null;

              return {
                customer_id: customer.id,
                customer_number: customer.customer_number,
                first_name: customer.first_name,
                last_name: customer.last_name,
                email: customer.email,
                ticket_count: stats.count,
                total_spent: stats.total,
              };
            })
            .filter(c => c !== null) as TopCustomer[];

          setTopCustomers(topCustomersData);
        }
      }
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(amount);
  };

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Kunden Statistiken</h1>
            <p className="text-muted-foreground">Statistische Übersicht der Kundendaten</p>
          </div>
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground">Lade Statistiken...</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Kunden Statistiken</h1>
          <p className="text-muted-foreground">Statistische Übersicht der Kundendaten</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Gesamt Kunden</CardTitle>
              <FiUsers className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalCustomers}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Alle registrierten Kunden
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Richtige Accounts</CardTitle>
              <FiUserCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.regularAccounts}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {((stats.regularAccounts / stats.totalCustomers) * 100 || 0).toFixed(1)}% aller Kunden
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Gast Accounts</CardTitle>
              <FiUserX className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.guestAccounts}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {((stats.guestAccounts / stats.totalCustomers) * 100 || 0).toFixed(1)}% aller Kunden
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Aktive Käufer (30T)</CardTitle>
              <FiShoppingBag className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeCustomersLast30Days}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Kunden mit Ticketkäufen
              </p>
            </CardContent>
          </Card>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Neuanmeldungen (letzte 30 Tage)</CardTitle>
            <CardDescription>
              Tägliche Übersicht der Kundenregistrierungen
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={registrations}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 12 }}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="count"
                    stroke="#2563eb"
                    strokeWidth={2}
                    name="Neuanmeldungen"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Kunden (letzte 6 Monate)</CardTitle>
            <CardDescription>
              Die treuesten Kunden nach Anzahl gekaufter Tickets
            </CardDescription>
          </CardHeader>
          <CardContent>
            {topCustomers.length > 0 ? (
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Rang</TableHead>
                      <TableHead>Kundennummer</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead className="text-right">Tickets</TableHead>
                      <TableHead className="text-right">Gesamtausgaben</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {topCustomers.map((customer, index) => (
                      <TableRow key={customer.customer_id}>
                        <TableCell>
                          <Badge variant={index < 3 ? 'default' : 'secondary'}>
                            #{index + 1}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium">
                          {customer.customer_number}
                        </TableCell>
                        <TableCell>
                          {customer.first_name} {customer.last_name}
                        </TableCell>
                        <TableCell>{customer.email}</TableCell>
                        <TableCell className="text-right font-semibold">
                          {customer.ticket_count}
                        </TableCell>
                        <TableCell className="text-right font-semibold">
                          {formatCurrency(customer.total_spent)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">
                Keine Ticketverkäufe in den letzten 6 Monaten
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
