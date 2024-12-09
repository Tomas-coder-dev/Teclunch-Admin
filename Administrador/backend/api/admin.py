from django.contrib import admin
from .models import AdminUsuario, Categoria, Item, Carta, CartaItem, Pedido, PedidoItem, Retroalimentacion, Transaccion

@admin.register(AdminUsuario)
class AdminUsuarioAdmin(admin.ModelAdmin):
    list_display = ('id_institucional', 'nombre', 'correo', 'is_admin', 'is_staff', 'is_superuser')
    search_fields = ('id_institucional', 'nombre', 'correo')
    list_filter = ('is_admin', 'is_staff', 'is_superuser')

admin.site.register(Categoria)
admin.site.register(Item)
admin.site.register(Carta)
admin.site.register(CartaItem)
admin.site.register(Pedido)
admin.site.register(PedidoItem)
admin.site.register(Retroalimentacion)
admin.site.register(Transaccion)
