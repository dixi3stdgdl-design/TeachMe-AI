# Cabeceras de seguridad para tooltip-ai.com
# Aplicar en Azure Front Door / App Service → Response headers

Content-Security-Policy: default-src 'self'; img-src 'self' data: https:; style-src 'self' 'unsafe-inline'; script-src 'self'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: geolocation=(), microphone=(), camera=()
Cross-Origin-Opener-Policy: same-origin
X-DNS-Prefetch-Control: off

# TLS mínimo 1.2 (ideal 1.3)
# HTTPS Only = true
# Min TLS = 1.2
