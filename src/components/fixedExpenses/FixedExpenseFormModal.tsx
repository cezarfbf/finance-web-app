import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Trash2 } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { fetchCategories } from "@/lib/api/categories";
import {
  createFixedExpense,
  deleteFixedExpense,
  updateFixedExpense,
} from "@/lib/api/fixedExpenses";
import type { FixedExpense, FixedExpenseInput } from "@/types/fixedExpense";
import { cn } from "@/lib/utils";

interface Props {
  open: boolean;
  onClose: () => void;
  mode: "create" | "edit";
  expense?: FixedExpense;
}

interface FormState {
  name: string;
  amount: string;
  categoryId: string;
  billingDay: string;
  active: boolean;
  notes: string;
}

function initialState(expense?: FixedExpense): FormState {
  return {
    name: expense?.name ?? "",
    amount: expense ? String(expense.amount) : "",
    categoryId: expense?.category?.id ?? "",
    billingDay: expense ? String(expense.billingDay) : "1",
    active: expense?.active ?? true,
    notes: expense?.notes ?? "",
  };
}

const inputClass =
  "w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-2)] px-3 py-2 text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-accent)]";
const labelClass = "flex flex-col gap-1 text-xs text-[var(--color-text-muted)]";

export function FixedExpenseFormModal({ open, onClose, mode, expense }: Props) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState<FormState>(() => initialState(expense));
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [confirmDelete, setConfirmDelete] = useState(false);

  // Re-seed the form whenever the modal opens (or the target row changes).
  useEffect(() => {
    if (open) {
      setForm(initialState(expense));
      setErrors({});
      setConfirmDelete(false);
    }
  }, [open, expense]);

  const categoriesQuery = useQuery({
    queryKey: ["categories", "PERSONAL"],
    queryFn: () => fetchCategories("PERSONAL"),
    enabled: open,
  });

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const validate = (): boolean => {
    const next: Partial<Record<keyof FormState, string>> = {};
    if (!form.name.trim()) next.name = "Name is required";
    const amountNum = Number(form.amount);
    if (!form.amount.trim() || Number.isNaN(amountNum) || amountNum <= 0) {
      next.amount = "Enter an amount greater than 0";
    }
    const dayNum = Number(form.billingDay);
    if (!Number.isInteger(dayNum) || dayNum < 1 || dayNum > 31) {
      next.billingDay = "Day must be between 1 and 31";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const buildPayload = (): FixedExpenseInput => ({
    name: form.name.trim(),
    amount: Number(form.amount),
    categoryId: form.categoryId || null,
    billingDay: Number(form.billingDay),
    active: form.active,
    notes: form.notes.trim() || null,
  });

  const invalidateAndClose = () => {
    queryClient.invalidateQueries({ queryKey: ["fixed-expenses"] });
    onClose();
  };

  const saveMutation = useMutation({
    mutationFn: (payload: FixedExpenseInput) =>
      mode === "edit" && expense
        ? updateFixedExpense(expense.id, payload)
        : createFixedExpense(payload),
    onSuccess: invalidateAndClose,
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteFixedExpense(expense!.id),
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
      title={mode === "edit" ? "Edit fixed expense" : "New fixed expense"}
    >
      <form onSubmit={submit} className="flex flex-col gap-4">
        <label className={labelClass}>
          Name
          <input
            type="text"
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
            placeholder="ex. Netflix"
            className={inputClass}
          />
          {errors.name && <FieldError>{errors.name}</FieldError>}
        </label>

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
            Billing day
            <input
              type="number"
              min="1"
              max="31"
              step="1"
              inputMode="numeric"
              value={form.billingDay}
              onChange={(e) => set("billingDay", e.target.value)}
              className={inputClass}
            />
            {errors.billingDay && <FieldError>{errors.billingDay}</FieldError>}
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
          Notes (optional)
          <textarea
            value={form.notes}
            onChange={(e) => set("notes", e.target.value)}
            rows={2}
            className={cn(inputClass, "resize-none")}
          />
        </label>

        <label className="flex items-center gap-2 text-sm text-[var(--color-text)]">
          <input
            type="checkbox"
            checked={form.active}
            onChange={(e) => set("active", e.target.checked)}
            className="h-4 w-4 accent-[var(--color-accent)]"
          />
          Active
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
