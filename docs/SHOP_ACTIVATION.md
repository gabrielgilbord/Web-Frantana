# Activación futura de la tienda

Estado actual: **SHOP_ENABLED=false**. No hay ruta pública `/tienda`, ni enlace en nav/footer/sitemap.

## Ya preparado

- Modelos: productos, variantes, precios, stock, imágenes, categorías, pedidos
- API admin `/api/products`
- UI catálogo en `/admin/tienda`
- Schema SQL + RLS en Supabase
- Middleware que redirige `/tienda` al home si el flag está off

## Pasos obligatorios antes de cobrar

1. Cuenta Stripe + claves test/live
2. Checkout Session o Payment Element + webhooks firmados
3. Persistencia de `orders` con `stripe_payment_intent_id`
4. Impuestos (IVA) y facturas
5. Envíos (físicos) y/o entrega digital
6. Textos legales: aviso, privacidad, cookies, condiciones, devoluciones
7. Cumplimiento RGPD / consumidor UE
8. Pruebas E2E de compra, fallo de pago y reembolso
9. Activar `SHOP_ENABLED=true` y publicar nav + sitemap
10. Monitorización de webhooks e inventario

**No declarar la tienda “lista para cobrar” hasta completar y probar estos puntos.**
