import React from "react";

const CONSENT_STORAGE_KEY = "lgpd_cookie_consent_v1";
const CONSENT_VERSION = "1.0";

const ConsentContext = React.createContext(null);

function loadSavedConsent() {
  try {
    const raw = localStorage.getItem(CONSENT_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && parsed.version === CONSENT_VERSION) {
      return parsed;
    }
    return null;
  } catch {
    return null;
  }
}

export function ConsentProvider({ children }) {
  const [consent, setConsent] = React.useState(loadSavedConsent);
  const [isPreferencesOpen, setIsPreferencesOpen] = React.useState(false);

  const saveConsent = React.useCallback((preferences, analytics) => {
    const record = {
      necessary: true,
      preferences: Boolean(preferences),
      analytics: Boolean(analytics),
      timestamp: new Date().toISOString(),
      version: CONSENT_VERSION
    };
    try {
      localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(record));
    } catch {
      // storage restrito
    }
    setConsent(record);
    setIsPreferencesOpen(false);
  }, []);

  const acceptAll = React.useCallback(() => {
    saveConsent(true, true);
  }, [saveConsent]);

  const rejectNonEssential = React.useCallback(() => {
    saveConsent(false, false);
  }, [saveConsent]);

  const savePreferences = React.useCallback(
    ({ preferences = false, analytics = false }) => {
      saveConsent(preferences, analytics);
    },
    [saveConsent]
  );

  const openPreferences = React.useCallback(() => {
    setIsPreferencesOpen(true);
  }, []);

  const closePreferences = React.useCallback(() => {
    setIsPreferencesOpen(false);
  }, []);

  const value = React.useMemo(
    () => ({
      consent,
      hasDecided: consent !== null,
      acceptAll,
      rejectNonEssential,
      savePreferences,
      isPreferencesOpen,
      openPreferences,
      closePreferences
    }),
    [consent, acceptAll, rejectNonEssential, savePreferences, isPreferencesOpen, openPreferences, closePreferences]
  );

  return <ConsentContext.Provider value={value}>{children}</ConsentContext.Provider>;
}

export function useConsent() {
  const context = React.useContext(ConsentContext);
  if (!context) {
    throw new Error("useConsent deve ser utilizado dentro de ConsentProvider.");
  }
  return context;
}
