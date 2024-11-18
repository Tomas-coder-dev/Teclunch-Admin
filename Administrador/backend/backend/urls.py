# project/urls.py

from django.contrib import admin
from django.urls import path, include
from rest_framework import routers
from api import views
# from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

router = routers.DefaultRouter()
router.register(r'usuarios', views.UsuarioViewSet, basename='usuario')
router.register(r'categorias', views.CategoriaViewSet, basename='categoria')
router.register(r'items', views.ItemViewSet, basename='item')
router.register(r'cartas', views.CartaViewSet, basename='carta')
router.register(r'cartaitems', views.CartaItemViewSet, basename='cartaitem')
router.register(r'reservas', views.ReservaViewSet, basename='reserva')
router.register(r'pedidos', views.PedidoViewSet, basename='pedido')
router.register(r'retroalimentacion', views.RetroalimentacionViewSet, basename='retroalimentacion')
router.register(r'transacciones', views.TransaccionViewSet, basename='transaccion')
router.register(r'carrito', views.CarritoViewSet, basename='carrito')

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include(router.urls)),  # Rutas de la API

    # Endpoints de autenticación JWT (comentados temporalmente)
    # path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    # path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    # Autenticación de la API navegable de Django REST Framework
    path('api-auth/', include('rest_framework.urls', namespace='rest_framework')),

    # Ruta para el Chatbot
    path('chatbot/', views.ChatbotView.as_view(), name='chatbot'),
]

# Para servir archivos de medios durante el desarrollo
from django.conf import settings
from django.conf.urls.static import static

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
