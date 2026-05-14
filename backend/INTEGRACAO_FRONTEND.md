# Integração Frontend ↔ Backend

## Configuração no config.js do frontend

```js
// projeto/js/config.js
const AppConfig = {
  api: {
    baseUrl: 'http://localhost:3001/api/v1',
    timeout: 15000,
  },
};
```

## Api.js — Cliente HTTP (já criado no frontend)

O arquivo `projeto/js/core/Api.js` já existe e gerencia:
- Bearer token automático
- Refresh token silencioso
- Timeout e retry
- Erros centralizados

## Exemplos de uso em cada módulo

---

### 🔐 AUTH

```js
// Login
const { data } = await Api.post('/auth/login', { email, senha });
sessionStorage.setItem('hiRH_user', JSON.stringify(data.usuario));
Api.setToken(data.access_token);
// Salvar refresh_token em cookie httpOnly (backend envia automaticamente)

// Logout
await Api.post('/auth/logout', { refresh_token });
sessionStorage.clear();

// Meu perfil
const { data: eu } = await Api.get('/auth/me');
```

---

### 👥 COLABORADORES

```js
// Listar com filtros e paginação
const res = await Api.get('/colaboradores?status=ativo&per_page=20&page=1&busca=João');
// res.data = array de colaboradores
// res.meta = { total, page, per_page, last_page }

// Buscar um
const { data: colab } = await Api.get(`/colaboradores/${id}`);

// Criar (admissão)
const { data: novo } = await Api.post('/colaboradores', {
  nome:           'Fulano de Tal',
  cpf:            '12345678901',
  data_admissao:  '2025-06-01',
  salario_base:   3500,
  regime:         'clt',
  departamento_id:'dept-comercial',
  cargo_id:       'cargo-vendedor',
  email_corporativo: 'fulano@empresa.com.br',
});

// Atualizar
await Api.put(`/colaboradores/${id}`, { salario_base: 4000, motivo_reajuste: 'Promoção' });

// Desligar
await Api.patch(`/colaboradores/${id}/desligar`, {
  tipo_rescisao: 'sem_justa_causa',
  data_demissao: '2025-06-30',
});

// KPIs
const { data: kpis } = await Api.get('/colaboradores/kpis');
// kpis = { total, ativos, ferias, turnover, ... }
```

---

### 📊 DASHBOARD

```js
const { data } = await Api.get('/dashboard');
// data.headcount = { total, ativos, ferias, afastados }
// data.movimentacoes = { admissoesMes, desligamentosMes, turnover }
// data.financeiro = { folha_bruto, folha_liquido }
// data.alertas = { solicitacoesPend, aniversariantesMes, ... }
// data.headcountHistorico = [{ mes, total }, ...]
```

---

### 💰 FOLHA DE PAGAMENTO

```js
// Abrir período
await Api.post('/folha/abrir', { competencia: '2025-06' });

// Calcular
await Api.post('/folha/PERIODO_ID/calcular');

// Aprovar
await Api.post('/folha/PERIODO_ID/aprovar');

// Holerite individual
const { data: hol } = await Api.get('/folha/holerite/2025-06/COLABORADOR_ID');
// hol = { colaborador, inss, irrf, fgts, total_bruto, total_liquido, ... }
```

---

### 🏖️ FÉRIAS

```js
// Solicitar
await Api.post('/ferias', {
  colaborador_id:  'colab-001',
  periodo_inicio:  '2024-01-01',
  periodo_fim:     '2024-12-31',
  gozo_inicio:     '2025-07-01',
  dias_solicitados: 30,
  dias_abono:       0,
});

// Aprovar (gestor/RH)
await Api.patch(`/ferias/${id}/aprovar`);

// Simulação sem persistir
const { data } = await Api.get('/ferias/simulacao?salario=3500&dias=30&dependentes=1');
```

---

### 📋 WORKFLOWS (Aprovações)

```js
// Criar solicitação
await Api.post('/workflows', {
  tipo:        'aprovacao_ferias',
  titulo:      'Solicitar 15 dias de férias em julho',
  aprovador_id: 'ID_DO_GESTOR',
  dados:        { colaborador_id: 'colab-001', dias: 15 },
});

// Listar pendentes
const { data } = await Api.get('/workflows?status=pendente');

// Aprovar
await Api.patch(`/workflows/${id}/aprovar`, { comentario: 'Aprovado!' });
```

---

### 🔔 NOTIFICAÇÕES

```js
// Listar
const { data: notifs } = await Api.get('/notificacoes?nao_lida=true');

// Marcar lida
await Api.patch(`/notificacoes/${id}/lida`);

// Marcar todas
await Api.patch('/notificacoes/todas/lidas');
```

---

### 📡 SOCKET.IO (Tempo real)

```js
// No frontend, adicionar:
// <script src="https://cdn.socket.io/4.7.5/socket.io.min.js"></script>

const socket = io('http://localhost:3001', {
  auth: { token: sessionStorage.getItem('_at') }, // access token
});

// Receber notificação em tempo real
socket.on('notification:new', (notif) => {
  // Atualiza badge no topo
  atualizarBadgeNotif(notif);
});

// Receber evento de aniversário
socket.on('aniversario:hoje', ({ nome }) => {
  Toast.info(`🎂 Hoje é aniversário de ${nome}!`);
});

// Ouvir feed ao vivo
socket.on('feed:novo_post', (post) => {
  prependarNoFeed(post);
});
```

---

## 🚀 Instalação e execução

```bash
cd backend

# 1. Instalar dependências
npm install

# 2. Copiar .env
cp .env.example .env
# Editar .env com suas configurações

# 3. Subir banco e Redis
npm run docker:up

# 4. Gerar cliente Prisma
npm run db:generate

# 5. Executar migrations
npm run db:migrate

# 6. Popular banco com dados iniciais
npm run db:seed

# 7. Iniciar em desenvolvimento
npm run dev

# Ou em produção com PM2
npm run pm2:start
```

## 🔑 Credenciais após seed

| Perfil      | Email                              | Senha       |
|-------------|------------------------------------|-------------|
| Admin       | admin.sistema@empresa.com.br       | Admin@2025  |
| RH          | admin@empresa.com.br               | admin123    |
| Analista    | analista@empresa.com.br            | analista123 |
| Gestor      | gestor@empresa.com.br              | gestor123   |
| Colaborador | colab@empresa.com.br               | colab123    |
| Jurídico    | juridico@empresa.com.br            | juridico123 |

## 📋 Variáveis .env obrigatórias

```env
DATABASE_URL=postgresql://postgres:senha@localhost:5432/hiconectarh
REDIS_URL=redis://localhost:6379
JWT_SECRET=minimo_32_caracteres_aqui_TROQUE
JWT_REFRESH_SECRET=outro_secret_diferente_TROQUE
```
