# Alterações no Componente Missions - Guia de Implementação

## O que foi implementado no Frontend

### 1. **Edição da Meta Missionária Mensal**

- Clique no botão "Meta: R$ 2000" para editar o valor
- O campo será trocado por um input onde você pode digitar a nova meta
- Botões "Salvar" (✓) e "Cancelar" (X) aparecem
- A meta é salva via API chamando: `PATCH /settings { missionTarget: newValue }`

### 2. **Edição Completa de Projetos**

- Clique no botão "Definir Projetos" para entrar em modo de edição
- Cada projeto exibe:
  - **Campo de Nome**: edite o nome do projeto (ex: "Missões Mundiais")
  - **Campo de Percentual**: defina quanto do saldo vai para cada projeto
  - **Botão Deletar**: remova projetos indesejados
- **Adicionar Novo Projeto**: clique em "Adicionar Projeto" para criar um novo
- **Validação**: A soma das porcentagens deve ser exatamente 100%
- **Salvar**: Ao clicar em "Salvar", envia para a API: `PATCH /settings { missionProjects: [...] }`

### 3. **Estrutura de Dados**

```typescript
interface MissionProject {
  name: string // Ex: "Missões Mundiais"
  percentage: number // 0-100, percentual do saldo
}

interface AppData {
  // ... outros campos
  missionTarget: number // Meta mensal
  missionProjects: MissionProject[] // Projetos customizáveis
}
```

---

## O que PRECISA ser feito no BACKEND

### 1. **Adicionar campos ao modelo de Settings/Configuration**

Se você tem uma tabela de `settings` ou `configuration`, adicione:

```prisma
model Settings {
  id        String   @id @default(cuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id])

  missionTarget    Int                 @default(2000)
  missionProjects  Json                @default("[]")  // Array JSON

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

### 2. **Atualizar/Criar o endpoint PATCH /settings**

O frontend está enviando requisições assim:

```javascript
// Para atualizar a meta
PATCH /api/settings
{
  "missionTarget": 3000
}

// Para atualizar os projetos
PATCH /api/settings
{
  "missionProjects": [
    { "name": "Missões Mundiais", "percentage": 50 },
    { "name": "Projetos Estaduais", "percentage": 30 },
    { "name": "Ajuda Nacional", "percentage": 20 }
  ]
}
```

### 3. **Exemplo de implementação no Express/Nest**

#### Express.js:

```javascript
app.patch("/api/settings", authenticate, async (req, res) => {
  try {
    const userId = req.user.id
    const { missionTarget, missionProjects } = req.body

    const settings = await Settings.findOne({ userId })

    if (missionTarget) settings.missionTarget = missionTarget
    if (missionProjects) settings.missionProjects = missionProjects

    await settings.save()

    res.json(settings)
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
})
```

#### Nest.js com Prisma:

```typescript
@Patch('settings')
async updateSettings(@Req() req, @Body() data: UpdateSettingsDto) {
  return this.prisma.settings.upsert({
    where: { userId: req.user.id },
    update: data,
    create: { userId: req.user.id, ...data }
  });
}
```

### 4. **Atualizar o endpoint GET /settings (ou include no fetchAppData)**

Quando carrega os dados iniciais, certifique-se que retorna:

```json
{
  "missionTarget": 2000,
  "missionProjects": [
    { "name": "Missões Mundiais", "percentage": 40 },
    { "name": "Ação Social Local", "percentage": 30 },
    { "name": "Fundo de Emergência", "percentage": 30 }
  ]
}
```

### 5. **Validações Recomendadas no Backend**

```javascript
// Validar que a soma dos percentuais = 100
if (Array.isArray(projects)) {
  const total = projects.reduce((sum, p) => sum + (p.percentage || 0), 0)
  if (total !== 100) {
    throw new Error("Percentuais devem somar 100%")
  }
}

// Validar que todos os projetos têm nome
if (projects.some(p => !p.name || !p.name.trim())) {
  throw new Error("Todos os projetos devem ter nome")
}

// Validar que meta é positiva
if (missionTarget && missionTarget <= 0) {
  throw new Error("Meta deve ser maior que 0")
}
```

---

## Resumo das Mudanças no Frontend

### Arquivos Modificados:

1. **types.ts** - Adicionado `MissionProject` interface e `missionProjects` em `AppData`
2. **constants.ts** - Adicionado `missionProjects` ao `INITIAL_DATA`
3. **components/Missions.tsx** - Implementada toda a lógica de edição
4. **App.tsx** - Adicionado prop `onUpdate` ao componente Missions

### Funcionalidades:

- ✅ Edição da meta mensal clicando no botão de meta
- ✅ Adição/edição/remoção de projetos missionários
- ✅ Validação de porcentuais (soma deve ser 100%)
- ✅ Integração com API via `PATCH /settings`
- ✅ Atualização do estado local quando salvo

---

## Próximos Passos

1. Implemente o endpoint `PATCH /settings` no seu backend
2. Atualize a tabela de `settings` para incluir os campos `missionTarget` e `missionProjects`
3. Ajuste o endpoint `GET /settings` (ou o que carrega os dados) para retornar esses campos
4. Teste editando a meta e os projetos no dashboard
5. Verifique se os dados persistem após logout/login
