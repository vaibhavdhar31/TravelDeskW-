# Build stage
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy project files
COPY ["TravelDesk_Api/TravelDesk_Api.csproj", "TravelDesk_Api/"]
RUN dotnet restore "TravelDesk_Api/TravelDesk_Api.csproj"

# Copy source code
COPY . .
WORKDIR "/src/TravelDesk_Api"
RUN dotnet build "TravelDesk_Api.csproj" -c Release -o /app/build

# Publish stage
FROM build AS publish
RUN dotnet publish "TravelDesk_Api.csproj" -c Release -o /app/publish

# Runtime stage
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app
COPY --from=publish /app/publish .

EXPOSE 80
ENTRYPOINT ["dotnet", "TravelDesk_Api.dll"]
