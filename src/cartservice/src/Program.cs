// Copyright The OpenTelemetry Authors
// SPDX-License-Identifier: Apache-2.0
using System;
using System.Collections.Generic;

using cartservice.cartstore;
using cartservice.services;

using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Diagnostics.HealthChecks;
using Microsoft.Extensions.Logging;
using OpenTelemetry.Instrumentation.StackExchangeRedis;
using OpenTelemetry.Logs;
using OpenTelemetry.Metrics;
using OpenTelemetry.ResourceDetectors.Container;
using OpenTelemetry.ResourceDetectors.Host;
using OpenTelemetry.Resources;
using OpenTelemetry.Trace;
using Serilog;
using Serilog.Formatting.Json;
using Serilog.Sinks.OpenTelemetry;
using Serilog.Templates;
using OpenFeature;
using OpenFeature.Contrib.Providers.Flagd;
using OpenFeature.Contrib.Hooks.Otel;


// Alex: the next step would be to change the level "information" to info.  ChatGPT suggests
// Using Filters to create custom expression templates for different levels:
// using Serilog;
//using Serilog.Core;
//using Serilog.Events;
//using Serilog.Expressions;
//
//namespace YourNamespace
//{
//    class Program
//    {
//        static void Main(string[] args)
//        {
//            var levelSwitch = new LoggingLevelSwitch();
//            levelSwitch.MinimumLevel = LogEventLevel.Information; // Set minimum level to Information
//
//            Log.Logger = new LoggerConfiguration()
//                .MinimumLevel.ControlledBy(levelSwitch) // Set the minimum logging level
//                .WriteTo.Console(new ExpressionTemplate("{Timestamp:yyyy-MM-dd HH:mm:ss} [{BoogieLevel}] {Message:lj}{NewLine}{Exception}")
//                    .Enrich.FromLogContext() // Enrich with default properties
//                    .Enrich.WithProperty("InfoLevel", evt => evt.Level == LogEventLevel.Information ? "info" : evt.Level.ToString())) // Enrich with custom property based on log level
//                .CreateLogger();
//
//            Log.Information("This is an info message.");
//            Log.Error("This is an error message.");
//
//            Log.CloseAndFlush();
//        }
//    }
//}

string template = "{ {Timestamp: @t, msg: @m, severity: @l, @x, ..@p} }\n";
//string expressionTemplate = "{\"Timestamp\":\"{Timestamp:yyyy-MM-dd HH:mm:ss}\",\"severity\":\"{Level}\"}\n";

var builder = WebApplication.CreateBuilder(args);
string valkeyAddress = builder.Configuration["VALKEY_ADDR"];
if (string.IsNullOrEmpty(valkeyAddress))
{
    Console.WriteLine("VALKEY_ADDR environment variable is required.");
    Environment.Exit(1);
}
if (string.IsNullOrEmpty(collectorAddress))
{
    Console.WriteLine("OTEL_COLLECTOR_NAME environment variable is required.");
    Environment.Exit(1);
}

//string outputTemplate = "{Timestamp:yyyy-MM-dd HH:mm:ss.fff zzz} [{Level:u3}] trace_id=\"{trace_id}\" span_id=\"{span_id}\" service.name=\"{service_name}\" service.version=\"{service_version}\" deployment.environment=\"{deployment_environment}\"{NewLine}{Message:lj}{NewLine}{Exception}";

Log.Logger = new LoggerConfiguration()
    .Enrich.FromLogContext()
    .WriteTo.OpenTelemetry(options =>
	    {
        options.Endpoint = $"http://{collectorAddress}:4317";
	options.ResourceAttributes = new Dictionary<string, object>
            {
                ["service.name"] = serviceName
            };
    })
    .WriteTo.Console(new ExpressionTemplate(template))
    .CreateLogger();

    //.WriteTo.Console(new JsonFormatter())
    //
// Configure Serilog to log to stdout
//Log.Logger = new LoggerConfiguration()
//   .Enrich.FromLogContext()
//   .WriteTo.Console(new Serilog.Formatting.Json.JsonFormatter())
//   .CreateLogger();
//
    //.WriteTo.Console(new Serilog.Formatting.Json.JsonFormatter())
builder.Logging.ClearProviders(); // Clear default logging providers
builder.Logging.AddSerilog(Log.Logger); // Add Serilog
	
//builder.Logging
//   .AddOpenTelemetry(options => options.AddOtlpExporter())
//   .AddConsole();

builder.Services.AddSingleton<ICartStore>(x=>
{
    var store = new ValkeyCartStore(x.GetRequiredService<ILogger<ValkeyCartStore>>(), valkeyAddress);
    store.Initialize();
    return store;
});

builder.Services.AddSingleton<IFeatureClient>(x => {
    var flagdProvider = new FlagdProvider();
    Api.Instance.SetProviderAsync(flagdProvider).GetAwaiter().GetResult();
    var client = Api.Instance.GetClient();
    return client;
});


builder.Services.AddSingleton(x =>
    new CartService(
        x.GetRequiredService<ICartStore>(),
        new ValkeyCartStore(x.GetRequiredService<ILogger<ValkeyCartStore>>(), "badhost:1234"),
        x.GetRequiredService<IFeatureClient>()
));


Action<ResourceBuilder> appResourceBuilder =
    resource => resource
        .AddContainerDetector()
        .AddHostDetector();

builder.Services.AddOpenTelemetry()
    .ConfigureResource(appResourceBuilder)
    .WithTracing(tracerBuilder => tracerBuilder
        .AddRedisInstrumentation(
            options => options.SetVerboseDatabaseStatements = true)
        .AddAspNetCoreInstrumentation()
        .AddGrpcClientInstrumentation()
        .AddHttpClientInstrumentation()
        .AddOtlpExporter())
    .WithMetrics(meterBuilder => meterBuilder
        .AddProcessInstrumentation()
        .AddRuntimeInstrumentation()
        .AddAspNetCoreInstrumentation()
        .AddOtlpExporter());
OpenFeature.Api.Instance.AddHooks(new TracingHook());
builder.Services.AddGrpc();
builder.Services.AddGrpcHealthChecks()
    .AddCheck("Sample", () => HealthCheckResult.Healthy());

var app = builder.Build();

var ValkeyCartStore = (ValkeyCartStore) app.Services.GetRequiredService<ICartStore>();
app.Services.GetRequiredService<StackExchangeRedisInstrumentation>().AddConnection(ValkeyCartStore.GetConnection());

app.MapGrpcService<CartService>();
app.MapGrpcHealthChecksService();

app.MapGet("/", async context =>
{
    await context.Response.WriteAsync("Communication with gRPC endpoints must be made through a gRPC client. To learn how to create a client, visit: https://go.microsoft.com/fwlink/?linkid=2086909");
});

app.Run();
