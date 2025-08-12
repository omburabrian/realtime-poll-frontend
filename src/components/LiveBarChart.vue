<script setup>
import { computed } from "vue";

const props = defineProps({
  labels: { type: Array, required: true },     // ["A", "B", "C", ...]
  counts: { type: Array, required: true },     // [12, 9, 5, ...] aligned to labels
  total:  { type: Number, default: 0 },
  title:  { type: String, default: "Live Results" }
});

// scale bars to the max so the longest bar is full width (feels snappier live)
const max = computed(() => Math.max(1, ...props.counts));
const widthPct = (i) => ((props.counts[i] / max.value) * 100).toFixed(1) + "%";
const pct = (i) => (props.total > 0 ? Math.round((props.counts[i] / props.total) * 100) : 0);
</script>

<template>
  <div class="chart">
    <div class="chart-header">
      <div class="chart-title">{{ title }}</div>
      <div class="chart-total">Responses: <strong>{{ total }}</strong></div>
    </div>

    <div v-if="labels.length" class="rows">
      <div v-for="(label, i) in labels" :key="i" class="row">
        <div class="label" :title="label">{{ label }}</div>
        <div class="track">
          <div class="fill" :style="{ width: widthPct(i) }"></div>
        </div>
        <div class="count">{{ counts[i] }} ({{ pct(i) }}%)</div>
      </div>
    </div>

    <div v-else class="empty">No options for this question.</div>
  </div>
</template>

<style scoped>
.chart { padding: 16px; }
.chart-header { display:flex; justify-content:space-between; align-items:center; margin-bottom:8px; }
.chart-title { font-weight: 600; }
.rows { display: grid; gap: 10px; }
.row { display: grid; grid-template-columns: 1fr 6fr minmax(80px, auto); gap: 10px; align-items: center; }
.label { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.track { background: rgba(0,0,0,.08); height: 18px; border-radius: 9px; overflow: hidden; }
.fill { height: 100%; border-radius: 9px; background: #3f51b5; transition: width .35s ease; }
.count { text-align: right; font-variant-numeric: tabular-nums; }
.empty { opacity:.7; font-style: italic; }
</style>
