using JobMatchingSystem.API.Data;
using JobMatchingSystem.API.Enums;
using Microsoft.EntityFrameworkCore;

namespace JobMatchingSystem.API.Services.BackgroundServices
{
    public class JobStatusScheduler : BackgroundService
    {
        private readonly IServiceScopeFactory _scopeFactory;

        public JobStatusScheduler(IServiceScopeFactory scopeFactory)
        {
            _scopeFactory = scopeFactory;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            while (!stoppingToken.IsCancellationRequested)
            {
                using (var scope = _scopeFactory.CreateScope())
                {
                    var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
                    var now = DateTime.UtcNow;

                    // -----------------------
                    // 1. Auto OPEN Job
                    // -----------------------
                    var jobsToOpen = await context.Jobs
                        .Where(j => j.Status == JobStatus.Moderated &&
                                    j.OpenedAt.HasValue &&
                                    j.OpenedAt.Value <= now)
                        .ToListAsync(stoppingToken);

                    foreach (var job in jobsToOpen)
                    {
                        job.Status = JobStatus.Opened;
                    }


                    // -----------------------
                    // 2. Auto CLOSE Job
                    // -----------------------
                    var jobsToClose = await context.Jobs
                        .Where(j => j.Status == JobStatus.Opened &&
                                    j.ExpiredAt.HasValue &&
                                    j.ExpiredAt.Value <= now)
                        .ToListAsync(stoppingToken);

                    foreach (var job in jobsToClose)
                    {
                        job.Status = JobStatus.Closed;
                    }

                    if (jobsToOpen.Count > 0 || jobsToClose.Count > 0)
                    {
                        await context.SaveChangesAsync(stoppingToken);
                    }
                }

                // chạy lại sau mỗi 5 phút (hoặc tùy chỉnh)
                await Task.Delay(TimeSpan.FromMinutes(360), stoppingToken);
            }
        }
    }

}
