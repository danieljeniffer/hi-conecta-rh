# Conecta RH

> Sistema completo de Gestão de Recursos Humanos — SPA Vanilla JS + Node.js Backend

![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-F7DF1E?style=flat&logo=javascript&logoColor=black)
![Node.js](https://img.shields.io/badge/Node.js-Backend-339933?style=flat&logo=node.js&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Database-4169E1?style=flat&logo=postgresql&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green?style=flat)

---

## Sobre o projeto

O **Conecta RH** é uma plataforma completa de gestão de RH desenvolvida como Single Page Application (SPA) em Vanilla JS com backend em Node.js + Express + PostgreSQL. O sistema cobre todo o ciclo do colaborador — do recrutamento ao desligamento — com cálculos trabalhistas CLT nativos e integração com eSocial.

**Versão:** 1.0 · **Data:** 02/05/2026 · **Porta backend:** 3001

---

## Números do projeto

| Item | Quantidade |
|------|-----------|
| Arquivos JS (frontend) | 57 |
| Arquivos CSS | 23 |
| Módulos / páginas navegáveis | 21 |
| Seções internas totais | 100+ |
| Perfis de acesso | 6 |
| Integrações externas | 9 sistemas |
| Formatos de exportação | PDF, Excel, Word, CSV |
| Cálculos trabalhistas CLT | 8 |
| Eventos eSocial | 3 (S-2200, S-1200, S-2299) |
| Linhas de JS (estimativa) | ~12.000 |
| Linhas de CSS | ~4.000 |

---

## Stack tecnológica

**Frontend:** Vanilla JS (ES6+), CSS modular, SPA com hash routing  
**Backend:** Node.js, Express, PostgreSQL, JWT, arquitetura MVC  
**Integrações:** eSocial, Bitrix24 REST, Caju, Nubus, Wellhub, RHid, RHsolutio, SulAmérica, Conexão Saúde  
**Exportação:** jsPDF, SheetJS (XLSX), Word (.doc), CSV

---

## Estrutura do projeto

```
projeto/
├── index.html + login.html        ← Entrada da SPA
├── css/  (23 arquivos)            ← Estilos por módulo
└── js/
    ├── config.js + data.js + app.js  ← Configuração global
    ├── core/       (5 arquivos)   ← Router, Auth, Store, EventBus, Toast
    ├── services/   (3 arquivos)   ← DPService, ExportService, BitrixService
    ├── utils/      (3 arquivos)   ← formatters, validators, dom
    └── modules/    (8 pastas)     ← 42 arquivos de módulos de negócio

dp-backend/                        ← Node.js + Express + PostgreSQL
├── controllers/  (9 arquivos)
├── routes/       (10 arquivos)
└── services/     (8 serviços CLT)
```

---

## Módulos

### RH & Operacional
| Módulo | Arquivo | Destaques |
|--------|---------|-----------|
| Dashboard | `modules/rh/dashboard.js` | 3 versões por perfil, KPIs, aprovações inline |
| Gestão de Pessoas | `modules/rh/pessoas.js` | 7 abas, CRUD, organograma, auditoria |
| Indicadores | `modules/rh/indicadores.js` | Turnover, headcount, metas, clima |
| Serviços RH | `modules/rh/servicos.js` | Catálogo 12 serviços, SLA, auditoria |
| Comunicação | `modules/rh/comunicacao.js` | Feed com reações, avisos, 6 canais |
| Documentos | `modules/rh/documentos.js` | 9 categorias, assinatura digital |
| Cargos & Estrutura | `modules/rh/cargos.js` | 14 cargos, faixas salariais, plano de carreira |
| T&D | `modules/rh/desenvolvimento.js` | Treinamentos EAD/Presencial, provas, progresso |
| Clima & Engajamento | `modules/rh/clima.js` | Feed, comunicados, histórico de engajamento |
| Ouvidoria | `modules/rh/ouvidoria.js` | 6 tipos, SLA 48h–120h, restrito RH/Jurídico |
| NR-01 Segurança | `modules/rh/nr01.js` | PGR, 8 riscos, CIPA, 3 views por perfil |
| Engajamento Dashboard | `modules/rh/engajamento-dashboard.js` | Score ponderado, 4 abas, histórico Jan–Mai |

### Departamento Pessoal (DP)
| Submódulo | Arquivo | Funcionalidade |
|-----------|---------|----------------|
| Dashboard | `dp-dashboard.js` | 8 KPIs, alertas, custo empresa |
| Colaboradores | `dp-colaboradores.js` | CRUD completo, paginação, filtros |
| Admissão | `dp-admissao.js` | Wizard 7 etapas, 14 automações, eSocial S-2200 |
| Folha | `dp-folha.js` | Cálculo completo, holerites, FGTS |
| Férias | `dp-ferias.js` | Simulador, alertas 60d, plano anual |
| 13º Salário | `dp-decimo.js` | Simulador individual/coletivo, 2 parcelas |
| Rescisão | `dp-rescisao.js` | 5 tipos, simulador bilateral |
| Benefícios | `dp-beneficios.js` | 8 tipos, custos empresa/colaborador |
| Notificações | `dp-notificacoes.js` | 8 tipos, 4 prioridades |

### Gestão & Colaborador
| Módulo | Destaque |
|--------|----------|
| Recrutamento | Pipeline 5 etapas, 18 candidatos, 6 critérios comportamentais |
| Gestor de Equipes | 6 submódulos: avaliações, ocorrências, reuniões, histórico |
| Bonificações & Formulários | Form Builder, planilha de lançamentos, relatórios PDF/Excel |
| Portal do Colaborador | 13 seções, ponto eletrônico, assistente IA |
| Jornada do Colaborador | 8 etapas de onboarding, 8 plataformas integradas |
| Experiência | Indique & Ganhe, hi Move, hi Academy, Programa de Ideias |
| Endomarketing TV | 11 tipos de slide, auto-play, interface Netflix corporativo |
| Integrações | 8 sistemas, status de sync, log de sincronizações |
| Usuários & Permissões | CRUD usuários, matriz de permissões visual |

---

## Perfis de acesso (RBAC)

| Perfil | Acesso |
|--------|--------|
| `admin` | Total — todos os módulos + gestão de usuários |
| `rh` | Quase total — sem config de sistema |
| `analista` | Operacional de RH |
| `gestor` | Restrito ao seu setor |
| `colab` | Dados próprios + Portal do Colaborador |
| `juridico` | Documentos, Ouvidoria, DP (visualização) |

---

## Cálculos CLT embutidos

- INSS tabela progressiva 2024 (7,5% → 14%, teto R$ 908,85)
- IRRF faixas progressivas com dedução por dependente (R$ 189,59)
- FGTS 8% + multa 40% (sem justa causa) / 20% (acordo mútuo)
- Férias 30 dias + ⅓ + abono até 10 dias
- 13º salário proporcional — 2 parcelas com INSS+IRRF na 2ª
- Rescisão — 5 modalidades CLT completas
- Aviso prévio proporcional
- eSocial: S-2200 (admissão), S-1200 (folha), S-2299 (rescisão)

---

## Infraestrutura core

| Arquivo | Função |
|---------|--------|
| `Router.js` | Hash-based SPA routing com guard, titles e initPage hooks |
| `Auth.js` | RBAC com 6 perfis, matrix de permissões, applySidebar() |
| `Store.js` | Estado centralizado com pub/sub (dot notation) |
| `EventBus.js` | Comunicação entre módulos desacoplada |
| `Toast.js` | Notificações (success, error, warning, info), confirm modal |

---

## Como rodar

```bash
# Backend
cd dp-backend
npm install
npm start            # Porta 3001

# Frontend
# Abra index.html em um servidor local (Live Server, http-server etc.)
```

---

## Licença

MIT © 2026 Conecta RH
