import React from "react";
import { Shell } from "../components/layout/Shell.jsx";
import { ServiceStep } from "../components/booking/ServiceStep.jsx";
import { ProfessionalStep } from "../components/booking/ProfessionalStep.jsx";
import { DateTimeStep } from "../components/booking/DateTimeStep.jsx";
import { DetailsStep } from "../components/booking/DetailsStep.jsx";
import { SummarySidebar } from "../components/booking/SummarySidebar.jsx";
import { Sobre } from "../components/landing/Sobre.jsx";
import { ServicosShowcase } from "../components/landing/ServicosShowcase.jsx";
import { ProfissionaisShowcase } from "../components/landing/ProfissionaisShowcase.jsx";
import { Galeria } from "../components/landing/Galeria.jsx";
import { Depoimentos } from "../components/landing/Depoimentos.jsx";
import { Localizacao } from "../components/landing/Localizacao.jsx";
import { Footer } from "../components/landing/Footer.jsx";
import { api } from "../lib/api.js";
import { today } from "../lib/format.js";
import { useAuth } from "../context/AuthProvider.jsx";
import { useFavorites } from "../hooks/useFavorites.js";
import { serviceNames } from "../lib/appointment.js";
import { useTrackVisit } from "../hooks/useTrackVisit.js";
import { useSearchParams } from "react-router-dom";

export function BookingPage() {
  useTrackVisit("/");
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
  const [time, setTime] = React.useState("");
  const [clientName, setClientName] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [notes, setNotes] = React.useState("");
  const [message, setMessage] = React.useState("");
  const [couponInput, setCouponInput] = React.useState("");
  const [couponCode, setCouponCode] = React.useState("");
  const [discountCents, setDiscountCents] = React.useState(0);
  const [couponError, setCouponError] = React.useState("");
  const [waitlistMessage, setWaitlistMessage] = React.useState("");

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
    if (!selected.length || !professionalId) return setSlots([]);
    api(`/disponibilidade?date=${date}&serviceIds=${selected.join(",")}&professionalId=${professionalId}`)
      .then((data) => setSlots(data.slots || []))
      .catch(() => setSlots([]));
  }, [date, selected, professionalId]);

  const selectedServices = services.filter((service) => selected.includes(service.id));
  const selectedProfessional = professionals.find((professional) => professional.id === professionalId);
  const total = selectedServices.reduce((sum, service) => sum + service.priceCents, 0);

  function toggleService(id) {
    setSelected((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]));
    // Ao mudar os servicos, o cupom precisa ser reavaliado.
    if (couponCode) removeCoupon();
  }

  async function applyCoupon() {
    setCouponError("");
    try {
      const result = await api("/cupons/validar", {
        method: "POST",
        body: JSON.stringify({ code: couponInput, serviceIds: selected })
      });
      setCouponCode(result.code);
      setDiscountCents(result.discountCents);
    } catch (error) {
      setCouponError(error.message);
      setDiscountCents(0);
      setCouponCode("");
    }
  }

  function removeCoupon() {
    setCouponCode("");
    setCouponInput("");
    setDiscountCents(0);
    setCouponError("");
  }

  async function joinWaitlist() {
    setWaitlistMessage("");
    try {
      await api("/lista-espera", {
        method: "POST",
        body: JSON.stringify({ professionalId, date, serviceIds: selected })
      });
      setWaitlistMessage("Voce entrou na lista de espera! Avisaremos se abrir vaga.");
    } catch (error) {
      setWaitlistMessage(error.message);
    }
  }

  async function confirm() {
    setMessage("");
    const appointment = await api("/agendamentos", {
      method: "POST",
      body: JSON.stringify({ clientName, phone, date, time, serviceIds: selected, professionalId, notes: notes || null, couponCode: couponCode || null })
    });
    const finalCents = appointment.totalPriceCents - (appointment.discountCents || 0);
    const text = encodeURIComponent(
      `Novo Agendamento!\n\nCliente: ${appointment.client.name}\nServicos: ${serviceNames(appointment)}\nProfissional: ${appointment.professional.name}\nHorario: ${date} as ${time}\nValor: R$ ${(finalCents / 100).toFixed(2)}\nTelefone: ${phone || "Nao informado"}`
    );
    window.open(`https://wa.me/${appointment.barber.whatsappNumber}?text=${text}`, "_blank");
    setMessage("Agendamento salvo. O WhatsApp foi aberto para confirmacao.");
  }

  return (
    <Shell shopName={config?.shopName} heroImageUrl={config?.heroImageUrl}>
      <section className="mx-auto -mt-8 grid max-w-6xl gap-5 px-4 pb-12 lg:grid-cols-[1.35fr_.65fr]">
        <div className="rounded-lg bg-surface p-4 shadow-soft md:p-6">
          <ServiceStep
            services={services}
            selected={selected}
            onToggle={toggleService}
            favoriteIds={favorites.enabled ? favorites.favoriteServiceIds : undefined}
            onToggleFavorite={favorites.enabled ? favorites.toggle : undefined}
          />
          <ProfessionalStep
            professionals={professionals}
            professionalId={professionalId}
            onSelect={setProfessionalId}
            favoriteIds={favorites.enabled ? favorites.favoriteProfessionalIds : undefined}
            onToggleFavorite={favorites.enabled ? favorites.toggle : undefined}
          />
          <DateTimeStep
            date={date}
            onDateChange={setDate}
            slots={slots}
            time={time}
            onTimeChange={setTime}
            canWaitlist={!!user && !!professionalId && selected.length > 0}
            onJoinWaitlist={joinWaitlist}
            waitlistMessage={waitlistMessage}
          />
          <DetailsStep
            clientName={clientName}
            onClientNameChange={setClientName}
            phone={phone}
            onPhoneChange={setPhone}
            notes={notes}
            onNotesChange={setNotes}
          />
        </div>

        <SummarySidebar
          selectedServices={selectedServices}
          professionalName={selectedProfessional?.name}
          date={date}
          time={time}
          total={total}
          discountCents={discountCents}
          couponCode={couponCode}
          couponInput={couponInput}
          onCouponInputChange={setCouponInput}
          onApplyCoupon={applyCoupon}
          onRemoveCoupon={removeCoupon}
          couponError={couponError}
          disabled={!selected.length || !professionalId || !time || !clientName}
          onConfirm={confirm}
          message={message}
        />
      </section>

      {config && <Sobre aboutText={config.aboutText} />}
      <ServicosShowcase services={services} />
      <ProfissionaisShowcase professionals={professionals} />
      <Galeria />
      <Depoimentos />
      {config && <Localizacao addressLine={config.addressLine} openingHoursText={config.openingHoursText} whatsappNumber={config.whatsappNumber} />}
      <Footer shopName={config?.shopName || "Barbearia Prime"} whatsappNumber={config?.whatsappNumber} addressLine={config?.addressLine} />
    </Shell>
  );
}
