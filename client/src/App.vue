<template>
  <div class="page">
    <header class="header">
      <div class="header-inner">
        <span class="logo">✈ 航班查詢系統</span>
        <span class="header-sub">Flight Search</span>
      </div>
    </header>

    <main class="main">
      <FlightSearch :loading="loading" @search="handleSearch" />

      <div v-if="error" class="error-banner">
        {{ error }}
      </div>

      <FlightResults :result="searchResult" :searched="searched" />
    </main>

    <footer class="footer">
      <p>資料僅供展示用途 · 串接 Gemini API 後將顯示即時航班資訊</p>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import FlightSearch from './components/FlightSearch.vue'
import FlightResults from './components/FlightResults.vue'
import { searchFlights } from './services/flightService'
import type { FlightSearchParams, FlightSearchResult } from './types/flight'

const loading = ref(false)
const searched = ref(false)
const error = ref<string | null>(null)
const searchResult = ref<FlightSearchResult | null>(null)

async function handleSearch(params: FlightSearchParams) {
  loading.value = true
  error.value = null
  searched.value = true

  try {
    searchResult.value = await searchFlights(params)
  } catch (e) {
    error.value = '查詢失敗，請稍後再試。'
    searchResult.value = null
  } finally {
    loading.value = false
  }
}
</script>

<style>
*, *::before, *::after {
  box-sizing: border-box;
}

body {
  margin: 0;
  font-family: 'Noto Sans TC', 'PingFang TC', 'Microsoft JhengHei', sans-serif;
  background: linear-gradient(135deg, #e0f2fe 0%, #f0f9ff 50%, #e8f4fd 100%);
  min-height: 100vh;
  color: #1a202c;
}

.page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.header {
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.6);
  padding: 1rem 1.5rem;
  position: sticky;
  top: 0;
  z-index: 10;
}

.header-inner {
  max-width: 960px;
  margin: 0 auto;
  display: flex;
  align-items: baseline;
  gap: 0.75rem;
}

.logo {
  font-size: 1.3rem;
  font-weight: 700;
  color: #2b6cb0;
}

.header-sub {
  font-size: 0.85rem;
  color: #90cdf4;
  letter-spacing: 0.05em;
}

.main {
  flex: 1;
  max-width: 960px;
  width: 100%;
  margin: 2rem auto;
  padding: 0 1rem;
}

.error-banner {
  background: #fff5f5;
  border: 1px solid #feb2b2;
  color: #c53030;
  border-radius: 8px;
  padding: 0.8rem 1.2rem;
  margin-top: 1rem;
  font-size: 0.9rem;
}

.footer {
  text-align: center;
  padding: 1.5rem;
  font-size: 0.78rem;
  color: #a0aec0;
}
</style>
