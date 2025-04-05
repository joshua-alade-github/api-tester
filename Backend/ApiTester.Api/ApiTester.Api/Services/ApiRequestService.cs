using ApiTester.Api.Models;
using System.Diagnostics;
using System.Text;
using System.Text.Json;

namespace ApiTester.Api.Services
{
    public class ApiRequestService
    {
        private readonly IHttpClientFactory _httpClientFactory;
        private readonly ILogger<ApiRequestService> _logger;

        public ApiRequestService(IHttpClientFactory httpClientFactory, ILogger<ApiRequestService> logger)
        {
            _httpClientFactory = httpClientFactory;
            _logger = logger;
        }

        public async Task<ApiResponseModel> SendRequestAsync(ApiRequestModel model)
        {
            var response = new ApiResponseModel();
            
            try
            {
                var stopwatch = new Stopwatch();
                stopwatch.Start();

                var client = _httpClientFactory.CreateClient();
                client.Timeout = TimeSpan.FromSeconds(model.TimeoutSeconds);

                var request = new HttpRequestMessage(new HttpMethod(model.Method), model.Url);

                if (model.Headers != null)
                {
                    foreach (var header in model.Headers.Where(h => !string.IsNullOrEmpty(h.Key)))
                    {
                        request.Headers.TryAddWithoutValidation(header.Key, header.Value);
                    }
                }

                if (!string.IsNullOrEmpty(model.AuthType))
                {
                    switch (model.AuthType)
                    {
                        case "Basic":
                            if (!string.IsNullOrEmpty(model.Username) && !string.IsNullOrEmpty(model.Password))
                            {
                                var authValue = Convert.ToBase64String(Encoding.UTF8.GetBytes($"{model.Username}:{model.Password}"));
                                request.Headers.Add("Authorization", $"Basic {authValue}");
                            }
                            break;
                        case "Bearer":
                            if (!string.IsNullOrEmpty(model.BearerToken))
                            {
                                request.Headers.Add("Authorization", $"Bearer {model.BearerToken}");
                            }
                            break;
                        case "ApiKey":
                            if (!string.IsNullOrEmpty(model.ApiKeyName) && !string.IsNullOrEmpty(model.ApiKeyValue))
                            {
                                request.Headers.Add(model.ApiKeyName, model.ApiKeyValue);
                            }
                            break;
                    }
                }

                if ((model.Method == "POST" || model.Method == "PUT" || model.Method == "PATCH") && 
                    !string.IsNullOrEmpty(model.RequestBody))
                {
                    request.Content = new StringContent(model.RequestBody, Encoding.UTF8, model.ContentType ?? "application/json");
                }

                var httpResponse = await client.SendAsync(request);
                
                stopwatch.Stop();
                response.ResponseTimeMs = stopwatch.ElapsedMilliseconds;

                response.StatusCode = (int)httpResponse.StatusCode;
                response.Headers = httpResponse.Headers.ToDictionary(h => h.Key, h => string.Join(", ", h.Value));
                response.ContentType = httpResponse.Content.Headers.ContentType?.ToString();

                var content = await httpResponse.Content.ReadAsStringAsync();
                response.Body = content;

                if (response.ContentType?.Contains("application/json") == true)
                {
                    try
                    {
                        var jsonDocument = JsonDocument.Parse(content);
                        var jsonOptions = new JsonSerializerOptions { WriteIndented = true };
                        response.FormattedBody = JsonSerializer.Serialize(jsonDocument.RootElement, jsonOptions);
                        response.IsValidJson = true;
                    }
                    catch
                    {
                        response.FormattedBody = content;
                        response.IsValidJson = false;
                    }
                }
                else
                {
                    response.FormattedBody = content;
                    response.IsValidJson = false;
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error sending API request to {Url}", model.Url);
                response.Error = ex.Message;
            }

            return response;
        }
    }
}