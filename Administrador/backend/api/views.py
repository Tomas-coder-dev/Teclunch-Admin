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
from rest_framework.views import APIView
from django.conf import settings
import openai
import datetime
import requests

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

# ---------------------------
# Vista para el Chatbot
# ---------------------------
# ... (importaciones y código previo) ...

# ---------------------------
# Vista para el Chatbot
# ---------------------------
class ChatbotView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = [SessionAuthentication, BasicAuthentication]

    def post(self, request):
        try:
            user_input = request.data.get('message')
            if not user_input:
                return Response({'error': 'No se proporcionó un mensaje'}, status=400)

            if not getattr(settings, 'OPENAI_API_KEY', None):
                return Response({'error': 'Clave de API de OpenAI no configurada'}, status=500)

            # Obtener datos de items disponibles
            items = Item.objects.filter(disponible=True).select_related('categoria')
            if not items.exists():
                return Response({'error': 'No hay ítems disponibles'}, status=404)

            # Información de los items
            items_info = []
            categorias_dict = {}

            for item in items:
                # Modificar el nombre del item para mejorar la precisión
                nombre_item = self.obtener_nombre_comida_para_api(item.nombre)

                # Obtener información nutricional desde Edamam
                nutricion = self.obtener_info_nutricional(nombre_item)
                if nutricion:
                    calorias = nutricion.get('calories', 'No disponible')
                    nutrientes = nutricion.get('totalNutrients', {})
                    proteinas = nutrientes.get('PROCNT', {}).get('quantity', 'No disponible')
                    grasas = nutrientes.get('FAT', {}).get('quantity', 'No disponible')
                    carbohidratos = nutrientes.get('CHOCDF', {}).get('quantity', 'No disponible')
                else:
                    calorias = proteinas = grasas = carbohidratos = 'No disponible'

                # Obtener calificación promedio y total de votos
                calificacion_promedio = item.get_calificacion_promedio()
                total_votos = item.get_total_votos()

                item_data = {
                    'nombre': item.nombre,
                    'calificacion_promedio': calificacion_promedio,
                    'total_votos': total_votos,
                    'categoria': item.categoria.nombre,
                    'calorias': f"{calorias} kcal" if calorias != 'No disponible' else calorias,
                    'descripcion': item.descripcion or 'Sin descripción',
                    'nutrientes': {
                        'proteinas': f"{proteinas:.1f} g" if isinstance(proteinas, (int, float)) else proteinas,
                        'grasas': f"{grasas:.1f} g" if isinstance(grasas, (int, float)) else grasas,
                        'carbohidratos': f"{carbohidratos:.1f} g" if isinstance(carbohidratos, (int, float)) else carbohidratos,
                    },
                }
                items_info.append(item_data)

                # Mejor calificación por categoría
                categoria_nombre = item.categoria.nombre
                if categoria_nombre not in categorias_dict or calificacion_promedio > categorias_dict[categoria_nombre]['calificacion_promedio']:
                    categorias_dict[categoria_nombre] = item_data

            fecha_actual = datetime.datetime.now().strftime("%d/%m/%Y")

            # Analizar si el usuario solicita una tabla calórica
            solicita_tabla_calorica = any(keyword in user_input.lower() for keyword in ['tabla calórica', 'tabla calorica', 'tabla de calorías', 'tabla de calorias'])

            if solicita_tabla_calorica:
                # Verificar si el usuario menciona un ítem específico
                palabras_usuario = user_input.lower().split()
                nombres_items = [item['nombre'].lower() for item in items_info]

                # Buscar coincidencias entre las palabras del usuario y los nombres de los ítems
                items_solicitados = []
                for nombre_item in nombres_items:
                    if nombre_item in user_input.lower():
                        items_solicitados.append(nombre_item)

                # Si se encontraron ítems solicitados, filtrar items_info
                if items_solicitados:
                    items_filtrados = [item for item in items_info if item['nombre'].lower() in items_solicitados]
                else:
                    items_filtrados = items_info  # Mostrar todos si no se especifica un ítem

                # Crear una tabla calórica detallada
                tabla_calorica = (
                    "| **Comida** | **Calorías** | **Proteínas** | **Grasas** | **Carbohidratos** |\n"
                    "|------------|-------------:|--------------:|-----------:|------------------:|\n"
                )
                for item in items_filtrados:
                    tabla_calorica += (
                        f"| {item['nombre']} | {item['calorias']} | "
                        f"{item['nutrientes']['proteinas']} | {item['nutrientes']['grasas']} | "
                        f"{item['nutrientes']['carbohidratos']} |\n"
                    )

                assistant_response = f"### Tabla Calórica de Comidas Disponibles\n\n{tabla_calorica}"
                return Response({'response': assistant_response})

            else:
                # Formatear texto para el chatbot
                items_texto = ""
                for idx, item in enumerate(items_info, start=1):
                    estrellas_num = int(round(item['calificacion_promedio']))
                    estrellas = '★' * estrellas_num + '☆' * (5 - estrellas_num)
                    items_texto += f"### {idx}. {item['nombre']} ({item['categoria']})\n\n"
                    items_texto += f"- **Calificación Promedio:** {estrellas} ({item['calificacion_promedio']:.1f} de 5)\n"
                    items_texto += f"- **Total de Votos:** {item['total_votos']}\n"
                    items_texto += f"- **Calorías:** {item['calorias']}\n"
                    items_texto += f"- **Nutrientes:**\n"
                    items_texto += f"    - Proteínas: {item['nutrientes']['proteinas']}\n"
                    items_texto += f"    - Grasas: {item['nutrientes']['grasas']}\n"
                    items_texto += f"    - Carbohidratos: {item['nutrientes']['carbohidratos']}\n"
                    items_texto += f"- **Descripción:** {item['descripcion']}\n\n"

                # Información de los mejores items por categoría
                mejores_items_texto = ""
                for categoria, datos in categorias_dict.items():
                    estrellas_num = int(round(datos['calificacion_promedio']))
                    estrellas = '★' * estrellas_num + '☆' * (5 - estrellas_num)
                    mejores_items_texto += f"- **{categoria}:** {datos['nombre']} con calificación promedio de {estrellas} ({datos['calificacion_promedio']:.1f} de 5)\n"

                # Crear el mensaje para la IA
                system_prompt = (
                    "Eres un asistente culinario experto que ayuda a los usuarios brindando información detallada sobre las comidas disponibles. "
                    "Organiza los datos de manera clara y estructurada usando Markdown. "
                    "Incluye listas numeradas, encabezados, tablas si es necesario, y utiliza listas con viñetas para detalles adicionales. "
                    "Muestra las calificaciones utilizando estrellas (★) y proporciona información nutricional cuando esté disponible. "
                    "Si no dispones de cierta información, indícalo claramente al usuario."
                )

                context = (
                    f"Fecha actual: {fecha_actual}\n\n"
                    f"Comidas disponibles:\n\n{items_texto}\n"
                    f"Mejores comidas por categoría:\n{mejores_items_texto}\n"
                )

                messages = [
                    {"role": "system", "content": system_prompt},
                    {"role": "assistant", "content": context},
                    {"role": "user", "content": user_input},
                ]

                openai.api_key = settings.OPENAI_API_KEY
                response = openai.ChatCompletion.create(
                    model="gpt-3.5-turbo",
                    messages=messages,
                    max_tokens=700,
                    temperature=0.7,
                )

                assistant_response = response.choices[0].message['content'].strip()
                return Response({'response': assistant_response})

        except openai.OpenAIError as e:
            return Response({'error': f'Error de OpenAI: {str(e)}'}, status=500)
        except Exception as e:
            return Response({'error': f'Error al procesar la solicitud: {str(e)}'}, status=500)

    def obtener_info_nutricional(self, nombre_item):
        try:
            url = 'https://api.edamam.com/api/nutrition-data'
            # Incluir una cantidad y unidad para mejorar la precisión
            ingr = f"1 serving {nombre_item}"
            params = {
                'app_id': settings.EDAMAM_APP_ID,
                'app_key': settings.EDAMAM_APP_KEY,
                'ingr': ingr,
            }
            response = requests.get(url, params=params)
            data = response.json()
            if response.status_code == 200 and data.get('calories') and data.get('totalNutrients'):
                return data
            else:
                return None
        except Exception as e:
            print(f"Error al obtener información nutricional: {e}")
            return None

    def obtener_nombre_comida_para_api(self, nombre_item):
        # Mapeo de nombres de platos a ingredientes reconocidos por la API
        mapping = {
            'causa': 'potato with tuna',
            'arroz con leche': 'rice pudding',
            'gelatina': 'gelatin dessert',
            'flan': 'custard',
            'pan con pato': 'chicken sandwich',
            'pan con queso': 'cheese sandwich',
            'chicharron de pollo': 'fried chicken',
            'galletas': 'cookies',

        }
        return mapping.get(nombre_item.lower(), nombre_item)
