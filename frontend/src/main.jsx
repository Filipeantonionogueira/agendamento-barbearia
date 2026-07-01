import React from "react";
import { createRoot } from "react-dom/client";
import { CalendarDays, Clock, LayoutDashboard, Lock, Scissors, Settings, Shield, Wallet } from "lucide-react";
import "./styles.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3333/api";

async function api(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    credentials: "include",
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    ...options
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || "Erro na requisicao.");
  return data;
}

const money = (cents = 0) => (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const today = () => new Date().toISOString().slice(0, 10);
const addDays = (days) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
};

function App() {
  const path = window.location.pathname;
  if (path.startsWith("/admin/login")) return <Login />;
  if (path.startsWith("/admin")) return <Admin />;
  return <Booking />;
}

function Shell({ children, compact = false }) {
  return (
    <main className="min-h-screen bg-paper text-ink">
      <div
        className="min-h-[280px] bg-cover bg-center"
        style={{
          backgroundImage:
            "linear-gradient(90deg, rgba(21,21,21,.84), rgba(21,21,21,.36)), url('https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&w=1600&q=80')"
        }}
      >
        <header className="mx-auto flex max-w-6xl items-center justify-between px-4 py-5 text-white">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-lg bg-gold text-ink">
              <Scissors size={21} />
            </div>
            <strong className="text-lg">Barbearia Prime</strong>
          </div>
          <a href="/admin/login" className="rounded-lg border border-white/30 px-3 py-2 text-sm hover:bg-white/10">
            Admin
          </a>
        </header>
        {!compact && (
          <section className="mx-auto max-w-6xl px-4 pb-16 pt-10 text-white">
            <p className="text-sm uppercase tracking-[.22em] text-gold">Agendamento online</p>
            <h1 className="mt-3 max-w-2xl text-4xl font-semibold leading-tight md:text-6xl">Seu horario sem espera.</h1>
            <p className="mt-4 max-w-xl text-base text-white/80 md:text-lg">
              Escolha os servicos, veja os horarios livres e confirme pelo WhatsApp.
            </p>
          </section>
        )}
      </div>
      {children}
    </main>
  );
}

