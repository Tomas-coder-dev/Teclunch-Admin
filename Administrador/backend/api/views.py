# api/views.py

from rest_framework import viewsets, status
from rest_framework.response import Response
from .models import (
    AdminUsuario, Categoria, Item, Carta, CartaItem, Pedido,
    Retroalimentacion, Transaccion, PedidoItem
)
from .serializers import (
    CategoriaSerializer, AdminUsuarioSerializer, AdminUsuarioCreateSerializer,
    ItemSerializer, CartaSerializer, CartaItemSerializer, PedidoSerializer,
    PedidoCreateSerializer, RetroalimentacionSerializer, TransaccionSerializer,
    PedidoItemSerializer, MultiplePedidoCreateSerializer
)
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework import filters
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.views import APIView
from django.conf import settings
from rest_framework.authtoken.models import Token
from rest_framework.authtoken.views import ObtainAuthToken
from django.shortcuts import get_object_or_404
import openai
import datetime
import requests
import logging

# Configuración del logger
logger = logging.getLogger(__name__)

# ---------------------------
# ViewSet para AdminUsuario
# ---------------------------
class AdminUsuarioViewSet(viewsets.ModelViewSet):
    queryset = AdminUsuario.objects.all()
    permission_classes = [IsAuthenticated]  # Requiere autenticación
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['id_institucional', 'role']
    search_fields = ['nombre', 'correo']
    ordering_fields = ['nombre', 'correo']
    ordering = ['nombre']

    def get_serializer_class(self):
        if self.action == 'create':
            return AdminUsuarioCreateSerializer
        return AdminUsuarioSerializer

    # ---------------------------
    # Acción personalizada 'me'
    # ---------------------------
    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def me(self, request):
        """
        Endpoint para obtener la información del usuario actual.
        """
        usuario = request.user
        serializer = self.get_serializer(usuario)
        return Response(serializer.data, status=status.HTTP_200_OK)

