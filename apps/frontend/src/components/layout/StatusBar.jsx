import { useEffect, useMemo, useState } from "react";
import { Wifi, BatteryFull, BatteryMedium, BatteryLow, BatteryCharging } from "lucide-react";

function pad2(n) {
  return String(n).padStart(2, "0");
}

function formatTime(d) {
  // 9:41 AM
  let h = d.getHours();
  const m = pad2(d.getMinutes());
  const ampm = h >= 12 ? "PM" : "AM";
  h = h % 12;
  if (h === 0) h = 12;
  return `${h}:${m} ${ampm}`;
}

function formatDate(d) {
  // Mon Jul 06
  return d.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "2-digit",
  });
}

async function getBatteryInfo() {
  if (!("getBattery" in navigator)) return null;
  try {
    // Chrome/Edge soportan Battery Status API; Firefox la removió.
    const battery = await navigator.getBattery();
    return battery;
  } catch {
    return null;
  }
}

function BatteryIcon({ percent, charging }) {
  if (charging) return <BatteryCharging size={16} className="text-gray-600" />;
  if (percent <= 20) return <BatteryLow size={16} className="text-gray-600" />;
  if (percent <= 60) return <BatteryMedium size={16} className="text-gray-600" />;
  return <BatteryFull size={16} className="text-gray-600" />;
}

export default function StatusBar() {
  const [now, setNow] = useState(() => new Date());
  const [batteryPercent, setBatteryPercent] = useState(null); // number 0..100
  const [batteryCharging, setBatteryCharging] = useState(false);
  const [wifiOnline, setWifiOnline] = useState(() => (typeof navigator !== "undefined" ? navigator.onLine : true));

  // Reloj: tick cada 10s (suficiente para minutos + bajo costo)
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 10_000);
    return () => clearInterval(id);
  }, []);

  // Online/offline para icono WiFi (aprox)
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

  // Batería real si el navegador lo soporta
  useEffect(() => {
    let batteryRef = null;
    let unsub = () => {};

    (async () => {
      const battery = await getBatteryInfo();
      if (!battery) return;

      batteryRef = battery;

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
      batteryRef = null;
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
        bg-white border-b
        border-gray-100 text-xs text-gray-500
      "
      role="status"
      aria-label="Status bar"
    >
      <div className="flex items-center gap-3">
        <span className="font-semibold text-gray-900" aria-label="Current time">
          {timeStr}
        </span>
        <span aria-label="Current date">{dateStr}</span>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center" aria-label={wifiOnline ? "Online" : "Offline"}>
          <Wifi size={16} className={wifiOnline ? "text-gray-600" : "text-gray-300"} />
        </div>

        <div className="flex items-center gap-1" aria-label="Battery">
          <BatteryIcon percent={batteryPercent ?? 100} charging={batteryCharging} />
          <span>{batteryLabel}</span>
        </div>
      </div>
    </div>
  );
}