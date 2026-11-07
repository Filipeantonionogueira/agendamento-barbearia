import React from "react";
import { Link } from "react-router-dom";
import { ShieldCheck, Cookie, Settings, Check, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useConsent } from "../../context/ConsentContext.jsx";
import { Modal } from "./Modal.jsx";
import { Button } from "./Button.jsx";

export function CookieBanner() {
  const {
    consent,
    hasDecided,
    acceptAll,
    rejectNonEssential,
    savePreferences,
    isPreferencesOpen,
    openPreferences,
    closePreferences
  } = useConsent();

  // Estado local para a modal de personalização
  const [prefs, setPrefs] = React.useState({
    preferences: consent ? consent.preferences : true,
    analytics: consent ? consent.analytics : false
  });

  React.useEffect(() => {
    if (consent) {
      setPrefs({
        preferences: consent.preferences,
        analytics: consent.analytics
      });
    }
  }, [consent]);

  const handleSavePreferences = () => {
    savePreferences(prefs);
  };

  return (
    <>
      {/* Banner flutuante no rodape (visivel apenas ate a primeira decisao) */}
      <AnimatePresence>
        {!hasDecided && (
          <motion.div
            role="region"
            aria-label="Consentimento de Cookies e Privacidade"
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 32 }}
            transition={{ duration: 0.3, ease: [0.2, 0.8, 0.2, 1] }}
            className="fixed inset-x-0 bottom-0 z-50 p-3 sm:p-5"
          >
            <div className="mx-auto max-w-4xl rounded-xl border border-border bg-surface p-4 sm:p-6 shadow-2xl backdrop-blur-xl">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-3">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-gold/15 text-gold-600 dark:text-gold-400">
                    <Cookie size={22} />
                  </span>
                  <div className="text-sm">
                    <strong className="block text-base font-semibold text-text-primary">
                      Privacidade e Uso de Cookies
                    </strong>
                    <p className="mt-1 leading-relaxed text-text-secondary">
                      Utilizamos cookies essenciais para o funcionamento seguro do sistema e, com a sua permissão,
                      cookies opcionais para salvar preferências e mensurar visitas de forma anônima, em conformidade
                      com a <strong>LGPD (Lei nº 13.709/2018)</strong>. Você pode alterar suas escolhas a qualquer
                      momento.
                    </p>
                    <div className="mt-2 flex flex-wrap gap-3 text-xs">
                      <Link to="/privacidade" className="font-semibold text-gold-600 hover:underline dark:text-gold-400">
                        Política de Privacidade
                      </Link>
                      <Link to="/termos" className="text-text-muted hover:text-text-primary hover:underline">
                        Termos de Uso
                      </Link>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 sm:shrink-0">
                  <Button variant="ghost" size="sm" onClick={openPreferences}>
                    <Settings size={15} /> Personalizar
                  </Button>
                  <Button variant="secondary" size="sm" onClick={rejectNonEssential}>
                    Apenas necessários
                  </Button>
                  <Button variant="primary" size="sm" onClick={acceptAll}>
                    Aceitar todos
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal de Personalizacao Granular de Cookies */}
      {isPreferencesOpen && (
        <Modal
          title="Preferências de Cookies e Privacidade"
          onClose={closePreferences}
          icon={<ShieldCheck className="text-gold-600 dark:text-gold-400" />}
        >
          <div className="space-y-4 text-sm">
            <p className="text-text-secondary">
              Gerencie abaixo quais categorias de cookies você autoriza. Os cookies necessários não podem ser desativados
              pois são indispensáveis para a segurança e autenticação do sistema.
            </p>

            {/* Categoria 1: Necessarios */}
            <div className="rounded-lg border border-border bg-surface-subtle p-3.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-text-primary">Cookies Estritamente Necessários</span>
                  <span className="rounded bg-brand/10 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider text-brand">
                    Sempre ativo
                  </span>
                </div>
                <div className="grid h-6 w-6 place-items-center rounded-full bg-feedback-success/20 text-feedback-success">
                  <Check size={14} />
                </div>
              </div>
              <p className="mt-1.5 text-xs text-text-secondary leading-relaxed">
                Essenciais para autenticação segura com cookies HTTPOnly (sessão e renovação), proteção contra ataques
                CSRF e garantia do fluxo de agendamento. Sem eles, o site não funciona corretamente.
              </p>
            </div>

            {/* Categoria 2: Preferencias */}
            <div className="rounded-lg border border-border bg-surface p-3.5">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-text-primary">Preferências e Funcionalidades</span>
                <label className="relative inline-flex cursor-pointer items-center">
                  <input
                    type="checkbox"
                    className="peer sr-only"
                    checked={prefs.preferences}
                    onChange={(e) => setPrefs({ ...prefs, preferences: e.target.checked })}
                  />
                  <div className="h-6 w-11 rounded-full bg-border-strong peer peer-checked:bg-gold peer-focus:ring-2 peer-focus:ring-gold/30 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:after:translate-x-full"></div>
                </label>
              </div>
              <p className="mt-1.5 text-xs text-text-secondary leading-relaxed">
                Salva suas preferências de interface (como modo claro ou escuro) no navegador para proporcionar uma
                experiência consistente em seus próximos acessos.
              </p>
            </div>

            {/* Categoria 3: Analiticos */}
            <div className="rounded-lg border border-border bg-surface p-3.5">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-text-primary">Métricas e Estatísticas Anônimas</span>
                <label className="relative inline-flex cursor-pointer items-center">
                  <input
                    type="checkbox"
                    className="peer sr-only"
                    checked={prefs.analytics}
                    onChange={(e) => setPrefs({ ...prefs, analytics: e.target.checked })}
                  />
                  <div className="h-6 w-11 rounded-full bg-border-strong peer peer-checked:bg-gold peer-focus:ring-2 peer-focus:ring-gold/30 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:after:translate-x-full"></div>
                </label>
              </div>
              <p className="mt-1.5 text-xs text-text-secondary leading-relaxed">
                Permite contabilizar visitas agregadas e páginas visualizadas para que a barbearia compreenda os horários
                e dias de maior movimento, aprimorando a capacidade de atendimento. Não rastreia você individualmente em
                outros sites e não é compartilhado com anunciantes.
              </p>
            </div>

            <div className="rounded-md border border-border/70 bg-surface-subtle p-3 text-xs text-text-muted">
              Você pode alterar ou revogar suas escolhas a qualquer momento clicando no link{" "}
              <strong>Preferências de Cookies</strong> localizado no rodapé de todas as páginas.
            </div>

            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end pt-2">
              <Button variant="ghost" onClick={closePreferences}>
                Cancelar
              </Button>
              <Button variant="secondary" onClick={rejectNonEssential}>
                Rejeitar opcionais
              </Button>
              <Button variant="primary" onClick={handleSavePreferences}>
                Salvar minhas escolhas
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}