# ---------------------------
# Vista para Autenticación y Obtención de Token
# ---------------------------
class CustomObtainAuthToken(ObtainAuthToken):
    """
    Vista personalizada para obtener el token de autenticación.
    Espera 'id_institucional' y 'password' en el cuerpo de la solicitud.
    """
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        id_institucional = request.data.get('id_institucional')
        password = request.data.get('password')
        if not id_institucional or not password:
            return Response({'error': 'Se requieren id_institucional y password.'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            usuario = AdminUsuario.objects.get(id_institucional=id_institucional)
        except AdminUsuario.DoesNotExist:
            return Response({'error': 'Usuario no encontrado.'}, status=status.HTTP_404_NOT_FOUND)
        if not usuario.check_password(password):
            return Response({'error': 'Contraseña incorrecta.'}, status=status.HTTP_400_BAD_REQUEST)
        token, created = Token.objects.get_or_create(user=usuario)
        return Response({'token': token.key, 'role': usuario.role, 'nombre': usuario.nombre}, status=status.HTTP_200_OK)

# ---------------------------
# ViewSet para Categoria
# ---------------------------
class CategoriaViewSet(viewsets.ModelViewSet):
    queryset = Categoria.objects.all()
    serializer_class = CategoriaSerializer
    permission_classes = [IsAuthenticated]
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
    permission_classes = [IsAuthenticated]
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
    permission_classes = [IsAuthenticated]
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
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['carta', 'item']
    search_fields = ['carta__nombre', 'item__nombre']
    ordering_fields = ['carta__nombre', 'item__nombre']
    ordering = ['carta__nombre', 'item__nombre']

# ---------------------------
# ViewSet para Pedido
# ---------------------------
class PedidoViewSet(viewsets.ModelViewSet):
    queryset = Pedido.objects.select_related('usuario', 'carta').prefetch_related(
        'pedido_item_relations__item__categoria', 'transacciones'
    ).all()
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['usuario__id_institucional', 'estado', 'fecha_pedido', 'carta']
    search_fields = ['codigo_pedido']
    ordering_fields = ['fecha_pedido', 'estado']
    ordering = ['-fecha_pedido']

    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return PedidoCreateSerializer
        return PedidoSerializer

    @action(detail=False, methods=['post'], permission_classes=[IsAuthenticated])
    def bulk_create(self, request):
        """
        Acción personalizada para crear múltiples pedidos en una sola solicitud.
        Espera una estructura JSON con una clave 'pedidos' que contiene una lista de pedidos.
        """
        serializer = MultiplePedidoCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        pedidos = serializer.save()
        return Response(PedidoSerializer(pedidos, many=True, context={'request': request}).data, status=status.HTTP_201_CREATED)

# ---------------------------
# ViewSet para Retroalimentacion
# ---------------------------
class RetroalimentacionViewSet(viewsets.ModelViewSet):
    queryset = Retroalimentacion.objects.select_related('usuario', 'item').all()
    serializer_class = RetroalimentacionSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['usuario__id_institucional', 'item', 'calificacion']
    search_fields = ['comentario']
    ordering_fields = ['calificacion']
    ordering = ['-calificacion']

# ---------------------------
# ViewSet para Transaccion
# ---------------------------
class TransaccionViewSet(viewsets.ModelViewSet):
    queryset = Transaccion.objects.select_related('pedido', 'realizador').all()
    serializer_class = TransaccionSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['pedido', 'metodo_pago', 'estado', 'realizador__id_institucional']
    search_fields = ['realizador__nombre', 'user_nombre', 'pedido__usuario__nombre']
    ordering_fields = ['fecha', 'monto']
    ordering = ['-fecha']

# ---------------------------
# Vista para el Chatbot
# ---------------------------
# api/views.py

import datetime
import logging
import openai
import requests
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import Item, Categoria
from django.conf import settings

# Configuración del logger
logger = logging.getLogger(__name__)

class ChatbotView(APIView):
    permission_classes = [IsAuthenticated]  # Requiere autenticación

    def post(self, request):
        try:
            user_input = request.data.get('message')
            if not user_input:
                logger.warning("Solicitud sin mensaje.")
                return Response({'error': 'No se proporcionó un mensaje'}, status=status.HTTP_400_BAD_REQUEST)

            # Verificar todas las claves de API
            missing_keys = []
            required_keys = {
                'OPENAI_API_KEY': settings.OPENAI_API_KEY,
                'EDAMAM_APP_ID': settings.EDAMAM_APP_ID,
                'EDAMAM_APP_KEY': settings.EDAMAM_APP_KEY
            }

            for key, value in required_keys.items():
                if not value:
                    missing_keys.append(key)

            if missing_keys:
                logger.error(f"Claves de API faltantes: {', '.join(missing_keys)}")
                return Response({'error': f'Claves de API faltantes: {", ".join(missing_keys)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

            # Configurar la clave de API de OpenAI
            openai.api_key = settings.OPENAI_API_KEY

            # Obtener datos de items disponibles
            items = Item.objects.filter(disponible=True).select_related('categoria')
            if not items.exists():
                logger.info("No hay ítems disponibles.")
                return Response({'error': 'No hay ítems disponibles'}, status=status.HTTP_404_NOT_FOUND)

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
                    'calorias': f"{calorias} kcal" if isinstance(calorias, (int, float)) else calorias,
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
            solicita_tabla_calorica = any(keyword in user_input.lower() for keyword in [
                'tabla calórica', 'tabla calorica', 'tabla de calorías', 'tabla de calorias'
            ])

            if solicita_tabla_calorica:
                # Verificar si el usuario menciona un ítem específico
                nombres_items = [item['nombre'].lower() for item in items_info]
                items_solicitados = [nombre for nombre in nombres_items if nombre in user_input.lower()]

                # Si se encontraron ítems solicitados, filtrar items_info
                items_filtrados = [item for item in items_info if item['nombre'].lower() in items_solicitados] if items_solicitados else items_info

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

                response = openai.ChatCompletion.create(
                    model="gpt-3.5-turbo",
                    messages=messages,
                    max_tokens=700,
                    temperature=0.7,
                )
                logger.info(f"OpenAI API Response: {response}")
                assistant_response = response.choices[0].message['content'].strip()
                return Response({'response': assistant_response})

        except openai.error.OpenAIError as e:
            logger.exception("Error con la API de OpenAI.")
            return Response({'error': f'Error con la API de OpenAI: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        except requests.RequestException as e:
            logger.exception("Error al conectar con la API de Edamam.")
            return Response({'error': f'Error al conectar con la API de Edamam: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        except Exception as e:
            logger.exception("Error inesperado en ChatbotView.")
            return Response({'error': f'Ocurrió un error inesperado: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    # Funciones auxiliares dentro de la clase
    def obtener_info_nutricional(self, nombre_item):
        try:
            url = 'https://api.edamam.com/api/nutrition-data'
            ingr = f"1 serving {nombre_item}"
            params = {
                'app_id': settings.EDAMAM_APP_ID,
                'app_key': settings.EDAMAM_APP_KEY,
                'ingr': ingr,
            }
            response = requests.get(url, params=params)
            logger.info(f"Edamam API Response: {response.status_code} para {nombre_item}")
            data = response.json()
            if response.status_code == 200 and data.get('calories') and data.get('totalNutrients'):
                return data
            else:
                logger.warning(f"Información nutricional no disponible para: {nombre_item}")
                return None
        except Exception as e:
            logger.exception(f"Error al obtener información nutricional para {nombre_item}: {e}")
            return None

    def obtener_nombre_comida_para_api(self, nombre_item):
        # Mapeo de nombres de platos a ingredientes reconocidos por la API
        mapping = {
            'causa': 'mashed potato with tuna',
            'arroz con leche': 'rice pudding',
            'gelatina': 'gelatin dessert',
            'flan': 'custard',
            'pan con pato': 'duck sandwich',  # Asegúrate de que este mapeo sea correcto
            'pan con queso': 'cheese sandwich',
            'chicharron de pollo': 'fried chicken',
            'galletas': 'cookies',
            'ceviche': 'ceviche (raw fish marinated in citrus)',
            'lomo saltado': 'stir-fried beef with onions, tomatoes, and French fries',
            'aji de gallina': 'chicken in a spicy, creamy sauce',
            'papas a la huancaina': 'potatoes with spicy cheese sauce',
            'tamales': 'steamed corn dough with meat or vegetables',
            'tacu tacu': 'rice and beans fried together',
            'anticuchos': 'grilled skewers, often with beef heart',
            'causa rellena': 'layered potato dish filled with tuna or chicken',
            'sopa seca': 'Peruvian dry spaghetti with a flavorful sauce',
            'mote con hueso': 'hominy corn with pork',
            'pisco sour': 'cocktail made with pisco, lemon, egg white, and bitters',
            'inca kola': 'popular Peruvian soft drink (yellow soda)'
        }
        return mapping.get(nombre_item.lower(), nombre_item)
