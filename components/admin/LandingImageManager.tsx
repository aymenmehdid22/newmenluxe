"use client";

import { useRef, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { LANDING_BUCKET } from "@/lib/landing-bucket";

type State = { enabled: boolean; url: string | null; width: number | null; height: number | null };

const ACCEPT = ["image/jpeg", "image/png", "image/webp"];
const MAX_BYTES = 10 * 1024 * 1024;

function readDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
      URL.revokeObjectURL(url);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Image illisible."));
    };
    img.src = url;
  });
}

export default function LandingImageManager({
  productId,
  productName,
  initial,
}: {
  productId: string;
  productName: string;
  initial: State;
}) {
  const [state, setState] = useState<State>(initial);
  const [busy, setBusy] = useState<"toggle" | "upload" | null>(null);
  const [message, setMessage] = useState<{ type: "ok" | "error"; text: string } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  async function save(body: Record<string, unknown>) {
    const res = await fetch("/api/admin/landing-settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId, ...body }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error ?? "Enregistrement impossible.");
    const s = data.settings;
    setState({
      enabled: s.mobile_image_enabled,
      url: s.mobile_image_url,
      width: s.mobile_image_width,
      height: s.mobile_image_height,
    });
  }

  async function toggle() {
    if (busy) return;
    setBusy("toggle");
    setMessage(null);
    try {
      await save({ enabled: !state.enabled });
      setMessage({ type: "ok", text: !state.enabled ? "Image mobile activée." : "Image mobile désactivée." });
    } catch (e) {
      setMessage({ type: "error", text: e instanceof Error ? e.message : "Erreur." });
    } finally {
      setBusy(null);
    }
  }

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || busy) return;
    setMessage(null);
    if (!ACCEPT.includes(file.type)) return setMessage({ type: "error", text: "Format non supporté (JPG, PNG ou WebP)." });
    if (file.size > MAX_BYTES) return setMessage({ type: "error", text: "Image trop lourde (10 Mo maximum)." });

    setBusy("upload");
    try {
      const { width, height } = await readDimensions(file);

      const urlRes = await fetch("/api/admin/landing-settings/upload-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, contentType: file.type, size: file.size }),
      });
      const urlData = await urlRes.json().catch(() => ({}));
      if (!urlRes.ok) throw new Error(urlData.error ?? "Impossible de préparer l'envoi.");

      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );
      const { error: upError } = await supabase.storage
        .from(LANDING_BUCKET)
        .uploadToSignedUrl(urlData.path, urlData.token, file, { contentType: file.type });
      if (upError) throw new Error("Échec de l'envoi : " + upError.message);

      await save({ image: { path: urlData.path, width, height } });
      setMessage({
        type: "ok",
        text: state.enabled
          ? "Image remplacée."
          : "Image enregistrée. Activez-la pour l'afficher sur mobile.",
      });
    } catch (err) {
      setMessage({ type: "error", text: err instanceof Error ? err.message : "Erreur." });
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="card space-y-4 p-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wide">{productName}</h2>
          <p className="text-xs text-muted">
            {state.enabled ? "Affichée sur mobile" : "Désactivée"}
          </p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={state.enabled}
          aria-label="Activer l'image mobile"
          onClick={toggle}
          disabled={busy !== null || !state.url}
          className={
            "relative h-7 w-12 shrink-0 rounded-full transition disabled:cursor-not-allowed disabled:opacity-50 " +
            (state.enabled ? "bg-green-600" : "bg-[#cfcfcf]")
          }
        >
          <span
            className={
              "absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition-all " +
              (state.enabled ? "left-[22px]" : "left-0.5")
            }
          />
        </button>
      </div>

      {state.url ? (
        <div className="max-h-96 overflow-y-auto rounded-xl border border-border bg-background p-2">
          {/* Plain <img>: admin preview only, no optimisation needed. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={state.url} alt={"Aperçu — " + productName} className="mx-auto block h-auto w-full max-w-[360px]" />
        </div>
      ) : (
        <p className="rounded-xl border border-dashed border-border px-4 py-8 text-center text-sm text-muted">
          Aucune image. Ajoutez-en une pour pouvoir activer la fonctionnalité.
        </p>
      )}
      {state.width && state.height && (
        <p className="text-xs text-muted">
          {state.width} × {state.height} px
        </p>
      )}

      <div>
        <input ref={fileRef} type="file" accept={ACCEPT.join(",")} onChange={onFile} className="hidden" />
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={busy !== null}
          className="btn-primary !py-2.5"
        >
          {busy === "upload" ? "Envoi en cours…" : state.url ? "Changer l'image" : "Téléverser une image"}
        </button>
        <p className="mt-2 text-xs text-muted">
          JPG, PNG ou WebP, 10 Mo maximum. Largeur recommandée : 1080 px (format vertical).
        </p>
      </div>

      {message && (
        <p
          role="status"
          className={
            "rounded-lg px-3 py-2 text-sm " +
            (message.type === "ok" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700")
          }
        >
          {message.text}
        </p>
      )}
    </div>
  );
}
