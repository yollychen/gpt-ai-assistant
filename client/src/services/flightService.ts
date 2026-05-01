import { GoogleGenAI } from '@google/genai'
import type { Flight, FlightSearchParams, FlightSearchResult } from '../types/flight'

// ---------------------------------------------------------------------------
// Gemini client（使用 @google/genai SDK）
// ---------------------------------------------------------------------------

const genAI = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY as string })

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
// Gemini API + Google Search grounding
// ---------------------------------------------------------------------------

async function searchFlightsWithGemini(params: FlightSearchParams): Promise<FlightSearchResult> {
  const prompt = `
請使用 Google 搜尋查詢 ${params.date} 從 ${params.origin} 到 ${params.destination} 的即時航班票價。

搜尋後請「只」回傳一個 JSON 陣列，不要加任何說明文字或 markdown 格式，每筆格式如下：
[
  {
    "id": "唯一代碼，例如 CI101",
    "airline": "航空公司中文名稱",
    "airlineCode": "兩字母IATA代碼，例如 CI",
    "flightNumber": "完整班號，例如 CI 101",
    "origin": "${params.origin}",
    "originCode": "出發機場IATA代碼",
    "destination": "${params.destination}",
    "destinationCode": "目的地機場IATA代碼",
    "departureTime": "HH:MM 格式",
    "arrivalTime": "HH:MM 格式",
    "duration": "例如 3h 30m",
    "price": 數字（台幣，不含單位）,
    "currency": "TWD",
    "seatsAvailable": 數字,
    "cabinClass": "economy 或 business 或 first"
  }
]
`

  const result = await genAI.models.generateContent({
    model: 'gemini-2.0-flash',
    contents: prompt,
    config: {
      tools: [{ googleSearch: {} }],
    },
  })

  const rawText = result.text ?? ''

  // Strip markdown code fences if present
  const jsonText = rawText.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/m, '').trim()
  const flights: Flight[] = JSON.parse(jsonText)

  return { flights, searchParams: params, totalCount: flights.length }
}

// ---------------------------------------------------------------------------
// Public API — swap searchFlightsMock with searchFlightsWithGemini when ready
// ---------------------------------------------------------------------------

export async function searchFlights(params: FlightSearchParams): Promise<FlightSearchResult> {
  // return searchFlightsMock(params)
  return searchFlightsWithGemini(params)
}
