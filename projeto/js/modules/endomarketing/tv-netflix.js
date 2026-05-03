// =============================================
// HI.TV — STREAMING CORPORATIVO  ·  NÍVEL HARD
// Hero animado · Painel hover · Badges · Glow
// =============================================

var nflxData = {
  comunicados: [
    { emoji:'📢', titulo:'Novo Sistema de Ponto',     sub:'Ativo a partir de segunda-feira',  grad:'linear-gradient(135deg,#1e3a5f,#2563eb)',  strip:'#2563eb', badge:'NOVO'    },
    { emoji:'📅', titulo:'Reunião Geral — Sexta',     sub:'15h00 · Auditório Principal',       grad:'linear-gradient(135deg,#1e1b4b,#4338ca)',  strip:'#4338ca', badge:'HOJE'    },
    { emoji:'🎁', titulo:'Atualização de Benefícios', sub:'Confira as novidades do mês',        grad:'linear-gradient(135deg,#0c4a6e,#0369a1)',  strip:'#0369a1', badge:null      },
    { emoji:'⚠️', titulo:'Manutenção do Sistema',     sub:'Sábado 08h fora do ar',             grad:'linear-gradient(135deg,#7f1d1d,#b91c1c)',  strip:'#b91c1c', badge:'URGENTE' },
    { emoji:'🎓', titulo:'Treinamento Obrigatório',   sub:'NR-01 · Prazo: 30/06',              grad:'linear-gradient(135deg,#064e3b,#065f46)',  strip:'#059669', badge:'NOVO'    },
    { emoji:'💡', titulo:'Nova Política de HO',       sub:'2 dias/semana · a partir de junho', grad:'linear-gradient(135deg,#312e81,#6d28d9)',  strip:'#7c3aed', badge:null      },
    { emoji:'🤝', titulo:'Acordo Coletivo 2025',      sub:'Reajuste salarial aprovado!',       grad:'linear-gradient(135deg,#14532d,#15803d)',  strip:'#16a34a', badge:'NOVO'    },
    { emoji:'🏢', titulo:'Obras no 3º Andar',         sub:'Acesso restrito até 10/06',         grad:'linear-gradient(135deg,#431407,#c2410c)',  strip:'#ea580c', badge:'HOJE'    },
  ],
  motivacional: [
    { emoji:'✝️', titulo:'Para Deus nada é impossível', sub:'Lucas 1:37',              grad:'linear-gradient(135deg,#2e1065,#5b21b6,#7c3aed)', strip:'#7c3aed', badge:null, link:'https://ministeriospaodiario.org/'                                         },
    { emoji:'🌟', titulo:'Você foi criado para vencer', sub:'Reflita hoje',            grad:'linear-gradient(135deg,#1c1917,#44403c,#78350f)', strip:'#d97706', badge:null, link:'https://www.devocionaldiario.com.br/'                                      },
    { emoji:'🙏', titulo:'O Senhor é meu pastor',       sub:'Salmos 23:1',             grad:'linear-gradient(135deg,#0f172a,#1e3a5f,#1e40af)', strip:'#3b82f6', badge:null, link:'https://ministeriospaodiario.org/frases-para-reflexao/'                   },
    { emoji:'💪', titulo:'Fé move montanhas',            sub:'Mateus 17:20',            grad:'linear-gradient(135deg,#042f2e,#065f46,#059669)', strip:'#34d399', badge:null, link:'https://ministeriospaodiario.org/publicacoes/palavras-para-hoje/'         },
    { emoji:'☀️', titulo:'Alegre-se sempre',             sub:'1 Tessalonicenses 5:16', grad:'linear-gradient(135deg,#78350f,#b45309,#d97706)', strip:'#fbbf24', badge:null, link:'https://www.bibliaonline.com.br/devocional-diario'                         },
    { emoji:'🌱', titulo:'Persevera e colherás',         sub:'Gálatas 6:9',             grad:'linear-gradient(135deg,#1e1b4b,#3730a3,#4f46e5)', strip:'#818cf8', badge:null, link:'https://ministeriospaodiario.org/'                                         },
  ],
  indicadores: [
    { emoji:'📊', titulo:'Meta Comercial',    sub:'Maio/2025',       pct:78, cor:'#4ade80', grad:'linear-gradient(135deg,#022c22,#064e3b)', strip:'#4ade80' },
    { emoji:'😊', titulo:'NPS Satisfação',    sub:'92 pontos',       pct:92, cor:'#34d399', grad:'linear-gradient(135deg,#042f2e,#065f46)', strip:'#34d399' },
    { emoji:'✅', titulo:'Presença',           sub:'95% do time',     pct:95, cor:'#6ee7b7', grad:'linear-gradient(135deg,#052e16,#14532d)', strip:'#6ee7b7' },
    { emoji:'🎓', titulo:'Treinamentos',       sub:'67% concluído',   pct:67, cor:'#86efac', grad:'linear-gradient(135deg,#0a3622,#166534)', strip:'#86efac' },
    { emoji:'👥', titulo:'Novas Admissões',    sub:'+3 este mês',     pct:60, cor:'#bbf7d0', grad:'linear-gradient(135deg,#022c22,#047857)', strip:'#bbf7d0' },
  ],
  dicas: [
    { emoji:'⏱️', titulo:'Regra dos 2 Minutos',   sub:'Menos de 2 min? Faça agora!',       grad:'linear-gradient(135deg,#0f172a,#1e3a5f,#1e40af)', strip:'#3b82f6', badge:null,   link:'https://asana.com/pt/resources/how-to-be-more-productive'                                                },
    { emoji:'🎯', titulo:'Uma Coisa de Cada Vez',  sub:'Multitarefa reduz produtividade 40%',grad:'linear-gradient(135deg,#1e1b4b,#3730a3)',         strip:'#818cf8', badge:null,   link:'https://www.flowup.me/blog/tecnicas-de-produtividade/'                                                    },
    { emoji:'📝', titulo:'Suas 3 Prioridades',     sub:'Defina toda manhã ao acordar',       grad:'linear-gradient(135deg,#0c4a6e,#075985)',          strip:'#38bdf8', badge:null,   link:'https://napratica.org.br/noticias/ferramentas-de-produtividade-trabalho'                                 },
    { emoji:'🧠', titulo:'Pausas Inteligentes',    sub:'5 min/hora = +20% de foco',          grad:'linear-gradient(135deg,#1e3a5f,#1d4ed8)',          strip:'#60a5fa', badge:'NOVO', link:'https://www.zendesk.com.br/blog/ferramentas-de-produtividade/'                                           },
    { emoji:'🌅', titulo:'Ritual da Manhã',         sub:'Os primeiros 30 min definem o dia', grad:'linear-gradient(135deg,#312e81,#4338ca)',          strip:'#a78bfa', badge:null,   link:'https://www.totvs.com/blog/gestao-para-assinatura-de-documentos/ferramentas-de-produtividade/'          },
    { emoji:'📵', titulo:'Sem Celular!',             sub:'25 min de foco puro = resultados', grad:'linear-gradient(135deg,#1e1b4b,#1d4ed8)',          strip:'#6366f1', badge:null,   link:'https://www.nutcache.com/pt-br/blog/7-otimas-ferramentas-que-fazem-a-diferenca-na-produtividade-no-trabalho-3-dicas-bonus/' },
  ],
  culinaria: [
    { emoji:'🥗', titulo:'Salada Grega',        sub:'5 min · Refrescante',      grad:'linear-gradient(135deg,#432010,#c2410c,#ea580c)', strip:'#f97316', badge:'HOJE', link:'https://www.tudogostoso.com.br/noticias/jantar-rapido-receitas-praticas-prontas-em-ate-30-minutos-a11494.htm' },
    { emoji:'🍳', titulo:'Ovos Mexidos',         sub:'3 min · Cremoso',          grad:'linear-gradient(135deg,#451a03,#b45309)',         strip:'#fbbf24', badge:null,   link:'https://blog.tudogostoso.com.br/cardapios/receitas-faceis/receitas-saudaveis-faceis/'                    },
    { emoji:'🥤', titulo:'Vitamina Energética',  sub:'2 min · Energia total',    grad:'linear-gradient(135deg,#3b0764,#7e22ce)',         strip:'#c084fc', badge:'NOVO', link:'https://panelinha.com.br/'                                                                                },
    { emoji:'🥑', titulo:'Torrada de Abacate',   sub:'4 min · Saudável',         grad:'linear-gradient(135deg,#14532d,#166534)',         strip:'#4ade80', badge:null,   link:'https://www.tudogostoso.com.br/noticias/receitas-fitness-a5188.htm'                                      },
    { emoji:'🍲', titulo:'Sopa Rápida',           sub:'10 min · Reconfortante',   grad:'linear-gradient(135deg,#7f1d1d,#991b1b)',         strip:'#f87171', badge:null,   link:'https://www.tudogostoso.com.br/noticias/almoco-simples-21-ideias-de-pratos-deliciosos-e-faceis-de-cozinhar-a6534.htm' },
    { emoji:'🫙', titulo:'Iogurte com Granola',  sub:'1 min · Leve e nutritivo', grad:'linear-gradient(135deg,#1c1917,#57534e)',         strip:'#d4d4d8', badge:null,   link:'https://www.tudogostoso.com.br/categorias/1334-alimentacao-saudavel'                                   },
  ],
  bemEstar: [
    { emoji:'🧘', titulo:'Respire Agora',     sub:'4-4-4: inspire, segure, expire', grad:'linear-gradient(135deg,#0c4a6e,#0369a1,#0284c7)', strip:'#38bdf8', badge:'HOJE', link:'https://saude.mpu.mp.br/noticias/campanha-de-ergonomia-por-que-as-pausas-sao-tao-importantes'                },
    { emoji:'💧', titulo:'Hidrate-se!',        sub:'Beba um copo de água agora',     grad:'linear-gradient(135deg,#042f2e,#0891b2)',         strip:'#22d3ee', badge:null,   link:'https://viverbem.unimedbh.com.br/saude-no-trabalho/risco-ergonomico/'                              },
    { emoji:'🚶', titulo:'Mexa-se!',           sub:'2 min caminhando = +foco',       grad:'linear-gradient(135deg,#0e7490,#0284c7)',         strip:'#67e8f9', badge:null,   link:'https://www.sesisp.org.br/para-industria/noticia/dicas-de-ergonomia-para-um-ambiente-saudavel-e-produtivo' },
    { emoji:'👁️', titulo:'Regra 20-20-20',    sub:'Olhe 20 seg para longe agora',   grad:'linear-gradient(135deg,#155e75,#0e7490)',         strip:'#a5f3fc', badge:null,   link:'https://sciath.com.br/ergonomia/'                                                                        },
    { emoji:'🪑', titulo:'Postura Certa',      sub:'Costas retas · pés no chão',    grad:'linear-gradient(135deg,#082f49,#0369a1)',         strip:'#7dd3fc', badge:null,   link:'https://www.intersupri.com.br/blog/ergonomia-no-trabalho-10-dicas-essenciais-para-quem-passa-horas-sentado/' },
    { emoji:'🌿', titulo:'Conexão Verde',      sub:'Plante algo. A natureza cura.', grad:'linear-gradient(135deg,#052e16,#166534)',         strip:'#86efac', badge:'NOVO', link:'https://patricialacombe.com.br/blog/ergonomia-boas-praticas-para-manter-uma-boa-postura-no-trabalho/'   },
  ],
  humor: [
    { emoji:'😄', titulo:'Segunda prometia...',   sub:'Ainda tem quinta-feira 😅',      grad:'linear-gradient(135deg,#451a03,#92400e,#b45309)', strip:'#fbbf24', badge:null, link:'https://www.pensador.com/frases_engracadas_sobre_trabalho/'           },
    { emoji:'☕', titulo:'Reunião em e-mail',      sub:'Mas o café estava ótimo ☕',     grad:'linear-gradient(135deg,#1c1917,#44403c)',         strip:'#a8a29e', badge:null, link:'https://tuacarreira.com/frases-engracadas-sobre-trabalho/'            },
    { emoji:'🦸', titulo:'Wi-fi caiu!',            sub:'TI virou herói instantâneo 🙌', grad:'linear-gradient(135deg,#1e1b4b,#312e81)',         strip:'#818cf8', badge:null, link:'https://mdbf.com.br/blog/frases-de-trabalho-engracadas'               },
    { emoji:'🎯', titulo:'Vamos bater a meta!',    sub:'E depois o café, claro ☕',      grad:'linear-gradient(135deg,#3b0764,#6b21a8)',         strip:'#d946ef', badge:null, link:'https://www.lideregestao.com.br/frases-engracadas/'                   },
    { emoji:'📧', titulo:'Só mais um e-mail...',   sub:'Era o 47º. Claro. 🙃',          grad:'linear-gradient(135deg,#14532d,#15803d)',         strip:'#4ade80', badge:null, link:'https://www.mensagenscomamor.com/frases-engracadas-trabalho'           },
    { emoji:'😎', titulo:'Trabalho em equipe!',    sub:'Cada um fez a parte... sua 😂', grad:'linear-gradient(135deg,#7f1d1d,#b91c1c)',         strip:'#f87171', badge:null, link:'https://clickup.com/blog/hr-jokes/'                                   },
  ],
  agenda: [
    { dia:'SEX', data:'24/05', tipo:'SHOW',    titulo:'Nando Reis',          local:'Teatro Pedra do Reino', hora:'21h', cor:'#7c3aed', badge:'HOJE', link:'https://www.sympla.com.br/eventos/joao-pessoa-pb'                                                                                     },
    { dia:'SAB', data:'25/05', tipo:'FESTIVAL',titulo:'Festival Junino',     local:'Centro Histórico',      hora:'16h', cor:'#16a34a', badge:null,   link:'https://jornaldaparaiba.com.br/guia-qualaboa/agenda'                                                                                  },
    { dia:'DOM', data:'26/05', tipo:'MÚSICA',  titulo:'Domingo no Parque',   local:'Parque Solon',          hora:'17h', cor:'#2563eb', badge:null,   link:'https://www.jpagenda.com/'                                                                                                             },
    { dia:'QUI', data:'30/05', tipo:'TEATRO',  titulo:'Auto da Compadecida', local:'Teatro Santa Roza',     hora:'20h', cor:'#dc2626', badge:null,   link:'https://funesc.pb.gov.br/'                                                                                                             },
    { dia:'SAB', data:'07/06', tipo:'SHOW',    titulo:'Forró no Pátio',      local:'Praça Central',         hora:'19h', cor:'#7c3aed', badge:'NOVO', link:'https://www.eventoon.com.br/cidade/joao-pessoa-pb'                                                                                    },
    { dia:'DOM', data:'08/06', tipo:'CULTURA', titulo:'Exposição de Arte',   local:'Museu Municipal',       hora:'10h', cor:'#16a34a', badge:null,   link:'https://fonte83.com.br/noticias/cotidiano/a-paraiba-em-cartaz-portal-fonte83-reune-o-melhor-da-agenda-cultural-do-fim-de-semana/'     },
  ],
  aniversariantes: [
    { avatar:'AS', nome:'Ana Paula Souza',  setor:'RH',         dia:'25/05', cor:'#f43f5e' },
    { avatar:'CE', nome:'Carlos Eduardo',   setor:'Comercial',  dia:'26/05', cor:'#f97316' },
    { avatar:'ML', nome:'Mariana Lima',     setor:'Financeiro', dia:'27/05', cor:'#a855f7' },
    { avatar:'RA', nome:'Roberto Alves',    setor:'TI',         dia:'30/05', cor:'#3b82f6' },
    { avatar:'PS', nome:'Paulo Santos',     setor:'Operações',  dia:'02/06', cor:'#10b981' },
    { avatar:'FC', nome:'Fernanda Castro',  setor:'Comercial',  dia:'08/06', cor:'#f59e0b' },
  ],
};

