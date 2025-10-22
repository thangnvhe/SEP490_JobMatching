﻿using JobMatchingSystem.API.Configuration;
using JobMatchingSystem.API.Data.SeedData;
using JobMatchingSystem.API.Exceptions;

var builder = WebApplication.CreateBuilder(args);
// Đăng ký các dịch vụ IExceptionHandler
builder.Services.AddExceptionHandler<ValidationResponseExceptionHandler>(); // Đăng ký Validation Handler trước
builder.Services.AddExceptionHandler<GlobalResponseExceptionHandler>();      // Đăng ký Global Handler sau
// Thêm dịch vụ hỗ trợ IExceptionHandler
builder.Services.AddProblemDetails();


// Add services to the container.
builder.Services.AddControllers();
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.ConfigureIdentity(builder.Configuration);

var app = builder.Build();
await app.AutoMigration();
await app.SeedAdminUserAsync();
await app.SeedAllData();
// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseAuthorization();


app.MapControllers();

app.Run();
  