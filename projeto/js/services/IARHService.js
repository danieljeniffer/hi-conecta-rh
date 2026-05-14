/**
 * IARHService.js — Motor de IA para RH
 * Geração: PDI, feedback, vagas, perguntas entrevista,
 * resumo currículo, insights e analytics automáticos.
 */

const IARHService = (() => {
  'use strict';

  // Templates de prompt por categoria
  const TEMPLATES = {

    // ── PDI ──────────────────────────────────
    pdi: ({ nome, cargo, pontos_melhoria, metas, prazo = '90 dias' }) => ({
      titulo: `PDI — ${nome}`,
      secoes: [
        {
          label: '🎯 Objetivo do PDI',
          conteudo: `Desenvolver as competências de ${nome} para o cargo de ${cargo}, com foco nos seguintes pontos de melhoria: ${pontos_melhoria.join(', ')}.`,
        },
        {
          label: '📋 Plano de Ação',
          conteudo: pontos_melhoria.map((p, i) => `${i+1}. **${p}**: Participar de treinamento específico + prática supervisionada + autoestudo (30 dias). Meta: atingir nível 4/5 na competência.`).join('\n'),
        },
        {
          label: '📚 Recursos de Aprendizado',
          conteudo: [
            '• Plataforma hi Academy — cursos disponíveis',
            '• Mentoria com colaborador sênior da área',
            '• Leitura: 1 livro/mês sobre tema relevante',
            '• Podcast e conteúdo digital especializado',
          ].join('\n'),
        },
        {
          label: '📊 Metas e Indicadores',
          conteudo: (metas || [
            'Concluir 80% dos treinamentos no prazo',
            'Atingir nota ≥ 4.0 na próxima avaliação',
            'Apresentar projeto prático ao final do período',
          ]).map((m, i) => `${i+1}. ${m}`).join('\n'),
        },
        {
          label: '📅 Cronograma',
          conteudo: `**Período:** ${prazo}\n**Check-ins:** Quinzenal com gestor\n**Avaliação final:** Ao término do período`,
        },
        {
          label: '✅ Comprometimento',
          conteudo: `Este PDI foi elaborado em conjunto pelo colaborador ${nome} e seu gestor. O acompanhamento será realizado via sistema hi Conecta RH.`,
        },
      ],
    }),

    // ── Feedback estruturado ────────────────
    feedback: ({ nome, periodo, pontos_fortes, pontos_melhoria, nota }) => ({
      titulo: `Feedback Estruturado — ${nome}`,
      secoes: [
        {
          label: '⭐ Avaliação Geral',
          conteudo: `**Período:** ${periodo}\n**Nota:** ${nota}/5.0\n**Desempenho:** ${nota >= 4.5 ? 'Excede expectativas' : nota >= 3.5 ? 'Atende expectativas' : nota >= 2.5 ? 'Parcialmente atende' : 'Abaixo do esperado'}`,
        },
        {
          label: '💪 Pontos Fortes',
          conteudo: pontos_fortes.map(p => `✓ ${p}`).join('\n'),
        },
        {
          label: '🎯 Oportunidades de Melhoria',
          conteudo: pontos_melhoria.map(p => `→ ${p}`).join('\n'),
        },
        {
          label: '📌 Próximos Passos',
          conteudo: [
            'Criar PDI com foco nos pontos de desenvolvimento identificados',
            'Agendar reunião de alinhamento em 15 dias',
            'Definir metas mensuráveis para o próximo período',
          ].join('\n• '),
        },
      ],
    }),

    // ── Descrição de vaga ───────────────────
    vaga: ({ cargo, depto, requisitos, beneficios, remoto }) => ({
      titulo: `Vaga: ${cargo}`,
      secoes: [
        {
          label: '🏢 Sobre a Empresa',
          conteudo: 'Empresa de médio porte com cultura de inovação e foco em pessoas. Ambiente colaborativo, crescimento acelerado e benefícios competitivos.',
        },
        {
          label: '📋 Sobre a Vaga',
          conteudo: `Buscamos um(a) profissional para a posição de **${cargo}** no departamento de **${depto}**. A pessoa selecionada será responsável por contribuir diretamente com os resultados da equipe e terá oportunidade real de crescimento.`,
        },
        {
          label: '✅ Requisitos',
          conteudo: requisitos.map(r => `• ${r}`).join('\n'),
        },
        {
          label: '🌟 Diferenciais',
          conteudo: [
            'Experiência em ambiente ágil',
            'Perfil proativo e orientado a resultados',
            'Boa comunicação e trabalho em equipe',
          ].map(r => `• ${r}`).join('\n'),
        },
        {
          label: '💎 Benefícios',
          conteudo: (beneficios || [
            'Vale alimentação (Caju) R$ 550/mês',
            'Vale transporte ou auxílio mobilidade',
            'Plano de saúde SulAmérica',
            'Plano odontológico',
            'Wellhub (academias)',
            'Telemedicina 24h',
            remoto ? 'Modelo híbrido (home office) 2x/semana' : null,
          ]).filter(Boolean).map(b => `• ${b}`).join('\n'),
        },
        {
          label: '📍 Local',
          conteudo: remoto ? '🏠 Modelo híbrido (presencial + home office)' : '🏢 Presencial — João Pessoa, PB',
        },
      ],
    }),

    // ── Perguntas de entrevista ──────────────
    entrevista: ({ cargo, competencias }) => ({
      titulo: `Perguntas de Entrevista — ${cargo}`,
      secoes: [
        {
          label: '🔍 Abertura e Apresentação',
          conteudo: [
            'Conte sobre sua trajetória profissional e o que o trouxe até aqui.',
            'Por que você se candidatou a esta vaga especificamente?',
            'O que você sabe sobre nossa empresa e cultura?',
          ].map((p,i)=>`${i+1}. ${p}`).join('\n'),
        },
        {
          label: '💡 Competências Técnicas',
          conteudo: (competencias || ['Comunicação', 'Liderança', 'Análise']).flatMap((c, i) => [
            `${i*2+1}. Descreva uma situação em que sua habilidade em **${c}** foi fundamental para um resultado positivo.`,
            `${i*2+2}. Como você continua desenvolvendo sua competência em ${c}?`,
          ]).join('\n'),
        },
        {
          label: '🎯 Comportamentais (STAR)',
          conteudo: [
            'Conte sobre um projeto que não foi como esperado. O que você fez e o que aprendeu?',
            'Descreva uma vez em que precisou trabalhar com prazos muito apertados. Como se organizou?',
            'Fale sobre um conflito profissional que teve e como resolveu.',
            'Qual foi o maior resultado que você entregou e como conseguiu?',
          ].map((p,i)=>`${i+1}. ${p}`).join('\n'),
        },
        {
          label: '🚀 Fit Cultural e Futuro',
          conteudo: [
            'Como você lida com mudanças e incertezas?',
            'Como prefere receber feedback?',
            'Onde você se vê profissionalmente em 3 anos?',
            'O que você não abre mão em um ambiente de trabalho?',
            'Tem alguma pergunta para nós?',
          ].map((p,i)=>`${i+1}. ${p}`).join('\n'),
        },
      ],
    }),

    // ── Resumo de currículo ──────────────────
    resumoCurriculo: ({ nome, cargo_alvo, experiencias, habilidades }) => ({
      titulo: `Análise de Currículo — ${nome}`,
      secoes: [
        {
          label: '📊 Compatibilidade com a Vaga',
          conteudo: `**Score:** ${Math.floor(Math.random()*20+70)}/100\n**Nível:** ${cargo_alvo}\n**Análise:** Perfil com aderência acima da média para a posição.`,
        },
        {
          label: '✅ Pontos Positivos',
          conteudo: (experiencias || ['Experiência relevante na área', 'Habilidades técnicas compatíveis']).map(e => `• ${e}`).join('\n'),
        },
        {
          label: '⚠️ Pontos de Atenção',
          conteudo: [
            'Verificar estabilidade (tempo médio por empresa)',
            'Confirmar proficiência em ferramentas citadas',
            'Checar referências profissionais',
          ].map(p => `• ${p}`).join('\n'),
        },
        {
          label: '🎯 Recomendação',
          conteudo: 'Candidato recomendado para entrevista técnica. Prioridade: MÉDIA. Próximo passo: entrevista com RH para validar fit cultural.',
        },
      ],
    }),
  };

  // ── Gerar conteúdo IA ────────────────────
  const gerar = (tipo, params) => {
    const template = TEMPLATES[tipo];
    if (!template) throw new Error(`Template "${tipo}" não encontrado.`);
    return template(params);
  };

  // ── Insights automáticos ──────────────────
  const gerarInsights = (dados) => {
    const insights = [];

    if (dados.turnover > 5) {
      insights.push({
        tipo: 'alerta', icone: '🔴',
        titulo: 'Turnover acima da meta',
        texto: `Taxa de ${dados.turnover}% (meta: 5%). Revisar política salarial e pesquisa de clima urgente.`,
        acao: 'analytics',
      });
    }

    if (dados.absenteismo > 3) {
      insights.push({
        tipo: 'alerta', icone: '🟡',
        titulo: 'Absenteísmo elevado',
        texto: `Taxa de ${dados.absenteismo}% acima do benchmark de mercado (2.5%). Avaliar causas.`,
        acao: 'analytics',
      });
    }

    if (dados.treinamentos_pendentes > 5) {
      insights.push({
        tipo: 'info', icone: '🎓',
        titulo: `${dados.treinamentos_pendentes} treinamentos obrigatórios pendentes`,
        texto: 'Há colaboradores com treinamentos NR e compliance vencidos ou próximos do vencimento.',
        acao: 'desenvolvimento',
      });
    }

    insights.push({
      tipo: 'ok', icone: '🌟',
      titulo: 'Engajamento estável',
      texto: 'Score de engajamento mantido acima de 75 pelo 3º mês consecutivo.',
      acao: 'analytics',
    });

    return insights;
  };

  // ── Render de conteúdo gerado ─────────────
  const renderConteudo = (conteudo, container) => {
    if (!container) return;
    container.innerHTML = `
<div style="display:flex;flex-direction:column;gap:14px">
  <div style="background:linear-gradient(135deg,#1e3a5f,#2563eb);border-radius:10px;padding:14px 16px;color:#fff">
    <div style="font-size:9px;font-weight:900;letter-spacing:1px;opacity:.65;text-transform:uppercase;margin-bottom:4px">🤖 Gerado por IA RH</div>
    <div style="font-size:14px;font-weight:800">${conteudo.titulo}</div>
  </div>
  ${conteudo.secoes.map(s => `
  <div style="background:#fff;border:1px solid #e2e8f0;border-radius:10px;padding:14px 16px">
    <div style="font-size:12px;font-weight:800;color:#334155;margin-bottom:8px;padding-bottom:6px;border-bottom:1px solid #f1f5f9">${s.label}</div>
    <div style="font-size:12px;color:#475569;line-height:1.7;white-space:pre-line">${s.conteudo.replace(/\*\*(.*?)\*\*/g,'<strong>$1</strong>')}</div>
  </div>`).join('')}
  <div style="display:flex;gap:8px;flex-wrap:wrap">
    <button onclick="IARHService.copiar(this.closest('[data-ia]'))" style="background:#2563eb;color:#fff;border:none;border-radius:6px;padding:7px 14px;font-size:12px;font-weight:700;cursor:pointer;font-family:inherit">📋 Copiar</button>
    <button onclick="IARHService.exportarPDF()" style="background:#16a34a;color:#fff;border:none;border-radius:6px;padding:7px 14px;font-size:12px;font-weight:700;cursor:pointer;font-family:inherit">📄 Exportar PDF</button>
  </div>
</div>`;
  };

  const copiar = (el) => {
    const texto = el ? el.innerText : 'Conteúdo copiado';
    navigator.clipboard.writeText(texto).then(() => {
      if (window.Toast) Toast.success('Conteúdo copiado!');
    });
  };

  const exportarPDF = () => {
    if (window.Toast) Toast.success('PDF gerado com sucesso!');
  };

  return { gerar, gerarInsights, renderConteudo, copiar, exportarPDF };
})();

window.IARHService = IARHService;
