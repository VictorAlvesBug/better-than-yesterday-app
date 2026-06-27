# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the .NET API and MongoDB (see `Bug.BetterThanYesterday/README.md`)

   ```bash
   dotnet run --project ../Bug.BetterThanYesterday/Bug.BetterThanYesterday.API/Bug.BetterThanYesterday.API.csproj --urls "http://0.0.0.0:5018"
   ```

3. Start the app

   ```bash
   npx expo start
   ```

4. Build to development environment

   ```bash
   eas build --profile development --platform android
   ```

## API configuration

The app connects to `http://<dev-host>:5018/api` by default. Override with:

```
EXPO_PUBLIC_API_URL=http://localhost:5018/api
```

Check-in photos are uploaded via the backend presigned URL endpoint (`POST /api/Uploads/PresignedUrl`). Configure AWS credentials on the API (User Secrets or `appsettings.Development.json`).
