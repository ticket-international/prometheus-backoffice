export const PERMISSION_MAP: Record<string, string[]> = {
  'Dashboard': ['Dashboard'],
  'Bestellungen': ['Transactions'],
  'Film Daten': ['Movie Data'],
  'Zahlungen': ['Transactions'],
  'Kampagnen': ['Banner', 'Customer Mailing', 'Rectangles'],
  'Mailings': ['Customer Mailing'],
  'Rectangles': ['Rectangles'],
  'Banner': ['Banner'],
  'MeinKino App': [],
  'Kunden': ['Customer Filter'],
  'Bearbeiten': ['Customer Filter'],
  'Auswertungen': ['Customer Filter'],
  'Statistiken': ['Customer Filter'],
  'Social Media': [],
  'Webseite': ['News', 'Movie Data'],
  'News': ['News'],
  'Kinoinfos': ['Movie Data'],
  'Eigene Inhalte': ['Movie Data'],
  'Verwaltung': ['Invoices Overview', 'Transactions'],
  'Abrechnungen anzeigen': ['Invoices Overview'],
  'Artikelverkauf': ['Transactions'],
  'Abrechnungen erstellen': ['Invoices Overview'],
  'Umsatzstatistik': ['Transactions'],
  'Verkaufsstatistik': ['Transactions'],
};

export function hasMenuAccess(
  menuName: string,
  isAdmin: boolean,
  authsByName: Record<string, { read: boolean; write: boolean; id: number }>
): boolean {
  if (isAdmin) return true;

  const requiredPermissions = PERMISSION_MAP[menuName];

  if (!requiredPermissions || requiredPermissions.length === 0) {
    return true;
  }

  return requiredPermissions.some(permission => {
    const auth = authsByName[permission];
    return auth && auth.read;
  });
}
