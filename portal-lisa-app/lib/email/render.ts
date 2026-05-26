// Renderiza Markdown → HTML e injeta no layout padrão LISA
import { marked } from 'marked';

/**
 * Substitui variáveis {{chave}} no texto por seus valores.
 */
export function substituirVars(texto: string, vars: Record<string, string>): string {
  return texto.replace(/\{\{(\w+)\}\}/g, (_, key) => vars[key] ?? `{{${key}}}`);
}

/**
 * Renderiza Markdown para HTML — usa marked de forma síncrona.
 */
export function markdownToHtml(md: string): string {
  // marked pode retornar string ou Promise dependendo da versão;
  // forçamos síncrono via parse com opção async: false (v5+)
  const result = marked.parse(md, { async: false });
  return result as string;
}

/**
 * Envolve o HTML do corpo no layout padrão com header/footer LISA.
 */
export function wrapLayout(bodyHtml: string, assunto: string): string {
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(assunto)}</title>
  <style>
    body { margin: 0; padding: 0; background: #f4f4f0; font-family: 'Inter', Arial, sans-serif; color: #1a1a1a; }
    .wrapper { max-width: 600px; margin: 40px auto; background: #ffffff; border: 1px solid #e0e0da; }
    .header { background: #1a1a1a; padding: 24px 32px; }
    .header-logo { color: #e8d97b; font-size: 22px; font-weight: 700; letter-spacing: -0.5px; }
    .header-sub { color: rgba(255,255,255,0.5); font-size: 11px; text-transform: uppercase; letter-spacing: 2px; margin-top: 4px; }
    .body { padding: 32px; line-height: 1.7; font-size: 15px; }
    .body h1, .body h2, .body h3 { color: #1a1a1a; }
    .body a { color: #2563eb; }
    .body strong { font-weight: 600; }
    .body hr { border: none; border-top: 1px solid #e0e0da; margin: 24px 0; }
    .body p { margin: 0 0 16px; }
    .footer { background: #f4f4f0; padding: 20px 32px; border-top: 1px solid #e0e0da; }
    .footer p { margin: 0; font-size: 12px; color: #888; line-height: 1.6; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <div class="header-logo">LISA</div>
      <div class="header-sub">Portal de Tecnologias Sociais — AGIR/UFF</div>
    </div>
    <div class="body">
      ${bodyHtml}
    </div>
    <div class="footer">
      <p>Este e-mail foi enviado automaticamente pelo Portal LISA.<br/>
      Coordenação de Tecnologia Social — AGIR/UFF<br/>
      Universidade Federal Fluminense</p>
    </div>
  </div>
</body>
</html>`;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * Pipeline completo: substitui vars → Markdown → HTML → layout.
 */
export function renderEmail(
  corpo_md: string,
  assunto: string,
  vars: Record<string, string>
): { html: string; assunto: string } {
  const assuntoFinal = substituirVars(assunto, vars);
  const corpoComVars = substituirVars(corpo_md, vars);
  const bodyHtml = markdownToHtml(corpoComVars);
  const html = wrapLayout(bodyHtml, assuntoFinal);
  return { html, assunto: assuntoFinal };
}
