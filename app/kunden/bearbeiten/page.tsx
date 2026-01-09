'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { FiSearch, FiSave, FiPlus, FiTrash2, FiCreditCard, FiGift, FiDollarSign } from 'react-icons/fi';
import { Customer, CustomerCard, Voucher, Transaction } from '@/types/customers';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function KundenBearbeitenPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchType, setSearchType] = useState<'email' | 'customer_number' | 'last_name'>('email');
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [customerCards, setCustomerCards] = useState<CustomerCard[]>([]);
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const searchCustomers = async () => {
    if (!searchTerm.trim()) return;

    setIsLoading(true);
    try {
      let query = supabase.from('customers').select('*');

      if (searchType === 'email') {
        query = query.ilike('email', `%${searchTerm}%`);
      } else if (searchType === 'customer_number') {
        query = query.ilike('customer_number', `%${searchTerm}%`);
      } else if (searchType === 'last_name') {
        query = query.ilike('last_name', `%${searchTerm}%`);
      }

      const { data, error } = await query.order('created_at', { ascending: false }).limit(10);

      if (error) throw error;
      setCustomers(data || []);
    } catch (error) {
      console.error('Fehler beim Suchen:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadCustomerDetails = async (customer: Customer) => {
    setSelectedCustomer(customer);

    const [cardsResponse, vouchersResponse, transactionsResponse] = await Promise.all([
      supabase.from('customer_cards').select('*').eq('customer_id', customer.id),
      supabase.from('vouchers').select('*').eq('customer_id', customer.id),
      supabase.from('transactions').select('*').eq('customer_id', customer.id).order('transaction_date', { ascending: false })
    ]);

    setCustomerCards(cardsResponse.data || []);
    setVouchers(vouchersResponse.data || []);
    setTransactions(transactionsResponse.data || []);
  };

  const saveCustomer = async () => {
    if (!selectedCustomer) return;

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('customers')
        .update({
          first_name: selectedCustomer.first_name,
          last_name: selectedCustomer.last_name,
          email: selectedCustomer.email,
          phone: selectedCustomer.phone,
          mobile: selectedCustomer.mobile,
          street: selectedCustomer.street,
          postal_code: selectedCustomer.postal_code,
          city: selectedCustomer.city
        })
        .eq('id', selectedCustomer.id);

      if (error) throw error;
      alert('Kundendaten erfolgreich gespeichert!');

      const updatedCustomers = customers.map(c =>
        c.id === selectedCustomer.id ? selectedCustomer : c
      );
      setCustomers(updatedCustomers);
    } catch (error) {
      console.error('Fehler beim Speichern:', error);
      alert('Fehler beim Speichern der Kundendaten.');
    } finally {
      setIsSaving(false);
    }
  };

  const addCustomerCard = async () => {
    if (!selectedCustomer) return;

    const cardNumber = `CARD-${Date.now()}`;
    try {
      const { data, error } = await supabase
        .from('customer_cards')
        .insert({
          customer_id: selectedCustomer.id,
          card_number: cardNumber,
          card_type: 'Standard',
          points: 0,
          status: 'aktiv',
          expiry_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      setCustomerCards([...customerCards, data]);
    } catch (error) {
      console.error('Fehler beim Hinzufügen der Karte:', error);
    }
  };

  const addVoucher = async () => {
    if (!selectedCustomer) return;

    const voucherCode = `VOUCHER-${Date.now()}`;
    try {
      const { data, error } = await supabase
        .from('vouchers')
        .insert({
          customer_id: selectedCustomer.id,
          voucher_code: voucherCode,
          amount: 10.00,
          description: 'Neuer Gutschein',
          status: 'gültig',
          expiry_date: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      setVouchers([...vouchers, data]);
    } catch (error) {
      console.error('Fehler beim Hinzufügen des Gutscheins:', error);
    }
  };

  const deleteCard = async (cardId: string) => {
    if (!confirm('Möchten Sie diese Karte wirklich löschen?')) return;

    try {
      const { error } = await supabase.from('customer_cards').delete().eq('id', cardId);
      if (error) throw error;
      setCustomerCards(customerCards.filter(c => c.id !== cardId));
    } catch (error) {
      console.error('Fehler beim Löschen der Karte:', error);
    }
  };

  const deleteVoucher = async (voucherId: string) => {
    if (!confirm('Möchten Sie diesen Gutschein wirklich löschen?')) return;

    try {
      const { error } = await supabase.from('vouchers').delete().eq('id', voucherId);
      if (error) throw error;
      setVouchers(vouchers.filter(v => v.id !== voucherId));
    } catch (error) {
      console.error('Fehler beim Löschen des Gutscheins:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('de-DE');
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(amount);
  };

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Kunden bearbeiten</h1>
          <p className="text-muted-foreground">
            Suchen und bearbeiten Sie Kundendaten, verwalten Sie Kundenkarten und Gutscheine
          </p>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Kunde suchen</CardTitle>
            <CardDescription>Suchen Sie nach Email, Kundennummer oder Nachname</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 mb-4">
              <div className="flex-1">
                <Label htmlFor="search">Suchbegriff</Label>
                <Input
                  id="search"
                  placeholder="Suchbegriff eingeben..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && searchCustomers()}
                />
              </div>
              <div className="w-48">
                <Label htmlFor="searchType">Suchtyp</Label>
                <select
                  id="searchType"
                  value={searchType}
                  onChange={(e) => setSearchType(e.target.value as any)}
                  className="w-full h-10 px-3 rounded-md border border-input bg-background"
                >
                  <option value="email">Email</option>
                  <option value="customer_number">Kundennummer</option>
                  <option value="last_name">Nachname</option>
                </select>
              </div>
              <div className="flex items-end">
                <Button onClick={searchCustomers} disabled={isLoading}>
                  <FiSearch className="mr-2" />
                  Suchen
                </Button>
              </div>
            </div>

            {customers.length > 0 && (
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Kundennummer</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Ort</TableHead>
                      <TableHead>Aktion</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {customers.map((customer) => (
                      <TableRow key={customer.id}>
                        <TableCell className="font-medium">{customer.customer_number}</TableCell>
                        <TableCell>{customer.first_name} {customer.last_name}</TableCell>
                        <TableCell>{customer.email}</TableCell>
                        <TableCell>{customer.city}</TableCell>
                        <TableCell>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => loadCustomerDetails(customer)}
                          >
                            Auswählen
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {selectedCustomer && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>
                    {selectedCustomer.first_name} {selectedCustomer.last_name}
                  </CardTitle>
                  <CardDescription>Kundennummer: {selectedCustomer.customer_number}</CardDescription>
                </div>
                <Button onClick={saveCustomer} disabled={isSaving}>
                  <FiSave className="mr-2" />
                  {isSaving ? 'Speichern...' : 'Speichern'}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="details" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="details">Kundendaten</TabsTrigger>
                  <TabsTrigger value="transactions">Transaktionshistorie</TabsTrigger>
                </TabsList>

                <TabsContent value="details" className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">Vorname</Label>
                      <Input
                        id="firstName"
                        value={selectedCustomer.first_name}
                        onChange={(e) =>
                          setSelectedCustomer({ ...selectedCustomer, first_name: e.target.value })
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName">Nachname</Label>
                      <Input
                        id="lastName"
                        value={selectedCustomer.last_name}
                        onChange={(e) =>
                          setSelectedCustomer({ ...selectedCustomer, last_name: e.target.value })
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={selectedCustomer.email}
                        onChange={(e) =>
                          setSelectedCustomer({ ...selectedCustomer, email: e.target.value })
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Telefonnummer</Label>
                      <Input
                        id="phone"
                        value={selectedCustomer.phone}
                        onChange={(e) =>
                          setSelectedCustomer({ ...selectedCustomer, phone: e.target.value })
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="mobile">Handynummer</Label>
                      <Input
                        id="mobile"
                        value={selectedCustomer.mobile}
                        onChange={(e) =>
                          setSelectedCustomer({ ...selectedCustomer, mobile: e.target.value })
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="street">Straße</Label>
                      <Input
                        id="street"
                        value={selectedCustomer.street}
                        onChange={(e) =>
                          setSelectedCustomer({ ...selectedCustomer, street: e.target.value })
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="postalCode">PLZ</Label>
                      <Input
                        id="postalCode"
                        value={selectedCustomer.postal_code}
                        onChange={(e) =>
                          setSelectedCustomer({ ...selectedCustomer, postal_code: e.target.value })
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="city">Ort</Label>
                      <Input
                        id="city"
                        value={selectedCustomer.city}
                        onChange={(e) =>
                          setSelectedCustomer({ ...selectedCustomer, city: e.target.value })
                        }
                      />
                    </div>
                  </div>

                  <div className="pt-6 border-t">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold flex items-center gap-2">
                        <FiCreditCard />
                        Kundenkarten
                      </h3>
                      <Button onClick={addCustomerCard} size="sm">
                        <FiPlus className="mr-2" />
                        Karte hinzufügen
                      </Button>
                    </div>
                    {customerCards.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {customerCards.map((card) => (
                          <Card key={card.id}>
                            <CardContent className="pt-6">
                              <div className="flex justify-between items-start mb-2">
                                <div>
                                  <p className="font-semibold">{card.card_number}</p>
                                  <Badge variant="secondary" className="mt-1">
                                    {card.card_type}
                                  </Badge>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => deleteCard(card.id)}
                                >
                                  <FiTrash2 className="text-red-500" />
                                </Button>
                              </div>
                              <div className="space-y-1 text-sm">
                                <p>
                                  <span className="text-muted-foreground">Punkte:</span> {card.points}
                                </p>
                                <p>
                                  <span className="text-muted-foreground">Status:</span>{' '}
                                  <Badge variant={card.status === 'aktiv' ? 'default' : 'destructive'}>
                                    {card.status}
                                  </Badge>
                                </p>
                                <p>
                                  <span className="text-muted-foreground">Gültig bis:</span>{' '}
                                  {formatDate(card.expiry_date)}
                                </p>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground text-sm">Keine Kundenkarten vorhanden</p>
                    )}
                  </div>

                  <div className="pt-6 border-t">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold flex items-center gap-2">
                        <FiGift />
                        Gutscheine
                      </h3>
                      <Button onClick={addVoucher} size="sm">
                        <FiPlus className="mr-2" />
                        Gutschein hinzufügen
                      </Button>
                    </div>
                    {vouchers.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {vouchers.map((voucher) => (
                          <Card key={voucher.id}>
                            <CardContent className="pt-6">
                              <div className="flex justify-between items-start mb-2">
                                <div>
                                  <p className="font-semibold">{voucher.voucher_code}</p>
                                  <p className="text-lg font-bold text-primary mt-1">
                                    {formatCurrency(voucher.amount)}
                                  </p>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => deleteVoucher(voucher.id)}
                                >
                                  <FiTrash2 className="text-red-500" />
                                </Button>
                              </div>
                              <div className="space-y-1 text-sm">
                                <p className="text-muted-foreground">{voucher.description}</p>
                                <p>
                                  <span className="text-muted-foreground">Status:</span>{' '}
                                  <Badge
                                    variant={
                                      voucher.status === 'gültig'
                                        ? 'default'
                                        : voucher.status === 'verwendet'
                                        ? 'secondary'
                                        : 'destructive'
                                    }
                                  >
                                    {voucher.status}
                                  </Badge>
                                </p>
                                <p>
                                  <span className="text-muted-foreground">Gültig bis:</span>{' '}
                                  {formatDate(voucher.expiry_date)}
                                </p>
                                {voucher.used_date && (
                                  <p>
                                    <span className="text-muted-foreground">Eingelöst am:</span>{' '}
                                    {formatDate(voucher.used_date)}
                                  </p>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground text-sm">Keine Gutscheine vorhanden</p>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="transactions">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-4">
                      <FiDollarSign className="text-2xl" />
                      <h3 className="text-lg font-semibold">Transaktionshistorie</h3>
                    </div>
                    {transactions.length > 0 ? (
                      <div className="border rounded-lg">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Transaktionsnr.</TableHead>
                              <TableHead>Datum</TableHead>
                              <TableHead>Typ</TableHead>
                              <TableHead>Betrag</TableHead>
                              <TableHead>Zahlungsmethode</TableHead>
                              <TableHead>Beschreibung</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {transactions.map((transaction) => (
                              <TableRow key={transaction.id}>
                                <TableCell className="font-medium">
                                  {transaction.transaction_number}
                                </TableCell>
                                <TableCell>{formatDate(transaction.transaction_date)}</TableCell>
                                <TableCell>
                                  <Badge variant="secondary">{transaction.transaction_type}</Badge>
                                </TableCell>
                                <TableCell className="font-semibold">
                                  {formatCurrency(transaction.amount)}
                                </TableCell>
                                <TableCell>{transaction.payment_method}</TableCell>
                                <TableCell>{transaction.description}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    ) : (
                      <Card>
                        <CardContent className="pt-6">
                          <p className="text-muted-foreground text-center">
                            Keine Transaktionen vorhanden
                          </p>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
