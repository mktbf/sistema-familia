import { useState, useEffect } from "react";
import { supabase } from "./supabaseClient";

function getISOWeek() {
  const now = new Date();
  const d = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
  return `${d.getUTCFullYear()}-W${String(weekNo).padStart(2, "0")}`;
}

const TASKS = [
  { id: "jean_lucas_manha", label: "Organizar Lucas — manhã", tag: "Jean", type: "jean" },
  { id: "jean_cafe", label: "Apoiar café da manhã", tag: "Jean", type: "jean" },
  { id: "jean_banho_livia", label: "Banho da Lívia", tag: "Jean", type: "jean" },
  { id: "jean_rotina_lucas_noite", label: "Rotina noturna do Lucas", tag: "Jean", type: "jean" },
  { id: "jean_conversa", label: "10 min de conversa com Dani (sem celular)", tag: "Jean", type: "jean" },
  { id: "jean_mercado", label: "Mercado / logística / compras", tag: "Jean", type: "jean" },
  { id: "jean_tarefa_casa", label: "1 tarefa completa da casa", tag: "Jean", type: "jean" },
  { id: "dani_livre_1", label: "Período livre da Dani (1)", tag: "Jean cobre", type: "dani" },
  { id: "dani_livre_2", label: "Período livre da Dani (2)", tag: "Jean cobre", type: "dani" },
  { id: "pai_filhos", label: "1 período sozinho com os filhos", tag: "Jean", type: "jean" },
  { id: "lucas_momento_pai", label: "Momento especial Lucas + pai", tag: "Jean", type: "jean" },
  { id: "lucas_momento_mae", label: "Momento especial Lucas + mãe", tag: "Dani", type: "dani" },
  { id: "casal_noite", label: "Noite do casal", tag: "Ambos", type: "casal" },
  { id: "reuniao", label: "Reunião semanal", tag: "Ambos", type: "casal" },
];

const GOALS = [
  { id: "encontro_quinzenal", label: "Encontro quinzenal", target: 4, icon: "🌙" },
  { id: "noite_casal", label: "Noite do casal", target: 8, icon: "🕯️" },
  { id: "periodo_dani", label: "Períodos livres da Dani", target: 16, icon: "🌿" },
  { id: "pai_filhos_meta", label: "Período pai-filhos", target: 8, icon: "👨‍👧‍👦" },
  { id: "reuniao_meta", label: "Reunião semanal", target: 8, icon: "📋" },
];

const MEETING_Q = [
  "O que funcionou bem essa semana?",
  "O que sobrecarregou?",
  "O que precisamos ajustar?",
  "Como podemos nos ajudar melhor?",
  "Como será a próxima semana?",
];

const C = {
  bg: "#FBF7F2",
  card: "#FFFFFF",
  terra: "#9B3A1F",
  terraLight: "#C4622D",
  cream: "#F5EDE2",
  teal: "#2A6B5A",
  rose: "#A33050",
  gold: "#B8872A",
  text: "#1E1209",
  sub: "#7A6254",
  muted: "#B5A396",
  border: "#EDE3D8",
};

