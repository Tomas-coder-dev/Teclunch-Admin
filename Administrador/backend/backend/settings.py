# settings.py

import os
from pathlib import Path
from dotenv import load_dotenv

# Cargar variables de entorno desde el archivo .env
load_dotenv()

# Ruta base del proyecto
BASE_DIR = Path(__file__).resolve().parent.parent

# Clave secreta de Django (debe estar en el archivo .env)
SECRET_KEY = os.getenv('SECRET_KEY', 'clave-secreta-por-defecto')

# Modo de depuración (debe estar en el archivo .env)
DEBUG = os.getenv('DEBUG', 'True') == 'True'

# Hosts permitidos
ALLOWED_HOSTS = os.getenv('ALLOWED_HOSTS', 'localhost,127.0.0.1').split(',')

# Clave de API de OpenAI (debe estar en el archivo .env)
OPENAI_API_KEY = os.getenv('OPENAI_API_KEY')

# Claves de API de Edamam (deben estar en el archivo .env)
EDAMAM_APP_ID = os.getenv('EDAMAM_APP_ID')
EDAMAM_APP_KEY = os.getenv('EDAMAM_APP_KEY')

# Modelo de usuario personalizado
AUTH_USER_MODEL = 'api.AdminUsuario'

# Aplicaciones instaladas
INSTALLED_APPS = [
    # Aplicaciones de Django
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    

    # Aplicaciones de terceros
    'rest_framework',
    'corsheaders',
    'django_filters',
    'rest_framework.authtoken',  # Añadido para Token Authentication

    # Tu aplicación
    'api',
]

# Middleware
MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',  # Debe estar antes de CommonMiddleware
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

# Configuración de CORS
CORS_ALLOWED_ORIGINS = [
    "http://localhost:4000",  # Frontend Login
    "http://localhost:4001",  # Frontend Admin
    "http://localhost:3002",  # Frontend User
]

# CORS Allow All Origins (solo para desarrollo)
CORS_ALLOW_ALL_ORIGINS = DEBUG  # Permitimos todos solo si DEBUG=True

# URL de configuración
ROOT_URLCONF = 'backend.urls'  # Asegúrate de que 'backend' sea el nombre correcto de tu proyecto

# Configuración de plantillas
TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],  # Puedes añadir directorios de plantillas si es necesario
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                # Context processors
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

# Aplicación WSGI
WSGI_APPLICATION = 'backend.wsgi.application'  # Asegúrate de que 'backend' sea el nombre correcto de tu proyecto

# Configuración de la base de datos
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.mysql',
        'NAME': 'teclunch_db',
        'USER': 'root',
        'PASSWORD': 'admin',
        'HOST': 'localhost',  # O la IP/host donde está tu servidor MySQL
        'PORT': '3306',  # El puerto por defecto de MySQL
    }
}

# Validadores de contraseñas
AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]

# Configuración de Django REST Framework
REST_FRAMEWORK = {
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',  # Cambiado para requerir autenticación por defecto
    ],
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework.authentication.TokenAuthentication',  # Añadido para Token Authentication
    ],
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 10,  # Tamaño de página predeterminado
    'MAX_PAGE_SIZE': 100,  # Tamaño máximo permitido
    'DEFAULT_FILTER_BACKENDS': [
        'django_filters.rest_framework.DjangoFilterBackend',
        'rest_framework.filters.SearchFilter',
        'rest_framework.filters.OrderingFilter',
    ],
}

# Internacionalización
LANGUAGE_CODE = 'es-es'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True

# Archivos estáticos
STATIC_URL = 'static/'

# Configuración de archivos de medios
MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'

# Tipo de campo de clave primaria por defecto
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'


LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
        },
    },
    'loggers': {
        'api': {  # Asegúrate de que el nombre coincida con el módulo
            'handlers': ['console'],
            'level': 'DEBUG',  # Cambia a 'INFO' o 'ERROR' en producción
            'propagate': True,
        },
    },
}