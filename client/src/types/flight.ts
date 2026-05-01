export interface FlightSearchParams {
  origin: string
  destination: string
  date: string
}

export interface Flight {
  id: string
  airline: string
  airlineCode: string
  flightNumber: string
  origin: string
  originCode: string
  destination: string
  destinationCode: string
  departureTime: string
  arrivalTime: string
  duration: string
  price: number
  currency: string
  seatsAvailable: number
  cabinClass: 'economy' | 'business' | 'first'
}

export interface FlightSearchResult {
  flights: Flight[]
  searchParams: FlightSearchParams
  totalCount: number
}
