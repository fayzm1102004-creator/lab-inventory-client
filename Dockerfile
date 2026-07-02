# Use the official .NET 10 SDK image to build and publish the app
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

# Copy csproj and restore as distinct layers
COPY ["LabInventory.API.csproj", "./"]
RUN dotnet restore "LabInventory.API.csproj"

# Copy everything else and build
COPY . .
RUN dotnet publish "LabInventory.API.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Build runtime image
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS final
WORKDIR /app
COPY --from=build /app/publish .

# Railway provides the PORT environment variable.
# We set ASPNETCORE_HTTP_PORTS to the PORT environment variable if it's available, otherwise fallback to 8080.
# Alternatively, we can start the app to listen on the provided PORT.
ENTRYPOINT ["sh", "-c", "dotnet LabInventory.API.dll --urls http://0.0.0.0:${PORT:-8080}"]
