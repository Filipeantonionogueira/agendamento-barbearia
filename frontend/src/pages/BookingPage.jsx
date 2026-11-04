import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { useSearchParams } from "react-router-dom";
import { Navbar } from "../components/layout/Navbar.jsx";
import { Hero } from "../components/landing/Hero.jsx";
import { StepProgress } from "../components/booking/StepProgress.jsx";
import { ServiceStep } from "../components/booking/ServiceStep.jsx";
import { ProfessionalStep } from "../components/booking/ProfessionalStep.jsx";
import { DateTimeStep } from "../components/booking/DateTimeStep.jsx";
import { DetailsStep } from "../components/booking/DetailsStep.jsx";
import { SummarySidebar } from "../components/booking/SummarySidebar.jsx";
import { SectionHeader } from "../components/landing/SectionHeader.jsx";
import { Sobre } from "../components/landing/Sobre.jsx";
import { ServicosShowcase } from "../components/landing/ServicosShowcase.jsx";
import { ProfissionaisShowcase } from "../components/landing/ProfissionaisShowcase.jsx";
import { Galeria } from "../components/landing/Galeria.jsx";
import { Depoimentos } from "../components/landing/Depoimentos.jsx";
import { Instagram } from "../components/landing/Instagram.jsx";
import { Faq } from "../components/landing/Faq.jsx";
import { Localizacao } from "../components/landing/Localizacao.jsx";
import { Footer } from "../components/landing/Footer.jsx";
import { api } from "../lib/api.js";
import { today } from "../lib/format.js";
import { useAuth } from "../context/AuthProvider.jsx";
import { useFavorites } from "../hooks/useFavorites.js";
import { serviceNames } from "../lib/appointment.js";
import { useTrackVisit } from "../hooks/useTrackVisit.js";

const STEPS = [
  { id: "servicos", label: "Servicos" },
  { id: "profissional", label: "Profissional" },
  { id: "horario", label: "Data e hora" },
  { id: "dados", label: "Seus dados" }
];

