'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import EmailEditor from './EmailEditor';
import { customerFilters, getRecipientCount } from '@/lib/customerFilters';
import { MailingDraft } from '@/types/mailings';
import { FiUsers, FiChevronRight, FiChevronLeft, FiSave } from 'react-icons/fi';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface CreateMailingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onMailingCreated?: () => void;
}

export default function CreateMailingDialog({
  open,
  onOpenChange,
  onMailingCreated,
}: CreateMailingDialogProps) {
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [recipientCount, setRecipientCount] = useState(0);
  const [loadingRecipients, setLoadingRecipients] = useState(false);

  const [draft, setDraft] = useState<MailingDraft>({
    name: '',
    subject: '',
    customer_filter: 'all',
    campaign: '',
    content: '',
  });

  useEffect(() => {
    if (open) {
      setStep(1);
      setDraft({
        name: '',
        subject: '',
        customer_filter: 'all',
        campaign: '',
        content: '',
      });
      setRecipientCount(0);
    }
  }, [open]);

  useEffect(() => {
    if (draft.customer_filter && step === 1) {
      loadRecipientCount();
    }
  }, [draft.customer_filter]);

  const loadRecipientCount = async () => {
    setLoadingRecipients(true);
    try {
      const count = await getRecipientCount(draft.customer_filter);
      setRecipientCount(count);
    } catch (error) {
      console.error('Fehler beim Laden der Empfängeranzahl:', error);
    } finally {
      setLoadingRecipients(false);
    }
  };

  const canProceedToStep2 = () => {
    return draft.name.trim() !== '' && draft.subject.trim() !== '' && recipientCount > 0;
  };

  const handleSaveDraft = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase.from('mailings').insert([
        {
          name: draft.name,
          subject: draft.subject,
          content: draft.content,
          customer_filter: draft.customer_filter,
          campaign: draft.campaign || '',
          status: 'draft',
          recipients: recipientCount,
        },
      ]);

      if (error) throw error;

      onOpenChange(false);
      if (onMailingCreated) {
        onMailingCreated();
      }
    } catch (error) {
      console.error('Fehler beim Speichern des Mailings:', error);
      alert('Fehler beim Speichern des Mailings');
    } finally {
      setIsLoading(false);
    }
  };

  const selectedFilter = customerFilters.find((f) => f.value === draft.customer_filter);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {step === 1 ? 'Neues Mailing erstellen - Schritt 1' : 'Neues Mailing erstellen - Schritt 2'}
          </DialogTitle>
          <DialogDescription>
            {step === 1
              ? 'Geben Sie die Grundinformationen für Ihr Mailing ein'
              : 'Erstellen Sie den Inhalt Ihrer E-Mail'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {step === 1 ? (
            <>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Kampagnenname (intern)</Label>
                  <Input
                    id="name"
                    placeholder="z.B. Newsletter Dezember 2024"
                    value={draft.name}
                    onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subject">E-Mail Betreff</Label>
                  <Input
                    id="subject"
                    placeholder="z.B. Neue Filme im Dezember"
                    value={draft.subject}
                    onChange={(e) => setDraft({ ...draft, subject: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="campaign">Kampagne (optional)</Label>
                  <Input
                    id="campaign"
                    placeholder="z.B. Weihnachtsaktion"
                    value={draft.campaign}
                    onChange={(e) => setDraft({ ...draft, campaign: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="filter">Empfänger-Filter</Label>
                  <Select
                    value={draft.customer_filter}
                    onValueChange={(value) => setDraft({ ...draft, customer_filter: value })}
                  >
                    <SelectTrigger id="filter">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {customerFilters.map((filter) => (
                        <SelectItem key={filter.value} value={filter.value}>
                          {filter.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {selectedFilter && (
                    <p className="text-sm text-muted-foreground">{selectedFilter.description}</p>
                  )}
                </div>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <FiUsers />
                    Empfänger
                  </CardTitle>
                  <CardDescription>
                    Anzahl der Kunden, die diese E-Mail erhalten werden
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {loadingRecipients ? (
                    <p className="text-muted-foreground">Berechne...</p>
                  ) : (
                    <div className="flex items-center gap-3">
                      <div className="text-3xl font-bold">{recipientCount.toLocaleString('de-DE')}</div>
                      <Badge variant={recipientCount > 0 ? 'default' : 'secondary'}>
                        {recipientCount > 0 ? 'Bereit zum Versand' : 'Keine Empfänger'}
                      </Badge>
                    </div>
                  )}
                </CardContent>
              </Card>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => onOpenChange(false)}>
                  Abbrechen
                </Button>
                <Button
                  onClick={() => setStep(2)}
                  disabled={!canProceedToStep2()}
                  className="gap-2"
                >
                  Weiter
                  <FiChevronRight />
                </Button>
              </div>
            </>
          ) : (
            <>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                  <div>
                    <p className="text-sm text-muted-foreground">Betreff</p>
                    <p className="font-semibold">{draft.subject}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Empfänger</p>
                    <p className="font-semibold">{recipientCount.toLocaleString('de-DE')}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>E-Mail Inhalt</Label>
                  <EmailEditor
                    value={draft.content}
                    onChange={(content) => setDraft({ ...draft, content })}
                  />
                </div>
              </div>

              <div className="flex justify-between gap-2">
                <Button variant="outline" onClick={() => setStep(1)} className="gap-2">
                  <FiChevronLeft />
                  Zurück
                </Button>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => onOpenChange(false)}>
                    Abbrechen
                  </Button>
                  <Button
                    onClick={handleSaveDraft}
                    disabled={isLoading || draft.content.trim() === ''}
                    className="gap-2"
                  >
                    <FiSave />
                    {isLoading ? 'Speichert...' : 'Als Entwurf speichern'}
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