const Checkmark = () => (
  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const WhatsAppButton = ({ text }) => (
  <a
    href={`https://wa.me/?text=${encodeURIComponent(text)}`}
    target="_blank"
    rel="noopener noreferrer"
    onClick={(e) => e.stopPropagation()}
    style={{
      display: "flex", alignItems: "center", justifyContent: "center",
      width: 28, height: 28, borderRadius: "50%", background: "#25D366", color: "white", flexShrink: 0, marginLeft: 6,
      boxShadow: "0 2px 5px rgba(37, 211, 102, 0.3)", transition: "transform 0.15s"
    }}
  >
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
    </svg>
  </a>
);

function TaskRow({ task, checked, onToggle }) {
  const typeStyle = {
    jean: { bg: "#FEF0E6", color: "#9B3A1F" },
    dani: { bg: "#E6F2EE", color: "#2A6B5A" },
    casal: { bg: "#F5E8EE", color: "#A33050" },
  };
  const s = typeStyle[task.type];

  return (
    <button
      onClick={onToggle}
      style={{
        display: "flex", alignItems: "center", gap: 12,
        background: checked ? "#FEF9F5" : C.card,
        border: `1px solid ${checked ? "#E8C9B0" : C.border}`,
        borderRadius: 14, padding: "13px 14px",
        width: "100%", textAlign: "left",
        transition: "all 0.15s ease", cursor: "pointer",
      }}
    >
      <div style={{
        width: 22, height: 22, borderRadius: "50%", flexShrink: 0,
        border: `2px solid ${checked ? C.terraLight : "#D4C5B8"}`,
        background: checked ? C.terraLight : "transparent",
        display: "flex", alignItems: "center", justifyContent: "center",
        transition: "all 0.15s ease",
      }}>
        {checked && <Checkmark />}
      </div>
      <span style={{
        flex: 1, fontSize: 13.5, color: checked ? C.muted : C.text,
        textDecoration: checked ? "line-through" : "none",
        fontWeight: 500, transition: "all 0.15s",
      }}>
        {task.label}
      </span>
      <span style={{
        fontSize: 11, fontWeight: 600, padding: "3px 8px",
        borderRadius: 20, background: s.bg, color: s.color,
        whiteSpace: "nowrap", flexShrink: 0,
      }}>
        {task.tag}
      </span>
      {checked && <WhatsAppButton text={`Amor, acabei de finalizar: *${task.label}* ✅`} />}
    </button>
  );
}

function SmallCheck({ checked, onToggle, label, color = C.terraLight }) {
  return (
    <button
      onClick={onToggle}
      style={{
        display: "flex", alignItems: "center", gap: 10,
        background: checked ? "#FEF9F5" : "#F8F4EF",
        border: `1px solid ${checked ? "#E8C9B0" : C.border}`,
        borderRadius: 12, padding: "11px 13px",
        width: "100%", textAlign: "left", cursor: "pointer",
        transition: "all 0.15s",
      }}
    >
      <div style={{
        width: 20, height: 20, borderRadius: "50%", flexShrink: 0,
        border: `2px solid ${checked ? color : "#D4C5B8"}`,
        background: checked ? color : "transparent",
        display: "flex", alignItems: "center", justifyContent: "center",
        transition: "all 0.15s",
      }}>
        {checked && <Checkmark />}
      </div>
      <span style={{
        flex: 1, fontSize: 13.5, color: checked ? C.muted : C.text,
        textDecoration: checked ? "line-through" : "none",
        fontWeight: 500,
      }}>
        {label}
      </span>
      {checked && <WhatsAppButton text={`Amor, acabei de finalizar: *${label}* ✅`} />}
    </button>
  );
}

function SectionCard({ emoji, title, subtitle, children }) {
  return (
    <div style={{ background: C.card, borderRadius: 18, padding: "18px 16px", border: `1px solid ${C.border}`, marginBottom: 14 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
        <span style={{ fontSize: 24 }}>{emoji}</span>
        <div>
          <div style={{ fontFamily: "Lora, Georgia, serif", fontSize: 16, fontWeight: 600, color: C.text }}>{title}</div>
          {subtitle && <div style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>{subtitle}</div>}
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>{children}</div>
    </div>
  );
}

function Painel({ checks, toggleCheck }) {
  const done = TASKS.filter(t => checks[t.id]).length;
  const pct = Math.round((done / TASKS.length) * 100);

  return (
    <div>
      <div style={{ background: C.card, borderRadius: 18, padding: 18, border: `1px solid ${C.border}`, marginBottom: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <span style={{ fontFamily: "Lora, Georgia, serif", fontSize: 15, fontWeight: 600, color: C.text }}>Semana atual</span>
          <span style={{ fontSize: 13, fontWeight: 700, color: C.terraLight }}>{done} / {TASKS.length}</span>
        </div>
        <div style={{ background: C.cream, borderRadius: 99, height: 8, overflow: "hidden" }}>
          <div style={{
            height: "100%", borderRadius: 99,
            background: `linear-gradient(90deg, ${C.terra}, ${C.terraLight})`,
            width: `${pct}%`, transition: "width 0.4s ease",
          }} />
        </div>
        <div style={{ fontSize: 12, color: C.muted, marginTop: 8 }}>
          {pct === 100 ? "✓ Semana completa!" : `${pct}% concluído`}
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {TASKS.map(task => (
          <TaskRow key={task.id} task={task} checked={!!checks[task.id]} onToggle={() => toggleCheck(task.id)} />
        ))}
      </div>
    </div>
  );
}

function Filhos({ checks, toggleCheck }) {
  const lucasItems = [
    { id: "lucas_brincadeira", label: "Tempo de brincadeira" },
    { id: "lucas_conversa_ind", label: "Conversa individual" },
    { id: "lucas_participacao", label: "Participação na organização" },
  ];
  const liviaItems = [
    { id: "livia_banho_d", label: "Banho (Jean)" },
    { id: "livia_colo", label: "Colo / vínculo" },
    { id: "livia_passeio", label: "Passeio" },
    { id: "livia_rotina_noturna", label: "Rotina noturna (Jean)" },
  ];

  return (
    <div>
      <SectionCard emoji="🦁" title="Lucas" subtitle="5 anos · rotina diária">
        {lucasItems.map(i => (
          <SmallCheck key={i.id} label={i.label} checked={!!checks[i.id]} onToggle={() => toggleCheck(i.id)} />
        ))}
      </SectionCard>

      <SectionCard emoji="🌸" title="Lívia" subtitle="9 meses · presença do Jean">
        {liviaItems.map(i => (
          <SmallCheck key={i.id} label={i.label} checked={!!checks[i.id]} onToggle={() => toggleCheck(i.id)} color={C.rose} />
        ))}
      </SectionCard>

      <div style={{ background: "#FFFBF0", border: "1px solid #E8D89A", borderRadius: 16, padding: "14px 16px" }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: C.gold, marginBottom: 6 }}>💛 Lembrete</div>
        <div style={{ fontSize: 13, color: "#7A6010", lineHeight: 1.6 }}>
          Lucas precisa continuar se sentindo visto e importante. Pequenos momentos valem muito.
        </div>
      </div>
    </div>
  );
}

function Casal({ checks, toggleCheck }) {
  return (
    <div>
      <SectionCard emoji="🕯️" title="Noite semanal" subtitle="1× por semana · sem celular em excesso">
        <SmallCheck
          label="Noite do casal realizada"
          checked={!!checks["casal_noite_semana"]}
          onToggle={() => toggleCheck("casal_noite_semana")}
          color={C.rose}
        />
        <div style={{ fontSize: 12, color: C.muted, padding: "4px 4px 0", lineHeight: 1.6 }}>
          Conversar · rir · cozinhar juntos · assistir algo · voltar a existir como casal
        </div>
      </SectionCard>

      <SectionCard emoji="🌙" title="Encontro quinzenal" subtitle="Jean organiza tudo — logística e programação">
        <SmallCheck
          label="Encontro quinzenal realizado"
          checked={!!checks["casal_encontro_q"]}
          onToggle={() => toggleCheck("casal_encontro_q")}
          color={C.rose}
        />
        <div style={{ fontSize: 12, color: C.muted, padding: "4px 4px 0", lineHeight: 1.6 }}>
          Jantar · café · caminhada · passeio — Daniele não carrega isso também
        </div>
      </SectionCard>

      <div style={{ background: "#FFF5F7", border: "1px solid #F2C4CF", borderRadius: 16, padding: "14px 16px" }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: C.rose, marginBottom: 6 }}>❤️ Filosofia do sistema</div>
        <div style={{ fontSize: 13, color: "#7A2040", lineHeight: 1.7 }}>
          Menos peso.<br />
          Menos ressentimento.<br />
          Mais parceria, mais presença, mais conexão.
        </div>
      </div>
    </div>
  );
}

function Reuniao({ meeting, updateMeeting }) {
  return (
    <div>
      <div style={{ marginBottom: 18 }}>
        <div style={{ fontSize: 13, color: C.muted, marginBottom: 2 }}>Domingo · 20 minutos</div>
        <div style={{ fontFamily: "Lora, Georgia, serif", fontSize: 18, fontWeight: 600, color: C.text }}>Reunião semanal</div>
      </div>

      {MEETING_Q.map((q, i) => (
        <div key={i} style={{ background: C.card, borderRadius: 18, padding: "16px", border: `1px solid ${C.border}`, marginBottom: 12 }}>
          <div style={{ fontSize: 11, color: C.muted, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>
            {i + 1} / {MEETING_Q.length}
          </div>
          <div style={{ fontFamily: "Lora, Georgia, serif", fontSize: 14.5, fontWeight: 600, color: C.text, marginBottom: 12, lineHeight: 1.5 }}>
            {q}
          </div>
          <textarea
            value={meeting[i] || ""}
            onChange={e => updateMeeting(i, e.target.value)}
            placeholder="Escreva aqui..."
            rows={3}
            style={{
              width: "100%", fontSize: 13.5, color: C.sub,
              background: C.bg, border: `1px solid ${C.border}`,
              borderRadius: 12, padding: "10px 12px",
              resize: "none", outline: "none", fontFamily: "inherit",
              lineHeight: 1.6, boxSizing: "border-box",
            }}
          />
        </div>
      ))}

      <div style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 16, padding: "14px 16px", marginTop: 4 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: C.sub, marginBottom: 8 }}>Regras da conversa</div>
        <div style={{ fontSize: 12, color: "#B05040", marginBottom: 5 }}>❌ Acusações · ironia · interrupções</div>
        <div style={{ fontSize: 12, color: C.teal }}>✅ "Eu me sinto…" · "Eu preciso…" · "Eu gostaria…"</div>
      </div>
    </div>
  );
}

function Meta({ goals, adjustGoal }) {
  return (
    <div>
      <div style={{ marginBottom: 18 }}>
        <div style={{ fontSize: 13, color: C.muted, marginBottom: 2 }}>Registre cada conquista</div>
        <div style={{ fontFamily: "Lora, Georgia, serif", fontSize: 18, fontWeight: 600, color: C.text }}>Meta dos 60 dias</div>
      </div>

      {GOALS.map(goal => {
        const count = goals[goal.id] || 0;
        const pct = Math.min(100, Math.round((count / goal.target) * 100));
        const done = count >= goal.target;
        return (
          <div key={goal.id} style={{ background: C.card, borderRadius: 18, padding: "16px", border: `1px solid ${done ? "#A8D8C0" : C.border}`, marginBottom: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                <span style={{ fontSize: 20 }}>{goal.icon}</span>
                <span style={{ fontSize: 13.5, fontWeight: 600, color: C.text }}>{goal.label}</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <button
                  onClick={() => adjustGoal(goal.id, -1)}
                  style={{ width: 28, height: 28, borderRadius: "50%", background: "#F0EBE5", border: "none", fontSize: 18, color: C.sub, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", lineHeight: 1 }}
                >−</button>
                <span style={{ fontSize: 13, fontWeight: 700, color: C.text, minWidth: 40, textAlign: "center" }}>{count} / {goal.target}</span>
                <button
                  onClick={() => adjustGoal(goal.id, 1)}
                  style={{ width: 28, height: 28, borderRadius: "50%", background: C.terraLight, border: "none", fontSize: 18, color: "white", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", lineHeight: 1 }}
                >+</button>
              </div>
            </div>
            <div style={{ background: C.cream, borderRadius: 99, height: 6, overflow: "hidden" }}>
              <div style={{
                height: "100%", borderRadius: 99,
                background: done ? `linear-gradient(90deg, #2A8A60, #3DAA78)` : `linear-gradient(90deg, ${C.terra}, ${C.terraLight})`,
                width: `${pct}%`, transition: "width 0.4s ease",
              }} />
            </div>
            {done && <div style={{ fontSize: 12, color: "#2A8A60", marginTop: 6, fontWeight: 600 }}>✓ Meta atingida!</div>}
          </div>
        );
      })}

      <div style={{ background: "#FEF4EC", border: "1px solid #E8C9A0", borderRadius: 16, padding: "14px 16px", marginTop: 8 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: C.terra, marginBottom: 4 }}>🎯 Lembrete</div>
        <div style={{ fontSize: 13, color: "#7A3A10", lineHeight: 1.6 }}>O objetivo não é perfeição. É constância.</div>
      </div>
    </div>
  );
}

export default function App() {
  const [tab, setTab] = useState("painel");
  const [checks, setChecks] = useState({});
  const [goals, setGoals] = useState({});
  const [meeting, setMeeting] = useState({});
  const [ready, setReady] = useState(false);
  const [hasSupabaseConfig, setHasSupabaseConfig] = useState(true);

  useEffect(() => {
    // Adiciona as fontes
    const link = document.createElement("link");
    link.href = "https://fonts.googleapis.com/css2?family=Lora:wght@400;600&family=DM+Sans:ital,wght@0,400;0,500;0,600&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);
    
    if (!supabase) {
      setHasSupabaseConfig(false);
      setReady(true);
      return;
    }
    
    loadData();

    // Inscreve para receber atualizações em tempo real do Supabase
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'app_state',
          filter: 'id=eq.1',
        },
        (payload) => {
          const newData = payload.new;
          if (newData.checks) setChecks(newData.checks);
          if (newData.meeting) setMeeting(newData.meeting);
          if (newData.goals) setGoals(newData.goals);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  async function loadData() {
    const currentWeek = getISOWeek();
    try {
      const { data, error } = await supabase.from('app_state').select('*').eq('id', 1).single();
      
      if (data) {
        if (data.current_week !== currentWeek) {
          // Virou a semana, reseta checks e reuniao
          const resetData = { current_week: currentWeek, checks: {}, meeting: {} };
          await supabase.from('app_state').update(resetData).eq('id', 1);
          setChecks({});
          setMeeting({});
          setGoals(data.goals || {});
        } else {
          setChecks(data.checks || {});
          setMeeting(data.meeting || {});
          setGoals(data.goals || {});
        }
      } else {
        // Se a linha não existe, cria
        const initialData = { id: 1, current_week: currentWeek, checks: {}, meeting: {}, goals: {} };
        await supabase.from('app_state').insert([initialData]);
      }
    } catch (err) {
      console.error("Erro ao carregar dados:", err);
    }
    setReady(true);
  }

  async function toggleCheck(id) {
    if (!supabase) return;
    const next = { ...checks, [id]: !checks[id] };
    setChecks(next); // Atualiza otimista (na tela na hora)
    await supabase.from('app_state').update({ checks: next }).eq('id', 1);
  }

  async function adjustGoal(id, delta) {
    if (!supabase) return;
    const next = { ...goals, [id]: Math.max(0, (goals[id] || 0) + delta) };
    setGoals(next);
    await supabase.from('app_state').update({ goals: next }).eq('id', 1);
  }

  async function updateMeeting(i, val) {
    if (!supabase) return;
    const next = { ...meeting, [i]: val };
    setMeeting(next);
    await supabase.from('app_state').update({ meeting: next }).eq('id', 1);
  }

  const TABS = [
    { id: "painel", label: "Painel", icon: "◼" },
    { id: "filhos", label: "Filhos", icon: "◎" },
    { id: "casal", label: "Casal", icon: "♡" },
    { id: "reuniao", label: "Reunião", icon: "◷" },
    { id: "meta", label: "60 dias", icon: "◈" },
  ];

  if (!ready) return (
    <div style={{ fontFamily: "DM Sans, sans-serif", minHeight: "100vh", background: C.bg, display: "flex", alignItems: "center", justifyContent: "center", color: C.muted, fontSize: 14 }}>
      carregando…
    </div>
  );

  if (!hasSupabaseConfig) return (
    <div style={{ fontFamily: "DM Sans, sans-serif", padding: 40, background: C.bg, minHeight: "100vh" }}>
      <h2 style={{ color: C.terra }}>Configuração Pendente</h2>
      <p style={{ color: C.text, lineHeight: 1.6 }}>
        O Supabase não está configurado. Para funcionar, crie o arquivo <b>.env</b> na raiz do projeto com as chaves:
      </p>
      <pre style={{ background: C.card, padding: 16, borderRadius: 8, border: `1px solid ${C.border}`, marginTop: 10 }}>
        VITE_SUPABASE_URL=sua_url_aqui<br/>
        VITE_SUPABASE_ANON_KEY=sua_chave_anon_aqui
      </pre>
    </div>
  );

  return (
    <div style={{ fontFamily: "DM Sans, sans-serif", background: C.bg, minHeight: "100vh", paddingBottom: 80 }}>
      {/* Header */}
      <div style={{ background: `linear-gradient(135deg, #7C2E14 0%, #B84A28 100%)`, padding: "36px 20px 22px" }}>
        <div style={{ fontSize: 11, color: "#EDCDB5", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 6 }}>
          Sistema Familiar
        </div>
        <div style={{ fontFamily: "Lora, Georgia, serif", fontSize: 24, fontWeight: 600, color: "#FFFFFF", lineHeight: 1.2 }}>
          Jean & Daniele
        </div>
        <div style={{ fontSize: 13, color: "#EDCDB5", marginTop: 4 }}>Lucas · Lívia</div>
      </div>

      {/* Content */}
      <div style={{ padding: "20px 16px" }}>
        {tab === "painel" && <Painel checks={checks} toggleCheck={toggleCheck} />}
        {tab === "filhos" && <Filhos checks={checks} toggleCheck={toggleCheck} />}
        {tab === "casal" && <Casal checks={checks} toggleCheck={toggleCheck} />}
        {tab === "reuniao" && <Reuniao meeting={meeting} updateMeeting={updateMeeting} />}
        {tab === "meta" && <Meta goals={goals} adjustGoal={adjustGoal} />}
      </div>

      {/* Bottom Nav */}
      <div style={{
        position: "fixed", bottom: 0, left: 0, right: 0,
        background: "#FFFFFF", borderTop: "1px solid #EDE3D8",
        display: "flex", paddingBottom: "env(safe-area-inset-bottom, 0px)",
      }}>
        {TABS.map(t => {
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              style={{
                flex: 1, paddingTop: 10, paddingBottom: 10,
                display: "flex", flexDirection: "column", alignItems: "center", gap: 3,
                background: "none", border: "none", cursor: "pointer",
                color: active ? C.terra : C.muted,
                transition: "color 0.15s",
              }}
            >
              <span style={{ fontSize: 16, lineHeight: 1 }}>{t.icon}</span>
              <span style={{ fontSize: 10.5, fontWeight: active ? 600 : 400, letterSpacing: "0.02em" }}>{t.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
