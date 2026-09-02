# Guia seguro — criar e conectar o Supabase do Pet em Casa

**Finalidade:** preparar um projeto Supabase para o GATE-03 sem compartilhar senhas ou chaves no chat.

**Importante:** siga somente as etapas desta página. Não execute migrations, não crie tabelas manualmente e não habilite integrações antes da aprovação do plano do GATE-03.

## O que será criado

Um projeto Supabase gratuito com banco PostgreSQL. Ele será usado primeiro para desenvolvimento e validação do MVP. O banco será separado da Vercel e não será exposto diretamente ao público.

## Parte A — criar a conta e o projeto pelo navegador

1. Abra [Supabase](https://supabase.com/dashboard) e crie uma conta ou entre com sua conta existente.
2. Crie ou selecione uma organização pessoal.
3. Clique em **New project**.
4. Preencha:
   - **Name:** `pet-em-casa-mvp`
   - **Database password:** crie uma senha longa e exclusiva. Guarde-a em um gerenciador de senhas; ela não deve ser enviada pelo chat.
   - **Region:** escolha a região mais próxima disponível para o Brasil ou para seus usuários.
   - **Plan:** gratuito, enquanto estivermos validando o MVP.
5. Confirme a criação e aguarde o projeto ficar disponível.

Ao terminar, informe apenas: **“Projeto Supabase criado”**. Não envie senha, chave, URL completa de banco ou capturas de tela com segredos.

## Parte B — o que cada credencial significa

| Dado | Onde ficará | Pode ir ao frontend? |
|---|---|---|
| Project URL | variável pública do frontend | Sim |
| Publishable key (ou chave `anon` legada) | variável pública do frontend | Sim, com RLS correto |
| Database password | gerenciador de senhas e prompt da CLI | Não |
| `service_role` / secret key | somente variáveis server-side da Vercel | Nunca |
| Personal access token da CLI | armazenamento seguro da CLI | Nunca |

Uma chave publicável não substitui RLS: ela pode ficar no aplicativo, mas as tabelas continuam protegidas por permissões e políticas do banco.

## Parte C — conexão local, feita conosco após sua confirmação

Depois de criar o projeto, faremos juntos estes passos. Você fará login no navegador quando a CLI pedir; não precisa me passar token.

### Parte C.1 - fallback para terminal nao interativo

Na tela de criacao do token, mantenha o acesso restrito ao projeto **PET-EM-CASA-MVP** e a expiracao de 7 dias. Em **Permissions**, nao deixe `Preset - No access`: abra **Project** e permita somente leitura/visibilidade do projeto; abra **Database** e permita leitura e escrita de migrations (`database_migrations_read` e `database_migrations_write`). Nao habilite Auth, Application services, Infrastructure and delivery, Secrets ou Storage. Se o painel usar nomes diferentes, escolha as permissoes equivalentes de leitura do projeto e migrations de banco.

Se o comando de login nao abrir o navegador, crie um token pessoal temporario no painel do Supabase: perfil, **Access Tokens**, criar token `pet-em-casa-cli-local`. Nunca envie o token pelo chat nem o salve em `.env`.

No mesmo terminal interativo, dentro da pasta do projeto, execute:

```powershell
$supabaseToken = Read-Host "Cole o token pessoal do Supabase" -AsSecureString
$supabaseTokenTexto = [System.Net.NetworkCredential]::new('', $supabaseToken).Password
$env:SUPABASE_ACCESS_TOKEN = $supabaseTokenTexto
npx supabase login --token $env:SUPABASE_ACCESS_TOKEN
npx supabase link --project-ref duftidhgewsxsplahmsp
Remove-Item Env:SUPABASE_ACCESS_TOKEN
```

A CLI pode pedir a senha do banco durante o vinculo. Digite-a somente no prompt local. Ao terminar, revogue o token em **Access Tokens** no painel.

### Terminal do servidor, dentro do projeto

```powershell
npx supabase login
npx supabase link --project-ref SEU_PROJECT_REF
```

O `SEU_PROJECT_REF` é o identificador curto visível no painel do projeto. O segundo comando poderá pedir a senha do banco; digite-a somente no prompt local. Ela não será colocada em arquivos, no histórico do chat ou em comandos copiados.

Quando houver migrations aprovadas, antes de aplicá-las será sempre executada uma prévia:

```powershell
npx supabase db push --dry-run
```

Somente após revisar o resultado e receber sua autorização explícita aplicaremos:

```powershell
npx supabase db push
```

### Terminal do servidor, fora do projeto

Nenhum comando é necessário.

### PowerShell do Windows, fora do projeto

Nenhum comando é necessário.

## Parte D — configuração futura das variáveis

Após o schema e o frontend existirem, será criado um arquivo local ignorado pelo Git com a URL do projeto e a chave publicável. As chaves de servidor serão configuradas somente no ambiente da Vercel, no GATE-04.

Não crie nem envie um `.env` agora. Faremos isso no Gate correspondente, com os nomes corretos e verificando que o arquivo está ignorado pelo Git.

## Como recuperar o Project Ref sem expor segredos

No painel do Supabase, abra o projeto. O identificador aparece nas configurações do projeto e também é parte da URL do painel. Você pode informar somente esse identificador no chat; ele não é uma senha.

## Se algo der errado

- Se esquecer a senha do banco, redefina-a pelo painel do projeto; não tente adivinhá-la.
- Se a CLI não abrir o navegador para login, pare e informe a mensagem exibida. Não cole tokens manualmente aqui.
- Se o projeto estiver pausado no plano gratuito, reative-o no painel antes de tentar vincular.
- Se uma tela pedir uma chave `service_role`, pare: ela não é necessária para conectar a CLI neste momento.

## Referências oficiais

- [Conectar ao banco PostgreSQL](https://supabase.com/docs/guides/database/connecting-to-postgres)
- [Supabase CLI: vincular um projeto](https://supabase.com/docs/reference/cli/supabase-link)
- [Segurança, permissões e RLS](https://supabase.com/docs/guides/database/postgres/row-level-security)
- [Entender chaves de API](https://supabase.com/docs/guides/getting-started/api-keys)
