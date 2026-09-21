import { Download, Wrench, X } from "lucide-react";
import { useMemo, useState } from "react";
import {
  auditPassword,
  calculateCidr,
  decodeJwt,
  decodeText,
  encodeText,
  generateWordlist,
  identifyHash,
  type EncodeFormat,
} from "../services/toolService";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

type Tool =
  | "hash"
  | "encode"
  | "jwt"
  | "password"
  | "wordlist"
  | "cidr";

const TOOLS: { id: Tool; label: string }[] = [
  { id: "hash", label: "Hash Identifier" },
  { id: "encode", label: "Encoder / Decoder" },
  { id: "jwt", label: "JWT Decoder" },
  { id: "password", label: "Password Auditor" },
  { id: "wordlist", label: "Wordlist Generator" },
  { id: "cidr", label: "CIDR Calculator" },
];

function LocalBadge() {
  return (
    <span className="rounded border border-term-green/40 px-1.5 py-0.5 text-[9px] text-term-green">
      LOCAL / EDU
    </span>
  );
}

function HashTool() {
  const [input, setInput] = useState("");
  const results = useMemo(() => identifyHash(input), [input]);
  return (
    <div className="space-y-2">
      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Paste a hash value..."
        className="h-20 w-full resize-none rounded-md border border-border bg-bg p-2 text-xs text-slate-100 focus:outline-none focus:border-term-green/50"
      />
      <div className="space-y-1">
        {results.map((r, i) => (
          <div key={i} className="flex justify-between rounded border border-border px-2 py-1 text-xs">
            <span className="text-slate-200">{r.type}</span>
            <span className="text-term-dim">{r.confidence}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function EncodeTool() {
  const [format, setFormat] = useState<EncodeFormat>("base64");
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");

  const run = (mode: "encode" | "decode") => {
    setError("");
    try {
      setOutput(mode === "encode" ? encodeText(input, format) : decodeText(input, format));
    } catch {
      setError("Could not process input for the selected format.");
      setOutput("");
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-1.5">
        {(["base64", "url", "hex"] as EncodeFormat[]).map((f) => (
          <button
            key={f}
            onClick={() => setFormat(f)}
            className={`rounded px-2 py-1 text-[11px] uppercase ${
              format === f ? "bg-term-cyan/15 text-term-cyan" : "text-term-dim"
            }`}
          >
            {f}
          </button>
        ))}
      </div>
      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Input text..."
        className="h-16 w-full resize-none rounded-md border border-border bg-bg p-2 text-xs text-slate-100 focus:outline-none focus:border-term-green/50"
      />
      <div className="flex gap-2">
        <button onClick={() => run("encode")} className="flex-1 rounded border border-term-green/40 py-1 text-xs text-term-green">
          Encode
        </button>
        <button onClick={() => run("decode")} className="flex-1 rounded border border-term-cyan/40 py-1 text-xs text-term-cyan">
          Decode
        </button>
      </div>
      {error && <p className="text-xs text-term-red">{error}</p>}
      {output && (
        <textarea readOnly value={output} className="h-16 w-full resize-none rounded-md border border-border bg-bg p-2 text-xs text-slate-300" />
      )}
    </div>
  );
}

function JwtTool() {
  const [token, setToken] = useState("");
  const [error, setError] = useState("");
  const [decoded, setDecoded] = useState<ReturnType<typeof decodeJwt> | null>(null);

  const run = () => {
    setError("");
    try {
      setDecoded(decodeJwt(token));
    } catch (e) {
      setDecoded(null);
      setError(e instanceof Error ? e.message : "Could not decode token.");
    }
  };

  return (
    <div className="space-y-2">
      <textarea
        value={token}
        onChange={(e) => setToken(e.target.value)}
        placeholder="Paste a JWT..."
        className="h-16 w-full resize-none rounded-md border border-border bg-bg p-2 text-xs text-slate-100 focus:outline-none focus:border-term-green/50"
      />
      <button onClick={run} className="w-full rounded border border-term-green/40 py-1 text-xs text-term-green">
        Decode (read-only)
      </button>
      {error && <p className="text-xs text-term-red">{error}</p>}
      {decoded && (
        <div className="space-y-2 text-xs">
          <div>
            <p className="mb-1 text-term-dim">Header</p>
            <pre className="overflow-x-auto rounded bg-bg p-2 text-slate-300">
              {JSON.stringify(decoded.header, null, 2)}
            </pre>
          </div>
          <div>
            <p className="mb-1 text-term-dim">Payload</p>
            <pre className="overflow-x-auto rounded bg-bg p-2 text-slate-300">
              {JSON.stringify(decoded.payload, null, 2)}
            </pre>
          </div>
          {decoded.expiresAt && (
            <p className={decoded.isExpired ? "text-term-red" : "text-term-green"}>
              Expires: {decoded.expiresAt} {decoded.isExpired ? "(expired)" : ""}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function PasswordTool() {
  const [pwd, setPwd] = useState("");
  const audit = useMemo(() => (pwd ? auditPassword(pwd) : null), [pwd]);
  const barColors = ["bg-term-red", "bg-term-red", "bg-yellow-500", "bg-term-green", "bg-term-green"];

  return (
    <div className="space-y-2">
      <input
        type="text"
        value={pwd}
        onChange={(e) => setPwd(e.target.value)}
        placeholder="Enter a password to audit..."
        className="w-full rounded-md border border-border bg-bg p-2 text-xs text-slate-100 focus:outline-none focus:border-term-green/50"
      />
      {audit && (
        <div className="space-y-2 text-xs">
          <div className="flex gap-1">
            {[0, 1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className={`h-1.5 flex-1 rounded ${i <= audit.score ? barColors[audit.score] : "bg-border"}`}
              />
            ))}
          </div>
          <p className="text-slate-200">
            {audit.label} · ~{audit.entropyBits} bits entropy
          </p>
          <ul className="list-inside list-disc space-y-0.5 text-term-dim">
            {audit.feedback.map((f, i) => (
              <li key={i}>{f}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function WordlistTool() {
  const [opts, setOpts] = useState({
    lower: true,
    upper: false,
    digits: true,
    symbols: false,
    minLength: 6,
    maxLength: 8,
    prefix: "",
    suffix: "",
  });
  const [words, setWords] = useState<string[]>([]);

  const generate = () => setWords(generateWordlist({ ...opts, cap: 2000 }));

  const download = () => {
    const blob = new Blob([words.join("\n")], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "wordlist.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  const toggle = (key: "lower" | "upper" | "digits" | "symbols") =>
    setOpts((p) => ({ ...p, [key]: !p[key] }));

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2 text-xs">
        {(["lower", "upper", "digits", "symbols"] as const).map((k) => (
          <label key={k} className="flex items-center gap-1 text-slate-300">
            <input type="checkbox" checked={opts[k]} onChange={() => toggle(k)} />
            {k}
          </label>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          type="number"
          min={1}
          value={opts.minLength}
          onChange={(e) => setOpts((p) => ({ ...p, minLength: Number(e.target.value) }))}
          className="w-1/2 rounded border border-border bg-bg p-1.5 text-xs"
          placeholder="Min length"
        />
        <input
          type="number"
          min={1}
          value={opts.maxLength}
          onChange={(e) => setOpts((p) => ({ ...p, maxLength: Number(e.target.value) }))}
          className="w-1/2 rounded border border-border bg-bg p-1.5 text-xs"
          placeholder="Max length"
        />
      </div>
      <div className="flex gap-2">
        <input
          value={opts.prefix}
          onChange={(e) => setOpts((p) => ({ ...p, prefix: e.target.value }))}
          placeholder="Prefix"
          className="w-1/2 rounded border border-border bg-bg p-1.5 text-xs"
        />
        <input
          value={opts.suffix}
          onChange={(e) => setOpts((p) => ({ ...p, suffix: e.target.value }))}
          placeholder="Suffix"
          className="w-1/2 rounded border border-border bg-bg p-1.5 text-xs"
        />
      </div>
      <button onClick={generate} className="w-full rounded border border-term-green/40 py-1 text-xs text-term-green">
        Generate (capped at 2,000)
      </button>
      {words.length > 0 && (
        <>
          <p className="text-xs text-term-dim">{words.length} entries generated</p>
          <button onClick={download} className="flex w-full items-center justify-center gap-1 rounded border border-term-cyan/40 py-1 text-xs text-term-cyan">
            <Download size={12} /> Download .txt
          </button>
        </>
      )}
    </div>
  );
}

function CidrTool() {
  const [input, setInput] = useState("192.168.1.0/24");
  const [error, setError] = useState("");
  const [result, setResult] = useState<ReturnType<typeof calculateCidr> | null>(null);

  const run = () => {
    setError("");
    try {
      setResult(calculateCidr(input));
    } catch (e) {
      setResult(null);
      setError(e instanceof Error ? e.message : "Invalid CIDR.");
    }
  };

  return (
    <div className="space-y-2">
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="192.168.1.0/24"
        className="w-full rounded-md border border-border bg-bg p-2 text-xs text-slate-100 focus:outline-none focus:border-term-green/50"
      />
      <button onClick={run} className="w-full rounded border border-term-green/40 py-1 text-xs text-term-green">
        Calculate
      </button>
      {error && <p className="text-xs text-term-red">{error}</p>}
      {result && (
        <div className="space-y-1 text-xs text-slate-200">
          {Object.entries(result).map(([k, v]) => (
            <div key={k} className="flex justify-between border-b border-border/50 py-1">
              <span className="text-term-dim">{k}</span>
              <span>{String(v)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Toolbox({ isOpen, onClose }: Props) {
  const [active, setActive] = useState<Tool>("hash");

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-30 bg-black/60 lg:hidden" onClick={onClose} />
      <aside className="glass fixed inset-y-0 right-0 z-40 m-2 flex w-[90vw] max-w-[340px] flex-col rounded-2xl">
        <div className="flex items-center justify-between border-b border-white/10 p-3">
          <div className="flex items-center gap-2">
            <Wrench size={15} className="text-term-cyan" />
            <span className="text-xs font-medium tracking-wide text-term-cyan">TOOLBOX</span>
            <LocalBadge />
          </div>
          <button onClick={onClose} className="rounded p-1 text-term-dim hover:text-term-green">
            <X size={16} />
          </button>
        </div>
        <div className="flex flex-wrap gap-1 border-b border-white/10 p-2">
          {TOOLS.map((t) => (
            <button
              key={t.id}
              onClick={() => setActive(t.id)}
              className={`rounded px-2 py-1 text-[11px] ${
                active === t.id ? "bg-term-green/10 text-term-green" : "text-term-dim"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
        <div className="flex-1 overflow-y-auto p-3">
          {active === "hash" && <HashTool />}
          {active === "encode" && <EncodeTool />}
          {active === "jwt" && <JwtTool />}
          {active === "password" && <PasswordTool />}
          {active === "wordlist" && <WordlistTool />}
          {active === "cidr" && <CidrTool />}
        </div>
      </aside>
    </>
  );
}