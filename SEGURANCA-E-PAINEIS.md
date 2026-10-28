# GamaMC — arquitetura de acesso privado e publicação

Este repositório (GamaMCc) é um **site público estático** implantado na Vercel. Nenhum arquivo HTML, CSS ou JavaScript neste repositório pode proteger um painel administrativo real, porque tudo que é entregue ao navegador é visível para visitantes. Ocultar um link não protege um painel. A retirada do atalho "Área da equipe" do rodapé é apenas redução de exposição, **não uma alteração no acesso ao Railway**.

## Situação atual — limites confirmados

- O painel existente permanece em `https://gamamc-site-production.up.railway.app/admin.html`. Seu funcionamento e as regras reais de autenticação não foram auditados aqui, pois o código de backend não está neste repositório.
- **Não foi feita qualquer promessa ou ativação de controle de acesso ao backend da Railway.**
- O portal público não armazena tokens, senhas, CPF, documentos, comprovantes ou dados pessoais. `portal-publico.json` contém apenas conteúdo público.
- Não inventar contagem de jogadores ou IP. A integração com o Minecraft deve ter uma API somente leitura, sem expor RCON, credenciais ou porta administrativa.
- As candidaturas usam o e-mail oficial; não há coleta de currículos via formulário sem backend validado.
- As notícias são editadas via GitHub; a alteração passa pelo histórico de commits. Não existe CMS administrativo público.

## Mecanismo recomendado para o painel financeiro/comercial

1. **Isolamento:** manter checkout público na Railway e colocar as rotas administrativas atrás de um subdomínio e serviço separados (por exemplo, `equipe.gamamc.com`), com firewall de acesso ou proxy que faça autenticação ANTES de encaminhar requisições. O painel não pode ser disponibilizado diretamente pelo host de origem contornando o proxy.
2. **Autenticação no servidor:** contas individualizadas para Gael e Gabriel Matoso (e demais usuários autorizados); exigir MFA/TOTP ou passkey. Nunca usar senhas compartilhadas, lógica de login apenas no JavaScript, ou "segredo" em query string.
3. **Autorização por função:** políticas de menor privilégio. CEOs podem administrar; financeiro acessa registros financeiros permitidos; comercial somente seus recursos; moderadores não acessam dados financeiros. Todas as verificações também devem existir em cada endpoint de API.
4. **Sessão segura:** cookies `HttpOnly`, `Secure`, `SameSite=Lax/Strict`; expiração; logout e revogação; proteção CSRF se sessões por cookie. Todas as rotas administrativas retornam 401/403 quando não autorizadas.
5. **Origem protegida:** desativar/bloquear a URL pública antiga do painel ou exigir o mesmo middleware de login, inclusive para `/admin.html`, `/api/admin/*`, uploads e listagens. Esconder botão ou acrescentar robots.txt NÃO fornece segurança.
6. **Proteções adicionais:** HTTPS, rate limit contra tentativas, logs de auditoria com retenção controlada, backups, validação de upload, armazenamento privado, rotação de credenciais, revisões de permissões e plano de recuperação.
7. **Dados e fornecedores:** a infraestrutura/serviço de autenticação pode ter acesso técnico controlado conforme contratos e permissões; não existe garantia literal de "zero terceiros" em hosting gerenciado. Restrinja administradores e fornecedores, audite acessos e políticas LGPD.
8. **Implantação:** mudanças no painel exigem acesso autorizado ao repositório ou configuração da Railway, testes de autorização e de acesso por uma sessão não autenticada. Não afirmar que está seguro sem esses testes.

## Como ligar funcionalidades no futuro

- Status do Minecraft: um serviço backend sob controle da administração consulta a instância, expõe apenas `online`, `players` e versão em endpoint público, com cache e limite de frequência. Endpoints de escrita/RCON permanecem privados.
- Clãs e rankings: plugin de servidor publica dados públicos agregados em API somente leitura; nenhuma consulta pública toca no banco operacional diretamente.
- CMS/notícias e recrutamento: API autenticada por função e uploads privados (currículos) com antivírus, limites de tamanho e retenção informada.
- Métricas: privilegiar monitoramento próprio/first-party, coletar só o necessário e publicar política de privacidade antes de registrar identificadores persistentes.

## Checklist de aceitação do backend antes de uso com dados reais

- [ ] Acesso sem login bloqueado tanto no domínio final quanto na origem Railway.
- [ ] MFA de todos os administradores configurada e recuperação segura.
- [ ] Usuário comercial não consegue abrir endpoints financeiros por URL direta.
- [ ] Logs, limites de requisição, cookies e CSRF verificados.
- [ ] Nenhum segredo de backend no GitHub ou HTML.
- [ ] Teste de revogação de acesso realizado.
- [ ] Backup restaurável e política LGPD revisada.

**Até a conclusão desses controles, não inserir documentos sensíveis novos em um painel cuja autorização não tenha sido validada.**
