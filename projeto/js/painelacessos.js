// =============================================
// MÓDULO: JORNADA — STEP "ACESSOS"
// renderStepAcessos() → retorna HTML string
// =============================================

function renderStepAcessos() {
  return `
<div class="ac-root">

  <!-- HERO -->
  <div class="ac-hero">
    <div class="ac-hero-left">
      <div class="ac-hero-icon">🔐</div>
      <div>
        <h2 class="ac-hero-title">Seus Acessos</h2>
        <p class="ac-hero-sub">Clique para acessar cada plataforma. Seus dados de login foram enviados por e-mail.</p>
      </div>
    </div>
    <div class="ac-hero-badge">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M9 12l2 2 4-4" stroke="#1D9E75" stroke-width="2" stroke-linecap="round"/><circle cx="12" cy="12" r="10" stroke="#1D9E75" stroke-width="2"/></svg>
      Dados enviados por e-mail
    </div>
  </div>

  <!-- GRID DE PLATAFORMAS -->
  <div class="ac-grid">

    <!-- BITRIX24 -->
    <div class="ac-card" style="--ac-clr:#2FC6F6;--ac-bg:linear-gradient(135deg,#e8f9fe 0%,#f0fbff 100%);">
      <div class="ac-card-inner">
        <div class="ac-logo-wrap">
          <img src="https://cdn.worldvectorlogo.com/logos/bitrix24.svg" alt="Bitrix24" class="ac-logo" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'"/>
          <div class="ac-logo-fallback" style="display:none;background:#2FC6F6;color:#fff;">B24</div>
        </div>
        <div class="ac-card-info">
          <div class="ac-card-name">Bitrix24</div>
          <div class="ac-card-desc">Comunicação, tarefas e processos internos</div>
          <div class="ac-card-tags">
            <span class="ac-tag">Comunicação</span>
            <span class="ac-tag">Tarefas</span>
            <span class="ac-tag">CRM</span>
          </div>
        </div>
      </div>
      <div class="ac-card-actions">
        <a href="https://bitrix24.com.br" target="_blank" class="ac-btn ac-btn--primary" style="--ac-btn-clr:#2FC6F6;">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
          Acessar Web
        </a>
        <div class="ac-store-row">
          <a href="https://apps.apple.com/br/app/bitrix24/id561683282" target="_blank" class="ac-store-btn">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg>
            App Store
          </a>
          <a href="https://play.google.com/store/apps/details?id=com.bitrix24.android" target="_blank" class="ac-store-btn">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M3.18 23.76c.3.17.65.19.96.07l12.45-7.19-2.78-2.78-10.63 9.9zM.59 1.5C.22 1.84 0 2.37 0 3.06v17.88c0 .69.22 1.22.59 1.56l.08.08 10.02-10.01v-.24L.67 1.42l-.08.08zM20.56 10.18l-2.86-1.65-3.13 3.13 3.13 3.13 2.89-1.67c.82-.48.82-1.27-.03-1.94zM3.18.24l12.42 7.16-2.78 2.78L2.19.17c.31-.12.68-.1.99.07z"/></svg>
            Google Play
          </a>
        </div>
      </div>
    </div>

    <!-- RHID -->
    <div class="ac-card" style="--ac-clr:#00B67A;--ac-bg:linear-gradient(135deg,#e6f9f2 0%,#f0fdf7 100%);">
      <div class="ac-card-inner">
        <div class="ac-logo-wrap" style="background:#00B67A;">
          <span style="color:#fff;font-size:18px;font-weight:800;letter-spacing:-1px;">RH</span>
        </div>
        <div class="ac-card-info">
          <div class="ac-card-name">RHid</div>
          <div class="ac-card-desc">Ponto eletrônico e espelho de ponto</div>
          <div class="ac-card-tags">
            <span class="ac-tag">Ponto</span>
            <span class="ac-tag">Frequência</span>
          </div>
        </div>
      </div>
      <div class="ac-card-actions">
        <a href="https://rhid.com.br" target="_blank" class="ac-btn ac-btn--primary" style="--ac-btn-clr:#00B67A;">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
          Acessar Web
        </a>
        <div class="ac-store-row">
          <a href="https://apps.apple.com/br/app/rhid/id1449897076" target="_blank" class="ac-store-btn">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg>
            App Store
          </a>
          <a href="https://play.google.com/store/apps/details?id=br.com.rhid.app" target="_blank" class="ac-store-btn">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M3.18 23.76c.3.17.65.19.96.07l12.45-7.19-2.78-2.78-10.63 9.9zM.59 1.5C.22 1.84 0 2.37 0 3.06v17.88c0 .69.22 1.22.59 1.56l.08.08 10.02-10.01v-.24L.67 1.42l-.08.08zM20.56 10.18l-2.86-1.65-3.13 3.13 3.13 3.13 2.89-1.67c.82-.48.82-1.27-.03-1.94zM3.18.24l12.42 7.16-2.78 2.78L2.19.17c.31-.12.68-.1.99.07z"/></svg>
            Google Play
          </a>
        </div>
      </div>
    </div>

    <!-- CAJU -->
    <div class="ac-card" style="--ac-clr:#FF5733;--ac-bg:linear-gradient(135deg,#fff2ef 0%,#fff8f6 100%);">
      <div class="ac-card-inner">
        <div class="ac-logo-wrap">
          <img src="https://cajubenefits.com.br/wp-content/themes/caju/images/logo-caju.svg" alt="Caju" class="ac-logo" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'"/>
          <div class="ac-logo-fallback" style="display:none;background:#FF5733;color:#fff;">CJ</div>
        </div>
        <div class="ac-card-info">
          <div class="ac-card-name">Caju</div>
          <div class="ac-card-desc">Benefícios flexíveis, cartão e mobilidade</div>
          <div class="ac-card-tags">
            <span class="ac-tag">Benefícios</span>
            <span class="ac-tag">Cartão</span>
            <span class="ac-tag">VA/VR</span>
          </div>
        </div>
      </div>
      <div class="ac-card-actions">
        <a href="https://cajubenefits.com.br" target="_blank" class="ac-btn ac-btn--primary" style="--ac-btn-clr:#FF5733;">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
          Acessar Web
        </a>
        <div class="ac-store-row">
          <a href="https://apps.apple.com/br/app/caju/id1467145157" target="_blank" class="ac-store-btn">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg>
            App Store
          </a>
          <a href="https://play.google.com/store/apps/details?id=br.com.caju.app" target="_blank" class="ac-store-btn">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M3.18 23.76c.3.17.65.19.96.07l12.45-7.19-2.78-2.78-10.63 9.9zM.59 1.5C.22 1.84 0 2.37 0 3.06v17.88c0 .69.22 1.22.59 1.56l.08.08 10.02-10.01v-.24L.67 1.42l-.08.08zM20.56 10.18l-2.86-1.65-3.13 3.13 3.13 3.13 2.89-1.67c.82-.48.82-1.27-.03-1.94zM3.18.24l12.42 7.16-2.78 2.78L2.19.17c.31-.12.68-.1.99.07z"/></svg>
            Google Play
          </a>
        </div>
      </div>
    </div>

    <!-- WELLHUB (antigo Gympass) -->
    <div class="ac-card" style="--ac-clr:#FF4E00;--ac-bg:linear-gradient(135deg,#fff2ee 0%,#fff8f5 100%);">
      <div class="ac-card-inner">
        <div class="ac-logo-wrap">
          <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Wellhub_logo.svg/320px-Wellhub_logo.svg.png" alt="Wellhub" class="ac-logo" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'"/>
          <div class="ac-logo-fallback" style="display:none;background:#FF4E00;color:#fff;">WH</div>
        </div>
        <div class="ac-card-info">
          <div class="ac-card-name">Wellhub</div>
          <div class="ac-card-desc">Academias, bem-estar e saúde física</div>
          <div class="ac-card-tags">
            <span class="ac-tag">Academia</span>
            <span class="ac-tag">Bem-estar</span>
            <span class="ac-tag">Fitness</span>
          </div>
        </div>
      </div>
      <div class="ac-card-actions">
        <a href="https://wellhub.com/pt-br" target="_blank" class="ac-btn ac-btn--primary" style="--ac-btn-clr:#FF4E00;">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
          Acessar Web
        </a>
        <div class="ac-store-row">
          <a href="https://apps.apple.com/br/app/wellhub-gympass/id786167460" target="_blank" class="ac-store-btn">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg>
            App Store
          </a>
          <a href="https://play.google.com/store/apps/details?id=com.gympass.app" target="_blank" class="ac-store-btn">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M3.18 23.76c.3.17.65.19.96.07l12.45-7.19-2.78-2.78-10.63 9.9zM.59 1.5C.22 1.84 0 2.37 0 3.06v17.88c0 .69.22 1.22.59 1.56l.08.08 10.02-10.01v-.24L.67 1.42l-.08.08zM20.56 10.18l-2.86-1.65-3.13 3.13 3.13 3.13 2.89-1.67c.82-.48.82-1.27-.03-1.94zM3.18.24l12.42 7.16-2.78 2.78L2.19.17c.31-.12.68-.1.99.07z"/></svg>
            Google Play
          </a>
        </div>
      </div>
    </div>

    <!-- CONEXA SAÚDE -->
    <div class="ac-card" style="--ac-clr:#00A3E0;--ac-bg:linear-gradient(135deg,#e6f6fd 0%,#f0faff 100%);">
      <div class="ac-card-inner">
        <div class="ac-logo-wrap">
          <img src="https://conexasaude.com.br/wp-content/uploads/2021/07/logo-conexa-saude.svg" alt="Conexa Saúde" class="ac-logo" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'"/>
          <div class="ac-logo-fallback" style="display:none;background:#00A3E0;color:#fff;">CX</div>
        </div>
        <div class="ac-card-info">
          <div class="ac-card-name">Conexa Saúde</div>
          <div class="ac-card-desc">Telemedicina e consultas online 24h</div>
          <div class="ac-card-tags">
            <span class="ac-tag">Telemedicina</span>
            <span class="ac-tag">24h</span>
            <span class="ac-tag">Consultas</span>
          </div>
        </div>
      </div>
      <div class="ac-card-actions">
        <a href="https://conexasaude.com.br" target="_blank" class="ac-btn ac-btn--primary" style="--ac-btn-clr:#00A3E0;">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
          Acessar Web
        </a>
        <div class="ac-store-row">
          <a href="https://apps.apple.com/br/app/conexa-sa%C3%BAde/id1434451458" target="_blank" class="ac-store-btn">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg>
            App Store
          </a>
          <a href="https://play.google.com/store/apps/details?id=br.com.conexasaude.patient" target="_blank" class="ac-store-btn">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M3.18 23.76c.3.17.65.19.96.07l12.45-7.19-2.78-2.78-10.63 9.9zM.59 1.5C.22 1.84 0 2.37 0 3.06v17.88c0 .69.22 1.22.59 1.56l.08.08 10.02-10.01v-.24L.67 1.42l-.08.08zM20.56 10.18l-2.86-1.65-3.13 3.13 3.13 3.13 2.89-1.67c.82-.48.82-1.27-.03-1.94zM3.18.24l12.42 7.16-2.78 2.78L2.19.17c.31-.12.68-.1.99.07z"/></svg>
            Google Play
          </a>
        </div>
      </div>
    </div>

    <!-- SUL AMÉRICA -->
    <div class="ac-card" style="--ac-clr:#E30613;--ac-bg:linear-gradient(135deg,#fdecea 0%,#fff5f5 100%);">
      <div class="ac-card-inner">
        <div class="ac-logo-wrap">
          <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/8/8d/Logo_Sul_Am%C3%A9rica_Seguros.svg/320px-Logo_Sul_Am%C3%A9rica_Seguros.svg.png" alt="SulAmérica" class="ac-logo" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'"/>
          <div class="ac-logo-fallback" style="display:none;background:#E30613;color:#fff;">SA</div>
        </div>
        <div class="ac-card-info">
          <div class="ac-card-name">SulAmérica</div>
          <div class="ac-card-desc">Plano de saúde, carteira e reembolsos</div>
          <div class="ac-card-tags">
            <span class="ac-tag">Plano Saúde</span>
            <span class="ac-tag">Reembolso</span>
            <span class="ac-tag">Rede</span>
          </div>
        </div>
      </div>
      <div class="ac-card-actions">
        <a href="https://portal.sulamerica.com.br" target="_blank" class="ac-btn ac-btn--primary" style="--ac-btn-clr:#E30613;">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
          Acessar Web
        </a>
        <div class="ac-store-row">
          <a href="https://apps.apple.com/br/app/sulam%C3%A9rica-saude/id939339827" target="_blank" class="ac-store-btn">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg>
            App Store
          </a>
          <a href="https://play.google.com/store/apps/details?id=br.com.sulamerica.saude" target="_blank" class="ac-store-btn">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M3.18 23.76c.3.17.65.19.96.07l12.45-7.19-2.78-2.78-10.63 9.9zM.59 1.5C.22 1.84 0 2.37 0 3.06v17.88c0 .69.22 1.22.59 1.56l.08.08 10.02-10.01v-.24L.67 1.42l-.08.08zM20.56 10.18l-2.86-1.65-3.13 3.13 3.13 3.13 2.89-1.67c.82-.48.82-1.27-.03-1.94zM3.18.24l12.42 7.16-2.78 2.78L2.19.17c.31-.12.68-.1.99.07z"/></svg>
            Google Play
          </a>
        </div>
      </div>
    </div>

    <!-- TELEMEDICINA (genérico se não tiver provider específico) -->
    <div class="ac-card" style="--ac-clr:#6C63FF;--ac-bg:linear-gradient(135deg,#f0effe 0%,#f7f5ff 100%);">
      <div class="ac-card-inner">
        <div class="ac-logo-wrap" style="background:linear-gradient(135deg,#6C63FF,#9C8FFF);">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path d="M22 12h-4l-3 9L9 3l-3 9H2" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <div class="ac-card-info">
          <div class="ac-card-name">Telemedicina</div>
          <div class="ac-card-desc">Consultas médicas online com especialistas</div>
          <div class="ac-card-tags">
            <span class="ac-tag">Online</span>
            <span class="ac-tag">Especialistas</span>
            <span class="ac-tag">Urgência</span>
          </div>
        </div>
      </div>
      <div class="ac-card-actions">
        <a href="#" target="_blank" class="ac-btn ac-btn--primary" style="--ac-btn-clr:#6C63FF;">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
          Acessar Web
        </a>
        <div class="ac-store-row">
          <a href="#" target="_blank" class="ac-store-btn">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg>
            App Store
          </a>
          <a href="#" target="_blank" class="ac-store-btn">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M3.18 23.76c.3.17.65.19.96.07l12.45-7.19-2.78-2.78-10.63 9.9zM.59 1.5C.22 1.84 0 2.37 0 3.06v17.88c0 .69.22 1.22.59 1.56l.08.08 10.02-10.01v-.24L.67 1.42l-.08.08zM20.56 10.18l-2.86-1.65-3.13 3.13 3.13 3.13 2.89-1.67c.82-.48.82-1.27-.03-1.94zM3.18.24l12.42 7.16-2.78 2.78L2.19.17c.31-.12.68-.1.99.07z"/></svg>
            Google Play
          </a>
        </div>
      </div>
    </div>

  </div><!-- /ac-grid -->

  <!-- DICA MOBILE -->
  <div class="ac-tip">
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><rect x="5" y="2" width="14" height="20" rx="2" stroke="#534AB7" stroke-width="1.8"/><circle cx="12" cy="17" r="1" fill="#534AB7"/></svg>
    <span><strong>Dica:</strong> Baixe os apps no celular para ter acesso rápido a qualquer hora. Clique nos botões <em>App Store</em> ou <em>Google Play</em> em cada card.</span>
  </div>

</div>
  `;
}