// ─────────────────────────────────────────────
// CSS NÍVEL HARD
// ─────────────────────────────────────────────
function _injetarCssNetflix() {
  if (document.getElementById('css-nflx')) return;
  var st = document.createElement('style');
  st.id = 'css-nflx';
  var css = [
    /* KEYFRAMES */
    '@keyframes nflx-pulse{0%,100%{opacity:.5}50%{opacity:1}}',
    '@keyframes nflx-badge-live{0%,100%{opacity:1}50%{opacity:.4}}',
    '@keyframes nflx-shimmer{0%{transform:translateX(-100%)}100%{transform:translateX(100%)}}',
    '@keyframes nflx-fade-up{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}',
    /* ROOT */
    '.nflx-root{background:#0f0f0f;overflow-y:auto;max-height:calc(100vh - 220px);scroll-behavior:smooth}',
    '.nflx-root::-webkit-scrollbar{width:5px}',
    '.nflx-root::-webkit-scrollbar-track{background:#0f0f0f}',
    '.nflx-root::-webkit-scrollbar-thumb{background:#333;border-radius:3px}',
    /* HERO */
    '.nflx-hero{position:relative;height:430px;overflow:hidden;background:#0a0a0a}',
    '.nflx-hero-blob{position:absolute;border-radius:50%;filter:blur(90px);pointer-events:none}',
    '.nflx-hero-blob1{width:650px;height:650px;background:rgba(229,9,20,.14);top:-220px;right:60px;animation:nflx-pulse 5s ease infinite}',
    '.nflx-hero-blob2{width:450px;height:450px;background:rgba(37,99,235,.10);bottom:-180px;right:320px;animation:nflx-pulse 7s ease infinite reverse}',
    '.nflx-hero-blob3{width:300px;height:300px;background:rgba(124,58,237,.08);top:60px;right:380px;animation:nflx-pulse 9s ease infinite}',
    '.nflx-hero-bg{position:absolute;inset:0;background:linear-gradient(135deg,#0a0a0a 0%,#111827 100%);opacity:.95}',
    '.nflx-hero-vign{position:absolute;inset:0;background:radial-gradient(ellipse at 30% 50%,transparent 20%,rgba(10,10,10,.7) 100%)}',
    '.nflx-hero-grad{position:absolute;inset:0;background:linear-gradient(90deg,#0f0f0f 30%,rgba(15,15,15,.55) 65%,transparent 100%)}',
    '.nflx-hero-grad2{position:absolute;bottom:0;left:0;right:0;height:130px;background:linear-gradient(to top,#0f0f0f,transparent)}',
    '.nflx-hero-body{position:relative;z-index:2;padding:0 56px;height:100%;display:flex;flex-direction:column;justify-content:center;max-width:640px;animation:nflx-fade-up .5s ease both}',
    '.nflx-hero-eyebrow{display:flex;align-items:center;gap:10px;margin-bottom:14px}',
    '.nflx-hero-series{font-size:10px;font-weight:800;letter-spacing:3px;text-transform:uppercase;color:#e50914;display:flex;align-items:center;gap:6px}',
    '.nflx-hero-dot{width:4px;height:4px;border-radius:50%;background:rgba(255,255,255,.35)}',
    '.nflx-hero-year{font-size:11px;color:rgba(255,255,255,.4);font-weight:600}',
    '.nflx-hero-title{font-family:Syne,sans-serif;font-size:52px;font-weight:900;color:white;line-height:1.0;margin-bottom:12px;text-shadow:0 4px 30px rgba(0,0,0,.6);letter-spacing:-.5px}',
    '.nflx-hero-sub{font-size:15px;color:rgba(255,255,255,.68);line-height:1.6;max-width:500px;margin-bottom:18px}',
    '.nflx-hero-tags{display:flex;gap:7px;flex-wrap:wrap;margin-bottom:22px}',
    '.nflx-hero-tag{padding:3px 10px;border-radius:3px;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.12);color:rgba(255,255,255,.7);font-size:11px;font-weight:600;letter-spacing:.5px}',
    '.nflx-hero-btns{display:flex;gap:12px;align-items:center}',
    '.nflx-btn-play{background:white;color:#111;border:none;border-radius:6px;padding:11px 30px;font-size:15px;font-weight:900;cursor:pointer;display:flex;align-items:center;gap:10px;font-family:inherit;transition:all .2s;box-shadow:0 4px 24px rgba(255,255,255,.18),0 2px 8px rgba(0,0,0,.4)}',
    '.nflx-btn-play:hover{background:#f0f0f0;box-shadow:0 8px 32px rgba(255,255,255,.28);transform:translateY(-1px)}',
    '.nflx-btn-more{background:rgba(255,255,255,.12);color:white;border:1px solid rgba(255,255,255,.2);border-radius:6px;padding:11px 24px;font-size:15px;font-weight:700;cursor:pointer;font-family:inherit;transition:all .2s;backdrop-filter:blur(8px)}',
    '.nflx-btn-more:hover{background:rgba(255,255,255,.22);border-color:rgba(255,255,255,.35);transform:translateY(-1px)}',
    '.nflx-hero-art{position:absolute;right:4%;top:50%;transform:translateY(-50%);font-size:200px;opacity:.06;pointer-events:none;filter:blur(2px);z-index:1}',
    /* DIVIDER */
    '.nflx-div{height:1px;background:rgba(255,255,255,.05);margin:0 44px}',
    /* ROW */
    '.nflx-row{padding:18px 44px 2px}',
    '.nflx-row:last-child{padding-bottom:52px}',
    '.nflx-row-head{display:flex;align-items:center;gap:10px;margin-bottom:12px}',
    '.nflx-row-strip{width:3px;height:18px;border-radius:2px;flex-shrink:0}',
    '.nflx-row-title{font-size:17px;font-weight:800;color:#e5e5e5;letter-spacing:.2px;cursor:default}',
    '.nflx-row-explore{font-size:12px;color:#54b3d6;font-weight:700;opacity:0;transition:opacity .2s;margin-left:6px;display:flex;align-items:center;gap:3px}',
    '.nflx-row-head:hover .nflx-row-explore{opacity:1}',
    '.nflx-row-wrap{position:relative}',
    '.nflx-cards{display:flex;gap:6px;overflow-x:auto;scroll-behavior:smooth;scrollbar-width:none;padding:8px 0 44px}',
    '.nflx-cards::-webkit-scrollbar{display:none}',
    /* NAV */
    '.nflx-nav{position:absolute;top:46%;transform:translateY(-50%);width:38px;height:88px;border:none;cursor:pointer;z-index:20;display:flex;align-items:center;justify-content:center;font-size:22px;color:white;border-radius:4px;transition:all .25s;background:rgba(15,15,15,.72);backdrop-filter:blur(4px);border:1px solid rgba(255,255,255,.08)}',
    '.nflx-nav:hover{background:rgba(15,15,15,.95);width:44px;box-shadow:4px 0 20px rgba(0,0,0,.5)}',
    '.nflx-nav.lft{left:-2px}',
    '.nflx-nav.rgt{right:-2px}',
    /* CARD BASE */
    '.nflx-card{position:relative;flex-shrink:0;width:234px;height:154px;border-radius:7px;cursor:pointer;transition:transform .32s cubic-bezier(.25,.46,.45,.94),box-shadow .32s,z-index 0s .32s;z-index:1}',
    '.nflx-card:hover{transform:scale(1.13);box-shadow:0 22px 60px rgba(0,0,0,.97),0 0 0 2px rgba(255,255,255,.12);z-index:10;transition:transform .32s cubic-bezier(.25,.46,.45,.94),box-shadow .32s,z-index 0s}',
    '.nflx-card-bg{width:100%;height:100%;border-radius:7px;overflow:hidden;display:flex;align-items:center;justify-content:center;font-size:60px;position:relative;border:1px solid rgba(255,255,255,.07)}',
    /* Top color strip */
    '.nflx-card-strip{position:absolute;top:0;left:0;right:0;height:2px;border-radius:7px 7px 0 0;z-index:2}',
    /* Badge */
    '.nflx-card-badge{position:absolute;top:9px;left:9px;padding:2px 8px;border-radius:3px;font-size:9px;font-weight:800;letter-spacing:1.2px;text-transform:uppercase;color:white;z-index:3}',
    '.nflx-card-badge.novo{background:#e50914}',
    '.nflx-card-badge.hoje{background:#d97706}',
    '.nflx-card-badge.urgente{background:#dc2626}',
    '.nflx-card-badge.live{background:#16a34a;animation:nflx-badge-live 1.4s ease infinite}',
    /* Overlay + panel */
    '.nflx-card-ov{position:absolute;inset:0;background:linear-gradient(to top,rgba(0,0,0,.92) 0%,rgba(0,0,0,.2) 55%,rgba(0,0,0,.04) 100%);border-radius:7px}',
    '.nflx-card-panel{position:absolute;inset:0;background:linear-gradient(to top,rgba(0,0,0,.98) 40%,rgba(0,0,0,.25) 80%,transparent 100%);border-radius:7px;padding:10px 10px 9px;display:flex;flex-direction:column;justify-content:flex-end;opacity:0;transform:translateY(4px);transition:opacity .28s,transform .28s;z-index:4}',
    '.nflx-card:hover .nflx-card-panel{opacity:1;transform:translateY(0)}',
    '.nflx-card-panel-title{font-size:13px;font-weight:800;color:white;line-height:1.25;margin-bottom:3px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}',
    '.nflx-card-panel-sub{font-size:10px;color:rgba(255,255,255,.55);line-height:1.3;margin-bottom:8px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}',
    '.nflx-card-acts{display:flex;gap:5px}',
    '.nflx-card-act{width:27px;height:27px;border-radius:50%;border:1.5px solid rgba(255,255,255,.45);background:rgba(255,255,255,.1);color:white;font-size:11px;display:flex;align-items:center;justify-content:center;cursor:pointer;transition:all .2s;backdrop-filter:blur(4px)}',
    '.nflx-card-act:hover{background:rgba(255,255,255,.28);border-color:white}',
    '.nflx-card-act.play{background:white;color:#111;border-color:white}',
    '.nflx-card-act.play:hover{background:#e8e8e8}',
    /* ANIV CARD */
    '.nflx-aniv-card{flex-shrink:0;width:142px;height:170px;border-radius:10px;cursor:pointer;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:14px 10px;gap:4px;text-align:center;transition:transform .32s cubic-bezier(.25,.46,.45,.94),box-shadow .32s;position:relative;overflow:hidden}',
    '.nflx-aniv-card:hover{transform:scale(1.10);box-shadow:0 16px 44px rgba(0,0,0,.9)}',
    '.nflx-aniv-deco{position:absolute;font-size:80px;opacity:.07;top:-14px;right:-12px;pointer-events:none;line-height:1}',
    '.nflx-aniv-deco2{position:absolute;font-size:60px;opacity:.05;bottom:-10px;left:-10px;pointer-events:none;line-height:1}',
    '.nflx-aniv-av{width:56px;height:56px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:19px;font-weight:900;color:white;border:2.5px solid rgba(255,255,255,.35);margin-bottom:4px;position:relative;z-index:1}',
    /* IND CARD */
    '.nflx-ind-card{flex-shrink:0;width:204px;height:154px;border-radius:7px;cursor:pointer;overflow:hidden;position:relative;transition:transform .32s cubic-bezier(.25,.46,.45,.94),box-shadow .32s;border:1px solid rgba(255,255,255,.07)}',
    '.nflx-ind-card:hover{transform:scale(1.10);box-shadow:0 18px 50px rgba(0,0,0,.95)}',
    '.nflx-ind-ring{position:absolute;bottom:10px;right:12px}',
    '.nflx-ind-info{position:absolute;top:14px;left:14px;right:80px}',
    '.nflx-ind-label{font-size:10px;font-weight:800;color:rgba(255,255,255,.5);text-transform:uppercase;letter-spacing:1px;margin-bottom:4px}',
    '.nflx-ind-val{font-size:30px;font-weight:900;color:white;line-height:1}',
    '.nflx-ind-sub{font-size:11px;color:rgba(255,255,255,.45);margin-top:3px}',
    '.nflx-ind-bar{position:absolute;bottom:0;left:0;right:0;height:3px;background:rgba(255,255,255,.1)}',
    '.nflx-ind-bar-fill{height:100%;border-radius:0 2px 2px 0;transition:width .8s ease}',
    /* AGE CARD */
    '.nflx-age-card{flex-shrink:0;width:232px;height:154px;border-radius:7px;overflow:hidden;cursor:pointer;position:relative;transition:transform .32s cubic-bezier(.25,.46,.45,.94),box-shadow .32s;border:1px solid rgba(255,255,255,.07)}',
    '.nflx-age-card:hover{transform:scale(1.10);box-shadow:0 18px 50px rgba(0,0,0,.95)}',
  ].join('\n');
  st.textContent = css;
  document.head.appendChild(st);
}

