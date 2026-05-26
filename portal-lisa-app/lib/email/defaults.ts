// Templates padrão por email_tipo — usados quando configuracao_sistema.usar_padrao=true
// Suportam variáveis {{variavel}} substituídas em render.ts

export interface EmailTemplate {
  assunto: string;
  corpo_md: string;
}

export const EMAIL_DEFAULTS: Record<string, EmailTemplate> = {
  confirmacao_submissao: {
    assunto: 'Recebemos sua inscrição no Catálogo LISA — Protocolo {{protocolo}}',
    corpo_md: `Olá, **{{coordenador_nome}}**!

Sua experiência **"{{experiencia_titulo}}"** foi recebida com sucesso pelo Portal LISA.

**Protocolo:** {{protocolo}}

Nossa equipe irá analisar a sua submissão e entraremos em contato em breve.

---
*Coordenação de Tecnologia Social — AGIR/UFF*
`
  },

  notificacao_admin: {
    assunto: '[LISA Admin] Nova experiência submetida — {{experiencia_titulo}}',
    corpo_md: `Nova experiência aguardando moderação no Portal LISA.

**Título:** {{experiencia_titulo}}
**Coordenador(a):** {{coordenador_nome}} ({{coordenador_email}})
**Protocolo:** {{protocolo}}

[Abrir no painel admin]({{admin_url}})
`
  },

  aprovacao: {
    assunto: 'Parabéns! Sua experiência foi selecionada para o Catálogo LISA 2026',
    corpo_md: `Olá, **{{coordenador_nome}}**!

Temos o prazer de informar que a experiência **"{{experiencia_titulo}}"** foi **aprovada** para integrar o Catálogo LISA 2026 de Tecnologias Sociais da AGIR/UFF.

O catálogo deste ano será publicado em formato bilíngue (PT/EN). Em breve você receberá um e-mail para revisar e validar a tradução automática do seu texto para o inglês.

Caso tenha dúvidas, entre em contato conosco.

---
*Coordenação de Tecnologia Social — AGIR/UFF*
`
  },

  rejeicao: {
    assunto: 'Resultado da avaliação da sua experiência no Portal LISA',
    corpo_md: `Olá, **{{coordenador_nome}}**!

Agradecemos o envio da experiência **"{{experiencia_titulo}}"** ao Portal LISA.

Após análise cuidadosa pela nossa equipe, infelizmente não foi possível incluí-la no Catálogo 2026 neste momento.

{{motivo_rejeicao}}

Se desejar, você poderá submeter novamente em edições futuras do catálogo.

---
*Coordenação de Tecnologia Social — AGIR/UFF*
`
  },

  solicitacao_atualizacao: {
    assunto: 'LISA — Solicitação de atualização da sua experiência',
    corpo_md: `Olá, **{{coordenador_nome}}**!

Gostaríamos de convidá-lo(a) a revisar e atualizar as informações da experiência **"{{experiencia_titulo}}"** no Portal LISA.

**[Clique aqui para acessar o formulário de atualização]({{link_atualizacao}})**

Este link é válido por {{dias_validade}} dias e é de uso exclusivo do(a) coordenador(a).

---
*Coordenação de Tecnologia Social — AGIR/UFF*
`
  },

  lembrete_atualizacao: {
    assunto: 'LISA — Lembrete: sua experiência aguarda atualização',
    corpo_md: `Olá, **{{coordenador_nome}}**!

Este é um lembrete de que a experiência **"{{experiencia_titulo}}"** ainda aguarda atualização no Portal LISA.

**[Acesse o formulário de atualização aqui]({{link_atualizacao}})**

O link expira em **{{dias_restantes}} dias**.

---
*Coordenação de Tecnologia Social — AGIR/UFF*
`
  },

  notificacao_inativacao: {
    assunto: 'LISA — Experiência inativada por falta de resposta',
    corpo_md: `Olá, **{{coordenador_nome}}**!

Como não recebemos resposta à solicitação de atualização enviada anteriormente, a experiência **"{{experiencia_titulo}}"** foi temporariamente **inativada** no Portal LISA.

Para reativar, entre em contato conosco em {{email_contato}}.

---
*Coordenação de Tecnologia Social — AGIR/UFF*
`
  },

  validacao_traducao: {
    assunto: 'LISA — Revise a tradução da sua experiência para o inglês',
    corpo_md: `Olá, **{{coordenador_nome}}**!

A tradução automática da experiência **"{{experiencia_titulo}}"** para o inglês foi gerada e aguarda sua validação.

Por favor, revise o texto e escolha uma das opções abaixo:

**[✅ Aprovar tradução]({{link_aprovar}})**

**[✏️ Quero editar o texto]({{link_editar}})**

Este link é válido por {{dias_validade}} dias.

---
*Coordenação de Tecnologia Social — AGIR/UFF*
`
  }
};

// Variáveis fake para envio de teste
export const FAKE_VARS: Record<string, string> = {
  coordenador_nome: '[Nome Teste]',
  coordenador_email: 'coordenador@exemplo.com',
  experiencia_titulo: '[Título da Experiência de Teste]',
  protocolo: 'LISA-2026-0001',
  motivo_rejeicao: '',
  admin_url: 'http://localhost:3000/admin-lisa-xyz',
  link_atualizacao: 'http://localhost:3000/atualizar/TOKEN_TESTE',
  link_aprovar: 'http://localhost:3000/validar/TOKEN_TESTE?acao=aprovar',
  link_editar: 'http://localhost:3000/atualizar/TOKEN_TESTE',
  dias_validade: '30',
  dias_restantes: '15',
  email_contato: 'tecsocial@agir.uff.br'
};