function Booking() {
  const [services, setServices] = React.useState([]);
  const [selected, setSelected] = React.useState([]);
  const [date, setDate] = React.useState(today());
  const [slots, setSlots] = React.useState([]);
  const [time, setTime] = React.useState("");
  const [clientName, setClientName] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [message, setMessage] = React.useState("");

  React.useEffect(() => {
    api("/servicos").then(setServices).catch((error) => setMessage(error.message));
  }, []);

  React.useEffect(() => {
    setTime("");
    if (!selected.length) return setSlots([]);
    api(`/disponibilidade?date=${date}&serviceIds=${selected.join(",")}`)
      .then((data) => setSlots(data.slots || []))
      .catch(() => setSlots([]));
  }, [date, selected]);

  const selectedServices = services.filter((service) => selected.includes(service.id));
  const total = selectedServices.reduce((sum, service) => sum + service.priceCents, 0);

  function toggleService(id) {
    setSelected((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]));
  }

  async function confirm() {
    setMessage("");
    const appointment = await api("/agendamentos", {
      method: "POST",
      body: JSON.stringify({ clientName, phone, date, time, serviceIds: selected })
    });
    const serviceNames = appointment.appointmentServices.map((item) => item.service.name).join(" + ");
    const text = encodeURIComponent(
      `Novo Agendamento!\n\nCliente: ${appointment.client.name}\nServicos: ${serviceNames}\nHorario: ${date} as ${time}\nTelefone: ${phone || "Nao informado"}`
    );
    window.open(`https://wa.me/${appointment.barber.whatsappNumber}?text=${text}`, "_blank");
    setMessage("Agendamento salvo. O WhatsApp foi aberto para confirmacao.");
  }

  return (
    <Shell>
      <section className="mx-auto -mt-8 grid max-w-6xl gap-5 px-4 pb-12 lg:grid-cols-[1.35fr_.65fr]">
        <div className="rounded-lg bg-white p-4 shadow-soft md:p-6">
          <Step title="1. Servicos" icon={<Scissors size={18} />}>
            <div className="grid gap-3 sm:grid-cols-2">
              {services.map((service) => (
                <button
                  key={service.id}
                  onClick={() => toggleService(service.id)}
                  className={`rounded-lg border p-4 text-left transition ${
                    selected.includes(service.id) ? "border-gold bg-[#FFF8E8]" : "border-zinc-200 hover:border-gold"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <strong>{service.name}</strong>
                    <span className="text-sm font-semibold text-gold">{money(service.priceCents)}</span>
                  </div>
                  <p className="mt-2 text-sm text-zinc-600">{service.description}</p>
                  <p className="mt-3 text-xs text-zinc-500">{service.estimatedMinutes} min</p>
                </button>
              ))}
            </div>
          </Step>

          <Step title="2. Dia e horario" icon={<CalendarDays size={18} />}>
            <div className="grid gap-3 sm:grid-cols-2">
              <input className="field" type="date" min={today()} max={addDays(30)} value={date} onChange={(event) => setDate(event.target.value)} />
              <div className="grid grid-cols-3 gap-2">
                {slots.length ? (
                  slots.map((slot) => (
                    <button key={slot} onClick={() => setTime(slot)} className={`slot ${time === slot ? "slot-active" : ""}`}>
                      {slot}
                    </button>
                  ))
                ) : (
                  <p className="col-span-3 rounded-lg bg-zinc-50 p-3 text-sm text-zinc-500">Selecione servicos para ver horarios.</p>
                )}
              </div>
            </div>
          </Step>

          <Step title="3. Seus dados" icon={<Clock size={18} />}>
            <div className="grid gap-3 sm:grid-cols-2">
              <input className="field" placeholder="Seu nome" value={clientName} onChange={(event) => setClientName(event.target.value)} />
              <input className="field" placeholder="WhatsApp opcional" value={phone} onChange={(event) => setPhone(event.target.value)} />
            </div>
          </Step>
        </div>

        <aside className="h-fit rounded-lg bg-ink p-5 text-white shadow-soft">
          <h2 className="text-xl font-semibold">Resumo</h2>
          <div className="mt-4 space-y-3 text-sm text-white/75">
            <p>{selectedServices.map((item) => item.name).join(" + ") || "Nenhum servico selecionado"}</p>
            <p>{date} {time ? `as ${time}` : ""}</p>
            <p className="text-2xl font-semibold text-gold">{money(total)}</p>
          </div>
          <button className="mt-5 w-full rounded-lg bg-gold px-4 py-3 font-semibold text-ink disabled:opacity-50" disabled={!selected.length || !time || !clientName} onClick={confirm}>
            Confirmar agendamento
          </button>
          {message && <p className="mt-3 text-sm text-white/80">{message}</p>}
        </aside>
      </section>
    </Shell>
  );
}

function Step({ title, icon, children }) {
  return (
    <section className="mb-8 last:mb-0">
      <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
        <span className="grid h-8 w-8 place-items-center rounded-lg bg-ink text-gold">{icon}</span>
        {title}
      </h2>
      {children}
    </section>
  );
}

function Login() {
  const [username, setUsername] = React.useState("admin");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState("");

  async function submit(event) {
    event.preventDefault();
    setError("");
    try {
      await api("/auth/login", { method: "POST", body: JSON.stringify({ username, password }) });
      window.location.href = "/admin";
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <Shell compact>
      <section className="mx-auto -mt-20 max-w-md px-4 pb-12">
        <form onSubmit={submit} className="rounded-lg bg-white p-6 shadow-soft">
          <div className="mb-5 flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-lg bg-ink text-gold"><Lock size={20} /></div>
            <h1 className="text-2xl font-semibold">Painel admin</h1>
          </div>
          <input className="field mb-3" placeholder="Usuario" value={username} onChange={(event) => setUsername(event.target.value)} />
          <input className="field mb-3" type="password" placeholder="Senha" value={password} onChange={(event) => setPassword(event.target.value)} />
          <button className="w-full rounded-lg bg-ink px-4 py-3 font-semibold text-white">Entrar</button>
          {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
        </form>
      </section>
    </Shell>
  );
}

function Admin() {
  const tabs = [
    ["agenda", "Agenda", CalendarDays],
    ["disponibilidade", "Disponibilidade", Clock],
    ["servicos", "Servicos", Scissors],
    ["dashboard", "Dashboard", Wallet],
    ["config", "Config", Settings]
  ];
  const [tab, setTab] = React.useState("agenda");

  return (
    <main className="min-h-screen bg-paper text-ink">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-lg bg-ink text-gold"><Shield size={20} /></div>
            <div>
              <strong>Painel do barbeiro</strong>
              <p className="text-sm text-zinc-500">Agenda, servicos e financeiro</p>
            </div>
          </div>
          <nav className="flex gap-2 overflow-x-auto">
            {tabs.map(([id, label, Icon]) => (
              <button key={id} onClick={() => setTab(id)} className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm ${tab === id ? "bg-ink text-white" : "bg-zinc-100"}`}>
                <Icon size={16} /> {label}
              </button>
            ))}
          </nav>
        </div>
      </header>
      <section className="mx-auto max-w-7xl px-4 py-6">
        {tab === "agenda" && <Agenda />}
        {tab === "disponibilidade" && <Disponibilidade />}
        {tab === "servicos" && <Servicos />}
        {tab === "dashboard" && <Dashboard />}
        {tab === "config" && <Config />}
      </section>
    </main>
  );
}

