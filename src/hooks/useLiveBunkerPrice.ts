import { useEffect, useRef, useState } from 'react';
import { freightForecastHistory } from '../data/maritimeData';

// Anchors to the last real (non-forecast) VLSFO benchmark already in freightForecastHistory
// ("Today" row) instead of inventing a disconnected number. There's no free keyless bunker
// price API to poll, so this runs the same small-drift "live tick" convention already used
// elsewhere in the app (vessel/port simulation) — a bounded random walk around the anchor.
const ANCHOR_ROW = [...freightForecastHistory].reverse().find(r => r.bunkerCost != null);
const ANCHOR_PRICE = ANCHOR_ROW?.bunkerCost ?? 615;
const DRIFT_BAND = 25; // +/- USD around the anchor
const TICK_MS = 4000;
const STEP_MAX = 2;

export interface LiveBunkerPrice {
  priceUSD: number;
  anchorUSD: number;
  deltaFromAnchor: number;
  lastUpdated: Date;
}

export function useLiveBunkerPrice(): LiveBunkerPrice {
  const [priceUSD, setPriceUSD] = useState(ANCHOR_PRICE);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const priceRef = useRef(ANCHOR_PRICE);

  useEffect(() => {
    const id = setInterval(() => {
      const step = (Math.random() * 2 - 1) * STEP_MAX;
      let next = priceRef.current + step;
      const min = ANCHOR_PRICE - DRIFT_BAND;
      const max = ANCHOR_PRICE + DRIFT_BAND;
      next = Math.max(min, Math.min(max, next));
      priceRef.current = next;
      setPriceUSD(Number(next.toFixed(1)));
      setLastUpdated(new Date());
    }, TICK_MS);
    return () => clearInterval(id);
  }, []);

  return {
    priceUSD,
    anchorUSD: ANCHOR_PRICE,
    deltaFromAnchor: Number((priceUSD - ANCHOR_PRICE).toFixed(1)),
    lastUpdated
  };
}
