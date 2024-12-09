# api/serializers.py

from rest_framework import serializers
from .models import (
    AdminUsuario, Categoria, Item, Carta, CartaItem, Pedido,
    Retroalimentacion, Transaccion, PedidoItem
)
from django.db import transaction
from django.db.models import Avg

# ---------------------------
# Serializador para Categoria
# ---------------------------
class CategoriaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Categoria
        fields = ['id', 'nombre']

# ---------------------------
# Serializador para AdminUsuario (Lectura)
# ---------------------------
class AdminUsuarioSerializer(serializers.ModelSerializer):
    class Meta:
        model = AdminUsuario
        fields = [
            'id_institucional', 'nombre', 'correo', 'role'
        ]

    def validate_correo(self, value):
        if not value.endswith('@tecsup.edu.pe'):
            raise serializers.ValidationError("El correo debe ser del dominio @tecsup.edu.pe")
        return value

# ---------------------------
# Serializador para AdminUsuario (Creación)
# ---------------------------
class AdminUsuarioCreateSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = AdminUsuario
        fields = [
            'id_institucional', 'nombre', 'correo', 'password', 'role'
        ]

    def validate_correo(self, value):
        if not value.endswith('@tecsup.edu.pe'):
            raise serializers.ValidationError("El correo debe ser del dominio @tecsup.edu.pe")
        return value

    def validate_role(self, value):
        if value != 'administrador':
            raise serializers.ValidationError("El rol debe ser 'administrador'.")
        return value

    def create(self, validated_data):
        password = validated_data.pop('password')
        usuario = AdminUsuario.objects.create(**validated_data)
        usuario.set_password(password)
        usuario.save()
        return usuario

# ---------------------------
# Serializador para Retroalimentacion
# ---------------------------
class RetroalimentacionSerializer(serializers.ModelSerializer):
    item_nombre = serializers.ReadOnlyField(source='item.nombre')
    usuario_nombre = serializers.ReadOnlyField(source='usuario.nombre')

    class Meta:
        model = Retroalimentacion
        fields = [
            'id', 'usuario', 'usuario_nombre', 'item', 'item_nombre',
            'comentario', 'calificacion'
        ]

    def validate_calificacion(self, value):
        if value < 1 or value > 5:
            raise serializers.ValidationError("La calificación debe estar entre 1 y 5.")
        return value

    def validate(self, attrs):
        usuario = attrs.get('usuario')
        item = attrs.get('item')
        if Retroalimentacion.objects.filter(usuario=usuario, item=item).exists():
            raise serializers.ValidationError("El usuario ya ha dejado una retroalimentación para este ítem.")
        return attrs

# ---------------------------
# Serializador para Item
# ---------------------------
class ItemSerializer(serializers.ModelSerializer):
    categoria_nombre = serializers.ReadOnlyField(source='categoria.nombre')
    calificacion_promedio = serializers.SerializerMethodField()
    total_votos = serializers.SerializerMethodField()
    puntaje_compuesto = serializers.SerializerMethodField()
    imagen_url = serializers.SerializerMethodField()

    # Campos opcionales
    ingredientes = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    calorias = serializers.IntegerField(required=False, allow_null=True)
    proteinas = serializers.FloatField(required=False, allow_null=True)
    grasas = serializers.FloatField(required=False, allow_null=True)
    carbohidratos = serializers.FloatField(required=False, allow_null=True)
    descripcion = serializers.CharField(required=False, allow_blank=True, allow_null=True)

    class Meta:
        model = Item
        fields = [
            'id', 'nombre', 'descripcion', 'ingredientes', 'precio', 'categoria', 'categoria_nombre',
            'disponible', 'imagen', 'imagen_url', 'calorias', 'proteinas', 'grasas', 'carbohidratos',
            'calificacion_promedio', 'total_votos', 'puntaje_compuesto',
        ]

    def get_calificacion_promedio(self, obj):
        return obj.get_calificacion_promedio()

    def get_total_votos(self, obj):
        return obj.get_total_votos()

    def get_puntaje_compuesto(self, obj):
        return obj.get_puntaje_compuesto()

    def get_imagen_url(self, obj):
        request = self.context.get('request')
        if obj.imagen and hasattr(obj.imagen, 'url'):
            return request.build_absolute_uri(obj.imagen.url)
        return None

