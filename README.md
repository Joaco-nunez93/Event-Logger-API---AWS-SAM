<div align="center">

# 📋 Event Logger API - AWS SAM

<img src="https://compote.slate.com/images/2119ff95-86f2-4546-a8fd-7b70ec58c9c6.jpeg?crop=1560%2C1040%2Cx0%2Cy0&width=370" alt="AWS Serverless" width="600"/>

### Aplicación serverless construida con **AWS SAM** que implementa una API REST simple para registrar eventos utilizando **API Gateway**, **AWS Lambda**, y **CloudFormation**.

[![AWS SAM](https://img.shields.io/badge/AWS-SAM-orange?style=for-the-badge&logo=amazonaws)](https://aws.amazon.com/serverless/sam/)
[![Lambda](https://img.shields.io/badge/AWS-Lambda-orange?style=for-the-badge&logo=awslambda)](https://aws.amazon.com/lambda/)
[![Node.js](https://img.shields.io/badge/Node.js-22.x-339933?style=for-the-badge&logo=nodedotjs)](https://nodejs.org/)
[![API Gateway](https://img.shields.io/badge/API-Gateway-FF4F8B?style=for-the-badge&logo=amazonapigateway)](https://aws.amazon.com/api-gateway/)

</div>

---

## 📋 Overview

Este repositorio contiene un proyecto educativo que demuestra cómo construir una API serverless en AWS utilizando **AWS SAM (Serverless Application Model)**. El proyecto implementa un endpoint REST simple que retorna información sobre la función Lambda ejecutada, demostrando la integración entre API Gateway y Lambda con versionado automático mediante aliases.

**Flujo de trabajo:**
1. Cliente hace una petición POST al endpoint `/log`
2. API Gateway recibe la petición y valida el request
3. API Gateway invoca la función Lambda (versión específica usando alias)
4. Lambda procesa el evento y retorna información sobre su versión y nombre
5. API Gateway retorna la respuesta al cliente con código HTTP 200

**Características principales:**
- ✅ **Arquitectura Serverless**: Sin servidores que administrar
- ✅ **Versionado Automático**: Lambda aliases vinculados al ambiente (test/prod)
- ✅ **Multi-ambiente**: Soporte para ambientes test y prod mediante parámetros
- ✅ **Logs Estructurados**: Formato JSON para facilitar análisis en CloudWatch
- ✅ **X-Ray Tracing**: Observabilidad completa de requests end-to-end
- ✅ **Infrastructure as Code**: Infraestructura completamente definida en `template.yaml`

## 🏗️ Arquitectura & Tecnologías

### **Core Technologies**

- **AWS SAM CLI** - Framework de desarrollo serverless basado en CloudFormation
- **AWS Lambda** - Función serverless para procesamiento de eventos
- **Amazon API Gateway** - API REST para exponer la función Lambda
- **AWS CloudFormation** - Motor subyacente para provisionamiento de recursos
- **AWS X-Ray** - Distributed tracing para análisis de performance
- **CloudWatch Logs** - Monitoreo y logs estructurados en JSON
- **Node.js 22.x** - Runtime moderno para Lambda
- **JavaScript (ESM)** - Lenguaje de desarrollo con ES Modules

### **AWS Services**

| Servicio | Propósito | Configuración Clave |
|----------|-----------|---------------------|
| **API Gateway** | Endpoint REST `/log` | Integración proxy con Lambda versionada |
| **Lambda Function** | Procesamiento de eventos | 128 MB RAM, 3s timeout, alias por ambiente |
| **IAM Role** | Permisos de API Gateway | Permite invocar versiones específicas de Lambda |
| **CloudWatch Logs** | Almacenamiento de logs | Formato JSON estructurado |
| **X-Ray** | Trazabilidad distribuida | Habilitado en Lambda y API Gateway |

### **Development Tools**

- **AWS SAM CLI** - Herramienta de desarrollo local y deployment
- **Mocha + Chai** - Framework de testing para pruebas unitarias
- **npm** - Gestor de paquetes para dependencias
- **AWS CLI** - Interacción con servicios AWS

## 📁 Estructura del Proyecto

```
lab-sam-app/
├── event-logger/                   # Código de la función Lambda
│   ├── app.mjs                     # Handler principal de Lambda (ESM)
│   ├── package.json                # Dependencias de la función
│   ├── .npmignore                  # Archivos excluidos del deployment
│   └── tests/
│       └── unit/
│           └── test-handler.mjs    # Tests unitarios de la función
├── events/
│   └── event.json                  # Evento de prueba para invocación local
├── .aws-sam/                       # Build output (gitignored)
│   ├── build/                      # Código empaquetado para deployment
│   └── build.toml                  # Configuración de build
├── template.yaml                   # Plantilla SAM (infraestructura)
├── .gitignore                      # Archivos ignorados por Git
└── README.md                       # Este archivo
```

### **Separación de Responsabilidades**

| Directorio | Propósito | Se despliega a AWS |
|------------|-----------|-------------------|
| `event-logger/` | Código fuente de Lambda | ✅ Sí |
| `events/` | Eventos de prueba local | ❌ No |
| `.aws-sam/` | Build artifacts | ❌ No (Git ignored) |
| `template.yaml` | Infraestructura | ✅ Sí (como CloudFormation) |

## ✨ Componentes Clave

### **1️⃣ Template SAM** (`template.yaml`)

El archivo `template.yaml` define toda la infraestructura del proyecto usando la sintaxis de AWS SAM (extensión de CloudFormation).

#### **Parámetros**

```yaml
Parameters:
  EnvType:
    Type: String
    Default: test
    AllowedValues:
      - test
      - prod
    Description: "Deployment environment"
```

**Propósito**: Permite desplegar la misma infraestructura en múltiples ambientes (test/prod) con un solo template.

---

#### **Configuración Global**

```yaml
Globals:
  Function:
    Timeout: 3
    Tracing: Active
    LoggingConfig:
      LogFormat: JSON
  Api:
    TracingEnabled: true
```

**Características:**
- **Timeout**: 3 segundos (suficiente para esta función simple)
- **Tracing**: AWS X-Ray habilitado para todas las funciones
- **LogFormat**: JSON estructurado para mejor análisis en CloudWatch Insights
- **API Tracing**: X-Ray habilitado para API Gateway

---

### **2️⃣ Función Lambda** (`EventLoggerFunction`)

```yaml
EventLoggerFunction:
  Type: AWS::Serverless::Function
  Properties:
    CodeUri: event-logger/
    FunctionName: !Sub "eventLogger-${EnvType}"
    Handler: app.lambdaHandler
    Runtime: nodejs22.x
    MemorySize: 128
    Architectures:
      - x86_64
    AutoPublishAlias: !Ref EnvType
```

**Configuración Detallada:**

| Propiedad | Valor | Explicación |
|-----------|-------|-------------|
| `CodeUri` | `event-logger/` | Directorio que contiene el código fuente |
| `FunctionName` | `eventLogger-${EnvType}` | Nombre dinámico según ambiente |
| `Handler` | `app.lambdaHandler` | Función exportada en `app.mjs` |
| `Runtime` | `nodejs22.x` | Node.js 22 (LTS actualizado) |
| `MemorySize` | `128 MB` | Mínimo necesario para esta función simple |
| `Architectures` | `x86_64` | Arquitectura de procesador |
| `AutoPublishAlias` | `${EnvType}` | Crea alias automático (test/prod) |

> [!IMPORTANT]
> **AutoPublishAlias**: Esta propiedad es crítica. Cada vez que despliegas, SAM:
> 1. Crea una nueva versión de la función Lambda
> 2. Actualiza el alias (test/prod) para apuntar a esa nueva versión
> 3. Permite rollbacks fáciles cambiando el alias a una versión anterior

**Código de la Función** (`event-logger/app.mjs`):

```javascript
export const lambdaHandler = async (event, context) => {
  try {
    let log = {};
    log.LambdaFunction = context.functionName;  // ej: "eventLogger-test"
    log.LambdaVersion = context.functionVersion; // ej: "test" (alias)

    console.log("Response:", JSON.stringify(log, null, 2));

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(log),
    };
  } catch (error) {
    console.error("Error processing request:", error);

    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: "Internal Server Error" }),
    };
  }
};
```

**Características del Código:**
- ✅ **ESM (ES Modules)**: Usa `export` en lugar de `module.exports`
- ✅ **Manejo de errores**: Try-catch con respuesta 500 en caso de error
- ✅ **Context usage**: Accede a `functionName` y `functionVersion` del contexto
- ✅ **Logs estructurados**: Emite JSON para facilitar análisis
- ✅ **Headers correctos**: Content-Type apropiado para JSON

---

### **3️⃣ API Gateway** (`ApiGateway`)

```yaml
ApiGateway:
  Type: AWS::Serverless::Api
  Properties:
    Name: !Sub "EventLoggerAPI-${EnvType}"
    StageName: !Ref EnvType
    DefinitionBody:
      swagger: "2.0"
      info:
        title: !Sub "EventLoggerAPI-${EnvType}"
      paths:
        /log:
          post:
            x-amazon-apigateway-integration:
              httpMethod: "POST"
              type: "aws_proxy"
              credentials: !GetAtt ApiGatewayInvokeRole.Arn
              uri:
                Fn::Sub: "arn:aws:apigateway:${AWS::Region}:lambda:path/2015-03-31/functions/${EventLoggerFunction.Arn}:${EnvType}/invocations"
```

**Configuración Detallada:**

| Propiedad | Valor | Explicación |
|-----------|-------|-------------|
| `Name` | `EventLoggerAPI-${EnvType}` | Nombre de la API (test/prod) |
| `StageName` | `${EnvType}` | Stage de deployment (test/prod) |
| `swagger` | `2.0` | Versión de OpenAPI/Swagger |
| `type` | `aws_proxy` | Integración proxy (event completo a Lambda) |
| `credentials` | IAM Role ARN | Role para invocar Lambda |
| `uri` | Lambda ARN con alias | Invoca versión específica (`:${EnvType}`) |

> [!WARNING]
> **URI crítica**: La URI incluye `:${EnvType}` al final del ARN de Lambda. Esto asegura que API Gateway invoque el **alias** (test/prod) y no la versión `$LATEST`. Sin esto, los deployments no respetarían el versionado.

**Endpoint resultante:**
```
https://abc123xyz.execute-api.us-east-1.amazonaws.com/test/log
```

---

### **4️⃣ IAM Role** (`ApiGatewayInvokeRole`)

```yaml
ApiGatewayInvokeRole:
  Type: AWS::IAM::Role
  Properties:
    RoleName: !Sub "APIGatewayInvokeLambdaRole-${EnvType}"
    AssumeRolePolicyDocument:
      Version: "2012-10-17"
      Statement:
        - Effect: Allow
          Principal:
            Service: "apigateway.amazonaws.com"
          Action: "sts:AssumeRole"
    Policies:
      - PolicyName: "InvokeLambdaPolicy"
        PolicyDocument:
          Version: "2012-10-17"
          Statement:
            - Effect: Allow
              Action: "lambda:InvokeFunction"
              Resource:
                - !Sub "arn:aws:lambda:${AWS::Region}:${AWS::AccountId}:function:eventLogger-${EnvType}:${EnvType}"
                - !Sub "arn:aws:lambda:${AWS::Region}:${AWS::AccountId}:function:eventLogger-${EnvType}"
```

**Permisos Otorgados:**

1. **AssumeRole**: Permite a API Gateway asumir este role
2. **InvokeFunction**: Permite invocar la función Lambda
3. **Resources**: 
   - Con alias (`:${EnvType}`) - versión específica
   - Sin alias - función completa (fallback)

**¿Por qué dos recursos?**
- La primera línea permite invocar el **alias** (test/prod)
- La segunda línea permite invocar la **función base** (permiso más amplio)

---

### **5️⃣ CloudFormation Outputs**

```yaml
Outputs:
  ApiUrl:
    Description: "API Gateway URL for the deployed stage"
    Value: !Sub "https://${ApiGateway}.execute-api.${AWS::Region}.amazonaws.com/${EnvType}/log"

  LambdaFunctionArn:
    Description: "Lambda Function ARN"
    Value: !GetAtt EventLoggerFunction.Arn
```

**Outputs mostrados después del deployment:**
```bash
---------------------------------------------------------
Outputs
---------------------------------------------------------
Key                 ApiUrl
Description         API Gateway URL for the deployed stage
Value               https://abc123xyz.execute-api.us-east-1.amazonaws.com/test/log

Key                 LambdaFunctionArn
Description         Lambda Function ARN
Value               arn:aws:lambda:us-east-1:123456789012:function:eventLogger-test
---------------------------------------------------------
```

## ☁️ Recursos AWS Creados

Al ejecutar `sam deploy`, se crean los siguientes recursos en tu cuenta de AWS:

| Recurso | Tipo AWS | Propósito | Costo Estimado |
|---------|----------|-----------|----------------|
| **Lambda Function** | `AWS::Lambda::Function` | Procesamiento de eventos | Gratis (1M invocaciones/mes) |
| **Lambda Version** | `AWS::Lambda::Version` | Versión inmutable de la función | Incluido |
| **Lambda Alias** | `AWS::Lambda::Alias` | Alias apuntando a versión (test/prod) | Incluido |
| **API Gateway** | `AWS::ApiGateway::RestApi` | API REST pública | Gratis (1M requests/mes) |
| **API Stage** | `AWS::ApiGateway::Stage` | Stage de deployment (test/prod) | Incluido |
| **Lambda Execution Role** | `AWS::IAM::Role` | Permisos de Lambda (CloudWatch, X-Ray) | Gratis |
| **API Gateway Role** | `AWS::IAM::Role` | Permisos para invocar Lambda | Gratis |
| **CloudWatch Log Group** | `AWS::Logs::LogGroup` | Logs de Lambda | $0.50/GB almacenado |
| **X-Ray Traces** | Traces distribuidos | Trazabilidad de requests | Gratis (100K traces/mes) |

**💰 Costo Total Estimado**: 
- **Free Tier**: Completamente gratis (1M invocaciones Lambda + 1M requests API Gateway)
- **Post Free Tier**: ~$0.20-$1/mes con uso ligero (100-500 requests/día)

**Desglose de Costos (Post Free Tier):**
- Lambda: $0.20 por 1 millón de invocaciones + $0.0000166667 por GB-segundo
- API Gateway: $3.50 por millón de requests
- CloudWatch Logs: $0.50 por GB almacenado
- X-Ray: $5.00 por millón de traces (después de los primeros 100K)

## 🔄 Flujo de Funcionamiento

### **Escenario Completo: Request a la API**

```
┌─────────┐   POST /log    ┌─────────────┐   Invoke       ┌────────────┐   Execute    ┌──────────────┐
│         │  (HTTP)        │             │  Lambda:test   │            │   Handler    │              │
│ Cliente │ ─────────────▶ │ API Gateway │ ─────────────▶ │   Lambda   │ ───────────▶ │ app.mjs      │
│         │                │  (test)     │                │ Alias:test │              │ lambdaHandler│
└─────────┘                └─────────────┘                └────────────┘              └──────┬───────┘
      ▲                           │                              │                            │
      │                           │                              │                            │
      │    JSON Response          │                              │                            │
      │    200 OK                 │                              │                            ▼
      │                           │                              │                     ┌──────────────┐
      └───────────────────────────┴──────────────────────────────┴─────────────────────│  CloudWatch  │
                                                                                       │  Logs + XRay │
                                                                                       └──────────────┘
```

**Paso a Paso:**

1. **Request** (0ms): Cliente envía `POST https://abc123xyz.execute-api.us-east-1.amazonaws.com/test/log`
2. **API Gateway** (~5-10ms): 
   - Valida el request
   - Asume el IAM role `ApiGatewayInvokeRole`
   - Dispara X-Ray segment
3. **Lambda Invocation** (~10-20ms): API Gateway invoca `eventLogger-test:test` (alias)
4. **Cold Start** (~100-200ms primera vez): Lambda inicializa runtime Node.js 22
5. **Handler Execution** (~1-5ms): 
   - Extrae `functionName` y `functionVersion` del context
   - Crea objeto de respuesta
   - Log a CloudWatch
6. **X-Ray Recording** (~5ms): Lambda registra trace segment en X-Ray
7. **Response** (~10ms): API Gateway retorna JSON al cliente
8. **Total Latency**: 
   - **Cold start**: ~150-250ms
   - **Warm execution**: ~20-50ms

**Latencias Típicas:**
- **Cold Start**: ~100-200ms (primera invocación o después de inactividad)
- **Warm Execution**: ~20-50ms (Lambda ya inicializada)
- **X-Ray Overhead**: ~5-10ms adicionales

## 🚀 Comandos Útiles

### **Instalación Inicial**

```bash
# Verificar que SAM CLI esté instalado
sam --version

# Instalar dependencias de la función Lambda
cd event-logger
npm install
cd ..
```

### **Development & Testing Local**

```bash
# Construir la aplicación (genera .aws-sam/build/)
sam build

# Invocar función localmente con evento de prueba
sam local invoke EventLoggerFunction --event events/event.json

# Iniciar API Gateway local (http://localhost:3000)
sam local start-api

# Probar endpoint local
curl -X POST http://localhost:3000/log

# Ejecutar tests unitarios
cd event-logger
npm test
cd ..
```

### **Validación de Template**

```bash
# Validar sintaxis de template.yaml
sam validate

# Validar con linting estricto
sam validate --lint
```

### **Deployment**

#### **Opción 1: Guided Deployment (primera vez)**

```bash
# Deployment interactivo (guiado)
sam deploy --guided
```

**Preguntas que hará:**
```
Setting default arguments for 'sam deploy'
=========================================
Stack Name [sam-app]: lab-sam-app
AWS Region [us-east-1]: us-east-1
Parameter EnvType [test]: test
#Shows you resources changes to be deployed and require a 'Y' to initiate deploy
Confirm changes before deploy [y/N]: y
#SAM needs permission to be able to create roles to connect to the resources in your template
Allow SAM CLI IAM role creation [Y/n]: Y
Save arguments to samconfig.toml [Y/n]: Y
```

Esto creará un archivo `samconfig.toml` con tu configuración guardada.

---

#### **Opción 2: Subsequent Deployments (usando config guardada)**

```bash
# Deployment rápido usando samconfig.toml
sam build && sam deploy

# Deployment con parámetro específico
sam build && sam deploy --parameter-overrides EnvType=prod

# Deployment sin confirmación (CI/CD)
sam build && sam deploy --no-confirm-changeset
```

---

#### **Opción 3: Deployment Directo (sin guided)**

```bash
# Deployment completo en un comando
sam build && sam deploy \
  --stack-name lab-sam-app \
  --region us-east-1 \
  --parameter-overrides EnvType=test \
  --capabilities CAPABILITY_NAMED_IAM \
  --resolve-s3
```

**Parámetros importantes:**
- `--stack-name`: Nombre del stack CloudFormation
- `--region`: Región AWS donde desplegar
- `--parameter-overrides`: Override de parámetros del template
- `--capabilities CAPABILITY_NAMED_IAM`: Permite crear IAM roles con nombres específicos
- `--resolve-s3`: SAM crea automáticamente un bucket S3 para artefactos

---

### **Monitoreo y Logs**

```bash
# Ver logs de la función en tiempo real
sam logs --stack-name lab-sam-app --name EventLoggerFunction --tail

# Ver logs de los últimos 10 minutos
sam logs --stack-name lab-sam-app --name EventLoggerFunction --start-time '10min ago'

# Filtrar logs por patrón
sam logs --stack-name lab-sam-app --name EventLoggerFunction --filter "ERROR"

# Ver logs en CloudWatch (comando AWS CLI)
aws logs tail /aws/lambda/eventLogger-test --follow
```

---

### **Testing del Sistema Desplegado**

```bash
# Obtener URL de la API desde CloudFormation outputs
aws cloudformation describe-stacks \
  --stack-name lab-sam-app \
  --query 'Stacks[0].Outputs[?OutputKey==`ApiUrl`].OutputValue' \
  --output text

# Probar endpoint desplegado
curl -X POST https://abc123xyz.execute-api.us-east-1.amazonaws.com/test/log

# Probar con verbose para ver headers
curl -X POST -v https://abc123xyz.execute-api.us-east-1.amazonaws.com/test/log

# Probar con body (aunque esta función no lo usa)
curl -X POST \
  https://abc123xyz.execute-api.us-east-1.amazonaws.com/test/log \
  -H "Content-Type: application/json" \
  -d '{"message": "test event"}'
```

**Respuesta esperada:**
```json
{
  "LambdaFunction": "eventLogger-test",
  "LambdaVersion": "test"
}
```

---

### **Cleanup (Eliminar Stack)**

```bash
# Eliminar todos los recursos creados
sam delete

# Eliminar sin confirmación (CI/CD)
sam delete --no-prompts

# Eliminar stack específico
sam delete --stack-name lab-sam-app --region us-east-1
```

> [!WARNING]
> `sam delete` eliminará permanentemente todos los recursos del stack. Los logs de CloudWatch **se conservan** por defecto a menos que se especifique lo contrario.

---

### **Debugging Avanzado**

```bash
# Generar eventos de prueba desde esquemas SAM
sam local generate-event apigateway aws-proxy > events/api-gateway-event.json

# Invocar con debugger (Node.js)
sam local invoke EventLoggerFunction \
  --event events/event.json \
  --debug-port 5858

# Iniciar API local con debugging
sam local start-api --debug-port 5858
```

---

### **CloudWatch Insights Queries**

Para analizar logs estructurados en CloudWatch Insights:

```bash
# Query para contar invocaciones por versión
fields @timestamp, LambdaVersion
| stats count() by LambdaVersion

# Query para analizar latencias
fields @timestamp, @duration
| sort @duration desc
| limit 20

# Query para buscar errores
fields @timestamp, @message
| filter @message like /ERROR/
| sort @timestamp desc
```

## 💡 Ventajas del Proyecto

| Ventaja | Descripción |
|---------|-------------|
| **🚀 Serverless** | Sin servidores que administrar, pago solo por uso real |
| **📈 Escalabilidad Automática** | AWS escala de 0 a 1000s de invocaciones concurrentes automáticamente |
| **🔄 Versionado Robusto** | Lambda aliases permiten rollbacks instantáneos y A/B testing |
| **💰 Bajo Costo** | Free Tier cubre 1M invocaciones Lambda + 1M requests API Gateway |
| **📝 Infrastructure as Code** | Infraestructura reproducible, versionable y auditable con SAM |
| **🔍 Observabilidad** | Logs estructurados JSON + X-Ray tracing end-to-end |
| **🏗️ Desarrollo Local** | SAM CLI permite testing 100% local sin deployments |
| **🔒 Seguridad** | IAM roles con permisos mínimos (least privilege) |
| **⚡ Latencia Baja** | API Gateway + Lambda en la misma región (~20-50ms warm) |
| **🌍 Multi-región** | Fácil replicación en diferentes regiones con mismo template |
| **🎯 Multi-ambiente** | Parametrización permite test/prod con un solo template |

## 📚 Casos de Uso

Este patrón arquitectónico (API Gateway + Lambda) es ideal para:

| Caso de Uso | Descripción | Ejemplo |
|-------------|-------------|---------|
| 🔗 **Webhooks** | Recibir notificaciones de servicios externos | GitHub webhooks, Stripe payments |
| 📊 **APIs RESTful** | Construir APIs sin gestionar servidores | CRUD para aplicaciones móviles/web |
| 🔄 **Event Logging** | Registrar eventos de aplicaciones | Analytics, audit trails |
| 🔐 **Autenticación** | Endpoints de login/logout | JWT token generation |
| 📧 **Notificaciones** | Enviar emails/SMS bajo demanda | Contact forms, alerts |
| 🎨 **Content Transformation** | Convertir/procesar datos en tiempo real | JSON a XML, resize images on-demand |
| 📝 **Form Handlers** | Procesar formularios web | Newsletter signup, feedback forms |
| 🔍 **Search APIs** | Exponer búsquedas sin backend tradicional | Elasticsearch wrapper, DynamoDB queries |
| 🤖 **Chatbot Backends** | Responder a mensajes de usuarios | Slack bots, Telegram bots |
| 📦 **Microservicios** | Arquitectura de microservicios event-driven | Order service, user service, payment service |

## 🛠️ Próximos Pasos Sugeridos

### **Nivel Básico**
- [ ] Agregar validación de request body con JSON Schema
- [ ] Implementar CORS para permitir requests desde navegadores
- [ ] Agregar más endpoints (GET `/status`, GET `/version`)
- [ ] Implementar variables de entorno en Lambda
- [ ] Agregar CloudFormation Outputs adicionales (ARNs, IDs)

### **Nivel Intermedio**
- [ ] **Autenticación**: Agregar API Key o Lambda Authorizer (JWT)
- [ ] **DynamoDB**: Persistir logs en DynamoDB en lugar de solo CloudWatch
- [ ] **Validación de Input**: Implementar modelos de request/response en API Gateway
- [ ] **Error Handling**: Custom error responses (400, 401, 403, 404)
- [ ] **CloudWatch Alarms**: Alertas para errores 5xx y latencias altas
- [ ] **Throttling**: Rate limiting en API Gateway (10 req/s)
- [ ] **Caching**: Habilitar API Gateway caching para respuestas frecuentes
- [ ] **Custom Domain**: Asociar dominio personalizado (api.midominio.com)

### **Nivel Avanzado**
- [ ] **CI/CD Pipeline**: GitHub Actions o CodePipeline para deploy automático
- [ ] **Multi-Stage Deployment**: Test → Staging → Production con aprobaciones
- [ ] **Canary Deployments**: 
  ```yaml
  AutoPublishAlias: prod
  DeploymentPreference:
    Type: Canary10Percent5Minutes
  ```
- [ ] **Lambda Layers**: Compartir dependencias comunes entre múltiples funciones
- [ ] **VPC Integration**: Conectar Lambda a RDS o recursos privados
- [ ] **SQS Dead Letter Queue**: Reintentos automáticos para invocaciones fallidas
- [ ] **EventBridge Integration**: Trigger Lambda desde eventos multi-source
- [ ] **WAF (Web Application Firewall)**: Proteger API contra ataques comunes
- [ ] **Cost Optimization**: 
  - Migrar a ARM64 (Graviton2) para ~20% reducción de costos
  - Ajustar timeout y memoria según análisis de CloudWatch
  - Implementar Reserved Concurrency para funciones críticas
- [ ] **Security**:
  - Secretos con AWS Secrets Manager (no hardcodear)
  - Encryption at rest para logs (KMS)
  - IAM condition keys para fine-grained access
- [ ] **Testing Avanzado**:
  - Tests de integración con LocalStack
  - Load testing con Artillery o k6
  - Contract testing para APIs
- [ ] **Observabilidad Avanzada**:
  - Custom CloudWatch Metrics
  - X-Ray annotations y metadata personalizados
  - Dashboards de CloudWatch para métricas clave

## 🎨 Extensión: Múltiples Endpoints

**Template Modificado:**
```yaml
paths:
  /log:
    post:
      x-amazon-apigateway-integration:
        # ... configuración existente
        
  /status:
    get:
      x-amazon-apigateway-integration:
        httpMethod: "POST"
        type: "aws_proxy"
        credentials: !GetAtt ApiGatewayInvokeRole.Arn
        uri:
          Fn::Sub: "arn:aws:apigateway:${AWS::Region}:lambda:path/2015-03-31/functions/${StatusFunction.Arn}:${EnvType}/invocations"
```

**Nuevo Lambda Handler:**
```javascript
// status-function/app.mjs
export const lambdaHandler = async (event, context) => {
  return {
    statusCode: 200,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      status: "healthy",
      version: "v2.0",
      timestamp: new Date().toISOString(),
    }),
  };
};
```

**Resultado:**
- `POST /log` → `EventLoggerFunction`
- `GET /status` → `StatusFunction`

## 📖 Recursos Adicionales

### **Documentación Oficial**
- [AWS SAM Documentation](https://docs.aws.amazon.com/serverless-application-model/)
- [AWS SAM CLI Reference](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/serverless-sam-cli-command-reference.html)
- [AWS Lambda Developer Guide](https://docs.aws.amazon.com/lambda/)
- [Amazon API Gateway Documentation](https://docs.aws.amazon.com/apigateway/)
- [AWS X-Ray Documentation](https://docs.aws.amazon.com/xray/)

### **Tutoriales**
- [AWS SAM Workshop](https://catalog.workshops.aws/complete-aws-sam/)
- [Serverless Patterns Collection](https://serverlessland.com/patterns)
- [AWS Lambda Power Tuning](https://github.com/alexcasalboni/aws-lambda-power-tuning)

### **Best Practices**
- [SAM Best Practices](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/serverless-sam-template-best-practices.html)
- [Lambda Best Practices](https://docs.aws.amazon.com/lambda/latest/dg/best-practices.html)
- [API Gateway Best Practices](https://docs.aws.amazon.com/apigateway/latest/developerguide/best-practices.html)
- [Well-Architected Serverless Lens](https://docs.aws.amazon.com/wellarchitected/latest/serverless-applications-lens/welcome.html)

### **Herramientas Útiles**
- [AWS SAM CLI](https://github.com/aws/aws-sam-cli)
- [LocalStack](https://localstack.cloud/) - Emulador AWS local completo
- [SAM Policy Templates](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/serverless-policy-templates.html)
- [Serverless Framework](https://www.serverless.com/) - Alternativa a SAM

## 🔧 Configuración del Proyecto

### **template.yaml (Completo)**

Ver archivo en el repositorio para la configuración completa de infraestructura.

**Secciones principales:**
1. **Parameters**: Variables de entrada (EnvType)
2. **Globals**: Configuración compartida entre recursos
3. **Resources**: Lambda, API Gateway, IAM Roles
4. **Outputs**: Valores exportados (API URL, Lambda ARN)

---

### **package.json (Lambda)**

```json
{
  "name": "hello_world",
  "version": "1.0.0",
  "description": "hello world sample for NodeJS",
  "main": "app.js",
  "dependencies": {
    "axios": ">=1.6.0"
  },
  "scripts": {
    "test": "mocha tests/unit/"
  },
  "devDependencies": {
    "chai": "^4.3.6",
    "mocha": "^10.2.0"
  }
}
```

**Características clave:**
- `axios` - Cliente HTTP (no usado actualmente, pero disponible)
- `mocha` + `chai` - Framework de testing unitario
- `scripts.test` - Comando para ejecutar tests

> [!NOTE]
> **ESM en Lambda**: SAM detecta automáticamente que `app.mjs` usa ES Modules. No necesitas agregar `"type": "module"` en `package.json` cuando usas extensión `.mjs`.

---

### **samconfig.toml (Generado después de `sam deploy --guided`)**

```toml
version = 0.1
[default]
[default.deploy]
[default.deploy.parameters]
stack_name = "lab-sam-app"
s3_prefix = "lab-sam-app"
region = "us-east-1"
confirm_changeset = true
capabilities = "CAPABILITY_NAMED_IAM"
parameter_overrides = "EnvType=\"test\""
image_repositories = []
```

**Propósito**: Almacena configuración de deployment para futuros `sam deploy` sin necesidad de pasar parámetros.

## ⚠️ Troubleshooting

### **Problema: `sam build` falla con "Runtime Not Supported"**

**Causa**: Node.js 22.x es muy reciente, algunas versiones de SAM CLI no lo soportan.

**Solución**:
```bash
# Actualizar SAM CLI a la última versión
pip install --upgrade aws-sam-cli

# O con Homebrew (Mac)
brew upgrade aws-sam-cli

# Verificar versión (debe ser >= 1.100.0)
sam --version
```

---

### **Problema: "Unable to upload artifact ... Access Denied"**

**Causa**: SAM necesita crear/acceder a un bucket S3 para artefactos de deployment.

**Solución**:
```bash
# Usar --guided para configurar bucket automáticamente
sam deploy --guided

# O especificar bucket manualmente
sam deploy --s3-bucket mi-bucket-sam-artifacts --s3-prefix lab-sam-app
```

---

### **Problema: API Gateway retorna 500 Internal Server Error**

**Causa**: Lambda no tiene permisos para ser invocada por API Gateway, o la integración está mal configurada.

**Verificación**:
```bash
# Ver logs de Lambda
sam logs --stack-name lab-sam-app --name EventLoggerFunction --tail

# Test directo de Lambda (bypass API Gateway)
sam local invoke EventLoggerFunction --event events/event.json
```

**Solución**:
- Verificar que `ApiGatewayInvokeRole` tenga permisos correctos
- Revisar que la URI en API Gateway incluya el alias (`:${EnvType}`)

---

### **Problema: "Cannot find module 'axios'" en Lambda**

**Causa**: Dependencias no instaladas o no incluidas en el deployment package.

**Solución**:
```bash
cd event-logger
npm install
cd ..
sam build
sam deploy
```

> [!TIP]
> **SAM Build**: `sam build` automáticamente ejecuta `npm install` en cada función y empaqueta `node_modules/` en el deployment package.

---

### **Problema: Cold starts muy lentos (>500ms)**

**Causa**: Node.js 22.x tiene overhead de inicialización mayor que versiones anteriores.

**Soluciones**:
1. **Aumentar memoria** (más RAM = más CPU):
   ```yaml
   MemorySize: 256  # De 128 a 256
   ```

2. **Provisioned Concurrency**:
   ```yaml
   ProvisionedConcurrencyConfig:
     ProvisionedConcurrentExecutions: 2
   ```

3. **Reducir dependencias**:
   ```bash
   # Eliminar axios si no se usa
   npm uninstall axios
   ```

---

### **Problema: X-Ray traces no aparecen**

**Causa**: Permisos insuficientes o tracing no habilitado correctamente.

**Verificación**:
```yaml
# En Globals
Function:
  Tracing: Active  # ✅ Debe ser 'Active', no 'PassThrough'
  
Api:
  TracingEnabled: true  # ✅ Debe estar presente
```

**Solución**:
- Verificar que Lambda Execution Role tenga `AWSXRayDaemonWriteAccess`
- SAM crea este permiso automáticamente, pero verifica en IAM console
- Esperar 1-2 minutos después de invocaciones para que traces aparezcan

---

### **Problema: `sam local start-api` falla con "Docker not found"**

**Causa**: SAM CLI requiere Docker para emular Lambda localmente.

**Solución**:
```bash
# Instalar Docker Desktop
# Windows: https://docs.docker.com/desktop/install/windows-install/
# Mac: https://docs.docker.com/desktop/install/mac-install/

# Verificar que Docker esté corriendo
docker --version
docker ps

# Reiniciar SAM local
sam local start-api
```

---

## 📊 Comparación: SAM vs CDK vs Serverless Framework

| Característica | AWS SAM | AWS CDK | Serverless Framework |
|----------------|---------|---------|----------------------|
| **Lenguaje** | YAML/JSON | TypeScript/Python/Java | YAML |
| **Curva de aprendizaje** | 🟢 Baja | 🟡 Media | 🟢 Baja |
| **Desarrollo local** | ✅ Excelente | ⚠️ Limitado | ✅ Bueno |
| **Multi-cloud** | ❌ Solo AWS | ❌ Solo AWS | ✅ AWS/Azure/GCP |
| **Comunidad** | 🟡 Media | 🟢 Grande | 🟢 Grande |
| **Abstracción** | 🟡 Media | 🟢 Alta | 🟡 Media |
| **Debugging local** | ✅ Nativo | ⚠️ Requiere setup | ✅ Plugin |
| **IDE Support** | 🟡 Limitado | ✅ Excelente (VSCode) | 🟡 Limitado |
| **Best for** | APIs simples | Infra compleja | Multi-cloud |

**Recomendación**:
- **SAM**: APIs y funciones Lambda simples a medianas (este proyecto)
- **CDK**: Aplicaciones con múltiples servicios AWS y lógica compleja
- **Serverless Framework**: Necesidad de portabilidad multi-cloud

---

## 🤝 Contribuciones

Este es un proyecto educativo. Si encuentras mejoras o tienes sugerencias:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/MejoraXYZ`)
3. Commit tus cambios (`git commit -m 'Add: nueva funcionalidad XYZ'`)
4. Push a la rama (`git push origin feature/MejoraXYZ`)
5. Abre un Pull Request

---

## 📝 Licencia

Este proyecto es de código abierto y está disponible para fines educativos.

---

## 📮 Contacto

¿Preguntas o sugerencias? Abre un issue en el repositorio.

---

**⭐ Si este proyecto te resultó útil, considera darle una estrella en GitHub!**

---

## 📚 Apéndice: Comandos Rápidos de Referencia

```bash
# 🔨 Build & Deploy
sam build                              # Construir aplicación
sam deploy                             # Desplegar (requiere samconfig.toml)
sam deploy --guided                    # Deployment guiado (primera vez)

# 🧪 Testing Local
sam local invoke -e events/event.json  # Invocar función localmente
sam local start-api                    # Iniciar API local (http://localhost:3000)
sam local start-lambda                 # Iniciar endpoint Lambda local

# 📊 Logs & Monitoring
sam logs --tail                        # Ver logs en tiempo real
sam logs --name EventLoggerFunction    # Logs de función específica

# ✅ Validation
sam validate                           # Validar template.yaml
sam validate --lint                    # Validar con linting

# 🗑️ Cleanup
sam delete                             # Eliminar stack y recursos

# 🔍 Info
sam list resources                     # Listar recursos del stack
sam list endpoints                     # Listar endpoints de API Gateway
```

---

## 🎯 Checklist de Deployment

Antes de hacer `sam deploy --guided` por primera vez:

- [ ] AWS CLI configurado (`aws configure`)
- [ ] SAM CLI instalado (`sam --version`)
- [ ] Dependencias instaladas (`cd event-logger && npm install`)
- [ ] Template validado (`sam validate`)
- [ ] Tests pasando (`npm test`)
- [ ] Docker corriendo (para `sam local`)
- [ ] Región AWS decidida (ej: `us-east-1`)
- [ ] Ambiente decidido (`test` o `prod`)

Después del deployment:

- [ ] API URL copiada desde Outputs
- [ ] Endpoint probado con `curl`
- [ ] Logs verificados en CloudWatch
- [ ] X-Ray traces visibles
- [ ] Costo estimado revisado en Cost Explorer

---


