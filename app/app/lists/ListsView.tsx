"use client";

import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import * as React from "react";
import { LeadTable } from "@/components/leads/LeadTable";
import { Button } from "@/components/ui/Button";
import { EditableChip } from "@/components/ui/editable-chip";
import { Input, Label } from "@/components/ui/Field";
import { useI18n } from "@/lib/i18n";
import type { Lead, LeadList } from "@/lib/leadTypes";
import { displayListName } from "@/lib/listNames";
import {
  STORAGE_KEYS,
  createList,
  deleteList,
  ensureDefaultLists,
  getEmptySnapshot,
  getRawSnapshot,
  removeLeadFromList,
  subscribeToLocalStorage,
  updateList,
} from "@/lib/storage";
import { formatRelative } from "@/lib/utils";

export default function ListsView({
  authed = false,
}: {
  authed?: boolean;
} = {}) {
  const { locale } = useI18n();

  const rawLists = React.useSyncExternalStore(
    subscribeToLocalStorage,
    () => getRawSnapshot(STORAGE_KEYS.lists),
    getEmptySnapshot
  );
  const rawSaved = React.useSyncExternalStore(
    subscribeToLocalStorage,
    () => getRawSnapshot(STORAGE_KEYS.leads),
    getEmptySnapshot
  );

  const lists = React.useMemo<LeadList[]>(() => {
    if (!rawLists) return [];
    try {
      return JSON.parse(rawLists) as LeadList[];
    } catch {
      return [];
    }
  }, [rawLists]);
  const saved = React.useMemo<Lead[]>(() => {
    if (!rawSaved) return [];
    try {
      return JSON.parse(rawSaved) as Lead[];
    } catch {
      return [];
    }
  }, [rawSaved]);

  const [activeId, setActiveId] = React.useState<string | null>(null);
  const [newName, setNewName] = React.useState("");

  React.useEffect(() => {
    // Seed defaults on first mount. Writes trigger findely:storage, which
    // the useSyncExternalStore subscription above consumes.
    ensureDefaultLists();
  }, []);

  const active = lists.find((l) => l.id === activeId) ?? null;
  const activeLeads = active
    ? saved.filter((l) => active.leadIds.includes(l.id))
    : [];

  function handleCreate() {
    if (!newName.trim()) return;
    createList(newName.trim());
    setNewName("");
  }

  function handleRename(list: LeadList, next: string) {
    if (!next.trim()) return;
    updateList(list.id, { name: next.trim() });
  }

  function handleDelete(list: LeadList) {
    const confirmMsg =
      locale === "fr"
        ? `Supprimer la liste « ${displayListName(list.name, locale)} » ?`
        : `Delete list “${displayListName(list.name, locale)}”?`;
    if (!window.confirm(confirmMsg)) return;
    deleteList(list.id);
    if (activeId === list.id) setActiveId(null);
  }

  if (active) {
    return (
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <button
              onClick={() => setActiveId(null)}
              className="inline-flex items-center gap-1 text-xs text-muted hover:text-foreground"
            >
              <ArrowLeft size={12} />{" "}
              {locale === "fr" ? "Retour aux listes" : "Back to lists"}
            </button>
            <div className="mt-1">
              <EditableChip
                value={displayListName(active.name, locale)}
                onChange={(v) => handleRename(active, v)}
                size="lg"
                ariaLabel={locale === "fr" ? "Nom de la liste" : "List name"}
              />
            </div>
            <p className="mt-1 text-xs text-muted">
              {active.leadIds.length} leads ·{" "}
              {locale === "fr" ? "Mis à jour" : "Updated"}{" "}
              {formatRelative(active.updatedAt)}
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="danger"
              leftIcon={<Trash2 size={12} />}
              onClick={() => handleDelete(active)}
            >
              {locale === "fr" ? "Supprimer" : "Delete"}
            </Button>
          </div>
        </div>

        {activeLeads.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-surface/50 p-10 text-center">
            <h3 className="text-base font-semibold text-foreground">
              {locale === "fr" ? "Cette liste est vide." : "This list is empty."}
            </h3>
            <p className="mt-1 text-sm text-muted-strong">
              {locale === "fr"
                ? "Lancez une recherche et utilisez « Ajouter à une liste » pour la remplir."
                : "Run a search and use “Add to list” to populate it."}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between text-xs text-muted">
              <div>
                {activeLeads.length}{" "}
                {locale === "fr" ? "leads dans cette liste" : "leads in this list"}
              </div>
              <div className="flex flex-wrap gap-2">
                {active.leadIds.length > 0 ? (
                  <button
                    onClick={() => {
                      active.leadIds.forEach((id) =>
                        removeLeadFromList(active.id, id)
                      );
                    }}
                    className="text-xs text-muted hover:text-danger"
                  >
                    {locale === "fr" ? "Vider la liste" : "Empty list"}
                  </button>
                ) : null}
              </div>
            </div>
            <LeadTable
              leads={activeLeads}
              defaultFilename={`findely-${active.name.replace(/\s+/g, "-").toLowerCase()}.csv`}
              authed={authed}
            />
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-border bg-surface p-5">
        <div className="flex items-center gap-2">
          <Plus size={14} className="text-accent-strong" />
          <h3 className="text-sm font-semibold text-foreground">
            {locale === "fr" ? "Créer une nouvelle liste" : "Create a new list"}
          </h3>
        </div>
        <div className="mt-4 flex flex-wrap items-end gap-3">
          <div className="flex-1 min-w-[220px]">
            <Label htmlFor="ln">
              {locale === "fr" ? "Nom de la liste" : "List name"}
            </Label>
            <Input
              id="ln"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder={
                locale === "fr"
                  ? "Prospects agence web Q3"
                  : "Q3 web agency prospects"
              }
            />
          </div>
          <Button onClick={handleCreate} leftIcon={<Plus size={14} />}>
            {locale === "fr" ? "Créer la liste" : "Create list"}
          </Button>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {lists.map((l) => (
          <div
            key={l.id}
            className="group flex flex-col rounded-xl border border-border bg-surface bg-panel p-5 transition-colors hover:border-border-strong"
          >
            <div className="flex items-start justify-between gap-2">
              <button
                onClick={() => setActiveId(l.id)}
                className="truncate text-left text-base font-semibold text-foreground hover:text-accent-strong"
              >
                {displayListName(l.name, locale)}
              </button>
              <span className="rounded-full border border-border bg-surface-2 px-2 py-0.5 text-[11px] font-medium text-muted-strong">
                {l.leadIds.length}
              </span>
            </div>
            <p className="mt-1 text-xs text-muted">
              {locale === "fr" ? "Mis à jour" : "Updated"}{" "}
              {formatRelative(l.updatedAt)}
            </p>
            <div className="mt-4 flex items-center justify-between">
              <button
                onClick={() => setActiveId(l.id)}
                className="text-xs text-accent-strong hover:text-accent"
              >
                {locale === "fr" ? "Ouvrir →" : "Open →"}
              </button>
              <div className="flex gap-1">
                <button
                  onClick={() => handleDelete(l)}
                  className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-border text-muted-strong hover:border-danger/40 hover:bg-danger/10 hover:text-danger"
                  aria-label={
                    locale === "fr" ? "Supprimer la liste" : "Delete list"
                  }
                >
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
          </div>
        ))}
        {lists.length === 0 ? (
          <div className="col-span-full rounded-xl border border-dashed border-border bg-surface/50 p-10 text-center text-sm text-muted">
            {locale === "fr"
              ? "Aucune liste pour l’instant. Créez-en une ci-dessus."
              : "No lists yet. Create one above to get started."}
          </div>
        ) : null}
      </div>
    </div>
  );
}