function Agenda() {
  const [items, setItems] = React.useState([]);
  const load = () => api("/agendamentos").then(setItems);
  React.useEffect(() => { load().catch(() => (window.location.href = "/admin/login")); }, []);

  async function setStatus(id, status) {
    await api(`/agendamentos/${id}/status`, { method: "PUT", body: JSON.stringify({ status }) });
    load();
  }

  return (
    <Panel title="Agenda" icon={<CalendarDays />}>
      <div className="grid gap-3">
        {items.map((item) => (
          <div key={item.id} className="rounded-lg border bg-white p-4">
            <div className="flex flex-col justify-between gap-3 sm:flex-row">
              <div>
                <strong>{item.client.name}</strong>
                <p className="text-sm text-zinc-500">{new Date(item.startAt).toLocaleString("pt-BR")} - {item.appointmentServices.map((s) => s.service.name).join(", ")}</p>
              </div>
              <select className="field max-w-48" value={item.status} onChange={(event) => setStatus(item.id, event.target.value)}>
                {["PENDENTE", "CONFIRMADO", "CONCLUIDO", "CANCELADO"].map((status) => <option key={status}>{status}</option>)}
              </select>
            </div>
          </div>
        ))}
      </div>
    </Panel>
  );
}

function Disponibilidade() {
  const [items, setItems] = React.useState([]);
  const [blocks, setBlocks] = React.useState([]);
  const [block, setBlock] = React.useState({ date: today(), startTime: "", endTime: "", reason: "" });
  const days = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sab"];
  React.useEffect(() => {
    api("/disponibilidade").then(setItems);
    api("/bloqueios").then(setBlocks);
  }, []);

  async function save() {
    await api("/disponibilidade", { method: "PUT", body: JSON.stringify({ items }) });
  }
  async function addBlock() {
    await api("/bloqueios", { method: "POST", body: JSON.stringify({ ...block, startTime: block.startTime || null, endTime: block.endTime || null }) });
    setBlocks(await api("/bloqueios"));
  }

  return (
    <Panel title="Disponibilidade" icon={<Clock />}>
      <div className="grid gap-3 md:grid-cols-2">
        {items.map((item, index) => (
          <div key={item.dayOfWeek} className="grid grid-cols-[70px_1fr_1fr_80px] items-center gap-2 rounded-lg border bg-white p-3">
            <strong>{days[item.dayOfWeek]}</strong>
            <input className="field" type="time" value={item.startTime} onChange={(e) => setItems(items.map((v, i) => i === index ? { ...v, startTime: e.target.value } : v))} />
            <input className="field" type="time" value={item.endTime} onChange={(e) => setItems(items.map((v, i) => i === index ? { ...v, endTime: e.target.value } : v))} />
            <label className="text-sm"><input type="checkbox" checked={item.active} onChange={(e) => setItems(items.map((v, i) => i === index ? { ...v, active: e.target.checked } : v))} /> Ativo</label>
          </div>
        ))}
      </div>
      <button className="mt-4 rounded-lg bg-ink px-4 py-2 font-semibold text-white" onClick={save}>Salvar disponibilidade</button>
      <div className="mt-8 rounded-lg border bg-white p-4">
        <h3 className="mb-3 font-semibold">Bloqueios</h3>
        <div className="grid gap-2 md:grid-cols-5">
          <input className="field" type="date" value={block.date} onChange={(e) => setBlock({ ...block, date: e.target.value })} />
          <input className="field" type="time" value={block.startTime} onChange={(e) => setBlock({ ...block, startTime: e.target.value })} />
          <input className="field" type="time" value={block.endTime} onChange={(e) => setBlock({ ...block, endTime: e.target.value })} />
          <input className="field" placeholder="Motivo" value={block.reason} onChange={(e) => setBlock({ ...block, reason: e.target.value })} />
          <button className="rounded-lg bg-gold px-4 py-2 font-semibold" onClick={addBlock}>Adicionar</button>
        </div>
        <div className="mt-3 text-sm text-zinc-600">{blocks.map((item) => <p key={item.id}>{new Date(item.date).toLocaleDateString("pt-BR")} {item.startTime || "dia todo"} {item.reason}</p>)}</div>
      </div>
    </Panel>
  );
}

