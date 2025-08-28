FROM mcr.microsoft.com/dotnet/sdk:7.0 AS build
WORKDIR /src

# Copy solution and project files
COPY ["ApiTester.Api.sln", "./"]
COPY ["ApiTester.Api/ApiTester.Api.csproj", "ApiTester.Api/"]

# Restore dependencies
RUN dotnet restore

# Copy everything else
COPY . .

# Build and publish
RUN dotnet publish "ApiTester.Api/ApiTester.Api.csproj" -c Release -o /app/out

# Build runtime image
FROM mcr.microsoft.com/dotnet/aspnet:7.0
WORKDIR /app
COPY --from=build /app/out .

# Use PORT environment variable from Render
ENV ASPNETCORE_URLS=http://+:${PORT:-80}
EXPOSE 80

ENTRYPOINT ["dotnet", "ApiTester.Api.dll"]