# ---------------------------
# Serializador para Transaccion (Lectura y Actualización)
# ---------------------------
class TransaccionSerializer(serializers.ModelSerializer):
    pedido_codigo_pedido = serializers.ReadOnlyField(source='pedido.codigo_pedido')
    usuario_nombre = serializers.ReadOnlyField(source='pedido.usuario.nombre')
    realizador_nombre = serializers.ReadOnlyField(source='realizador.nombre')
    realizador_id_institucional = serializers.ReadOnlyField(source='realizador.id_institucional')

    class Meta:
        model = Transaccion
        fields = [
            'id', 'pedido', 'pedido_codigo_pedido', 'usuario_nombre',
            'metodo_pago', 'estado', 'fecha', 'monto',
            'realizador_nombre', 'realizador_id_institucional',
            'user_id_institucional', 'user_nombre'
        ]
        read_only_fields = [
            'pedido_codigo_pedido', 'usuario_nombre',
            'realizador_nombre', 'realizador_id_institucional',
            'fecha', 'monto'
        ]

    def update(self, instance, validated_data):
        new_estado = validated_data.get('estado', instance.estado)
        if instance.estado in ['Completado', 'Fallido']:
            raise serializers.ValidationError("El estado de esta transacción ya no puede ser modificado.")
        instance.estado = new_estado
        instance.save()
        return instance

# ---------------------------
# Serializador para PedidoItem
# ---------------------------
class PedidoItemSerializer(serializers.ModelSerializer):
    item_nombre = serializers.ReadOnlyField(source='item.nombre')
    item_categoria = serializers.ReadOnlyField(source='item.categoria.nombre')
    item_imagen = serializers.SerializerMethodField()
    item = serializers.PrimaryKeyRelatedField(queryset=Item.objects.all())

    class Meta:
        model = PedidoItem
        fields = ['id', 'item', 'item_nombre', 'item_categoria', 'item_imagen', 'cantidad']

    def get_item_imagen(self, obj):
        request = self.context.get('request')
        if obj.item.imagen and hasattr(obj.item.imagen, 'url'):
            return request.build_absolute_uri(obj.item.imagen.url)
        return None

    def validate_item(self, value):
        if not value.disponible:
            raise serializers.ValidationError("El ítem seleccionado no está disponible.")
        return value

    def validate_cantidad(self, value):
        if value < 1:
            raise serializers.ValidationError("La cantidad debe ser al menos 1.")
        return value

# ---------------------------
# Serializador para Pedido (Representación)
# ---------------------------
class PedidoSerializer(serializers.ModelSerializer):
    usuario_nombre = serializers.ReadOnlyField(source='usuario.nombre')
    codigo_pedido = serializers.ReadOnlyField()  # Campo añadido
    pedido_items = PedidoItemSerializer(many=True, read_only=True, source='pedido_item_relations')
    total_pedido = serializers.SerializerMethodField()
    transacciones = TransaccionSerializer(many=True, read_only=True)

    class Meta:
        model = Pedido
        fields = [
            'id', 'usuario', 'usuario_nombre', 'carta',
            'fecha_pedido', 'estado',
            'pedido_items', 'total_pedido', 'transacciones', 'codigo_pedido'
        ]

    def get_total_pedido(self, obj):
        return obj.calcular_total() or 0.0

# ---------------------------
# Serializador para CartaItem
# ---------------------------
class CartaItemSerializer(serializers.ModelSerializer):
    carta_nombre = serializers.ReadOnlyField(source='carta.nombre')
    item_nombre = serializers.ReadOnlyField(source='item.nombre')

    class Meta:
        model = CartaItem
        fields = ['id', 'carta', 'carta_nombre', 'item', 'item_nombre']

    def validate(self, attrs):
        carta = attrs.get('carta')
        item = attrs.get('item')
        if CartaItem.objects.filter(carta=carta, item=item).exists():
            raise serializers.ValidationError("El ítem ya está asociado a esta carta.")
        return attrs

# ---------------------------
# Serializador para Carta
# ---------------------------
class CartaSerializer(serializers.ModelSerializer):
    carta_items = CartaItemSerializer(many=True, read_only=True)
    items = ItemSerializer(many=True, read_only=True, source='carta_items__item')

    class Meta:
        model = Carta
        fields = ['id', 'nombre', 'fecha', 'disponible', 'carta_items', 'items']

