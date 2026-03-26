"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { Phone, X, User, Clock, PhoneCall } from "lucide-react";
import Link from "next/link";
import { Avatar } from "@/components/ui/Avatar";

interface IncomingCall {
  id: string;
  customer_id: string | null;
  customer_name: string | null;
  customer_phone: string;
  started_at: string;
  status: string;
}

export function LiveCallNotifications() {
  const [incomingCalls, setIncomingCalls] = useState<IncomingCall[]>([]);
  const [hasPermission, setHasPermission] = useState<NotificationPermission>("default");
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playingCallId, setPlayingCallId] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      setHasPermission(Notification.permission);
    }

    const audio = new Audio("/sounds/incoming-call.mp3");
    audio.loop = true;
    audioRef.current = audio;

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const requestNotificationPermission = async () => {
    if ("Notification" in window) {
      const permission = await Notification.requestPermission();
      setHasPermission(permission);
    }
  };

  const pollForCalls = useCallback(async () => {
    try {
      const res = await fetch("/api/calls/live");
      if (res.ok) {
        const data = await res.json();
        const newCalls = data.calls || [];

        if (newCalls.length > incomingCalls.length) {
          const newestCall = newCalls[0];
          
          if (audioRef.current && !playingCallId) {
            audioRef.current.play().catch(console.error);
            setPlayingCallId(newestCall.id);
          }

          if (hasPermission === "granted") {
            new Notification("Incoming Call", {
              body: `${newestCall.customer_name || newestCall.customer_phone} is calling`,
              icon: "/icons/phone-icon.png",
              badge: "/icons/phone-badge.png",
              tag: `call-${newestCall.id}`,
              requireInteraction: true,
            });
          }
        }

        setIncomingCalls(newCalls);
      }
    } catch (error) {
      console.error("Failed to fetch live calls:", error);
    }
  }, [incomingCalls.length, hasPermission, playingCallId]);

  useEffect(() => {
    const interval = setInterval(pollForCalls, 2000);
    pollForCalls();

    return () => clearInterval(interval);
  }, [pollForCalls]);

  const dismissCall = (callId: string) => {
    setIncomingCalls((prev) => prev.filter((c) => c.id !== callId));
    
    if (playingCallId === callId && audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setPlayingCallId(null);
    }
  };

  const dismissAll = () => {
    setIncomingCalls([]);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setPlayingCallId(null);
  };

  if (incomingCalls.length === 0 && hasPermission !== "default") {
    return null;
  }

  return (
    <>
      {hasPermission === "default" && (
        <div className="fixed top-4 right-4 z-50 max-w-sm">
          <div className="bg-gradient-to-br from-brand-500 to-brand-600 text-white rounded-xl shadow-2xl p-4 border border-brand-400">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <Phone size={20} />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold mb-1">Enable Call Notifications</h3>
                <p className="text-sm text-white/90 mb-3">
                  Get instant alerts when customers call, even if you're on another tab.
                </p>
                <button
                  onClick={requestNotificationPermission}
                  className="bg-white text-brand-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-white/90 transition-all"
                >
                  Enable Notifications
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {incomingCalls.length > 0 && (
        <div className="fixed top-4 right-4 z-50 space-y-3 max-w-sm">
          {incomingCalls.map((call) => (
            <div
              key={call.id}
              className="bg-white rounded-xl shadow-2xl border-2 border-brand-500 overflow-hidden animate-bounce-gentle"
            >
              <div className="bg-gradient-to-r from-brand-500 to-brand-600 px-4 py-2 flex items-center justify-between">
                <div className="flex items-center gap-2 text-white">
                  <PhoneCall size={18} className="animate-pulse" />
                  <span className="text-sm font-bold uppercase tracking-wide">Incoming Call</span>
                </div>
                <button
                  onClick={() => dismissCall(call.id)}
                  className="text-white/80 hover:text-white transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="p-4">
                <div className="flex items-start gap-3 mb-4">
                  <Avatar
                    firstName={call.customer_name?.split(" ")[0] || "Unknown"}
                    lastName={call.customer_name?.split(" ").slice(1).join(" ") || ""}
                    size="md"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-warm-900 truncate">
                      {call.customer_name || "Unknown Caller"}
                    </h3>
                    <p className="text-sm text-warm-600 font-mono">{call.customer_phone}</p>
                    <div className="flex items-center gap-1 text-xs text-warm-500 mt-1">
                      <Clock size={12} />
                      <span>{formatTime(call.started_at)}</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Link
                    href={`/dashboard/calls/${call.id}`}
                    className="flex-1 bg-brand-500 hover:bg-brand-600 text-white px-4 py-2 rounded-lg text-sm font-medium text-center transition-all"
                    onClick={() => dismissCall(call.id)}
                  >
                    View Call
                  </Link>
                  {call.customer_id && (
                    <Link
                      href={`/dashboard/customers/${call.customer_id}`}
                      className="flex-1 bg-warm-100 hover:bg-warm-200 text-warm-900 px-4 py-2 rounded-lg text-sm font-medium text-center transition-all"
                      onClick={() => dismissCall(call.id)}
                    >
                      View Customer
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ))}

          {incomingCalls.length > 1 && (
            <button
              onClick={dismissAll}
              className="w-full bg-warm-800 hover:bg-warm-900 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all"
            >
              Dismiss All ({incomingCalls.length})
            </button>
          )}
        </div>
      )}
    </>
  );
}

function formatTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSecs = Math.floor(diffMs / 1000);

  if (diffSecs < 60) return `${diffSecs}s ago`;
  if (diffSecs < 3600) return `${Math.floor(diffSecs / 60)}m ago`;
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}
