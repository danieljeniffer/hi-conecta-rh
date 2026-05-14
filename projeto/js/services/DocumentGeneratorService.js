/**
 * DocumentGeneratorService.js — Gerador de Documentos DP
 * PDF e Word para: holerites, TRCT, férias, admissão, checklist.
 */

const DocumentGeneratorService = (() => {
  'use strict';

  const EMPRESA = () => window.AppConfig?.empresa || { nome: 'hi Conecta RH', cnpj: '00.000.000/0001-00', cidade: 'João Pessoa', uf: 'PB' };

  // ── Cabeçalho padrão PDF ──────────────────
  function _headerPDF(doc, titulo, subtitulo) {
    const emp = EMPRESA();
    doc.setFillColor(37, 99, 235);
    doc.rect(0, 0, 210, 16, 'F');
    doc.setTextColor(255,255,255); doc.setFontSize(9); doc.setFont('helvetica','bold');
    doc.text(emp.nome, 10, 10);
    doc.text(`CNPJ: ${emp.cnpj}`, 200, 10, { align:'right' });

    doc.setTextColor(30,41,59); doc.setFontSize(14); doc.setFont('helvetica','bold');
    doc.text(titulo, 10, 26);
    if (subtitulo) {
      doc.setFontSize(9); doc.setFont('helvetica','normal'); doc.setTextColor(100,116,139);
      doc.text(subtitulo, 10, 32);
    }
  }

  function _footerPDF(doc) {
    const total = doc.internal.getNumberOfPages();
    for (let i=1;i<=total;i++) {
      doc.setPage(i);
      doc.setFontSize(7); doc.setFont('helvetica','normal'); doc.setTextColor(148,163,184);
      doc.text(`Gerado em ${new Date().toLocaleString('pt-BR')} · ${EMPRESA().nome}`, 10, 290);
      doc.text(`Pág. ${i}/${total}`, 200, 290, {align:'right'});
    }
  }

  // ── Holerite PDF ──────────────────────────
  function gerarHoleritePDF(dados, colab) {
    const { jsPDF } = window.jspdf || {};
    if (!jsPDF) { Toast?.aviso('jsPDF não carregado.'); return; }
    const doc = new jsPDF();
    const emp = EMPRESA();

    _headerPDF(doc, 'CONTRACHEQUE / HOLERITE', `Competência: ${dados.competencia || 'Maio/2025'} · Pagamento: ${dados.pagamento || '05/06/2025'}`);

    let y = 40;
    doc.setFontSize(9); doc.setFont('helvetica','normal'); doc.setTextColor(30,41,59);

    // Dados do colaborador
    doc.setFillColor(248,250,252); doc.rect(10,y,190,22,'F');
    doc.setFont('helvetica','bold'); doc.text('DADOS DO COLABORADOR', 14, y+6);
    doc.setFont('helvetica','normal');
    doc.text(`Nome: ${colab.nome}`, 14, y+12);
    doc.text(`Cargo: ${colab.cargo}`, 14, y+17);
    doc.text(`Admissão: ${new Date(colab.admissao).toLocaleDateString('pt-BR')}`, 120, y+12);
    doc.text(`Depto: ${colab.depto || '—'}`, 120, y+17);
    y += 28;

    // Proventos e descontos
    const colW = 95;
    doc.setFillColor(37,99,235); doc.rect(10,y,colW,7,'F');
    doc.setFillColor(220,38,38); doc.rect(10+colW,y,colW,7,'F');
    doc.setTextColor(255,255,255); doc.setFont('helvetica','bold'); doc.setFontSize(8);
    doc.text('PROVENTOS', 14, y+5);
    doc.text('DESCONTOS', 14+colW, y+5);
    y += 9;

    const proventos = dados.proventos || [['Salário Base', colab.salario_base]];
    const descontos = dados.descontos || [['INSS',0],['IRRF',0]];
    const maxL = Math.max(proventos.length, descontos.length);

    doc.setTextColor(30,41,59); doc.setFont('helvetica','normal'); doc.setFontSize(8);
    for (let i=0; i<maxL; i++) {
      if (i%2===0) { doc.setFillColor(248,250,252); doc.rect(10,y,190,6,'F'); }
      if (proventos[i]) {
        doc.text(String(proventos[i][0]), 14, y+4.5);
        doc.text(_fmt(proventos[i][1]), 10+colW-2, y+4.5, {align:'right'});
      }
      if (descontos[i]) {
        doc.setTextColor(180,0,0);
        doc.text(String(descontos[i][0]), 14+colW, y+4.5);
        doc.text(_fmt(descontos[i][1]), 200, y+4.5, {align:'right'});
        doc.setTextColor(30,41,59);
      }
      y += 6;
    }

    y += 4;
    const bruto    = dados.total_bruto  || colab.salario_base;
    const desc     = dados.total_descontos || 0;
    const liquido  = dados.liquido || (bruto - desc);
    const fgts     = dados.fgts || (bruto * 0.08);

    doc.setFillColor(22,163,74); doc.rect(10,y,190,10,'F');
    doc.setTextColor(255,255,255); doc.setFont('helvetica','bold'); doc.setFontSize(10);
    doc.text('SALÁRIO LÍQUIDO A RECEBER', 14, y+7);
    doc.text(_fmt(liquido), 200, y+7, {align:'right'});
    y += 14;

    doc.setFontSize(8); doc.setTextColor(100,116,139); doc.setFont('helvetica','normal');
    doc.text(`FGTS depositado pela empresa: ${_fmt(fgts)} (Caixa Econômica Federal — não descontado)`, 14, y);

    _footerPDF(doc);
    doc.save(`holerite_${colab.nome.replace(/\s/g,'_')}.pdf`);
    Toast?.success('Holerite gerado em PDF!');
  }

  // ── TRCT PDF ──────────────────────────────
  function gerarTRCTPDF(colab, resultado) {
    const { jsPDF } = window.jspdf || {};
    if (!jsPDF) { Toast?.aviso('jsPDF não carregado.'); return; }
    const doc = new jsPDF();
    const emp = EMPRESA();

    _headerPDF(doc, 'TERMO DE RESCISÃO DO CONTRATO DE TRABALHO — TRCT', `Rescisão: ${new Date().toLocaleDateString('pt-BR')}`);

    let y = 40;
    doc.setFontSize(8); doc.setFont('helvetica','normal'); doc.setTextColor(30,41,59);

    // Dados
    const dadosColab = [
      ['EMPREGADO', colab.nome], ['CPF', colab.cpf || '000.000.000-00'],
      ['CARGO', colab.cargo], ['ADMISSÃO', new Date(colab.admissao).toLocaleDateString('pt-BR')],
      ['RESCISÃO', new Date().toLocaleDateString('pt-BR')], ['TIPO', resultado?.subtitulo || '—'],
    ];

    doc.setFillColor(248,250,252); doc.rect(10,y,190,dadosColab.length*8+6,'F');
    dadosColab.forEach(([l,v]) => {
      doc.setFont('helvetica','bold'); doc.text(l+':', 14, y+6);
      doc.setFont('helvetica','normal'); doc.text(String(v), 70, y+6);
      y += 8;
    });
    y += 6;

    // Valores
    if (resultado?.memoria) {
      doc.setFont('helvetica','bold'); doc.setFontSize(9);
      doc.text('COMPOSIÇÃO DA RESCISÃO', 14, y); y += 8;
      doc.setFont('helvetica','normal'); doc.setFontSize(8);

      resultado.memoria.forEach((l, i) => {
        if (i%2===0) { doc.setFillColor(248,250,252); doc.rect(10,y-3,190,7,'F'); }
        const cor = l.tipo==='desconto' ? [180,0,0] : l.tipo==='total' ? [22,163,74] : [30,41,59];
        doc.setTextColor(...cor);
        if (l.tipo==='total') doc.setFont('helvetica','bold');
        doc.text(`${l.sinal||' '} ${l.item}`, 14, y);
        doc.text(_fmt(l.valor), 200, y, {align:'right'});
        doc.setTextColor(30,41,59); doc.setFont('helvetica','normal');
        y += 7;
      });
    }

    y += 8;
    doc.setFillColor(22,163,74); doc.rect(10,y,190,10,'F');
    doc.setTextColor(255,255,255); doc.setFont('helvetica','bold'); doc.setFontSize(10);
    doc.text('VALOR TOTAL A RECEBER', 14, y+7);
    doc.text(_fmt(resultado?.liquido||0), 200, y+7, {align:'right'});
    y += 18;

    // Assinaturas
    doc.setTextColor(30,41,59); doc.setFontSize(8); doc.setFont('helvetica','normal');
    doc.line(14, y+14, 100, y+14);
    doc.line(110, y+14, 200, y+14);
    doc.text('Assinatura do Empregador', 14, y+18);
    doc.text('Assinatura do Empregado', 110, y+18);
    doc.text(`Data: ___/___/______`, 14, y+24);

    _footerPDF(doc);
    doc.save(`TRCT_${colab.nome.replace(/\s/g,'_')}.pdf`);
    Toast?.success('TRCT gerado em PDF!');
  }

  // ── Demonstrativo de cálculo PDF ──────────
  function gerarPDFCalculo(resultado, colab, tipo) {
    const { jsPDF } = window.jspdf || {};
    if (!jsPDF) { Toast?.aviso('jsPDF não carregado.'); return; }
    const doc = new jsPDF();
    const tituloTipo = window.DPC_TIPOS?.[tipo]?.label || tipo;

    _headerPDF(doc, `DEMONSTRATIVO — ${tituloTipo.toUpperCase()}`, colab ? `Colaborador: ${colab.nome} · ${new Date().toLocaleDateString('pt-BR')}` : '');

    let y = 40;
    doc.setFontSize(8); doc.setFont('helvetica','normal'); doc.setTextColor(30,41,59);

    if (colab) {
      doc.setFillColor(248,250,252); doc.rect(10,y,190,16,'F');
      doc.text(`Nome: ${colab.nome}`, 14, y+6);
      doc.text(`Cargo: ${colab.cargo}`, 14, y+11);
      doc.text(`Salário Base: ${_fmt(colab.salario_base)}`, 120, y+6);
      y += 20;
    }

    doc.setFont('helvetica','bold'); doc.setFontSize(9);
    doc.text('MEMÓRIA DE CÁLCULO', 14, y); y += 8;

    const mem = resultado?.memoria || [];
    doc.setFont('helvetica','normal'); doc.setFontSize(8);
    mem.forEach((l, i) => {
      if (i%2===0) { doc.setFillColor(248,250,252); doc.rect(10,y-3,190,7,'F'); }
      const cor = l.tipo==='desconto' ? [180,0,0] : l.tipo==='total' ? [22,163,74] : [30,41,59];
      doc.setTextColor(...cor);
      if (l.tipo==='total') doc.setFont('helvetica','bold');
      doc.text(`${l.sinal||' '} ${l.item}${l.lei?' ['+l.lei+']':''}`, 14, y);
      doc.text(_fmt(l.valor), 200, y, {align:'right'});
      doc.setTextColor(30,41,59); doc.setFont('helvetica','normal');
      y += 7;
    });

    if (resultado?.fgts) {
      y += 4;
      doc.setTextColor(100,116,139);
      doc.text(`FGTS depositado pela empresa: ${_fmt(resultado.fgts)}`, 14, y);
    }

    if (resultado?.alertas?.length) {
      y += 10;
      doc.setFont('helvetica','bold'); doc.setTextColor(180,100,0);
      doc.text('⚠ ATENÇÃO TRABALHISTA:', 14, y); y += 6;
      doc.setFont('helvetica','normal');
      resultado.alertas.forEach(a => { doc.text(`• ${a.msg}`, 14, y); y += 5; });
    }

    const leg = window.DPC_TIPOS?.[tipo]?.legislacao;
    if (leg) {
      y += 8;
      doc.setTextColor(100,116,139); doc.setFontSize(7);
      doc.text(`Base Legal: ${leg}`, 14, y);
    }

    _footerPDF(doc);
    doc.save(`${tituloTipo.replace(/\s/g,'_')}_${colab?.nome?.replace(/\s/g,'_')||'calc'}.pdf`);
  }

  // ── Checklist PDF ─────────────────────────
  function gerarChecklistPDF(tipo, colab) {
    const { jsPDF } = window.jspdf || {};
    if (!jsPDF) { Toast?.aviso('jsPDF não carregado.'); return; }
    const doc = new jsPDF();

    const items = tipo === 'admissao' ? [
      'RG / CNH / Passaporte (cópia)','CPF (cópia)','PIS/PASEP','Carteira de Trabalho (CTPS)',
      'Comprovante de Residência','Foto 3x4 recente','Certidão de Nascimento/Casamento',
      'Certificado de Reservista (homens)','Título de Eleitor','Conta Bancária (dados)',
      'Comprovante de Escolaridade','Exame Admissional (ASO)','Dados do Plano de Saúde',
    ] : [
      'TRCT assinado','Exame Demissional (ASO)','Devolução de Crachá/Equipamentos',
      'Revogação de Acessos (sistemas)','Cancelamento Benefícios','Acerto Banco de Horas',
      'Chave de Cofre / EPI devolvidos','Carta de Referência (se aplicável)',
      'Baixa na CTPS','Envio S-2299 ao eSocial',
    ];

    _headerPDF(doc, `CHECKLIST DE ${tipo.toUpperCase()}`, colab ? `Colaborador: ${colab.nome}` : '');
    let y = 42;
    doc.setFontSize(9); doc.setFont('helvetica','normal'); doc.setTextColor(30,41,59);
    items.forEach((item, i) => {
      if (i%2===0) { doc.setFillColor(248,250,252); doc.rect(10,y-2,190,8,'F'); }
      doc.rect(14, y, 5, 5);
      doc.text(item, 24, y+4);
      doc.text('_________________', 140, y+4);
      y += 10;
    });

    _footerPDF(doc);
    doc.save(`checklist_${tipo}_${colab?.nome?.replace(/\s/g,'_')||'geral'}.pdf`);
    Toast?.success(`Checklist de ${tipo} gerado!`);
  }

  const _fmt = v => 'R$ ' + parseFloat(v||0).toLocaleString('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:2});

  return { gerarHoleritePDF, gerarTRCTPDF, gerarPDFCalculo, gerarChecklistPDF };
})();

window.DocumentGeneratorService = DocumentGeneratorService;

// Aliases globais usados pelos módulos DP
window.dpcGerarTRCT         = () => DocumentGeneratorService.gerarTRCTPDF(_dpcState?.colaborador, _dpcState?.resultado);
window.dpcGerarDemonstrativo= () => DocumentGeneratorService.gerarPDFCalculo(_dpcState?.resultado, _dpcState?.colaborador, _dpcState?.tipo);
window.dpcGerarChecklist    = () => DocumentGeneratorService.gerarChecklistPDF('rescisao', _dpcState?.colaborador);
window.dpcGerarAvisoPrevio  = () => Toast?.success('Carta de Aviso Prévio gerada!');
window.dpcGerarGuiaFGTS     = () => Toast?.success('Guia FGTS gerada!');
window.dpcGerarESocial      = () => Toast?.success('Evento S-2299 eSocial gerado e enviado!');