# ---------------------------
# Serializador para la Creación y Actualización de Pedido
# ---------------------------
class PedidoCreateSerializer(serializers.ModelSerializer):
    pedido_items = PedidoItemSerializer(many=True, source='pedido_item_relations')
    metodo_pago = serializers.ChoiceField(choices=Transaccion.METODO_PAGO_CHOICES, write_only=True)
    fecha_pedido = serializers.DateField(read_only=True)
    carta = serializers.PrimaryKeyRelatedField(queryset=Carta.objects.all(), required=False, allow_null=True)
    usuario = serializers.SlugRelatedField(queryset=AdminUsuario.objects.all(), slug_field='id_institucional')
    codigo_pedido = serializers.ReadOnlyField()  # Campo añadido
    realizador_id_institucional = serializers.CharField(write_only=True, required=False, allow_blank=True)
    realizador_nombre = serializers.CharField(write_only=True, required=False, allow_blank=True)

    class Meta:
        model = Pedido
        fields = [
            'id', 'usuario', 'carta',
            'fecha_pedido', 'estado',
            'pedido_items', 'metodo_pago', 'codigo_pedido',
            'realizador_id_institucional', 'realizador_nombre'
        ]

    def create(self, validated_data):
        pedido_items_data = validated_data.pop('pedido_item_relations')
        metodo_pago = validated_data.pop('metodo_pago')
        realizador_id_institucional = validated_data.pop('realizador_id_institucional', None)
        realizador_nombre = validated_data.pop('realizador_nombre', None)
        try:
            with transaction.atomic():
                pedido = Pedido.objects.create(**validated_data)
                total_monto = 0
                for pi_data in pedido_items_data:
                    cantidad = pi_data.get('cantidad', 1)
                    item = pi_data.get('item')
                    pedido_item = PedidoItem.objects.create(pedido=pedido, item=item, cantidad=cantidad)
                    total_monto += (pedido_item.item.precio or 0) * cantidad
                transaccion = Transaccion.objects.create(
                    pedido=pedido,
                    metodo_pago=metodo_pago,
                    estado='Pendiente',
                    monto=total_monto
                )
                if realizador_id_institucional and realizador_nombre:
                    # Intentar asociar el realizador como un AdminUsuario existente
                    realizador = AdminUsuario.objects.filter(id_institucional=realizador_id_institucional, nombre=realizador_nombre).first()
                    if realizador:
                        transaccion.realizador = realizador
                        transaccion.save()
                    else:
                        # Guardar información del usuario externo
                        transaccion.user_id_institucional = realizador_id_institucional
                        transaccion.user_nombre = realizador_nombre
                        transaccion.save()
        except Exception as e:
            raise serializers.ValidationError(f"Error al crear el pedido: {str(e)}")
        return pedido

    def update(self, instance, validated_data):
        pedido_items_data = validated_data.pop('pedido_item_relations', None)
        metodo_pago = validated_data.pop('metodo_pago', None)
        realizador_id_institucional = validated_data.pop('realizador_id_institucional', None)
        realizador_nombre = validated_data.pop('realizador_nombre', None)
        try:
            with transaction.atomic():
                for attr, value in validated_data.items():
                    setattr(instance, attr, value)
                instance.save()

                if pedido_items_data is not None:
                    instance.pedido_item_relations.all().delete()
                    total_monto = 0
                    for pi_data in pedido_items_data:
                        cantidad = pi_data.get('cantidad', 1)
                        item = pi_data.get('item')
                        pedido_item = PedidoItem.objects.create(pedido=instance, item=item, cantidad=cantidad)
                        total_monto += (pedido_item.item.precio or 0) * cantidad
                    transaccion = instance.transacciones.first()
                    if transaccion:
                        transaccion.monto = total_monto
                        if metodo_pago:
                            transaccion.metodo_pago = metodo_pago
                        if realizador_id_institucional and realizador_nombre:
                            realizador = AdminUsuario.objects.filter(id_institucional=realizador_id_institucional, nombre=realizador_nombre).first()
                            if realizador:
                                transaccion.realizador = realizador
                            else:
                                transaccion.user_id_institucional = realizador_id_institucional
                                transaccion.user_nombre = realizador_nombre
                        transaccion.save()
                    else:
                        Transaccion.objects.create(
                            pedido=instance,
                            metodo_pago=metodo_pago if metodo_pago else 'Otro',
                            estado='Pendiente',
                            monto=total_monto
                        )
        except Exception as e:
            raise serializers.ValidationError(f"Error al actualizar el pedido: {str(e)}")
        return instance

# ---------------------------
# Serializador para la Creación Masiva de Pedidos
# ---------------------------
class MultiplePedidoCreateSerializer(serializers.Serializer):
    pedidos = PedidoCreateSerializer(many=True)

    def create(self, validated_data):
        pedidos_data = validated_data.pop('pedidos')
        created_pedidos = []
        try:
            with transaction.atomic():
                for pedido_data in pedidos_data:
                    serializer = PedidoCreateSerializer(data=pedido_data)
                    serializer.is_valid(raise_exception=True)
                    pedido = serializer.save()
                    created_pedidos.append(pedido)
        except Exception as e:
            raise serializers.ValidationError(f"Error al crear los pedidos: {str(e)}")
        return created_pedidos