// ─────────────────────────────────────────────
// RENDER PRINCIPAL
// ─────────────────────────────────────────────
function tvCanal_Netflix() {
  _injetarCssNetflix();

  var endo = (typeof endoData !== 'undefined') ? endoData : {};
  var com0  = (endo.comunicados && endo.comunicados[0]) ||
    { titulo:'Reunião Geral — Sexta-feira', texto:'15h00 · Auditório Principal · Presença obrigatória para toda a equipe.', urgente:true };
  var badge = com0.urgente ? '🔴 URGENTE' : '📢 COMUNICADO';

  var rows = [
    _nflxRow('r-com',  '📢 Comunicados',          '#2563eb', _nflxCardsBasic(nflxData.comunicados,  'comunicados')),
    '<div class="nflx-div"></div>',
    _nflxRow('r-aniv', '🎂 Aniversariantes',       '#f43f5e', _nflxCardsAniv()),
    '<div class="nflx-div"></div>',
    _nflxRow('r-mot',  '🙏 Reflexão & Motivação',  '#7c3aed', _nflxCardsBasic(nflxData.motivacional,'motivacional')),
    '<div class="nflx-div"></div>',
    _nflxRow('r-ind',  '📊 Indicadores',            '#16a34a', _nflxCardsIndicadores()),
    '<div class="nflx-div"></div>',
    _nflxRow('r-dic',  '🧠 Dicas de Produtividade', '#3b82f6', _nflxCardsBasic(nflxData.dicas,      'dicas')),
    '<div class="nflx-div"></div>',
    _nflxRow('r-cul',  '👩‍🍳 Receitas Rápidas',      '#f97316', _nflxCardsBasic(nflxData.culinaria,  'culinaria')),
    '<div class="nflx-div"></div>',
    _nflxRow('r-age',  '🎭 Agenda Cultural',         '#a855f7', _nflxCardsAgenda()),
    '<div class="nflx-div"></div>',
    _nflxRow('r-bem',  '💙 Bem-estar & Saúde',       '#0ea5e9', _nflxCardsBasic(nflxData.bemEstar,   'bemEstar')),
    '<div class="nflx-div"></div>',
    _nflxRow('r-hum',  '😄 Momento Leve',            '#fbbf24', _nflxCardsBasic(nflxData.humor,      'humor')),
  ].join('');

  return '<div class="nflx-root" id="nflx-root">' +

    /* ─── HERO ─── */
    '<div class="nflx-hero">' +
      '<div class="nflx-hero-blob nflx-hero-blob1"></div>' +
      '<div class="nflx-hero-blob nflx-hero-blob2"></div>' +
      '<div class="nflx-hero-blob nflx-hero-blob3"></div>' +
      '<div class="nflx-hero-bg"></div>' +
      '<div class="nflx-hero-vign"></div>' +
      '<div class="nflx-hero-grad"></div>' +
      '<div class="nflx-hero-grad2"></div>' +
      '<div class="nflx-hero-art">📡</div>' +
      '<div class="nflx-hero-body">' +
        '<div class="nflx-hero-eyebrow">' +
          '<span class="nflx-hero-series">' + badge + '</span>' +
          '<span class="nflx-hero-dot"></span>' +
          '<span class="nflx-hero-year">2025</span>' +
        '</div>' +
        '<div class="nflx-hero-title">' + com0.titulo + '</div>' +
        '<div class="nflx-hero-sub">' + (com0.texto || '') + '</div>' +
        '<div class="nflx-hero-tags">' +
          '<span class="nflx-hero-tag">RH</span>' +
          '<span class="nflx-hero-tag">Interno</span>' +
          '<span class="nflx-hero-tag">Toda a equipe</span>' +
        '</div>' +
        '<div class="nflx-hero-btns">' +
          '<button class="nflx-btn-play" onclick="Toast.info(\'Abrindo comunicado...\')">' +
            '<span style="font-size:16px">&#9654;</span> Assistir' +
          '</button>' +
          '<button class="nflx-btn-more" onclick="tvMudarCanal(null,\'comunicados\')">' +
            '<span style="font-size:14px">&#9432;</span> Mais informações' +
          '</button>' +
        '</div>' +
      '</div>' +
    '</div>' +

    rows +
  '</div>';
}

