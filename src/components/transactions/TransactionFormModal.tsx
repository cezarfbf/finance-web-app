import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Trash2 } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { fetchCategories } from "@/lib/api/categories";
import {
  createTransaction,
  deleteTransaction,
  updateTransaction,
} from "@/lib/api/transactions";
import type { Transaction, TransactionInput } from "@/types/transaction";
import { cn } from "@/lib/utils";

interface Props {
  open: boolean;
  onClose: () => void;
  mode: "create" | "edit";
  transaction?: Transaction;
}

interface FormState {
  type: "DEBIT" | "CREDIT";
  amount: string;
  date: string;
  categoryId: string;
  description: string;
  counterparty: string;
  notes: string;
}

const todayIso = () => new Date().toISOString().slice(0, 10);

function initialState(tx?: Transaction): FormState {
  return {
    type: tx?.type ?? "DEBIT",
    amount: tx ? String(tx.amount) : "",
    date: tx ? tx.date.slice(0, 10) : todayIso(),
    categoryId: tx?.category?.id ?? "",
    description: tx?.description ?? "",
    counterparty: tx?.counterparty ?? "",
    notes: tx?.notes ?? "",
  };
}

const inputClass =
  "w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-2)] px-3 py-2 text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-accent)]";
const labelClass = "flex flex-col gap-1 text-xs text-[var(--color-text-muted)]";

export function TransactionFormModal({ open, onClose, mode, transaction }: Props) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState<FormState>(() => initialState(transaction));
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [confirmDelete, setConfirmDelete] = useState(false);

  // Re-seed the form whenever the modal opens (or the target row changes).
  useEffect(() => {
    if (open) {
      setForm(initialState(transaction));
      setErrors({});
      setConfirmDelete(false);
    }
  }, [open, transaction]);

  const categoriesQuery = useQuery({
    queryKey: ["categories", "PERSONAL"],
    queryFn: () => fetchCategories("PERSONAL"),
    enabled: open,
  });

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const validate = (): boolean => {
    const next: Partial<Record<keyof FormState, string>> = {};
    const amountNum = Number(form.amount);
    if (!form.amount.trim() || Number.isNaN(amountNum) || amountNum <= 0) {
      next.amount = "Enter an amount greater than 0";
    }
    if (!form.date) next.date = "Date is required";
    if (!form.description.trim()) next.description = "Description is required";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const buildPayload = (): TransactionInput => ({
    context: "PERSONAL",
    date: form.date,
    amount: Number(form.amount),
    type: form.type,
    categoryId: form.categoryId || null,
    description: form.description.trim(),
    counterparty: form.counterparty.trim() || null,
    notes: form.notes.trim() || null,
  });

  const invalidateAndClose = () => {
    queryClient.invalidateQueries({ queryKey: ["transactions"] });
    onClose();
  };

  const saveMutation = useMutation({
    mutationFn: (payload: TransactionInput) =>
      mode === "edit" && transaction
        ? updateTransaction(transaction.id, payload)
        : createTransaction(payload),
    onSuccess: invalidateAndClose,
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteTransaction(transaction!.id),
    onSuccess: invalidateAndClose,
  });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    saveMutation.mutate(buildPayload());
  };

  const busy = saveMutation.isPending || deleteMutation.isPending;
  const mutationError = saveMutation.error ?? deleteMutation.error;
  const categories = useMemo(() => categoriesQuery.data ?? [], [categoriesQuery.data]);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={mode === "edit" ? "Edit transaction" : "New transaction"}
    >
      <form onSubmit={submit} className="flex flex-col gap-4">
        {/* Type toggle */}
        <div className="flex flex-col gap-1">
          <span className="text-xs text-[var(--color-text-muted)]">Type</span>
          <div className="grid grid-cols-2 gap-2">
            {(["DEBIT", "CREDIT"] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => set("type", t)}
                className={cn(
                  "rounded-lg border px-3 py-2 text-sm font-medium transition-colors",
                  form.type === t
                    ? "border-[var(--color-accent)] bg-[var(--color-accent)]/10 text-[var(--color-accent)]"
                    : "border-[var(--color-border)] text-[var(--color-text-muted)] hover:bg-[var(--color-surface-2)]",
                )}
              >
                {t === "DEBIT" ? "Debit" : "Credit"}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <label className={labelClass}>
            Amount
            <input
              type="number"
              step="0.01"
              min="0"
              inputMode="decimal"
              value={form.amount}
              onChange={(e) => set("amount", e.target.value)}
              placeholder="0.00"
              className={inputClass}
            />
            {errors.amount && <FieldError>{errors.amount}</FieldError>}
          </label>

          <label className={labelClass}>
            Date
            <input
              type="date"
              value={form.date}
              onChange={(e) => set("date", e.target.value)}
              className={inputClass}
            />
            {errors.date && <FieldError>{errors.date}</FieldError>}
          </label>
        </div>

        <label className={labelClass}>
          Category
          <select
            value={form.categoryId}
            onChange={(e) => set("categoryId", e.target.value)}
            className={inputClass}
          >
            <option value="">No category</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>

        <label className={labelClass}>
          Description
          <input
            type="text"
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
            placeholder="e.g. Monthly rent"
            className={inputClass}
          />
          {errors.description && <FieldError>{errors.description}</FieldError>}
        </label>

        <label className={labelClass}>
          Counterparty (optional)
          <input
            type="text"
            value={form.counterparty}
            onChange={(e) => set("counterparty", e.target.value)}
            placeholder="e.g. Landlord"
            className={inputClass}
          />
        </label>

        <label className={labelClass}>
          Notes (optional)
          <textarea
            value={form.notes}
            onChange={(e) => set("notes", e.target.value)}
            rows={2}
            className={cn(inputClass, "resize-none")}
          />
        </label>

        {mutationError && (
          <p className="text-sm text-[var(--kpi-custos)]">
            Something went wrong. Please try again.
          </p>
        )}

        <div className="mt-1 flex items-center justify-between gap-2">
          <div>
            {mode === "edit" &&
              (confirmDelete ? (
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => deleteMutation.mutate()}
                  className="rounded-lg bg-[var(--kpi-custos)] px-3 py-2 text-sm font-medium text-white disabled:opacity-60"
                >
                  Confirm delete?
                </button>
              ) : (
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => setConfirmDelete(true)}
                  className="flex items-center gap-1.5 rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm text-[var(--kpi-custos)] hover:bg-[var(--color-surface-2)] disabled:opacity-60"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </button>
              ))}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm hover:bg-[var(--color-surface-2)]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={busy}
              className="rounded-lg bg-[var(--color-accent)] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
            >
              {saveMutation.isPending
                ? "Saving…"
                : mode === "edit"
                  ? "Save"
                  : "Create"}
            </button>
          </div>
        </div>
      </form>
    </Modal>
  );
}

function FieldError({ children }: { children: React.ReactNode }) {
  return <span className="text-xs text-[var(--kpi-custos)]">{children}</span>;
}
