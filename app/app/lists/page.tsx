"use client";

import { ArrowLeft, Edit2, Plus, Trash2 } from "lucide-react";
import * as React from "react";
import { LeadTable } from "@/components/leads/LeadTable";
import { Button } from "@/components/ui/Button";
import { Input, Label } from "@/components/ui/Field";
import type { Lead, LeadList } from "@/lib/leadTypes";
import {
  createList,
  deleteList,
  ensureDefaultLists,
  getLists,
  getSavedLeads,
  removeLeadFromList,
  updateList,
} from "@/lib/storage";
import { formatRelative } from "@/lib/utils";

export default function ListsPage() {
  const [lists, setLists] = React.useState<LeadList[]>([]);
  const [saved, setSaved] = React.useState<Lead[]>([]);
  const [activeId, setActiveId] = React.useState<string | null>(null);
  const [newName, setNewName] = React.useState("");

  const refresh = React.useCallback(() => {
    ensureDefaultLists();
    setLists(getLists());
    setSaved(getSavedLeads());
  }, []);

  React.useEffect(() => {
    refresh();
  }, [refresh]);

  const active = lists.find((l) => l.id === activeId) ?? null;
  const activeLeads = active
    ? saved.filter((l) => active.leadIds.includes(l.id))
    : [];

  function handleCreate() {
    if (!newName.trim()) return;
    createList(newName.trim());
    setNewName("");
    refresh();
  }

  function handleRename(list: LeadList) {
    const name = window.prompt("Rename list", list.name);
    if (!name || !name.trim()) return;
    updateList(list.id, { name: name.trim() });
    refresh();
  }

  function handleDelete(list: LeadList) {
    if (!window.confirm(`Delete list “${list.name}”?`)) return;
    deleteList(list.id);
    if (activeId === list.id) setActiveId(null);
    refresh();
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
              <ArrowLeft size={12} /> Back to lists
            </button>
            <h2 className="mt-1 text-xl font-semibold text-foreground">
              {active.name}
            </h2>
            <p className="text-xs text-muted">
              {active.leadIds.length} leads · Updated{" "}
              {formatRelative(active.updatedAt)}
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              leftIcon={<Edit2 size={12} />}
              onClick={() => handleRename(active)}
            >
              Rename
            </Button>
            <Button
              size="sm"
              variant="danger"
              leftIcon={<Trash2 size={12} />}
              onClick={() => handleDelete(active)}
            >
              Delete
            </Button>
          </div>
        </div>

        {activeLeads.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-surface/50 p-10 text-center">
            <h3 className="text-base font-semibold text-foreground">
              This list is empty.
            </h3>
            <p className="mt-1 text-sm text-muted-strong">
              Run a search and use “Add to list” to populate it.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between text-xs text-muted">
              <div>{activeLeads.length} leads in this list</div>
              <div className="flex flex-wrap gap-2">
                {active.leadIds.length > 0 ? (
                  <button
                    onClick={() => {
                      active.leadIds.forEach((id) =>
                        removeLeadFromList(active.id, id)
                      );
                      refresh();
                    }}
                    className="text-xs text-muted hover:text-danger"
                  >
                    Empty list
                  </button>
                ) : null}
              </div>
            </div>
            <LeadTable
              leads={activeLeads}
              defaultFilename={`findely-${active.name.replace(/\s+/g, "-").toLowerCase()}.csv`}
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
            Create a new list
          </h3>
        </div>
        <div className="mt-4 flex flex-wrap items-end gap-3">
          <div className="flex-1 min-w-[220px]">
            <Label htmlFor="ln">List name</Label>
            <Input
              id="ln"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Q3 web agency prospects"
            />
          </div>
          <Button onClick={handleCreate} leftIcon={<Plus size={14} />}>
            Create list
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
                {l.name}
              </button>
              <span className="rounded-full border border-border bg-surface-2 px-2 py-0.5 text-[11px] font-medium text-muted-strong">
                {l.leadIds.length}
              </span>
            </div>
            <p className="mt-1 text-xs text-muted">
              Updated {formatRelative(l.updatedAt)}
            </p>
            <div className="mt-4 flex items-center justify-between">
              <button
                onClick={() => setActiveId(l.id)}
                className="text-xs text-accent-strong hover:text-accent"
              >
                Open →
              </button>
              <div className="flex gap-1">
                <button
                  onClick={() => handleRename(l)}
                  className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-border text-muted-strong hover:bg-surface-2"
                  aria-label="Rename"
                >
                  <Edit2 size={12} />
                </button>
                <button
                  onClick={() => handleDelete(l)}
                  className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-border text-muted-strong hover:border-danger/40 hover:bg-danger/10 hover:text-danger"
                  aria-label="Delete"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
          </div>
        ))}
        {lists.length === 0 ? (
          <div className="col-span-full rounded-xl border border-dashed border-border bg-surface/50 p-10 text-center text-sm text-muted">
            No lists yet. Create one above to get started.
          </div>
        ) : null}
      </div>
    </div>
  );
}
