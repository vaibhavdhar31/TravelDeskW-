using System.Net;
using System.Text.Json;
using TravelDesk_Api.Services;

namespace TravelDesk_Api.Middleware
{
    public class JwtMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly IJwtService _jwtService;

        public JwtMiddleware(RequestDelegate next, IJwtService jwtService)
        {
            _next = next;
            _jwtService = jwtService;
        }

        public async Task Invoke(HttpContext context)
        {
            var token = context.Request.Headers["Authorization"].FirstOrDefault()?.Split(" ").Last();
            
            if (token != null)
            {
                var principal = _jwtService.ValidateToken(token);
                if (principal != null)
                {
                    context.User = principal;
                }
            }

            try
            {
                await _next(context);
            }
            catch (UnauthorizedAccessException)
            {
                await HandleUnauthorizedAsync(context);
            }
        }

        private static async Task HandleUnauthorizedAsync(HttpContext context)
        {
            context.Response.StatusCode = (int)HttpStatusCode.Unauthorized;
            context.Response.ContentType = "application/json";

            var response = new
            {
                message = "Invalid or expired token",
                statusCode = 401
            };

            var jsonResponse = JsonSerializer.Serialize(response);
            await context.Response.WriteAsync(jsonResponse);
        }
    }
}
