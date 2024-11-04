from rest_framework import viewsets, status
from rest_framework.response import Response
from .models import (
    Categoria, Usuario, Item, Carta, CartaItem, Pedido, Reserva,
    Retroalimentacion, Transaccion, Carrito, CarritoItem
)
from .serializers import (
    CategoriaSerializer, UsuarioSerializer, UsuarioCreateSerializer, ItemSerializer,
    CartaSerializer, CartaItemSerializer, PedidoSerializer, PedidoCreateSerializer,
    ReservaSerializer, ReservaCreateSerializer, RetroalimentacionSerializer,
    TransaccionSerializer, MultipleReservaCreateSerializer, MultiplePedidoCreateSerializer,
    CarritoSerializer, CarritoItemSerializer
)
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny
from rest_framework import filters
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.authentication import SessionAuthentication, BasicAuthentication

# ---------------------------
# ViewSet para Usuario
# ---------------------------
class UsuarioViewSet(viewsets.ModelViewSet):
    queryset = Usuario.objects.all()
    permission_classes = [AllowAny]
    authentication_classes = [SessionAuthentication, BasicAuthentication]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['rol']
    search_fields = ['nombre', 'correo']
    ordering_fields = ['nombre', 'correo']
    ordering = ['nombre']

    def get_serializer_class(self):
        if self.action == 'create':
            return UsuarioCreateSerializer
        return UsuarioSerializer

    @action(detail=False, methods=['get'], permission_classes=[AllowAny])
    def me(self, request):
        serializer = self.get_serializer(request.user)
        return Response(serializer.data)

# ---------------------------
# ViewSet para Categoria
# ---------------------------
class CategoriaViewSet(viewsets.ModelViewSet):
    queryset = Categoria.objects.all()
    serializer_class = CategoriaSerializer
    permission_classes = [AllowAny]
    authentication_classes = [SessionAuthentication, BasicAuthentication]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['nombre']
    ordering_fields = ['nombre']
    ordering = ['nombre']

# ---------------------------
# ViewSet para Item
# ---------------------------
class ItemViewSet(viewsets.ModelViewSet):
    queryset = Item.objects.select_related('categoria').all()
    serializer_class = ItemSerializer
    permission_classes = [AllowAny]
    authentication_classes = [SessionAuthentication, BasicAuthentication]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['categoria', 'disponible']
    search_fields = ['nombre', 'descripcion']
    ordering_fields = ['precio', 'calorias', 'nombre']
    ordering = ['nombre']

# ---------------------------
# ViewSet para Carta
# ---------------------------
class CartaViewSet(viewsets.ModelViewSet):
    queryset = Carta.objects.all()
    serializer_class = CartaSerializer
    permission_classes = [AllowAny]
    authentication_classes = [SessionAuthentication, BasicAuthentication]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['fecha', 'disponible']
    search_fields = ['nombre']
    ordering_fields = ['fecha', 'nombre']
    ordering = ['fecha']

# ---------------------------
# ViewSet para CartaItem
# ---------------------------
class CartaItemViewSet(viewsets.ModelViewSet):
    queryset = CartaItem.objects.select_related('carta', 'item').all()
    serializer_class = CartaItemSerializer
    permission_classes = [AllowAny]
    authentication_classes = [SessionAuthentication, BasicAuthentication]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['carta', 'item']
    search_fields = ['carta__nombre', 'item__nombre']
    ordering_fields = ['carta__nombre', 'item__nombre']
    ordering = ['carta__nombre', 'item__nombre']

# ---------------------------
# ViewSet para Reserva
# ---------------------------
class ReservaViewSet(viewsets.ModelViewSet):
    queryset = Reserva.objects.select_related('usuario').prefetch_related('reserva_items_relations__item__categoria').all()
    permission_classes = [AllowAny]
    authentication_classes = [SessionAuthentication, BasicAuthentication]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['usuario__id_institucional', 'estado', 'fecha_reserva']
    search_fields = ['codigo_reserva']
    ordering_fields = ['fecha_reserva', 'estado']
    ordering = ['-fecha_reserva']

    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return ReservaCreateSerializer
        return ReservaSerializer

    @action(detail=False, methods=['post'], permission_classes=[AllowAny])
    def bulk_create(self, request):
        serializer = MultipleReservaCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        reservas = serializer.save()
        return Response(ReservaSerializer(reservas, many=True).data, status=status.HTTP_201_CREATED)

# ---------------------------
# ViewSet para Pedido
# ---------------------------
class PedidoViewSet(viewsets.ModelViewSet):
    queryset = Pedido.objects.select_related('usuario', 'carta', 'reserva').prefetch_related(
        'pedido_item_relations__item__categoria', 'transacciones'
    ).all()
    permission_classes = [AllowAny]
    authentication_classes = [SessionAuthentication, BasicAuthentication]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['usuario__id_institucional', 'estado', 'fecha_pedido', 'carta', 'reserva']
    search_fields = ['codigo_reserva']
    ordering_fields = ['fecha_pedido', 'estado']
    ordering = ['-fecha_pedido']

    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return PedidoCreateSerializer
        return PedidoSerializer

    @action(detail=False, methods=['post'], permission_classes=[AllowAny])
    def bulk_create(self, request):
        serializer = MultiplePedidoCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        pedidos = serializer.save()
        return Response(PedidoSerializer(pedidos, many=True).data, status=status.HTTP_201_CREATED)

