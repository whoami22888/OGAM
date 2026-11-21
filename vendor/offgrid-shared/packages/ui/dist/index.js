
"use strict";

function sampleProgressRate(samples, now, bytes) {
  const next = { t: now, bytes, rate: 0 };
  if (!Array.isArray(samples)) return { samples: [next], rate: 0 };
  const prev = samples[samples.length - 1];
  if (prev && now > prev.t) {
    next.rate = Math.max(0, (bytes - prev.bytes) / ((now - prev.t) / 1000));
  }
  const kept = samples.concat(next).slice(-8);
  return { samples: kept, rate: next.rate };
}

function projectProgress(entry) {
  const progress = entry && typeof entry.progress === "number" ? entry.progress : 0;
  return {
    fraction: Math.min(1, Math.max(0, progress)),
    label: entry && entry.status ? String(entry.status) : "",
    indeterminate: !progress,
  };
}

module.exports = {
  sampleProgressRate,
  projectProgress,
};
