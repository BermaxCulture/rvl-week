# Sistema de Ranking - RVL Week

## Visão Geral
Sistema completo de ranking de usuários baseado em pontos acumulados durante a jornada da RVL Week.

## Arquitetura

### Backend (Supabase)

**Tabela: profiles**
- `total_points` (INTEGER): Soma total de pontos do usuário (atualizado via trigger)
- `completed_days` (INTEGER): Quantidade de dias completos (quiz concluído)

**Triggers Automáticos:**
- `trigger_update_user_stats`: Atualiza automaticamente `total_points` e `completed_days` na tabela `profiles` sempre que há INSERT, UPDATE ou DELETE na tabela `progresso_usuario`.

**Funções RPC:**
1. `get_ranking(limit_count)`: Retorna o top N usuários ordenados por pontos e dias completos.
2. `get_user_rank(user_id)`: Retorna a posição específica de um usuário no ranking global.

### Frontend (React)

**Componente: Ranking.tsx**
- Localizado em `src/components/Ranking.tsx`.
- Exibe o Top 10 usuários com design premium.
- Medalhas exclusivas para o Top 3 (🏆 🥇 🥈 🥉).
- Animações fluidas com Framer Motion.
- Display de avatar (ou iniciais) e progresso de dias.

**Componente: UserRankPosition**
- Integrado ao final do Ranking.
- Mostra a posição atual do usuário logado e seu total de pontos.

## Como Funciona

1. **Ação do Usuário:** Ganha pontos ao assistir vídeos, scanear QR Code ou completar o quiz.
2. **Atualização do Banco:** O código faz o logic e envia para `progresso_usuario`.
3. **Trigger:** O Supabase detecta a mudança e sincroniza os pontos agregados na tabela `profiles`.
4. **Visualização:** A página Jornada renderiza o ranking puxando os dados via RPC `get_ranking`.

## Manutenção e Troubleshooting

### Recalcular manualmente (Se necessário):
```sql
UPDATE public.profiles p
SET total_points = COALESCE((SELECT SUM(pontos_acumulados) FROM public.progresso_usuario WHERE user_id = p.id), 0),
    completed_days = COALESCE((SELECT COUNT(*) FROM public.progresso_usuario WHERE user_id = p.id AND quiz_concluido = true), 0);
```

### Verificar Trigger:
```sql
SELECT * FROM information_schema.triggers WHERE trigger_name = 'trigger_update_user_stats';
```
