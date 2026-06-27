"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { StatusDot } from "@/components/shared/status-dot";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  DashboardBadge,
  DashboardPage,
  DashboardPageHeader,
  DashboardPanel,
  DashboardPrimaryButton,
  DashboardRowCard,
  DashboardRowList,
} from "@/components/dashboard";
import { clientEnv } from "@/lib/env";
import { STAFF_WEEKDAY_LABELS, staffWeekdayIndexToKey } from "@/lib/staff/weekday";

import {
  addTimeOffAction,
  createStaffInviteAction,
  revokeStaffInviteAction,
  saveStaffHoursAction,
} from "../api";

type OwnerMember = {
  id: string;
  role: string;
  profile: { display_name: string } | null;
};

type PendingInvite = {
  id: string;
  email: string;
  token: string;
  expires_at: string;
};

type StaffBoardProps =
  | {
      mode: "owner";
      members: OwnerMember[];
      invites: PendingInvite[];
    }
  | {
      mode: "barber";
      membershipId: string;
      hours: Array<{
        id: string;
        weekday: number;
        start_time: string;
        end_time: string;
      }>;
      timeOff: Array<{
        id: string;
        starts_at: string;
        ends_at: string;
        note: string | null;
      }>;
    };

function buildJoinUrl(token: string): string {
  return `http://${clientEnv.NEXT_PUBLIC_ROOT_DOMAIN}/join/${token}`;
}

export function StaffBoard(props: StaffBoardProps) {
  if (props.mode === "barber") {
    return <BarberSchedule membershipId={props.membershipId} hours={props.hours} timeOff={props.timeOff} />;
  }
  return <OwnerStaff members={props.members} invites={props.invites} />;
}

function OwnerStaff({
  members,
  invites,
}: {
  members: OwnerMember[];
  invites: PendingInvite[];
}) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [lastLink, setLastLink] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function createInvite() {
    setError(null);
    startTransition(async () => {
      const result = await createStaffInviteAction({ email });
      if (!result.ok) {
        setError("Einladung konnte nicht erstellt werden.");
        return;
      }
      setLastLink(buildJoinUrl(result.data.token));
      setEmail("");
      router.refresh();
    });
  }

  function copyLink(link: string) {
    void navigator.clipboard.writeText(link);
  }

  function revoke(inviteId: string) {
    startTransition(async () => {
      await revokeStaffInviteAction(inviteId);
      router.refresh();
    });
  }

  return (
    <DashboardPage width="lg">
      <DashboardPageHeader
        kicker="Dein Team"
        title="Team"
        subtitle="Barber einladen, Join-Links kopieren und sehen, wer Zugriff hat."
      />

      <DashboardPanel title="Barber einladen" description="Join-Link senden — sie erstellen ihren eigenen Login.">
        <div className="flex flex-col gap-[var(--space-3)] sm:flex-row">
          <Input
            type="email"
            placeholder="email@example.com"
            className="salon-dash-search"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <DashboardPrimaryButton type="button" disabled={isPending || !email} onClick={createInvite}>
            Link erstellen
          </DashboardPrimaryButton>
        </div>
        {lastLink ? (
          <div className="mt-[var(--space-4)] flex flex-col gap-[var(--space-2)] sm:flex-row sm:items-center">
            <code className="flex-1 truncate rounded-md border border-border/70 bg-[var(--ink-0)]/50 px-[var(--space-3)] py-[var(--space-2)] text-xs">
              {lastLink}
            </code>
            <Button type="button" variant="outline" size="sm" onClick={() => copyLink(lastLink)}>
              Kopieren
            </Button>
          </div>
        ) : null}
        {error ? <p className="mt-[var(--space-3)] text-sm text-destructive">{error}</p> : null}
      </DashboardPanel>

      {invites.length > 0 ? (
        <DashboardPanel title="Offene Einladungen" description="Links warten auf Annahme." className="mt-[var(--space-4)]">
          <DashboardRowList>
            {invites.map((invite) => (
              <DashboardRowCard
                key={invite.id}
                avatar="@"
                title={invite.email}
                subtitle="Wartet auf Annahme"
                trailing={
                  <div className="flex gap-[var(--space-2)]">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => copyLink(buildJoinUrl(invite.token))}
                    >
                      Link kopieren
                    </Button>
                    <Button type="button" variant="ghost" size="sm" onClick={() => revoke(invite.id)}>
                      Widerrufen
                    </Button>
                  </div>
                }
              />
            ))}
          </DashboardRowList>
        </DashboardPanel>
      ) : null}

      <DashboardPanel title="Team" description={`${members.length} Mitglieder`} className="mt-[var(--space-4)]">
        <DashboardRowList>
          {members.map((member) => {
            const name = member.profile?.display_name?.trim() || "Teammitglied";
            return (
              <DashboardRowCard
                key={member.id}
                avatar={name.slice(0, 1).toUpperCase()}
                title={name}
                badges={
                  <DashboardBadge tone={member.role === "owner" ? "brass" : "neutral"}>
                    {member.role === "owner" ? "Inhaber" : "Barber"}
                  </DashboardBadge>
                }
                trailing={<StatusDot label={member.role === "owner" ? "Inhaber" : "Barber"} tone={member.role === "owner" ? "owner" : "barber"} />}
              />
            );
          })}
        </DashboardRowList>
      </DashboardPanel>
    </DashboardPage>
  );
}