// ─────────────────────────────────────────────
// ROW HELPER
// ─────────────────────────────────────────────
function _nflxRow(id, titulo, cor, cardsHTML) {
  return '<div class="nflx-row">' +
    '<div class="nflx-row-head">' +
      '<div class="nflx-row-strip" style="background:' + cor + '"></div>' +
      '<span class="nflx-row-title">' + titulo + '</span>' +
      '<span class="nflx-row-explore">Explorar tudo &#8250;</span>' +
    '</div>' +
    '<div class="nflx-row-wrap">' +
      '<button class="nflx-nav lft" onclick="nflxScroll(\'' + id + '\',-1)">&#8249;</button>' +
      '<div class="nflx-cards" id="' + id + '">' + cardsHTML + '</div>' +
      '<button class="nflx-nav rgt" onclick="nflxScroll(\'' + id + '\',1)">&#8250;</button>' +
    '</div>' +
  '</div>';
}

// ─────────────────────────────────────────────
// CARDS BÁSICOS — strip + badge + painel + link
// ─────────────────────────────────────────────
function _nflxCardsBasic(lista, tipo) {
  var html = '';
  for (var i = 0; i < lista.length; i++) {
    var c = lista[i];

    var badgeHtml = '';
    if (c.badge) {
      var cls = c.badge === 'NOVO'    ? 'novo'
              : c.badge === 'HOJE'    ? 'hoje'
              : c.badge === 'URGENTE' ? 'urgente'
              : c.badge === 'AO VIVO' ? 'live' : 'novo';
      badgeHtml = '<div class="nflx-card-badge ' + cls + '">' + c.badge + '</div>';
    }

    // Botão play abre link externo se existir
    var playAct = c.link
      ? '<a href="' + c.link + '" target="_blank" rel="noopener" class="nflx-card-act play" title="Abrir" style="text-decoration:none">&#9654;</a>'
      : '<div class="nflx-card-act play">&#9654;</div>';

    // Indicador de link externo (ícone sutil no canto)
    var linkIcon = c.link
      ? '<div style="position:absolute;top:9px;right:9px;z-index:3;width:20px;height:20px;border-radius:50%;background:rgba(255,255,255,.12);display:flex;align-items:center;justify-content:center;font-size:9px;color:rgba(255,255,255,.6)" title="Link externo disponível">&#8599;</div>'
      : '';

    html +=
      '<div class="nflx-card" onclick="nflxOpenCard(\'' + tipo + '\',' + i + ')">' +
        '<div class="nflx-card-bg" style="' + c.grad + '">' + c.emoji + '</div>' +
        '<div class="nflx-card-strip" style="background:' + c.strip + '"></div>' +
        badgeHtml +
        linkIcon +
        '<div class="nflx-card-ov"></div>' +
        '<div class="nflx-card-panel">' +
          '<div class="nflx-card-panel-title">' + c.titulo + '</div>' +
          '<div class="nflx-card-panel-sub">' + c.sub + '</div>' +
          '<div class="nflx-card-acts">' +
            playAct +
            '<div class="nflx-card-act" title="Adicionar">+</div>' +
            (c.link ? '<a href="' + c.link + '" target="_blank" rel="noopener" class="nflx-card-act" title="Abrir site" style="text-decoration:none">&#8599;</a>' : '<div class="nflx-card-act">&#9432;</div>') +
          '</div>' +
        '</div>' +
      '</div>';
  }
  return html;
}