function Servicos() {
  const blank = { name: "", description: "", priceCents: 0, estimatedMinutes: 30, active: true };
  const [items, setItems] = React.useState([]);
  const [form, setForm] = React.useState(blank);
  const load = () => api("/servicos/admin").then(setItems);
  React.useEffect(() => { load(); }, []);
  async function save() {
    await api(form.id ? `/servicos/${form.id}` : "/servicos", { method: form.id ? "PUT" : "POST", body: JSON.stringify(form) });
    setForm(blank);
    load();
  }
  return (
    <Panel title="Servicos" icon={<Scissors />}>
      <div className="grid gap-3 md:grid-cols-2">
        <div className="rounded-lg border bg-white p-4">
          <input className="field mb-2" placeholder="Nome" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <input className="field mb-2" placeholder="Descricao" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <input className="field mb-2" type="number" placeholder="Preco em centavos" value={form.priceCents} onChange={(e) => setForm({ ...form, priceCents: Number(e.target.value) })} />
          <input className="field mb-2" type="number" placeholder="Minutos" value={form.estimatedMinutes} onChange={(e) => setForm({ ...form, estimatedMinutes: Number(e.target.value) })} />
          <label className="mb-3 block text-sm"><input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} /> Ativo</label>
          <button className="rounded-lg bg-ink px-4 py-2 font-semibold text-white" onClick={save}>Salvar</button>
        </div>
        <div className="grid gap-2">
          {items.map((item) => (
            <button key={item.id} onClick={() => setForm(item)} className="rounded-lg border bg-white p-3 text-left">
              <strong>{item.name}</strong>
              <p className="text-sm text-zinc-500">{money(item.priceCents)} - {item.estimatedMinutes} min - {item.active ? "ativo" : "inativo"}</p>
            </button>
          ))}
        </div>
      </div>
    </Panel>
  );
}

