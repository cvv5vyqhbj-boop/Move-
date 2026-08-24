import { ExternalLink, Trash2 } from "lucide-react";
import {
  adicionarLink,
  apagarComentario,
  apagarLink,
  comentar,
} from "@/app/actions/conversa";
import { ROLE_AREA, type Role } from "@/lib/constants";
import { Button, Card, Input, Textarea } from "./ui";
import { CorDaArea } from "./etiquetas";

type Comentario = {
  id: string;
  text: string;
  createdAt: Date;
  authorId: string | null;
  author: { name: string; role: string } | null;
};

// Cor de fundo do circulinho do autor, pintado pela area a que ele pertence.
// Assim, na conversa da demanda, ja da para saber a olho quem e de qual area.
const AREA_AVATAR: Record<string, string> = {
  EDICAO: "bg-violet-100 text-violet-700",
  SOCIAL: "bg-sky-100 text-sky-700",
  TRAFEGO: "bg-marca-100 text-marca-700",
  DESIGN: "bg-amber-100 text-amber-700",
  COPY: "bg-emerald-100 text-emerald-700",
  FILMAGEM: "bg-slate-100 text-slate-600",
};

function corDoAvatar(role: string | undefined): string {
  if (!role) return "bg-slate-100 text-slate-600";
  const area = ROLE_AREA[role as Role];
  if (!area) return "bg-marca-100 text-marca-700"; // admin fica no laranja da marca
  return AREA_AVATAR[area] ?? "bg-slate-100 text-slate-600";
}

type Link = { id: string; title: string; url: string };

/** "há 5 minutos", "ontem", "12/08 às 14:30" */
function quando(data: Date) {
  const minutos = Math.round((Date.now() - new Date(data).getTime()) / 60000);
  if (minutos < 1) return "agora";
  if (minutos < 60) return `há ${minutos} min`;
  const horas = Math.round(minutos / 60);
  if (horas < 24) return `há ${horas} h`;
  return new Date(data).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** Iniciais para o circulinho do autor. */
function iniciais(nome: string) {
  return nome
    .split(" ")
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase();
}

export function ConversaDemanda({
  demandId,
  comentarios,
  links,
  usuarioId,
  admin,
}: {
  demandId: string;
  comentarios: Comentario[];
  links: Link[];
  usuarioId: string;
  admin: boolean;
}) {
  return (
    <div className="space-y-4">
      <Card>
        <h2 className="font-semibold text-slate-900">Conversa</h2>
        <p className="mb-4 text-sm text-slate-500">
          Combinados e ajustes desta demanda. Todo mundo que vê a demanda vê aqui.
        </p>

        {comentarios.length === 0 ? (
          <p className="py-4 text-sm text-slate-400">
            Ainda não há nada escrito. Comece a conversa abaixo.
          </p>
        ) : (
          <ul className="mb-5 space-y-4">
            {comentarios.map((c) => (
              <li key={c.id} className="flex gap-3">
                <span
                  className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-medium ${corDoAvatar(
                    c.author?.role,
                  )}`}
                  title={
                    c.author?.role
                      ? `Cargo: ${c.author.role.toLowerCase()}`
                      : undefined
                  }
                >
                  {iniciais(c.author?.name ?? "?")}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="flex items-center gap-2 text-sm">
                    {c.author?.role && ROLE_AREA[c.author.role as Role] && (
                      <CorDaArea area={ROLE_AREA[c.author.role as Role] as string} />
                    )}
                    <span className="font-medium text-slate-900">
                      {c.author?.name ?? "Alguém que saiu da equipe"}
                    </span>
                    <span className="text-xs text-slate-400">
                      {quando(c.createdAt)}
                    </span>
                  </p>
                  <p className="mt-0.5 text-sm whitespace-pre-line text-slate-700">
                    {c.text}
                  </p>
                </div>
                {(admin || c.authorId === usuarioId) && (
                  <form action={apagarComentario}>
                    <input type="hidden" name="id" value={c.id} />
                    <button
                      type="submit"
                      title="Apagar"
                      className="cursor-pointer text-slate-300 hover:text-rose-600"
                    >
                      <Trash2 size={15} />
                    </button>
                  </form>
                )}
              </li>
            ))}
          </ul>
        )}

        <form action={comentar} className="space-y-2">
          <input type="hidden" name="demandId" value={demandId} />
          <Textarea
            name="text"
            rows={2}
            placeholder="Escreva aqui..."
            required
          />
          <Button type="submit">Enviar</Button>
        </form>
      </Card>

      <Card>
        <h2 className="font-semibold text-slate-900">Materiais</h2>
        <p className="mb-4 text-sm text-slate-500">
          Links do drive, do briefing ou da arte aprovada — tudo junto da demanda.
        </p>

        {links.length === 0 ? (
          <p className="py-2 text-sm text-slate-400">Nenhum link guardado ainda.</p>
        ) : (
          <ul className="mb-5 divide-y divide-slate-100">
            {links.map((l) => (
              <li key={l.id} className="flex items-center justify-between gap-3 py-2">
                <a
                  href={l.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex min-w-0 items-center gap-2 text-sm text-marca-600 hover:underline"
                >
                  <ExternalLink size={14} className="shrink-0" />
                  <span className="truncate">{l.title}</span>
                </a>
                <form action={apagarLink}>
                  <input type="hidden" name="id" value={l.id} />
                  <button
                    type="submit"
                    title="Remover"
                    className="cursor-pointer text-slate-300 hover:text-rose-600"
                  >
                    <Trash2 size={15} />
                  </button>
                </form>
              </li>
            ))}
          </ul>
        )}

        <form action={adicionarLink} className="grid gap-2 sm:grid-cols-[1fr_1fr_auto]">
          <input type="hidden" name="demandId" value={demandId} />
          <Input name="title" placeholder="Nome (ex.: Briefing)" />
          <Input name="url" placeholder="Cole o link aqui" required />
          <Button type="submit" variant="secundario">
            Guardar
          </Button>
        </form>
      </Card>
    </div>
  );
}
