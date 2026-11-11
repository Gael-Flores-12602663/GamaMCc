# GamaMC — auditoria de segurança e proposta de implementação

Data: 11/11/2026. Situação geral: **Em andamento**. Recomendação: **não publicar ainda**.

Este relatório descreve o que foi efetivamente verificado nesta execução. Não constitui certificação independente nem auditoria completa encerrada. Nenhuma alteração foi publicada em produção, nenhuma permissão foi alterada e nenhum pedido real foi modificado.

## Referências recuperáveis e arquitetura

- Loja/painel: `Gael-Flores-12602663/gamamc-site`, base imutável `bcb163049bc57d732c7b88533122c058ba9a6a59`.
- Portal: `Gael-Flores-12602663/GamaMCc`, base `2515a17079f4a524c38d53c4c5405989800c0bbf`.
- Branch nos dois repositórios: `security/auditoria-2026-11-11`. Os commits base continuam recuperáveis. Isso é referência de código, não backup novo dos dados reais.
- Produção Railway: projeto `appealing-fulfillment`, serviço `gamamc-site`, branch `main`, último deploy observado `45aa227b-f2eb-4fe6-8463-9b32cc56e135` de 10/11/2026. Express, sessões SQLite e banco SQLite em `/app/data`; bucket privado de backups identificado, restauração real não executada.
- Homologação Railway existente: `gamamc-ryvix-homologacao`, serviço `central-ryvix-homologacao`, branch `feat/gestao-candidaturas`. Não foi redirecionada nem teve dados substituídos. Os testes desta proposta usaram base temporária sintética local.
- Roteamento do portal: `vercel.json` encaminha loja, APIs, autenticação e painel ao domínio Railway; regras encaminhadas a `gamamcregras.vercel.app`. Produção respondeu com conteúdo correspondente ao portal analisado. A configuração interna da Vercel permanece sem confirmação por falta de autorização da equipe.
- Host principal redireciona para `www.gamamc.com`. Railway lista apenas `gamamc-site-production.up.railway.app`, porta 8080, sem domínio customizado ligado diretamente ao serviço.

## Achados e correções

| Item | Gravidade | Evidência / ação | Situação |
|---|---|---|---|
| Outras sessões continuam após troca de senha | Alta | `server.js`, rota `/api/staff/password`: agora incrementa `session_rev`, preservando somente a sessão atual com revisão nova. Teste com dois logins confirma revogação do anterior. | Concluído em desenvolvimento |
| MFA pendente sobrevivia à redefinição da senha | Alta | Revisão da conta capturada no início do desafio e conferida em verify/resend. Desafio anterior à alteração da revisão retorna 401. | Concluído em desenvolvimento |
| Cache de respostas privadas sem política global | Média | Middleware `/api` aplica `Cache-Control: no-store`; rota pública de notícias mantém cache público explicitamente previsto. | Concluído em desenvolvimento |
| Defesa de origem incompleta | Média | Bloqueio adicional de `Sec-Fetch-Site: cross-site`, validação do protocolo do Origin e exigência de HTTPS em produção. Não equivale a token CSRF universal. | Concluído em desenvolvimento |
| Cabeçalhos ausentes no portal público | Média | Resposta pública sem CSP/X-Frame-Options/nosniff; proposta acrescenta cabeçalhos globais e CSP na raiz do portal. Não amplia CSP a todos os proxys sem teste. | Em andamento: falta navegador e preview |
| Inventário de rotas divergente | Baixa | Matriz existente não correspondia ao código base. Regenerada a partir das rotas atuais; teste direcionado passa. | Concluído em desenvolvimento |
| Falhas preexistentes em testes RyviX/Suporte | Alta para liberação | Rotas RyviX estão desativadas com 404 na base; testes esperam funcionamento. Há ainda falhas de consulta e transição de atendimento no Suporte. Não reativadas nem alteradas permissões sem investigação. | Pendente |
| Artefatos binários ausentes da cópia de testes | Limitação do teste | Cópia local trouxe 96 arquivos textuais, sem imagens binárias. Teste de estrutura falha por banner ausente; arquivos de imagem originais permanecem na árvore remota e não são removidos pela proposta. | Pendente de cópia completa |

## Matriz de verificações