// ─────────────────────────────────────────────
// CARDS ANIVERSARIANTES
// ─────────────────────────────────────────────
function _nflxCardsAniv() {
  var lista = nflxData.aniversariantes;
  var html  = '';
  for (var i = 0; i < lista.length; i++) {
    var a = lista[i];
    var bg = 'linear-gradient(145deg,' + a.cor + 'dd,' + a.cor + '88,#0f0f0f)';
    html +=
      '<div class="nflx-aniv-card" style="background:' + bg + '">' +
        '<div class="nflx-aniv-deco">🎉</div>' +
        '<div class="nflx-aniv-deco2">🎊</div>' +
        '<div style="font-size:26px;margin-bottom:6px;position:relative;z-index:1">🎂</div>' +
        '<div class="nflx-aniv-av" style="background:' + a.cor + '55">' + a.avatar + '</div>' +
        '<div style="font-size:12px;font-weight:800;color:white;line-height:1.2;position:relative;z-index:1">' + a.nome.split(' ')[0] + '</div>' +
        '<div style="font-size:10px;color:rgba(255,255,255,.6);position:relative;z-index:1">' + a.setor + '</div>' +
        '<div style="font-size:11px;font-weight:700;margin-top:4px;position:relative;z-index:1;' +
             'background:rgba(255,255,255,.12);border-radius:4px;padding:2px 8px;color:' + a.cor + '">📅 ' + a.dia + '</div>' +
      '</div>';
  }
  return html;
}