function Dashboard() {
  const [period, setPeriod] = React.useState("semana");
  const [data, setData] = React.useState(null);
  React.useEffect(() => { api(`/dashboard?period=${period}`).then(setData); }, [period]);

  const maxRevenue = Math.max(...(data?.revenueByDay || []).map((day) => day.revenueCents), 0);
  const averageTicket = data?.clients ? Math.round(data.revenueCents / data.clients) : 0;
  const periodLabels = { dia: "Hoje", semana: "Ultimos 7 dias", mes: "Ultimos 30 dias" };

  return (
    <Panel title="Dashboard financeiro" icon={<LayoutDashboard />}>
      <div className="mb-5 flex flex-col gap-3 rounded-lg border bg-white p-4 shadow-sm md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-medium text-zinc-500">Periodo financeiro</p>
          <strong className="mt-1 block text-xl">{periodLabels[period]}</strong>
        </div>
        <div className="flex rounded-lg bg-zinc-100 p-1">
          {[
            ["dia", "Dia"],
            ["semana", "Semana"],
            ["mes", "Mes"]
          ].map(([value, label]) => (
            <button
              key={value}
              onClick={() => setPeriod(value)}
              className={`rounded-md px-4 py-2 text-sm font-semibold transition ${period === value ? "bg-ink text-white shadow-sm" : "text-zinc-600 hover:bg-white"}`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {data && (
        <div className="grid gap-4">
          <div className="grid gap-4 md:grid-cols-4">
            <Metric label="Clientes atendidos" value={data.clients} detail="Concluidos no periodo" />
            <Metric label="Faturamento" value={money(data.revenueCents)} detail="Somente servicos concluidos" accent />
            <Metric label="Ticket medio" value={money(averageTicket)} detail="Receita por cliente" />
            <Metric label="Mais realizado" value={data.serviceRanking[0]?.name || "-"} detail={data.serviceRanking[0] ? `${data.serviceRanking[0].count} atendimento(s)` : "Sem dados ainda"} />
          </div>

          <div className="grid gap-4 lg:grid-cols-[1.6fr_.9fr]">
            <section className="rounded-lg border bg-white p-5 shadow-sm">
              <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <h3 className="text-lg font-semibold">Receita por dia</h3>
                  <p className="text-sm text-zinc-500">Comparativo dos agendamentos concluidos</p>
                </div>
                <span className="rounded-md bg-[#FFF8E8] px-3 py-1 text-sm font-semibold text-[#8A6418]">
                  Total {money(data.revenueCents)}
                </span>
              </div>

              {data.revenueByDay.length ? (
                <div className="grid min-h-[260px] grid-cols-[56px_1fr] gap-3">
                  <div className="flex flex-col justify-between pb-8 text-right text-xs text-zinc-400">
                    <span>{money(maxRevenue)}</span>
                    <span>{money(Math.round(maxRevenue / 2))}</span>
                    <span>R$ 0</span>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-x-0 top-0 h-px bg-zinc-100" />
                    <div className="absolute inset-x-0 top-1/2 h-px bg-zinc-100" />
                    <div className="absolute inset-x-0 bottom-8 h-px bg-zinc-200" />
                    <div className="relative z-10 flex h-full items-end gap-3 overflow-x-auto pb-8">
                      {data.revenueByDay.map((day) => {
                        const height = maxRevenue ? Math.max(10, (day.revenueCents / maxRevenue) * 100) : 0;
                        return (
                          <div key={day.date} className="flex min-w-[72px] flex-1 flex-col items-center gap-2">
                            <span className="text-xs font-semibold text-zinc-600">{money(day.revenueCents)}</span>
                            <div className="flex h-44 w-full items-end rounded-md bg-zinc-50 px-2">
                              <div
                                className="w-full rounded-t-md bg-gradient-to-t from-[#151515] to-[#C79A3B] shadow-sm"
                                style={{ height: `${height}%` }}
                                title={`${day.date}: ${money(day.revenueCents)}`}
                              />
                            </div>
                            <span className="text-xs text-zinc-500">{formatDateLabel(day.date)}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ) : (
                <EmptyState title="Sem receita no periodo" text="Quando um atendimento for marcado como concluido, ele aparece aqui." />
              )}
            </section>

            <section className="rounded-lg border bg-white p-5 shadow-sm">
              <h3 className="text-lg font-semibold">Servicos mais feitos</h3>
              <p className="mb-5 text-sm text-zinc-500">Ranking por quantidade concluida</p>
              {data.serviceRanking.length ? (
                <div className="space-y-4">
                  {data.serviceRanking.slice(0, 6).map((service, index) => {
                    const maxCount = data.serviceRanking[0]?.count || 1;
                    return (
                      <div key={service.name}>
                        <div className="mb-2 flex items-center justify-between gap-3 text-sm">
                          <span className="font-medium">{index + 1}. {service.name}</span>
                          <strong>{service.count}</strong>
                        </div>
                        <div className="h-2 rounded-full bg-zinc-100">
                          <div className="h-2 rounded-full bg-gold" style={{ width: `${(service.count / maxCount) * 100}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <EmptyState title="Sem ranking ainda" text="Conclua atendimentos para montar o ranking." />
              )}
            </section>
          </div>
        </div>
      )}
    </Panel>
  );
}

function formatDateLabel(date) {
  const [, month, day] = date.split("-");
  return `${day}/${month}`;
}

function EmptyState({ title, text }) {
  return (
    <div className="grid min-h-[220px] place-items-center rounded-lg border border-dashed border-zinc-200 bg-zinc-50 p-6 text-center">
      <div>
        <strong className="block text-zinc-700">{title}</strong>
        <p className="mt-2 max-w-xs text-sm text-zinc-500">{text}</p>
      </div>
    </div>
  );
}

function Config() {
  const [form, setForm] = React.useState({ shopName: "", whatsappNumber: "", username: "", password: "" });
  React.useEffect(() => { api("/configuracoes").then((data) => setForm((current) => ({ ...current, ...data }))); }, []);
  async function save() {
    await api("/configuracoes", { method: "PUT", body: JSON.stringify(form) });
  }
  return (
    <Panel title="Configuracoes" icon={<Settings />}>
      <div className="grid max-w-2xl gap-3">
        <input className="field" placeholder="Nome da barbearia" value={form.shopName} onChange={(e) => setForm({ ...form, shopName: e.target.value })} />
        <input className="field" placeholder="WhatsApp" value={form.whatsappNumber} onChange={(e) => setForm({ ...form, whatsappNumber: e.target.value })} />
        <input className="field" placeholder="Novo usuario" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} />
        <input className="field" type="password" placeholder="Nova senha" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
        <button className="rounded-lg bg-ink px-4 py-3 font-semibold text-white" onClick={save}>Salvar configuracoes</button>
      </div>
    </Panel>
  );
}

function Panel({ title, icon, children }) {
  return (
    <section>
      <h1 className="mb-4 flex items-center gap-2 text-2xl font-semibold">{React.cloneElement(icon, { size: 24 })} {title}</h1>
      {children}
    </section>
  );
}

function Metric({ label, value, detail, accent = false }) {
  return (
    <div className={`rounded-lg border p-4 shadow-sm ${accent ? "border-[#E8D09A] bg-[#FFF8E8]" : "bg-white"}`}>
      <p className="text-sm font-medium text-zinc-500">{label}</p>
      <strong className="mt-2 block truncate text-2xl">{value}</strong>
      {detail && <span className="mt-2 block text-xs text-zinc-500">{detail}</span>}
    </div>
  );
}

createRoot(document.getElementById("root")).render(<App />);