# ---------------------------
# ViewSet para Retroalimentacion
# ---------------------------
class RetroalimentacionViewSet(viewsets.ModelViewSet):
    queryset = Retroalimentacion.objects.select_related('usuario', 'item').all()
    serializer_class = RetroalimentacionSerializer
    permission_classes = [AllowAny]
    authentication_classes = [SessionAuthentication, BasicAuthentication]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['usuario__id_institucional', 'item', 'calificacion']
    search_fields = ['comentario']
    ordering_fields = ['calificacion']
    ordering = ['-calificacion']

# ---------------------------
# ViewSet para Transaccion
# ---------------------------
class TransaccionViewSet(viewsets.ModelViewSet):
    queryset = Transaccion.objects.select_related('pedido').all()
    serializer_class = TransaccionSerializer
    permission_classes = [AllowAny]
    authentication_classes = [SessionAuthentication, BasicAuthentication]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['pedido', 'metodo_pago', 'estado']
    ordering_fields = ['fecha', 'monto']
    ordering = ['-fecha']

# ---------------------------
# ViewSet para CarritoItem
# ---------------------------
class CarritoItemViewSet(viewsets.ModelViewSet):
    queryset = CarritoItem.objects.select_related('carrito', 'item').all()
    serializer_class = CarritoItemSerializer
    permission_classes = [AllowAny]
    authentication_classes = [SessionAuthentication, BasicAuthentication]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['carrito__usuario__id_institucional', 'item']
    ordering_fields = ['item__nombre']
    ordering = ['item__nombre']

# ---------------------------
# ViewSet para Carrito
# ---------------------------
class CarritoViewSet(viewsets.ModelViewSet):
    queryset = Carrito.objects.select_related('usuario').prefetch_related('items__item').all()
    serializer_class = CarritoSerializer
    permission_classes = [AllowAny]
    authentication_classes = [SessionAuthentication, BasicAuthentication]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['usuario__id_institucional']
    ordering_fields = ['usuario__nombre']
    ordering = ['usuario__nombre']

    @action(detail=False, methods=['get'], permission_classes=[AllowAny])
    def my_cart(self, request):
        usuario = request.user
        carrito = Carrito.objects.filter(usuario=usuario).first()
        if not carrito:
            return Response({"mensaje": "El carrito está vacío."}, status=status.HTTP_404_NOT_FOUND)
        serializer = self.get_serializer(carrito)
        return Response(serializer.data)

    @action(detail=True, methods=['post'], permission_classes=[AllowAny])
    def add_item(self, request, pk=None):
        carrito = self.get_object()
        item_id = request.data.get('item_id')
        cantidad = request.data.get('cantidad', 1)
        item = Item.objects.filter(id=item_id).first()
        if not item:
            return Response({"error": "El ítem no existe."}, status=status.HTTP_400_BAD_REQUEST)
        carrito_item, created = CarritoItem.objects.get_or_create(carrito=carrito, item=item)
        if not created:
            carrito_item.cantidad += int(cantidad)
            carrito_item.save()
        else:
            carrito_item.cantidad = int(cantidad)
            carrito_item.save()
        return Response({"mensaje": "Ítem agregado al carrito."}, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'], permission_classes=[AllowAny])
    def remove_item(self, request, pk=None):
        carrito = self.get_object()
        item_id = request.data.get('item_id')
        carrito_item = CarritoItem.objects.filter(carrito=carrito, item__id=item_id).first()
        if not carrito_item:
            return Response({"error": "El ítem no se encuentra en el carrito."}, status=status.HTTP_404_NOT_FOUND)
        carrito_item.delete()
        return Response({"mensaje": "Ítem eliminado del carrito."}, status=status.HTTP_204_NO_CONTENT)

    @action(detail=True, methods=['post'], permission_classes=[AllowAny])
    def clear_cart(self, request, pk=None):
        carrito = self.get_object()
        carrito.items.all().delete()
        return Response({"mensaje": "El carrito ha sido vaciado."}, status=status.HTTP_204_NO_CONTENT)

# ---------------------------
# ViewSet para Múltiples Reservas (Opcional)
# ---------------------------
class MultipleReservaCreateViewSet(viewsets.ViewSet):
    permission_classes = [AllowAny]
    authentication_classes = [SessionAuthentication, BasicAuthentication]

    def create(self, request):
        serializer = MultipleReservaCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        reservas = serializer.save()
        return Response(ReservaSerializer(reservas, many=True).data, status=status.HTTP_201_CREATED)

# ---------------------------
# ViewSet para Múltiples Pedidos (Opcional)
# ---------------------------
class MultiplePedidoCreateViewSet(viewsets.ViewSet):
    permission_classes = [AllowAny]
    authentication_classes = [SessionAuthentication, BasicAuthentication]

    def create(self, request):
        serializer = MultiplePedidoCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        pedidos = serializer.save()
        return Response(PedidoSerializer(pedidos, many=True).data, status=status.HTTP_201_CREATED)
