# Better Than Yesterday

App React Native (Expo) para acompanhar hábitos e metas. A API é o projeto .NET 8 em `Bug.BetterThanYesterday`.

## Pré-requisitos

- Node.js e npm
- .NET 8 SDK
- Cluster MongoDB Atlas (connection string)
- Credenciais AWS com acesso ao bucket S3 das fotos

## Variáveis de ambiente da API

A API lê MongoDB e AWS só de variáveis de ambiente. Defina-as no PowerShell, na mesma sessão em que a API vai subir. Se você gravar as variáveis nas configurações de usuário do Windows, abra um terminal novo antes de iniciar a API.

```powershell
$env:MONGODB_CONNECTIONSTRING = "mongodb+srv://USUARIO:SENHA@CLUSTER/..."
$env:AWS_BTY_ACCESS_KEY = "sua-access-key"
$env:AWS_BTY_SECRET_KEY = "sua-secret-key"
$env:AWS_BTY_S3_BUCKET = "better-than-yesterday"
```

Região e nomes dos bancos já estão em `Bug.BetterThanYesterday.API/appsettings.Development.json`:

- `AwsConfig.Region`: `sa-east-1`
- `DatabaseConfig.DatabaseName`: `better-than-yesterday`
- `DatabaseConfig.TestDatabaseName`: `better-than-yesterday-test`

Não commite connection string nem chaves.

## Subir a API

Na pasta deste app:

```powershell
dotnet run --project ..\Bug.BetterThanYesterday\Bug.BetterThanYesterday.API\Bug.BetterThanYesterday.API.csproj --urls "http://0.0.0.0:5018"
```

Swagger: `http://localhost:5018/swagger`

## Variáveis de ambiente do app

Opcionais. Sem `EXPO_PUBLIC_API_URL`, o app usa `http://<host-do-expo>:5018/api` (ou `http://localhost:5018/api` se o host do Expo não estiver disponível).

Crie um `.env.local` nesta pasta, ou exporte no terminal:

```
EXPO_PUBLIC_API_URL=http://localhost:5018/api
EXPO_PUBLIC_API_DEBUG=true
```

`EXPO_PUBLIC_API_DEBUG=true` só imprime a URL base da API no console.

Fotos de check-in sobem pelo endpoint `POST /api/Uploads/PresignedUrl`. As credenciais AWS ficam na API, não no app.

## Subir o app

```powershell
npm install
npx expo start
```

## Build de desenvolvimento

```powershell
eas build --profile development --platform android
```
