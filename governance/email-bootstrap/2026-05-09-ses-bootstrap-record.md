# SES bootstrap record — 2026-05-09

## Established
- AWS account: 049666818793 (region ap-south-1)
- SES domain identity: qorium.online (Verified=True, DkimStatus=SUCCESS)
- DKIM tokens (3, all live on Cloudflare):
  - roesn32foh2j4gxmd3t366nse3k6tflr
  - pw64uji46tmduen24oltmbar5revwujt
  - dtdfvqj7mzv2b33hbkmtqvqpnxneq7us
- SPF (apex TXT): v=spf1 include:amazonses.com include:spf.protection.outlook.com ~all
- DMARC (_dmarc TXT): v=DMARC1; p=quarantine; adkim=r; aspf=r; rua=mailto:bhaskar@talproindia.com
- Mail-FROM: qorium.qorium.online (PENDING — DNS not added)
- First test send MessageId: 0109019e0db57ded-9b4d2b4a-b54a-4b5e-bc1c-4a43c8a0e183-000000
  (noreply@qorium.online → bhaskar@talpro.in, landed in inbox with DKIM=pass)

## Blocked
- SES production access: DENIED (case 177825922400683)
  → Sandbox-only sending until appeal succeeds.
  → Decision tonight: pivot to Resend (or check VPS for existing alt provider).

## Orphaned / not in use
- Route 53 hosted zone Z01935403IG9EANDQ3QJV for qorium.online (created via
  terraform but Cloudflare remains the live DNS source — NS not switched).
