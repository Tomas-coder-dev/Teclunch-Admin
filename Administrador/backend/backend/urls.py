# src/urls.py

from django.contrib import admin
from django.urls import path, include
from rest_framework import routers
from api import views

# Crear una instancia del router predeterminado de DRF
router = routers.DefaultRouter()

# Registrar los ViewSets con el router
router.register(r'admin-usuarios', views.AdminUsuarioViewSet, basename='adminusuario')
router.register(r'categorias', views.CategoriaViewSet, basename='categoria')
router.register(r'items', views.ItemViewSet, basename='item')
router.register(r'cartas', views.CartaViewSet, basename='carta')
router.register(r'cartaitems', views.CartaItemViewSet, basename='cartaitem')
router.register(r'pedidos', views.PedidoViewSet, basename='pedido')  # Incluye la acción 'bulk_create'
router.register(r'retroalimentacion', views.RetroalimentacionViewSet, basename='retroalimentacion')
router.register(r'transacciones', views.TransaccionViewSet, basename='transaccion')

urlpatterns = [
    # Ruta para el panel de administración de Django
    path('admin/', admin.site.urls),
    
    # Incluir todas las rutas generadas por el router bajo el prefijo 'api/'
    path('api/', include(router.urls)),
    
    # Ruta para el Chatbot dentro de 'api/'
    path('api/chatbot/', views.ChatbotView.as_view(), name='chatbot'),
    
    # Ruta para obtener el token de autenticación
    path('api/auth/login/', views.CustomObtainAuthToken.as_view(), name='api_token_auth'),
]

# Para servir archivos de medios durante el desarrollo
from django.conf import settings
from django.conf.urls.static import static

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
