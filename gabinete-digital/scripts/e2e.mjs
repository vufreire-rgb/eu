// Teste de navegação ponta a ponta (Playwright). Uso: npm run build && npm start & npm run test:e2e
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const { chromium } = require("playwright");

const BASE = process.env.BASE_URL ?? "http://localhost:3000";
const PNG = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAAFUlEQVR42mP8z8BQz0AEYBxVSF+FABJADveWkH6oAAAAAElFTkSuQmCC", "base64");
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log("  ✔", m); } else { fail++; console.log("  ✘", m); } };

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 });
const page = await ctx.newPage();
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
page.on("console", (m) => m.type() === "error" && errors.push(m.text()));

const switchTo = async (role) => { await page.getByTestId("role-switcher").click(); await page.getByTestId(`role-${role}`).click(); await page.waitForTimeout(400); };
const noHScroll = async (name) => ok(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1), `sem rolagem horizontal: ${name}`);

console.log("1-4. Cidadão cria solicitação de iluminação com foto");
await page.goto(BASE + "/");
await page.getByTestId("enter-cidadao").click();
await page.waitForURL("**/cidadao/");
await noHScroll("início cidadão");
await page.getByTestId("cta-nova").click();
await page.getByTestId("next").click();
ok(await page.getByText("Selecione uma categoria").isVisible(), "validação da categoria");
await page.getByTestId("cat-iluminacao").click();
await page.getByTestId("next").click();
await page.locator("svg[role=img]").first().click({ position: { x: 150, y: 90 } });
ok(await page.getByTestId("bairro").inputValue() !== "", "mapa preencheu o bairro");
await page.getByTestId("bairro").selectOption("Centro");
await page.getByTestId("rua").fill("Rua das Palmeiras");
await page.getByTestId("numero").fill("120");
await page.getByTestId("next").click();
await page.getByTestId("descricao").fill("Poste com lâmpada queimada há duas semanas, rua muito escura à noite.");
await page.getByTestId("next").click();
await page.getByTestId("file-input").setInputFiles({ name: "poste.png", mimeType: "image/png", buffer: PNG });
await page.getByTestId("foto-preview").waitFor();
ok(true, "prévia da foto exibida");
await page.getByTestId("next").click();
await page.getByTestId("enviar").click();
await page.getByTestId("confirmacao").waitFor();
const protocolo = (await page.getByTestId("novo-protocolo").textContent())?.trim() ?? "";
ok(/^GD-\d{4}-\d{6}$/.test(protocolo), `protocolo gerado: ${protocolo}`);
await noHScroll("confirmação");

console.log("5-10. Vereadora atende");
await switchTo("vereadora");
await page.goto(BASE + "/gabinete/solicitacoes");
await page.getByTestId("search").fill(protocolo);
await page.getByTestId("row-link").first().click();
ok((await page.getByTestId("protocolo").textContent()) === protocolo, "solicitação recém-criada visível ao gabinete");
await page.getByTestId("responsavel").selectOption("ass-3");
await page.getByTestId("btn-oficio").click();
await page.getByTestId("oficio-preview").waitFor();
ok((await page.getByTestId("oficio-preview").textContent()).includes("MODELO DEMONSTRATIVO — SEM VALIDADE OFICIAL"), "ofício contém aviso demonstrativo");
ok((await page.getByTestId("oficio-preview").textContent()).includes(protocolo), "ofício preenchido com protocolo");
await page.getByTestId("oficio-salvar").click();
await page.getByText("Ofício 001/").first().waitFor({ timeout: 3000 }).catch(() => {});
await page.goBack();
await page.getByTestId("btn-status").click();
await page.getByTestId("novo-status").selectOption("encaminhada");
await page.getByTestId("status-desc").fill("Ofício enviado à Secretaria de Serviços Públicos solicitando avaliação.");
await page.getByTestId("status-confirm").click();
const NOTA = "NOTA-INTERNA-SECRETA-123";
await page.getByTestId("tab-notas").click();
await page.getByTestId("nota-input").fill(NOTA);
await page.getByTestId("nota-add").click();
await page.getByTestId("tab-conversa").click();
await page.getByTestId("message-input").fill("Olá! Encaminhamos sua solicitação à secretaria competente.");
await page.getByTestId("message-send").click();
await page.getByText("Encaminhamos sua solicitação").first().waitFor();
ok(true, "resposta enviada");
await noHScroll("detalhe gabinete (mobile)");

