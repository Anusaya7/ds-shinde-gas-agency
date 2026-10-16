const STORAGE_KEY = 'ds-shinde-customer-booking-location';

export function saveCustomerBookingCoordinates(latitude: number, longitude: number): void {
  if (
    !Number.isFinite(latitude) ||
    !Number.isFinite(longitude) ||
    latitude < -90 ||
    latitude > 90 ||
    longitude < -180 ||
    longitude > 180
  ) {
    throw new Error('The browser returned invalid location coordinates.');
  }

  sessionStorage.setItem(STORAGE_KEY, `${latitude},${longitude}`);
}

export function getCustomerBookingMapLink(): string {
  const savedCoordinates = sessionStorage.getItem(STORAGE_KEY);
  if (!savedCoordinates) return '';

  const match = /^(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)$/.exec(savedCoordinates);
  if (!match) {
    throw new Error('The saved location is invalid. Enter your delivery address manually.');
  }

  const latitude = Number(match[1]);
  const longitude = Number(match[2]);
  if (
    !Number.isFinite(latitude) ||
    !Number.isFinite(longitude) ||
    latitude < -90 ||
    latitude > 90 ||
    longitude < -180 ||
    longitude > 180
  ) {
    throw new Error('The saved location is invalid. Enter your delivery address manually.');
  }

  return `https://www.google.com/maps?q=${latitude},${longitude}`;
}

export function clearCustomerBookingCoordinates(): void {
  sessionStorage.removeItem(STORAGE_KEY);
}
