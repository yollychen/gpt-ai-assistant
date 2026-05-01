import type { Flight, FlightSearchParams, FlightSearchResult } from '../types/flight'

// ---------------------------------------------------------------------------
// Mock Data
// ---------------------------------------------------------------------------

const MOCK_FLIGHTS: Flight[] = [
  {
    id: 'CI101',
    airline: '中華航空',
    airlineCode: 'CI',
    flightNumber: 'CI 101',
    origin: '台北',
    originCode: 'TPE',
    destination: '東京',
    destinationCode: 'NRT',
    departureTime: '08:00',
    arrivalTime: '12:30',
    duration: '3h 30m',
    price: 12800,
    currency: 'TWD',
    seatsAvailable: 42,
    cabinClass: 'economy',
  },
  {
    id: 'BR201',
    airline: '長榮航空',
    airlineCode: 'BR',
    flightNumber: 'BR 201',
    origin: '台北',
    originCode: 'TPE',
    destination: '東京',
    destinationCode: 'NRT',
    departureTime: '13:45',
    arrivalTime: '18:15',
    duration: '3h 30m',
    price: 11500,
    currency: 'TWD',
    seatsAvailable: 8,
    cabinClass: 'economy',
  },
  {
    id: 'JL802',
    airline: '日本航空',
    airlineCode: 'JL',
    flightNumber: 'JL 802',
    origin: '台北',
    originCode: 'TPE',
    destination: '東京',
    destinationCode: 'NRT',
    departureTime: '19:20',
    arrivalTime: '23:50',
    duration: '3h 30m',
    price: 15200,
    currency: 'TWD',
    seatsAvailable: 25,
    cabinClass: 'economy',
  },
  {
    id: 'CI601-BIZ',
    airline: '中華航空',
    airlineCode: 'CI',
    flightNumber: 'CI 601',
    origin: '台北',
    originCode: 'TPE',
    destination: '香港',
    destinationCode: 'HKG',
    departureTime: '09:10',
    arrivalTime: '10:55',
    duration: '1h 45m',
    price: 32000,
    currency: 'TWD',
    seatsAvailable: 6,
    cabinClass: 'business',
  },
  {
    id: 'CX465',
    airline: '國泰航空',
    airlineCode: 'CX',
    flightNumber: 'CX 465',
    origin: '台北',
    originCode: 'TPE',
    destination: '香港',
    destinationCode: 'HKG',
    departureTime: '14:30',
    arrivalTime: '16:15',
    duration: '1h 45m',
    price: 8900,
    currency: 'TWD',
    seatsAvailable: 55,
    cabinClass: 'economy',
  },
  {
    id: 'SQ872',
    airline: '新加坡航空',
    airlineCode: 'SQ',
    flightNumber: 'SQ 872',
    origin: '台北',
    originCode: 'TPE',
    destination: '新加坡',
    destinationCode: 'SIN',
    departureTime: '11:00',
    arrivalTime: '16:30',
    duration: '4h 30m',
    price: 18500,
    currency: 'TWD',
    seatsAvailable: 30,
    cabinClass: 'economy',
  },
]

// ---------------------------------------------------------------------------
// Mock search — simulates network delay and basic filtering
// ---------------------------------------------------------------------------

function normalizeCityName(name: string): string {
  return name.trim().toLowerCase()
}

async function searchFlightsMock(params: FlightSearchParams): Promise<FlightSearchResult> {
  await new Promise((resolve) => setTimeout(resolve, 800))

  const origin = normalizeCityName(params.origin)
  const destination = normalizeCityName(params.destination)

  const filtered = MOCK_FLIGHTS.filter((f) => {
    const matchOrigin =
      normalizeCityName(f.origin).includes(origin) ||
      normalizeCityName(f.originCode).includes(origin)
    const matchDest =
      normalizeCityName(f.destination).includes(destination) ||
      normalizeCityName(f.destinationCode).includes(destination)
    return matchOrigin && matchDest
  })

  return {
    flights: filtered,
    searchParams: params,
    totalCount: filtered.length,
  }
}

// ---------------------------------------------------------------------------
// Gemini API integration (placeholder — implement when API key is available)
// ---------------------------------------------------------------------------

async function searchFlightsWithGemini(params: FlightSearchParams): Promise<FlightSearchResult> {
  const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`

  const prompt = `
    你是一個航班查詢助理。請根據以下條件查詢航班資訊並以 JSON 格式回傳：
    - 出發地: ${params.origin}
    - 目的地: ${params.destination}
    - 日期: ${params.date}

    請回傳格式如下的 JSON 陣列：
    [{ "airline": "...", "flightNumber": "...", "departureTime": "...", "arrivalTime": "...", "price": 0 }]
  `

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
    }),
  })

  if (!response.ok) throw new Error(`Gemini API error: ${response.status}`)

  const data = await response.json()
  const text: string = data.candidates[0].content.parts[0].text
  const flights: Flight[] = JSON.parse(text)

  return { flights, searchParams: params, totalCount: flights.length }
}

// ---------------------------------------------------------------------------
// Public API — swap searchFlightsMock with searchFlightsWithGemini when ready
// ---------------------------------------------------------------------------

export async function searchFlights(params: FlightSearchParams): Promise<FlightSearchResult> {
  // return searchFlightsMock(params)
  return searchFlightsWithGemini(params)
}