export function BookingPage() {
  useTrackVisit("/");
  const reduceMotion = useReducedMotion();
  const { user } = useAuth();
  const favorites = useFavorites();
  const [params] = useSearchParams();

  const [config, setConfig] = React.useState(null);
  const [services, setServices] = React.useState([]);
  const [selected, setSelected] = React.useState([]);
  const [professionals, setProfessionals] = React.useState([]);
  const [professionalId, setProfessionalId] = React.useState("");
  const [date, setDate] = React.useState(today());
  const [slots, setSlots] = React.useState([]);
  const [loadingSlots, setLoadingSlots] = React.useState(false);
  const [time, setTime] = React.useState("");
  const [clientName, setClientName] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [notes, setNotes] = React.useState("");
  const [message, setMessage] = React.useState("");
  const [messageVariant, setMessageVariant] = React.useState("info");
  const [submitting, setSubmitting] = React.useState(false);
  const [waitlistMessage, setWaitlistMessage] = React.useState("");

  const [step, setStep] = React.useState(0);
  const [direction, setDirection] = React.useState(1);

  React.useEffect(() => {
    api("/configuracoes/publica").then(setConfig).catch(() => setConfig({}));
    api("/servicos").then(setServices).catch((error) => setMessage(error.message));
    api("/profissionais").then(setProfessionals).catch((error) => setMessage(error.message));
  }, []);

  // Reagendamento/atalho: pre-seleciona servicos e profissional a partir da URL.
  React.useEffect(() => {
    if (!services.length) return;
    const svc = params.get("servicos");
    if (svc) {
      const ids = svc.split(",").filter((id) => services.some((s) => s.id === id));
      if (ids.length) setSelected(ids);
    }
    const prof = params.get("prof");
    if (prof && professionals.some((p) => p.id === prof)) setProfessionalId(prof);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [services, professionals]);

  // Cliente logado: pre-preenche os dados a partir do perfil.
  React.useEffect(() => {
    if (!user) return;
    setClientName((current) => current || user.name || "");
    setPhone((current) => current || user.phone || "");
  }, [user]);

  React.useEffect(() => {
    setTime("");
    if (!selected.length || !professionalId) {
      setSlots([]);
      return;
    }
    setLoadingSlots(true);
    api(`/disponibilidade?date=${date}&serviceIds=${selected.join(",")}&professionalId=${professionalId}`)
      .then((data) => setSlots(data.slots || []))
      .catch(() => setSlots([]))
      .finally(() => setLoadingSlots(false));
  }, [date, selected, professionalId]);

  const content = config?.content;
  const sections = content?.sections || [];
  const sectionOf = (key) => sections.find((section) => section.key === key);
  const isEnabled = (key) => {
    const section = sectionOf(key);
    return !section || section.enabled;
  };

  const selectedServices = services.filter((service) => selected.includes(service.id));
  const selectedProfessional = professionals.find((professional) => professional.id === professionalId);
  const total = selectedServices.reduce((sum, service) => sum + service.priceCents, 0);
  const totalMinutes = selectedServices.reduce((sum, service) => sum + service.estimatedMinutes, 0);

  // Regra de avanco por etapa (mesmas validacoes que o backend exige na confirmacao).
  const stepReady = [selected.length > 0, !!professionalId, !!time, clientName.trim().length >= 2];
  const completedSteps = stepReady.map((ready, index) => (ready ? index : -1)).filter((index) => index >= 0);

  function goTo(next) {
    setDirection(next > step ? 1 : -1);
    setStep(next);
    document.getElementById("agendamento")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function toggleService(id) {
    setSelected((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]));
  }

  /** Atalho da landing: escolhe o item e leva o cliente direto ao passo certo. */
  function quickSelectService(id) {
    setSelected((current) => (current.includes(id) ? current : [...current, id]));
    setDirection(1);
    setStep(1);
    document.getElementById("agendamento")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function quickSelectProfessional(id) {
    setProfessionalId(id);
    setDirection(1);
    setStep(selected.length ? 2 : 0);
    document.getElementById("agendamento")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  async function joinWaitlist() {
    setWaitlistMessage("");
    try {
      await api("/lista-espera", {
        method: "POST",
        body: JSON.stringify({ professionalId, date, serviceIds: selected })
      });
      setWaitlistMessage("Pronto! Avisaremos se abrir vaga.");
    } catch (error) {
      setWaitlistMessage(error.message);
    }
  }

  async function confirm() {
    setMessage("");
    setSubmitting(true);
    try {
      const appointment = await api("/agendamentos", {
        method: "POST",
        body: JSON.stringify({
          clientName,
          phone,
          date,
          time,
          serviceIds: selected,
          professionalId,
          notes: notes || null
        })
      });
      const text = encodeURIComponent(
        `Novo Agendamento!\n\nCliente: ${appointment.client.name}\nServicos: ${serviceNames(appointment)}\nProfissional: ${appointment.professional.name}\nHorario: ${date} as ${time}\nValor: R$ ${(appointment.totalPriceCents / 100).toFixed(2)}\nTelefone: ${phone || "Nao informado"}`
      );
      window.open(`https://wa.me/${appointment.barber.whatsappNumber}?text=${text}`, "_blank");
      setMessageVariant("success");
      setMessage("Solicitacao de agendamento enviada! Status: Pendente. O WhatsApp foi aberto para contato com a barbearia.");
    } catch (error) {
      setMessageVariant("danger");
      setMessage(error.message);
    } finally {
      setSubmitting(false);
    }
  }

  const shopName = config?.shopName || "Lukaobarber7";
  const bookingSection = sectionOf("agendamento");

  function renderStep() {
    if (step === 1) {
      return (
        <ProfessionalStep
          key="step-1"
          professionals={professionals}
          professionalId={professionalId}
          onSelect={setProfessionalId}
          favoriteIds={favorites.enabled ? favorites.favoriteProfessionalIds : undefined}
          onToggleFavorite={favorites.enabled ? favorites.toggle : undefined}
        />
      );
    }
    if (step === 2) {
      return (
        <DateTimeStep
          key="step-2"
          date={date}
          onDateChange={setDate}
          slots={slots}
          time={time}
          onTimeChange={setTime}
          loading={loadingSlots}
          ready={selected.length > 0 && !!professionalId}
          canWaitlist={!!user && !!professionalId && selected.length > 0}
          onJoinWaitlist={joinWaitlist}
          waitlistMessage={waitlistMessage}
        />
      );
    }
    if (step === 3) {
      return (
        <DetailsStep
          key="step-3"
          clientName={clientName}
          onClientNameChange={setClientName}
          phone={phone}
          onPhoneChange={setPhone}
          notes={notes}
          onNotesChange={setNotes}
        />
      );
    }
    return (
      <ServiceStep
        key="step-0"
        services={services}
        selected={selected}
        onToggle={toggleService}
        favoriteIds={favorites.enabled ? favorites.favoriteServiceIds : undefined}
        onToggleFavorite={favorites.enabled ? favorites.toggle : undefined}
      />
    );
  }

  const sectionRenderers = {
    sobre: () =>
      isEnabled("sobre") && config?.aboutText ? (
        <Sobre key="sobre" aboutText={config.aboutText} section={sectionOf("sobre")} imageUrl={config.heroImageUrl} />
      ) : null,
    servicos: () =>
      isEnabled("servicos") ? (
        <ServicosShowcase key="servicos" services={services} section={sectionOf("servicos")} onSelect={quickSelectService} />
      ) : null,
    profissionais: () =>
      isEnabled("profissionais") ? (
        <ProfissionaisShowcase
          key="profissionais"
          professionals={professionals}
          section={sectionOf("profissionais")}
          onSelect={quickSelectProfessional}
        />
      ) : null,
    galeria: () => (isEnabled("galeria") ? <Galeria key="galeria" section={sectionOf("galeria")} /> : null),
    depoimentos: () =>
      isEnabled("depoimentos") ? <Depoimentos key="depoimentos" section={sectionOf("depoimentos")} /> : null,
    instagram: () =>
      isEnabled("instagram") ? (
        <Instagram key="instagram" instagram={content?.instagram} section={sectionOf("instagram")} />
      ) : null,
    faq: () => (isEnabled("faq") ? <Faq key="faq" items={content?.faq} section={sectionOf("faq")} /> : null),
    localizacao: () =>
      isEnabled("localizacao") ? (
        <Localizacao
          key="localizacao"
          addressLine={config?.addressLine}
          openingHoursText={config?.openingHoursText}
          whatsappNumber={config?.whatsappNumber}
          contact={content?.contact}
          section={sectionOf("localizacao")}
        />
      ) : null,
    agendamento: () => (
      <section key="agendamento" id="agendamento" className="mx-auto max-w-6xl px-4 py-20 md:py-24">
        <SectionHeader
          eyebrow="Agendamento"
          title={bookingSection?.title || "Agende seu horario"}
          subtitle={bookingSection?.subtitle}
          align="center"
        />

        <div className="mt-12 grid gap-6 lg:grid-cols-[1.45fr_.55fr]">
          <div className="min-w-0 rounded-xl border border-border bg-surface p-5 md:p-8">
            <StepProgress steps={STEPS} current={step} completed={completedSteps} onSelect={goTo} />

            {/* A troca de `key` remonta o painel: a etapa nova entra deslizando no
                sentido da navegacao (avancar para a esquerda, voltar para a direita). */}
            <div className="mt-8 min-w-0 overflow-hidden">
              <motion.div
                key={`step-${step}`}
                initial={reduceMotion ? false : { opacity: 0, x: direction * 28 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.28, ease: [0.2, 0.8, 0.2, 1] }}
                className="min-w-0"
              >
                {renderStep()}
              </motion.div>
            </div>
          </div>

          <div className="min-w-0">
            <SummarySidebar
              selectedServices={selectedServices}
              professionalName={selectedProfessional?.name}
              date={date}
              time={time}
              total={total}
              totalMinutes={totalMinutes}
              isLastStep={step === STEPS.length - 1}
              canAdvance={stepReady[step]}
              canGoBack={step > 0}
              onBack={() => goTo(step - 1)}
              onNext={() => goTo(step + 1)}
              disabled={!stepReady.every(Boolean)}
              onConfirm={confirm}
              submitting={submitting}
              message={message}
              messageVariant={messageVariant}
            />
          </div>
        </div>
      </section>
    )
  };

  return (
    <main className="min-h-screen bg-paper text-text-primary">
      <Navbar shopName={shopName} logoUrl={content?.brand?.logoUrl} />

      <Hero hero={content?.hero} shopName={shopName} />

      {sections.length
        ? sections.map((section) => sectionRenderers[section.key]?.())
        : sectionRenderers.agendamento()}

      <Footer
        shopName={shopName}
        logoUrl={content?.brand?.logoUrl}
        whatsappNumber={config?.whatsappNumber}
        addressLine={config?.addressLine}
        openingHoursText={config?.openingHoursText}
        socials={content?.socials}
        footer={content?.footer}
      />
    </main>
  );
}
