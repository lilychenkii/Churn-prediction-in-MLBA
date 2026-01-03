using Microsoft.EntityFrameworkCore;
using SipSweet.Data;
using MySql.Data.MySqlClient;
using Microsoft.Extensions.FileProviders;

var builder = WebApplication.CreateBuilder(args);

// Cấu hình dịch vụ
builder.Services.AddControllersWithViews();

// Thêm hỗ trợ CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

var connectionString = builder.Configuration.GetConnectionString("MySqlConnection");
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseMySql(connectionString, ServerVersion.AutoDetect(connectionString)));

var app = builder.Build();

// Kiểm tra môi trường
if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Home/Error");
    app.UseHsts();
}

// DISABLE HTTPS redirect trong development để serve static files dễ dàng hơn
// app.UseHttpsRedirection();

// ✅ Configure static files với logging
var staticFileOptions = new StaticFileOptions
{
    OnPrepareResponse = ctx =>
    {
        Console.WriteLine($"Static file requested: {ctx.File.Name}");
    }
};

app.UseStaticFiles(staticFileOptions); // Serve files từ wwwroot/

app.UseStaticFiles(new StaticFileOptions
{
    FileProvider = new PhysicalFileProvider(
        Path.Combine(Directory.GetCurrentDirectory(), "..", "fod-del")),
    RequestPath = "/fod-del"
});
var menuPath = Path.Combine(Directory.GetCurrentDirectory(), "..", "fod-del", "menu.html");
app.MapGet("/menu.html", async context =>
{
    await context.Response.SendFileAsync(menuPath);
});

app.UseRouting();

// Sử dụng CORS
app.UseCors("AllowAll");

app.UseAuthorization();

// Kiểm tra kết nối MySQL
try
{
    using (var connection = new MySqlConnection(connectionString))
    {
        connection.Open();
        Console.WriteLine("Kết nối MySQL thành công!");
    }
}
catch (Exception ex)
{
    Console.WriteLine($"Lỗi kết nối MySQL: {ex.Message}");
}

// Cấu hình route
app.MapControllerRoute(
    name: "default",
    pattern: "{controller=Home}/{action=Index}/{id?}");

app.Run();