// ─────────────────────────────────────────────
// CARDS INDICADORES — anel SVG + barra
// ─────────────────────────────────────────────
function _nflxCardsIndicadores() {
  var lista = nflxData.indicadores;
  var html  = '';
  var r = 26;
  var circ = 2 * Math.PI * r;
  for (var i = 0; i < lista.length; i++) {
    var d    = lista[i];
    var fill = (d.pct / 100) * circ;
    var gap  = circ - fill;
    var corLabel = d.pct >= 85 ? '#4ade80' : d.pct >= 65 ? '#facc15' : '#f87171';

    html +=
      '<div class="nflx-ind-card" style="' + d.grad + '">' +
        '<div class="nflx-card-strip" style="background:' + d.strip + '"></div>' +
        '<div class="nflx-card-ov" style="background:linear-gradient(135deg,rgba(0,0,0,.05),rgba(0,0,0,.5))"></div>' +
        '<div class="nflx-ind-info">' +
          '<div class="nflx-ind-label">' + d.titulo + '</div>' +
          '<div class="nflx-ind-val" style="color:' + corLabel + '">' + d.pct + '<span style="font-size:16px">%</span></div>' +
          '<div class="nflx-ind-sub">' + d.sub + '</div>' +
        '</div>' +
        '<div class="nflx-ind-ring">' +
          '<svg viewBox="0 0 64 64" width="62" height="62">' +
            '<circle cx="32" cy="32" r="' + r + '" fill="none" stroke="rgba(255,255,255,.1)" stroke-width="7"/>' +
            '<circle cx="32" cy="32" r="' + r + '" fill="none" stroke="' + d.cor + '" stroke-width="7"' +
              ' stroke-dasharray="' + fill.toFixed(1) + ' ' + gap.toFixed(1) + '"' +
              ' stroke-linecap="round" transform="rotate(-90 32 32)"/>' +
            '<text x="32" y="36" text-anchor="middle" font-size="12" font-weight="900" fill="white">' + d.pct + '</text>' +
          '</svg>' +
        '</div>' +
        '<div class="nflx-ind-bar">' +
          '<div class="nflx-ind-bar-fill" style="width:' + d.pct + '%;background:' + d.cor + '55"></div>' +
        '</div>' +
      '</div>';
  }
  return html;
}