| Controle | Resultado observado | Situação |
|---|---|---|
| HTTPS e redirecionamento | HTTP encaminhou até `https://www.gamamc.com/`; loja respondeu via HTTPS. | Concluído na observação externa |
| HSTS | Portal `max-age=63072000`; loja `max-age=31536000; includeSubDomains`. | Concluído na observação externa |
| Validade, emissor e cadeia do certificado de origem | Socket direto falhou por DNS; curl atravessa proxy com certificado emitido por OpenAI. Esse certificado não é o certificado real do GamaMC. Datas e renovação de origem não foram confirmadas. | Pendente |
| CSP e clickjacking da loja | CSP restrita a self, `frame-ancestors 'none'`, object-src none; Helmet ativo. | Concluído na leitura e resposta externa |
| Cookies | Código configura HttpOnly, SameSite lax, Secure em produção, validade de 8h. Cookie real de produção e configuração TRUST_PROXY não inspecionados. | Em andamento |
| Autenticação Discord | State aleatório, PKCE, expiração e regeneração de sessão identificados. Login real externo não executado. | Em andamento |
| MFA e recuperação | TOTP com prevenção de replay, recuperação consumível e desafio por e-mail; tokens de reset com hash, expiração e uso único. Teste SMTP local existente passa; envio real não disparado. Ativação efetiva por usuário e MFA das contas GitHub/Vercel/Railway não verificados. | Em andamento |
| Permissões | Política dos seis cargos preservada; contratos e candidaturas passam testes direcionados; matriz integral de Suporte/RyviX não passa. | Em andamento |
| SQL Injection / entradas | Consultas revisadas usam parâmetros vinculados; validações de nick, planos e status identificadas. Não se afirma cobertura de todos os caminhos possíveis. | Em andamento |
| XSS | CSP no backend e uso de conteúdo limitado identificados. Revisão de todos os sinks e navegador pendentes. | Em andamento |
| CSRF | Contratos, suporte, auditoria e candidaturas têm tokens próprios; mutações gerais contam com Origin/SameSite/Fetch Metadata. Ausência de Origin em cliente não navegador continua aceita; teste completo por fluxo pendente. | Em andamento |
| Rate limiting | Login, MFA, e-mail e pedidos possuem limites em memória; comportamento real com proxy não confirmado. | Em andamento |
| Administração e dados privados | Acesso anônimo a `/api/admin/users` retorna 401 no ambiente isolado. Não equivale à validação de todos os endpoints. | Em andamento |
| Dependências | `npm ci` concluído; `npm audit --json`: 0 vulnerabilidades conhecidas em 161 dependências na consulta desta data. Não é garantia de ausência de falhas. | Concluído nesta consulta |
| CORS | Notícias públicas permitem origem gamamc.com; portal estático retornou `*`. Não foi observado CORS credenciado universal. | Em andamento |
| Pagamentos e preços | Planos e preços selecionados no backend; pedidos iniciam pendentes; pagamento manual por ticket. Não existe cobrança automática nesta implementação inspecionada. Fluxo completo sintético de compra ainda pendente. | Em andamento |
| Webhook de gateway de pagamento | Não identificado gateway automático no código analisado. Webhook Discord de notificação existe, sem credenciais exibidas no relatório. | Não aplicável ao gateway atual |
| CPF | Não há campo CPF no checkout atual revisado. Não foi criado novo campo nem acessado banco real. | Não aplicável ao checkout inspecionado |
| LGPD, retenção e backups | Política pública disponível, auditoria mascara campos e uploads ficam protegidos; prazos operacionais, descarte, fornecedores e restauração real de backup não validados. Não se declara conformidade jurídica integral. | Pendente |
| Domínios e integrações | GitHub/Railway acessíveis; Vercel exige autorizar equipe. Inventário completo de DNS, subdomínios e configurações das contas permanece pendente. | Em andamento |

## Selo e página pública

Preparados em ambos os repositórios: página `/seguranca`, folhas CSS locais e escudo vetorial próprio. Rodapés do portal, loja e comércios recebem link discreto preto/laranja. O texto explica HTTPS, domínio, privacidade, golpes, contato e ausência de certificação independente. Não usa logotipo de terceiro, número de certificado, nota inventada ou promessa de segurança absoluta.

O servidor Express serve `/seguranca` por extensão HTML, validado com resposta 200. O portal inclui rewrite local explícito. Situação: **Em andamento**, pois falta validação visual e navegação no ambiente remoto. Chromium não iniciou por restrição de socket neste executor; não há evidência visual de responsividade ainda.

