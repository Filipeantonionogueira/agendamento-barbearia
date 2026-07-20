import React from "react";
import { money } from "../../lib/format.js";

export function SummarySidebar({
  selectedServices,
  professionalName,
  date,
  time,
  total,
  discountCents = 0,
  couponCode,
  couponInput,
  onCouponInputChange,
  onApplyCoupon,
  onRemoveCoupon,
  couponError,
  disabled,
  onConfirm,
  message
}) {
  const canApplyCoupon = selectedServices.length > 0;
  return (
    <aside className="h-fit rounded-lg bg-ink p-5 text-white shadow-soft">
      <h2 className="text-xl font-semibold">Resumo</h2>
      <div className="mt-4 space-y-3 text-sm text-white/75">
        <p>{selectedServices.map((item) => item.name).join(" + ") || "Nenhum servico selecionado"}</p>
        {professionalName && <p>Com {professionalName}</p>}
        <p>
          {date} {time ? `as ${time}` : ""}
        </p>
      </div>

      {onApplyCoupon && (
        <div className="mt-4 border-t border-white/10 pt-4">
          {couponCode ? (
            <div className="flex items-center justify-between rounded-lg bg-white/10 px-3 py-2 text-sm">
              <span>
                Cupom <strong>{couponCode}</strong> aplicado
              </span>
              <button onClick={onRemoveCoupon} className="text-white/70 hover:text-white">
                Remover
              </button>
            </div>
          ) : (
            <div className="flex gap-2">
              <input
                className="field flex-1 text-ink"
                placeholder="Cupom de desconto"
                value={couponInput}
                onChange={(event) => onCouponInputChange(event.target.value)}
                disabled={!canApplyCoupon}
              />
              <button
                onClick={onApplyCoupon}
                disabled={!canApplyCoupon || !couponInput}
                className="rounded-lg border border-white/30 px-3 text-sm hover:bg-white/10 disabled:opacity-40"
              >
                Aplicar
              </button>
            </div>
          )}
          {couponError && <p className="mt-2 text-sm text-feedback-danger">{couponError}</p>}
        </div>
      )}

      <div className="mt-4 space-y-1 border-t border-white/10 pt-4 text-sm text-white/75">
        {discountCents > 0 && (
          <>
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>{money(total)}</span>
            </div>
            <div className="flex justify-between text-feedback-success">
              <span>Desconto</span>
              <span>- {money(discountCents)}</span>
            </div>
          </>
        )}
        <div className="flex items-center justify-between pt-1">
          <span className="text-white/75">Total</span>
          <span className="text-2xl font-semibold text-gold">{money(total - discountCents)}</span>
        </div>
      </div>

      <button
        className="mt-5 w-full rounded-lg bg-gold px-4 py-3 font-semibold text-ink disabled:opacity-50"
        disabled={disabled}
        onClick={onConfirm}
      >
        Confirmar agendamento
      </button>
      {message && <p className="mt-3 text-sm text-white/80">{message}</p>}
    </aside>
  );
}
