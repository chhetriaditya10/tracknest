import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { track } from "@vercel/analytics";

export default function AnalyticsTracker() {
  const location = useLocation();

  useEffect(() => {
    track("pageview", { path: location.pathname });
  }, [location.pathname]);

  return null;
}
