"use client";

import { useState } from "react";
import { usePromotions } from "@/hooks/usePromotions";
import { createPromotion, deletePromotion, updatePromotion } from "@/lib/dataRoute";
import { formatPrice } from "@/lib/data";

export default function PromotionsManager() {
    const { promotions, isLoading, error, refetch } = usePromotions();
    const [name, setName] = useState("");
    const [value, setValue] = useState("");
    const [validFrom, setValidFrom] = useState("");
    const [validUntil, setValidUntil] = useState("");
    const [formError, setFormError] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);

    async function handleCreate(e: React.FormEvent) {
        e.preventDefault();
        setFormError(null);
        setSubmitting(true);
        try {
            await createPromotion({ name, value, valid_from: validFrom, valid_until: validUntil });
            setName("");
            setValue("");
            setValidFrom("");
            setValidUntil("");
            refetch();
        } catch (err) {
            setFormError(err instanceof Error ? err.message : "Failed to create promotion");
        } finally {
            setSubmitting(false);
        }
    }

    async function handleToggleAdminDisabled(id: string, currentlyDisabled: boolean) {
        await updatePromotion(id, { admin_disabled: !currentlyDisabled });
        refetch();
    }

    async function handleDelete(id: string) {
        if (!confirm("Delete this promotion?")) return;
        await deletePromotion(id);
        refetch();
    }

    return (
        <div className="flex flex-col gap-6">
            <form
                onSubmit={handleCreate}
                className="bg-surface border border-ink/10 shadow-sm rounded-xl p-5 grid grid-cols-1 md:grid-cols-4 gap-3 items-end"
            >
                <label className="text-xs text-ink/70 flex flex-col gap-1">
                    Name
                    <input
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="bg-bg border border-ink/15 rounded px-2 py-1 text-ink text-sm"
                    />
                </label>
                <label className="text-xs text-ink/70 flex flex-col gap-1">
                    Value
                    <input
                        required
                        value={value}
                        onChange={(e) => setValue(e.target.value)}
                        placeholder="e.g. 10"
                        className="bg-bg border border-ink/15 rounded px-2 py-1 text-ink text-sm"
                    />
                </label>
                <label className="text-xs text-ink/70 flex flex-col gap-1">
                    Valid From
                    <input
                        required
                        type="date"
                        value={validFrom}
                        onChange={(e) => setValidFrom(e.target.value)}
                        className="bg-bg border border-ink/15 rounded px-2 py-1 text-ink text-sm"
                    />
                </label>
                <label className="text-xs text-ink/70 flex flex-col gap-1">
                    Valid Until
                    <input
                        required
                        type="date"
                        value={validUntil}
                        onChange={(e) => setValidUntil(e.target.value)}
                        className="bg-bg border border-ink/15 rounded px-2 py-1 text-ink text-sm"
                    />
                </label>
                <button
                    type="submit"
                    disabled={submitting}
                    className="md:col-span-4 bg-cta text-cta-ink font-medium text-sm py-2 rounded-lg hover:brightness-90 transition-colors disabled:opacity-50"
                >
                    {submitting ? "Adding..." : "Add Promotion"}
                </button>
                {formError && <p className="md:col-span-4 text-red-600 dark:text-red-400 text-sm">{formError}</p>}
            </form>

            <div className="bg-surface border border-ink/10 shadow-sm rounded-xl p-5">
                {isLoading && <p className="text-ink/70 text-sm">Loading...</p>}
                {error && <p className="text-red-600 dark:text-red-400 text-sm">Failed to load promotions.</p>}

                {!isLoading && !error && (
                    promotions.length === 0 ? (
                        <p className="text-ink/70 text-sm">No promotions available.</p>
                    ) : (
                        <ul className="flex flex-col divide-y divide-ink/10">
                            {promotions.map((promo) => {
                                return (
                                    <li key={promo.id} className="flex flex-col sm:flex-row sm:items-center justify-between py-3 gap-3">
                                        <div>
                                            <p className="text-ink font-medium text-sm">{promo.name}</p>
                                            <p className="text-ink/70 text-xs mt-0.5">
                                                {new Date(promo.valid_from).toLocaleDateString("id-ID")} –{" "}
                                                {new Date(promo.valid_until).toLocaleDateString("id-ID")}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="text-accent text-sm font-semibold">{formatPrice(promo.value)}</span>
                                            <span
                                                className={`text-[10px] font-medium px-2 py-1 rounded-full ${
                                                    promo.is_active
                                                        ? "bg-accent/20 text-accent"
                                                        : "bg-ink/10 text-ink/70"
                                                }`}
                                            >
                                                {promo.is_active ? "Active" : "Inactive"}
                                            </span>
                                            <button
                                                onClick={() => handleToggleAdminDisabled(promo.id, promo.admin_disabled)}
                                                className={`text-[10px] font-medium px-2 py-1 rounded-full transition-colors ${
                                                    promo.admin_disabled
                                                        ? "bg-accent/20 text-accent"
                                                        : "bg-ink/10 text-ink/70"
                                                }`}
                                            >
                                                {promo.admin_disabled ? "Aktifkan lagi" : "Nonaktifkan"}
                                            </button>
                                            <button
                                                onClick={() => handleDelete(promo.id)}
                                                className="text-[10px] font-medium px-2 py-1 rounded-full bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-500/20 transition-colors"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </li>
                                );
                            })}
                        </ul>
                    )
                )}
            </div>
        </div>
    );
}