## Certificação externa e custos

Fontes oficiais consultadas em 11/11/2026:

| Solução | Processo e verificação | Custo e limite | Situação |
|---|---|---|---|
| TrustedSite | Conta, registro do domínio, varredura e aprovação; selo autorizado após validação, diretório e página pública do fornecedor. Confirmar requisitos de identidade durante cadastro. | Plano gratuito: selo flutuante até 500 visitas/mês; desaparece ao atingir limite e retorna no mês seguinte. Pro tem preço por tráfego e cobrança de excedentes; valor aplicável não confirmado. | Pendente de cadastro/validação |
| Site Blindado / Conviso | Contratação, scan e regras do selo. Confirmar link público de verificação e documentação antes de incorporar. | Reputation R$399/mês; Protection R$699/mês anunciados. Renovação e condições contratuais precisam ser confirmadas. | Pendente, requer aprovação para contratar |
| Qualys SSL Labs | Análise pública gratuita de TLS; útil como evidência técnica, não certificação geral da aplicação ou selo de loja. | Gratuito. Nenhuma nota do GamaMC foi emitida nesta execução. | Pendente de avaliação externa |

Fontes: https://www.trustedsite.com/start ; https://www.trustedsite.com/get-started/ ; https://www.trustedsite.com/certified-secure ; https://siteblindado.com/produtos/blindagem-de-sites ; https://www.ssllabs.com/ssltest/ .

Recomendação: começar pelo TrustedSite gratuito, após regressão satisfatória e validação do domínio. Nenhuma conta foi cadastrada, documento enviado, contrato aceito ou serviço pago. A integração está preparada como página transparente sem certificação declarada. Script externo permanece ausente: inserir código oficial somente após aprovação do fornecedor e revisão de CSP/privacidade. Não há instalação externa concluída.

## Testes e evidências reproduzíveis

- `node --check server.js`: passou.
- `node --test tests/security.test.js tests/audit-schema.test.js tests/mfa.test.js tests/management.test.js tests/contracts.test.js tests/applications.test.js`: **13/13 passaram**.
- Teste novo usa banco temporário, duas sessões e desafio MFA sintéticos. Confirma troca de senha, revogação, cache privado, origem externa, 401 administrativo e 200 de segurança.
- Suíte completa inicial da proposta: 48 testes, 34 passaram, 14 falharam; após atualização da matriz: **48 testes, 35 passaram, 13 falharam**. Não está aprovada para publicação.
- Comparação com server original: 48 testes, 33 passaram, 15 falharam (incluindo o teste novo, que reproduz a vulnerabilidade). Mesmos grupos preexistentes falham; não houve ocultação nem exclusão de testes.
- Instalação e testes não utilizaram banco, senhas ou cobranças de produção.

## Arquivos modificados

Loja: `server.js`, `tests/security.test.js`, `docs/audit-route-inventory.json`, este relatório, `public/index.html`, `public/comercios.html`, `public/security.css`, `public/security-badge.css`, `public/security-shield.svg`, `public/seguranca.html`.
Portal: `index.html`, `vercel.json`, `security.css`, `security-badge.css`, `security-shield.svg`, `seguranca.html` e cópia deste relatório.

## Pendências e publicação

1. Autorizar acesso Vercel à equipe para concluir inventário de projeto, previews e domínio. Link temporário já apresentado; pode ser necessário emitir outro.
2. Concluir investigação das falhas existentes em RyviX/Suporte, com cópia completa de assets e teste integral dos seis cargos. Não alterar permissões para simplesmente satisfazer testes antigos.
3. Validar preview e ambiente remoto isolado: desktop/celular, CSP, login Discord, e-mail, MFA, recuperação, fluxo completo de pedido sem pagamento e regressão dos painéis.
4. Obter validade real dos certificados sem proxy e revisar DNS/subdomínios e proteção das contas de infraestrutura.
5. Revisar retenção, descarte, acesso aos backups e restauração com dados sintéticos.
6. Após testes satisfatórios, solicitar aprovação final do proprietário para publicar. Não pedir aprovação de produção enquanto estes bloqueios continuarem.

Nenhuma certificação externa está válida ou instalada por efeito deste trabalho. O projeto inteiro permanece **Em andamento** e a publicação está **Pendente**.
