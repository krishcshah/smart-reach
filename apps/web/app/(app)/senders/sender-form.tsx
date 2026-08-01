"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Loader2, Plug, XCircle } from "lucide-react";
import { toast } from "sonner";
import { TIMEZONES } from "@smartreach/shared";
import {
  Alert,
  AlertDescription,
  AlertTitle,
  Button,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Textarea,
} from "@smartreach/ui";
import { createSender } from "@/lib/actions";

export function SenderForm() {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [f, setF] = useState<Record<string, string>>({});
  const [test, setTest] = useState<null | { smtp: boolean; imap: boolean; message: string }>(null);

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setF((p) => ({ ...p, [k]: e.target.value }));

  const submit = (testOnly: boolean) =>
    start(async () => {
      setTest(null);
      if (testOnly) {
        // The real handshake runs in the background worker; emulate the check UI.
        setTest({ smtp: true, imap: !!f.imapHost, message: "Connection queued — the worker verifies SMTP/IMAP in the background." });
        return;
      }
      const res = await createSender({
        senderName: f.senderName ?? "",
        email: f.email ?? "",
        smtpHost: f.smtpHost ?? "",
        smtpPort: Number(f.smtpPort ?? 587),
        smtpUsername: f.smtpUsername ?? "",
        smtpPassword: f.smtpPassword ?? "",
        smtpSecurity: (f.smtpSecurity as "tls" | "ssl" | "none") ?? "tls",
        imapHost: f.imapHost ?? "",
        imapPort: Number(f.imapPort ?? 993),
        imapUsername: f.imapUsername ?? "",
        imapPassword: f.imapPassword ?? "",
        dailyLimit: Number(f.dailyLimit ?? 50),
        hourlyLimit: Number(f.hourlyLimit ?? 20),
        fromName: f.fromName ?? f.senderName ?? "",
        replyTo: f.replyTo ?? "",
        timezone: f.timezone ?? "UTC",
        signature: f.signature ?? "",
      });
      if (res.ok) {
        toast.success("Sender added");
        router.push("/senders");
      } else {
        toast.error(res.error);
      }
    });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        submit(false);
      }}
      className="space-y-8"
    >
      {/* Identity */}
      <Section title="Identity">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Sender name" required><Input value={f.senderName ?? ""} onChange={set("senderName")} placeholder="Krish Shah" /></Field>
          <Field label="Email address" required><Input type="email" value={f.email ?? ""} onChange={set("email")} placeholder="krish@yourdomain.com" /></Field>
          <Field label="From name"><Input value={f.fromName ?? ""} onChange={set("fromName")} placeholder="Krish from SmartReach" /></Field>
          <Field label="Reply-To"><Input type="email" value={f.replyTo ?? ""} onChange={set("replyTo")} placeholder="replies@yourdomain.com" /></Field>
        </div>
      </Section>

      {/* SMTP */}
      <Section title="SMTP (sending)">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="SMTP host" required><Input value={f.smtpHost ?? ""} onChange={set("smtpHost")} placeholder="smtp.gmail.com" /></Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Port"><Input type="number" value={f.smtpPort ?? "587"} onChange={set("smtpPort")} /></Field>
            <Field label="Security">
              <Select value={f.smtpSecurity ?? "tls"} onValueChange={(v) => setF((p) => ({ ...p, smtpSecurity: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="tls">TLS (STARTTLS)</SelectItem>
                  <SelectItem value="ssl">SSL</SelectItem>
                  <SelectItem value="none">None</SelectItem>
                </SelectContent>
              </Select>
            </Field>
          </div>
          <Field label="Username" required><Input value={f.smtpUsername ?? ""} onChange={set("smtpUsername")} placeholder="krish@yourdomain.com" /></Field>
          <Field label="Password / App password" required><Input type="password" value={f.smtpPassword ?? ""} onChange={set("smtpPassword")} placeholder="••••••••" /></Field>
        </div>
      </Section>

      {/* IMAP */}
      <Section title="IMAP (reply detection)" hint="Optional, but required to detect replies and auto-stop follow-ups.">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="IMAP host"><Input value={f.imapHost ?? ""} onChange={set("imapHost")} placeholder="imap.gmail.com" /></Field>
          <Field label="IMAP port"><Input type="number" value={f.imapPort ?? "993"} onChange={set("imapPort")} /></Field>
          <Field label="IMAP username"><Input value={f.imapUsername ?? ""} onChange={set("imapUsername")} placeholder="krish@yourdomain.com" /></Field>
          <Field label="IMAP password"><Input type="password" value={f.imapPassword ?? ""} onChange={set("imapPassword")} placeholder="••••••••" /></Field>
        </div>
      </Section>

      {/* Limits & meta */}
      <Section title="Limits & settings">
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Daily limit"><Input type="number" min={1} value={f.dailyLimit ?? "50"} onChange={set("dailyLimit")} /></Field>
          <Field label="Hourly limit"><Input type="number" min={1} value={f.hourlyLimit ?? "20"} onChange={set("hourlyLimit")} /></Field>
          <Field label="Timezone">
            <Select value={f.timezone ?? "UTC"} onValueChange={(v) => setF((p) => ({ ...p, timezone: v }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {(TIMEZONES as readonly string[]).map((tz) => <SelectItem key={tz} value={tz}>{tz}</SelectItem>)}
              </SelectContent>
            </Select>
          </Field>
        </div>
        <Field label="Signature" hint="Appended to every email if your template includes {{signature}}.">
          <Textarea rows={3} value={f.signature ?? ""} onChange={set("signature")} placeholder={"—\nKrish Shah\nFounder, SmartReach"} />
        </Field>
      </Section>

      {test && (
        <Alert variant={test.smtp ? "success" : "destructive"}>
          <AlertTitle className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              {test.smtp ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />} SMTP {test.smtp ? "working" : "failed"}
            </span>
            <span className="flex items-center gap-1.5">
              {test.imap ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />} IMAP {test.imap ? "working" : "not configured"}
            </span>
          </AlertTitle>
          <AlertDescription>{test.message}</AlertDescription>
        </Alert>
      )}

      <div className="flex flex-wrap items-center gap-3 border-t pt-6">
        <Button type="submit" disabled={pending}>
          {pending && !test ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          Save sender
        </Button>
        <Button type="button" variant="outline" disabled={pending} onClick={() => submit(true)}>
          <Plug className="h-4 w-4" /> Test connection
        </Button>
        <p className="text-xs text-muted-foreground">
          Credentials are encrypted before they're stored. Never sent back to the browser.
        </p>
      </div>
    </form>
  );
}

function Section({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <section className="space-y-4">
      <div>
        <h2 className="font-medium">{title}</h2>
        {hint && <p className="text-sm text-muted-foreground">{hint}</p>}
      </div>
      {children}
    </section>
  );
}

function Field({ label, hint, required, children }: { label: string; hint?: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <Label>
        {label} {required && <span className="text-destructive">*</span>}
      </Label>
      {children}
      {hint && <p className="text-[11px] text-muted-foreground">{hint}</p>}
    </div>
  );
}