function BarberSchedule({
  membershipId,
  hours,
  timeOff,
}: {
  membershipId: string;
  hours: StaffBoardProps & { mode: "barber" } extends { hours: infer H } ? H : never;
  timeOff: StaffBoardProps & { mode: "barber" } extends { timeOff: infer T } ? T : never;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [offStart, setOffStart] = useState("");
  const [offEnd, setOffEnd] = useState("");
  const [note, setNote] = useState("");

  const hoursByDay = hours.reduce<Record<number, typeof hours>>((acc, row) => {
    acc[row.weekday] = [...(acc[row.weekday] ?? []), row];
    return acc;
  }, {});

  function buildAllDays(overrideWeekday?: number, overrideShifts?: { startTime: string; endTime: string }[]) {
    return [0, 1, 2, 3, 4, 5, 6].map((weekday) => {
      const shifts =
        overrideWeekday === weekday
          ? (overrideShifts ?? [])
          : (hoursByDay[weekday] ?? []).map((h) => ({
              startTime: h.start_time.slice(0, 5),
              endTime: h.end_time.slice(0, 5),
            }));
      return { weekday, shifts };
    });
  }

  function addShift(weekday: number) {
    startTransition(async () => {
      const dayShifts = (hoursByDay[weekday] ?? []).map((h) => ({
        startTime: h.start_time.slice(0, 5),
        endTime: h.end_time.slice(0, 5),
      }));
      dayShifts.push({ startTime: "09:00", endTime: "17:00" });
      await saveStaffHoursAction({
        membershipId,
        days: buildAllDays(weekday, dayShifts),
      });
      router.refresh();
    });
  }

  function addVacation() {
    if (!offStart || !offEnd) return;
    startTransition(async () => {
      await addTimeOffAction({
        membershipId,
        timeOff: {
          startsAt: new Date(offStart).toISOString(),
          endsAt: new Date(offEnd).toISOString(),
          note: note || undefined,
        },
      });
      router.refresh();
    });
  }

  return (
    <div className="mx-auto w-full max-w-3xl space-y-[var(--space-8)] px-[var(--space-4)] py-[var(--space-8)]">
      <header>
        <h1 className="font-display text-2xl text-[var(--text-0)]">Mein Dienstplan</h1>
      </header>

      <section className="space-y-[var(--space-4)]">
        <h2 className="text-sm font-medium">Wochenzeiten</h2>
        {[0, 1, 2, 3, 4, 5, 6].map((weekday) => {
          const key = staffWeekdayIndexToKey(weekday);
          const shifts = hoursByDay[weekday] ?? [];
          return (
            <div key={weekday} className="border-b border-border pb-[var(--space-3)]">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">{STAFF_WEEKDAY_LABELS[key]}</p>
                <Button type="button" variant="ghost" size="sm" onClick={() => addShift(weekday)}>
                  Schicht hinzufügen
                </Button>
              </div>
              <div className="mt-[var(--space-2)] flex flex-wrap gap-[var(--space-2)]">
                {shifts.map((shift) => (
                  <span
                    key={shift.id}
                    className="rounded-full border border-border px-[var(--space-3)] py-[var(--space-1)] text-xs text-data"
                  >
                    {shift.start_time.slice(0, 5)}–{shift.end_time.slice(0, 5)}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </section>

      <section className="space-y-[var(--space-3)]">
        <h2 className="text-sm font-medium">Abwesenheit</h2>
        <div className="grid gap-[var(--space-2)] sm:grid-cols-2">
          <div>
            <Label htmlFor="off-start">Start</Label>
            <Input id="off-start" type="date" value={offStart} onChange={(e) => setOffStart(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="off-end">Ende</Label>
            <Input id="off-end" type="date" value={offEnd} onChange={(e) => setOffEnd(e.target.value)} />
          </div>
        </div>
        <Input placeholder="Notiz (optional)" value={note} onChange={(e) => setNote(e.target.value)} />
        <Button type="button" disabled={isPending} onClick={addVacation}>
          Abwesenheit eintragen
        </Button>
        <ul className="space-y-[var(--space-2)] text-sm text-[var(--text-2)]">
          {timeOff.map((block) => (
            <li key={block.id}>
              {block.starts_at.slice(0, 10)} → {block.ends_at.slice(0, 10)}
              {block.note ? ` · ${block.note}` : ""}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
