import { faker } from '@faker-js/faker';
import { Transaction, OrderItem, MailDebug } from '@/types/orders';

const movieTitles = [
  'AThe Matrix Resurrections',
  'ADune: Part Two',
  'AOppenheimer',
  'ABarbie',
  'AKillers of the Flower Moon',
  'AThe Creator',
  'AMission: Impossible',
  'AGuardians of the Galaxy Vol. 3',
  'ASpider-Man: Across the Spider-Verse',
  'AAsteroid City',
  'APast Lives',
  'APoor Things',
  'AThe Holdovers',
  'ASaltburn',
  'AMET Opera: Andrea Chenier (2025)',
  'ADer König der Löwen',
  'AAvatar: The Way of Water'
];

const ticketTypes = ['ANormal', 'AErmäßigt', 'AKind', 'ASenior', 'AStudent', 'AVIP'];
const itemTypes = ['APopcorn groß', 'ANachos', 'ACola', 'AWasser'];
const comboTypes = ['APopcorn-Cola-Combo', 'ANacho-Cola-Combo'];
const voucherTypes = ['AGutschein 10€', 'AGutschein 20€'];
const screens = ['AKino 1', 'AKino 2', 'AKino 3', 'AKino 4', 'AKino 5', 'AKino 10'];
const states = ['BOOKED', 'CANCELLED', 'REFUNDED', 'PENDING'];
const siteNames = ['Cine-World Cham', 'ticket. München', 'ticket. Berlin'];
const versions = ['2D', '3D', 'IMAX', 'IMAX 3D', 'OV', 'OmU'];

function generateItems(): OrderItem[] {
  const count = faker.number.int({ min: 1, max: 5 });
  const items: OrderItem[] = [];

  for (let i = 0; i < count; i++) {
    const itemType = faker.helpers.arrayElement(['Tickets', 'Items', 'Combos', 'Vouchers']);
    let itemName = '';

    switch(itemType) {
      case 'Tickets':
        itemName = faker.helpers.arrayElement(ticketTypes);
        break;
      case 'Items':
        itemName = faker.helpers.arrayElement(itemTypes);
        break;
      case 'Combos':
        itemName = faker.helpers.arrayElement(comboTypes);
        break;
      case 'Vouchers':
        itemName = faker.helpers.arrayElement(voucherTypes);
        break;
    }

    items.push({
      type: itemType,
      name: itemName,
      count: faker.number.int({ min: 1, max: 4 }),
      collected: faker.datatype.boolean({ probability: 0.7 }) ? 1 : 0,
      refunded: faker.datatype.boolean({ probability: 0.1 }) ? 1 : 0
    });
  }

  return items;
}

function generateMailDebug(mailSent: number): MailDebug {
  if (mailSent === 0) {
    return {
      delivered: '1899-12-30T00:00:00.000+01:00',
      opened: '1899-12-30T00:00:00.000+01:00',
      state: 'not_sent',
      stateCode: 0,
      message: ''
    };
  }

  const deliveredDate = faker.date.recent({ days: 5 });
  const isOpened = faker.datatype.boolean({ probability: 0.75 });
  const openedDate = isOpened ? faker.date.soon({ days: 1, refDate: deliveredDate }) : new Date('1899-12-30T00:00:00.000+01:00');

  return {
    delivered: deliveredDate.toISOString().replace('Z', '+01:00'),
    opened: openedDate.toISOString().replace('Z', '+01:00'),
    state: 'delivered',
    stateCode: 3,
    message: ''
  };
}

export function generateMockOrders(count: number = 20): Transaction[] {
  const transactions: Transaction[] = [];

  for (let i = 0; i < count; i++) {
    const state = faker.helpers.arrayElement(states);
    const bookDate = faker.date.recent({ days: 30 });
    const payDate = faker.date.recent({ days: 1, refDate: bookDate });
    const showDate = faker.date.soon({ days: 14, refDate: bookDate });
    const isRefunded = state === 'REFUNDED';
    const mailSent = faker.helpers.arrayElement([0, 1, 2]);
    const items = generateItems();

    const totalAmount = items.reduce((sum, item) => {
      const price = faker.number.float({ min: 8, max: 15, fractionDigits: 2 });
      return sum + (price * item.count);
    }, 0);

    const eventName = faker.helpers.arrayElement(movieTitles);

    transactions.push({
      state,
      stateID: faker.number.int({ min: 10000, max: 99999 }),
      siteName: faker.helpers.arrayElement(siteNames),
      siteID: faker.number.int({ min: 100000, max: 999999 }),
      companyID: faker.number.int({ min: 100000, max: 999999 }),
      iD: faker.string.numeric(15),
      customer: faker.person.fullName(),
      email: faker.internet.email(),
      paymentID: faker.string.numeric(6),
      paymentOwner: faker.datatype.boolean({ probability: 0.2 }) ? faker.person.fullName() : '',
      dtPay: payDate.toISOString().replace('Z', '+01:00'),
      dtBook: bookDate.toISOString().replace('Z', '+01:00'),
      dtRefund: isRefunded
        ? faker.date.soon({ days: 2, refDate: bookDate }).toISOString().replace('Z', '+01:00')
        : '1899-12-30T00:00:00.000+01:00',
      amount: Math.round(totalAmount),
      orderID: faker.number.int({ min: 1000000, max: 9999999 }),
      mailSent,
      mailDebug: generateMailDebug(mailSent),
      eventName,
      imageUrl: `https://via.placeholder.com/300x450/1a1a1a/ffffff?text=${encodeURIComponent(eventName)}`,
      eventID: faker.number.int({ min: 1000000, max: 9999999 }),
      showID: faker.number.int({ min: 10000000, max: 99999999 }),
      showTime: showDate.toISOString().replace('Z', '+01:00'),
      screen: faker.helpers.arrayElement(screens),
      version: faker.helpers.arrayElement(versions),
      items
    });
  }

  return transactions.sort((a, b) => new Date(b.dtBook).getTime() - new Date(a.dtBook).getTime());
}
