// =============================================
// EXPORTSERVICE.JS — Exportação unificada
// Seguro: Word escapa título, PDF quebra linhas longas
// =============================================

const ExportService = {

  excel(nomeArquivo, colunas, linhas, nomePlanilha = 'Dados') {
    if (typeof XLSX === 'undefined') {
      Toast.error('Biblioteca XLSX não carregada. Verifique a conexão.');
      return false;
    }
    try {
      const wsData = [colunas, ...linhas];
      const ws     = XLSX.utils.aoa_to_sheet(wsData);

      // Largura automática com limites seguros (mín. 8, máx. 60 chars)
      const colWidths = colunas.map((_, ci) =>
        Math.max(
          ...wsData.map(row => String(row[ci] ?? '').length),
          8
        )
      );
      ws['!cols'] = colWidths.map(w => ({ wch: Math.min(w + 2, 60) }));

      // Sanitiza nome da planilha (Excel não aceita caracteres especiais)
      const nomePlanSafe = String(nomePlanilha).replace(/[\\/*?:\[\]]/g, '').slice(0, 31);

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, nomePlanSafe);
      XLSX.writeFile(wb, `${_nomeArquivoSeguro(nomeArquivo)}.xlsx`);
      Toast.success(`Excel gerado com sucesso!`);
      return true;
    } catch (e) {
      console.error('[ExportService.excel]', e);
      Toast.error('Erro ao gerar Excel.');
      return false;
    }
  },

  pdf(titulo, linhas, opcoes = {}) {
    if (typeof window.jspdf === 'undefined') {
      Toast.error('Biblioteca jsPDF não carregada. Verifique a conexão.');
      return false;
    }
    try {
      const { jsPDF } = window.jspdf;
      const doc    = new jsPDF();
      const margem = 14;
      const larguraUtil = 210 - margem * 2; // ~182mm
      let y = 20;

      // Cabeçalho
      doc.setFillColor(27, 86, 214);
      doc.rect(0, 0, 210, 14, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.text('hi Conecta RH — ' + (window.AppConfig?.empresa?.nome || ''), margem, 9);

      doc.setTextColor(30, 41, 59);
      doc.setFontSize(opcoes.tamanhoTitulo || 16);
      doc.setFont('helvetica', 'bold');
      // Título em textSplit para não vazar a borda
      const tituloLinhas = doc.splitTextToSize(String(titulo), larguraUtil);
      doc.text(tituloLinhas, margem, y + 8);
      y += 8 + (tituloLinhas.length - 1) * 8;

      if (opcoes.subtitulo) {
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(100, 116, 139);
        const subLinhas = doc.splitTextToSize(String(opcoes.subtitulo), larguraUtil);
        doc.text(subLinhas, margem, y + 10);
        y += 10 + subLinhas.length * 5;
      }

      y += 12;
      doc.setFontSize(opcoes.tamanhoTexto || 10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(30, 41, 59);

      const espacamento = opcoes.espacamento || 7;

      for (const linha of linhas) {
        // Quebra linhas longas antes de imprimir
        const linhaStr    = String(linha ?? '');
        const linhasPDF   = doc.splitTextToSize(linhaStr, larguraUtil);
        const alturaBloco = linhasPDF.length * espacamento;

        if (y + alturaBloco > 275) {
          doc.addPage();
          y = 20;
        }
        doc.text(linhasPDF, margem, y);
        y += alturaBloco + 1;
      }

      // Rodapé com paginação
      const totalPags = doc.internal.getNumberOfPages();
      const dataGeracao = new Date().toLocaleDateString('pt-BR');
      for (let i = 1; i <= totalPags; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150, 163, 175);
        doc.text(`Página ${i} de ${totalPags}`, 196, 290, { align: 'right' });
        doc.text(dataGeracao, margem, 290);
      }

      doc.save(`${_nomeArquivoSeguro(titulo)}.pdf`);
      Toast.success(`PDF gerado com sucesso!`);
      return true;
    } catch (e) {
      console.error('[ExportService.pdf]', e);
      Toast.error('Erro ao gerar PDF.');
      return false;
    }
  },

  word(titulo, html) {
    try {
      // Escapa o título para uso seguro em H1 (pode vir de input do usuário)
      const tituloSeguro = _escaparHtml(String(titulo || 'Relatório'));

      // O parâmetro `html` DEVE ser HTML gerado pelo próprio sistema (não por input do usuário)
      // Se vier de dados externos, use _escaparHtml() nos valores antes de montar o html
      const estilo = `
        <style>
          body  { font-family: Arial, sans-serif; font-size: 12pt; color: #1e293b; margin: 2cm; }
          h1    { color: #1b56d6; font-size: 18pt; }
          h2    { color: #334155; font-size: 14pt; }
          table { border-collapse: collapse; width: 100%; margin-top: 12pt; }
          th    { background: #1b56d6; color: #fff; padding: 6px 10px; text-align: left; }
          td    { border: 1px solid #e2e8f0; padding: 5px 10px; }
          tr:nth-child(even) td { background: #f8fafc; }
          p     { line-height: 1.5; }
        </style>
      `;

      const rodape = `<p style="margin-top:24pt;font-size:9pt;color:#94a3b8;border-top:1px solid #e2e8f0;padding-top:8pt">
        Gerado em ${new Date().toLocaleString('pt-BR')} · hi Conecta RH
      </p>`;

      const conteudo = [
        '<!DOCTYPE html>',
        '<html lang="pt-BR">',
        `<head><meta charset="utf-8">${estilo}</head>`,
        `<body><h1>${tituloSeguro}</h1>`,
        html || '',
        rodape,
        '</body></html>',
      ].join('\n');

      DOM.download(
        new Blob(['﻿' + conteudo], { type: 'application/msword;charset=utf-8' }),
        `${_nomeArquivoSeguro(titulo)}.doc`
      );
      Toast.success(`Word gerado com sucesso!`);
      return true;
    } catch (e) {
      console.error('[ExportService.word]', e);
      Toast.error('Erro ao gerar Word.');
      return false;
    }
  },

  csv(nomeArquivo, colunas, linhas) {
    try {
      const sep = ';';
      const esc = v => `"${String(v ?? '').replace(/"/g, '""')}"`;
      const corpo = [colunas, ...linhas].map(r => r.map(esc).join(sep)).join('\r\n');
      DOM.download('﻿' + corpo, `${_nomeArquivoSeguro(nomeArquivo)}.csv`, 'text/csv;charset=utf-8');
      Toast.success('CSV gerado com sucesso!');
      return true;
    } catch (e) {
      console.error('[ExportService.csv]', e);
      Toast.error('Erro ao gerar CSV.');
      return false;
    }
  },
};

// ── Helpers internos ──────────────────────────────────────

// Remove caracteres inválidos de nomes de arquivo
function _nomeArquivoSeguro(nome) {
  return String(nome || 'arquivo')
    .replace(/[<>:"/\\|?*\x00-\x1F]/g, '_')
    .replace(/\s+/g, '_')
    .slice(0, 100);
}

// Escapa caracteres HTML (para inserção segura de dados em HTML)
function _escaparHtml(str) {
  return String(str)
    .replace(/&/g,  '&amp;')
    .replace(/</g,  '&lt;')
    .replace(/>/g,  '&gt;')
    .replace(/"/g,  '&quot;')
    .replace(/'/g,  '&#39;');
}

// ── BACKWARD COMPATIBILITY ────────────────────
function exportarExcel(nome, colunas, dados) { return ExportService.excel(nome, colunas, dados); }
function exportarPDF(titulo, linhas)          { return ExportService.pdf(titulo, linhas); }
function exportarWord(titulo, html)           { return ExportService.word(titulo, html); }
