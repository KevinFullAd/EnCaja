import { useEffect, useMemo, useState } from "react";
import { Wifi, BatteryFull, BatteryMedium, BatteryLow, BatteryCharging } from "lucide-react";

function pad2(n) {
  return String(n).padStart(2, "0");
}

function formatTime(d) {
  let h = d.getHours();
  const m = pad2(d.getMinutes());
  const ampm = h >= 12 ? "PM" : "AM";
  h = h % 12;
  if (h === 0) h = 12;
  return `${h}:${m} ${ampm}`;
}

function formatDate(d) {
  return d.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "2-digit",
  });
}

async function getBatteryInfo() {
  if (!("getBattery" in navigator)) return null;
  try {
    const battery = await navigator.getBattery();
    return battery;
  } catch {
    return null;
  }
}

function BatteryIcon({ percent, charging }) {
  const cls = "text-[var(--app-muted)]";
  if (charging) return <BatteryCharging size={16} className={cls} />;
  if (percent <= 20) return <BatteryLow size={16} className={cls} />;
  if (percent <= 60) return <BatteryMedium size={16} className={cls} />;
  return <BatteryFull size={16} className={cls} />;
}

export default function StatusBar() {
  const [now, setNow] = useState(() => new Date());
  const [batteryPercent, setBatteryPercent] = useState(null);
  const [batteryCharging, setBatteryCharging] = useState(false);
  const [wifiOnline, setWifiOnline] = useState(() =>
    typeof navigator !== "undefined" ? navigator.onLine : true
  );

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 10_000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const onUp = () => setWifiOnline(true);
    const onDown = () => setWifiOnline(false);
    window.addEventListener("online", onUp);
    window.addEventListener("offline", onDown);
    return () => {
      window.removeEventListener("online", onUp);
      window.removeEventListener("offline", onDown);
    };
  }, []);

  useEffect(() => {
    let unsub = () => {};

    (async () => {
      const battery = await getBatteryInfo();
      if (!battery) return;

      const sync = () => {
        setBatteryPercent(Math.round(battery.level * 100));
        setBatteryCharging(Boolean(battery.charging));
      };

      sync();

      battery.addEventListener("levelchange", sync);
      battery.addEventListener("chargingchange", sync);

      unsub = () => {
        battery.removeEventListener("levelchange", sync);
        battery.removeEventListener("chargingchange", sync);
      };
    })();

    return () => {
      try {
        unsub();
      } catch {}
    };
  }, []);

  const timeStr = useMemo(() => formatTime(now), [now]);
  const dateStr = useMemo(() => formatDate(now), [now]);
  const batteryLabel = batteryPercent == null ? "—" : `${batteryPercent}%`;

  return (
    <div
      className="
        flex items-center justify-between
        px-5 py-2
        bg-[var(--app-surface)] border-b border-[var(--app-border)]
        text-xs text-[var(--app-muted)]
      "
      role="status"
      aria-label="Status bar"
    >
      <div className="flex items-center gap-3">
        <span className="font-semibold text-[var(--app-text)]" aria-label="Current time">
          {timeStr}
        </span>
        <span aria-label="Current date">{dateStr}</span>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center" aria-label={wifiOnline ? "Online" : "Offline"}>
          <Wifi
            size={16}
            className={wifiOnline ? "text-[var(--app-muted)]" : "text-[var(--app-border)]"}
          />
        </div>

        <div className="flex items-center gap-1" aria-label="Battery">
          <BatteryIcon percent={batteryPercent ?? 100} charging={batteryCharging} />
          <span>{batteryLabel}</span>
        </div>
      </div>
    </div>
  );
}