console.log("11-12. Cidadão vê resposta, status e notificação");
await switchTo("cidadao");
ok(Number(await page.getByTestId("bell-badge").textContent()) >= 1, "badge de notificações");
await page.goto(BASE + "/cidadao/notificacoes");
ok((await page.getByTestId("notifications").textContent()).includes("Encaminhada ao órgão responsável"), "notificação do novo status");
await page.getByTestId("notifications").getByText(protocolo).first().click();
await page.getByTestId("status-hint").waitFor();
const body = await page.locator("main").textContent();
ok(body.includes("Encaminhada ao órgão responsável"), "novo status exibido");
ok(body.includes("Encaminhamos sua solicitação"), "resposta do gabinete exibida");
ok(!body.includes(NOTA), "observação interna NÃO aparece ao cidadão");
await page.getByTestId("message-input").fill("Muito obrigado!");
await page.getByTestId("message-send").click();
await page.getByText("Muito obrigado!").waitFor();
ok(true, "cidadão envia mensagem complementar");

console.log("Persistência após recarregar");
await page.reload();
await page.getByTestId("status-hint").waitFor();
ok((await page.locator("main").textContent()).includes("Encaminhamos sua solicitação"), "resposta persiste após reload");
await switchTo("vereadora");
await page.goto(BASE + "/gabinete/solicitacoes");
await page.getByTestId("search").fill(protocolo);
ok((await page.getByTestId("tabela").textContent()).includes("Encaminhada"), "status persiste no painel");

console.log("Painel, kanban, mapa, comunicação, equipe, plataforma");
for (const [url, name] of [["/gabinete", "dashboard"], ["/gabinete/mapa", "mapa"], ["/gabinete/comunicacao", "comunicação"], ["/gabinete/equipe", "equipe"], ["/gabinete/oficios", "ofícios"], ["/cidadao/mandato", "mandato"], ["/privacidade", "privacidade"]]) {
  await page.goto(BASE + url); await page.waitForTimeout(500); await noHScroll(name);
}
await page.goto(BASE + "/gabinete/solicitacoes");
await page.getByTestId("view-kanban").click();
ok((await page.getByTestId("kanban-card").count()) > 0, "kanban com cartões");
await page.goto(BASE + "/gabinete");
ok((await page.getByTestId("kpis").textContent()).includes("81"), "dashboard soma a nova solicitação (81)");

await page.goto(BASE + "/gabinete/comunicacao");
await page.getByTestId("nova-pub").click();
await page.getByTestId("pub-titulo").fill("Vote em mim nas eleições");
await page.getByTestId("pub-resumo").fill("Peço seu voto");
await page.getByTestId("pub-corpo").fill("Campanha eleitoral do gabinete, vote em mim.");
await page.getByTestId("pub-salvar").click();
ok(await page.getByText("O conteúdo parece conter").isVisible(), "conteúdo eleitoral é bloqueado");
await page.getByTestId("pub-titulo").fill("Nova audiência pública sobre saúde");
await page.getByTestId("pub-resumo").fill("Audiência aberta à população");
await page.getByTestId("pub-corpo").fill("Audiência pública informativa sobre atendimento na rede de saúde.");
await page.getByTestId("pub-salvar").click();
await page.getByText("Nova audiência pública sobre saúde").first().waitFor();
await switchTo("cidadao");
await page.goto(BASE + "/cidadao/mandato");
await page.getByText("Nova audiência pública sobre saúde").first().waitFor({ timeout: 5000 }).catch(() => {});
ok(await page.getByText("Nova audiência pública sobre saúde").first().isVisible(), "publicação aparece ao cidadão");

await switchTo("admin");
await page.goto(BASE + "/plataforma/novo");
await page.getByTestId("t-nome").fill("Paulo Exemplo");
await page.getByTestId("t-mun").fill("Cidade Modelo");
await page.getByTestId("t-criar").click();
await page.getByTestId("tenant-ok").waitFor();
ok(true, "novo gabinete simulado criado");
await page.goto(BASE + "/plataforma/gabinetes");
ok((await page.getByTestId("tenants").textContent()).includes("Cidade Modelo"), "gabinete listado");

console.log("Restaurar dados");
await page.goto(BASE + "/");
await page.getByTestId("reset-demo").click();
await page.waitForTimeout(500);
await page.goto(BASE + "/gabinete/solicitacoes"); // sessão volta a cidadão após reset
const stillThere = await page.getByTestId("search").count();
await page.getByTestId("role-switcher").click(); await page.getByTestId("role-vereadora").click(); await page.waitForTimeout(400);
await page.goto(BASE + "/gabinete/solicitacoes");
await page.getByTestId("search").fill(protocolo);
ok((await page.getByText("Nenhuma solicitação encontrada").count()) === 1, `restauração remove dados criados (guard=${stillThere === 0 ? "ok" : "n/a"})`);

const real = errors.filter((e) => !/favicon|Failed to load resource/i.test(e));
ok(real.length === 0, `sem erros de console/página${real.length ? ": " + real.slice(0, 3).join(" | ") : ""}`);
await browser.close();
console.log(`\n${pass} ok, ${fail} falhas`);
process.exit(fail ? 1 : 0);
