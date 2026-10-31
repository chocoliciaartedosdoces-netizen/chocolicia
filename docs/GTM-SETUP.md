# Configuração do Google Tag Manager

## Estratégia atual

O site carrega somente o contêiner `GTM-P76PMH52`. A função `gtag()` é definida no HTML e coloca comandos no `dataLayer` como objetos `arguments`. Os eventos de conversão (`whatsapp_click`, `phone_click`, `email_click` e `generate_lead`) usam `gtag("event", ...)` uma única vez.

Não crie tags de evento personalizado para esses quatro nomes: isso duplicaria eventos quando a Google tag/GA4 estiver configurada. Se a equipe preferir usar tags de evento no GTM, será necessário alterar o código para emitir eventos personalizados com um contrato diferente e remover o envio direto correspondente.

## Configuração recomendada

1. No GTM, crie uma **Google tag** com o ID `G-V7SP1DKR6V`.
2. Dispare-a em **Initialization – All Pages**.
3. Configure `send_page_view` como `false`, porque o site envia `page_view` no carregamento inicial e em cada troca de rota SPA.
4. No GA4, marque `whatsapp_click`, `phone_click`, `email_click` e `generate_lead` como eventos principais.
5. Use **Visualizar** no GTM para confirmar que cada ação aparece uma vez.
6. Confirme os mesmos eventos no DebugView do GA4.
7. Vincule o GA4 à conta Google Ads `633-794-1439` e importe os eventos principais como conversões.
8. Publique a versão do contêiner em **Enviar**.

## Consent Mode

O HTML define `ad_storage`, `ad_user_data`, `ad_personalization` e `analytics_storage` como `denied` antes do snippet do GTM. O banner atualiza esses estados somente após a escolha do visitante.
