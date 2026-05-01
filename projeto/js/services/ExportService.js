// =============================================
// EXPORTSERVICE.JS — Exportação unificada
// Substitui exportador.js + pdf.js + sheets.js + word.js
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

      // Largura automática por coluna
      const colWidths = colunas.map((_, ci) =>
        Math.max(...wsData.map(row => String(row[ci] ?? '').length), 10)
      );
      ws['!cols'] = colWidths.map(w => ({ wch: Math.min(w + 2, 50) }));

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, nomePlanilha);
      XLSX.writeFile(wb, `${nomeArquivo}.xlsx`);
      Toast.success(`Excel "${nomeArquivo}.xlsx" gerado com sucesso!`);
      return true;
    } catch (e) {
      Toast.error('Erro ao gerar Excel: ' + e.message);
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
      const doc       = new jsPDF();
      const margem    = 14;
      let y           = 20;

      // Cabeçalho
      doc.setFillColor(27, 86, 214);
      doc.rect(0, 0, 210, 14, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(9);
      doc.text('hi Conecta RH — ' + (AppConfig?.empresa?.nome || ''), margem, 9);

      doc.setTextColor(30, 41, 59);
      doc.setFontSize(opcoes.tamanhoTitulo || 16);
      doc.setFont('helvetica', 'bold');
      doc.text(titulo, margem, y + 8);

      if (opcoes.subtitulo) {
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(100, 116, 139);
        doc.text(opcoes.subtitulo, margem, y + 16);
        y += 8;
      }

      y += 20;
      doc.setFontSize(opcoes.tamanhoTexto || 10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(30, 41, 59);

      linhas.forEach(linha => {
        if (y > 270) { doc.addPage(); y = 20; }
        doc.text(String(linha), margem, y);
        y += opcoes.espacamento || 7;
      });

      // Rodapé
      const total = doc.internal.getNumberOfPages();
      for (let i = 1; i <= total; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text(`Página ${i} de ${total}`, 190, 290, { align: 'right' });
        doc.text(new Date().toLocaleDateString('pt-BR'), margem, 290);
      }

      doc.save(`${titulo}.pdf`);
      Toast.success(`PDF "${titulo}.pdf" gerado com sucesso!`);
      return true;
    } catch (e) {
      Toast.error('Erro ao gerar PDF: ' + e.message);
      return false;
    }
  },

  word(titulo, html) {
    try {
      const estilo = `
        <style>
          body { font-family: Arial, sans-serif; font-size: 12pt; color: #1e293b; }
          h1 { color: #1b56d6; } h2 { color: #334155; }
          table { border-collapse: collapse; width: 100%; }
          th { background: #1b56d6; color: #fff; padding: 6px 10px; }
          td { border: 1px solid #e2e8f0; padding: 5px 10px; }
        </style>
      `;
      const conteudo = `<html><head><meta charset="utf-8">${estilo}</head><body><h1>${titulo}</h1>${html}</body></html>`;
      DOM.download(
        new Blob(['﻿', conteudo], { type: 'application/msword' }),
        `${titulo}.doc`
      );
      Toast.success(`Word "${titulo}.doc" gerado com sucesso!`);
      return true;
    } catch (e) {
      Toast.error('Erro ao gerar Word: ' + e.message);
      return false;
    }
  },

  csv(nomeArquivo, colunas, linhas) {
    try {
      const sep   = ';';
      const esc   = v => `"${String(v ?? '').replace(/"/g, '""')}"`;
      const corpo = [colunas, ...linhas].map(r => r.map(esc).join(sep)).join('\r\n');
      DOM.download('﻿' + corpo, `${nomeArquivo}.csv`, 'text/csv;charset=utf-8');
      Toast.success(`CSV "${nomeArquivo}.csv" gerado!`);
      return true;
    } catch (e) {
      Toast.error('Erro ao gerar CSV: ' + e.message);
      return false;
    }
  },
};

// ── BACKWARD COMPATIBILITY ────────────────────
// Mantém as funções antigas funcionando durante a migração

function exportarExcel(nomeArquivo, colunas, dados) {
  return ExportService.excel(nomeArquivo, colunas, dados);
}

function exportarPDF(titulo, linhas) {
  return ExportService.pdf(titulo, linhas);
}

function exportarWord(titulo, html) {
  return ExportService.word(titulo, html);
}