// ─────────────────────────────────────────────
// CARDS AGENDA CULTURAL
// ─────────────────────────────────────────────
function _nflxCardsAgenda() {
  var lista = nflxData.agenda;
  var html  = '';
  for (var i = 0; i < lista.length; i++) {
    var e   = lista[i];
    var cor = e.cor || '#4338ca';
    var bg  = 'linear-gradient(140deg,' + cor + 'cc,' + cor + '55,#0f0f0f)';

    var badgeHtml = '';
    if (e.badge) {
      var cls = e.badge === 'HOJE' ? 'hoje' : e.badge === 'NOVO' ? 'novo' : 'live';
      badgeHtml = '<div class="nflx-card-badge ' + cls + '">' + e.badge + '</div>';
    }

    html +=
      '<div class="nflx-age-card">' +
        '<div style="width:100%;height:100%;background:' + bg + ';display:flex;align-items:center;justify-content:center;font-size:60px;opacity:.55">🎭</div>' +
        '<div class="nflx-card-ov"></div>' +
        '<div style="position:absolute;top:9px;left:9px;z-index:3">' +
          '<span style="background:' + cor + ';color:white;font-size:9px;font-weight:800;padding:2px 9px;border-radius:3px;text-transform:uppercase;letter-spacing:1.2px">' + e.tipo + '</span>' +
        '</div>' +
        badgeHtml +
        '<div class="nflx-card-panel">' +
          '<div class="nflx-card-panel-title">' + e.titulo + '</div>' +
          '<div class="nflx-card-panel-sub">📅 ' + e.dia + ' ' + e.data + '  ·  🕐 ' + e.hora + '</div>' +
          '<div class="nflx-card-acts">' +
            '<div class="nflx-card-act play">&#9654;</div>' +
            '<div class="nflx-card-act">+</div>' +
          '</div>' +
        '</div>' +
      '</div>';
  }
  return html;
}

// ─────────────────────────────────────────────
// NAVEGAÇÃO
// ─────────────────────────────────────────────
function nflxScroll(id, dir) {
  var el = document.getElementById(id);
  if (el) el.scrollLeft += dir * 700;
}

function nflxOpenCard(tipo, idx) {
  var map = {
    comunicados:  nflxData.comunicados,
    motivacional: nflxData.motivacional,
    indicadores:  nflxData.indicadores,
    dicas:        nflxData.dicas,
    culinaria:    nflxData.culinaria,
    bemEstar:     nflxData.bemEstar,
    humor:        nflxData.humor,
    agenda:       nflxData.agenda,
  };
  var lista = map[tipo];
  if (!lista || !lista[idx]) return;
  var c = lista[idx];
  Toast.info((c.emoji || '') + ' ' + c.titulo + (c.sub ? ' — ' + c.sub : ''));
}
