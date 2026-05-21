/**
 * Sidebar.js — Motor da Sidebar Enterprise Dinâmica
 * hi Conecta RH · Menu sanfonado gerado automaticamente
 *
 * Responsável por:
 *  - Gerar o HTML da sidebar a partir de MODULES_CONFIG filtrado por perfil
 *  - Controlar colapso/expansão de setores (acordeão)
 *  - Manter estado de setor ativo na URL hash
 *  - Busca rápida de módulos
 *  - Indicadores visuais (badges, setor ativo, item ativo)
 *  - Persistir setores abertos no sessionStorage
 */

const Sidebar = (() => {
  'use strict';

  const STORAGE_KEY = 'sidebar_open_sectors';
  const SEARCH_KEY  = 'sidebar_search';

  let _perfil    = 'colab';
  let _pageAtual = 'dashboard';

  // ── Estado dos setores (quais estão expandidos) ───────────────
  function _getOpenSectors() {
    try { return JSON.parse(sessionStorage.getItem(STORAGE_KEY) || '[]'); } catch { return []; }
  }

  function _setOpenSectors(arr) {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(arr));
  }

  function _toggleSector(sectorId) {
    let open = _getOpenSectors();
    if (open.includes(sectorId)) {
      open = open.filter(s => s !== sectorId);
    } else {
      open.push(sectorId);
    }
    _setOpenSectors(open);
    _renderSectorState(sectorId);
  }

  function _renderSectorState(sectorId) {
    const header  = document.querySelector(`[data-sector="${sectorId}"] .sidebar-sector-header`);
    const content = document.querySelector(`[data-sector="${sectorId}"] .sidebar-sector-items`);
    const arrow   = document.querySelector(`[data-sector="${sectorId}"] .sector-arrow`);
    if (!header || !content) return;

    const open = _getOpenSectors().includes(sectorId);
    content.style.display = open ? 'block' : 'none';
    if (arrow) arrow.style.transform = open ? 'rotate(90deg)' : 'rotate(0deg)';
    header.setAttribute('aria-expanded', open);
  }

  // ── Badge HTML ────────────────────────────────────────────────
  function _badgeHtml(badge) {
    if (!badge) return '';
    const configs = {
      novo:     { label: 'Novo',  cls: 'badge-novo'  },
      ia:       { label: 'IA',   cls: 'badge-ia'    },
      beta:     { label: 'Beta', cls: 'badge-beta'   },
      'em breve':{ label: '…',   cls: 'badge-soon'  },
    };
    const c = configs[badge.toLowerCase()] || { label: badge, cls: 'badge-novo' };
    return `<span class="sidebar-badge ${c.cls}">${c.label}</span>`;
  }

  // ── Renderizar sidebar completa ───────────────────────────────
  function render(perfil, pageAtual) {
    _perfil    = perfil || 'colab';
    _pageAtual = pageAtual || 'dashboard';

    const nav   = document.getElementById('sidebar-nav');
    if (!nav || typeof window.getModulosParaPerfil !== 'function') return;

    const setores = window.getModulosParaPerfil(_perfil);
    const openSet = _getOpenSectors();

    // Auto-abre o setor que contém a página atual
    setores.forEach(setor => {
      const temPaginaAtual = setor.modulos.some(m => !m.divider && m.id === _pageAtual);
      if (temPaginaAtual && !openSet.includes(setor.id)) {
        openSet.push(setor.id);
        _setOpenSectors(openSet);
      }
    });

    nav.innerHTML = `
      <!-- Busca rápida -->
      <div class="sidebar-search-wrapper">
        <input
          type="text"
          id="sidebar-search"
          class="sidebar-search"
          placeholder="Buscar módulo..."
          autocomplete="off"
          oninput="Sidebar.search(this.value)"
          aria-label="Buscar módulo"
        />
        <span class="sidebar-search-icon">🔍</span>
      </div>

      <!-- Dashboard fixo (sempre visível) -->
      <div class="sidebar-pinned">
        <a href="#" class="sidebar-item ${_pageAtual === 'dashboard' ? 'sidebar-item--active' : ''}"
           data-page="dashboard" onclick="Sidebar.navigate('dashboard'); return false;"
           title="Início">
          <span class="sidebar-item-icon">⊞</span>
          <span class="sidebar-item-label">Início</span>
        </a>
      </div>

      <!-- Setores dinâmicos -->
      <div id="sidebar-sectors">
        ${setores.map(setor => _renderSetor(setor)).join('')}
      </div>
    `;

    // Aplica estados de colapso
    setores.forEach(s => _renderSectorState(s.id));

    // Restaura busca se havia
    const busca = sessionStorage.getItem(SEARCH_KEY) || '';
    if (busca) {
      const input = document.getElementById('sidebar-search');
      if (input) { input.value = busca; search(busca); }
    }
  }

  function _renderSetor(setor) {
    const modHtml = setor.modulos.map(mod => {
      if (mod.divider) {
        return `<div class="sidebar-divider" aria-hidden="true"></div>`;
      }

      const ativo = mod.id === _pageAtual ? 'sidebar-item--active' : '';
      const onclick = mod.external
        ? `window.open('${mod.external}', '_blank'); return false;`
        : `Sidebar.navigate('${mod.id}'); return false;`;
      const extIcon = mod.external ? '<span class="sidebar-ext-icon">↗</span>' : '';

      return `
        <a href="#" class="sidebar-item ${ativo}"
           data-page="${mod.id}" data-sector-item="${setor.id}"
           onclick="${onclick}"
           title="${mod.label}">
          <span class="sidebar-item-icon">${mod.icon}</span>
          <span class="sidebar-item-label">${mod.label}${_badgeHtml(mod.badge)}${extIcon}</span>
        </a>`;
    }).join('');

    return `
      <div class="sidebar-sector" data-sector="${setor.id}">
        <button
          class="sidebar-sector-header"
          onclick="Sidebar.toggleSector('${setor.id}')"
          aria-expanded="false"
          style="--sector-color: ${setor.color}"
        >
          <span class="sector-icon">${setor.icon}</span>
          <span class="sector-label">${setor.label}</span>
          <span class="sector-arrow" aria-hidden="true">›</span>
        </button>
        <div class="sidebar-sector-items" style="display:none">
          ${modHtml}
        </div>
      </div>`;
  }

  // ── Busca rápida ──────────────────────────────────────────────
  function search(query) {
    sessionStorage.setItem(SEARCH_KEY, query);
    const q     = (query || '').toLowerCase().trim();
    const items = document.querySelectorAll('#sidebar-sectors .sidebar-item');
    const sects = document.querySelectorAll('.sidebar-sector');
    const divs  = document.querySelectorAll('.sidebar-divider');

    if (!q) {
      // Restaura visibilidade normal
      items.forEach(el => el.style.display = '');
      divs.forEach(el  => el.style.display = '');
      sects.forEach(s  => { s.style.display = ''; _renderSectorState(s.dataset.sector); });
      return;
    }

    // Filtra itens e setores
    sects.forEach(setor => {
      const sectId    = setor.dataset.sector;
      const sectItems = setor.querySelectorAll('.sidebar-item');
      let   temMatch  = false;

      sectItems.forEach(item => {
        const label = item.querySelector('.sidebar-item-label')?.textContent.toLowerCase() || '';
        const match = label.includes(q);
        item.style.display = match ? '' : 'none';
        if (match) temMatch = true;
      });

      divs.forEach(d => d.style.display = 'none');
      setor.style.display = temMatch ? '' : 'none';

      if (temMatch) {
        // Abre setor com match
        const content = setor.querySelector('.sidebar-sector-items');
        if (content) content.style.display = 'block';
      }
    });
  }

  // ── Navegação ─────────────────────────────────────────────────
  function navigate(pageKey) {
    _pageAtual = pageKey;
    // Remove busca ao navegar
    const input = document.getElementById('sidebar-search');
    if (input && input.value) {
      input.value = '';
      sessionStorage.removeItem(SEARCH_KEY);
      search('');
    }
    // Atualiza estado ativo
    document.querySelectorAll('.sidebar-item').forEach(el => {
      el.classList.toggle('sidebar-item--active', el.dataset.page === pageKey);
    });
    // Chama roteador existente
    if (typeof window.navigateTo === 'function') {
      window.navigateTo(pageKey);
    }
  }

  // ── Atualizar página ativa sem rerenderizar ───────────────────
  function setActive(pageKey) {
    _pageAtual = pageKey;
    document.querySelectorAll('.sidebar-item').forEach(el => {
      el.classList.toggle('sidebar-item--active', el.dataset.page === pageKey);
    });
    // Auto-expande setor que contém a página
    if (typeof window.MODULES_CONFIG !== 'undefined') {
      window.MODULES_CONFIG.forEach(setor => {
        const temPagina = setor.modulos.some(m => !m.divider && m.id === pageKey);
        if (temPagina) {
          const open = _getOpenSectors();
          if (!open.includes(setor.id)) {
            open.push(setor.id);
            _setOpenSectors(open);
            _renderSectorState(setor.id);
          }
        }
      });
    }
  }

  // ── Toggle setor público ──────────────────────────────────────
  function toggleSector(sectorId) {
    _toggleSector(sectorId);
  }

  // ── Expandir/colapsar todos ───────────────────────────────────
  function expandAll() {
    if (typeof window.MODULES_CONFIG === 'undefined') return;
    const all = window.MODULES_CONFIG.map(s => s.id);
    _setOpenSectors(all);
    all.forEach(id => _renderSectorState(id));
  }

  function collapseAll() {
    _setOpenSectors([]);
    if (typeof window.MODULES_CONFIG !== 'undefined') {
      window.MODULES_CONFIG.forEach(s => _renderSectorState(s.id));
    }
  }

  return { render, setActive, search, navigate, toggleSector, expandAll, collapseAll };
})();

window.Sidebar = Sidebar;
